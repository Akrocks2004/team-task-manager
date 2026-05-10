import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

function Register() {

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'member'
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });

  };

  const handleRegister = async (e) => {

    e.preventDefault();

    setLoading(true);

    try {

      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/auth/signup`,
        formData
      );

      alert('Registration Successful');

      navigate('/');

    } catch (error) {

      alert(
        error.response?.data?.message || 'Registration Failed'
      );

    } finally {

      setLoading(false);

    }

  };

  return (

    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-green-500 to-emerald-600 px-4">

      <div className="bg-white shadow-2xl rounded-2xl overflow-hidden flex w-full max-w-4xl">

        {/* Left Section */}
        <div className="hidden md:flex flex-col justify-center items-center bg-green-600 text-white w-1/2 p-10">

          <h1 className="text-4xl font-bold mb-4">
            Join Team Task Manager
          </h1>

          <p className="text-center text-lg opacity-90">
            Create your account and start managing tasks, projects, and teams efficiently.
          </p>

        </div>

        {/* Right Section */}
        <div className="w-full md:w-1/2 p-10">

          <h2 className="text-3xl font-bold text-center mb-2">
            Create Account
          </h2>

          <p className="text-center text-gray-500 mb-8">
            Register to continue
          </p>

          <form onSubmit={handleRegister}>

            <div className="mb-4">

              <label className="block mb-2 text-gray-700 font-medium">
                Full Name
              </label>

              <input
                type="text"
                name="name"
                placeholder="Enter your full name"
                className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                onChange={handleChange}
                required
              />

            </div>

            <div className="mb-4">

              <label className="block mb-2 text-gray-700 font-medium">
                Email
              </label>

              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                onChange={handleChange}
                required
              />

            </div>

            <div className="mb-4">

              <label className="block mb-2 text-gray-700 font-medium">
                Password
              </label>

              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                onChange={handleChange}
                required
              />

            </div>

            <div className="mb-6">

              <label className="block mb-2 text-gray-700 font-medium">
                Role
              </label>

              <select
                name="role"
                className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                onChange={handleChange}
              >
                <option value="member">
                  Member
                </option>

                <option value="admin">
                  Admin
                </option>
              </select>

            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 transition duration-300 text-white py-3 rounded-lg font-semibold"
            >
              {
                loading
                  ? 'Creating Account...'
                  : 'Register'
              }
            </button>

          </form>

          {/* Login Link */}
          <p className="text-center text-gray-600 mt-6">

            Already have an account?

            <Link
              to="/"
              className="text-green-600 font-semibold ml-2 hover:underline"
            >
              Login
            </Link>

          </p>

        </div>

      </div>

    </div>

  );

}

export default Register;