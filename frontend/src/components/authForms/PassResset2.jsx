import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useAuth } from "../../contexts/authProvider";
import PasswordInput from "../primitives/PasswordInput";

const PassReset2 = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [newPasswordError, setNewPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [wasSent, setWasSent] = useState(false);
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  let token = params.get("token");
  if (token) {
      token = token.replaceAll(' ', '+');
  }
  const auth = useAuth();


  useEffect(() => {
    if (!token) {
      setErrorMessage("Brak tokena resetowania hasła. Spróbuj ponownie wygenerować link.");
    }
  }, [token]);

  const validateForm = () => {
    let isValid = true;
    const newErrors = {};

  
    if (!newPassword) {
      newErrors.newPassword = "Nowe hasło jest wymagane";
      isValid = false;
    } else if (newPassword.length < 8) {
      newErrors.newPassword = "Hasło musi mieć co najmniej 8 znaków";
      isValid = false;
    }


    if (!confirmPassword) {
      newErrors.confirmPassword = "Potwierdzenie hasła jest wymagane";
      isValid = false;
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Hasła nie są zgodne";
      isValid = false;
    }

    setNewPasswordError(newErrors.newPassword || "");
    setConfirmPasswordError(newErrors.confirmPassword || "");
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setNewPasswordError("");
    setConfirmPasswordError("");


    if (!validateForm()) {
      return;
    }


    if (!token) {
      setErrorMessage("Brak tokena resetowania hasła.");
      return;
    }


    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/user/resetPassword`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await response.json();
      if (response.ok) {
        setWasSent(true); 
      } else {
        setErrorMessage(data.error || "Błąd podczas resetowania hasła.");
        setWasSent(false);
      }
    } catch (error) {
      setErrorMessage("Wystąpił błąd podczas resetowania hasła.");
      setWasSent(false);
    }
  };

  if (!wasSent) {
    return (
      <div className="centered-container">
        <div className="form-container">
          <div className="form-wrapper">
            <div className="login-register-header">
              <h1 className="title-login-register-vibe-title">
                <i className="bi bi-heart me-2"></i>Vibe
              </h1>
              <p className="title-login-register-password-subtitle">
                Utwórz nowe hasło
              </p>
              <p className="welcome-text">
                Twoje nowe hasło musi różnić się od wcześniej używanych.
              </p>
            </div>
            {errorMessage && <div className="error-message">{errorMessage}</div>}
            <form onSubmit={handleSubmit} noValidate>
              <div className="mb-3">
                <label htmlFor="newPassword" className="form-label">
                  Nowe hasło <span className="text-danger">*</span>
                </label>
                <PasswordInput
                  className={`form-control ${newPasswordError ? "is-invalid" : ""}`}
                  error={newPasswordError}
                  placeholder="Nowe hasło"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                {newPasswordError && (
                  <div className="invalid-feedback">{newPasswordError}</div>
                )}
              </div>
              <div className="mb-3">
                <label htmlFor="confirmPassword" className="form-label">
                  Powtórz nowe hasło <span className="text-danger">*</span>
                </label>
                <PasswordInput
                  className={`form-control ${confirmPasswordError ? "is-invalid" : ""}`}
                  error={confirmPasswordError}
                  placeholder="Powtórzone nowe hasło"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                {confirmPasswordError && (
                  <div className="invalid-feedback">{confirmPasswordError}</div>
                )}
              </div>

              <button type="submit" className="btn btn-primary login-register-button">
                Zresetuj hasło
              </button>
              <p className="doesnt-have-account">
                Powrót do logowania <Link to="/login">Zaloguj się</Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (wasSent) {
    return (
      <div className="centered-container">
        <div className="form-container">
          <div className="form-wrapper">
            <div className="login-register-header">
              <h1 className="title-login-register-vibe-title">
                <i className="bi bi-heart me-2"></i>Vibe
              </h1>
              <p className="title-login-register-password-subtitle">
                Tworzenie nowego hasła
              </p>
              <p className="welcome-text">
                Twoje hasło zostało pomyślnie zresetowane. Kliknij poniżej, aby szybko się
                zalogować.
              </p>
            </div>
            {errorMessage && <div className="error-message">{errorMessage}</div>}
            <form onSubmit={(e) => e.preventDefault()} noValidate>
              <button
                onClick={() => navigate({ to: "/login" })}
                className="btn btn-primary login-register-button"
              >
                Zaloguj
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }
};

export default PassReset2;