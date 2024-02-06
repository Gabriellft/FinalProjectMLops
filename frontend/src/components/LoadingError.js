// components/LoadingError.js
import React from 'react';

const LoadingError = ({ message }) => {
  return (
    <div className="loading-error">
      <p>{message}</p>
    </div>
  );
};

export default LoadingError;
