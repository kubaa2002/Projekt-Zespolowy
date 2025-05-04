import React, { useState } from "react";

const PasswordInput = ({ id, value, onChange, placeholder }) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <div className="input-group">
      <input
        type={isPasswordVisible ? "text" : "password"}
        className="form-control"
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required
      />
      <span className="input-group-text" onClick={togglePasswordVisibility} style={{ cursor: "pointer" }}>
        <i className={`bi ${isPasswordVisible ? "bi-eye-slash" : "bi-eye"}`}></i>
      </span>
    </div>
  );
};

export default PasswordInput;