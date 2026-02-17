import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useTranslation from '../hooks/useTranslation';

const API_URL = import.meta.env.VITE_API_URL;

const TIMING_LABELS = {
  beforeBreakfast: { label: 'Before Breakfast', time: '7:00 AM', icon: '🌅' },
  afterBreakfast: { label: 'After Breakfast', time: '9:00 AM', icon: '☀️' },
  beforeLunch: { label: 'Before Lunch', time: '12:00 PM', icon: '🌤️' },
  afterLunch: { label: 'After Lunch', time: '2:00 PM', icon: '🌞' },
  beforeDinner: { label: 'Before Dinner', time: '7:00 PM', icon: '🌆' },
  afterDinner: { label: 'After Dinner', time: '9:00 PM', icon: '🌙' },
};

function Medicines() {
  const navigate = useNavigate();
  const { t, language } = useTranslation();
  const [medicines, setMedicines] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('today');

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

      const [todayRes, statsRes] = await Promise.all([
        fetch(`${API_URL}/api/medicines/today`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/api/medicines/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!todayRes.ok || !statsRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const todayData = await todayRes.json();
      const statsData = await statsRes.json();

      setMedicines(todayData.data);
      setStats(statsData);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4"></div>
          <p className="text-gray-600 font-medium">{t('Loading medicines...')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-6 shadow-lg">
            <div className="flex items-center mb-4">
              <svg className="w-6 h-6 text-red-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
              </svg>
              <p className="text-red-800 font-semibold">{error}</p>
            </div>
            <button
              onClick={fetchData}
              className="bg-red-600 text-white px-6 py-2.5 rounded-lg hover:bg-red-700 transition-all font-semibold shadow-md hover:shadow-lg"
            >
              {t('Retry')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <h1 className="text-4xl font-bold text-gray-800 mb-8">{t('My Medicines')}</h1>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow p-5 border border-gray-200">
              <p className="text-3xl font-bold mb-1 text-gray-900">{stats.summary.totalMedicines}</p>
              <p className="text-sm text-gray-600 font-medium">{t('Active Medicines')}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-5 border border-gray-200">
              <p className="text-3xl font-bold mb-1 text-gray-900">{stats.summary.totalTakenAllTime}</p>
              <p className="text-sm text-gray-600 font-medium">{t('Total Taken')}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-5 border border-gray-200">
              <p className="text-3xl font-bold mb-1 text-gray-900">{stats.summary.totalMissedAllTime}</p>
              <p className="text-sm text-gray-600 font-medium">{t('Total Missed')}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-5 border border-gray-200">
              <p className="text-3xl font-bold mb-1 text-gray-900">
                {stats.summary.takenToday}/{stats.summary.scheduledToday}
              </p>
              <p className="text-sm text-gray-600 font-medium">{t("Today's Progress")}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-5 border border-gray-200">
              <p className="text-3xl font-bold mb-1 text-gray-900">{stats.summary.adherenceRate}%</p>
              <p className="text-sm text-gray-600 font-medium">{t('Adherence Rate')}</p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-300">
          <button
            onClick={() => setActiveTab('today')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'today'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {t("Today's Medicines")}
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'all'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {t('All Medicines')}
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'stats'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {t('Statistics')}
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'today' && (
          <div className="space-y-4">
            {medicines.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
                <svg className="w-20 h-20 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                <p className="text-gray-600 text-lg font-semibold">{t('No medicines scheduled for today')}</p>
                <p className="text-gray-500 text-sm mt-2">{t('Enjoy your medicine-free day!')}</p>
              </div>
            ) : (
              medicines.map((medicine) => (
                <MedicineCard key={medicine.id} medicine={medicine} onUpdate={fetchData} t={t} />
              ))
            )}
          </div>
        )}

        {activeTab === 'all' && stats && (
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">
                    {t('Medicine')}
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-gray-700">
                    {t('Quantity Left')}
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-gray-700">
                    {t('Taken')}
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-gray-700">
                    {t('Missed')}
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-gray-700">
                    {t('Today')}
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-gray-700">
                    {t('Adherence')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stats.medicines.map((med) => {
                  const adherence =
                    med.takenCount + med.missedCount > 0
                      ? Math.round((med.takenCount / (med.takenCount + med.missedCount)) * 100)
                      : 100;

                  return (
                    <tr key={med.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-900">{med.name}</p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            med.quantity <= 5
                              ? 'bg-red-100 text-red-700'
                              : med.quantity <= 10
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-green-100 text-green-700'
                          }`}
                        >
                          {med.quantity} {t('tablets')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-green-600 font-semibold">{med.takenCount}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-red-600 font-semibold">{med.missedCount}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-blue-600 font-semibold">
                          {med.takenToday}/{med.scheduledToday}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                adherence >= 80
                                  ? 'bg-green-500'
                                  : adherence >= 50
                                  ? 'bg-yellow-500'
                                  : 'bg-red-500'
                              }`}
                              style={{ width: `${adherence}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600">{adherence}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'stats' && stats && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Adherence Chart */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">{t('Overall Adherence')}</h3>
              <div className="flex items-center justify-center">
                <div className="relative w-40 h-40">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="12"
                    />
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      fill="none"
                      stroke={
                        stats.summary.adherenceRate >= 80
                          ? '#22c55e'
                          : stats.summary.adherenceRate >= 50
                          ? '#eab308'
                          : '#ef4444'
                      }
                      strokeWidth="12"
                      strokeDasharray={`${(stats.summary.adherenceRate / 100) * 440} 440`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-bold text-gray-800">
                      {stats.summary.adherenceRate}%
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.summary.totalTakenAllTime}
                  </p>
                  <p className="text-sm text-gray-500">{t('Doses Taken')}</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-600">
                    {stats.summary.totalMissedAllTime}
                  </p>
                  <p className="text-sm text-gray-500">{t('Doses Missed')}</p>
                </div>
              </div>
            </div>

            {/* Today's Progress */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">{t("Today's Progress")}</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">{t('Completed')}</span>
                    <span className="font-medium">
                      {stats.summary.takenToday} / {stats.summary.scheduledToday}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className="bg-gradient-to-r from-green-400 to-green-600 h-4 rounded-full transition-all duration-500"
                      style={{
                        width: `${
                          stats.summary.scheduledToday > 0
                            ? (stats.summary.takenToday / stats.summary.scheduledToday) * 100
                            : 0
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">
                      {stats.summary.scheduledToday}
                    </p>
                    <p className="text-xs text-gray-500">{t('Scheduled')}</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{stats.summary.takenToday}</p>
                    <p className="text-xs text-gray-500">{t('Taken')}</p>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 rounded-lg">
                    <p className="text-2xl font-bold text-yellow-600">
                      {stats.summary.pendingToday}
                    </p>
                    <p className="text-xs text-gray-500">{t('Pending')}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Per-Medicine Stats */}
            <div className="md:col-span-2 bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">{t('Medicine Breakdown')}</h3>
              <div className="space-y-4">
                {stats.medicines.map((med) => {
                  const total = med.takenCount + med.missedCount;
                  const takenPercent = total > 0 ? (med.takenCount / total) * 100 : 100;

                  return (
                    <div key={med.id}>
                      <div className="flex justify-between mb-1">
                        <span className="font-medium text-gray-700">{med.name}</span>
                        <span className="text-sm text-gray-500">
                          {med.takenCount} {t('taken')} / {med.missedCount} {t('missed')}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div className="h-full flex">
                          <div
                            className="bg-green-500 h-full"
                            style={{ width: `${takenPercent}%` }}
                          ></div>
                          <div
                            className="bg-red-400 h-full"
                            style={{ width: `${100 - takenPercent}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Medicine Card Component
function MedicineCard({ medicine, onUpdate, t }) {
  const [actionLoading, setActionLoading] = useState({});

  const handleTake = async (timing) => {
    setActionLoading((prev) => ({ ...prev, [timing]: true }));

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/medicines/${medicine.id}/take`, {
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

      onUpdate();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading((prev) => ({ ...prev, [timing]: false }));
    }
  };

  const handleUntake = async (timing) => {
    setActionLoading((prev) => ({ ...prev, [timing]: true }));

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/medicines/${medicine.id}/untake`, {
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

      onUpdate();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading((prev) => ({ ...prev, [timing]: false }));
    }
  };

  const allTaken = medicine.timings.every((t) => t.taken);
  const takenCount = medicine.timings.filter((t) => t.taken).length;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-gray-200">
      {/* Medicine Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800">{medicine.name}</h3>
          <p className="text-gray-600 mt-1">
            Quantity: {medicine.quantity} • Dr. {medicine.prescribedBy?.name || 'Unknown'}
          </p>
        </div>
        <div className="bg-gray-50 rounded-lg px-4 py-2 border border-gray-200">
          <p className="text-xs font-semibold text-gray-500 uppercase">{t('Progress')}</p>
          <p className="text-2xl font-bold text-gray-900">
            {takenCount}/{medicine.timings.length}
          </p>
        </div>
      </div>

      {/* Timings */}
      <div>
        <h4 className="font-semibold text-gray-700 mb-3">{t('When to take')}:</h4>
        <div className="space-y-3">
          {medicine.timings.map((timing) => {
            const info = TIMING_LABELS[timing.slot];
            const isLoading = actionLoading[timing.slot];

            return (
              <div
                key={timing.slot}
                className={`border-2 rounded-lg p-4 ${
                  timing.taken ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-bold text-lg text-gray-800">{t(info.label)}</div>
                    <div className="text-sm text-gray-600">{info.time}</div>
                  </div>

                  {timing.taken ? (
                    <div className="flex items-center space-x-3">
                      <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                        ✓ {t('Taken')}
                      </span>
                      <button
                        onClick={() => handleUntake(timing.slot)}
                        disabled={isLoading}
                        className="text-sm text-gray-400 hover:text-red-500 transition font-semibold"
                      >
                        {isLoading ? '...' : t('Undo')}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleTake(timing.slot)}
                      disabled={isLoading}
                      className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition font-medium"
                    >
                      {isLoading ? t('Taking...') : t('Take Now')}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stats Footer */}
      <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between text-sm">
        <span className="text-gray-700 font-medium">
          {t('Total Taken')}: <span className="font-bold text-green-600">{medicine.takenCount}</span>
        </span>
        <span className="text-gray-700 font-medium">
          {t('Total Missed')}: <span className="font-bold text-red-600">{medicine.missedCount}</span>
        </span>
      </div>
    </div>
  );
}

export default Medicines;
