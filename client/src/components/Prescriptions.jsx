import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useTranslation from '../hooks/useTranslation'
import axios from 'axios'
function Prescriptions() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [user, setUser] = useState(null)
  const [userType, setUserType] = useState('')
  const [prescriptions, setPrescriptions] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [medicines, setMedicines] = useState([{ 
    name: '', 
    quantity: 1,
    startDate: '',
    endDate: '',
    timing: {
      beforeBreakfast: false,
      afterBreakfast: false,
      beforeLunch: false,
      afterLunch: false,
      beforeDinner: false,
      afterDinner: false,
    },
    label: 'Medicine 1'
  }])
  const [medSearchQueries, setMedSearchQueries] = useState({})
  const [medSearchResults, setMedSearchResults] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [activeTab, setActiveTab] = useState('create') // 'create' or 'view'
  const [viewSearchQuery, setViewSearchQuery] = useState('')
  const [viewSearchResults, setViewSearchResults] = useState([])
  const [selectedViewPatient, setSelectedViewPatient] = useState(null)
  const [patientPrescriptions, setPatientPrescriptions] = useState([])
  const [orgFilter, setOrgFilter] = useState('')
  const [allPrescriptions, setAllPrescriptions] = useState([])
  
  // OCR states
  const [uploadedImage, setUploadedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [ocrProcessing, setOcrProcessing] = useState(false)
  const [ocrProgress, setOcrProgress] = useState(0)
  const [extractedText, setExtractedText] = useState('')
  const [showExtractedData, setShowExtractedData] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (!token || !userData) {
      navigate('/signin')
      return
    }

    const parsedUser = JSON.parse(userData)
    console.log('User data:', parsedUser)
    console.log('User type:', parsedUser.userType)
    setUser(parsedUser)
    setUserType(parsedUser.userType || 'user')
    
    // Fetch prescriptions for users (patients)
    if (parsedUser.userType === 'user') {
      fetchPatientPrescriptions(token)
    }
  }, [navigate])

  const fetchPatientPrescriptions = async (token) => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/prescriptions/patient-prescriptions`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      const data = await response.json()
      
      if (response.ok) {
        // Sort by createdAt from newest to oldest
        const sortedPrescriptions = (data.prescriptions || []).sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        )
        setAllPrescriptions(sortedPrescriptions)
        setPrescriptions(sortedPrescriptions)
      } else {
        setError(data.message || 'Failed to fetch prescriptions')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleOrgFilter = (query) => {
    setOrgFilter(query)
    if (!query.trim()) {
      setPrescriptions(allPrescriptions)
      return
    }
    
    const filtered = allPrescriptions.filter(prescription => 
      prescription.prescribedBy?.name.toLowerCase().includes(query.toLowerCase()) ||
      prescription.prescribedBy?.email.toLowerCase().includes(query.toLowerCase())
    )
    setPrescriptions(filtered)
  }

  const searchPatients = async (query) => {
    if (query.length < 2) {
      setSearchResults([])
      return
    }

    const token = localStorage.getItem('token')
    console.log('Searching for:', query)
    console.log('Token:', token ? 'exists' : 'missing')
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/prescriptions/search-patients?query=${encodeURIComponent(query)}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      const data = await response.json()
      console.log('Search response:', data)
      
      if (response.ok) {
        setSearchResults(data.patients || [])
        console.log('Found patients:', data.patients?.length || 0)
      } else {
        console.error('Search failed:', data.message)
        setError(data.message)
      }
    } catch (err) {
      console.error('Search error:', err)
      setError('Failed to search patients')
    }
  }

  const handleSearchChange = (e) => {
    const query = e.target.value
    setSearchQuery(query)
    searchPatients(query)
  }

  const selectPatient = (patient) => {
    setSelectedPatient(patient)
    setSearchQuery(patient.name)
    setSearchResults([])
  }

  const handleViewSearchChange = async (e) => {
    const query = e.target.value
    setViewSearchQuery(query)
    
    if (query.length < 2) {
      setViewSearchResults([])
      return
    }

    const token = localStorage.getItem('token')
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/prescriptions/search-patients?query=${encodeURIComponent(query)}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      const data = await response.json()
      
      if (response.ok) {
        setViewSearchResults(data.patients || [])
      }
    } catch (err) {
      console.error('Search error:', err)
    }
  }

  const selectViewPatient = async (patient) => {
    setSelectedViewPatient(patient)
    setViewSearchQuery(`${patient.name} (${patient.email})`)
    setViewSearchResults([])
    
    // Fetch prescriptions for this patient
    const token = localStorage.getItem('token')
    setLoading(true)
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/prescriptions/patient/${patient._id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      const data = await response.json()
      
      if (response.ok) {
        const sortedPrescriptions = (data.prescriptions || []).sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        )
        setPatientPrescriptions(sortedPrescriptions)
      } else {
        setError(data.message || 'Failed to fetch prescriptions')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const addMedicine = () => {
    setMedicines([...medicines, { 
      name: '', 
      quantity: 1,
      startDate: '',
      endDate: '',
      timing: {
        beforeBreakfast: false,
        afterBreakfast: false,
        beforeLunch: false,
        afterLunch: false,
        beforeDinner: false,
        afterDinner: false,
      },
      label: `Medicine ${medicines.length + 1}`
    }])
  }

  const searchMedicines = async (query, index) => {
    if (query.length < 2) {
      setMedSearchResults(prev => ({ ...prev, [index]: [] }))
      return
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/med-database?search=${encodeURIComponent(query)}`
      )
      const data = await response.json()
      
      if (response.ok) {
        setMedSearchResults(prev => ({ ...prev, [index]: data.medicines || [] }))
      }
    } catch (error) {
      console.error('Error searching medicines:', error)
    }
  }

  const handleMedSearchChange = (index, query) => {
    setMedSearchQueries(prev => ({ ...prev, [index]: query }))
    updateMedicine(index, 'name', query)
    searchMedicines(query, index)
  }

  const selectMedicine = (index, medicine) => {
    updateMedicine(index, 'name', medicine.medicineName)
    setMedSearchQueries(prev => ({ ...prev, [index]: medicine.medicineName }))
    setMedSearchResults(prev => ({ ...prev, [index]: [] }))
  }

  const removeMedicine = (index) => {
    if (medicines.length > 1) {
      setMedicines(medicines.filter((_, i) => i !== index))
      // Clean up search state for this index
      setMedSearchQueries(prev => {
        const newQueries = { ...prev }
        delete newQueries[index]
        return newQueries
      })
      setMedSearchResults(prev => {
        const newResults = { ...prev }
        delete newResults[index]
        return newResults
      })
    }
  }

  const updateMedicine = (index, field, value) => {
    const updated = [...medicines]
    updated[index][field] = value
    setMedicines(updated)
  }

  const handleTimingChange = (index, timing) => {
    const updated = [...medicines]
    updated[index].timing[timing] = !updated[index].timing[timing]
    setMedicines(updated)
  }

  // OCR Image Upload Handler
  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please upload a valid image file')
        return
      }
      
      setUploadedImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
      setError('')
    }
  }

  // Process OCR
  const processOCR = async () => {
    if (!uploadedImage) {
      setError('Please upload a prescription image first')
      return
    }

    setOcrProcessing(true)
    setOcrProgress(0)
    setError('')
    setExtractedText('')

    try {
      const token = localStorage.getItem('token')
      
      // Convert file to base64
      setOcrProgress(10)
      const reader = new FileReader()
      
      const base64Promise = new Promise((resolve, reject) => {
        reader.onloadend = () => resolve(reader.result)
        reader.onerror = reject
        reader.readAsDataURL(uploadedImage)
      })

      const base64Image = await base64Promise
      setOcrProgress(20)

      // Call backend OCR API
      setOcrProgress(30)
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/ocr/extract`,
        { image: base64Image },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      setOcrProgress(80)

      if (response.data.success) {
        const text = response.data.text
        setExtractedText(text)
        setOcrProgress(100)

        // Parse extracted text and fill form
        parseAndFillPrescription(text)
        setShowExtractedData(true)
        setSuccess('Prescription data extracted! Please verify and edit if needed.')
      } else {
        throw new Error(response.data.message || 'Failed to extract text')
      }
      
    } catch (err) {
      console.error('OCR Error:', err)
      setError(err.response?.data?.message || 'Failed to process image. Please try again or enter manually.')
      setOcrProgress(0)
    } finally {
      setOcrProcessing(false)
    }
  }

  // Parse extracted text and auto-fill form
  const parseAndFillPrescription = (text) => {
    const lines = text.split('\n').filter(line => line.trim())
    const parsedMedicines = []
    
    // Common medicine name patterns and keywords
    const medicineKeywords = ['tab', 'tablet', 'cap', 'capsule', 'syrup', 'inj', 'injection', 'mg', 'ml']
    const timingKeywords = {
      beforeBreakfast: ['before breakfast', 'empty stomach', 'morning empty'],
      afterBreakfast: ['after breakfast', 'morning after food', 'post breakfast'],
      beforeLunch: ['before lunch', 'afternoon empty'],
      afterLunch: ['after lunch', 'afternoon after food', 'post lunch'],
      beforeDinner: ['before dinner', 'evening empty', 'night empty'],
      afterDinner: ['after dinner', 'evening after food', 'post dinner', 'bedtime', 'night']
    }

    lines.forEach((line, index) => {
      const lowerLine = line.toLowerCase()
      
      // Check if line contains medicine-related keywords
      const hasMedicineKeyword = medicineKeywords.some(keyword => lowerLine.includes(keyword))
      
      if (hasMedicineKeyword || (line.length > 5 && /[a-zA-Z]{3,}/.test(line))) {
        const medicine = {
          name: '',
          quantity: 1,
          startDate: new Date().toISOString().split('T')[0],
          endDate: '',
          timing: {
            beforeBreakfast: false,
            afterBreakfast: false,
            beforeLunch: false,
            afterLunch: false,
            beforeDinner: false,
            afterDinner: false,
          },
          label: `Medicine ${parsedMedicines.length + 1}`
        }

        // Extract medicine name (first meaningful word/phrase)
        const words = line.trim().split(/\s+/)
        medicine.name = words.slice(0, Math.min(3, words.length)).join(' ')

        // Extract quantity
        const qtyMatch = line.match(/(\d+)\s*(tablet|tab|capsule|cap|times|x|pcs)/i)
        if (qtyMatch) {
          medicine.quantity = parseInt(qtyMatch[1]) || 1
        }

        // Extract duration/dates
        const durationMatch = line.match(/(\d+)\s*(day|days|week|weeks|month|months)/i)
        if (durationMatch) {
          const duration = parseInt(durationMatch[1])
          const unit = durationMatch[2].toLowerCase()
          const startDate = new Date()
          const endDate = new Date()
          
          if (unit.includes('day')) {
            endDate.setDate(endDate.getDate() + duration)
          } else if (unit.includes('week')) {
            endDate.setDate(endDate.getDate() + (duration * 7))
          } else if (unit.includes('month')) {
            endDate.setMonth(endDate.getMonth() + duration)
          }
          
          medicine.startDate = startDate.toISOString().split('T')[0]
          medicine.endDate = endDate.toISOString().split('T')[0]
        }

        // Extract timing
        Object.keys(timingKeywords).forEach(timingKey => {
          timingKeywords[timingKey].forEach(keyword => {
            if (lowerLine.includes(keyword)) {
              medicine.timing[timingKey] = true
            }
          })
        })

        // Check for common patterns like "1-0-1" (breakfast-lunch-dinner)
        const timingPattern = line.match(/(\d+)-(\d+)-(\d+)/)
        if (timingPattern) {
          if (parseInt(timingPattern[1]) > 0) medicine.timing.afterBreakfast = true
          if (parseInt(timingPattern[2]) > 0) medicine.timing.afterLunch = true
          if (parseInt(timingPattern[3]) > 0) medicine.timing.afterDinner = true
        }

        parsedMedicines.push(medicine)
      }
    })

    // If we found medicines, use them; otherwise create one empty medicine
    if (parsedMedicines.length > 0) {
      setMedicines(parsedMedicines)
    } else {
      // Try to extract any text that might be medicine names
      const potentialMeds = lines.filter(line => 
        line.length > 5 && /[a-zA-Z]/.test(line)
      ).slice(0, 5) // Max 5 medicines

      if (potentialMeds.length > 0) {
        const extractedMeds = potentialMeds.map((line, idx) => ({
          name: line.trim(),
          quantity: 1,
          startDate: new Date().toISOString().split('T')[0],
          endDate: '',
          timing: {
            beforeBreakfast: false,
            afterBreakfast: false,
            beforeLunch: false,
            afterLunch: false,
            beforeDinner: false,
            afterDinner: false,
          },
          label: `Medicine ${idx + 1}`
        }))
        setMedicines(extractedMeds)
      }
    }
  }

  // Clear uploaded image
  const clearUploadedImage = () => {
    setUploadedImage(null)
    setImagePreview(null)
    setExtractedText('')
    setShowExtractedData(false)
    setOcrProgress(0)
  }

  const handleSubmitPrescription = async (e) => {
    e.preventDefault()
    
    if (!selectedPatient) {
      setError('Please select a patient')
      return
    }

    if (medicines.some(m => !m.name || m.quantity < 1 || !m.startDate || !m.endDate)) {
      setError('Please fill in all medicine details including dates')
      return
    }

    const token = localStorage.getItem('token')
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/prescriptions/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          patientId: selectedPatient._id,
          medicines: medicines.map(med => ({
            name: med.name,
            quantity: med.quantity,
            startDate: med.startDate,
            endDate: med.endDate,
            timing: med.timing
          }))
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        setSuccess(`Prescription created successfully with ${medicines.length} medicine(s)!`)
        // Reset form
        setSelectedPatient(null)
        setSearchQuery('')
        setMedicines([{ 
          name: '', 
          quantity: 1,
          startDate: '',
          endDate: '',
          timing: {
            beforeBreakfast: false,
            afterBreakfast: false,
            beforeLunch: false,
            afterLunch: false,
            beforeDinner: false,
            afterDinner: false,
          },
          label: 'Medicine 1'
        }])
        setMedSearchQueries({})
        setMedSearchResults({})
      } else {
        setError(data.message || 'Failed to create prescription')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getTimingText = (timing) => {
    const times = []
    if (timing.beforeBreakfast) times.push('Before Breakfast')
    if (timing.afterBreakfast) times.push('After Breakfast')
    if (timing.beforeLunch) times.push('Before Lunch')
    if (timing.afterLunch) times.push('After Lunch')
    if (timing.beforeDinner) times.push('Before Dinner')
    if (timing.afterDinner) times.push('After Dinner')
    return times.length > 0 ? times.join(', ') : 'No timing specified'
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">{t('Loading...')}</div>
      </div>
    )
  }

  // If user type is 'user', show their prescriptions
  if (userType === 'user') {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-4xl font-bold text-gray-800 mb-8">{t('My Prescriptions')}</h1>

            {/* Filter by Organization */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t('Filter by Healthcare Provider')}
              </label>
              <input
                type="text"
                value={orgFilter}
                onChange={(e) => handleOrgFilter(e.target.value)}
                placeholder={t('Search by provider name or email...')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              />
              {orgFilter && (
                <div className="mt-2 text-sm text-gray-600">
                  {t('Showing')} {prescriptions.length} {t('of')} {allPrescriptions.length} {t('prescriptions')}
                  <button
                    onClick={() => handleOrgFilter('')}
                    className="ml-3 text-blue-600 hover:text-blue-800 font-medium"
                  >
                    {t('Clear filter')}
                  </button>
                </div>
              )}
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                {error}
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-xl text-gray-600">{t('Loading prescriptions...')}</div>
              </div>
            ) : prescriptions.length === 0 && !orgFilter ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <p className="text-gray-500 text-lg">{t('You have no prescriptions yet.')}</p>
              </div>
            ) : prescriptions.length === 0 && orgFilter ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <p className="text-gray-500 text-lg">{t('No prescriptions found from this healthcare provider.')}</p>
              </div>
            ) : (
              <div className="space-y-6">
                {prescriptions.map((prescription, index) => (
                  <div key={prescription._id || index} className="bg-white rounded-lg shadow-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">
                          Prescription ID: {prescription._id ? prescription._id.slice(-8) : `PRE-${index + 1}`}
                        </h3>
                        {prescription.prescribedBy && (
                          <p className="text-gray-600 mt-1">
                            Prescribed by: <span className="font-semibold">{prescription.prescribedBy.name}</span>
                            <span className="text-sm text-gray-500"> ({prescription.prescribedBy.email})</span>
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">
                          Created: {formatDate(prescription.createdAt)}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-700 mb-3">Medicines:</h4>
                      <div className="space-y-4">
                        {prescription.medicines && prescription.medicines.map((medicine, idx) => (
                          <div key={medicine._id || idx} className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <div className="font-bold text-lg text-gray-800">{medicine.medicineName}</div>
                                <div className="text-sm text-gray-600 mt-1">Quantity: {medicine.quantity}</div>
                              </div>
                            </div>
                            
                            {/* Duration for this medicine */}
                            <div className="mb-3">
                              <div className="text-sm font-semibold text-gray-700 mb-1">Duration:</div>
                              <div className="text-sm text-gray-600">
                                {formatDate(medicine.startDate)} - {formatDate(medicine.endDate)}
                              </div>
                            </div>
                            
                            {/* Timing for this medicine */}
                            <div>
                              <div className="text-sm font-semibold text-gray-700 mb-2">When to take:</div>
                              <div className="flex flex-wrap gap-2">
                                {medicine.timing.beforeBreakfast && (
                                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                                    Before Breakfast
                                  </span>
                                )}
                                {medicine.timing.afterBreakfast && (
                                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                                    After Breakfast
                                  </span>
                                )}
                                {medicine.timing.beforeLunch && (
                                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                                    Before Lunch
                                  </span>
                                )}
                                {medicine.timing.afterLunch && (
                                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                                    After Lunch
                                  </span>
                                )}
                                {medicine.timing.beforeDinner && (
                                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                                    Before Dinner
                                  </span>
                                )}
                                {medicine.timing.afterDinner && (
                                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                                    After Dinner
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // If not organisation, show access denied
  if (userType !== 'organisation') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">{t('Access Denied')}</h2>
          <p className="text-gray-600">{t('Only organisations can create prescriptions.')}</p>
        </div>
      </div>
    )
  }

  // Organisation view - create prescriptions

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-800 mb-8">{t('Prescriptions Management')}</h1>

          {/* Tabs */}
          <div className="flex gap-4 mb-8 border-b border-gray-300">
            <button
              onClick={() => setActiveTab('create')}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === 'create'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {t('Create Prescription')}
            </button>
            <button
              onClick={() => setActiveTab('view')}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === 'view'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {t('View Patient Prescriptions')}
            </button>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
              {success}
            </div>
          )}

          {/* Create Prescription Tab */}
          {activeTab === 'create' && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <form onSubmit={handleSubmitPrescription}>
              {/* Patient Search */}
              <div className="mb-6 relative">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('Search Patient')} *
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder={t('Search by name or email...')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  autoComplete="off"
                />
                
                {/* Search Results Dropdown */}
                {searchQuery.length >= 2 && !selectedPatient && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-y-auto">
                    {searchResults.length > 0 ? (
                      <div>
                        <div className="px-3 py-2 text-xs font-semibold text-gray-500 bg-gray-50 border-b">
                          {searchResults.length} {searchResults.length !== 1 ? t('patients found') : t('patient found')}
                        </div>
                        {searchResults.map((patient) => (
                          <div
                            key={patient._id}
                            onClick={() => selectPatient(patient)}
                            className="p-4 hover:bg-blue-50 cursor-pointer border-b last:border-b-0 transition"
                          >
                            <div className="flex items-start">
                              <div className="flex-shrink-0 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                                {patient.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-gray-900">{patient.name}</div>
                                <div className="text-sm text-gray-600 truncate">{patient.email}</div>
                                <div className="text-sm text-gray-500">{patient.phone}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center text-gray-500">
                        <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                        </svg>
                        <p className="font-medium">{t('No patients found')}</p>
                        <p className="text-sm mt-1">{t('Try searching with a different name or email')}</p>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Selected Patient Badge */}
                {selectedPatient && (
                  <div className="mt-3 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                          {selectedPatient.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-blue-900">{selectedPatient.name}</div>
                          <div className="text-sm text-blue-700">{selectedPatient.email}</div>
                          <div className="text-sm text-blue-700">{selectedPatient.phone}</div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPatient(null)
                          setSearchQuery('')
                        }}
                        className="flex-shrink-0 ml-4 text-red-600 hover:text-red-800 font-semibold px-3 py-1 rounded hover:bg-red-100 transition"
                      >
                        {t('Change')}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* OCR Image Upload Section */}
              <div className="mb-6 bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg border-2 border-purple-200">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 flex items-center">
                      <svg className="w-6 h-6 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {t('Upload Prescription Image')}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {t('Upload a photo of the prescription to auto-fill medicine details')}
                    </p>
                  </div>
                  {imagePreview && (
                    <button
                      type="button"
                      onClick={clearUploadedImage}
                      className="text-red-600 hover:text-red-800 font-semibold px-3 py-1 rounded hover:bg-red-100 transition text-sm"
                    >
                      {t('Clear Image')}
                    </button>
                  )}
                </div>

                {/* Upload Button */}
                {!imagePreview && (
                  <label className="block cursor-pointer">
                    <div className="border-2 border-dashed border-purple-300 rounded-lg p-8 text-center hover:border-purple-500 hover:bg-purple-50 transition">
                      <svg className="mx-auto h-12 w-12 text-purple-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="text-purple-700 font-semibold mb-1">{t('Click to upload prescription image')}</p>
                      <p className="text-sm text-gray-500">{t('PNG, JPG, JPEG up to 10MB')}</p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}

                {/* Image Preview & OCR Processing */}
                {imagePreview && (
                  <div className="space-y-4">
                    <div className="relative rounded-lg overflow-hidden border-2 border-purple-300">
                      <img 
                        src={imagePreview} 
                        alt="Prescription preview" 
                        className="w-full max-h-96 object-contain bg-white"
                      />
                    </div>

                    {/* Process Button & Progress */}
                    {!ocrProcessing && !extractedText && (
                      <button
                        type="button"
                        onClick={processOCR}
                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition shadow-lg flex items-center justify-center"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {t('Extract Data from Prescription')}
                      </button>
                    )}

                    {/* Processing State */}
                    {ocrProcessing && (
                      <div className="bg-white p-4 rounded-lg border border-purple-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-gray-700">{t('Processing image...')}</span>
                          <span className="text-sm font-bold text-purple-600">{ocrProgress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-purple-600 to-blue-600 h-full rounded-full transition-all duration-300"
                            style={{ width: `${ocrProgress}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2 flex items-center">
                          <svg className="animate-spin h-4 w-4 mr-2 text-purple-600" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          {t('Recognizing text from prescription...')}
                        </p>
                      </div>
                    )}

                    {/* Extracted Data Preview */}
                    {showExtractedData && extractedText && (
                      <div className="bg-white p-4 rounded-lg border-2 border-green-300">
                        <div className="flex items-start">
                          <svg className="w-6 h-6 text-green-600 mr-2 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <div className="flex-1">
                            <h4 className="font-semibold text-green-800 mb-2">{t('Data Extracted Successfully!')}</h4>
                            <p className="text-sm text-gray-700 mb-3">
                              {t('Medicine details have been auto-filled below. Please review and edit if needed before submitting.')}
                            </p>
                            <details className="text-xs">
                              <summary className="cursor-pointer text-purple-600 font-semibold hover:text-purple-800">
                                {t('View Raw Extracted Text')}
                              </summary>
                              <pre className="mt-2 p-3 bg-gray-50 rounded border border-gray-200 overflow-x-auto whitespace-pre-wrap text-gray-700">
                                {extractedText}
                              </pre>
                            </details>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Medicines */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-semibold text-gray-700">
                    {t('Medicines')} *
                  </label>
                  <button
                    type="button"
                    onClick={addMedicine}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
                  >
                    + {t('Add Medicine')}
                  </button>
                </div>
                <div className="space-y-6">
                  {medicines.map((medicine, index) => (
                    <div key={index} className="border-2 border-gray-200 bg-gray-50 p-6 rounded-lg">
                      <div className="flex justify-between items-center mb-4">
                        <input
                          type="text"
                          value={medicine.label}
                          onChange={(e) => updateMedicine(index, 'label', e.target.value)}
                          className="text-lg font-bold text-gray-800 bg-transparent border-b-2 border-transparent hover:border-blue-500 focus:border-blue-500 focus:outline-none px-2 py-1"
                          placeholder={`${t('Medicine')} ${index + 1}`}
                        />
                        {medicines.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeMedicine(index)}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-semibold"
                          >
                            {t('Remove')}
                          </button>
                        )}
                      </div>

                      {/* Medicine Name and Quantity */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="relative">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            {t('Medicine Name')} *
                          </label>
                          <input
                            type="text"
                            value={medSearchQueries[index] || medicine.name}
                            onChange={(e) => handleMedSearchChange(index, e.target.value)}
                            placeholder={t('Search medicine from database...')}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            required
                            autoComplete="off"
                          />
                          
                          {/* Medicine Search Results Dropdown */}
                          {medSearchQueries[index] && medSearchQueries[index].length >= 2 && 
                           medSearchResults[index] && medSearchResults[index].length > 0 && (
                            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                              <div className="px-3 py-2 text-xs font-semibold text-gray-500 bg-gray-50 border-b">
                                {medSearchResults[index].length} {medSearchResults[index].length !== 1 ? t('medicines found') : t('medicine found')}
                              </div>
                              {medSearchResults[index].map((med) => (
                                <div
                                  key={med._id}
                                  onClick={() => selectMedicine(index, med)}
                                  className="p-3 hover:bg-blue-50 cursor-pointer border-b last:border-b-0 transition"
                                >
                                  <div className="font-semibold text-gray-900">{med.medicineName}</div>
                                  <div className="text-sm text-gray-600">{med.composition}</div>
                                  <div className="text-xs text-gray-500 mt-1">
                                    {med.category} • {med.manufacturer}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            {t('Quantity')} *
                          </label>
                          <input
                            type="number"
                            value={medicine.quantity}
                            onChange={(e) => {
                              const value = e.target.value === '' ? '' : parseInt(e.target.value) || 0
                              updateMedicine(index, 'quantity', value)
                            }}
                            placeholder={t('Qty')}
                            min="1"
                            step="1"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            required
                          />
                        </div>
                      </div>

                      {/* Date Range for this medicine */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            {t('Start Date')} *
                          </label>
                          <input
                            type="date"
                            value={medicine.startDate}
                            onChange={(e) => updateMedicine(index, 'startDate', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            {t('End Date')} *
                          </label>
                          <input
                            type="date"
                            value={medicine.endDate}
                            onChange={(e) => updateMedicine(index, 'endDate', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            required
                          />
                        </div>
                      </div>

                      {/* Timing for this medicine */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          {t('Timing (Select when to take this medicine)')} *
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {[
                            { key: 'beforeBreakfast', label: t('Before Breakfast') },
                            { key: 'afterBreakfast', label: t('After Breakfast') },
                            { key: 'beforeLunch', label: t('Before Lunch') },
                            { key: 'afterLunch', label: t('After Lunch') },
                            { key: 'beforeDinner', label: t('Before Dinner') },
                            { key: 'afterDinner', label: t('After Dinner') }
                          ].map((timing) => (
                            <label 
                              key={timing.key} 
                              className="flex items-center space-x-3 cursor-pointer bg-white p-3 rounded-lg hover:bg-blue-50 transition border border-gray-200"
                            >
                              <input
                                type="checkbox"
                                checked={medicine.timing[timing.key]}
                                onChange={() => handleTimingChange(index, timing.key)}
                                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                              />
                              <span className="text-sm font-medium text-gray-700">
                                {timing.label}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 text-white px-6 py-4 rounded-lg font-bold text-lg hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? t('Creating Prescription...') : t('Create Prescription')}
              </button>
            </form>
          </div>
          )}

          {/* View Patient Prescriptions Tab */}
          {activeTab === 'view' && (
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">{t('View Patient Prescriptions')}</h2>
              
              {/* Patient Search */}
              <div className="mb-6 relative">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('Search Patient')} *
                </label>
                <input
                  type="text"
                  value={viewSearchQuery}
                  onChange={handleViewSearchChange}
                  placeholder={t('Search by name or email...')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoComplete="off"
                />
                
                {/* Search Results Dropdown */}
                {viewSearchQuery.length >= 2 && !selectedViewPatient && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-y-auto">
                    {viewSearchResults.length > 0 ? (
                      <div>
                        <div className="px-3 py-2 text-xs font-semibold text-gray-500 bg-gray-50 border-b">
                          {viewSearchResults.length} {viewSearchResults.length !== 1 ? t('patients found') : t('patient found')}
                        </div>
                        {viewSearchResults.map((patient) => (
                          <div
                            key={patient._id}
                            onClick={() => selectViewPatient(patient)}
                            className="p-4 hover:bg-blue-50 cursor-pointer border-b last:border-b-0 transition"
                          >
                            <div className="flex items-start">
                              <div className="flex-shrink-0 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                                {patient.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-gray-900">{patient.name}</div>
                                <div className="text-sm text-gray-600 truncate">{patient.email}</div>
                                <div className="text-sm text-gray-500">{patient.phone}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center text-gray-500">
                        <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                        </svg>
                        <p className="font-medium">{t('No patients found')}</p>
                        <p className="text-sm mt-1">{t('Try searching with a different name or email')}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Display Prescriptions */}
              {selectedViewPatient && (
                <div>
                  <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h3 className="font-semibold text-gray-800">{t('Viewing prescriptions for')}:</h3>
                    <p className="text-gray-700 mt-1">{selectedViewPatient.name} ({selectedViewPatient.email})</p>
                    <button
                      onClick={() => {
                        setSelectedViewPatient(null)
                        setViewSearchQuery('')
                        setPatientPrescriptions([])
                      }}
                      className="mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      ← {t('Search another patient')}
                    </button>
                  </div>

                  {loading ? (
                    <div className="flex items-center justify-center py-20">
                      <div className="text-xl text-gray-600">{t('Loading prescriptions...')}</div>
                    </div>
                  ) : patientPrescriptions.length === 0 ? (
                    <div className="bg-gray-50 rounded-lg p-12 text-center">
                      <p className="text-gray-500 text-lg">{t('No prescriptions found for this patient.')}</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {patientPrescriptions.map((prescription, index) => (
                        <div key={prescription._id || index} className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-xl font-bold text-gray-800">
                                Prescription ID: {prescription._id ? prescription._id.slice(-8) : `PRE-${index + 1}`}
                              </h3>
                              {prescription.prescribedBy && (
                                <p className="text-gray-600 mt-1">
                                  Prescribed by: <span className="font-semibold">{prescription.prescribedBy.name}</span>
                                  <span className="text-sm text-gray-500"> ({prescription.prescribedBy.email})</span>
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-gray-500">
                                Created: {formatDate(prescription.createdAt)}
                              </div>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-semibold text-gray-700 mb-3">Medicines:</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {prescription.medicines && prescription.medicines.map((medicine, idx) => (
                                <div 
                                  key={medicine._id || idx} 
                                  className="bg-white rounded-2xl shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 overflow-hidden relative border border-gray-200"
                                >
                                  <div className="relative h-64 bg-cover bg-center p-6 flex flex-col justify-between" 
                                       style={{
                                         backgroundImage: `linear-gradient(to bottom, rgba(255,255,255,0.7), rgba(255,255,255,0.9)), 
                                         url('data:image/svg+xml,%3Csvg width="100" height="100" xmlns="http://www.w3.org/2000/svg"%3E%3Cdefs%3E%3Cpattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse"%3E%3Cpath d="M 20 0 L 0 0 0 20" fill="none" stroke="black" stroke-width="0.5" opacity="0.1"/%3E%3C/pattern%3E%3C/defs%3E%3Crect width="100" height="100" fill="url(%23grid)"/%3E%3C/svg%3E')`
                                       }}>
                                    
                                    <div>
                                      <h3 className="text-2xl font-bold text-black mb-2 line-clamp-2">
                                        {medicine.medicineName}
                                      </h3>
                                      <p className="text-gray-700 text-sm font-medium">
                                        Qty: {medicine.quantity}
                                      </p>
                                    </div>

                                    <div>
                                      <div className="text-gray-700 text-xs mb-3">
                                        {formatDate(medicine.startDate)} - {formatDate(medicine.endDate)}
                                      </div>
                                      
                                      <div className="flex flex-wrap gap-1">
                                        {medicine.timing.beforeBreakfast && (
                                          <span className="px-2 py-0.5 bg-black text-white text-xs rounded font-semibold">BB</span>
                                        )}
                                        {medicine.timing.afterBreakfast && (
                                          <span className="px-2 py-0.5 bg-gray-700 text-white text-xs rounded font-semibold">AB</span>
                                        )}
                                        {medicine.timing.beforeLunch && (
                                          <span className="px-2 py-0.5 bg-black text-white text-xs rounded font-semibold">BL</span>
                                        )}
                                        {medicine.timing.afterLunch && (
                                          <span className="px-2 py-0.5 bg-gray-700 text-white text-xs rounded font-semibold">AL</span>
                                        )}
                                        {medicine.timing.beforeDinner && (
                                          <span className="px-2 py-0.5 bg-black text-white text-xs rounded font-semibold">BD</span>
                                        )}
                                        {medicine.timing.afterDinner && (
                                          <span className="px-2 py-0.5 bg-gray-700 text-white text-xs rounded font-semibold">AD</span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Prescriptions
