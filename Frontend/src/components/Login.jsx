import React, { useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { UserContext } from "./UserContext";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../firebase.js"; // make sure this path is correct

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useContext(UserContext);

  const backendBaseUrl = "http://localhost:8080"; // your backend URL

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post(`${backendBaseUrl}/auth/login`, {
        email,
        password,
      });

      const { token } = res.data;
      if (!token) throw new Error("Token not found");

      localStorage.setItem("token", token);

      const profileRes = await axios.get(`${backendBaseUrl}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      let user = profileRes.data;
      if (user.avatarUrl && !user.avatarUrl.startsWith("http")) {
        user.avatarUrl = backendBaseUrl + user.avatarUrl;
      }

      localStorage.setItem("user", JSON.stringify(user));
      await login(user);

      alert("Login successful!");
      navigate("/");
    } catch (err) {
      console.error(err);
      setError("Invalid credentials or unable to fetch profile.");
    }
  };

  const handleGoogleLogin = async () => {
  setError("");
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const response = await axios.post("http://localhost:8080/auth/google-login", {
      email: user.email,
      username: user.displayName,
      avatarUrl: user.photoURL,
    });

    const token = response.data.token;
    localStorage.setItem("token", token);

    // Now fetch full user details from /auth/me
    const profileRes = await axios.get("http://localhost:8080/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });

    let userData = profileRes.data;

    localStorage.setItem("user", JSON.stringify(userData));
    await login(userData);
    alert("Google sign-in successful!");
    navigate("/");
  } catch (err) {
    console.error(err);
    setError("Google sign-in failed.");
  }
};


  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-100 px-4">
      <form
        onSubmit={handleLogin}
        className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md"
      >
        <h2 className="text-3xl font-bold mb-6 text-center text-blue-700">
          Login to FitTracker
        </h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-4 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring"
          required
        />

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition font-semibold"
        >
          Log In
        </button>

        <div className="flex items-center justify-center text-sm text-gray-500 my-4">
          OR
        </div>

        <button
          onClick={handleGoogleLogin}
          type="button"
          className="w-full flex items-center justify-center gap-4 border border-gray-300 py-3 px-6 rounded-full hover:shadow-lg transition bg-white"
        >
          <img
            src="https://developers.google.com/identity/images/g-logo.png"
            alt="Google Logo"
            className="w-5 h-5"
          />
          <span className="text-gray-700 font-medium text-sm sm:text-base">
            Continue with Google
          </span>
        </button>
      </form>
    </div>
  );
};

export default Login;
