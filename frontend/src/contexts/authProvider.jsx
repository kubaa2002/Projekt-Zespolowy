import {
  useContext,
  createContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import axios from "axios";

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || "");

  const loginAction = useCallback(async (email, password) => {
    const response = await axios.post("http://localhost:5192/user/login", {
      email,
      password,
    });
    if (response.status === 200) {
      const { token, userName } = response.data;
      localStorage.setItem("token", token);
      setUser({ userName, email });
      setToken(token);
    }
    return response;
  }, []);

  const registerAction = useCallback(async (email, username, password) => {
    const response = await axios.post("http://localhost:5192/user/register", {
      email,
      username,
      password,
    });
    const { token, userName } = response.data;
    if (response.status === 201) {
      localStorage.setItem("token", token);
      setUser({ userName, email });
      setToken(token);
    }
    return response;
  }, []);

  const logOut = useCallback(() => {
    setUser(null);
    setToken("");
    localStorage.removeItem("token");
  }, []);

  useEffect(() => {
    if (token) {
      axios
        .get("http://localhost:5192/user/test", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          setUser({
            userName: response.data.userName,
            email: response.data.email,
          });
        })
        .catch(() => {
          logOut();
        });
    }
  }, [token, logOut]);
  return (
    <AuthContext.Provider
      value={{ token, user, loginAction, registerAction, logOut }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;

export const useAuth = () => {
  return useContext(AuthContext);
};
