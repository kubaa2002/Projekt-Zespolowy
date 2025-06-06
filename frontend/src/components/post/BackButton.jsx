import React from 'react';



const BackButton = () => {


  const handleBack = () => {
    window.history.back(); 
  };

  return (
    <button onClick={handleBack} className="btn btn-outline-secondary w-100 btn-deny">
      Wstecz
    </button>
  );
};

export default BackButton;