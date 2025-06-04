import React from "react";

const Button = ({ children, onClick, type = "button", className = "", variant = "default", size = "base" }) => {
  const baseClasses = "font-semibold rounded-2xl shadow-md transition-all duration-200";
  const variants = {
    default: "bg-blue-600 hover:bg-blue-700 text-white",
    outline: "border border-blue-600 text-blue-600 hover:bg-blue-50",
  };
  const sizes = {
    base: "px-8 py-3 text-lg",
    lg: "px-12 py-4 text-xl",
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

export default Button;
