import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../api';

const StudentContext = createContext(null);

const PING_INTERVAL = 2 * 60 * 1000; // 2 minutes

export function StudentProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('student_token') || '');
  const [student, setStudent] = useState(null);
  const [gpsStatus, setGpsStatus] = useState('idle'); // idle | tracking | in_range | out_of_range | error | unsupported
  const [lastPing, setLastPing] = useState(null);
  const watchRef = useRef(null);
  const pingTimerRef = useRef(null);

  const isLoggedIn = !!token;

  const login = useCallback(async (rollNumber, dob) => {
    const res = await api.studentLogin(rollNumber, dob);
    if (res.success) {
      const t = res.data.token;
      localStorage.setItem('student_token', t);
      setToken(t);
      // Use the same field names the /me API returns so the UI works immediately
      setStudent({
        student_name: res.data.student_name,
        roll_number: res.data.roll_number,
        class_name: res.data.class_name,
        first_name: res.data.student_name.split(' ')[0],
        last_name: res.data.student_name.split(' ').slice(1).join(' '),
        total_days: 0,
        total_hours: '0.0',
        today_status: 'Absent',
      });
      return res.data;
    }
    throw new Error(res.error || 'Login failed');
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('student_token');
    setToken('');
    setStudent(null);
    setGpsStatus('idle');
    stopTracking();
  }, []);

  const loadProfile = useCallback(async () => {
    if (!token) return;
    try {
      const res = await api.studentMe();
      if (res.success) {
        setStudent(res.data);
      }
    } catch (e) {
      if (e.status === 401) {
        logout();
      }
    }
  }, [token, logout]);

  useEffect(() => {
    if (token) loadProfile();
  }, [token, loadProfile]);

  // GPS tracking
  const sendPing = useCallback(async (lat, lng) => {
    try {
      const res = await api.studentLocation(lat, lng);
      if (res.success) {
        setLastPing(res.data);
        setGpsStatus(res.data.in_class ? 'in_range' : 'out_of_range');
      }
    } catch {
      setGpsStatus('error');
    }
  }, []);

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setGpsStatus('unsupported');
      return;
    }

    setGpsStatus('tracking');

    // Get position immediately
    navigator.geolocation.getCurrentPosition(
      (pos) => sendPing(pos.coords.latitude, pos.coords.longitude),
      () => setGpsStatus('error'),
      { enableHighAccuracy: true, timeout: 10000 }
    );

    // Then every PING_INTERVAL
    pingTimerRef.current = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        (pos) => sendPing(pos.coords.latitude, pos.coords.longitude),
        () => setGpsStatus('error'),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }, PING_INTERVAL);
  }, [sendPing]);

  const stopTracking = useCallback(() => {
    if (watchRef.current) {
      navigator.geolocation.clearWatch(watchRef.current);
      watchRef.current = null;
    }
    if (pingTimerRef.current) {
      clearInterval(pingTimerRef.current);
      pingTimerRef.current = null;
    }
  }, []);

  // Auto-start tracking when logged in
  useEffect(() => {
    if (isLoggedIn) {
      startTracking();
    }
    return () => stopTracking();
  }, [isLoggedIn, startTracking, stopTracking]);

  return (
    <StudentContext.Provider value={{
      token, isLoggedIn, student, gpsStatus, lastPing,
      login, logout, loadProfile, startTracking, stopTracking,
    }}>
      {children}
    </StudentContext.Provider>
  );
}

export function useStudent() {
  const ctx = useContext(StudentContext);
  if (!ctx) throw new Error('useStudent must be used within StudentProvider');
  return ctx;
}
