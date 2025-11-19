// frontend/src/App.jsx
import { Routes, Route, useRoutes } from "react-router-dom";
import { useEffect, useState } from "react";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";

function App() {
  const [tasks, setTasks] = useState([]);
  const [goals, setGoals] = useState([]);
  const [focusSessions, setFocusSessions] = useState([]);
  const [habits, setHabits] = useState([]);
  const [user, setUser] = useState([]);

  const API_URL = "http://localhost:3001"; // link to API

  useEffect(() => {
    const getUser = async () => {
      const response = await fetch(`${API_URL}/auth/login/success`, {
        credentials: "include",
      });
      const json = await response.json();
      setUser(json.user);
    };

    const fetchTasks = async () => {};

    const fetchGoals = async () => {};

    const fetchHabits = async () => {};

    // Call functions
    //getUser();
  });

  const logout = async () => {
    // Make a request to the /auth/logout endpoint with the credentials option set to 'include'.
    const url = `${API_URL}/auth/logout`;
    const response = await fetch(url, { credentials: "include" });
    const json = await response.json(); // Convert response to JSON
    window.location.href = "/"; // Redirect to home page
  };

  // Routes and pages

  let element = useRoutes([
    {
      path: "/",
      element: <Dashboard />,
    },
    {
      path: "/tasks/create",
      element: "<Task Creator page here>",
    },
    {
      path: "/goals",
      element: "<Goals page here>",
    },
    {
      path: "/goals/create/",
      element: "<Goals Creation page here>",
    },
    {
      path: "/habits",
      element: "<Habits page here>",
    },
    {
      path: "/habits/create/",
      element: "<Habit Creator page here>",
    },
    {
      path: "/insights",
      element: "<Insights page here>",
    },
    {
      path: "/settings",
      element: "<Settings page here>",
    },
  ]);

  return <>{element}</>;

  // Delete or comment the "return" above if it causes problems

  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      {/* You can add more routes here later, e.g., for login */}
      {/* <Route path="/login" element={<LoginPage />} /> */}
    </Routes>
  );
}

export default App;
