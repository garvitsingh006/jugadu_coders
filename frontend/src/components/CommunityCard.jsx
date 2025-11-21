import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Crown, Eye, EyeOff, MapPin } from 'lucide-react';

export default function CommunityCard({ community }) {
  const gradients = [
    'from-green-500 to-green-600',
    'from-green-400 to-green-700', 
    'from-green-600 to-green-800',
    'from-green-300 to-green-600',
    'from-green-500 to-green-800',
  ];
  
  const gradient = gradients[Math.abs(community.name.charCodeAt(0)) % gradients.length];

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="group"
    >
      <Link to={`/community/${community._id}`}>
        <div className="card group-hover:shadow-2xl group-hover:shadow-primary-500/20 overflow-hidden">
          {/* Header with gradient */}
          <div className={`h-20 bg-gradient-to-r ${gradient} relative overflow-hidden`}>
            <div className="absolute inset-0 bg-black/10" />
            <div className="absolute top-2 right-2">
              {community.visibility === 'private' ? (
                <EyeOff className="w-4 h-4 text-white/80" />
              ) : (
                <Eye className="w-4 h-4 text-white/80" />
              )}
            </div>
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute -bottom-2 -right-2 w-16 h-16 bg-white/10 rounded-full"
            />
          </div>
          
          <div className="p-6 -mt-4 relative">
            {/* Community Avatar */}
            <div className="w-12 h-12 bg-gray-800 border border-gray-700 rounded-xl shadow-lg flex items-center justify-center mb-4 group-hover:animate-bounce-subtle">
              <span className="text-2xl font-bold text-green-400">
                {community.name.charAt(0).toUpperCase()}
              </span>
            </div>
            
            <h3 className="text-xl font-bold text-gray-100 mb-3 group-hover:text-green-400 transition-colors">
              {community.name}
            </h3>
            
            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {community.tags.slice(0, 3).map((tag, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-800 text-green-400 text-xs font-medium px-3 py-1 rounded-full border border-gray-700"
                >
                  #{tag}
                </motion.span>
              ))}
              {community.tags.length > 3 && (
                <span className="text-xs text-gray-500 px-2 py-1">
                  +{community.tags.length - 3} more
                </span>
              )}
            </div>
            
            <p className="text-gray-300 text-sm mb-4 line-clamp-2 leading-relaxed">
              {community.description}
            </p>
            
            {/* Footer */}
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2 text-gray-400">
                <Users className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {community.membersCount ?? 0} members
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                {community.location && (
                  <div className="flex items-center space-x-1 text-gray-500">
                    <MapPin className="w-3 h-3" />
                    <span className="text-xs">{community.location.city}</span>
                  </div>
                )}
                {community.isAdmin && (
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="flex items-center space-x-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs px-2 py-1 rounded-full"
                  >
                    <Crown className="w-3 h-3" />
                    <span>Admin</span>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
