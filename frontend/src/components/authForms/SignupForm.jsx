import { useState, useEffect } from "react";
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
  const [isFormValid, setIsFormValid] = useState(false);
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [isUsernameValid, setIsUsernameValid] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(false);
  const navigate = useNavigate();
  const auth = useAuth();

 const passwordsMatch = () => password === confirmPassword;

 const processErrors = (error) => {
   if(error.response){
     const errors = error.response?.data?.errors || {};
     setEmailError(errors.Email?.[0] || "");
     setUsernameError(errors.UserName?.[0] || "");
     setPasswordError(errors.Password?.[0] || "");
     setIsPasswordValid(!errors.Password?.[0]);
     setIsUsernameValid(false);
     setIsEmailValid(false);
   }
   else{
    setErrorMessage("Failed to connect to the server");
   }
 };

 const validateSignup = async () => {
   setErrorMessage("");
   setEmailError("");
   setUsernameError("");
   setPasswordError("");
   setConfirmPasswordError("");
   let valid = true;
   if (!passwordsMatch()) { //local validation
     setConfirmPasswordError("Hasła muszą być takie same");
     valid = false;
   }
   try {
      await auth.validateAction(email, username, password);
      setIsUsernameValid(true);
      setIsEmailValid(true);
      setIsPasswordValid(true);
   } catch (error) {
     processErrors(error);
     valid = false;
   } finally {
    setIsFormValid(valid);
   }
 };

 useEffect(() => {
   const timer = setTimeout(async () => {
     if (username || email || password || confirmPassword) {
       validateSignup();
     }
   }, 500);
   return () => clearTimeout(timer);
 }, [username, email, password, confirmPassword]);

 const handleSubmit = async (e) => {
   e.preventDefault();
   try {
     const response = await auth.registerAction(email, username, password);
     if(response.status === 201) {
       navigate({ to: "/" });
     }
   } catch (error) {
     processErrors(error);
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
            <input type="username" placeholder="Wpisz nazwę" className={`form-control${usernameError ? " is-invalid" : ""} ${isUsernameValid && !usernameError ? " is-valid" : ""}`} id="username" value={username} onChange={(e) => setUsername(e.target.value)}/>
            {usernameError && <div className="invalid-feedback">{usernameError}</div>}
          </div>
          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              Email <span className="text-danger">*</span>
            </label>
            <input type="email" placeholder="Wpisz swój email" className={`form-control ${emailError ? " is-invalid" : ""} ${isEmailValid && !emailError ? " is-valid" : ""}`} id="email" value={email} onChange={(e) => setEmail(e.target.value)}/>
            {emailError && <div className="invalid-feedback">{emailError}</div>}
          </div>
          <div className="mb-3">
            <label htmlFor="password" className="form-label">
              Hasło <span className="text-danger">*</span>
            </label>
            <PasswordInput className={`form-control ${passwordError ? " is-invalid" : ""} ${isPasswordValid && !passwordError ? " is-valid" : ""}`} error={passwordError} placeholder="Hasło" id="password" value={password} onChange={(e) => setPassword(e.target.value)}/>
          </div>
          <div className="mb-3">
            <label htmlFor="confirm-password" className="form-label">
              Powtórz hasło <span className="text-danger">*</span>
            </label>
            <PasswordInput className={`form-control ${confirmPasswordError ? " is-invalid" : ""} ${isPasswordValid && !confirmPasswordError ? " is-valid" : ""}`} error={confirmPasswordError} placeholder="Powtórzone hasło" id="confirm-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}/>
          </div>
          <button type="submit" className="btn btn-primary login-register-button register-button" disabled={!isFormValid}>Zarejestruj</button>
          <p className="doesnt-have-account">
          Czy masz istniejące konto? <Link to="/login">Zaloguj się</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default SignupForm;
