import React from 'react'
import { useNavigate } from 'react-router-dom'
import useTranslation from '../hooks/useTranslation'
import LanguageSwitcher from './LanguageSwitcher'

function StartPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Fixed Header with Language Switcher */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <span className="text-xl font-bold text-gray-800">MediSense</span>
            </div>
            
            {/* Right Side - Language Switcher & Auth Buttons */}
            <div className="flex items-center gap-4">
              <LanguageSwitcher variant="light" />
              <button
                onClick={() => navigate('/signin')}
                className="px-4 py-2 text-gray-700 font-medium hover:text-blue-600 transition-colors"
              >
                {t('Sign In')}
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all"
              >
                {t('Get Started')}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Section 1: Hero Section - Full Screen */}
      <section className="relative min-h-screen flex items-center px-4 sm:px-6 lg:px-8 overflow-hidden pt-16">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/30 to-indigo-500/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-1/2 -left-40 w-96 h-96 bg-gradient-to-br from-cyan-400/20 to-blue-500/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 right-1/4 w-72 h-72 bg-gradient-to-br from-purple-400/20 to-pink-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        </div>
        
        {/* Floating Pills Decoration */}
        <div className="absolute top-20 left-10 w-3 h-3 bg-blue-400 rounded-full opacity-60 animate-bounce" style={{animationDelay: '0.5s'}}></div>
        <div className="absolute top-40 right-20 w-2 h-2 bg-green-400 rounded-full opacity-60 animate-bounce" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-40 left-20 w-4 h-4 bg-purple-400 rounded-full opacity-40 animate-bounce" style={{animationDelay: '1.5s'}}></div>
        
        <div className="max-w-7xl mx-auto w-full relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 backdrop-blur-sm border border-blue-200/50 px-5 py-2.5 mb-8 rounded-full shadow-lg shadow-blue-500/10">
                <span className="w-2 h-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full animate-pulse"></span>
                <span className="text-sm font-semibold tracking-wide bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{t('MEDICAL INNOVATION')}</span>
              </div>
              
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-6 leading-tight">
                <span className="text-gray-800">{t('NEVER')}</span>
                <span className="relative inline-block mx-3">
                  <span className="relative z-10 px-4 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg shadow-xl shadow-blue-500/30">{t('MISS')}</span>
                </span>
                <span className="block mt-3 text-gray-800">{t('A DOSE')}</span>
              </h1>
              
              <p className="text-gray-600 text-lg mb-10 max-w-lg leading-relaxed">
                {t('Revolutionary medication tracking system designed for chronic illness patients, elderly care, and dedicated caregivers.')}
              </p>
              
              <div className="flex flex-wrap gap-4 mb-14">
                <button
                  onClick={() => navigate('/signup')}
                  className="group relative bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 font-bold transition-all duration-300 flex items-center gap-3 rounded-xl shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/40 hover:scale-[1.02] overflow-hidden"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  <span className="relative">{t('START FREE TRIAL')}</span>
                  <svg className="w-5 h-5 relative group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                  </svg>
                </button>
                <button
                  className="group px-8 py-4 font-bold transition-all duration-300 rounded-xl border-2 border-gray-200 hover:border-blue-300 hover:bg-white/80 backdrop-blur-sm text-gray-700 hover:text-blue-600 flex items-center gap-3 shadow-lg hover:shadow-xl"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>
                  {t('WATCH DEMO')}
                </button>
              </div>
              
              <div className="grid grid-cols-3 gap-6">
                <div className="group bg-white/60 backdrop-blur-sm rounded-2xl p-5 border border-white/80 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="text-4xl font-bold mb-1 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">50K+</div>
                  <div className="text-sm text-gray-500 uppercase tracking-wider font-medium">{t('Active Users')}</div>
                </div>
                <div className="group bg-white/60 backdrop-blur-sm rounded-2xl p-5 border border-white/80 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="text-4xl font-bold mb-1 bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">98%</div>
                  <div className="text-sm text-gray-500 uppercase tracking-wider font-medium">{t('Adherence')}</div>
                </div>
                <div className="group bg-white/60 backdrop-blur-sm rounded-2xl p-5 border border-white/80 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="text-4xl font-bold mb-1 bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">24/7</div>
                  <div className="text-sm text-gray-500 uppercase tracking-wider font-medium">{t('Support')}</div>
                </div>
              </div>
            </div>
            
            {/* Right Content - Schedule Visual */}
            <div className="relative">
              {/* Decorative Ring */}
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl blur-2xl"></div>
              
              <div className="relative bg-white/80 backdrop-blur-xl border border-white/50 p-8 rounded-3xl shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                      </svg>
                    </div>
                    <span className="font-bold text-gray-700">{t("Today's Schedule")}</span>
                  </div>
                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm px-4 py-2 font-bold rounded-full shadow-lg shadow-green-500/30">
                    {t('100% ON TIME')}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="group bg-gradient-to-r from-gray-50 to-blue-50/50 border border-gray-100 p-4 flex items-center justify-between rounded-2xl hover:shadow-lg transition-all duration-300 hover:border-blue-200">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 border-2 border-blue-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                      </div>
                      <div>
                        <div className="font-bold text-gray-800">08:00 AM</div>
                        <div className="text-sm text-gray-500">{t('Morning Medication')}</div>
                      </div>
                    </div>
                    <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-green-500/30">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/>
                      </svg>
                    </div>
                  </div>
                  
                  <div className="relative bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600 text-white p-4 flex items-center justify-between rounded-2xl shadow-xl shadow-blue-500/30 overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_-20%,rgba(255,255,255,0.2),transparent_50%)]"></div>
                    <div className="flex items-center gap-4 relative">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/>
                        </svg>
                      </div>
                      <div>
                        <div className="font-bold">02:00 PM</div>
                        <div className="text-sm text-blue-100">{t('Afternoon Dose')}</div>
                      </div>
                    </div>
                    <div className="relative flex items-center gap-2">
                      <span className="text-xs font-medium bg-white/20 px-3 py-1 rounded-full">{t('NOW')}</span>
                      <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                    </div>
                  </div>
                  
                  <div className="group bg-gradient-to-r from-gray-50 to-purple-50/50 border border-gray-100 p-4 flex items-center justify-between rounded-2xl hover:shadow-lg transition-all duration-300 hover:border-purple-200">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 border-2 border-purple-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                        </svg>
                      </div>
                      <div>
                        <div className="font-bold text-gray-800">08:00 PM</div>
                        <div className="text-sm text-gray-500">{t('Evening Schedule')}</div>
                      </div>
                    </div>
                    <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-green-500/30">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Features Section - Full Screen */}
      <section className="relative bg-white min-h-screen flex items-center px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-blue-50/80 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-indigo-50/50 to-transparent"></div>
        
        <div className="max-w-7xl mx-auto w-full py-20 relative z-10">
          <div className="mb-16 text-center">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-indigo-100 px-4 py-2 rounded-full mb-6">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
              <span className="text-sm font-semibold text-blue-700">{t('POWERFUL FEATURES')}</span>
            </div>
            <h2 className="text-5xl font-bold mb-4">
              <span className="text-gray-800">{t('EVERYTHING')}</span>
              <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{t('YOU NEED')}</span>
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              {t('Powerful features designed for real-world medication management challenges')}
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="group relative bg-white/80 backdrop-blur-sm border border-gray-100 p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-5 rounded-2xl shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-800">{t('SMART SCHEDULING')}</h3>
                <p className="text-gray-600 leading-relaxed">
                  {t('Visual calendar organizes complex medication routines automatically')}
                </p>
              </div>
            </div>
            
            <div className="group relative bg-white/80 backdrop-blur-sm border border-gray-100 p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mb-5 rounded-2xl shadow-lg shadow-green-500/30 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-800">{t('INTELLIGENT REMINDERS')}</h3>
                <p className="text-gray-600 leading-relaxed">
                  {t('Multi-channel alerts adapt to your daily routine and preferences')}
                </p>
              </div>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div className="group relative bg-gradient-to-br from-blue-600 via-blue-600 to-indigo-700 text-white p-8 rounded-3xl shadow-xl shadow-blue-500/25 hover:shadow-2xl hover:shadow-blue-500/40 transition-all duration-500 hover:-translate-y-2 overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_-20%,rgba(255,255,255,0.2),transparent_50%)]"></div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
              <div className="relative">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm flex items-center justify-center mb-5 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3">{t('FAMILY CONNECT')}</h3>
                <p className="text-blue-100 leading-relaxed">
                  {t('Real-time updates keep caregivers informed and connected')}
                </p>
              </div>
            </div>
            
            <div className="group relative bg-gradient-to-br from-green-500 via-green-500 to-emerald-600 text-white p-8 rounded-3xl shadow-xl shadow-green-500/25 hover:shadow-2xl hover:shadow-green-500/40 transition-all duration-500 hover:-translate-y-2 overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_-20%,rgba(255,255,255,0.2),transparent_50%)]"></div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
              <div className="relative">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm flex items-center justify-center mb-5 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3">{t('REFILL ALERTS')}</h3>
                <p className="text-green-100 leading-relaxed">
                  {t('Automated tracking with direct pharmacy integration')}
                </p>
              </div>
            </div>
            
            <div className="group relative bg-gradient-to-br from-purple-600 via-purple-600 to-indigo-700 text-white p-8 rounded-3xl shadow-xl shadow-purple-500/25 hover:shadow-2xl hover:shadow-purple-500/40 transition-all duration-500 hover:-translate-y-2 overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_-20%,rgba(255,255,255,0.2),transparent_50%)]"></div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
              <div className="relative">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm flex items-center justify-center mb-5 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3">{t('EASY INTERFACE')}</h3>
                <p className="text-purple-100 leading-relaxed">
                  {t('Large text and voice commands designed for elderly users')}
                </p>
              </div>
            </div>
          </div>
          
          <div className="group relative bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 border border-green-100 p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden">
            <div className="absolute -right-20 -bottom-20 w-60 h-60 bg-gradient-to-br from-green-200/50 to-emerald-200/50 rounded-full blur-3xl"></div>
            <div className="relative flex items-center gap-8">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0 rounded-3xl shadow-xl shadow-green-500/30 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                </svg>
              </div>
              <div>
                <h3 className="text-3xl font-bold mb-2 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{t('HIPAA COMPLIANT')}</h3>
                <p className="text-gray-600 text-lg">
                  {t('Bank-level encryption protects your health information')}
                </p>
              </div>
              <div className="ml-auto hidden lg:flex items-center gap-4">
                <div className="w-12 h-12 bg-white/80 backdrop-blur rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                  </svg>
                </div>
                <div className="w-12 h-12 bg-white/80 backdrop-blur rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: CTA Section - Full Screen */}
      <section className="relative bg-gradient-to-b from-indigo-400 via-blue-500 to-blue-900 text-white min-h-screen flex items-center px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1),transparent_50%)]"></div>
        </div>
        
        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px'}}></div>
        
        <div className="max-w-4xl mx-auto text-center w-full relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 px-5 py-2.5 rounded-full mb-8">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-semibold tracking-wide text-blue-100">{t('JOIN THOUSANDS OF HAPPY USERS')}</span>
          </div>
          
          <h2 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="block">{t('START')}</span>
            <span className="block bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">{t('NOW')}</span>
          </h2>
          
          <p className="text-blue-100 text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
            {t('Join 50,000+ patients and caregivers who transformed their medication management')}
          </p>
          
          <button
            onClick={() => navigate('/signup')}
            className="group relative bg-white text-blue-600 px-10 py-5 font-bold transition-all duration-300 inline-flex items-center gap-3 mb-14 rounded-2xl shadow-2xl shadow-black/20 hover:shadow-3xl hover:scale-105 overflow-hidden"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            <span className="relative text-lg">{t('GET STARTED FREE')}</span>
            <svg className="w-5 h-5 relative group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/>
            </svg>
          </button>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-14">
            <div className="group bg-white/10 backdrop-blur-sm border border-white/20 p-5 rounded-2xl hover:bg-white/20 transition-all duration-300 hover:-translate-y-1">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/>
                </svg>
              </div>
              <div className="text-sm font-bold uppercase tracking-wider">{t('No Credit Card')}</div>
            </div>
            <div className="group bg-white/10 backdrop-blur-sm border border-white/20 p-5 rounded-2xl hover:bg-white/20 transition-all duration-300 hover:-translate-y-1">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <div className="text-sm font-bold uppercase tracking-wider">{t('14-Day Trial')}</div>
            </div>
            <div className="group bg-white/10 backdrop-blur-sm border border-white/20 p-5 rounded-2xl hover:bg-white/20 transition-all duration-300 hover:-translate-y-1">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </div>
              <div className="text-sm font-bold uppercase tracking-wider">{t('Cancel Anytime')}</div>
            </div>
            <div className="group bg-white/10 backdrop-blur-sm border border-white/20 p-5 rounded-2xl hover:bg-white/20 transition-all duration-300 hover:-translate-y-1">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                </svg>
              </div>
              <div className="text-sm font-bold uppercase tracking-wider">{t('HIPAA Secure')}</div>
            </div>
          </div>
          
          <div className="border-t border-white/20 pt-14">
            <div className="grid md:grid-cols-3 gap-12 text-center">
              <div className="group">
                <div className="text-6xl font-bold mb-3 bg-gradient-to-b from-white to-blue-200 bg-clip-text text-transparent group-hover:scale-110 transition-transform inline-block">98%</div>
                <div className="text-sm text-blue-200 uppercase tracking-wider font-medium">{t('Adherence Rate')}</div>
              </div>
              <div className="group">
                <div className="text-6xl font-bold mb-3 bg-gradient-to-b from-white to-blue-200 bg-clip-text text-transparent group-hover:scale-110 transition-transform inline-block">50K+</div>
                <div className="text-sm text-blue-200 uppercase tracking-wider font-medium">{t('Active Users')}</div>
              </div>
              <div className="group">
                <div className="text-6xl font-bold mb-3 bg-gradient-to-b from-white to-blue-200 bg-clip-text text-transparent group-hover:scale-110 transition-transform inline-block">24/7</div>
                <div className="text-sm text-blue-200 uppercase tracking-wider font-medium">{t('Support Team')}</div>
              </div>
            </div>
          </div>
          
          <div className="mt-14 flex items-center justify-center gap-6">
            <div className="flex -space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-rose-500 border-2 border-white/50 flex items-center justify-center text-xs font-bold">JD</div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 border-2 border-white/50 flex items-center justify-center text-xs font-bold">MK</div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 border-2 border-white/50 flex items-center justify-center text-xs font-bold">AS</div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-violet-500 border-2 border-white/50 flex items-center justify-center text-xs font-bold">+</div>
            </div>
            <div className="text-sm text-blue-200 uppercase tracking-wider font-medium">
              {t('Trusted by Healthcare Providers Nationwide')}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default StartPage
