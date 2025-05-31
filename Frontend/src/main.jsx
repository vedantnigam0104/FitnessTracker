import React from "react";
import ReactDOM from "react-dom/client";
//import HomePage from "./HomePage";
import './index.css';
import App from './App.jsx';
import { UserProvider } from "./components/UserContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <UserProvider>
    <App />
  </UserProvider>
);

