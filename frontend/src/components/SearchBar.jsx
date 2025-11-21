import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Sparkles, X } from 'lucide-react';

export default function SearchBar({ onSearch, placeholder = "Search communities..." }) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
    }
  };

  const clearSearch = () => {
    setQuery('');
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="w-full max-w-2xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="relative group">
        {/* Search Icon */}
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-green-500 transition-colors" />
        
        {/* Input Field */}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="w-full pl-12 pr-24 py-4 text-lg glass rounded-2xl border-2 border-transparent focus:border-green-500 focus:ring-4 focus:ring-green-500/20 transition-all duration-300 placeholder-gray-400"
        />
        
        {/* Clear Button */}
        {query && (
          <motion.button
            type="button"
            onClick={clearSearch}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute right-16 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-gray-700 transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </motion.button>
        )}
        
        {/* Search Button */}
        <motion.button
          type="submit"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 btn-primary px-4 py-2 flex items-center space-x-2"
        >
          <Sparkles className="w-4 h-4" />
          <span className="hidden sm:inline">Search</span>
        </motion.button>
        
        {/* Focus Ring Animation */}
        <motion.div
          className="absolute inset-0 rounded-2xl border-2 border-green-400 opacity-0 pointer-events-none"
          animate={{
            opacity: isFocused ? 1 : 0,
            scale: isFocused ? 1.02 : 1,
          }}
          transition={{ duration: 0.2 }}
        />
      </div>
      
      {/* Search Suggestions */}
      {isFocused && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="mt-2 glass rounded-xl p-4 border border-gray-700/50"
        >
          <p className="text-sm text-gray-400 mb-2 font-medium">Try searching for:</p>
          <div className="flex flex-wrap gap-2">
            {['Gaming', 'Music', 'Art', 'Tech', 'Sports', 'Books'].map((tag) => (
              <motion.button
                key={tag}
                type="button"
                onClick={() => setQuery(tag)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-3 py-1 bg-gradient-to-r from-green-500/20 to-green-400/20 text-green-400 rounded-full text-sm font-medium hover:from-green-500/30 hover:to-green-400/30 transition-all border border-green-500/30"
              >
                {tag}
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}
    </motion.form>
  );
}
