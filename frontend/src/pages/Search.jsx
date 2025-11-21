import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Globe, MapPin, Sparkles, Users, Zap } from 'lucide-react';
import SearchBar from '../components/SearchBar';
import { useGeolocation } from '../hooks/useGeolocation';

export default function Search() {
  const navigate = useNavigate();
  const { location } = useGeolocation();
  const [mode, setMode] = useState('global');

  const handleSearch = (query) => {
    navigate('/search-result', { 
      state: { query, mode, userLocation: location }
    });
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex justify-center mb-6">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="w-20 h-20 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center"
            >
              <Sparkles className="w-10 h-10 text-white" />
            </motion.div>
          </div>
          <h1 className="text-5xl font-bold text-gradient mb-4">
            Find Your Tribe
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            AI-powered community discovery that connects you with like-minded people
          </p>
        </motion.div>

        {/* Search Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          {/* Mode Toggle */}
          <div className="flex justify-center mb-8">
            <div className="glass rounded-2xl p-2 flex space-x-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setMode('global')}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all ${
                  mode === 'global'
                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg'
                    : 'text-gray-300 hover:bg-gray-700/50'
                }`}
              >
                <Globe className="w-5 h-5" />
                <span>Global</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setMode('local')}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all ${
                  mode === 'local'
                    ? 'bg-gradient-to-r from-green-400 to-green-700 text-white shadow-lg'
                    : 'text-gray-300 hover:bg-gray-700/50'
                }`}
              >
                <MapPin className="w-5 h-5" />
                <span>Nearby</span>
              </motion.button>
            </div>
          </div>
          
          <SearchBar onSearch={handleSearch} />
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card border border-green-500/30"
        >
          <div className="flex items-center space-x-3 mb-6">
            <Zap className="w-6 h-6 text-green-400" />
            <h3 className="text-xl font-bold text-white">AI-Powered Discovery</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0 border border-green-500/30">
                <Sparkles className="w-4 h-4 text-green-400" />
              </div>
              <div>
                <h4 className="font-semibold text-white mb-1">Smart Keyword Expansion</h4>
                <p className="text-gray-300 text-sm">AI generates related keywords to find communities you might have missed</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0 border border-green-500/30">
                <Users className="w-4 h-4 text-green-400" />
              </div>
              <div>
                <h4 className="font-semibold text-white mb-1">Perfect Matches</h4>
                <p className="text-gray-300 text-sm">Advanced matching algorithm finds communities that align with your interests</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0 border border-green-500/30">
                <Globe className="w-4 h-4 text-green-400" />
              </div>
              <div>
                <h4 className="font-semibold text-white mb-1">Global & Local</h4>
                <p className="text-gray-300 text-sm">Discover communities worldwide or find local groups in your area</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0 border border-green-500/30">
                <Zap className="w-4 h-4 text-green-400" />
              </div>
              <div>
                <h4 className="font-semibold text-white mb-1">Live Conversations</h4>
                <p className="text-gray-300 text-sm">Join active pods for real-time discussions and networking</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
