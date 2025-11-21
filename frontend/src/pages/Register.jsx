import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, School, Shield } from 'lucide-react';
import { api } from '../api/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    campus: ''
  });
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // 1: form, 2: OTP
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/auth/send-otp', formData);
      toast.success('OTP sent to your email! 📧');
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/auth/verify-otp', {
        email: formData.email,
        otp
      });
      
      // Auto login after successful registration
      localStorage.setItem('token', response.data.token);
      toast.success('Account created successfully! 🎉');
      navigate('/');
      window.location.reload(); // Refresh to update auth state
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full"
      >
        {step === 1 ? (
          // Registration Form
          <>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center mb-8"
            >
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
              </div>
              <h2 className="text-4xl font-bold text-gradient mb-2">
                Join VibeCircle
              </h2>
              <p className="text-gray-400">
                Create your account to start connecting
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="card"
            >
              <form onSubmit={handleSendOTP} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="input-field pl-10"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="input-field pl-10"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="password"
                      name="password"
                      required
                      minLength={6}
                      value={formData.password}
                      onChange={handleChange}
                      className="input-field pl-10"
                      placeholder="Create a password (min 6 chars)"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Campus (Optional)</label>
                  <div className="relative">
                    <School className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="campus"
                      value={formData.campus}
                      onChange={handleChange}
                      className="input-field pl-10"
                      placeholder="Your school or university"
                    />
                  </div>
                </div>

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                  className="w-full btn-primary disabled:opacity-50"
                >
                  {loading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mx-auto"
                    />
                  ) : (
                    'Send Verification Code'
                  )}
                </motion.button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-gray-400">
                  Already have an account?{' '}
                  <Link to="/login" className="text-green-400 hover:text-green-300 font-medium">
                    Sign in
                  </Link>
                </p>
              </div>
            </motion.div>
          </>
        ) : (
          // OTP Verification
          <>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center">
                  <Shield className="w-8 h-8 text-white" />
                </div>
              </div>
              <h2 className="text-4xl font-bold text-gradient mb-2">
                Verify Your Email
              </h2>
              <p className="text-gray-400">
                We sent a code to <strong className="text-gray-200">{formData.email}</strong>
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="card"
            >
              <form onSubmit={handleVerifyOTP} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Verification Code</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    className="input-field text-center text-2xl font-bold tracking-widest"
                    placeholder="000000"
                  />
                  <p className="text-xs text-gray-500">Enter the 6-digit code from your email</p>
                </div>

                <motion.button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                  className="w-full btn-primary disabled:opacity-50"
                >
                  {loading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mx-auto"
                    />
                  ) : (
                    'Verify & Create Account'
                  )}
                </motion.button>

                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full text-gray-400 hover:text-gray-300 font-medium"
                >
                  ← Back to form
                </button>
              </form>
            </motion.div>
          </>
        )}
      </motion.div>
    </div>
  );
}
