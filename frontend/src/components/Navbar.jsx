import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiMenu, FiX } from "react-icons/fi";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../redux/userSlice.js";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const user = useSelector((state) => state.user.user); // Access the user data from Redux
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Handle logout functionality
  const handleLogout = () => {
    dispatch(logout()); // Dispatch logout action to clear user data
    localStorage.removeItem("token"); // Remove token if stored in localStorage
    navigate("/login"); // Redirect to the login page after logout
  };

  // Get the first letter of the user's name
  const userInitial = user ? user.name.charAt(0).toUpperCase() : "";

  return (
    <nav className="bg-blue-600 text-white p-4">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">FLEX-IT-OUT</Link>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-2xl"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <FiX /> : <FiMenu />}
        </button>

        {/* Desktop Menu */}
        <ul className="hidden md:flex space-x-6">
          <li><Link to="/" className="hover:text-gray-200">Home</Link></li>
          <li><Link to="/challenges" className="hover:text-gray-200">Challenges</Link></li>
          <li><Link to="/leaderboard" className="hover:text-gray-200">Leaderboard</Link></li>
        </ul>

        {/* Auth Buttons or Profile */}
        <div className="hidden md:flex space-x-4 items-center">
          {user ? (
            <>
              <Link to="/profile" className="flex items-center text-white">
                {/* Display the first letter of the user's name inside a circle */}
                <div className="w-8 h-8 flex items-center justify-center bg-blue-500 text-white rounded-full mr-2 text-xl">
                  {userInitial}
                </div>
                {user.name} {/* Display full user name */}
              </Link>
              <button
                onClick={handleLogout}
                className="bg-white text-blue-600 px-4 py-2 rounded-md hover:bg-gray-100"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="bg-white text-blue-600 px-4 py-2 rounded-md hover:bg-gray-100">Login</Link>
              <Link to="/signup" className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600">Signup</Link>
            </>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <ul className="md:hidden flex flex-col items-center bg-blue-700 py-4 space-y-4">
          <li><Link to="/" className="text-white py-2 text-xl" onClick={() => setMenuOpen(false)}>Home</Link></li>
          <li><Link to="/challenges" className="text-white py-2 text-xl" onClick={() => setMenuOpen(false)}>Challenges</Link></li>
          <li><Link to="/leaderboard" className="text-white py-2 text-xl" onClick={() => setMenuOpen(false)}>Leaderboard</Link></li>
          {user ? (
            <>
              <li>
                <button
                  onClick={handleLogout}
                  className="text-white py-2 text-xl w-full text-left pl-4"
                  onClick={() => setMenuOpen(false)}
                >
                  Logout
                </button>
              </li>
              <li><Link to="/profile" className="text-white py-2 text-xl" onClick={() => setMenuOpen(false)}>Profile</Link></li>
            </>
          ) : (
            <>
              <li><Link to="/login" className="text-white py-2 text-xl" onClick={() => setMenuOpen(false)}>Login</Link></li>
              <li><Link to="/signup" className="text-white py-2 text-xl" onClick={() => setMenuOpen(false)}>Signup</Link></li>
            </>
          )}
        </ul>
      )}
    </nav>
  );
};

export default Navbar;
