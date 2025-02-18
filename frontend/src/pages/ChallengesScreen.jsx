import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux"; // Import useSelector
import WorkoutCard from "../components/WorkoutCard";

const ChallengesScreen = () => {
  const navigate = useNavigate();
  
  // Access the user state from Redux store
  const user = useSelector((state) => state.user); // Assuming 'user' is the part of the Redux state

  const challenges = [
    { title: "Squat Master", description: "Complete 10 Squats!", emoji: "🏋️", path: "squat-counter", goal: 10 },
    { title: "Pushup Beast", description: "Do 20 Pushups!", emoji: "💪", path: "pushup-counter", goal: 20 },
    { title: "Core Crusher", description: "Finish 15 Crunches!", emoji: "🤸", path: "crunches-counter", goal: 15 },
    { title: "Endurance King", description: "Do 50 Squats!", emoji: "🔥", path: "squat-counter", goal: 50 },
    { title: "Iron Chest", description: "Complete 50 Pushups!", emoji: "💪", path: "pushup-counter", goal: 50 },
    { title: "Abs of Steel", description: "Finish 30 Crunches!", emoji: "🏆", path: "crunches-counter", goal: 30 },
  ];

  const handleChallengeClick = (exercise, goal) => {
    navigate(`/${exercise}`, { state: { challengeMode: true, goal } });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-gray-950 via-gray-900 to-gray-950 text-white px-4">
      <h1 className="text-5xl md:text-6xl font-extrabold text-center mt-10">
        "Crush Your Limits!"
      </h1>
      <p className="text-lg md:text-xl text-gray-400 text-center mt-2">
        Choose a challenge and push yourself to the max!
      </p>

      {/* Conditionally render based on user login status */}
      {!user || !user.token ? (
        <div className="text-center text-gray-400 mt-6">
          <p>Please log in to participate in challenges.</p>
          <button
            onClick={() => navigate("/login")}
            className="mt-4 text-blue-500 hover:underline"
          >
            Log In
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-8">
          {challenges.map((challenge, index) => (
            <WorkoutCard
              key={index}
              title={challenge.title}
              description={challenge.description}
              emoji={challenge.emoji}
              onClick={() => handleChallengeClick(challenge.path, challenge.goal)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ChallengesScreen;
