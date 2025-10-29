import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiRequest } from "../utils/api";
import background from "../assets/login-bg.png";
import "../styles/pages/Auth.css";

export default function Signup() {
  const [role, setRole] = useState("Collector");
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

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const data = await apiRequest('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          password: formData.password,
          role: role === "Artist" ? "artisan" : "collector"
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
          Create an Account
        </h2>
        <p className="auth-subheading">
          Join us and showcase your art to the world
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
          <input
            type="text"
            name="fullName"
            placeholder="Full name"
            className="auth-input"
            value={formData.fullName}
            onChange={handleInputChange}
            required
          />
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
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm password"
            className="auth-input"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            required
          />

          {/* Submit Button */}
          <button
            type="submit"
            className="auth-submit"
          >
            Sign up as {role}
          </button>
        </form>

        {/* Mode Switch */}
        <div className="auth-mode-switch">
          <p>
            Already have an account?{" "}
            <button
              onClick={() => navigate('/login')}
              className="auth-mode-link"
            >
              Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
