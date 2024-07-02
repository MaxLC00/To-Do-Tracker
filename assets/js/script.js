// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks")) || [];
let nextId = JSON.parse(localStorage.getItem("nextId"));

// Todo: create a function to generate a unique task id
function generateTaskId() {
  const uniqueId = `id` + new Date().getTime(); //creates an ID for the task based on the unix timestamp when it was created
  return uniqueId;
}

// Todo: create a function to create a task card
const todoCol = $(`#todo-cards`);
const inProgressCol = $(`#in-progress-cards`);
const doneCol = $(`#done-cards`);
// defnies the divs where cards can be created and dropped into, had to be moved out of function for scope
function createTaskCard(task) {
  const card = $(`<div class="card draggable task-card" data-id="${task.id}"></div>`); //creates the div containing the content
  const title = $(`<h2 class="card-header"></h2>`); // header from form
  const noteContainer = $(`<div class="card-body"></div>`); // info section of card
  const description = $(`<p class="card-title"></p>`); // notes from form
  const dueByDate = $(`<p class="card-text"></p>`); // date from form
  const deleteBtn = $(`<button class="btn btn-danger" data-id="${task.id}">Delete</button>`); // a delete button

  title.text(task.title);
  description.text(task.description);
  dueByDate.text(task.date);
//adds form content to card as text content
  noteContainer.append(description, dueByDate, deleteBtn);
  card.append(title, noteContainer);
//formats card
  const dueDate = dayjs(task.date); // defines due date using dayjs and form data
  const today = dayjs(); // defnies today using dayjs and the current date
  let timeLeft = today.diff(dueDate, `day`); //measures the time between due date and today in days

  if (timeLeft == 0) {
    card.addClass(`due-today`);
  } else if (timeLeft > 0) {
    card.addClass(`past-due`);
  }
  //gives cards a class based on their duedate

  if (task.status === `to-do`) {
    todoCol.append(card);
  } else if (task.status === `in-progress`) {
    inProgressCol.append(card);
  } else if (task.status === `done`) {
    doneCol.append(card);
    card.css(`background-color`, `white`);
  }
  // prints cards to appropriate collumn based on status, whether new card or card loaded from local storage

  deleteBtn.click(handleDeleteTask); //adds click event to button to run handleDeleteTask function
}

// Todo: create a function to render the task list and make cards draggable
function renderTaskList() {
    todoCol.empty();
    inProgressCol.empty();
    doneCol.empty();
    // resets collumns when tasks are rendered to prevent duplication when dragging tasks
  for (const item of taskList) {
    createTaskCard(item);
  }
    //runs create funtion to print a task for each item in the tasklist from local storage
  
    $(`.draggable`).draggable({ //defines the draggable conditions
    snap: `#in-progress-cards, #done-cards, #todo-cards`, //cards will snap to the collumns when dropped over them
    snapMode: `inner`, // cards snap to inside of collumns
    stack: `.swim-lanes`, //cards stack vertically in the collumn
    appendTo: `.lane`, // object is appended to new collumn
  });
}

// Todo: create a function to handle adding a new task
function handleAddTask(event) {
  const taskName = $(`#taskName`);
  const dueDate = $(`#dueDate`);
  const taskNotes = $(`#taskNotes`);
// finds relevant form section
  const task = {
    title: taskName.val(),
    date: dueDate.val(),
    description: taskNotes.val(),
    id: generateTaskId(),
    status: "to-do",
  };
  //creates an object using data from form and generate ID funtion

  taskList.push(task);
  //adds new task to end of tasklist

  localStorage.setItem(`tasks`, JSON.stringify(taskList));
  //puts object in local storage tasklist

  createTaskCard(task);
  //starts ceateTaskCard function
  location.reload();
  //reloads page
  return taskList;
}

// Todo: create a function to handle deleting a task
function handleDeleteTask(event) {
    let dataId = $(this).attr('data-id');

    taskList = taskList.filter(function (task) {
    return task.id !== dataId;
    });
  
    localStorage.setItem(`tasks`, JSON.stringify(taskList));
    renderTaskList();
}

// Todo: create a function to handle dropping a task into a new status lane
function handleDrop(event, ui) {
    const taskId = event.target.id; //tasks Id based on where it is dropped
    const taskClass = ui.draggable[0].classList; // assings the class of the dragged card
    const uniqueId = ui.draggable[0].dataset.id; // assigns the Id of the dragged card
  
    console.log("Dropping: ", taskId);
    if (taskId === `to-do`) { //checks if dropped into to-do collumn
      taskClass.remove(`done`, `in-progress`, `to-do`); //removes ALL classes (to ensure no duplicates)
      taskClass.add(`to-do`); //adds the class of the dropped collum to the card
      event.target.id = `to-do`; //changes status of object
    } else if (taskId === `in-progress`) {
      taskClass.remove(`done`, `in-progress`, `to-do`);
      taskClass.add(`in-progress`);
      event.target.id = `in-progress`;
    } else if (taskId === `done`) {
      taskClass.remove(`done`, `in-progress`, `to-do`, `past-due`, `due-today`); //also removes past due and due today classes to remove background color
      taskClass.add(`done`);
      event.target.id = `done`;
    }
  
    for (const item of taskList) {
      if (item.id === uniqueId) {
        item.status = taskId;
      }
    }
    //ensures id of dropped item is matched to id in local storage
  
    localStorage.setItem(`tasks`, JSON.stringify(taskList));
  // adds class changes to local storage
    renderTaskList();
  

}

// Todo: when the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker
const submitBtn = $(`#submit-btn`);
$(document).ready(function () {
  renderTaskList();
  //

  submitBtn.click(handleAddTask);
  //event listener on the submitbtn to start the add task funtion

  $(".lane").droppable({
    accept: ".draggable",
    drop: handleDrop,
  });
  //makes lane class dives droppable and starts drop function when draggable is placed in them

  $(function () {
    $("#dueDate").datepicker();
  });
//makes the dueDate section of modal form into a date picker
});
