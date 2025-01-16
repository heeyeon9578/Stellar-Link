'use client';
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-transparent text-white py-4 ">
      <div className="container mx-auto text-center">
        <p>&copy; {new Date().getFullYear()} My Website. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
