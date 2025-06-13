import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import Login from "./components/Login";
import SignUp from "./components/SignUp";
import UserDashboard from "./components/UserDashboard";
import FitnessDataForm from "./components/FitnessDataForm";
import ProfilePage from "./components/ProfilePage";
import MealLogger from "./components/MealLogger";
import MealDashboard from "./components/MealDashboard";
import WorkoutForm from "./components/WorkoutForm";
import WorkoutDashBoard from "./components/WorkoutDashboard";
import AddGoalsForm from "./components/AddGoalsForm";
import GoalsDashboard from "./components/GoalsDashboard";
import HistoryComparison from "./components/HistoryComparison";
import MealHistory from "./components/MealHistory";
import WorkoutHistory from "./components/WorkoutHistory";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/dashboard" element={<UserDashboard />}/>
        <Route path="/add-progress" element={<FitnessDataForm />}/>
        <Route path="/profile" element={<ProfilePage />}/>
        <Route path="/meals" element={<MealLogger />}/>
        <Route path="/meal-dashboard" element={<MealDashboard />}/>
        <Route path="/workout" element={<WorkoutForm />}/>
        <Route path="/workout-dashboard" element={<WorkoutDashBoard />}/>
        <Route path="/goals" element={<AddGoalsForm />}/>
        <Route path="/goals-dashboard" element={<GoalsDashboard />}/>
        <Route path="/history" element={<HistoryComparison />}/>
        <Route path="/meal-history" element={<MealHistory />}/>
        <Route path="/workout-history" element={<WorkoutHistory />}/>
      </Routes>
    </Router>
  );
}

export default App;
