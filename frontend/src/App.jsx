// frontend/src/App.jsx
import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import WeeklyReport from './pages/WeeklyReport';



function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/report" element={<WeeklyReport />} />
      {/* You can add more routes here later, e.g., for login */}
      {/* <Route path="/login" element={<LoginPage />} /> */}
    </Routes>
  );
}

export default App;