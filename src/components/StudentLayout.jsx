import { Outlet, NavLink, Navigate } from 'react-router-dom';
import { useStudent } from '../context/StudentContext';
import { Home, CalendarDays, LogOut, MapPin } from 'lucide-react';

const GPS_LABELS = {
  idle: { text: 'GPS Idle', color: 'text-gray-400' },
  tracking: { text: 'Locating...', color: 'text-amber-500 animate-pulse' },
  in_range: { text: 'In Class ✓', color: 'text-green-500' },
  out_of_range: { text: 'Not in Range', color: 'text-red-400' },
  error: { text: 'GPS Error', color: 'text-red-500' },
  unsupported: { text: 'GPS N/A', color: 'text-gray-500' },
};

export default function StudentLayout() {
  const { isLoggedIn, student, gpsStatus, logout } = useStudent();

  if (!isLoggedIn) {
    return <Navigate to="/student/login" replace />;
  }

  const gps = GPS_LABELS[gpsStatus] || GPS_LABELS.idle;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900 leading-tight">ClassTracker</h1>
            <p className="text-xs text-gray-500">{student?.student_name || student?.name || 'Student'}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-1 text-xs font-medium ${gps.color}`}>
              <MapPin className="w-3.5 h-3.5" />
              {gps.text}
            </div>
            <button
              onClick={logout}
              className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-gray-100 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 px-4 py-4 max-w-lg mx-auto w-full">
        <Outlet />
      </main>

      {/* Bottom Nav */}
      <nav className="sticky bottom-0 bg-white border-t border-gray-200 px-4 py-2">
        <div className="max-w-lg mx-auto flex justify-around">
          <NavLink
            to="/student/dashboard"
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                isActive ? 'text-primary-600 bg-primary-50' : 'text-gray-500 hover:text-gray-700'
              }`
            }
          >
            <Home className="w-5 h-5" />
            Home
          </NavLink>
          <NavLink
            to="/student/history"
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                isActive ? 'text-primary-600 bg-primary-50' : 'text-gray-500 hover:text-gray-700'
              }`
            }
          >
            <CalendarDays className="w-5 h-5" />
            History
          </NavLink>
        </div>
      </nav>
    </div>
  );
}
