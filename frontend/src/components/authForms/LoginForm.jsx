import React, { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import axios from "axios";
import { Link } from "@tanstack/react-router";
import "./authForm.css";
const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // TODO: hardcoded url
      const response = await axios.post("http://localhost:5192/user/login", {
        email,
        password,
      });

      const { token } = response.data;
      localStorage.setItem("token", token); // Just for testing. TODO: use cookies or sessions in useAuth Hook
      navigate({ to: "/" });
    } catch (error) {
      if (error.response) {
        setErrorMessage(error.response.data.errors?.error || "Login failed");
      } else {
        setErrorMessage("Failed to connect to the server");
      }
    }
  };

  return (
    <div className="form-wrapper">
      <h1>Log in!</h1>
      {errorMessage && <div className="error-message">{errorMessage}</div>}
      <form onSubmit={handleSubmit}>
        <label htmlFor="email">
          Email:
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label htmlFor="password">
          Hasło:
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        <p>
          Don't have an account? <Link to="/signup">Create one now!</Link>
        </p>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default LoginForm;
