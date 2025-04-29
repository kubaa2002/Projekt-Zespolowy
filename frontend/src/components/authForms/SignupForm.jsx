import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "../../contexts/authProvider";
import "./authForm.css";

const SignupForm = () => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const auth = useAuth();

  const passwordsMatch = () => password === confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try{
      await auth.registerAction(email, username, password);
      navigate({to: '/'});
    } catch (error) {
      if (error.response) {
        setError(error.response.data.errors?.error || "Signup failed");
      } else {
        setError("Failed to connect to the server");
      }
    }
  };
  return (
    <div className="form-wrapper">
      <h1>Sign Up</h1>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <label htmlFor="email">
          Email:
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label htmlFor="username">
          Username:
          <input
            type="text"
            id="username"
            name="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </label>
        <label htmlFor="password">
          Password:
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        <label htmlFor="confirm-password">
          Confirm Password:
          <input
            type="password"
            id="confirm-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </label>
        <button type="submit" disabled={!passwordsMatch()}>
          Sign Up
        </button>
      </form>
    </div>
  );
};

export default SignupForm;
