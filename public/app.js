const API = 'http://localhost:3000';
let token = localStorage.getItem('token');
let userName = localStorage.getItem('userName');
let allTasks = [];
let currentFilter = 'all';
let searchQuery = '';

if (token) showTasks();

function showTab(tab, el) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('login-form').style.display = tab === 'login' ? 'block' : 'none';
  document.getElementById('register-form').style.display = tab === 'register' ? 'block' : 'none';
}

async function register() {
  const name = document.getElementById('register-name').value;
  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;

  const res = await fetch(`${API}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
  });

  const json = await res.json();
  const el = document.getElementById('register-error');

  if (json.success) {
    el.style.color = '#22c55e';
    el.textContent = 'Account created! Please login.';
  } else {
    el.style.color = '#f87171';
    el.textContent = json.error;
  }
}

async function login() {
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  const res = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const json = await res.json();

  if (json.success) {
    token = json.data.token;
    userName = json.data.name;
    localStorage.setItem('token', token);
    localStorage.setItem('userName', userName);
    showTasks();
  } else {
    document.getElementById('login-error').textContent = json.error;
  }
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('userName');
  token = null;
  document.getElementById('auth-section').style.display = 'flex';
  document.getElementById('tasks-section').style.display = 'none';
}

function showTasks() {
  document.getElementById('auth-section').style.display = 'none';
  document.getElementById('tasks-section').style.display = 'flex';

  if (userName) {
    document.getElementById('user-name').textContent = userName;
    document.getElementById('user-avatar').textContent = userName.slice(0, 2).toUpperCase();
  }

  loadTasks();
}

async function loadTasks() {
  const url = searchQuery
    ? `${API}/tasks?search=${encodeURIComponent(searchQuery)}`
    : `${API}/tasks`;

  const res = await fetch(url, {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  const json = await res.json();
  allTasks = json.success ? json.data : [];
  updateStats();
  renderTasks();
}

function handleSearch(e) {
  searchQuery = e.target.value.trim();
  loadTasks();
}

function isOverdue(due_date) {
  if (!due_date) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(due_date) < today;
}

function isSoon(due_date) {
  if (!due_date) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(due_date);
  const diff = (due - today) / (1000 * 60 * 60 * 24);
  return diff >= 0 && diff <= 2;
}

function formatDate(due_date) {
  if (!due_date) return '';
  const date = new Date(due_date + 'T00:00:00');
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function updateStats() {
  const pending = allTasks.filter(t => t.status !== 'done').length;
  const done = allTasks.filter(t => t.status === 'done').length;
  const overdue = allTasks.filter(t => t.status !== 'done' && isOverdue(t.due_date)).length;
  document.getElementById('stat-total').textContent = allTasks.length;
  document.getElementById('stat-pending').textContent = pending;
  document.getElementById('stat-done').textContent = done;
  document.getElementById('stat-overdue').textContent = overdue;
}

function filterTasks(filter, el) {
  currentFilter = filter;
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  el.classList.add('active');
  renderTasks();
}

function renderTasks() {
  const list = document.getElementById('tasks-list');
  list.innerHTML = '';

  let filtered = allTasks;

  if (currentFilter === 'pending') {
    filtered = allTasks.filter(t => t.status !== 'done' && !isOverdue(t.due_date));
  } else if (currentFilter === 'done') {
    filtered = allTasks.filter(t => t.status === 'done');
  } else if (currentFilter === 'overdue') {
    filtered = allTasks.filter(t => t.status !== 'done' && isOverdue(t.due_date));
  }

  if (filtered.length === 0) {
    list.innerHTML = '<div class="empty-state">No tasks here yet.</div>';
    return;
  }

  const overdue = filtered.filter(t => t.status !== 'done' && isOverdue(t.due_date));
  const pending = filtered.filter(t => t.status !== 'done' && !isOverdue(t.due_date));
  const done = filtered.filter(t => t.status === 'done');

  if (overdue.length > 0) {
    list.innerHTML += '<div class="section-label" style="color:#ef4444">⚠ Overdue</div>';
    overdue.forEach(task => list.innerHTML += taskCard(task));
  }

  if (pending.length > 0) {
    list.innerHTML += '<div class="section-label" style="margin-top:16px">Pending</div>';
    pending.forEach(task => list.innerHTML += taskCard(task));
  }

  if (done.length > 0) {
    list.innerHTML += '<div class="section-label" style="margin-top:16px">Done</div>';
    done.forEach(task => list.innerHTML += taskCard(task));
  }
}

function taskCard(task) {
  const isDone = task.status === 'done';
  const overdue = !isDone && isOverdue(task.due_date);
  const soon = !isDone && !overdue && isSoon(task.due_date);

  let dueHtml = '';
  if (task.due_date) {
    const duClass = overdue ? 'overdue' : soon ? 'soon' : 'ok';
    const label = overdue ? '⚠ Overdue · ' : soon ? '⏰ Due soon · ' : '📅 ';
    dueHtml = `<div class="task-due ${duClass}">${label}${formatDate(task.due_date)}</div>`;
  }

  const badgeClass = overdue ? 'badge-overdue' : isDone ? 'badge-done' : 'badge-pending';
  const badgeText = overdue ? 'Overdue' : isDone ? 'Done' : 'Pending';
  const codeBadge = task.file_path ? `<span class="badge badge-code">⌨ Code</span>` : '';

  return `
    <div class="task-card ${isDone ? 'done' : ''} ${overdue ? 'overdue' : ''}" onclick="openModal(${task.id})">
      <div class="check-box ${isDone ? 'checked' : ''}" onclick="event.stopPropagation(); toggleTask(${task.id}, '${task.status}')">
        ${isDone ? `<svg class="check-icon" viewBox="0 0 12 12"><polyline points="2,6 5,9 10,3"/></svg>` : ''}
      </div>
      <div class="task-body">
        <div class="task-title">${task.title}</div>
        ${task.description ? `<div class="task-desc">${task.description}</div>` : ''}
        ${dueHtml}
      </div>
      <div class="task-meta">
        ${codeBadge}
        <span class="badge ${badgeClass}">${badgeText}</span>
        <button class="btn-delete" onclick="event.stopPropagation(); deleteTask(${task.id})">Delete</button>
      </div>
    </div>
  `;
}

function openModal(id) {
  const task = allTasks.find(t => t.id === id);
  if (!task) return;

  document.getElementById('modal-title').textContent = task.title;
  document.getElementById('modal-description').textContent = task.description || 'No description.';

  const dueEl = document.getElementById('modal-due');
  if (task.due_date) {
    const overdue = isOverdue(task.due_date);
    const soon = isSoon(task.due_date);
    const cls = overdue ? 'overdue' : soon ? 'soon' : '';
    const label = overdue ? '⚠ Overdue · ' : soon ? '⏰ Due soon · ' : '📅 Due: ';
    dueEl.innerHTML = `<p class="modal-due-text ${cls}">${label}${formatDate(task.due_date)}</p>`;
  } else {
    dueEl.innerHTML = '';
  }

  const codeBtnEl = document.getElementById('modal-code-btn');
  if (task.file_path) {
    const vscodePath = `vscode://file/${task.file_path.replace(/\\/g, '/')}`;
    codeBtnEl.innerHTML = `
      <a class="btn-open-vscode" href="${vscodePath}">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="16 18 22 12 16 6"></polyline>
          <polyline points="8 6 2 12 8 18"></polyline>
        </svg>
        Open in VS Code
      </a>
    `;
  } else {
    codeBtnEl.innerHTML = '';
  }

  document.getElementById('modal-overlay').style.display = 'flex';
}

function closeModal() {
  document.getElementById('modal-overlay').style.display = 'none';
}

function toggleCodeTask() {
  const checked = document.getElementById('is-code-task').checked;
  document.getElementById('code-task-fields').style.display = checked ? 'block' : 'none';
}

async function createTask() {
  const title = document.getElementById('task-title').value.trim();
  const description = document.getElementById('task-description').value.trim();
  const due_date = document.getElementById('task-due-date').value;
  const isCodeTask = document.getElementById('is-code-task').checked;
  const file_path = isCodeTask ? document.getElementById('task-file-path').value.trim() : null;

  if (!title) return;

  const res = await fetch(`${API}/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ title, description, due_date, file_path })
  });

  const json = await res.json();

  if (!json.success) {
    alert(json.error);
    return;
  }

  document.getElementById('task-title').value = '';
  document.getElementById('task-description').value = '';
  document.getElementById('task-due-date').value = '';
  document.getElementById('task-file-path').value = '';
  document.getElementById('is-code-task').checked = false;
  document.getElementById('code-task-fields').style.display = 'none';

  loadTasks();
}

async function toggleTask(id, currentStatus) {
  const newStatus = currentStatus === 'done' ? 'pending' : 'done';
  const task = allTasks.find(t => t.id === id);

  await fetch(`${API}/tasks/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      title: task.title,
      description: task.description,
      status: newStatus,
      due_date: task.due_date,
      file_path: task.file_path
    })
  });

  loadTasks();
}

async function deleteTask(id) {
  await fetch(`${API}/tasks/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });

  loadTasks();
}