import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useTranslation from '../hooks/useTranslation'

function SuperAdminDashboard() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [error, setError] = useState('')
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')

  // Check authentication on mount
  useEffect(() => {
    const superAdminAuth = localStorage.getItem('superAdminAuth')
    if (superAdminAuth !== 'true') {
      navigate('/superadmin')
    } else {
      fetchUsers()
    }
  }, [navigate])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/users`)
      const data = await response.json()
      
      if (response.ok) {
        setUsers(data.users)
        setFilteredUsers(data.users)
      } else {
        setError(t('Failed to fetch users'))
      }
    } catch (err) {
      setError(t('Network error'))
    } finally {
      setLoading(false)
    }
  }

  // Filter and search users
  useEffect(() => {
    let result = users

    // Apply search filter
    if (searchTerm) {
      result = result.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone.includes(searchTerm)
      )
    }

    // Apply user type filter
    if (filterType !== 'all') {
      result = result.filter(user => user.userType === filterType)
    }

    setFilteredUsers(result)
  }, [searchTerm, filterType, users])

  const handleUserTypeChange = async (userId, newType) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/users/${userId}/usertype`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userType: newType })
      })

      const data = await response.json()

      if (response.ok) {
        // Update local state
        setUsers(users.map(user => 
          user._id === userId ? { ...user, userType: newType } : user
        ))
      } else {
        alert(data.message || t('Failed to update user type'))
      }
    } catch (err) {
      alert(t('Network error'))
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('superAdminAuth')
    navigate('/superadmin')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">{t('Super Admin Dashboard')}</h1>
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/')}
              className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
            >
              {t('Back to Home')}
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
            >
              {t('Logout')}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-8">{t('Loading users...')}</div>
        ) : (
          <>
            {/* Search and Filter Section */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('Search Users')}
                  </label>
                  <input
                    type="text"
                    placeholder={t('Search by name, email, or phone...')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('Filter by User Type')}
                  </label>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">{t('All Users')}</option>
                    <option value="user">{t('User')}</option>
                    <option value="organisation">{t('Organisation')}</option>
                  </select>
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-600">
                {t('Showing')} {filteredUsers.length} {t('of')} {users.length} {t('users')}
              </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {filteredUsers.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {t('No users found matching your criteria')}
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        {t('Name')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        {t('Email')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        {t('Phone')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        {t('User Type')}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                        {t('Actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <tr key={user._id}>
                        <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{user.phone}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.userType === 'organisation' 
                              ? 'bg-purple-100 text-purple-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {user.userType}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={user.userType}
                            onChange={(e) => handleUserTypeChange(user._id, e.target.value)}
                            className="border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="user">{t('User')}</option>
                            <option value="organisation">{t('Organisation')}</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default SuperAdminDashboard
