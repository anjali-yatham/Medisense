import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from '../hooks/useTranslation'

const TrackMedicines = () => {
  const { t } = useTranslation()
  const [medicines, setMedicines] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleteLoading, setDeleteLoading] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const user = localStorage.getItem('user')
    if (!user) {
      navigate('/signin')
      return
    }

    fetchMedicines()
  }, [navigate])

  const fetchMedicines = async () => {
    const token = localStorage.getItem('token')
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/medicines/my-medicines`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      
      if (response.ok) {
        // Sort by endDate from newest to oldest
        const sortedMedicines = (data.medicines || []).sort((a, b) => 
          new Date(b.endDate) - new Date(a.endDate)
        )
        setMedicines(sortedMedicines)
      } else {
        setError(data.message || 'Failed to fetch medicines')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (medicineId) => {
    if (!window.confirm('Are you sure you want to delete this medicine entry?')) {
      return
    }

    const token = localStorage.getItem('token')
    setDeleteLoading(medicineId)

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/medicines/${medicineId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      
      if (response.ok) {
        setMedicines(medicines.filter(med => med._id !== medicineId))
      } else {
        setError(data.message || 'Failed to delete medicine')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setDeleteLoading(null)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const isActive = (startDate, endDate) => {
    const today = new Date()
    const start = new Date(startDate)
    const end = new Date(endDate)
    return today >= start && today <= end
  }

  const isExpired = (endDate) => {
    const today = new Date()
    const end = new Date(endDate)
    return today > end
  }

  const isUpcoming = (startDate) => {
    const today = new Date()
    const start = new Date(startDate)
    return today < start
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4"></div>
          <p className="text-gray-600 font-medium">{t('Loading medicines...')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          {/* <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100"> */}
            <h1 className="text-3xl font-bold text-gray-900">{t('Track Medicines')}</h1>
            {/* <p className="text-gray-600 mt-1 font-medium">{t('View and manage all your prescribed medicines')}</p> */}
          {/* </div> */}
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 rounded-lg p-6 shadow-lg">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-red-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
              </svg>
              <p className="text-red-800 font-semibold">{error}</p>
            </div>
          </div>
        )}

        {medicines.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-gray-100">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-20 w-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{t('No Medicines Yet')}</h3>
            <p className="text-gray-600">{t('Your prescribed medicines will appear here once they are added by your healthcare provider.')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {medicines.map((medicine) => (
              <div 
                key={medicine._id} 
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-200 group relative"
              >
                {/* Status Badge - Top Left */}
                <div className="absolute top-3 left-3 z-10">
                  {isActive(medicine.startDate, medicine.endDate) && (
                    <span className="px-2 py-1 bg-gray-900 text-white text-xs font-semibold rounded-full shadow-sm">
                      {t('Active')}
                    </span>
                  )}
                  {isExpired(medicine.endDate) && (
                    <span className="px-2 py-1 bg-gray-400 text-white text-xs font-semibold rounded-full shadow-sm">
                      {t('Expired')}
                    </span>
                  )}
                  {isUpcoming(medicine.startDate) && (
                    <span className="px-2 py-1 bg-gray-600 text-white text-xs font-semibold rounded-full shadow-sm">
                      {t('Upcoming')}
                    </span>
                  )}
                </div>

                {/* Delete Button - Top Right */}
                <button
                  onClick={() => handleDelete(medicine._id)}
                  disabled={deleteLoading === medicine._id}
                  className="absolute top-3 right-3 z-10 w-7 h-7 bg-gray-100 hover:bg-red-500 text-gray-600 hover:text-white rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  title={t('Delete')}
                >
                  {deleteLoading === medicine._id ? (
                    <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  )}
                </button>

                {/* Card Content */}
                <div className="p-4 pt-12">
                  {/* Medicine Name */}
                  <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                    {medicine.medicineName}
                  </h3>

                  {/* Timing badges - Right after name */}
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{t('Timings')}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {medicine.timing.beforeBreakfast && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                          {t('Before Breakfast')}
                        </span>
                      )}
                      {medicine.timing.afterBreakfast && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                          {t('After Breakfast')}
                        </span>
                      )}
                      {medicine.timing.beforeLunch && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                          {t('Before Lunch')}
                        </span>
                      )}
                      {medicine.timing.afterLunch && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                          {t('After Lunch')}
                        </span>
                      )}
                      {medicine.timing.beforeDinner && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                          {t('Before Dinner')}
                        </span>
                      )}
                      {medicine.timing.afterDinner && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">
                          {t('After Dinner')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quantity Badge */}
                  <div className="mb-3">
                    <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded font-medium">
                      {t('Qty')}: {medicine.quantity}
                    </span>
                  </div>

                  {/* Doctor Info */}
                  {medicine.prescribedBy && (
                    <div className="flex items-center mb-2 text-gray-600">
                      <svg className="w-3.5 h-3.5 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"/>
                      </svg>
                      <p className="text-xs">Dr. {medicine.prescribedBy.name}</p>
                    </div>
                  )}

                  {/* Date Range */}
                  <div className="flex items-center text-gray-600">
                    <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-xs">
                      {formatDate(medicine.startDate)} - {formatDate(medicine.endDate)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default TrackMedicines
