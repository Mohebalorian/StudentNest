// StudyNest stores tasks in this array while the page is open.
// Each task is an object with a name, subject, priority, due date and completion status.
let tasks = [];
let currentFilter = "all";

// Get the HTML elements that JavaScript needs to update.
const taskForm = document.getElementById("taskForm");
const taskName = document.getElementById("taskName");
const taskSubject = document.getElementById("taskSubject");
const taskPriority = document.getElementById("taskPriority");
const taskDate = document.getElementById("taskDate");
const taskList = document.getElementById("taskList");
const emptyState = document.getElementById("emptyState");
const toast = document.getElementById("toast");

// Put today's date in the small heading.
const today = new Date();
document.getElementById("todayLabel").textContent =
  today.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }).toUpperCase();

// Display a short message after an action.
let toastTimer;
function showToast(message) {
  toast.textContent = message;
  toast.classList.remove("hidden");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(function() {
    toast.classList.add("hidden");
  }, 2200);
}

// Add a new task when the form is submitted.
taskForm.addEventListener("submit", function(event) {
  event.preventDefault(); // Stops the page from refreshing.

  const name = taskName.value.trim();

  // Do not add a task if the input is empty.
  if (name === "") {
    showToast("Please enter a task first.");
    return;
  }

  // Create one task object using the values from the form.
  const newTask = {
    id: Date.now(),
    name: name,
    subject: taskSubject.value,
    priority: taskPriority.value,
    dueDate: taskDate.value,
    completed: false
  };

  tasks.push(newTask); // Add the object to the tasks array.
  taskForm.reset();    // Clear the form.
  taskPriority.value = "Medium";
  renderTasks();       // Refresh the task list on screen.
  showToast("Your task was added!");
});

// Show tasks on the page based on the selected filter.
function renderTasks() {
  taskList.innerHTML = ""; // Clear the old list before drawing it again.

  let visibleTasks = tasks;

  if (currentFilter === "pending") {
    visibleTasks = tasks.filter(function(task) {
      return task.completed === false;
    });
  } else if (currentFilter === "completed") {
    visibleTasks = tasks.filter(function(task) {
      return task.completed === true;
    });
  }

  // Create one row for every task that should be visible.
  visibleTasks.forEach(function(task) {
    const row = document.createElement("div");
    row.className = "task-item" + (task.completed ? " completed" : "");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "task-check";
    checkbox.checked = task.completed;
    checkbox.setAttribute("aria-label", "Mark task as completed");

    const details = document.createElement("div");

    const title = document.createElement("p");
    title.className = "task-title";
    title.textContent = task.name;

    const meta = document.createElement("div");
    meta.className = "task-meta";
    meta.textContent = task.subject + (task.dueDate ? " · Due " + task.dueDate : "");

    details.appendChild(title);
    details.appendChild(meta);

    const rightSide = document.createElement("div");
    rightSide.className = "task-right";

    const priority = document.createElement("span");
    priority.className = "priority " + task.priority;
    priority.textContent = task.priority;

    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-button";
    deleteButton.type = "button";
    deleteButton.textContent = "×";
    deleteButton.setAttribute("aria-label", "Delete task");

    rightSide.appendChild(priority);
    rightSide.appendChild(deleteButton);

    row.appendChild(checkbox);
    row.appendChild(details);
    row.appendChild(rightSide);
    taskList.appendChild(row);

    // Tick or untick a task to change its completion status.
    checkbox.addEventListener("change", function() {
      task.completed = checkbox.checked;
      renderTasks();
      showToast(task.completed ? "Task completed. Well done!" : "Task moved back to pending.");
    });

    // Delete this task from the array.
    deleteButton.addEventListener("click", function() {
      tasks = tasks.filter(function(item) {
        return item.id !== task.id;
      });
      renderTasks();
      showToast("Task deleted.");
    });
  });

  // Update the summary numbers.
  const completedTotal = tasks.filter(function(task) {
    return task.completed === true;
  }).length;

  const pendingTotal = tasks.length - completedTotal;

  document.getElementById("totalCount").textContent = tasks.length;
  document.getElementById("pendingCount").textContent = pendingTotal;
  document.getElementById("completedCount").textContent = completedTotal;
  document.getElementById("listCount").textContent = visibleTasks.length;

  // Show the empty message if there are no tasks in the selected view.
  emptyState.classList.toggle("hidden", visibleTasks.length !== 0);
}

// Change between All, Pending and Completed.
document.querySelectorAll(".filter-button").forEach(function(button) {
  button.addEventListener("click", function() {
    document.querySelectorAll(".filter-button").forEach(function(item) {
      item.classList.remove("active");
    });

    button.classList.add("active");
    currentFilter = button.dataset.filter;
    renderTasks();
  });
});

// Remove every completed task from the list.
document.getElementById("clearCompletedBtn").addEventListener("click", function() {
  const oldLength = tasks.length;
  tasks = tasks.filter(function(task) {
    return task.completed === false;
  });

  renderTasks();

  if (tasks.length === oldLength) {
    showToast("There are no completed tasks to clear.");
  } else {
    showToast("Completed tasks cleared.");
  }
});

// Draw the initial empty page.
renderTasks();
