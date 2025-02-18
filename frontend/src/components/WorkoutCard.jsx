import React from "react";

const WorkoutCard = ({ title, description, emoji, onClick }) => {
  return (
    <div
      className="flex flex-col items-center justify-center bg-gray-800 rounded-2xl p-6 text-white shadow-lg transition-transform transform hover:scale-105 cursor-pointer"
      onClick={onClick}
    >
      <span className="text-5xl">{emoji}</span>
      <h2 className="text-2xl font-bold mt-3">{title}</h2>
      <p className="text-gray-300 text-center mt-2">{description}</p>
    </div>
  );
};

export default WorkoutCard;
