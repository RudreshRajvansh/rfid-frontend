import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useStudent } from '../../context/StudentContext';
import { ScanLine, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function StudentLogin() {
  const { isLoggedIn, login } = useStudent();
  const [rollNumber, setRollNumber] = useState('');
  const [dob, setDob] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDob, setShowDob] = useState(false);
  const navigate = useNavigate();

  if (isLoggedIn) return <Navigate to="/student/dashboard" replace />;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!rollNumber.trim() || !dob) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      await login(rollNumber.trim(), dob);
      toast.success('Welcome!');
      navigate('/student/dashboard', { replace: true });
    } catch (e) {
      toast.error(e.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-600/30">
            <ScanLine className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">ClassTracker</h1>
          <p className="text-gray-400 text-sm mt-1">Student Attendance App</p>
        </div>

        {/* Login Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/10 p-6 shadow-xl">
          <h2 className="text-lg font-semibold text-white mb-4">Sign In</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Roll Number</label>
              <input
                type="text"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                placeholder="Enter your roll number"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Date of Birth</label>
              <div className="relative">
                <input
                  type={showDob ? 'text' : 'date'}
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  placeholder="YYYY-MM-DD"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowDob(!showDob)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showDob ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-600/30"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-gray-500 text-xs mt-4">
            Use your roll number and date of birth to sign in.
            GPS location will be used to verify your classroom presence.
          </p>
        </div>

        <p className="text-center text-gray-600 text-xs mt-6">
          ClassTracker v4.0 — RFID Attendance System
        </p>
      </div>
    </div>
  );
}
