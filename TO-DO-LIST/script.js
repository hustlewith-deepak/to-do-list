
'use strict';

// State Management
const STORAGE_KEY = 'taskMasterTasks';

let tasks = loadTasks();
let currentFilter = 'all';

// DOM Elements
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const taskList = document.getElementById('task-list');
const emptyState = document.getElementById('empty-state');

const taskCounter = document.getElementById('task-counter');
const totalCounter = document.getElementById('total-counter');

const clearCompleted = document.getElementById('clear-completed');
const filterButtons = document.querySelectorAll('.filter-btn');

// Load Tasks
function loadTasks() {
    try {
        const data = JSON.parse(
            localStorage.getItem(STORAGE_KEY)
        );

        if (!Array.isArray(data)) return [];

        return data.filter(task =>
            task &&
            typeof task.id === 'string' &&
            typeof task.text === 'string' &&
            typeof task.done === 'boolean'
        );

    } catch (error) {
        return [];
    }
}

// Save Tasks
function saveTasks() {
    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(tasks)
        );
    } catch (error) {
        console.error('Unable to save tasks:', error);
    }
}

// Add Task
function addTask(text) {

    const newTask = {
        id: crypto.randomUUID(),
        text: text,
        done: false
    };

    tasks.push(newTask);

    saveTasks();
    renderTasks();
}

// Toggle Task
function toggleTask(id, checked) {

    tasks = tasks.map(task =>
        task.id === id
            ? { ...task, done: checked }
            : task
    );

    saveTasks();
    renderTasks();
}

// Delete Task
function deleteTask(id) {

    tasks = tasks.filter(task =>
        task.id !== id
    );

    saveTasks();
    renderTasks();
}

// Render Tasks
function renderTasks() {

    taskList.replaceChildren();

    let filteredTasks = tasks.filter(task => {

        if (currentFilter === 'active') {
            return !task.done;
        }

        if (currentFilter === 'completed') {
            return task.done;
        }

        return true;
    });

    // Empty State
    emptyState.hidden = filteredTasks.length > 0;

    // Create Task Elements
    filteredTasks.forEach(task => {

        const li = document.createElement('li');
        li.className = 'task-item';

        if (task.done) {
            li.classList.add('completed');
        }

        li.dataset.id = task.id;

        // Checkbox
        const checkbox = document.createElement('input');

        checkbox.type = 'checkbox';
        checkbox.checked = task.done;
        checkbox.className = 'task-checkbox';
        checkbox.dataset.action = 'toggle';

        checkbox.setAttribute(
            'aria-label',
            `Complete ${task.text}`
        );

        // Task Text
        const span = document.createElement('span');

        span.className = 'task-text';
        span.textContent = task.text;

        // Delete Button
        const deleteBtn = document.createElement('button');

        deleteBtn.textContent = 'Delete';
        deleteBtn.className = 'delete-btn';
        deleteBtn.type = 'button';
        deleteBtn.dataset.action = 'delete';

        li.append(checkbox, span, deleteBtn);

        taskList.append(li);
    });

    // Update Counters
    const remaining = tasks.filter(
        task => !task.done
    ).length;

    const completed = tasks.filter(
        task => task.done
    ).length;

    taskCounter.textContent =
        `${remaining} ${remaining === 1 ? 'task' : 'tasks'} left`;

    totalCounter.textContent =
        `${tasks.length} total tasks`;

    clearCompleted.disabled = completed === 0;
}

// Form Submit Event
taskForm.addEventListener('submit', function(event) {

    event.preventDefault();

    const text = taskInput.value.trim();

    if (text === '') {
        taskInput.focus();
        return;
    }

    addTask(text);

    taskInput.value = '';
    taskInput.focus();
});

// Event Delegation
taskList.addEventListener('click', function(event) {

    const actionElement = event.target.closest('[data-action]');

    if (!actionElement) return;

    const li = actionElement.closest('li[data-id]');

    if (!li) return;

    const id = li.dataset.id;
    const action = actionElement.dataset.action;

    if (action === 'delete') {
        deleteTask(id);
    }

    if (action === 'toggle') {
        toggleTask(id, actionElement.checked);
    }
});

// Filter Tasks
filterButtons.forEach(button => {

    button.addEventListener('click', function() {

        currentFilter = this.dataset.filter;

        filterButtons.forEach(btn => {
            btn.classList.remove('active');
            btn.setAttribute('aria-pressed', 'false');
        });

        this.classList.add('active');
        this.setAttribute('aria-pressed', 'true');

        renderTasks();
    });
});

// Clear Completed Tasks
clearCompleted.addEventListener('click', function() {

    tasks = tasks.filter(task => !task.done);

    saveTasks();
    renderTasks();
});

// Initial Render
renderTasks();
