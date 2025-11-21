import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Plus, Search, Zap } from 'lucide-react';
import { api } from '../api/api';
import CommunityCard from '../components/CommunityCard';
import toast from 'react-hot-toast';

export default function SearchResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const { query, mode, userLocation } = location.state || {};
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [creatingCommunity, setCreatingCommunity] = useState(false);
  const [aiKeywords, setAiKeywords] = useState([]);

  useEffect(() => {
    if (!query) {
      navigate('/search');
      return;
    }
    performSearch();
  }, [query, mode]);

  const performSearch = async () => {
    try {
      const response = await api.post('/community/search', {
        query,
        mode,
        userLocation
      });
      setResults(response.data);
      setAiKeywords(response.data.aiKeywords || []);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCommunity = async () => {
    if (!results?.suggestion) return;

    setCreatingCommunity(true);
    try {
      const response = await api.post('/community/create', {
        name: results.suggestion.name,
        tags: results.suggestion.tags,
        description: results.suggestion.description,
        visibility: mode,
        location: userLocation ? {
          type: 'Point',
          coordinates: [userLocation.lng, userLocation.lat]
        } : undefined
      });

      toast.success('Community created successfully! 🎉');
      navigate(`/community/${response.data.community._id}`);
    } catch (error) {
      console.error('Create community error:', error);
      toast.error('Failed to create community');
    } finally {
      setCreatingCommunity(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full mb-4"
        />
        <div className="text-xl text-gray-300">AI is searching for perfect matches...</div>
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
          className="mb-8"
        >
          <div className="flex items-center space-x-3 mb-4">
            <Search className="w-8 h-8 text-green-400" />
            <h1 className="text-4xl font-bold text-white">
              Results for <span className="text-gradient">"{query}"</span>
            </h1>
          </div>
          
          {/* AI Keywords */}
          {aiKeywords.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
              className="relative overflow-hidden"
            >
              <div className="card border-2 border-green-500/30 shadow-xl">
                {/* Animated background */}
                <div className="absolute inset-0 bg-gradient-to-r from-green-400/10 to-green-600/10 animate-pulse" />
                <div className="relative z-10">
                  <div className="flex items-center space-x-3 mb-4">
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      className="w-8 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center"
                    >
                      <Zap className="w-4 h-4 text-white" />
                    </motion.div>
                    <div>
                      <h3 className="font-bold text-white text-lg">AI Enhanced Search</h3>
                      <p className="text-sm text-gray-300">Showing communities matching these keywords:</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {aiKeywords.map((keyword, index) => (
                      <motion.span
                        key={index}
                        initial={{ opacity: 0, scale: 0, rotate: -180 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        transition={{ 
                          delay: 0.1 * index,
                          type: "spring",
                          stiffness: 200,
                          damping: 10
                        }}
                        whileHover={{ scale: 1.1, y: -2 }}
                        className="bg-gradient-to-r from-green-500 to-green-600 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition-all cursor-pointer"
                      >
                        {keyword}
                      </motion.span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {results?.found ? (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 80 }}
          >
            <motion.div 
              className="flex items-center justify-center space-x-3 mb-8 p-6 card border-2 border-green-500/30"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring", stiffness: 150 }}
            >
              <motion.div
                animate={{ rotate: [0, 360], scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="w-8 h-8 text-green-400" />
              </motion.div>
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gradient mb-1">
                  {results.communities.length} Perfect Matches Found!
                </h2>
                <p className="text-gray-300">Communities that match your interests</p>
              </div>
              <motion.div
                animate={{ bounce: [0, -10, 0] }}
                transition={{ duration: 1, repeat: Infinity, delay: 1 }}
                className="text-3xl"
              >
                🎉
              </motion.div>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {results.communities.map((community, index) => (
                <motion.div
                  key={community._id}
                  initial={{ opacity: 0, y: 50, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ 
                    delay: 0.6 + (0.15 * index),
                    type: "spring",
                    stiffness: 100,
                    damping: 15
                  }}
                  whileHover={{ y: -10, scale: 1.02 }}
                >
                  <CommunityCard community={community} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 80 }}
          >
            <motion.div 
              className="card border-2 border-yellow-500/30 mb-8 relative overflow-hidden"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring", stiffness: 120 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 animate-pulse" />
              <div className="relative z-10">
                <div className="flex items-center space-x-4 mb-4">
                  <motion.div
                    animate={{ rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center"
                  >
                    <Search className="w-6 h-6 text-white" />
                  </motion.div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-1">
                      No Perfect Matches Yet
                    </h3>
                    <p className="text-gray-300">
                      But we found some similar communities, or you can create your own!
                    </p>
                  </div>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="text-2xl"
                  >
                    🔍
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {results?.communities && results.communities.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mb-8"
              >
                <motion.h4 
                  className="text-lg font-semibold text-white mb-4 flex items-center space-x-2"
                  initial={{ x: -20 }}
                  animate={{ x: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <span>Similar Communities:</span>
                  <motion.span
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    ✨
                  </motion.span>
                </motion.h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {results.communities.map((community, index) => (
                    <motion.div
                      key={community._id}
                      initial={{ opacity: 0, y: 30, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ 
                        delay: 0.8 + (0.1 * index),
                        type: "spring",
                        stiffness: 120
                      }}
                    >
                      <CommunityCard community={community} />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {results?.suggestion && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="card border border-green-500/30"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <Sparkles className="w-6 h-6 text-green-400" />
                  <h3 className="text-xl font-bold text-white">
                    AI Suggestion: Create Your Community
                  </h3>
                </div>
                <div className="mb-6">
                  <h4 className="text-2xl font-bold text-white mb-3">
                    {results.suggestion.name}
                  </h4>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {results.suggestion.tags.map((tag, index) => (
                      <motion.span
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 * index }}
                        className="bg-green-500/20 text-green-400 text-sm font-medium px-3 py-1 rounded-full border border-green-500/30"
                      >
                        #{tag}
                      </motion.span>
                    ))}
                  </div>
                  <p className="text-gray-300 leading-relaxed">{results.suggestion.description}</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCreateCommunity}
                  disabled={creatingCommunity}
                  className="btn-primary flex items-center space-x-2 disabled:opacity-50"
                >
                  {creatingCommunity ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    />
                  ) : (
                    <Plus className="w-5 h-5" />
                  )}
                  <span>{creatingCommunity ? 'Creating...' : 'Create This Community'}</span>
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
