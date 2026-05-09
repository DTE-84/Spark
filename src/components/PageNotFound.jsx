import React from 'react';
import { Link } from 'react-router-dom';

const PageNotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-5 text-center">
      <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
      <p className="text-xl mb-8">Oops! The page you're looking for doesn't exist.</p>
      <Link 
        to="/" 
        className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-semibold transition-all hover:opacity-90"
      >
        Go Home
      </Link>
    </div>
  );
};

export default PageNotFound;
