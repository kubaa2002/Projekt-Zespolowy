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
  const [follow, setFollow] = useState([]);
  const [postIds, setPostIds] = useState([]);

  const loginAction = useCallback(async (email, password) => {
    const response = await axios.post(`${import.meta.env.VITE_API_URL}/user/login`, {
      email,
      password,
    });
    if (response.status === 200) {
      console.log(response.data);
      const { token, userName,id } = response.data;
      localStorage.setItem("token", token);
      setUser({ userName, email,id });
      setToken(token);
    }
    return response;
  }, []);

  const registerAction = useCallback(async (email, username, password) => {
    const response = await axios.post(`${import.meta.env.VITE_API_URL}/user/register`, {
      email,
      username,
      password,
    });
    const { token, userName,id } = response.data;
    if (response.status === 201) {
      localStorage.setItem("token", token);
      setUser({ userName, email,id });
      setToken(token);
    }
    return response;
  }, []);

  const logOut = useCallback(() => {
    setUser(null);
    setToken("");
    localStorage.removeItem("token");
  }, []);



const fetchSharedPostIds = (userId) => {
  return axios
    .get(`${import.meta.env.VITE_API_URL}/share/GetSharedPostsIds/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((response) => {
      if (response.status === 200) {
        const postIds = response.data;
        setPostIds(postIds);
        return postIds;
      } else if (response.status === 204) {
        setPostIds([]);
        return [];
      }
    })
    .catch((err) => {
      console.error(
        "Błąd podczas pobierania udostępnionych postów:",
        err.response?.data?.error || err.message
      );
    });
};


   const fetchFollowedUsers = (id) => {
    return axios
      .get(`${import.meta.env.VITE_API_URL}/user/${id}/follows`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        if (response.status === 200) {
          const followedUsers = response.data;
          setFollow(followedUsers);

          return followedUsers;
        } else if (response.status === 204) {
          setFollow([]);

          return [];
        }
      })
      .catch((err) => {
        console.error("Błąd podczas pobierania obserwowanych użytkowników:", err.response?.data?.error || err.message);

      });
  };
   useEffect(() => {
    if (!token) {
      logOut();
      return;
    }

    const fetchUserData = () => {
      axios
        .get(`${import.meta.env.VITE_API_URL}/user/test`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((response) => {
          const userData = {
            userName: response.data.userName,
            email: response.data.email,
            id: response.data.id,
          };
          setUser(userData);
          fetchFollowedUsers(userData.id); 
          fetchSharedPostIds(userData.id);
        })
        .catch((err) => {
          console.error("Błąd podczas pobierania danych użytkownika:", err.response?.data?.error || err.message);
          logOut();
        });
    };

    fetchUserData();
  }, [token, logOut]);
  return (
    <AuthContext.Provider
      value={{ token, user, loginAction, registerAction, logOut,follow, setFollow,postIds, setPostIds }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;

export const useAuth = () => {
  return useContext(AuthContext);
};
