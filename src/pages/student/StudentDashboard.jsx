import { useState, useEffect } from 'react';
import { useStudent } from '../../context/StudentContext';
import { api } from '../../api';
import { Clock, CalendarDays, ScanLine, MapPin, TrendingUp, CheckCircle, XCircle } from 'lucide-react';

export default function StudentDashboard() {
  const { student, gpsStatus, lastPing, loadProfile } = useStudent();
  const [today, setToday] = useState(null);

  async function loadToday() {
    try {
      const res = await api.studentToday();
      if (res.success) setToday(res.data);
    } catch (err) {
      console.error('Failed to load today status:', err);
    }
  }

  useEffect(() => {
    loadProfile();
    loadToday();
    const interval = setInterval(loadToday, 30000);
    return () => clearInterval(interval);
  }, [loadProfile]);

  const s = student || {};
  const t = today || {};
  const isPresent = t.status === 'Present' || s.today_status === 'Present';

  return (
    <div className="space-y-4">
      {/* Profile Card */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl p-5 text-white shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold">
            {(s.first_name || '?')[0]}
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-bold truncate">{s.student_name || 'Student'}</h2>
            <p className="text-primary-100 text-sm">{s.roll_number}</p>
            <p className="text-primary-200 text-xs">{s.class_name || 'No class assigned'}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="bg-white/10 rounded-xl px-3 py-2">
            <p className="text-primary-200 text-xs">Total Days</p>
            <p className="text-xl font-bold">{s.total_days || 0}</p>
          </div>
          <div className="bg-white/10 rounded-xl px-3 py-2">
            <p className="text-primary-200 text-xs">Total Hours</p>
            <p className="text-xl font-bold">{s.total_hours || '0.0'}</p>
          </div>
        </div>
      </div>

      {/* Today Status */}
      <div className={`rounded-2xl p-5 border-2 ${isPresent ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
        <div className="flex items-center gap-3 mb-3">
          {isPresent ? (
            <CheckCircle className="w-8 h-8 text-green-500" />
          ) : (
            <XCircle className="w-8 h-8 text-red-400" />
          )}
          <div>
            <h3 className="font-bold text-gray-900 text-lg">
              {isPresent ? 'Present Today' : 'Not Checked In'}
            </h3>
            <p className="text-sm text-gray-500">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
        </div>

        {isPresent && (
          <div className="grid grid-cols-2 gap-3">
            <InfoBadge icon={Clock} label="Check In" value={(t.first_in_time || s.today_in_time || '—').slice(0, 8)} />
            <InfoBadge icon={Clock} label="Check Out" value={(t.last_out_time || s.today_out_time || '—').slice(0, 8)} />
            <InfoBadge icon={CalendarDays} label="Duration" value={`${t.duration_minutes || s.today_duration || 0} min`} />
            <InfoBadge icon={ScanLine} label="Scans" value={t.total_scans || s.today_scans || 0} />
          </div>
        )}
      </div>

      {/* GPS Verification */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary-500" />
          Location Verification
        </h3>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">GPS Status</span>
            <GpsStatusBadge status={gpsStatus} />
          </div>

          {lastPing && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Distance</span>
              <span className="text-sm font-medium text-gray-900">{lastPing.distance_meters != null ? Math.round(lastPing.distance_meters) : '—'} m</span>
            </div>
          )}

          {(t.total_pings > 0) && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Pings Today</span>
                <span className="text-sm font-medium text-gray-900">{t.in_range_pings} / {t.total_pings}</span>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-500">In-Class %</span>
                  <span className="text-sm font-bold text-gray-900">{t.in_class_percent?.toFixed(0) || 0}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full transition-all ${
                      t.in_class_percent >= 70 ? 'bg-green-500' : t.in_class_percent >= 40 ? 'bg-amber-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(t.in_class_percent || 0, 100)}%` }}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <p className="text-center text-xs text-gray-400 pb-2">
        Location is checked every 2 minutes while the app is open
      </p>
    </div>
  );
}

function InfoBadge({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-2 bg-white/80 rounded-lg px-3 py-2">
      <Icon className="w-4 h-4 text-gray-400 shrink-0" />
      <div className="min-w-0">
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm font-semibold text-gray-900 truncate">{value}</p>
      </div>
    </div>
  );
}

function GpsStatusBadge({ status }) {
  const styles = {
    idle: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Idle' },
    tracking: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Locating...' },
    in_range: { bg: 'bg-green-100', text: 'text-green-700', label: '✓ In Class' },
    out_of_range: { bg: 'bg-red-100', text: 'text-red-700', label: 'Out of Range' },
    error: { bg: 'bg-red-100', text: 'text-red-700', label: 'GPS Error' },
    unsupported: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Not Available' },
  };
  const s = styles[status] || styles.idle;
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${s.bg} ${s.text}`}>
      {s.label}
    </span>
  );
}
