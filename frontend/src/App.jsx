import React, { useEffect, useState } from 'react';

export default function App() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('http://localhost:5192/')
      .then((response) => response.json())
      .then((data) => setMessage(data.message))
      .catch((error) => console.error('Error fetching message:', error));
  }, []);

  return (
    <div className="container min-vh-100 d-flex justify-content-center align-items-center">
        <h1>{message || 'Not working...'}</h1>
    </div>
  );
}