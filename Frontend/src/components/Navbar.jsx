import React, { useState, useEffect, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "./UserContext"; // Adjust path as needed

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout, getAvatar } = useContext(UserContext);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const avatarUrl = getAvatar();

  return (
    <nav className="flex justify-between items-center px-10 py-6 shadow-md bg-white">
      <div
        className="text-3xl font-bold text-green-600 cursor-pointer"
        onClick={() => navigate("/")}
      >
        FitTrack
      </div>

      <div className="flex space-x-10 text-lg">
        <a href="#home" className="text-gray-700 hover:text-green-600 font-medium">
          Home
        </a>
        <a href="#about" className="text-gray-700 hover:text-green-600 font-medium">
          About
        </a>
        <a href="#contact" className="text-gray-700 hover:text-green-600 font-medium">
          Contact Us
        </a>
      </div>

      <div className="relative flex items-center space-x-6">
        {user ? (
          <div
            ref={dropdownRef}
            className="relative flex items-center space-x-4"
            style={{ userSelect: "none" }}
          >
            <button
              onClick={() => navigate("/dashboard")}
              className="text-blue-600 hover:text-green-600 font-semibold text-lg hidden md:inline"
            >
              Dashboard
            </button>
            <span className="text-green-700 font-semibold hidden md:inline text-lg">
              Hey, welcome {user.username}
            </span>
            <img
              src={avatarUrl || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-15 h-15 rounded-full cursor-pointer border-2 border-blue-600"
              title={user.username}
              alt="Avatar"
            />
            {dropdownOpen && (
              <div
                className="absolute right-0 mt-3 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
                style={{ top: "calc(100% + 8px)" }}
              >
                <button
                  onClick={handleLogout}
                  className="block w-full px-6 py-3 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors duration-200"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <button
              onClick={() => navigate("/login")}
              className="font-semibold rounded-2xl shadow-md px-8 py-3 text-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all duration-200"
            >
              Login
            </button>
            <button
              onClick={() => navigate("/signup")}
              className="font-semibold rounded-2xl shadow-md px-8 py-3 text-lg bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200"
            >
              Sign Up
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
