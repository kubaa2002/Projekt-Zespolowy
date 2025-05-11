import  {useState} from "react";

const PasswordInput = ({ id, value, onChange, placeholder, className = "", error }) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <div className="input-group">
      <input
        type={isPasswordVisible ? "text" : "password"}
        className={className}
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
      <span className="input-group-text" onClick={togglePasswordVisibility} style={{ cursor: "pointer" }}>
        <i className={`bi ${isPasswordVisible ? "bi-eye-slash" : "bi-eye"}`}></i>
      </span>
      {error && <div className="invalid-feedback">{error}</div>}
    </div>
  );
};

export default PasswordInput;