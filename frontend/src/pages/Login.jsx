import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch ,useSelector} from "react-redux"; // Importing useDispatch
import { login } from "../../redux/userSlice.js"; // Import the login action

const Login = () => {
    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const navigate = useNavigate();
    

    const dispatch = useDispatch(); // Initialize the dispatch function

    const fetchAPI = async (endpoint, method = "GET", body = null, token = null) => {
        const API_BASE_URL = "http://localhost:8000/api"; // Update if deployed
        const options = {
            method,
            headers: { "Content-Type": "application/json" },
            credentials: "include",
        };

        if (token) {
            options.headers["Authorization"] = `Bearer ${token}`;
        }
        if (body) {
            options.body = JSON.stringify(body);
        }

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || "Request failed");
            }
            console.log(data);
            return data;
        } catch (error) {
            return { message: error.message || "Network error" };
        }
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        const data = await fetchAPI("/auth/login", "POST", form);

        if (data.token) {
            // Save the token to localStorage
            localStorage.setItem("token", data.token);

            // Dispatch the login action to Redux with user data
            dispatch(
                login({
                    token: data.token,
                    user: data.user, // Assuming the user object is returned from the API
                })
            );

            // Redirect to dashboard or home page
            navigate("/");
        } else {
            setError(data.message || "Login failed");
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white px-4">
            {/* Form Container */}
            <div className="bg-gray-800 shadow-xl rounded-lg p-8 w-full max-w-md border border-gray-700">
                <h2 className="text-3xl font-extrabold text-center text-white mb-6">
                    Welcome Back
                </h2>

                {error && <p className="text-red-500 text-center mb-4">{error}</p>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-300 font-semibold">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            placeholder="Enter your email"
                            onChange={handleChange}
                            required
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none bg-gray-700 text-white placeholder-gray-400"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-300 font-semibold">Password</label>
                        <input
                            type="password"
                            name="password"
                            placeholder="Enter your password"
                            onChange={handleChange}
                            required
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none bg-gray-700 text-white placeholder-gray-400"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-500 transition-all text-white font-bold py-3 rounded-lg"
                    >
                        Log In
                    </button>
                </form>

                <p className="text-gray-300 text-center mt-4">
                    Don't have an account?
                    <span
                        className="text-blue-400 hover:underline cursor-pointer font-semibold"
                        onClick={() => navigate("/signup")}
                    > Sign up</span>
                </p>
            </div>
        </div>
    );
};

export default Login;
