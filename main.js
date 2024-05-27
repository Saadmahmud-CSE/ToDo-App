import "./style.css";

const baseUrl = "https://todo-crudl.deno.dev";
const $ = document.querySelector.bind(document);

const userIdInput = $("#user-id");
const userIdBtn = $("#user-id-btn");
const inputTodo = $("#todo-title");
const btnTodo = $("#todo-btn");

const errorContainer = $('#error');
const successCon = $('#after-button');
const toDoContainer = $("#todo");
const inProgressContainer = $("#inprogress");
const completedContainer = $("#completed");

let userId;

userIdBtn.addEventListener('click', async () => {
    userId = userIdInput.value.trim();
    if (!userId) return;

    await fetchTodos();
});

btnTodo.addEventListener('click', async () => {
    const title = inputTodo.value.trim();
    if (!title || !userId) return;

    const url = `${baseUrl}/${userId}/todos`;
    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title })
        });

        if (!response.ok) {
            const { fieldErrors: { title: [errMsg] } } = await response.json();
            errorContainer.innerText = errMsg;
            errorContainer.classList.remove('invisible');
            errorContainer.classList.add('flex');
            return;
        }

        inputTodo.value = "";
        await fetchTodos();
    } catch (e) {
        console.log('Error:', e);
    }
});

inputTodo.addEventListener('input', () => {
    errorContainer.classList.add('invisible');
    errorContainer.classList.remove('flex');
});

async function fetchTodos() {
    const url = `${baseUrl}/${userId}/todos`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        renderTodos(data);
    } catch (e) {
        console.log('Error:', e);
    }
}

function renderTodos(data) {
    toDoContainer.innerHTML = "";
    inProgressContainer.innerHTML = "";
    completedContainer.innerHTML = "";

    data.forEach(todo => {
        const taskElement = createTaskElement(todo);
        const container = todo.status === 'todo' ? toDoContainer : (todo.status === 'inprogress' ? inProgressContainer : completedContainer);
        container.appendChild(taskElement);
    });
}

function createTaskElement(todo) {
  const div = document.createElement('div');
  div.className = 'flex justify-between items-center p-2 bg-white shadow rounded my-2';
  div.innerHTML = `
      <div class="flex items-center">
          <input type="checkbox" class="mr-2" ${todo.status === 'completed' ? 'checked' : ''}>
          <span>${todo.title}</span>
      </div>
      <button class="delete-btn text-gray-500 hover:bg-red-400 w-10 h-10">x</button>
  `;

  const checkbox = div.querySelector('input[type="checkbox"]');
  const deleteBtn = div.querySelector('.delete-btn');

  checkbox.addEventListener('change', async () => {
      let newStatus;
      if (todo.status === 'todo') {
          newStatus = 'inprogress';
      } else if (todo.status === 'inprogress') {
          newStatus = 'completed';
      } else {
          newStatus = 'todo';
      }
      await updateTodoStatus(todo.id, newStatus);
  });

  deleteBtn.addEventListener('click', () => {
      deleteTodo(todo.id);
  });

  return div;
}


async function updateTodoStatus(id, status) {
    const url = `${baseUrl}/${userId}/todos/${id}`;
    try {
        await fetch(url, {
            method: "PUT",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });

        await fetchTodos();
    } catch (e) {
        console.log('Error:', e);
    }
}

async function deleteTodo(id) {
    const url = `${baseUrl}/${userId}/todos/${id}`;
    try {
        await fetch(url, { method: "DELETE" });
        await fetchTodos();
    } catch (e) {
        console.log('Error:', e);
    }
}