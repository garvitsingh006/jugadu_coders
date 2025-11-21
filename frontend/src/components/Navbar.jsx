import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Search, Map, User, LogOut, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsOpen(false);
  };

  const navItems = [
    { to: '/search', label: 'Search', icon: Search },
    { to: '/nearby', label: 'Nearby', icon: Map },
    { to: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="glass-dark sticky top-0 z-50 border-b border-slate-700/50 backdrop-blur-xl"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gradient">
                VibeCircle
              </span>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          {user ? (
            <div className="hidden md:flex items-center space-x-6">
              {navItems.map(({ to, label, icon: Icon }) => (
                <motion.div key={to} whileHover={{ y: -2 }} whileTap={{ y: 0 }}>
                  <Link
                    to={to}
                    className="flex items-center space-x-2 text-gray-300 hover:text-green-400 transition-colors duration-200 font-medium"
                  >
                    <Icon className="w-4 h-4" />
                    <span>{label}</span>
                  </Link>
                </motion.div>
              ))}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="flex items-center space-x-2 btn-primary"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </motion.button>
            </div>
          ) : (
            <div className="hidden md:flex items-center space-x-4">
              <motion.div whileHover={{ y: -2 }} whileTap={{ y: 0 }}>
                <Link
                  to="/login"
                  className="text-slate-600 hover:text-primary-600 transition-colors duration-200 font-medium"
                >
                  Login
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/register" className="btn-primary">
                  Register
                </Link>
              </motion.div>
            </div>
          )}

          {/* Mobile Menu Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-white/20 transition-colors"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-dark border-t border-white/10"
          >
            <div className="px-4 py-6 space-y-4">
              {user ? (
                <>
                  {navItems.map(({ to, label, icon: Icon }) => (
                    <motion.div
                      key={to}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                    >
                      <Link
                        to={to}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center space-x-3 text-gray-200 hover:text-green-400 transition-colors duration-200 py-2"
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{label}</span>
                      </Link>
                    </motion.div>
                  ))}
                  <motion.button
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    onClick={handleLogout}
                    className="flex items-center space-x-3 text-red-400 hover:text-red-300 transition-colors duration-200 py-2 w-full"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Logout</span>
                  </motion.button>
                </>
              ) : (
                <>
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    <Link
                      to="/login"
                      onClick={() => setIsOpen(false)}
                      className="block text-gray-200 hover:text-green-400 transition-colors duration-200 py-2 font-medium"
                    >
                      Login
                    </Link>
                  </motion.div>
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Link
                      to="/register"
                      onClick={() => setIsOpen(false)}
                      className="block btn-primary w-full text-center"
                    >
                      Register
                    </Link>
                  </motion.div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
