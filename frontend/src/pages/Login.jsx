import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiRequest } from "../utils/api";
import background from "../assets/login-bg.png";
import "../styles/pages/Auth.css";

export default function Login() {
  const [role, setRole] = useState("Collector");
  const [mode, setMode] = useState("login");
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (mode === 'signup' && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const data = await apiRequest(`/auth/${mode}`, {
        method: 'POST',
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          ...(mode === 'signup' && { fullName: formData.fullName, role: role === "Artist" ? "artisan" : "collector" })
        }),
      });

      login(data.user, role);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Network error. Please try again.');
    }
  };

  return (
    <div
      className="auth-container"
      style={{ backgroundImage: `url(${background})` }}
    >
      {/* Overlay */}
      <div className="auth-overlay"></div>

      {/* Form Container */}
      <div className="auth-form-container">
        {/* Heading */}
        <h2 className="auth-heading">
          {mode === "login" ? "Welcome Back" : "Create an Account"}
        </h2>
        <p className="auth-subheading">
          {mode === "login"
            ? "Sign in to continue your journey"
            : "Join us and showcase your art to the world"}
        </p>

        {/* Artist/Collector Toggle */}
        <div className="role-toggle">
          <button
            onClick={() => setRole("Artist")}
            className={`role-button ${role === "Artist" ? "active" : "inactive"}`}
          >
            Artist
          </button>
          <button
            onClick={() => setRole("Collector")}
            className={`role-button ${role === "Collector" ? "active" : "inactive"}`}
          >
            Collector
          </button>
        </div>

        {/* Error Message */}
        {error && <p className="auth-error">{error}</p>}

        {/* Form Inputs */}
        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === "signup" && (
            <input
              type="text"
              name="fullName"
              placeholder="Full name"
              className="auth-input"
              value={formData.fullName}
              onChange={handleInputChange}
              required
            />
          )}
          <input
            type="email"
            name="email"
            placeholder="Email address"
            className="auth-input"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            className="auth-input"
            value={formData.password}
            onChange={handleInputChange}
            required
          />
          {mode === "signup" && (
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm password"
              className="auth-input"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
            />
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="auth-submit"
          >
            {mode === "login" ? `Login as ${role}` : `Sign up as ${role}`}
          </button>
        </form>

        {/* Mode Switch */}
        <div className="auth-mode-switch">
          {mode === "login" ? (
            <p>
              Don’t have an account?{" "}
              <button
                onClick={() => setMode("signup")}
                className="auth-mode-link"
              >
                Sign up
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{" "}
              <button
                onClick={() => setMode("login")}
                className="auth-mode-link"
              >
                Login
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
