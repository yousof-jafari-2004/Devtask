const $ = (selector) => document.querySelector(selector);
const digits = (value) => String(value).replace(/[0-9]/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);

const starterTasks = [
  { id: 1, title: 'بررسی ساختار پروژه', category: 'برنامه‌نویسی', completed: true },
  { id: 2, title: 'طراحی یک رابط کاربری زیبا و واکنش‌گرا', category: 'برنامه‌نویسی', completed: false },
  { id: 3, title: 'یادگیری یک مفهوم جدید جاوااسکریپت', category: 'یادگیری', completed: false }
];

let tasks = loadTasks();
let currentFilter = 'همه';

function loadTasks() {
  try {
    const saved = localStorage.getItem('devtasks-fa-tasks');
    return saved ? JSON.parse(saved) : starterTasks;
  } catch {
    return starterTasks;
  }
}

function saveTasks() {
  localStorage.setItem('devtasks-fa-tasks', JSON.stringify(tasks));
}

function render() {
  const completedCount = tasks.filter(task => task.completed).length;
  $('#total').textContent = digits(tasks.length);
  $('#active').textContent = digits(tasks.length - completedCount);
  $('#done').textContent = digits(completedCount);

  const query = $('#search').value.trim().toLowerCase();
  const visibleTasks = tasks.filter(task =>
    (currentFilter === 'همه' || task.category === currentFilter) &&
    task.title.toLowerCase().includes(query)
  );

  $('#task-count').textContent = `${digits(visibleTasks.length)} وظیفه`;
  const list = $('#task-list');
  list.replaceChildren();

  if (!visibleTasks.length) {
    const empty = document.createElement('div');
    empty.className = 'empty';
    empty.textContent = 'وظیفه‌ای پیدا نشد. یک وظیفه جدید اضافه کن!';
    list.append(empty);
    return;
  }

  visibleTasks.forEach(task => {
    const item = document.createElement('article');
    item.className = 'task-item';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'task-check';
    checkbox.checked = task.completed;
    checkbox.setAttribute('aria-label', 'تغییر وضعیت وظیفه');
    checkbox.addEventListener('change', () => {
      task.completed = checkbox.checked;
      saveTasks();
      render();
    });

    const info = document.createElement('div');
    info.className = 'task-info';

    const title = document.createElement('div');
    title.className = `task-title${task.completed ? ' completed' : ''}`;
    title.textContent = task.title;

    const meta = document.createElement('div');
    meta.className = 'task-meta';
    meta.textContent = `${task.category} · ${task.completed ? 'انجام‌شده' : 'در حال انجام'}`;
    info.append(title, meta);

    const edit = document.createElement('button');
    edit.className = 'icon-btn';
    edit.type = 'button';
    edit.textContent = '✎';
    edit.title = 'ویرایش وظیفه';
    edit.addEventListener('click', () => {
      const updated = prompt('عنوان جدید وظیفه:', task.title);
      if (updated && updated.trim()) {
        task.title = updated.trim().slice(0, 90);
        saveTasks();
        render();
      }
    });

    const remove = document.createElement('button');
    remove.className = 'icon-btn delete-btn';
    remove.type = 'button';
    remove.textContent = '×';
    remove.title = 'حذف وظیفه';
    remove.addEventListener('click', () => {
      tasks = tasks.filter(item => item.id !== task.id);
      saveTasks();
      render();
    });

    item.append(checkbox, info, edit, remove);
    list.append(item);
  });
}

$('#show-form').addEventListener('click', () => {
  $('#task-form').classList.toggle('hidden');
  if (!$('#task-form').classList.contains('hidden')) $('#task-title').focus();
});

$('#task-form').addEventListener('submit', event => {
  event.preventDefault();
  const title = $('#task-title').value.trim();
  if (!title) return;

  tasks.unshift({
    id: Date.now(),
    title: title.slice(0, 90),
    category: $('#task-category').value,
    completed: false
  });

  $('#task-title').value = '';
  $('#task-form').classList.add('hidden');
  saveTasks();
  render();
});

$('#filters').addEventListener('click', event => {
  const button = event.target.closest('[data-filter]');
  if (!button) return;
  currentFilter = button.dataset.filter;
  document.querySelectorAll('.filter').forEach(filter => {
    filter.classList.toggle('active', filter === button);
  });
  render();
});

$('#search').addEventListener('input', render);

$('#clear-done').addEventListener('click', () => {
  tasks = tasks.filter(task => !task.completed);
  saveTasks();
  render();
});

render();
