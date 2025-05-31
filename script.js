
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

const form = document.getElementById("task-form");
const nameInput = document.getElementById("task-name");
const deadlineInput = document.getElementById("task-deadline");
const prioritySelect = document.getElementById("task-priority");
const taskList = document.getElementById("task-list");
const notification = document.getElementById("notification");

function showNotification(message) {
    notification.textContent = message;
    notification.classList.add("show");
    setTimeout(() => {
        notification.classList.remove("show");
    }, 2000);
}

function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

function sortTasks(list, method) {
    const sorted = [...list];
    if (method === "name") sorted.sort((a, b) => a.name.localeCompare(b.name));
    if (method === "deadline") sorted.sort((a, b) => a.deadline.localeCompare(b.deadline));
    if (method === "priority") {
        const order = { low: 1, medium: 2, high: 3 };
        sorted.sort((a, b) => order[a.priority] - order[b.priority]);
    }
    return sorted;
}

function renderTasks() {
    taskList.innerHTML = "";
    const filter = document.getElementById("filter").value;
    const sortMethod = document.getElementById("sort").value;

    let filteredTasks = tasks.filter(task => {
        if (filter === "done") return task.completed;
        if (filter === "undone") return !task.completed;
        return true;
    });

    const sortedTasks = sortMethod !== "default" ? sortTasks(filteredTasks, sortMethod) : filteredTasks;

    sortedTasks.forEach(task => {
        const li = document.createElement("li");
        li.className = "task";

        const taskText = document.createElement("span");
        taskText.className = "task-info" + (task.completed ? " done" : "");
        taskText.textContent = `${task.name} — ${task.deadline} [${task.priority}]`;
        li.appendChild(taskText);

        const finishBtn = document.createElement("button");
        finishBtn.textContent = task.completed ? "Completed" : "Finish";
        finishBtn.classList.add("btn", "finish");
        finishBtn.disabled = task.completed;
        finishBtn.addEventListener("click", () => {
            task.completed = true;
            saveTasks();
            renderTasks();
        });
        li.appendChild(finishBtn);

        const editBtn = document.createElement("button");
        editBtn.textContent = "Edit";
        editBtn.classList.add("btn", "edit");
        editBtn.addEventListener("click", () => {
            const newName = prompt("New task name:", task.name);
            const newDate = prompt("New deadline (YYYY-MM-DD):", task.deadline);
            const newPriority = prompt("New priority (low, medium, high):", task.priority);
            if (newName && newDate && newPriority) {
                task.name = newName;
                task.deadline = newDate;
                task.priority = newPriority;
                saveTasks();
                renderTasks();
            }
        });
        li.appendChild(editBtn);

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.classList.add("btn", "delete");
        deleteBtn.addEventListener("click", () => {
            tasks = tasks.filter(t => t.id !== task.id);
            saveTasks();
            renderTasks();
        });
        li.appendChild(deleteBtn);

        taskList.appendChild(li);
    });
}

form.addEventListener("submit", function (e) {
    e.preventDefault();

    const name = nameInput.value.trim();
    const deadline = deadlineInput.value;
    const priority = prioritySelect.value;

    if (!name || !deadline) {
        alert("Please fill in all fields!");
        return;
    }

    const newTask = {
        id: Date.now(),
        name,
        deadline,
        priority,
        completed: false
    };

    tasks.push(newTask);
    saveTasks();
    renderTasks();
    form.reset();
    showNotification("Task added!");
});

document.getElementById("filter").addEventListener("change", renderTasks);
document.getElementById("sort").addEventListener("change", renderTasks);

document.getElementById("export-btn").addEventListener("click", () => {
    const data = JSON.stringify(tasks, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "tasks.json";
    link.click();
    URL.revokeObjectURL(url);
});

document.getElementById("import-input").addEventListener("change", function () {
    const file = this.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const importedTasks = JSON.parse(e.target.result);
            if (Array.isArray(importedTasks)) {
                tasks = importedTasks;
                saveTasks();
                renderTasks();
                showNotification("Tasks imported.");
            } else {
                alert("Invalid file format.");
            }
        } catch (err) {
            alert("Error loading file.");
        }
    };
    reader.readAsText(file);
});

// THEME toggle
function setTheme(theme) {
    document.body.classList.remove("light", "dark");
    document.body.classList.add(theme);
    localStorage.setItem("theme", theme);
}

document.addEventListener("DOMContentLoaded", () => {
    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);

    const themeToggle = document.getElementById("theme-toggle");
    if (themeToggle) {
        themeToggle.addEventListener("click", () => {
            const current = document.body.classList.contains("dark") ? "dark" : "light";
            const next = current === "dark" ? "light" : "dark";
            setTheme(next);
        });
    }

    const toggleFilter = document.getElementById("toggle-filter");
    const filterPanel = document.getElementById("filter-panel");

    if (toggleFilter && filterPanel) {
        toggleFilter.addEventListener("click", () => {
            filterPanel.classList.toggle("show");
            toggleFilter.textContent = filterPanel.classList.contains("show")
                ? "🔼 Hide filters"
                : "🔽 Show filters";
        });
    }

    renderTasks();
});
