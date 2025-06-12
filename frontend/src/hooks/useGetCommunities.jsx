import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../contexts/authProvider';
import axios from 'axios';

const useGetCommunities = (userId) => {
  const [communities, setCommunities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useAuth();

  const getCommunities = useCallback(async () => {
    if (!userId || !token) return;
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/user/${userId}/communities`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        setCommunities(response.data);
      } else if (response.status === 204) {
        setCommunities([]);
      } else {
        throw new Error('Nieoczekiwany kod statusu odpowiedzi.');
      }
    } catch (err) {
      const errorMessage =
        err.response?.status === 404
          ? 'Użytkownik nie istnieje.'
          : err.response?.data?.error || 'Błąd podczas pobierania społeczności.';
      setError(errorMessage);
      setCommunities([]);
    } finally {
      setIsLoading(false);
    }
  }, [userId, token]);

  useEffect(() => {
    getCommunities();
  }, [getCommunities, userId,token]);

  return { communities, isLoading, error, getCommunities };
};

export default useGetCommunities;