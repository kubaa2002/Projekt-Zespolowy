import { useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useAuth } from "../../contexts/authProvider";
import PasswordInput from "../primitives/PasswordInput";

const PassReset = () => {
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [emailError, setEmailError] = useState("");
  const [wasSent, setWasSent] = useState(false);
  const [countdown, setCountdown] = useState(0); 
  const navigate = useNavigate();

  const walidateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const auth = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!walidateEmail(email)) {
      setEmailError("Proszę podać prawidłowy adres email");
      return;
    }
    setEmailError("");
    setErrorMessage("");


    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/user/sendResetLink`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (response.ok) {
        setWasSent(true);
        setCountdown(30); 
      } else {
        setErrorMessage(data.error || "Błąd podczas wysyłania emaila.");
        setWasSent(false);
      }
    } catch (error) {
      setErrorMessage("Wystąpił błąd podczas wysyłania linku.");
      setWasSent(false);
    }
  };


  useEffect(() => {
    if (countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer); 
    }
  }, [countdown]);

  if (!wasSent) {
    return (
      <div className="centered-container">
        <div className="form-container">
          <div className="form-wrapper">
            <div className="login-register-header">
              <h1 className="title-login-register-vibe-title">
                <i className="bi bi-key me-2"></i>
              </h1>
              <p className="title-login-register-password-subtitle">
                Nie pamiętasz hasła?
              </p>
              <p className="welcome-text">
                Nie martw się, wyślemy ci instrukcje resetowania hasła
              </p>
            </div>
            {errorMessage && <div className="error-message">{errorMessage}</div>}
            <form onSubmit={handleSubmit} noValidate>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">
                  Email <span className="text-danger">*</span>
                </label>
                <input
                  className={`form-control ${emailError ? "is-invalid" : ""}`}
                  type="email"
                  placeholder="Wpisz swój email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {emailError && <div className="invalid-feedback">{emailError}</div>}
              </div>

              <button type="submit" className="btn btn-primary login-register-button">
                Potwierdź tożsamość
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
                <i className="bi bi-envelope me-2"></i>
              </h1>
              <p className="title-login-register-password-subtitle">
                Sprawdź swój e-mail
              </p>
              <p className="welcome-text">Otwórz swoją pocztę, aby zweryfikować</p>
            </div>
            {errorMessage && <div className="error-message">{errorMessage}</div>}
            <form onSubmit={handleSubmit} noValidate>
              <p className="doesnt-have-account">
                Nie otrzymałeś e-maila?{" "}
                {countdown > 0 ? (
                  <span>Poczekaj {countdown} sekund, aby wysłać ponownie.</span>
                ) : (
                  <Link to="#" onClick={handleSubmit}>
                    Kliknij, aby wysłać ponownie.
                  </Link>
                )}
              </p>
            </form>
          </div>
        </div>
      </div>
    );
  }
};

export default PassReset;