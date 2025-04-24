import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [message, setMessage] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('http://localhost:5192/')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Nie udało się pobrać wiadomości z backendu.');
        }
        return response.text();
      })
      .then((data) => setMessage(data))
      .catch((error) => {
        console.error('Error fetching message:', error);
        setError('Nie udało się pobrać wiadomości z backendu.');
      });
  }, []);

  return (
    <>
      <h1>TEST TEST TEST</h1>
    </>
  )
}

export default App;