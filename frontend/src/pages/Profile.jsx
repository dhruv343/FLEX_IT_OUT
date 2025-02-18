import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const ProfilePage = () => {
  // Access user data from Redux store
  const user = useSelector((state) => state.user.user);
  const navigate = useNavigate();

  // If user data is not available (not logged in), redirect to login page
  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white px-4">
        <p className="text-xl">Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white px-4">
      {/* Profile Section */}
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full md:w-2/3 max-w-3xl">
        <div className="flex items-center justify-center mb-6">
          {/* Profile Picture or Initial */}
          <div className="w-24 h-24 flex items-center justify-center bg-blue-600 text-white rounded-full text-4xl font-bold mr-6">
            {user.name.charAt(0).toUpperCase()}
          </div>

          <div>
            <h2 className="text-3xl font-semibold">{user.name}</h2>
            <p className="text-xl text-gray-400">{user.email}</p>
          </div>
        </div>

        {/* User Details */}
        <div className="mt-6 text-lg space-y-4">
          <div>
            <span className="font-semibold">Full Name:</span> {user.name}
          </div>
          <div>
            <span className="font-semibold">Email:</span> {user.email}
          </div>
          {/* You can add more user data here (e.g., phone number, bio, etc.) */}
        </div>

        {/* Logout Button */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => navigate("/login")}
            className="bg-blue-600 text-white px-6 py-2 rounded-md shadow-lg hover:bg-blue-500"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
