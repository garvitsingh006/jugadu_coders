import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, MessageCircle, Users, Gamepad2, BookOpen, Plus } from 'lucide-react';
import { api } from '../api/api';
import { useGeolocation } from '../hooks/useGeolocation';
import toast from 'react-hot-toast';

export default function CreatePod() {
  const { communityId } = useParams();
  const navigate = useNavigate();
  const { location } = useGeolocation();
  const [formData, setFormData] = useState({
    type: 'chat',
    title: '',
    duration: 2
  });
  const [loading, setLoading] = useState(false);

  const podTypes = {
    chat: { icon: MessageCircle, label: 'Chat', color: 'from-blue-500 to-cyan-500' },
    hangout: { icon: Users, label: 'Hangout', color: 'from-purple-500 to-pink-500' },
    study: { icon: BookOpen, label: 'Study Session', color: 'from-green-500 to-emerald-500' },
    game: { icon: Gamepad2, label: 'Game', color: 'from-orange-500 to-red-500' },
    other: { icon: Plus, label: 'Other', color: 'from-gray-500 to-slate-500' }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/pod/create', {
        communityId,
        ...formData,
        location: location ? {
          type: 'Point',
          coordinates: [location.lng, location.lat]
        } : undefined
      });

      toast.success('Pod created successfully! 🎉');
      navigate(`/pod/${response.data.pod._id}`);
    } catch (error) {
      console.error('Create pod error:', error);
      toast.error('Failed to create pod');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gradient mb-4">Create a New Pod</h1>
          <p className="text-slate-600">Start a live conversation space for your community</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="card"
        >
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Pod Type Selection */}
            <div>
              <label className="block text-lg font-semibold text-slate-800 mb-4">
                Pod Type
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(podTypes).map(([type, config]) => {
                  const Icon = config.icon;
                  return (
                    <motion.button
                      key={type}
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setFormData({ ...formData, type })}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        formData.type === type
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-slate-200 hover:border-primary-300'
                      }`}
                    >
                      <div className={`w-12 h-12 bg-gradient-to-r ${config.color} rounded-lg flex items-center justify-center mx-auto mb-2`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-sm font-medium text-slate-700">{config.label}</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-lg font-semibold text-slate-800 mb-3">
                Title (Optional)
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="input-field"
                placeholder="Give your pod a catchy title..."
              />
            </div>

            {/* Duration */}
            <div>
              <label className="block text-lg font-semibold text-slate-800 mb-3">
                Duration
              </label>
              <div className="flex items-center space-x-4">
                <Clock className="w-6 h-6 text-primary-600" />
                <div className="flex-1">
                  <input
                    type="range"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    min="1"
                    max="12"
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div className="flex justify-between text-sm text-slate-500 mt-1">
                    <span>1h</span>
                    <span>6h</span>
                    <span>12h</span>
                  </div>
                </div>
                <div className="bg-primary-100 px-4 py-2 rounded-lg">
                  <span className="text-primary-700 font-bold">{formData.duration}h</span>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex space-x-4 pt-4">
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mx-auto"
                  />
                ) : (
                  'Create Pod'
                )}
              </motion.button>
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(-1)}
                className="px-8 py-3 border-2 border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 font-medium transition-colors"
              >
                Cancel
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
