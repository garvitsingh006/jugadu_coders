import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Users, Wifi, Globe } from 'lucide-react';
import { api } from '../api/api';
import CommunityCard from '../components/CommunityCard';
import toast from 'react-hot-toast';

export default function Nearby() {
  const [communities, setCommunities] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState(null);

  useEffect(() => {
    fetchNearbyData();
  }, []);

  const fetchNearbyData = async () => {
    try {
      const response = await api.get('/community/nearby-by-ip');
      setCommunities(response.data.communities || []);
      setUsers(response.data.users || []);
      setLocation(response.data.geo);
    } catch (error) {
      console.error('Fetch nearby error:', error);
      toast.error('Failed to load nearby communities');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full mb-4"
        />
        <div className="text-xl text-slate-600">Finding communities near you...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex justify-center mb-6">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-20 h-20 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center"
            >
              <MapPin className="w-10 h-10 text-white" />
            </motion.div>
          </div>
          <h1 className="text-5xl font-bold text-gradient mb-4">
            Communities Near You
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Discover local communities and connect with people in your area
          </p>
          
          {location && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-6 inline-flex items-center space-x-2 glass px-4 py-2 rounded-full"
            >
              <Wifi className="w-4 h-4 text-primary-600" />
              <span className="text-sm text-slate-600">
                {location.city}, {location.region}
              </span>
            </motion.div>
          )}
        </motion.div>

        {/* Communities Section */}
        <section className="mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-3 mb-8"
          >
            <Users className="w-8 h-8 text-primary-600" />
            <h2 className="text-3xl font-bold text-slate-800">Local Communities</h2>
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="w-6 h-6 text-secondary-500"
            >
              🌟
            </motion.div>
          </motion.div>

          {communities.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {communities.map((community, index) => (
                <motion.div
                  key={community._id}
                  initial={{ opacity: 0, y: 30, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ 
                    delay: 0.1 * index,
                    type: "spring",
                    stiffness: 100
                  }}
                >
                  <CommunityCard community={community} />
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16"
            >
              <div className="text-6xl mb-4">🏘️</div>
              <h3 className="text-2xl font-bold text-slate-700 mb-2">
                No local communities yet
              </h3>
              <p className="text-slate-600 mb-6">
                Be the first to create a community in your area!
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.href = '/search'}
                className="btn-primary"
              >
                Create Community
              </motion.button>
            </motion.div>
          )}
        </section>

        {/* Users Section */}
        {users.length > 0 && (
          <section>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-3 mb-8"
            >
              <Globe className="w-8 h-8 text-secondary-600" />
              <h2 className="text-3xl font-bold text-slate-800">People Nearby</h2>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {users.slice(0, 12).map((user, index) => (
                <motion.div
                  key={user._id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.05 * index }}
                  className="card text-center p-4 hover:scale-105"
                >
                  <div className="w-16 h-16 bg-gradient-to-r from-primary-400 to-secondary-400 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-white font-bold text-lg">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <h4 className="font-semibold text-slate-800 text-sm truncate">
                    {user.name}
                  </h4>
                  {user.campus && (
                    <p className="text-xs text-slate-500 mt-1">{user.campus}</p>
                  )}
                </motion.div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}