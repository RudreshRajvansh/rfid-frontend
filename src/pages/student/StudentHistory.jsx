import { useState, useEffect } from 'react';
import { api } from '../../api';
import { CalendarDays, Clock, ScanLine, MapPin } from 'lucide-react';

export default function StudentHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadHistory(); }, []);

  async function loadHistory() {
    try {
      const res = await api.studentAttendance(60);
      if (res.success) setHistory(res.data?.history || []);
    } catch {} finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="w-8 h-8 border-3 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-16">
        <CalendarDays className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-gray-900">No attendance records</h3>
        <p className="text-sm text-gray-500 mt-1">Records will appear once you start attending class.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-bold text-gray-900">Attendance History</h2>
      <p className="text-sm text-gray-500">Last {history.length} days</p>

      {history.map((day) => {
        const isPresent = day.status === 'Present';
        const hasGps = day.in_class_percent > 0;
        const gpsGood = day.in_class_percent >= 60;

        // Color logic: green=present+GPS verified, yellow=present no GPS, red=absent
        let borderColor = 'border-red-200 bg-red-50/50';
        let statusColor = 'text-red-600';
        if (isPresent && gpsGood) {
          borderColor = 'border-green-200 bg-green-50/50';
          statusColor = 'text-green-600';
        } else if (isPresent) {
          borderColor = 'border-amber-200 bg-amber-50/50';
          statusColor = 'text-amber-600';
        }

        return (
          <div key={day.date} className={`rounded-xl border p-4 ${borderColor} transition-all`}>
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="font-semibold text-gray-900">{formatDate(day.date)}</p>
                <p className={`text-sm font-medium ${statusColor}`}>{day.status}</p>
              </div>
              {isPresent && hasGps && (
                <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                  gpsGood ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                }`}>
                  <MapPin className="w-3 h-3" />
                  {day.in_class_percent?.toFixed(0)}% verified
                </div>
              )}
            </div>

            {isPresent && (
              <div className="grid grid-cols-3 gap-2 mt-2">
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{(day.first_in_time || '—').slice(0, 5)} - {(day.last_out_time || '—').slice(0, 5)}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <CalendarDays className="w-3.5 h-3.5" />
                  <span>{day.duration_minutes} min</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <ScanLine className="w-3.5 h-3.5" />
                  <span>{day.total_scans} scans</span>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function formatDate(dateStr) {
  try {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  } catch { return dateStr; }
}
