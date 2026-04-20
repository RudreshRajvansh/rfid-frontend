import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { StudentProvider } from './context/StudentContext';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/Layout';
import StudentLayout from './components/StudentLayout';
import { LoadingScreen } from './components/UI';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Classes = lazy(() => import('./pages/Classes'));
const Students = lazy(() => import('./pages/Students'));
const Attendance = lazy(() => import('./pages/Attendance'));
const Logs = lazy(() => import('./pages/Logs'));
const Devices = lazy(() => import('./pages/Devices'));
const Settings = lazy(() => import('./pages/Settings'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Student app
const StudentLogin = lazy(() => import('./pages/student/StudentLogin'));
const StudentDashboard = lazy(() => import('./pages/student/StudentDashboard'));
const StudentHistory = lazy(() => import('./pages/student/StudentHistory'));

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <StudentProvider>
          <BrowserRouter>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: { borderRadius: '10px', background: '#1f2937', color: '#fff', fontSize: '14px' },
              }}
            />
            <Suspense fallback={<LoadingScreen />}>
              <Routes>
                {/* Admin Panel */}
                <Route element={<Layout />}>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/classes" element={<Classes />} />
                  <Route path="/students" element={<Students />} />
                  <Route path="/attendance" element={<Attendance />} />
                  <Route path="/logs" element={<Logs />} />
                  <Route path="/devices" element={<Devices />} />
                  <Route path="/settings" element={<Settings />} />
                </Route>

                {/* Student App */}
                <Route path="/student/login" element={<StudentLogin />} />
                <Route element={<StudentLayout />}>
                  <Route path="/student/dashboard" element={<StudentDashboard />} />
                  <Route path="/student/history" element={<StudentHistory />} />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </StudentProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
