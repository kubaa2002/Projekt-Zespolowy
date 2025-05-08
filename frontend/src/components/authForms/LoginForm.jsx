import React, { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useAuth } from "../../contexts/authProvider";
import PasswordInput from "../primitives/PasswordInput";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const auth = useAuth();
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await auth.loginAction(email, password);
      navigate({to: '/'});
    } catch (error) {
      if (error.response) {
        setErrorMessage(error.response.data.errors?.error || "Login failed");
      } else {
        setErrorMessage("Failed to connect to the server");
      }
    }
  };

  const isFormValid = () => email.trim() !== "" && password.trim() !== "";

  return (
    <div className="form-container">
      <div className="form-wrapper">
        {/*{errorMessage && <div className="error-message">{errorMessage}</div>}*/}
        <div className="login-register-header">
          <h1 className="title-login-register-vibe-title">
            <i className="bi bi-heart me-2"></i>Vibe
          </h1>
          <p className="title-login-register-password-subtitle">Zaloguj się na konto</p>
          <p className="welcome-text">Witaj ponownie w Vibe</p>
        </div>
        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              Email <span className="text-danger">*</span>
            </label>
            <input type="email" placeholder="Wpisz swój email" name="email" className="form-control" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required/>
            <div className="invalid-feedback">
              Jakaś wiadomość o błędzie
            </div>
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">
              Hasło <span className="text-danger">*</span>
            </label>
            <PasswordInput placeholder="Hasło" id="password" name="password" value={password} onChange={(e) => setPassword(e.target.value)} required/>
            <div className="invalid-feedback">
              Jakaś wiadomość o błędzie
            </div>
          </div>
          <div className="mb-3 d-flex justify-content-between align-items-center">
            <div className="form-check">
              <input type="checkbox" className="form-check-input" id="check" />
              <label className="form-check-label" htmlFor="check">
                Zapamiętaj mnie
              </label>
            </div>
            <Link to="#" className="forgot-password-link">
              Nie pamiętasz hasła?
            </Link>
          </div>
          <button type="submit" className="btn btn-primary login-register-button" disabled={!isFormValid()}>Zaloguj</button>
          <p className="doesnt-have-account">
          Nie masz konta? <Link to="/signup">Zarejestruj się</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;