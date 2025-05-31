import React, { useContext, useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { UserContext } from "./UserContext";

// Reusable Button Component
const Button = ({
  children,
  onClick,
  type = "button",
  className = "",
  variant = "default",
  size = "base",
}) => {
  const baseClasses =
    "font-semibold rounded-2xl shadow-md transition-all duration-200";
  const variants = {
    default: "bg-blue-600 hover:bg-blue-700 text-white",
    outline: "border border-blue-600 text-blue-600 hover:bg-blue-50",
  };
  const sizes = {
    base: "px-8 py-3 text-lg", // Increased size here
    lg: "px-12 py-4 text-xl",  // Bigger size for lg buttons
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
};

// Simplified Navbar without base64 conversion
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
        <a
          href="#home"
          className="text-gray-700 hover:text-green-600 font-medium"
        >
          Home
        </a>
        <a
          href="#about"
          className="text-gray-700 hover:text-green-600 font-medium"
        >
          About
        </a>
        <a
          href="#contact"
          className="text-gray-700 hover:text-green-600 font-medium"
        >
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
            <span className="text-green-700 font-semibold hidden md:inline text-lg">
              Hey, welcome {user.username}
            </span>
            <img
              src={
                avatarUrl ||
                "https://cdn-icons-png.flaticon.com/512/149/149071.png"
              }
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

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-100">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <section
        id="home"
        className="flex flex-col-reverse lg:flex-row items-center justify-between px-10 lg:px-32 py-24"
      >
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
          className="max-w-2xl"
        >
          <h1 className="text-5xl lg:text-7xl font-bold text-green-700 mb-8 leading-tight">
            Track Your Fitness, Transform Your Life
          </h1>
          <p className="text-gray-700 text-xl mb-8 max-w-lg">
            FitTrack helps you stay on top of your health goals with real-time
            analytics, personalized insights, and a motivating community.
          </p>
          <div className="space-x-6">
            <Button size="lg">Get Started</Button>
            <Button variant="outline" size="lg">
              Learn More
            </Button>
          </div>
        </motion.div>

        <motion.img
          src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=900&auto=format&fit=crop&q=60"
          alt="Fitness Hero"
          className="rounded-3xl shadow-xl w-full lg:w-2/3 mb-14 lg:mb-0"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
        />
      </section>

      {/* About Section */}
      <section id="about" className="p-16 lg:p-28 bg-white">
        <h2 className="text-4xl font-bold text-center text-green-700 mb-14">
          About FitTrack
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-14">
          {[
            {
              icon: "https://cdn-icons-png.flaticon.com/512/854/854894.png",
              title: "Live Tracking",
              desc: "Monitor your activities in real-time, set goals, and keep pushing forward with confidence.",
            },
            {
              icon: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
              title: "Personal Goals",
              desc: "Customize your fitness goals to fit your personal needs and lifestyle.",
            },
            {
              icon: "https://cdn-icons-png.flaticon.com/512/747/747376.png",
              title: "Motivating Community",
              desc: "Join a vibrant community that encourages and supports your journey.",
            },
          ].map((item, index) => (
            <div key={index} className="text-center px-6">
              <img
                src={item.icon}
                alt={item.title}
                className="w-24 mx-auto mb-6"
              />
              <h3 className="text-2xl font-semibold mb-4">{item.title}</h3>
              <p className="text-gray-600 text-lg">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="p-16 lg:p-28 bg-green-50">
        <h2 className="text-4xl font-bold text-center text-green-700 mb-14">
          Contact Us
        </h2>
        <form className="max-w-3xl mx-auto grid grid-cols-1 gap-8">
          <input
            type="text"
            placeholder="Your Name"
            className="p-6 rounded-xl border border-gray-300 text-lg"
          />
          <input
            type="email"
            placeholder="Your Email"
            className="p-6 rounded-xl border border-gray-300 text-lg"
          />
          <textarea
            placeholder="Your Message"
            rows="6"
            className="p-6 rounded-xl border border-gray-300 text-lg"
          ></textarea>
          <Button className="w-full" size="lg">
            Send Message
          </Button>
        </form>
      </section>
    </div>
  );
}
