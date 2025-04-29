import { useContext, createContext, useState} from "react";
import axios from "axios";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [userName, setUserName] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("site") || "");
  const loginAction = async (email, password) => {
    const response = await axios.post("http://localhost:5192/user/login", {
      email,
      password,
    });
    const { token, userName } = response.data;
    localStorage.setItem("token", token); // Just for testing. TODO: use cookies or sessions in useAuth Hook
    setUserName(userName);
    setToken(token);
  };
  const registerAction = async (email, username, password) => {
    const response = await axios.post("http://localhost:5192/user/register", {
      email,
      username,
      password,
    });
    const { token, userName } = response.data;
    localStorage.setItem("token", token); // Just for testing. TODO: use cookies or sessions in useAuth Hook
    setUserName(userName);
    setToken(token);
  }

  const logOut = () => {
    setUserName(null);
    setToken("");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ token, userName, loginAction, registerAction, logOut }}>
      {children}
    </AuthContext.Provider>
  );

};

export default AuthProvider;

export const useAuth = () => {
  return useContext(AuthContext);
};