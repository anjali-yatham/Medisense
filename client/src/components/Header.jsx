import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import LanguageSwitcher from './LanguageSwitcher'
import useTranslation from '../hooks/useTranslation'
function Header() {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useTranslation()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const profileMenuRef = useRef(null)

  useEffect(() => {
    // Check if user is logged in
    checkAuthStatus()
  }, [location])

  useEffect(() => {
    // Close profile menu when clicking outside
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const checkAuthStatus = () => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (token && userData) {
      setIsLoggedIn(true)
      setUser(JSON.parse(userData))
    } else {
      setIsLoggedIn(false)
      setUser(null)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setIsLoggedIn(false)
    setUser(null)
    navigate('/')
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <nav className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={isLoggedIn ? "/home" : "/"} className="flex items-center space-x-2 group">
            <div className="bg-blue-600 p-2 rounded-lg">
              <span className="text-xl font-black text-white">M</span>
            </div>
            <span className="text-xl font-bold text-gray-800">
              MediSense
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {isLoggedIn ? (
              <>
                <Link 
                  to="/home" 
                  className={`px-4 py-2 font-semibold text-sm transition-all rounded-lg ${
                    location.pathname === '/home' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                  }`}
                >
                  {t('Home')}
                </Link>
                {user?.userType === 'user' && (
                  <Link 
                    to="/medicines" 
                    className={`px-4 py-2 font-semibold text-sm transition-all rounded-lg ${
                      location.pathname === '/medicines' 
                        ? 'bg-blue-600 text-white' 
                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                    }`}
                  >
                    {t('Medicines')}
                  </Link>
                )}
                <Link 
                  to="/prescriptions" 
                  className={`px-4 py-2 font-semibold text-sm transition-all rounded-lg ${
                    location.pathname === '/prescriptions' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                  }`}
                >
                  {t('Prescriptions')}
                </Link>
                <Link 
                  to="/med-database" 
                  className={`px-4 py-2 font-semibold text-sm transition-all rounded-lg ${
                    location.pathname === '/med-database' 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                  }`}
                >
                  {t('Database')}
                </Link>
                {user?.userType === 'user' && (
                  <Link 
                    to="/track-medicines" 
                    className={`px-4 py-2 font-semibold text-sm transition-all rounded-lg ${
                      location.pathname === '/track-medicines' 
                        ? 'bg-blue-600 text-white' 
                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                    }`}
                  >
                    {t('Track')}
                  </Link>
                )}

                {user?.userType === 'user' && (
                  <Link 
                    to="/reports" 
                    className={`px-4 py-2 font-semibold text-sm transition-all rounded-lg ${
                      location.pathname === '/reports' 
                        ? 'bg-blue-600 text-white' 
                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                    }`}
                  >
                    {t('Reports')}
                  </Link>
                )}
                
                {/* Language Switcher */}
                <LanguageSwitcher variant="light" />
                {/* Profile Dropdown */}
                <div className="relative ml-3" ref={profileMenuRef}>
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center space-x-2 px-3 py-2 hover:bg-gray-100 transition-all rounded-lg"
                  >
                    <div className="w-8 h-8 bg-blue-600 flex items-center justify-center rounded-full">
                      <span className="text-sm font-bold text-white">
                        {user?.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-gray-800">{user?.name}</span>
                  </button>

                  {/* Dropdown Menu */}
                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-3 w-56 bg-white border border-gray-200 shadow-lg rounded-lg overflow-hidden">
                      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                        <p className="text-xs text-gray-500 mb-1">Account</p>
                        <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p>
                        <p className="text-xs text-gray-500 truncate mt-0.5">{user?.email}</p>
                      </div>
                      <div className="py-1">
                        <Link
                          to="/profile"
                          onClick={() => setIsProfileMenuOpen(false)}
                          className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          My Profile
                        </Link>
                        <button
                          onClick={() => {
                            handleLogout()
                            setIsProfileMenuOpen(false)
                          }}
                          className="flex items-center w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <svg className="w-4 h-4 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/signin"
                  className="px-5 py-2 text-gray-600 hover:text-gray-800 font-semibold text-sm transition-colors"
                >
                  {t('Sign In')}
                </Link>
                <Link
                  to="/signup"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all rounded-lg"
                >
                  {t('Get Started')}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 hover:bg-gray-100 transition-all text-gray-600 border border-gray-300 rounded-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            {isLoggedIn ? (
              <div className="py-3 space-y-1">
                {/* User Profile Section */}
                <div className="px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-white flex items-center justify-center rounded-full">
                      <span className="text-lg font-bold text-blue-600">
                        {user?.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate">
                        {user?.name}
                      </p>
                      <p className="text-xs text-blue-100 truncate">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                </div>

                <Link
                  to="/home"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-4 py-3 text-sm font-semibold transition-colors rounded-lg mx-2 ${
                    location.pathname === '/home'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {t('Home')}
                </Link>
                {user?.userType === 'user' && (
                  <Link
                    to="/medicines"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block px-4 py-3 text-sm font-semibold transition-colors rounded-lg mx-2 ${
                      location.pathname === '/medicines'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {t('Medicines')}
                  </Link>
                )}
                <Link
                  to="/prescriptions"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-4 py-3 text-sm font-semibold transition-colors rounded-lg mx-2 ${
                    location.pathname === '/prescriptions'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {t('Prescriptions')}
                </Link>
                <Link
                  to="/med-database"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-4 py-3 text-sm font-semibold transition-colors rounded-lg mx-2 ${
                    location.pathname === '/med-database'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {t('Database')}
                </Link>
                {user?.userType === 'user' && (
                  <Link
                    to="/track-medicines"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block px-4 py-3 text-sm font-semibold transition-colors rounded-lg mx-2 ${
                      location.pathname === '/track-medicines'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {t('Track')}
                  </Link>
                )}
                <Link
                  to="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-4 py-3 text-sm font-semibold transition-colors rounded-lg mx-2 ${
                    location.pathname === '/profile'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {t('My Profile')}
                  </div>
                </Link>

                <div className="border-t border-gray-200 mt-2 pt-2 mx-2">
                  <button
                    onClick={() => {
                      handleLogout()
                      setIsMobileMenuOpen(false)
                    }}
                    className="flex items-center w-full px-4 py-3 text-sm font-semibold text-gray-600 bg-white hover:bg-gray-100 transition-colors rounded-lg"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    {t('Sign Out')}
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-3 px-4 space-y-3">
                <Link
                  to="/signin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block w-full px-4 py-3 text-center border border-gray-300 text-gray-600 hover:bg-gray-100 font-semibold text-sm transition-all rounded-lg"
                >
                  {t('Sign In')}
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block w-full px-4 py-3 text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all rounded-lg"
                >
                  {t('Get Started')}
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>
    </header>
  )
}

export default Header
