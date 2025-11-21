import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Users, Globe, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user } = useAuth();

  const features = [
    { icon: Search, title: "AI-Powered Search", desc: "Find communities with smart matching" },
    { icon: Users, title: "Live Pods", desc: "Join real-time conversations" },
    { icon: Globe, title: "Global & Local", desc: "Connect worldwide or nearby" },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex justify-center mb-6">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-6xl"
              >
                👋
              </motion.div>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white">
              Welcome back,{' '}
              <span className="text-gradient">
                king!
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Discover amazing communities, join live conversations, and connect with people who share your vibes
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                {user ? (
                  <Link to="/explore" className="btn-primary text-lg px-8 py-4 flex items-center space-x-2">
                    <Search className="w-5 h-5" />
                    <span>Explore Communities</span>
                  </Link>
                ) : (
                  <Link to="/login" className="btn-primary text-lg px-8 py-4 flex items-center space-x-2">
                    <Search className="w-5 h-5" />
                    <span>Explore Communities</span>
                  </Link>
                )}
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                {user ? (
                  <Link to="/nearby" className="btn-secondary text-lg px-8 py-4 flex items-center space-x-2">
                    <Globe className="w-5 h-5" />
                    <span>Find Nearby</span>
                  </Link>
                ) : (
                  <Link to="/register" className="btn-secondary text-lg px-8 py-4 flex items-center space-x-2">
                    <Users className="w-5 h-5" />
                    <span>Join VibeCircle</span>
                  </Link>
                )}
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gradient mb-6">What is VibeCircle?</h2>
            <p className="text-xl text-slate-300 max-w-4xl mx-auto leading-relaxed">
              VibeCircle is an AI-powered social platform that revolutionizes how you discover and connect with communities. 
              Whether you're looking for study groups, hobby clubs, or professional networks, our intelligent matching system 
              helps you find your perfect tribe.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h3 className="text-3xl font-bold text-white mb-6">🤖 AI-Powered Discovery</h3>
              <p className="text-lg text-gray-300 mb-6">
                Our advanced AI doesn't just match keywords - it understands context, interests, and connections. 
                Search for "machine learning" and discover communities for data science, Python programming, and AI research.
              </p>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-gray-300">Smart keyword expansion</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full" />
                  <span className="text-gray-300">Semantic matching technology</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full" />
                  <span className="text-gray-300">Personalized recommendations</span>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="glass rounded-3xl p-8 border-2 border-green-500/30">
                <div className="text-6xl mb-4 text-center">🧠</div>
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-green-500/20 to-green-400/20 rounded-lg p-3 border border-green-500/30">
                    <div className="text-sm text-gray-300">Search: "I want to learn coding"</div>
                    <div className="text-xs text-green-400 mt-1">AI finds: programming, javascript, python, web development</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-2 lg:order-1"
            >
              <div className="glass rounded-3xl p-8 border-2 border-green-500/30">
                <div className="text-6xl mb-4 text-center">💬</div>
                <div className="space-y-3">
                  <div className="bg-gradient-to-r from-gray-700/50 to-gray-600/50 rounded-lg p-3 border border-gray-600/30">
                    <div className="text-sm font-medium text-gray-200">Live Pod: Study Session</div>
                    <div className="text-xs text-gray-400">5 members • 2h remaining</div>
                  </div>
                  <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg p-3">
                    <div className="text-sm">🤖 What's the most challenging concept you're working on today?</div>
                    <div className="text-xs opacity-80 mt-1">VibeCircle AI • Just now</div>
                  </div>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-1 lg:order-2"
            >
              <h3 className="text-3xl font-bold text-white mb-6">💬 Live Conversations</h3>
              <p className="text-lg text-gray-300 mb-6">
                Join ephemeral activity pods for real-time discussions. Our AI assistant keeps conversations flowing 
                with smart icebreakers when things get quiet, ensuring every pod stays engaging and active.
              </p>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-gray-300">Real-time chat rooms</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full" />
                  <span className="text-gray-300">AI-powered icebreakers</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full" />
                  <span className="text-gray-300">Ephemeral & focused discussions</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-white mb-4">Why Choose VibeCircle?</h2>
            <p className="text-xl text-gray-300">Experience the future of community building</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="card text-center group hover:scale-105"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:animate-bounce-subtle">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white">{feature.title}</h3>
                <p className="text-gray-300">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="card bg-gradient-to-br from-green-500 to-green-700 text-white"
          >
            <div className="text-6xl mb-6">🚀</div>
            <h2 className="text-4xl font-bold mb-4">Ready to Find Your Community?</h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of users who have already discovered their perfect communities through VibeCircle
            </p>
            {user ? (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link to="/search" className="inline-flex items-center space-x-2 bg-white text-primary-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-50 transition-colors">
                  <Search className="w-6 h-6" />
                  <span>Start Exploring</span>
                </Link>
              </motion.div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link to="/register" className="inline-flex items-center space-x-2 bg-white text-primary-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-50 transition-colors">
                    <Users className="w-6 h-6" />
                    <span>Get Started</span>
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link to="/login" className="inline-flex items-center space-x-2 border-2 border-white text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white hover:text-primary-600 transition-colors">
                    <span>Sign In</span>
                  </Link>
                </motion.div>
              </div>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
