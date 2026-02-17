import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from '../hooks/useTranslation';

const API_URL = `${import.meta.env.VITE_API_URL}/api`;

const MedDatabase = () => {
  const { t } = useTranslation();
  const [medicines, setMedicines] = useState([]);
  const [filteredMedicines, setFilteredMedicines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const categories = [
    'All',
    'Painkiller',
    'Antibiotic',
    'Antacid',
    'Anti-Allergic',
    'Antipyretic',
    'Anti-Inflammatory',
    'Vitamin/Supplement',
    'Antidiabetic',
    'Antihypertensive',
    'Antihistamine',
    'Cough & Cold',
    'Gastrointestinal',
    'Cardiovascular',
    'Respiratory',
    'Other',
  ];

  const [formData, setFormData] = useState({
    medicineName: '',
    composition: '',
    purpose: '',
    category: 'Painkiller',
    dosageAdults: '',
    dosageChildren: '',
    sideEffectsCommon: '',
    sideEffectsRare: '',
    contraindications: '',
    prescriptionRequired: false,
    manufacturer: '',
    imageUrl: '',
  });

  useEffect(() => {
    const userRole = localStorage.getItem('role');
    setIsAdmin(userRole === 'superadmin');
    fetchMedicines();
  }, []);

  useEffect(() => {
    filterMedicines();
  }, [searchTerm, selectedCategory, medicines]);

  const fetchMedicines = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/med-database`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMedicines(response.data.medicines);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch medicines');
    } finally {
      setLoading(false);
    }
  };

  const filterMedicines = () => {
    let filtered = medicines;

    if (searchTerm) {
      filtered = filtered.filter((med) =>
        med.medicineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        med.composition.toLowerCase().includes(searchTerm.toLowerCase()) ||
        med.manufacturer.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory && selectedCategory !== 'All') {
      filtered = filtered.filter((med) => med.category === selectedCategory);
    }

    setFilteredMedicines(filtered);
  };

  const handleAddMedicine = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/med-database`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setShowAddModal(false);
      resetForm();
      fetchMedicines();
      alert('Medicine added successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add medicine');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMedicine = async (id) => {
    if (!window.confirm('Are you sure you want to delete this medicine?')) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/med-database/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchMedicines();
      alert('Medicine deleted successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete medicine');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      medicineName: '',
      composition: '',
      purpose: '',
      category: 'Painkiller',
      dosageAdults: '',
      dosageChildren: '',
      sideEffectsCommon: '',
      sideEffectsRare: '',
      contraindications: '',
      prescriptionRequired: false,
      manufacturer: '',
      imageUrl: '',
    });
  };

  const openDetailModal = (medicine) => {
    setSelectedMedicine(medicine);
    setShowDetailModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t('Medicine Database')}</h1>
            <p className="text-gray-600 mt-1">{t('Comprehensive medicine information repository')}</p>
          </div>
          {isAdmin && (
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              + {t('Add Medicine')}
            </button>
          )}
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('Search Medicine')}
              </label>
              <input
                type="text"
                placeholder={t('Search by name, composition, or manufacturer...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('Filter by Category')}
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat === 'All' ? '' : cat}>
                    {t(cat)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">{t('Loading medicines...')}</p>
          </div>
        )}

        {/* Medicine Cards */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMedicines.length === 0 ? (
              <div className="col-span-full text-center py-12 text-gray-500">
                {t('No medicines found')}
              </div>
            ) : (
              filteredMedicines.map((medicine) => (
                <div
                  key={medicine._id}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer overflow-hidden"
                  onClick={() => openDetailModal(medicine)}
                >
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {medicine.medicineName}
                      </h3>
                      {medicine.prescriptionRequired && (
                        <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded">
                          Rx
                        </span>
                      )}
                    </div>

                    <span className="inline-block bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full mb-3">
                      {medicine.category}
                    </span>

                    <p className="text-sm text-gray-600 mb-2">
                      <strong>{t('Composition')}:</strong> {medicine.composition}
                    </p>

                    <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                      {medicine.purpose}
                    </p>

                    <p className="text-xs text-gray-500">
                      <strong>{t('Manufacturer')}:</strong> {medicine.manufacturer}
                    </p>

                    {isAdmin && (
                      <div className="mt-4 flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteMedicine(medicine._id);
                          }}
                          className="flex-1 bg-red-50 text-red-600 px-3 py-2 rounded hover:bg-red-100 transition text-sm"
                        >
                          {t('Delete')}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Add Medicine Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">{t('Add New Medicine')}</h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAddMedicine} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('Medicine Name')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.medicineName}
                    onChange={(e) =>
                      setFormData({ ...formData, medicineName: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('Composition (Active Ingredients + Strength)')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.composition}
                    onChange={(e) =>
                      setFormData({ ...formData, composition: e.target.value })
                    }
                    placeholder={t('e.g., Paracetamol 500mg')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('Purpose / When to Use')} *
                  </label>
                  <textarea
                    required
                    value={formData.purpose}
                    onChange={(e) =>
                      setFormData({ ...formData, purpose: e.target.value })
                    }
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('Category')} *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {categories.filter((c) => c !== 'All').map((cat) => (
                      <option key={cat} value={cat}>
                        {t(cat)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('Manufacturer')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.manufacturer}
                    onChange={(e) =>
                      setFormData({ ...formData, manufacturer: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('Dosage (Adults)')}
                  </label>
                  <input
                    type="text"
                    value={formData.dosageAdults}
                    onChange={(e) =>
                      setFormData({ ...formData, dosageAdults: e.target.value })
                    }
                    placeholder={t('e.g., 1 tablet 3 times daily')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('Dosage (Children)')}
                  </label>
                  <input
                    type="text"
                    value={formData.dosageChildren}
                    onChange={(e) =>
                      setFormData({ ...formData, dosageChildren: e.target.value })
                    }
                    placeholder={t('e.g., Half tablet twice daily')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('Common Side Effects')}
                  </label>
                  <textarea
                    value={formData.sideEffectsCommon}
                    onChange={(e) =>
                      setFormData({ ...formData, sideEffectsCommon: e.target.value })
                    }
                    rows="2"
                    placeholder={t('e.g., Nausea, Dizziness, Drowsiness')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('Rare Side Effects')}
                  </label>
                  <textarea
                    value={formData.sideEffectsRare}
                    onChange={(e) =>
                      setFormData({ ...formData, sideEffectsRare: e.target.value })
                    }
                    rows="2"
                    placeholder={t('e.g., Allergic reactions, Liver problems')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('Contraindications (When NOT to use)')}
                  </label>
                  <textarea
                    value={formData.contraindications}
                    onChange={(e) =>
                      setFormData({ ...formData, contraindications: e.target.value })
                    }
                    rows="2"
                    placeholder={t('e.g., Pregnancy, Kidney disease, Allergy to paracetamol')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('Image URL (optional)')}
                  </label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, imageUrl: e.target.value })
                    }
                    placeholder="https://example.com/medicine-image.jpg"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.prescriptionRequired}
                      onChange={(e) =>
                        setFormData({ ...formData, prescriptionRequired: e.target.checked })
                      }
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      {t('Prescription Required')}
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  {t('Cancel')}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
                >
                  {loading ? t('Adding...') : t('Add Medicine')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedMedicine && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedMedicine.medicineName}
              </h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                    {t(selectedMedicine.category)}
                  </span>
                  {selectedMedicine.prescriptionRequired && (
                    <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
                      {t('Prescription Required')}
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-1">{t('Composition')}</h3>
                  <p className="text-gray-900">{selectedMedicine.composition}</p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-1">{t('Purpose / When to Use')}</h3>
                  <p className="text-gray-900">{selectedMedicine.purpose}</p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-1">{t('Manufacturer')}</h3>
                  <p className="text-gray-900">{selectedMedicine.manufacturer}</p>
                </div>
              </div>

              {/* Dosage */}
              {(selectedMedicine.dosageAdults || selectedMedicine.dosageChildren) && (
                <div className="bg-blue-50 rounded-lg p-4 space-y-2">
                  <h3 className="font-semibold text-gray-900 mb-2">{t('Dosage Information')}</h3>
                  {selectedMedicine.dosageAdults && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">{t('Adults')}:</p>
                      <p className="text-gray-900">{selectedMedicine.dosageAdults}</p>
                    </div>
                  )}
                  {selectedMedicine.dosageChildren && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">{t('Children')}:</p>
                      <p className="text-gray-900">{selectedMedicine.dosageChildren}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Side Effects */}
              {(selectedMedicine.sideEffectsCommon || selectedMedicine.sideEffectsRare) && (
                <div className="bg-yellow-50 rounded-lg p-4 space-y-2">
                  <h3 className="font-semibold text-gray-900 mb-2">{t('Side Effects')}</h3>
                  {selectedMedicine.sideEffectsCommon && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">{t('Common')}:</p>
                      <p className="text-gray-900">{selectedMedicine.sideEffectsCommon}</p>
                    </div>
                  )}
                  {selectedMedicine.sideEffectsRare && (
                    <div>
                      <p className="text-sm font-medium text-gray-700">{t('Rare')}:</p>
                      <p className="text-gray-900">{selectedMedicine.sideEffectsRare}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Contraindications */}
              {selectedMedicine.contraindications && (
                <div className="bg-red-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {t('Contraindications (When NOT to use)')}
                  </h3>
                  <p className="text-gray-900">{selectedMedicine.contraindications}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedDatabase;
