const STORAGE_KEY = 'todo-app-tasks';

let tasks = [];
let filter = 'all'; // 'all' | 'active' | 'completed'

// --- Storage ---
function load() {
  try {
    tasks = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    tasks = [];
  }
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// --- DOM refs ---
const input     = document.getElementById('new-todo');
const addBtn    = document.getElementById('add-btn');
const list      = document.getElementById('todo-list');
const countEl   = document.getElementById('count');
const clearBtn  = document.getElementById('clear-btn');
const filterBtns = document.querySelectorAll('.filters button');

// --- Render ---
function render() {
  const visible = tasks.filter(t => {
    if (filter === 'active')    return !t.done;
    if (filter === 'completed') return t.done;
    return true;
  });

  list.innerHTML = '';

  if (visible.length === 0) {
    list.innerHTML = '<li class="empty">タスクがありません</li>';
  } else {
    visible.forEach(task => list.appendChild(createItem(task)));
  }

  const active = tasks.filter(t => !t.done).length;
  countEl.textContent = `${active} 件残り`;
  clearBtn.disabled = !tasks.some(t => t.done);

  filterBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === filter);
  });
}

function createItem(task) {
  const li = document.createElement('li');
  li.className = `todo-item${task.done ? ' done' : ''}`;
  li.dataset.id = task.id;

  // Checkbox
  const cb = document.createElement('input');
  cb.type = 'checkbox';
  cb.checked = task.done;
  cb.addEventListener('change', () => toggleDone(task.id));

  // Label (double-click to edit)
  const label = document.createElement('label');
  label.textContent = task.text;
  label.addEventListener('dblclick', () => startEdit(task.id, li, label));

  // Delete
  const del = document.createElement('button');
  del.className = 'delete-btn';
  del.title = '削除';
  del.textContent = '×';
  del.addEventListener('click', () => deleteTask(task.id));

  li.append(cb, label, del);
  return li;
}

// --- Inline edit ---
function startEdit(id, li, label) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  const editInput = document.createElement('input');
  editInput.className = 'edit-input';
  editInput.value = task.text;
  label.replaceWith(editInput);
  editInput.focus();
  editInput.select();

  const finish = () => {
    const val = editInput.value.trim();
    if (val) {
      task.text = val;
      save();
    }
    render();
  };

  editInput.addEventListener('blur', finish);
  editInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') editInput.blur();
    if (e.key === 'Escape') { editInput.value = task.text; editInput.blur(); }
  });
}

// --- Actions ---
function addTask() {
  const text = input.value.trim();
  if (!text) return;
  tasks.push({ id: Date.now(), text, done: false });
  save();
  input.value = '';
  render();
  input.focus();
}

function toggleDone(id) {
  const task = tasks.find(t => t.id === id);
  if (task) { task.done = !task.done; save(); render(); }
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  save();
  render();
}

function clearCompleted() {
  tasks = tasks.filter(t => !t.done);
  save();
  render();
}

// --- Event listeners ---
addBtn.addEventListener('click', addTask);
input.addEventListener('keydown', e => { if (e.key === 'Enter') addTask(); });
clearBtn.addEventListener('click', clearCompleted);
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filter = btn.dataset.filter;
    render();
  });
});

// --- Init ---
load();
render();
