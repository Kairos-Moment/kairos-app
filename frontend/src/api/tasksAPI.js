// Created by: Jorge Valdes-Santiago
//
//
// This script contains the functions that allow the client to communicate with the server.
// This script focuses on handling operations related to the Tasks table.

// Tell the server to get all the tasks from the database
const getTasks = async (uid) => {
  const options = {
    method: "GET", // Select method type
    headers: {
      "Content-Type": "application/json", // Specify data format being sent
    },
    body: { user_id: uid },
  };

  const response = await fetch("/api/tasks", options);
  const data = await response.json(); // Get the data from the response
  return data;
};

const getTaskById = async (id) => {
  const response = await fetch(`/api/tasks/${id}`);
  const data = await response.json(); // Parse response to JSON
  return data;
};

const createTask = async (task) => {
  try {
    // Set up HTTP POST method
    const options = {
      method: "POST", // Select method type
      headers: {
        "Content-Type": "application/json", // Specify data format being sent
      },
      body: JSON.stringify(task), // Convert JS object to JSON
    };

    // Send the request to the /api/tasks endpoint, pass the endpoint as the first parameter and the options variable as the second parameter.
    const response = await fetch("/api/tasks", options);
  } catch (err) {
    return; //
  }
};

const updateTask = async (task) => {
  // Set up HTTP PATCH method
  const options = {
    method: "PATCH", // Select method type
    headers: {
      "Content-Type": "application/json", // Specify data format being sent
    },
    body: JSON.stringify(task), // Convert JS object to JSON
  };

  // Make a fetch request to the /api/tasks/:id endpoint, pass the endpoint URL as the first parameter and the options variable as the second parameter.
  const response = await fetch(`/api/tasks/${task.id}`, options);
};

const deleteTask = async (task) => {
  // Set up HTTP DELETE method
  const options = {
    method: "DELETE", // Select method type
  };

  // Make a fetch request to the /api/tasks/:id endpoint, pass the endpoint as the first parameter and the options variable as the second parameter.
  const response = await fetch(`/api/tasks/${task.id}`, options);
};
