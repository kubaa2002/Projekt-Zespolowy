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

  const isFormValid = () => username.trim() !== "" && email.trim() !== "" && password.trim() !== "" && confirmPassword.trim() !== "" && passwordsMatch();


  return (
    <div className="form-container">
      <div className="form-wrapper">
      {/*{error && <div className="error-message">{error}</div>}*/}
        <div className="login-register-header">
          <h1 className="title-login-register-vibe-title">
            <i className="bi bi-heart me-2"></i>Vibe
          </h1>
          <p className="title-login-register-password-subtitle">Stwórz konto</p>
          <p className="welcome-text">Zacznijmy!</p>
        </div>
        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-3">
            <label htmlFor="username" className="form-label">
              Nazwa użytkownika <span className="text-danger">*</span>
            </label>
            <input type="username" placeholder="Wpisz nazwę" name="username" className="form-control" id="username" value={username} onChange={(e) => setUsername(e.target.value)} required/>
            <div className="invalid-feedback">
              Jakaś wiadomość o błędzie
            </div>
          </div>
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
            <PasswordInput placeholder="Hasło" id="password" name="password" value={password} onChange={(e) => setPassword(e.target.value)}/>
            <div className="invalid-feedback">
              Jakaś wiadomość o błędzie
            </div>
          </div>
          <div className="mb-3">
            <label htmlFor="confirm-password" className="form-label">
              Powtórz hasło <span className="text-danger">*</span>
            </label>
            <PasswordInput placeholder="Powtórzone hasło" id="confirm-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required/>
            <div className="invalid-feedback">
              Jakaś wiadomość o błędzie
            </div>
          </div>
          <button type="submit" className="btn btn-primary login-register-button register-button" disabled={!isFormValid()}>Zarejestruj</button>
          <p className="doesnt-have-account">
          Czy masz istniejące konto? <Link to="/login">Zaloguj się</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default SignupForm;
