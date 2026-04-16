import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { sendPasswordResetEmail, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebase';
import { Mail, ArrowLeft, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Password reset link sent! Check your email.', { duration: 5000 });
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        try {
          await createUserWithEmailAndPassword(auth, email, 'Temp@123456');
          await sendPasswordResetEmail(auth, email);
          toast.success('Account auto-created. Check email for reset link.', { duration: 5000 });
        } catch (createErr) {
          toast.error(`Creation Error: ${createErr.message}`);
        }
      } else {
        toast.error(`Error: ${err.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0f1c] text-white px-4 relative overflow-hidden">
      <Toaster position="top-right" toastOptions={{ style: { background: '#131b2c', color: '#fff', border: '1px solid #1e293b' } }} />

      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md p-8 bg-[#131b2c] rounded-2xl shadow-xl shadow-black/50 border border-[#1e293b] relative z-10"
      >
        <div className="text-center mb-8">
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="w-16 h-16 bg-[#1e293b] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#14f195]/30"
          >
            <Mail className="text-[#14f195] w-8 h-8" />
          </motion.div>
          <h2 className="text-3xl font-bold tracking-tight">Recovery</h2>
          <p className="text-gray-400 mt-2">No worries, we'll send you reset instructions.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
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
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-[#14f195] hover:bg-[#10d482] text-[#0a0f1c] font-bold rounded-lg flex items-center justify-center transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-[#14f195]/20"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Reset Link'}
          </motion.button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/login" className="flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
