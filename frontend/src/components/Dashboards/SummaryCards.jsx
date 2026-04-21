import React from 'react';

const SummaryCards = ({ icon, text, number, color, pendingNumber }) => {
  return (
    <div className="flex bg-white rounded-lg shadow-md overflow-hidden relative">
      {/* Icon section */}
      <div className={`text-3xl flex justify-center items-center ${color} text-white px-4`}>
        {icon}
      </div>

      {/* Text section */}
      <div className="pl-4 py-2 flex flex-col justify-center">
        <p className="text-lg font-semibold text-gray-600">{text}</p>
        <div className="flex items-baseline gap-2">
          <p className="text-2xl font-bold text-gray-800">{number}</p>
          
          {/* Conditional Pending Count badge */}
          {pendingNumber > 0 && (
            <span className="text-xs font-bold px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full border border-yellow-200 animate-pulse">
              {pendingNumber} Pending
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default SummaryCards;