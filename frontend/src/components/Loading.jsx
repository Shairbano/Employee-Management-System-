import React from 'react';

const Loading = () => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-gray-900 z-50">
      <div className="relative flex items-center justify-center">
        <div className="w-24 h-24 sm:w-28 sm:h-28 border-4 border-transparent border-t-teal-500 border-b-teal-500 rounded-full animate-spin"></div>
        <div className="absolute w-24 h-24 sm:w-28 sm:h-28 border-4 border-gray-700 rounded-full"></div>
        <div className="absolute font-black text-xl sm:text-2xl text-white tracking-widest animate-pulse">
          EMS
        </div>
      </div>
      <p className="mt-6 text-teal-500 font-medium tracking-widest uppercase text-xs animate-bounce">
        Initializing System...
      </p>
    </div>
  );
};

export default Loading;