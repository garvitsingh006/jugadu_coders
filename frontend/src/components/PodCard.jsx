import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { Users, Clock, Zap, MessageCircle } from 'lucide-react';

export default function PodCard({ pod }) {
  const timeLeft = formatDistanceToNow(new Date(pod.expiresAt), { addSuffix: true });
  
  const podTypes = {
    chat: { icon: MessageCircle, color: 'from-green-500 to-green-600', bg: 'bg-green-50' },
    voice: { icon: Zap, color: 'from-green-400 to-green-700', bg: 'bg-green-50' },
    video: { icon: Users, color: 'from-green-600 to-green-800', bg: 'bg-green-50' },
  };
  
  const podConfig = podTypes[pod.type] || podTypes.chat;
  const Icon = podConfig.icon;

  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -5 }}
      whileTap={{ scale: 0.95 }}
      className="group"
    >
      <Link to={`/pod/${pod._id}`}>
        <div className="card group-hover:shadow-xl group-hover:shadow-primary-500/10 relative overflow-hidden">
          {/* Live indicator */}
          <div className="absolute top-3 right-3 flex items-center space-x-1">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-2 h-2 bg-green-500 rounded-full"
            />
            <span className="text-xs font-medium text-green-400 bg-green-500/20 px-2 py-1 rounded-full">
              Live
            </span>
          </div>
          
          {/* Pod type icon */}
          <div className={`w-12 h-12 bg-gradient-to-r ${podConfig.color} rounded-xl flex items-center justify-center mb-4 group-hover:animate-bounce-subtle`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          
          <h4 className="font-bold text-gray-100 mb-2 group-hover:text-green-400 transition-colors">
            {pod.title || `${pod.type.charAt(0).toUpperCase() + pod.type.slice(1)} Pod`}
          </h4>
          
          <p className="text-sm text-gray-400 mb-4 font-medium">
            {pod.communityId?.name || 'Community'}
          </p>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-1 text-gray-400">
                <Users className="w-3 h-3" />
                <span className="font-medium">{pod.members.length} active</span>
              </div>
              <div className="flex items-center space-x-1 text-gray-500">
                <Clock className="w-3 h-3" />
                <span>Expires {timeLeft}</span>
              </div>
            </div>
            
            {/* Progress bar for time remaining */}
            <div className="w-full bg-gray-700 rounded-full h-1.5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '70%' }}
                transition={{ duration: 1, delay: 0.2 }}
                className="bg-gradient-to-r from-green-500 to-green-600 h-1.5 rounded-full"
              />
            </div>
          </div>
          
          {/* Hover effect overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/0 to-green-600/0 group-hover:from-green-500/5 group-hover:to-green-600/5 transition-all duration-300 rounded-2xl" />
        </div>
      </Link>
    </motion.div>
  );
}
