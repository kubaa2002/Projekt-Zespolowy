import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "../../contexts/authProvider";
import { Link } from "@tanstack/react-router";
import PasswordInput from "../primitives/PasswordInput";
import { validateRegister } from "../../contexts/registerValidation";

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
  const [isFormValid, setIsFormValid] = useState(false);
  const navigate = useNavigate();
  const auth = useAuth();

  const validateField = (field, value, additionalFields = {}) => {
    const errors = validateRegister({ [field]: value, ...additionalFields });
    return errors[field] || "";
  };

  const handleFieldChange = (value, setValue) => {
    setValue(value);
  };

  const handleFieldBlur = (field, value, setError, additionalFields = {}) => {
    const error = validateField(field, value, additionalFields);
    setError(error);
  };

  useEffect(() => {
    const errors = validateRegister({ username, email, password, confirmPassword });
    setIsFormValid(Object.keys(errors).length === 0);
  }, [username, email, password, confirmPassword]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateRegister({ username, email, password, confirmPassword });
    if (Object.keys(errors).length > 0) {
      setEmailError(errors.email || "");
      setUsernameError(errors.username || "");
      setPasswordError(errors.password || "");
      setConfirmPasswordError(errors.confirmPassword || "");
      return;
    }
    try {
      const response = await auth.registerAction(email, username, password);
      if (response.status === 201) {
        navigate({ to: "/" });
      }
    } catch (error) {
      setIsFormValid(false);
      if (error.response) {
        const errors = error.response.data.errors || {};
        setEmailError(errors.Email?.[0] || "");
        setUsernameError(errors.UserName?.[0] || "");
        setPasswordError(errors.Password?.[0] || "");
      } else {
        setErrorMessage("Failed to connect to the server");
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
            <p className="title-login-register-password-subtitle">Stwórz konto</p>
            <p className="welcome-text">Zacznijmy!</p>
          </div>
          {errorMessage && <div className="error-message">{errorMessage}</div>}
          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-3">
              <label htmlFor="username" className="form-label">
                Nazwa użytkownika <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                placeholder="Wpisz nazwę"
                className={`form-control ${usernameError ? " is-invalid" : ""} ${
                  !usernameError && username ? " is-valid" : ""
                }`}
                id="username"
                value={username}
                onChange={(e) => handleFieldChange(e.target.value, setUsername)}
                onBlur={() => handleFieldBlur("username", username, setUsernameError)}
              />
              {usernameError && <div className="invalid-feedback">{usernameError}</div>}
            </div>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">
                Email <span className="text-danger">*</span>
              </label>
              <input
                type="email"
                placeholder="Wpisz swój email"
                className={`form-control ${emailError ? " is-invalid" : ""} ${
                  !emailError && email ? " is-valid" : ""
                }`}
                id="email"
                value={email}
                onChange={(e) => handleFieldChange(e.target.value, setEmail)}
                onBlur={() => handleFieldBlur("email", email, setEmailError)}
              />
              {emailError && <div className="invalid-feedback">{emailError}</div>}
            </div>
            <div className="mb-3">
              <label htmlFor="password" className="form-label">
                Hasło <span className="text-danger">*</span>
              </label>
              <PasswordInput
                className={`form-control ${passwordError ? " is-invalid" : ""} ${
                  !passwordError && password ? " is-valid" : ""
                }`}
                error={passwordError}
                placeholder="Hasło"
                id="password"
                value={password}
                onChange={(e) => handleFieldChange(e.target.value, setPassword)}
                onBlur={() =>
                  handleFieldBlur("password", password, setPasswordError, { confirmPassword })
                }
              />
            </div>
            <div className="mb-3">
              <label htmlFor="confirm-password" className="form-label">
                Powtórz hasło <span className="text-danger">*</span>
              </label>
              <PasswordInput
                className={`form-control ${confirmPasswordError ? " is-invalid" : ""} ${
                  !confirmPasswordError && confirmPassword ? " is-valid" : ""
                }`}
                error={confirmPasswordError}
                placeholder="Powtórzone hasło"
                id="confirm-password"
                value={confirmPassword}
                onChange={(e) => handleFieldChange(e.target.value, setConfirmPassword)}
                onBlur={() =>
                  handleFieldBlur("confirmPassword", confirmPassword, setConfirmPasswordError, {
                    password,
                  })
                }
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary login-register-button register-button"
              disabled={!isFormValid}
            >
              Zarejestruj
            </button>
            <p className="doesnt-have-account">
              Czy masz istniejące konto? <Link to="/login">Zaloguj się</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignupForm;