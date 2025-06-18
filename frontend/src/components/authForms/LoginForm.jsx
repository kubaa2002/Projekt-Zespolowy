import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useAuth } from "../../contexts/authProvider";
import PasswordInput from "../primitives/PasswordInput";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const navigate = useNavigate();

  const auth = useAuth();
  const handleSubmit = async (e) => {
    e.preventDefault();
    setEmailError("");
    setPasswordError("");
    setErrorMessage("");
  
    try {
      const response = await auth.loginAction(email, password);
      if (response.status === 200) {
        navigate({ to: "/" });
      }
    } catch (error) {
      if (error.response) {
        const errors = error.response.data.errors || {};
        setErrorMessage(errors.error?.[0] || "");
        if (errors.error?.[0]) {
          setEmailError(" ");
          setPasswordError(" ");
        } else {
          setEmailError(errors.Email?.[0] || "");
          setPasswordError(errors.Password?.[0] || "");
        }
      } else {
        setErrorMessage("Nie udało się połączyć z serwerem");
      }
    }
  };

  return (
    <div className="centered-container">
      <div className="form-container">
        <div className="form-wrapper">
          <div className="login-register-header">
            <h1 className="title-login-register-vibe-title">
              <i className="bi bi-heart me-2"></i>Vibe
            </h1>
            <p className="title-login-register-password-subtitle">Zaloguj się na konto</p>
            <p className="welcome-text">Witaj ponownie w Vibe</p>
          </div>
          {errorMessage && <div className="error-message">{errorMessage}</div>}
          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">
                Email <span className="text-danger">*</span>
              </label>
              <input className={`form-control ${emailError ? "is-invalid" : ""}`} type="email" placeholder="Wpisz swój email" id="email" value={email} onChange={(e) => setEmail(e.target.value)}/>
              {emailError && <div className="invalid-feedback">{emailError}</div>}
            </div>
            <div className="mb-3">
              <label htmlFor="password" className="form-label">
                Hasło <span className="text-danger">*</span>
              </label>
              <PasswordInput className={`form-control ${passwordError ? " is-invalid" : ""}`} error={passwordError} placeholder="Hasło" id="password" value={password} onChange={(e) => setPassword(e.target.value)}/>
            </div>
            <div className="mb-3 d-flex justify-content-between align-items-center">
              <div className="form-check">
                <input type="checkbox" className="form-check-input" id="check" />
                <label className="form-check-label" htmlFor="check">
                  Zapamiętaj mnie
                </label>
              </div>
              <Link to="/reset" className="forgot-password-link">
                Nie pamiętasz hasła?
              </Link>
            </div>
            <button type="submit" className="btn btn-primary login-register-button">Zaloguj</button>
            <p className="doesnt-have-account">
            Nie masz konta? <Link to="/signup">Zarejestruj się</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;