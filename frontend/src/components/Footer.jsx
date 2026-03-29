import React from 'react';
import { useLocation } from 'react-router-dom';

const Footer = () => {
  const location = useLocation();

  // Conditionally hide footer on Home, Login and other pages, explicitly keeping it for auctions
  if (location.pathname !== '/auctions') {
    return null;
  }

  return (
    <footer className="glassmorphism mt-auto mt-20 p-6 md:p-8 flex flex-col items-center justify-center text-gray-300 text-sm space-y-4">
      <div className="flex gap-4 items-center">
        <p className="font-semibold text-white tracking-wide opacity-90">
          Developed by
          <span className="text-blue-400 ml-2">Your Name</span>
        </p>
        <span className="w-1.5 h-1.5 rounded-full bg-gray-500 hidden md:block"></span>
        <p className="tracking-wider">IIT Patna</p>
      </div>
      
      <p className="opacity-75 text-xs text-center">
        &copy; {new Date().getFullYear()} Campus Kart. Exclusive marketplace for IITP students.
      </p>
    </footer>
  );
};

export default Footer;
