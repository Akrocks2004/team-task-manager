import {
  FaTasks,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaProjectDiagram,
  FaUsers,
  FaSignOutAlt
} from 'react-icons/fa';
import { Link } from 'react-router-dom';

function Dashboard() {


  const user = JSON.parse(
    localStorage.getItem('user')
  );
  
  

  const handleLogout = () => {

    localStorage.removeItem('token');

    window.location.href = '/';

  };

  return (

    <div className="min-h-screen bg-gray-100 flex">

      {/* Sidebar */}
      <div className="w-72 bg-gradient-to-b from-blue-700 to-indigo-800 text-white p-6 shadow-lg">

        <h1 className="text-3xl font-bold mb-12">
          Team Task Manager
        </h1>

        <ul className="space-y-5">

         <Link to="/dashboard">

  <li className="bg-white/20 p-3 rounded-lg cursor-pointer hover:bg-white/30 transition">
    Dashboard
  </li>

</Link>

{
  user?.role === 'admin' && (

    <Link to="/projects">

      <li className="p-3 rounded-lg cursor-pointer hover:bg-white/20 transition">
        Projects
      </li>

    </Link>

  )
}

          <li className="p-3 rounded-lg cursor-pointer hover:bg-white/20 transition">
            Tasks
          </li>

          <li className="p-3 rounded-lg cursor-pointer hover:bg-white/20 transition">
            Team Members
          </li>

        </ul>

        <button
          onClick={handleLogout}
          className="mt-16 flex items-center gap-3 bg-red-500 hover:bg-red-600 transition px-5 py-3 rounded-lg w-full"
        >

          <FaSignOutAlt />

          Logout

        </button>

      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-10">

          <div>

            <h1 className="text-4xl font-bold text-gray-800">
              Welcome, {user.name} 👋
            </h1>

            <p className="text-gray-500 mt-2">
              Here's your project and task overview
            </p>

          </div>

          <div className="bg-white px-6 py-3 rounded-xl shadow">

            <p className="text-gray-500 text-sm">
              Active Projects
            </p>

            <h2 className="text-2xl font-bold text-blue-600">
              5
            </h2>

          </div>

        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">

          {/* Total Tasks */}
          <div className="bg-white rounded-2xl p-6 shadow hover:shadow-xl transition">

            <div className="flex justify-between items-center">

              <div>

                <p className="text-gray-500">
                  Total Tasks
                </p>

                <h2 className="text-4xl font-bold mt-2">
                  24
                </h2>

              </div>

              <FaTasks className="text-5xl text-blue-500" />

            </div>

          </div>

          {/* Completed */}
          <div className="bg-white rounded-2xl p-6 shadow hover:shadow-xl transition">

            <div className="flex justify-between items-center">

              <div>

                <p className="text-gray-500">
                  Completed
                </p>

                <h2 className="text-4xl font-bold mt-2 text-green-500">
                  12
                </h2>

              </div>

              <FaCheckCircle className="text-5xl text-green-500" />

            </div>

          </div>

          {/* Pending */}
          <div className="bg-white rounded-2xl p-6 shadow hover:shadow-xl transition">

            <div className="flex justify-between items-center">

              <div>

                <p className="text-gray-500">
                  Pending
                </p>

                <h2 className="text-4xl font-bold mt-2 text-yellow-500">
                  8
                </h2>

              </div>

              <FaClock className="text-5xl text-yellow-500" />

            </div>

          </div>

          {/* Overdue */}
          <div className="bg-white rounded-2xl p-6 shadow hover:shadow-xl transition">

            <div className="flex justify-between items-center">

              <div>

                <p className="text-gray-500">
                  Overdue
                </p>

                <h2 className="text-4xl font-bold mt-2 text-red-500">
                  4
                </h2>

              </div>

              <FaExclamationTriangle className="text-5xl text-red-500" />

            </div>

          </div>

        </div>

        {/* Projects & Team */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">

          {/* Recent Projects */}
          <div className="bg-white rounded-2xl p-6 shadow">

            <div className="flex items-center gap-3 mb-6">

              <FaProjectDiagram className="text-blue-500 text-2xl" />

              <h2 className="text-2xl font-bold">
                Recent Projects
              </h2>

            </div>

            <div className="space-y-4">

              <div className="border p-4 rounded-xl hover:bg-gray-50 transition">

                <h3 className="font-semibold text-lg">
                  Team Collaboration App
                </h3>

                <p className="text-gray-500 text-sm mt-1">
                  Deadline: 20 May 2026
                </p>

              </div>

              <div className="border p-4 rounded-xl hover:bg-gray-50 transition">

                <h3 className="font-semibold text-lg">
                  AI Dashboard System
                </h3>

                <p className="text-gray-500 text-sm mt-1">
                  Deadline: 28 May 2026
                </p>

              </div>

            </div>

          </div>

          {/* Team Members */}
          <div className="bg-white rounded-2xl p-6 shadow">

            <div className="flex items-center gap-3 mb-6">

              <FaUsers className="text-indigo-500 text-2xl" />

              <h2 className="text-2xl font-bold">
                Team Members
              </h2>

            </div>

            <div className="space-y-4">

              <div className="flex items-center justify-between border p-4 rounded-xl">

                <div>

                  <h3 className="font-semibold">
                    Alok Kumar
                  </h3>

                  <p className="text-gray-500 text-sm">
                    Admin
                  </p>

                </div>

                <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-sm">
                  Active
                </span>

              </div>

              <div className="flex items-center justify-between border p-4 rounded-xl">

                <div>

                  <h3 className="font-semibold">
                    Team Member
                  </h3>

                  <p className="text-gray-500 text-sm">
                    Developer
                  </p>

                </div>

                <span className="bg-yellow-100 text-yellow-600 px-3 py-1 rounded-full text-sm">
                  Busy
                </span>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>

  );

}

export default Dashboard;