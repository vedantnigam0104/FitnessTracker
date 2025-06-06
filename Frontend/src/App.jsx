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

      </Routes>
    </Router>
  );
}

export default App;
