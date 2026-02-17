import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useTranslation from '../hooks/useTranslation';

const API_URL = import.meta.env.VITE_API_URL;
// Timing slot display order
const TIMING_ORDER = [
  'beforeBreakfast',
  'afterBreakfast',
  'beforeLunch',
  'afterLunch',
  'beforeDinner',
  'afterDinner',
];

const TIMING_LABELS = {
  beforeBreakfast: { label: 'Before Breakfast', time: '7:00 AM', icon: '🌅' },
  afterBreakfast: { label: 'After Breakfast', time: '9:00 AM', icon: '☀️' },
  beforeLunch: { label: 'Before Lunch', time: '12:00 PM', icon: '🌤️' },
  afterLunch: { label: 'After Lunch', time: '2:00 PM', icon: '🌞' },
  beforeDinner: { label: 'Before Dinner', time: '7:00 PM', icon: '🌆' },
  afterDinner: { label: 'After Dinner', time: '9:00 PM', icon: '🌙' },
};

function MedicineSchedule() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [schedule, setSchedule] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/signin');
      return;
    }
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const [scheduleRes, statsRes] = await Promise.all([
        fetch(`${API_URL}/api/medicines/schedule`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/api/medicines/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!scheduleRes.ok || !statsRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const scheduleData = await scheduleRes.json();
      const statsData = await statsRes.json();

      setSchedule(scheduleData.schedule);
      setStats(statsData);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTakeMedicine = async (medicineId, timing) => {
    const key = `${medicineId}-${timing}`;
    setActionLoading((prev) => ({ ...prev, [key]: true }));

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/medicines/${medicineId}/take`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ timing }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to mark as taken');
      }

      // Refresh data
      await fetchData();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading((prev) => ({ ...prev, [key]: false }));
    }
  };

  const handleUntakeMedicine = async (medicineId, timing) => {
    const key = `${medicineId}-${timing}`;
    setActionLoading((prev) => ({ ...prev, [key]: true }));

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/medicines/${medicineId}/untake`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ timing }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to undo');
      }

      // Refresh data
      await fetchData();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading((prev) => ({ ...prev, [key]: false }));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-600">{error}</p>
        <button
          onClick={fetchData}
          className="mt-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
        >
          {t('Retry')}
        </button>
      </div>
    );
  }

  const hasMedicines = schedule && Object.values(schedule).some((slot) => slot.medicines.length > 0);

  return (
    <div className="space-y-6">
      {/* Stats Summary */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-blue-600">{stats.summary.scheduledToday}</p>
            <p className="text-sm text-gray-600">{t('Scheduled Today')}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-green-600">{stats.summary.takenToday}</p>
            <p className="text-sm text-gray-600">{t('Taken Today')}</p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-yellow-600">{stats.summary.pendingToday}</p>
            <p className="text-sm text-gray-600">{t('Pending Today')}</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <p className="text-3xl font-bold text-purple-600">{stats.summary.adherenceRate}%</p>
            <p className="text-sm text-gray-600">{t('Adherence Rate')}</p>
          </div>
        </div>
      )}

      {/* Schedule */}
      {!hasMedicines ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-500 text-lg">{t('No medicines scheduled for today')}</p>
          <p className="text-gray-400 text-sm mt-2">
            {t('Your prescriptions will appear here once added by your doctor')}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {TIMING_ORDER.map((timing) => {
            const slot = schedule[timing];
            if (!slot || slot.medicines.length === 0) return null;

            const info = TIMING_LABELS[timing];
            const allTaken = slot.medicines.every((med) => med.taken);

            return (
              <div
                key={timing}
                className={`rounded-lg border-2 overflow-hidden ${
                  allTaken ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-white'
                }`}
              >
                {/* Timing Header */}
                <div
                  className={`px-4 py-3 flex items-center justify-between ${
                    allTaken ? 'bg-green-100' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{info.icon}</span>
                    <div>
                      <h3 className="font-semibold text-gray-800">{t(info.label)}</h3>
                      <p className="text-sm text-gray-500">{info.time}</p>
                    </div>
                  </div>
                  {allTaken && (
                    <span className="bg-green-500 text-white text-xs px-3 py-1 rounded-full">
                      ✓ {t('All Done')}
                    </span>
                  )}
                </div>

                {/* Medicines List */}
                <div className="divide-y divide-gray-100">
                  {slot.medicines.map((medicine) => {
                    const key = `${medicine.id}-${timing}`;
                    const isLoading = actionLoading[key];

                    return (
                      <div
                        key={medicine.id}
                        className={`px-4 py-3 flex items-center justify-between ${
                          medicine.taken ? 'bg-green-50/50' : ''
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              medicine.taken
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-200 text-gray-600'
                            }`}
                          >
                            {medicine.taken ? (
                              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/>
                              </svg>
                            ) : (
                              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M4.22 11.29l7.07-7.07c.78-.78 2.05-.78 2.83 0l4.95 4.95c.78.78.78 2.05 0 2.83l-7.07 7.07c-.78.78-2.05.78-2.83 0l-4.95-4.95c-.78-.78-.78-2.05 0-2.83zM12 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                              </svg>
                            )}
                          </div>
                          <div>
                            <p
                              className={`font-medium ${
                                medicine.taken ? 'text-green-700 line-through' : 'text-gray-800'
                              }`}
                            >
                              {medicine.name} - 1 {t('tablet')}
                            </p>
                            <p className="text-xs text-gray-500">
                              {medicine.quantity} {t('tablets left')}
                            </p>
                          </div>
                        </div>

                        {medicine.taken ? (
                          <button
                            onClick={() => handleUntakeMedicine(medicine.id, timing)}
                            disabled={isLoading}
                            className="text-sm text-gray-500 hover:text-red-600 underline disabled:opacity-50"
                          >
                            {isLoading ? '...' : t('Undo')}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleTakeMedicine(medicine.id, timing)}
                            disabled={isLoading}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                          >
                            {isLoading ? (
                              <span className="flex items-center space-x-2">
                                <span className="animate-spin">⏳</span>
                                <span>{t('Taking...')}</span>
                              </span>
                            ) : (
                              t('Take Now')
                            )}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Medicine Stats Table */}
      {stats && stats.medicines.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <h3 className="font-semibold text-gray-800">{t('Medicine Statistics')}</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="px-4 py-3 text-sm font-medium text-gray-600">{t('Medicine')}</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-600 text-center">
                    {t('Quantity Left')}
                  </th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-600 text-center">
                    {t('Total Taken')}
                  </th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-600 text-center">
                    {t('Total Missed')}
                  </th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-600 text-center">
                    {t('Today')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stats.medicines.map((med) => (
                  <tr key={med.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{med.name}</td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`px-2 py-1 rounded-full text-sm ${
                          med.quantity <= 5
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {med.quantity}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-green-600 font-medium">{med.takenCount}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-red-600 font-medium">{med.missedCount}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-blue-600">
                        {med.takenToday}/{med.scheduledToday}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default MedicineSchedule;
