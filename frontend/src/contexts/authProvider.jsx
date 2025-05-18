import { useContext, createContext, useState} from "react";
import axios from "axios";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [userName, setUserName] = useState(null); // userName won't be necessary in the future
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const loginAction = async (email, password) => {
    const response = await axios.post("http://localhost:5192/user/login", {
      email,
      password,
    });
    const { token, userName } = response.data;
    localStorage.setItem("token", token); // Just for testing. TODO: use cookies or sessions in useAuth Hook
    setUserName(userName);
    setToken(token);
    return response;
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
    return response;
  };
  const logOut = () => {
    setUserName(null);
    setToken("");
    localStorage.removeItem("token");
  };
  // TODO IMPORTANT!!! We have to validate this token by sending a req to the server
  /*const isAuthenticated = () => {
    return !!token;
  } */
  // i dont kwow if this is correct
  const isAuthenticated = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      return false;
    }
    try {
      await axios.get("http://localhost:5192/user/test", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return true;
    } catch {
      logOut();
      return false;
    }
  };


  return (
    <AuthContext.Provider value={{ token, loginAction, registerAction, logOut, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );

};

export default AuthProvider;

export const useAuth = () => {
  return useContext(AuthContext);
};