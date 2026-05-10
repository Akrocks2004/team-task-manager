import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

function Login() {

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });

  };

  const handleLogin = async (e) => {

    e.preventDefault();

    setLoading(true);

    try {

      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/auth/login`,
        formData
      );

      localStorage.setItem('token', res.data.token);
      localStorage.setItem(
  'user',
  JSON.stringify(res.data.user)
);

      alert('Login Successful');

      navigate('/dashboard');

    } catch (error) {

      alert(
        error.response?.data?.message || 'Login Failed'
      );

    } finally {

      setLoading(false);

    }

  };

  return (

    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 to-indigo-600 px-4">

      <div className="bg-white shadow-2xl rounded-2xl overflow-hidden flex w-full max-w-4xl">

        {/* Left Section */}
        <div className="hidden md:flex flex-col justify-center items-center bg-blue-600 text-white w-1/2 p-10">

          <h1 className="text-4xl font-bold mb-4">
            Team Task Manager
          </h1>

          <p className="text-center text-lg opacity-90">
            Manage projects, tasks, and teams efficiently with a modern dashboard.
          </p>

        </div>

        {/* Right Section */}
        <div className="w-full md:w-1/2 p-10">

          <h2 className="text-3xl font-bold text-center mb-2">
            Welcome Back
          </h2>

          <p className="text-center text-gray-500 mb-8">
            Login to continue
          </p>

          <form onSubmit={handleLogin}>

            <div className="mb-5">

              <label className="block mb-2 text-gray-700 font-medium">
                Email
              </label>

              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={handleChange}
                required
              />

            </div>

            <div className="mb-6">

              <label className="block mb-2 text-gray-700 font-medium">
                Password
              </label>

              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={handleChange}
                required
              />

            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 transition duration-300 text-white py-3 rounded-lg font-semibold"
            >
              {
                loading
                  ? 'Logging in...'
                  : 'Login'
              }
            </button>

          </form>

          {/* Register Link */}
          <p className="text-center text-gray-600 mt-6">

            Don't have an account?

            <Link
              to="/register"
              className="text-blue-600 font-semibold ml-2 hover:underline"
            >
              Register
            </Link>

          </p>

        </div>

      </div>

    </div>

  );

}

export default Login;