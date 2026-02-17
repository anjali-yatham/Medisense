import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';

function Profile() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    age: '',
    bloodGroup: '',
    address: '',
    emergencyContact: {
      name: '',
      phone: '',
      relationship: ''
    },
    familyMembers: []
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/signin');
        return;
      }

      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setProfile(response.data);
      setFormData({
        name: response.data.name || '',
        phone: response.data.phone || '',
        age: response.data.age || '',
        bloodGroup: response.data.bloodGroup || '',
        address: response.data.address || '',
        emergencyContact: {
          name: response.data.emergencyContact?.name || '',
          phone: response.data.emergencyContact?.phone || '',
          relationship: response.data.emergencyContact?.relationship || ''
        },
        familyMembers: response.data.familyMembers || []
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Failed to load profile');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('emergency_')) {
      const field = name.replace('emergency_', '');
      setFormData({
        ...formData,
        emergencyContact: {
          ...formData.emergencyContact,
          [field]: value
        }
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const addFamilyMember = () => {
    setFormData({
      ...formData,
      familyMembers: [...formData.familyMembers, { name: '', relation: '', contact: '' }]
    });
  };

  const removeFamilyMember = (index) => {
    setFormData({
      ...formData,
      familyMembers: formData.familyMembers.filter((_, i) => i !== index)
    });
  };

  const updateFamilyMember = (index, field, value) => {
    const updated = [...formData.familyMembers];
    updated[index][field] = value;
    setFormData({ ...formData, familyMembers: updated });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/profile`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setProfile(response.data.user);
      setSuccessMessage('Profile updated successfully!');
      
      // Update localStorage user data
      const userData = JSON.parse(localStorage.getItem('user'));
      userData.name = response.data.user.name;
      userData.phone = response.data.user.phone;
      localStorage.setItem('user', JSON.stringify(userData));

      setTimeout(() => {
        setShowEditModal(false);
        setSuccessMessage('');
      }, 2000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Clear localStorage and redirect
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/');
    } catch (error) {
      console.error('Error deleting account:', error);
      setError('Failed to delete account');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">{t('Loading profile...')}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}

        {error && (
          <div className="max-w-4xl mx-auto mb-6 bg-red-50 border-l-4 border-red-500 text-red-800 px-6 py-4 rounded-r-lg shadow-sm">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
              </svg>
              <span className="font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Main Profile Card */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Action Buttons */}
            <div className="px-8 py-6 bg-gray-50 border-b border-gray-200 flex flex-wrap gap-3 justify-between items-center">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-4xl font-bold text-white">
                    {profile?.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{profile?.name || 'User'}</h2>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold flex items-center gap-1">
                      {profile?.userType === 'organisation' ? (
                        <>
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 11h-4v4h-4v-4H6v-4h4V6h4v4h4v4z"/>
                          </svg>
                          Healthcare
                        </>
                      ) : (
                        <>
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                          </svg>
                          Patient
                        </>
                      )}
                    </span>
                    {profile?.bloodGroup && (
                      <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">
                        {profile.bloodGroup}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
              <button
                onClick={() => setShowEditModal(true)}
                className="inline-flex items-center px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
                {t('Edit Profile')}
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="inline-flex items-center px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
                {t('Delete Account')}
              </button>
              </div>
            </div>

            {/* Profile Content */}
            <div className="p-8">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Personal Information */}
                <div className="space-y-6">
                  <div className="flex items-center mb-4">
                    <svg className="w-6 h-6 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                    </svg>
                    <h2 className="text-xl font-bold text-gray-800">{t('Personal Information')}</h2>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{t('Full Name')}</p>
                      <p className="text-gray-900 font-semibold text-lg">{profile?.name || t('Not provided')}</p>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{t('Email Address')}</p>
                      <p className="text-gray-900 font-medium">{profile?.email || t('Not provided')}</p>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{t('Phone Number')}</p>
                      <p className="text-gray-900 font-medium">{profile?.phone || t('Not provided')}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{t('Age')}</p>
                        <p className="text-gray-900 font-semibold text-lg">{profile?.age || t('N/A')}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{t('Blood Group')}</p>
                        <p className="text-gray-900 font-semibold text-lg">{profile?.bloodGroup || t('N/A')}</p>
                      </div>
                    </div>
                    
                    {/* <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">User Type</p>
                      <p className="text-gray-900 font-medium capitalize">{profile?.userType || 'Not provided'}</p>
                    </div> */}
                  </div>
                </div>

                {/* Additional Information */}
                <div className="space-y-6">
                  <div className="flex items-center mb-4">
                    <svg className="w-6 h-6 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                    </svg>
                    <h2 className="text-xl font-bold text-gray-800">{t('Additional Details')}</h2>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{t('Address')}</p>
                    <p className="text-gray-900 font-medium">{profile?.address || t('Not provided')}</p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{t('Member Since')}</p>
                    <p className="text-gray-900 font-medium">
                      {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      }) : t('Not available')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Emergency Contact Section */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <div className="flex items-center mb-6">
                  <svg className="w-6 h-6 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                  </svg>
                  <h2 className="text-xl font-bold text-gray-800">{t('Emergency Contact')}</h2>
                </div>
                
                <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-6 border border-red-200">
                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <p className="text-xs font-semibold text-red-700 uppercase tracking-wide mb-2">{t('Contact Name')}</p>
                      <p className="text-gray-900 font-semibold text-lg">
                        {profile?.emergencyContact?.name || t('Not provided')}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-red-700 uppercase tracking-wide mb-2">{t('Phone Number')}</p>
                      <p className="text-gray-900 font-semibold text-lg">
                        {profile?.emergencyContact?.phone || t('Not provided')}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-red-700 uppercase tracking-wide mb-2">{t('Relationship')}</p>
                      <p className="text-gray-900 font-semibold text-lg">
                        {profile?.emergencyContact?.relationship || t('Not provided')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Family Members Section */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <div className="flex items-center mb-6">
                  <svg className="w-6 h-6 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                  </svg>
                  <h2 className="text-xl font-bold text-gray-800">{t('Family Members')}</h2>
                </div>
                
                {profile?.familyMembers && profile.familyMembers.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-4">
                    {profile.familyMembers.map((member, index) => (
                      <div key={index} className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-5 border border-green-200 hover:shadow-md transition-shadow">
                        <div className="flex items-start">
                          <div className="flex-shrink-0 w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-xl mr-4">
                            {member.name?.charAt(0).toUpperCase() || '?'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-bold text-gray-900 mb-1">{member.name || 'N/A'}</h3>
                            <p className="text-sm text-gray-600 mb-1">
                              <span className="font-semibold">{t('Relation')}:</span> {member.relation || t('N/A')}
                            </p>
                            <p className="text-sm text-gray-600">
                              <span className="font-semibold">{t('Contact')}:</span> {member.contact || t('N/A')}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-xl p-8 text-center border-2 border-dashed border-gray-300">
                    <svg className="w-16 h-16 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                    </svg>
                    <p className="text-gray-500 font-medium">{t('No family members added yet')}</p>
                    <p className="text-gray-400 text-sm mt-1">{t('Click "Edit Profile" to add family members')}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Edit Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              {/* Modal Header */}
              <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-6 rounded-t-2xl">
                <h2 className="text-3xl font-bold">Edit Profile</h2>
                <p className="text-blue-100 text-sm mt-1">Update your personal information</p>
              </div>
              
              <div className="p-8">{successMessage && (
                <div className="bg-green-50 border-l-4 border-green-500 text-green-800 px-6 py-4 rounded-r-lg mb-6 shadow-sm">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                    <span className="font-medium">{successMessage}</span>
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-800 px-6 py-4 rounded-r-lg mb-6 shadow-sm">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                    </svg>
                    <span className="font-medium">{error}</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleUpdateProfile} className="space-y-6">
                {/* Basic Information Section */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                    </svg>
                    Basic Information
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2 text-sm">Name *</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-semibold mb-2 text-sm">Phone *</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-semibold mb-2 text-sm">Age</label>
                      <input
                        type="number"
                        name="age"
                        value={formData.age}
                        onChange={handleInputChange}
                        min="1"
                        max="150"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-semibold mb-2 text-sm">Blood Group</label>
                      <select
                        name="bloodGroup"
                        value={formData.bloodGroup}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      >
                        <option value="">Select Blood Group</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-gray-700 font-semibold mb-2 text-sm">Address</label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                      placeholder="Enter your full address"
                    />
                  </div>
                </div>

                {/* Emergency Contact Section */}
                <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-6 border border-red-200">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                    </svg>
                    Emergency Contact
                  </h3>
                  
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2 text-sm">Name</label>
                      <input
                        type="text"
                        name="emergency_name"
                        value={formData.emergencyContact.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                        placeholder="Contact person name"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-semibold mb-2 text-sm">Phone</label>
                      <input
                        type="tel"
                        name="emergency_phone"
                        value={formData.emergencyContact.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                        placeholder="Emergency contact number"
                      />
                    </div>

                    <div>
                      <label className="block text-gray-700 font-semibold mb-2 text-sm">Relationship</label>
                      <input
                        type="text"
                        name="emergency_relationship"
                        value={formData.emergencyContact.relationship}
                        onChange={handleInputChange}
                        placeholder="e.g., Father, Mother, Spouse"
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Family Members Section */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                      </svg>
                      Family Members
                    </h3>
                    <button
                      type="button"
                      onClick={addFamilyMember}
                      className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                    >
                      <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                      </svg>
                      Add Member
                    </button>
                  </div>
                  
                  {formData.familyMembers.length === 0 ? (
                    <div className="text-center py-8 bg-white bg-opacity-50 rounded-lg border-2 border-dashed border-green-300">
                      <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                      </svg>
                      <p className="text-gray-500 font-medium">No family members added yet</p>
                      <p className="text-gray-400 text-sm">Click "Add Member" to add family members</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {formData.familyMembers.map((member, index) => (
                        <div key={index} className="bg-white rounded-lg p-5 border-2 border-green-200 shadow-sm relative hover:shadow-md transition-shadow">
                          <button
                            type="button"
                            onClick={() => removeFamilyMember(index)}
                            className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center font-bold shadow-md hover:shadow-lg transition-all"
                            title="Remove family member"
                          >
                            ×
                          </button>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-gray-700 font-semibold mb-2 text-sm">Name</label>
                              <input
                                type="text"
                                value={member.name}
                                onChange={(e) => updateFamilyMember(index, 'name', e.target.value)}
                                placeholder="Family member name"
                                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                              />
                            </div>

                            <div>
                              <label className="block text-gray-700 font-semibold mb-2 text-sm">Relation</label>
                              <input
                                type="text"
                                value={member.relation}
                                onChange={(e) => updateFamilyMember(index, 'relation', e.target.value)}
                                placeholder="e.g., Father, Mother, Spouse"
                                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                              />
                            </div>

                            <div>
                              <label className="block text-gray-700 font-semibold mb-2 text-sm">Contact</label>
                              <input
                                type="tel"
                                value={member.contact}
                                onChange={(e) => updateFamilyMember(index, 'contact', e.target.value)}
                                placeholder="Phone number"
                                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setError('');
                      setSuccessMessage('');
                    }}
                    className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-red-600 to-pink-600 text-white px-8 py-6 rounded-t-2xl">
                <h2 className="text-2xl font-bold flex items-center">
                  <svg className="w-8 h-8 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                  </svg>
                  Delete Account
                </h2>
              </div>
              
              <div className="p-8">
                <div className="mb-6">
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg mb-4">
                    <p className="text-red-800 font-semibold mb-2">⚠️ This action cannot be undone!</p>
                    <p className="text-red-700 text-sm">
                      All your data including medicines, prescriptions, and personal information will be permanently deleted.
                    </p>
                  </div>
                  <p className="text-gray-700">
                    Are you absolutely sure you want to delete your account?
                  </p>
                </div>
                
                {error && (
                  <div className="bg-red-50 border-l-4 border-red-500 text-red-800 px-4 py-3 rounded-r-lg mb-4">
                    {error}
                  </div>
                )}

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setError('');
                    }}
                    className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all font-semibold shadow-md hover:shadow-lg"
                  >
                    Yes, Delete My Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
