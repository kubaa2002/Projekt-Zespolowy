import { createContext, useContext, useState } from "react";
import { useAuth } from "./authProvider";
import axios from "axios";

const SearchContext = createContext();

const SearchProvider = ({ children }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true); 
  const { token } = useAuth();

  const getAuthConfig = () => ({
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const mergeUniqueById = (prevData, newData) => { //wtf
    if (!Array.isArray(newData)) return prevData;
    const existingIds = new Set(prevData.map((item) => item.id));
    return [...prevData, ...newData.filter((item) => !existingIds.has(item.id))];
  };
  const searchCommunityPosts = async (
    communityId,
    query = "",
    start = 0,
    amount = 10
  ) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/search/community/${communityId}?q=${encodeURIComponent(query)}&start=${start}&amount=${amount}`,
        getAuthConfig()
      );
      const newData = response.data;
      if (newData.length < amount) {
        setHasMore(false);
      } 
      setData((prev) => mergeUniqueById(prev, newData));
      setError(null);
      return response.data;
    } catch (err) {
      setError(err.response?.data || "Error searching community posts");
    } finally {
      setLoading(false);
    }
  };

  const searchUserPosts = async (
    userId,
    query = "",
    start = 0,
    amount = 10
  ) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/search/user/${userId}?q=${encodeURIComponent(query)}&start=${start}&amount=${amount}`,
        getAuthConfig()
      );
      const newData= response.data;
      if (newData.length < amount) {
        setHasMore(false);
      } 
      setData((prev) => mergeUniqueById(prev, newData));
      setError(null);
      return response.data;
    } catch (err) {
      setError(err.response?.data || "Error searching user posts");
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async (query = "", start = 0, amount = 10) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/search/user?q=${encodeURIComponent(query)}&start=${start}&amount=${amount}`,
        getAuthConfig()
      );

      setError(null);
      const newData= response.data;
      if (newData.length < amount) {
        setHasMore(false);
      } 
      setData((prev) => mergeUniqueById(prev, newData));
    } catch (err) {
      setError(err.response?.data || "Error searching users");
    } finally {
      setLoading(false);
    }
  };

  const searchCommunities = async (query = "", start = 0, amount = 10) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/search/community?q=${encodeURIComponent(query)}&start=${start}&amount=${amount}`,
        getAuthConfig()
      );

      setError(null);
      const newData = response.data;
      if (newData.length < amount) {
        setHasMore(false);
      } 
      setData((prev) => mergeUniqueById(prev, newData));
    } catch (err) {
      setError(err.response?.data || "Error searching communities");
    } finally {
      setLoading(false);
    }
  };
  const reset = () => {
    setData([]);
    setLoading(false);
    setError(null);
    setHasMore(true);
  };
  return (
    <SearchContext.Provider
      value={{
        data,
        setData,
        loading,
        error,
        searchCommunityPosts,
        searchUserPosts,
        searchUsers,
        searchCommunities,  
        hasMore,
        reset,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};

export default SearchProvider;

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error("useSearch must be used within a SearchProvider");
  }
  return context;
};
