import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../services/firebase';
import { Mail, ArrowLeft, Loader2 } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('If this email is registered, a reset link has been sent.', { duration: 5000 });
    } catch (err) {
      // Don't reveal whether the email exists — show generic message for most errors
      if (err.code === 'auth/invalid-email') {
        toast.error('Please enter a valid email address.');
      } else if (err.code === 'auth/too-many-requests') {
        toast.error('Too many attempts. Please try again later.');
      } else {
        toast.success('If this email is registered, a reset link has been sent.', { duration: 5000 });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0f1c] text-white px-4 relative overflow-hidden" dir="ltr">
      {/* DevOps Grid Background */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      
      {/* Subtle Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#14f195]/5 rounded-full blur-[100px] pointer-events-none z-0"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none z-0"></div>

      <Toaster position="top-right" toastOptions={{ style: { background: '#131b2c', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' } }} />

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md p-8 sm:p-10 bg-[#0f1523]/80 backdrop-blur-xl rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] border border-white/5 relative z-10"
      >
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/5 to-transparent opacity-50 pointer-events-none"></div>

        <div className="text-center mb-10 relative">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="w-16 h-16 bg-gradient-to-br from-[#131b2c] to-[#0a0f1c] rounded-2xl flex items-center justify-center mx-auto mb-5 border border-white/10 shadow-inner"
          >
            <Mail className="text-[#14f195] w-8 h-8" strokeWidth={1.5} />
          </motion.div>
          <div className="mb-1">
            <span className="text-[#14f195] text-[10px] font-bold tracking-[0.2em] uppercase">ABDELRAHMAN EL-BAHNSY</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">Recovery</h2>
          <p className="text-gray-500 mt-2 text-sm font-medium tracking-wide uppercase">No worries, we'll send you reset instructions.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 relative">
          <motion.div initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Email Address</label>
            <div className={`relative group transition-all duration-300 ${focusedField === 'email' ? 'scale-[1.01]' : ''}`}>
              <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${focusedField === 'email' ? 'text-[#14f195]' : 'text-gray-600'}`} />
              <input
                type="email"
                value={email}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-[#0a0f1c]/50 border border-white/10 rounded-xl focus:outline-none focus:border-[#14f195]/50 focus:ring-1 focus:ring-[#14f195]/50 text-white transition-all placeholder:text-gray-700 font-medium"
                placeholder="admin@example.com"
                required
              />
            </div>
          </motion.div>

          <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full py-3.5 bg-[#14f195] hover:bg-[#10d482] text-[#0a0f1c] font-bold rounded-xl flex items-center justify-center transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden focus:outline-none focus:ring-2 focus:ring-[#14f195] focus:ring-offset-2 focus:ring-offset-[#0a0f1c]"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
              <span className="relative flex items-center justify-center">
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Sending...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </span>
            </button>
          </motion.div>
        </form>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-6 text-center relative z-10">
          <Link to="/login" className="inline-flex items-center justify-center gap-2 text-xs font-medium text-gray-500 hover:text-[#14f195] transition-colors focus:outline-none focus:underline uppercase tracking-wider">
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
