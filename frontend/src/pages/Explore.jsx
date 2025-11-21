import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TrendingUp, Zap, Sparkles, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/api';
import CommunityCard from '../components/CommunityCard';
import PodCard from '../components/PodCard';

export default function Explore() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [trending, setTrending] = useState([]);
  const [activePods, setActivePods] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    } else if (user) {
      fetchData();
    }
  }, [user, authLoading, navigate]);

  const fetchData = async () => {
    try {
      const [trendingRes, podsRes] = await Promise.all([
        api.get('/community/trending'),
        api.get('/pod/active')
      ]);
      setTrending(trendingRes.data.communities);
      setActivePods(podsRes.data.pods);
    } catch (error) {
      console.error('Fetch data error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-5xl font-bold text-gradient mb-6">
              Explore Communities
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Discover trending communities and join live conversations happening right now
            </p>
          </motion.div>
        </div>
      </section>

      {/* Trending Communities */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex items-center justify-between mb-8"
          >
            <div className="flex items-center space-x-3">
              <TrendingUp className="w-8 h-8 text-green-400" />
              <h2 className="text-3xl font-bold text-white">Trending Communities</h2>
              <Sparkles className="w-6 h-6 text-green-400 animate-pulse" />
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/search')}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create New</span>
            </motion.button>
          </motion.div>
          
          {trending.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trending.slice(0, 9).map((community, index) => (
                <motion.div
                  key={community._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <CommunityCard community={community} />
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="text-6xl mb-4">🌟</div>
              <h3 className="text-2xl font-bold text-white mb-2">
                No trending communities yet
              </h3>
              <p className="text-gray-300 mb-6">
                Be the first to create a community and start the trend!
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/search')}
                className="btn-primary"
              >
                Create Community
              </motion.button>
            </motion.div>
          )}
        </div>
      </section>

      {/* Active Pods */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex items-center space-x-3 mb-8"
          >
            <Zap className="w-8 h-8 text-green-400" />
            <h2 className="text-3xl font-bold text-white">Live Pods</h2>
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm text-gray-300">
              {activePods.length} active conversations
            </span>
          </motion.div>
          
          {activePods.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {activePods.slice(0, 12).map((pod, index) => (
                <motion.div
                  key={pod._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                >
                  <PodCard pod={pod} />
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="text-6xl mb-4">💬</div>
              <h3 className="text-2xl font-bold text-white mb-2">
                No active pods right now
              </h3>
              <p className="text-gray-300 mb-6">
                Join a community and start a conversation!
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/search')}
                className="btn-secondary"
              >
                Find Communities
              </motion.button>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}