import { useCallback, useState } from 'react';
import axios from 'axios';

const useGetCommunities = (userId) => {
  const [communities, setCommunities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const getAuthConfig = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`, 
    },
  });

  const getCommunities = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/user/${userId}/communities`,
        getAuthConfig()
      );

      if (response.status === 200) {
        setCommunities(response.data);
        console.log('Pobrano społeczności:', response.data);
        return response.data; 
      } else if (response.status === 204) {
        setCommunities([]); 
        return []; 
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
      throw new Error(errorMessage); 
    } finally {
      setIsLoading(false);
    }
  }, [userId]); 

  return { getCommunities, communities, isLoading, error };
};

export default useGetCommunities;