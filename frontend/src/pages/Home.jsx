import React from "react";
import { useNavigate } from "react-router-dom";
import WorkoutCard from "../components/WorkoutCard";

const HomeScreen = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white px-4">
      {/* Motivational Text */}
      <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-10">
        "Train Hard, Stay Strong, Conquer Yourself!"
      </h1>

      {/* Workout Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <WorkoutCard
          title="Squat Counter"
          description="Track your squats and build stronger legs!"
          emoji="🏋️"
          onClick={() => navigate("/squat-counter")}
        />
        <WorkoutCard
          title="Pushup Counter"
          description="Push your limits and gain upper body strength!"
          emoji="💪"
          onClick={() => navigate("/pushup-counter")}
        />
        <WorkoutCard
          title="Crunches Counter"
          description="Sculpt your abs with consistent crunches!"
          emoji="🤸"
          onClick={() => navigate("/crunches-counter")}
        />
      </div>
    </div>
  );
};

export default HomeScreen;
