import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import "../assets/styles/Login.css";
import API from "../api/config";

const Login = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(API.AUTH_LOGIN, {
        username,
        password,
      });

      if (res.data.token) {
        const decoded = jwtDecode(res.data.token);
        const role = decoded.role;
        const fullName = decoded.fullName || decoded.username;

        localStorage.setItem("token", res.data.token);
        localStorage.setItem("username", decoded.username);
        localStorage.setItem("fullName", fullName);

        // ✅ Redirect logic based on normalized role
        if (role === "Admin" || role === "Super Admin") {
          navigate(state?.path || "/dashboard", { replace: true });
        } else {
          navigate("/employee-dashboard", { replace: true });
        }
      }
    } catch (err) {
      console.error("Login failed:", err);
      alert("Invalid login. Please try again.");
    }
  };

  return (
    <div className="login-container">
      <div className="left-pane">
        <h1 className="headline">Operations Center</h1>
        <p className="footer">By KASH Tech</p>
      </div>
      <div className="right-pane">
        <form className="form" onSubmit={handleLogin}>
          <h2 className="form-title">Login</h2>
          <label>Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            required
          />
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
