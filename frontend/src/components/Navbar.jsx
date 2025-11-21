import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-indigo-600">
              VibeCircle
            </Link>
          </div>

          {user ? (
            <div className="flex items-center space-x-4">
              <Link to="/search" className="text-gray-700 hover:text-indigo-600">
                Search
              </Link>
              <Link to="/heatmap" className="text-gray-700 hover:text-indigo-600">
                Heatmap
              </Link>
              <Link to="/profile" className="text-gray-700 hover:text-indigo-600">
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link to="/login" className="text-gray-700 hover:text-indigo-600">
                Login
              </Link>
              <Link to="/register" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
