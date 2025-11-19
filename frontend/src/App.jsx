// frontend/src/App.jsx
import { Routes, Route, useRoutes } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import { useEffect, useState } from "react";

function App() {
  const [tasks, setTasks] = useState([]);
  const [goals, setGoals] = useState([]);
  const [focusSessions, setFocusSessions] = useState([]);
  const [habits, setHabits] = useState([]);
  const [user, setUser] = useState([]);

  // Load tasks
  //useEffect()

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

  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      {/* You can add more routes here later, e.g., for login */}
      {/* <Route path="/login" element={<LoginPage />} /> */}
    </Routes>
  );
}

export default App;
