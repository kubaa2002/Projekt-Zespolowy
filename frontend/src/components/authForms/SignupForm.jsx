import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "../../contexts/authProvider";
import { Link } from "@tanstack/react-router";
import PasswordInput from "../primitives/PasswordInput";

const SignupForm = () => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [emailError, setEmailError] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const navigate = useNavigate();
  const auth = useAuth();

  const passwordsMatch = () => password === confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setEmailError("");
    setUsernameError("");
    setPasswordError("");
    setConfirmPasswordError("");
  
    try {
      await auth.registerAction(email, username, password);
      navigate({ to: "/login" });
    } catch (error) {
      if (error.response) {
        console.log(error.response.data);
        const errors = error.response.data.errors || {};
    
        setEmailError(errors.Email?.[0]|| "");
        setUsernameError(errors.UserName?.[0]|| "");
        setPasswordError(errors.Password?.[0] || "");
        if (errors.Password?.[0] === "Hasło jest wymagane") {
          setConfirmPasswordError(errors.Password?.[0]);
        }
        if (!passwordsMatch()) {
          setConfirmPasswordError("Hasła muszą być takie same");
          return;
        }
      } else {
        setErrorMessage("Failed to connect to the server");
      }
    }
  };


  return (
    <div className="form-container">
      <div className="form-wrapper">
        <div className="login-register-header">
          <h1 className="title-login-register-vibe-title">
            <i className="bi bi-heart me-2"></i>Vibe
          </h1>
          <p className="title-login-register-password-subtitle">Stwórz konto</p>
          <p className="welcome-text">Zacznijmy!</p>
        </div>
        {errorMessage && <div className="error-message">{errorMessage}</div>}
        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-3">
            <label htmlFor="username" className="form-label">
              Nazwa użytkownika <span className="text-danger">*</span>
            </label>
            <input type="username" placeholder="Wpisz nazwę" className={`form-control ${usernameError ? "is-invalid" : ""}`} id="username" value={username} onChange={(e) => setUsername(e.target.value)}/>
            {usernameError && <div className="invalid-feedback">{usernameError}</div>}
          </div>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              Email <span className="text-danger">*</span>
            </label>
            <input type="email" placeholder="Wpisz swój email" className={`form-control ${emailError ? "is-invalid" : ""}`} id="email" value={email} onChange={(e) => setEmail(e.target.value)}/>
            {emailError && <div className="invalid-feedback">{emailError}</div>}
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">
              Hasło <span className="text-danger">*</span>
            </label>
            <PasswordInput className={passwordError ? "is-invalid" : ""} error={passwordError} placeholder="Hasło" id="password" value={password} onChange={(e) => setPassword(e.target.value)}/>
          </div>
          <div className="mb-3">
            <label htmlFor="confirm-password" className="form-label">
              Powtórz hasło <span className="text-danger">*</span>
            </label>
            <PasswordInput  className={confirmPasswordError ? "is-invalid" : ""} error={confirmPasswordError} placeholder="Powtórzone hasło" id="confirm-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}/>
          </div>
          <button type="submit" className="btn btn-primary login-register-button register-button">Zarejestruj</button>
          <p className="doesnt-have-account">
          Czy masz istniejące konto? <Link to="/login">Zaloguj się</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default SignupForm;
