import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "./UserContext";
import axios from "axios";
const backendUrl = "http://localhost:8080";

const ProfilePage = () => {
  const { user, getAvatar, login } = useContext(UserContext);
  const [form, setForm] = useState({
    username: "",
    avatarFile: null,
    avatarUrl: "",
    weight: "",
    height: "",
    gender: "",
    age: "",
  });
  const [previewUrl, setPreviewUrl] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!user) return;

    const token = localStorage.getItem("token");

    axios
      .get(`http://localhost:8080/api/profile/${user.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setForm({
          username: res.data.username || "",
          avatarUrl: res.data.avatarUrl || "",
          avatarFile: null,
          weight: res.data.weight || "",
          height: res.data.height || "",
          gender: res.data.gender || "",
          age: res.data.age || "",
        });
        setPreviewUrl(null); // Clear previous preview
      })
      .catch((err) => {
        console.error("Failed to load profile data", err);
      });
  }, [user]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setForm((prev) => ({
      ...prev,
      avatarFile: file,
    }));
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("username", form.username);
      if (form.avatarFile) {
        formData.append("avatar", form.avatarFile);
      }
      formData.append("weight", form.weight);
      formData.append("height", form.height);
      formData.append("gender", form.gender);
      formData.append("age", form.age);

      const res = await axios.post(
        `http://localhost:8080/api/profile/${user.id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Normalize avatarUrl to avoid duplicate '/uploads'
let avatarPath = res.data.avatarUrl || "";

if (avatarPath.startsWith("/uploads")) {
  avatarPath = avatarPath.slice("/uploads".length); // remove leading /uploads
} else if (avatarPath.startsWith("uploads")) {
  avatarPath = avatarPath.slice("uploads".length); // remove leading uploads
}

const updatedUrl = `${backendUrl}/uploads${avatarPath}?t=${Date.now()}`;

setForm((prev) => ({
  ...prev,
  avatarFile: null,
  avatarUrl: `/uploads${avatarPath}`,
}));


      login({
        ...user,
        avatarUrl: updatedUrl,
        username: res.data.username,
      });

      setPreviewUrl(null);
      alert("Profile Updated Successfully");
      setMessage("✅ Profile updated!");
    } catch (err) {
      console.error(err);
      setMessage("❌ Error updating profile.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-blue-100 to-indigo-200 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-2xl p-8">
        <h2 className="text-4xl font-bold text-center text-indigo-800 mb-8">Update Profile</h2>

        <div className="flex justify-center mb-6">
          <img
            src={
  previewUrl
    ? previewUrl // show local preview (base64) if available
    : form.avatarUrl
    ? form.avatarUrl.startsWith("http")
      ? form.avatarUrl // full URL already, so use as is
      : `${backendUrl}${form.avatarUrl}` // prepend backendUrl only if not full URL
    : getAvatar() // fallback default avatar
}

            alt="Avatar"
            className="w-32 h-32 rounded-full border-4 border-indigo-500 object-cover shadow-lg"
          />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 font-semibold mb-1">Username</label>
            <input
              name="username"
              value={form.username}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-1">Upload Avatar</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Weight (kg)</label>
              <input
                name="weight"
                value={form.weight}
                onChange={handleChange}
                type="number"
                step="0.1"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-1">Height (cm)</label>
              <input
                name="height"
                value={form.height}
                onChange={handleChange}
                type="number"
                step="0.1"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-1">Gender</label>
            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none"
            >
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-1">Age</label>
            <input
              name="age"
              value={form.age}
              onChange={handleChange}
              type="number"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition duration-300"
          >
            Save Changes
          </button>
        </form>

        {message && (
          <div className="text-center mt-6">
            <p
              className={`text-sm font-medium ${
                message.includes("✅") ? "text-green-600" : "text-red-600"
              }`}
            >
              {message}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
