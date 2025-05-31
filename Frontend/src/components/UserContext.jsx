import React, { createContext, useState, useEffect } from "react";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Load user from localStorage once on mount
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    alert("Logged out successfully");
  };

  const getAvatar = () => {
    return (
      user?.avatarUrl ||
      "https://cdn-icons-png.flaticon.com/512/149/149071.png" // default avatar
    );
  };

  return (
    <UserContext.Provider value={{ user, login, logout, getAvatar }}>
      {children}
    </UserContext.Provider>
  );
};
