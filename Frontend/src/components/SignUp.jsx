import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const roles = [
  { label: "Customer", value: "CUSTOMER" },
  { label: "Admin", value: "ADMIN" },
  { label: "Manager", value: "MANAGER" },
  // add more roles if needed
];

const Signup = () => {
  const [formData, setFormData] = useState({
    username: "",
    fullName: "",
    email: "",
    password: "",
    role: "CUSTOMER", // default selected role
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setAvatarFile(null);
      setAvatarPreview(null);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const data = new FormData();
      data.append("username", formData.username);
      if (formData.fullName.trim() !== "") {
        data.append("fullName", formData.fullName);
      }
      data.append("email", formData.email);
      data.append("password", formData.password);
      data.append("role", formData.role);
      if (avatarFile) {
        data.append("avatar", avatarFile);
      }

      await axios.post("http://localhost:8080/auth/register", data);

      setSuccess("Registration successful! Please log in.");
      alert("Registration successful!");
      navigate("/login");
    } catch (err) {
      setError(
        err.response?.data ||
          "Registration failed. Please check your inputs."
      );
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <form
        onSubmit={handleSignup}
        className="bg-white shadow-md rounded-xl p-8 w-full max-w-md mb-6"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Sign Up</h2>

        <input
          type="text"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          className="w-full mb-4 p-3 border border-gray-300 rounded-xl"
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="w-full mb-4 p-3 border border-gray-300 rounded-xl"
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          className="w-full mb-4 p-3 border border-gray-300 rounded-xl"
          required
        />

        <input
          type="text"
          name="fullName"
          placeholder="Full Name (optional)"
          value={formData.fullName}
          onChange={handleChange}
          className="w-full mb-4 p-3 border border-gray-300 rounded-xl"
        />

        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="w-full mb-4 p-3 border border-gray-300 rounded-xl"
          required
        >
          {roles.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>

        <label className="block mb-2 font-medium text-gray-700">Upload Avatar</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleAvatarChange}
          className="mb-4"
        />
        {avatarPreview && (
          <img
            src={avatarPreview}
            alt="Avatar Preview"
            className="w-24 h-24 rounded-full mb-4 object-cover border border-gray-300"
          />
        )}

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        {success && <p className="text-green-500 text-sm mb-4">{success}</p>}

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded-xl hover:bg-green-700 transition mb-4"
        >
          Sign Up
        </button>
      </form>

      <div className="flex items-center mb-6 w-full max-w-md">
        <hr className="flex-grow border-t border-gray-300" />
        <span className="mx-4 text-gray-500 font-semibold">OR</span>
        <hr className="flex-grow border-t border-gray-300" />
      </div>
    </div>
  );
};

export default Signup;
