import React from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux"; // Import useSelector

const LeaderboardScreen = () => {
  const navigate = useNavigate();

  // Access the user state from Redux store
  const user = useSelector((state) => state.user); // Assuming 'user' is the part of the Redux state

  // Dummy leaderboard data
  const leaderboardData = [
    { sequence: 1, name: "Alice", points: 120 },
    { sequence: 2, name: "Bob", points: 100 },
    { sequence: 3, name: "Charlie", points: 90 },
    { sequence: 4, name: "Dave", points: 85 },
    { sequence: 5, name: "Eve", points: 80 },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white px-4">
      <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-10">
        Leaderboard: "Compete, Push Limits, Win!"
      </h1>

      {/* Conditionally render based on user login status */}
      {!user || !user.token ? (
        <div className="text-center text-gray-400 mt-6">
          <p>Please log in to view the leaderboard.</p>
          <button
            onClick={() => navigate("/login")}
            className="mt-4 text-blue-500 hover:underline"
          >
            Log In
          </button>
        </div>
      ) : (
        // Leaderboard Table
        <div className="w-full max-w-4xl bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <table className="w-full table-auto text-center text-white">
            <thead>
              <tr className="bg-gray-700">
                <th className="px-4 py-2 text-xl">#</th>
                <th className="px-4 py-2 text-xl">Name</th>
                <th className="px-4 py-2 text-xl">Points</th>
              </tr>
            </thead>
            <tbody>
              {leaderboardData.map((player, index) => (
                <tr key={index} className={`bg-gray-${index % 2 === 0 ? "700" : "600"}`}>
                  <td className="px-4 py-2 text-lg">{player.sequence}</td>
                  <td className="px-4 py-2 text-lg">{player.name}</td>
                  <td className="px-4 py-2 text-lg">{player.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Button to go back to HomeScreen */}
      <button
        onClick={() => navigate("/")}
        className="mt-6 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full text-white text-lg font-bold hover:bg-gradient-to-l"
      >
        Back to Home
      </button>
    </div>
  );
};

export default LeaderboardScreen;
