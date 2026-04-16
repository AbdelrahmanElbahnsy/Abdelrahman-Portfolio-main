import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Lock, Mail, Loader2, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);
      toast.success("Welcome back, Admin!");
      navigate('/admin');
    } catch (err) {
      toast.error(err.message || 'Failed to login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0f1c] text-white px-4 relative overflow-hidden">
      <Toaster position="top-right" toastOptions={{ style: { background: '#131b2c', color: '#fff', border: '1px solid #1e293b' } }} />

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-8 bg-[#131b2c] rounded-2xl shadow-xl shadow-black/50 border border-[#1e293b] relative z-10"
      >
        <div className="text-center mb-8">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="w-16 h-16 bg-[#1e293b] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#14f195]/30"
          >
            <Lock className="text-[#14f195] w-8 h-8" />
          </motion.div>
          <h2 className="text-3xl font-bold tracking-tight">Admin CMS</h2>
          <p className="text-gray-400 mt-2">Access your portfolio dashboard</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-[#0a0f1c] border border-[#1e293b] rounded-lg focus:outline-none focus:border-[#14f195] text-white transition-colors"
                placeholder="admin@example.com"
                required
              />
            </div>
          </motion.div>

          <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-300">Password</label>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3 bg-[#0a0f1c] border border-[#1e293b] rounded-lg focus:outline-none focus:border-[#14f195] text-white transition-colors"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <div className="mt-2 text-right">
              <Link to="/forgot-password" className="text-sm text-[#14f195] hover:text-[#10d482] transition-colors">
                Forgot Password?
              </Link>
            </div>
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-[#14f195] hover:bg-[#10d482] text-[#0a0f1c] font-bold rounded-lg flex items-center justify-center transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-[#14f195]/20"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Log In Securely'}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;
