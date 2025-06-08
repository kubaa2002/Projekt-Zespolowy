import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../contexts/authProvider';
import axios from 'axios';

const useGetFollowingUsers = (userId) => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  const getFollwingUsers = useCallback(async () => {
    if (!userId || !token) return;
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/user/${userId}/follows`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        setUsers(response.data);
      } else if (response.status === 204) {
        setUsers([]);
      } else {
        throw new Error('Nieoczekiwany kod statusu odpowiedzi.');
      }
    } catch (err) {
      const errorMessage =
        err.response?.status === 404
          ? 'Użytkownik nie istnieje.'
          : err.response?.data?.error || 'Błąd podczas pobierania społeczności.';
      setError(errorMessage);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, [userId, token]);

  useEffect(() => {
    getFollwingUsers();
  }, [getFollwingUsers, userId,token]);

  return { users, isLoading, error };
};

export default useGetFollowingUsers;