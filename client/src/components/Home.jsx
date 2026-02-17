import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DailyMedicineChecklist from "./DailyMedicineChecklist";
import useTranslation from "../hooks/useTranslation";

function Home() {
	const navigate = useNavigate();
	const [user, setUser] = useState(null);
	const { t, language } = useTranslation();

	useEffect(() => {
		// Check if user is logged in
		const token = localStorage.getItem("token");
		const userData = localStorage.getItem("user");

		if (!token) {
			// Redirect to signin if not logged in
			navigate("/signin");
		} else {
			setUser(JSON.parse(userData));
		}
	}, [navigate]);

	// Get current date for display with localization
	const today = new Date();
	const getLocalizedDate = () => {
		const localeMap = {
			en: "en-US",
			hi: "hi-IN",
			te: "te-IN",
			ta: "ta-IN",
			kn: "kn-IN",
			ml: "ml-IN",
			es: "es-ES",
			fr: "fr-FR",
		};
		const dateOptions = {
			weekday: "long",
			year: "numeric",
			month: "long",
			day: "numeric",
		};
		return today.toLocaleDateString(localeMap[language] || "en-US", dateOptions);
	};

	// Get greeting based on time with translation
	const getGreeting = () => {
		const hour = new Date().getHours();
		if (hour < 12) return t("Good Morning");
		if (hour < 17) return t("Good Afternoon");
		return t("Good Evening");
	};

	// Organization Home View
	if (user?.userType === 'organisation') {
		return (
			<div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
				<div className="max-w-7xl mx-auto">
					{/* Welcome Header */}
					<div className="mb-8">
						<h1 className="text-4xl font-bold text-gray-800 mb-2">
							{getGreeting()}, {user?.name?.split(" ")[0] || t("there")}!
						</h1>
						<p className="text-gray-600 font-medium">{getLocalizedDate()}</p>
					</div>

					{/* Organization Dashboard Cards */}
					<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
						{/* Prescriptions Card */}
						<div 
							onClick={() => navigate('/prescriptions')}
							className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 cursor-pointer transition-all duration-300 hover:shadow-xl"
						>
							<div className="flex items-center gap-4 mb-4">
								<div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
									<svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
									</svg>
								</div>
								<div>
									<h3 className="text-xl font-bold text-gray-900">{t('Prescriptions')}</h3>
									<p className="text-sm text-gray-600">{t('Manage patient prescriptions')}</p>
								</div>
							</div>
							<p className="text-gray-600 text-sm">
								{t('Create and view prescriptions for your patients. Upload prescription images with OCR support.')}
							</p>
						</div>

						{/* Medicine Database Card */}
						<div 
							onClick={() => navigate('/med-database')}
							className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 cursor-pointer transition-all duration-300 hover:shadow-xl"
						>
							<div className="flex items-center gap-4 mb-4">
								<div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
									<svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
										<path d="M4.22 11.29l7.07-7.07c.78-.78 2.05-.78 2.83 0l4.95 4.95c.78.78.78 2.05 0 2.83l-7.07 7.07c-.78.78-2.05.78-2.83 0l-4.95-4.95c-.78-.78-.78-2.05 0-2.83zM12 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
									</svg>
								</div>
								<div>
									<h3 className="text-xl font-bold text-gray-900">{t('Medicine Database')}</h3>
									<p className="text-sm text-gray-600">{t('Browse medicine information')}</p>
								</div>
							</div>
							<p className="text-gray-600 text-sm">
								{t('Search and add medicines to the database. View detailed information about medications.')}
							</p>
						</div>

						{/* Profile Card */}
						<div 
							onClick={() => navigate('/profile')}
							className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 cursor-pointer transition-all duration-300 hover:shadow-xl"
						>
							<div className="flex items-center gap-4 mb-4">
								<div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
									<svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
									</svg>
								</div>
								<div>
									<h3 className="text-xl font-bold text-gray-900">{t('My Profile')}</h3>
									<p className="text-sm text-gray-600">{t('View and edit profile')}</p>
								</div>
							</div>
							<p className="text-gray-600 text-sm">
								{t('Manage your organization profile, update information and settings.')}
							</p>
						</div>
					</div>

					{/* Quick Stats */}
					<div className="mt-8 bg-white rounded-lg shadow-lg p-6 border border-gray-200">
						<h2 className="text-2xl font-bold text-gray-900 mb-4">{t('Quick Access')}</h2>
						<div className="grid md:grid-cols-2 gap-4">
							<button
								onClick={() => navigate('/prescriptions')}
								className="p-4 text-left bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors"
							>
								<p className="font-semibold text-blue-900">{t('Create New Prescription')}</p>
								<p className="text-sm text-blue-700 mt-1">{t('Write a new prescription for a patient')}</p>
							</button>
							<button
								onClick={() => navigate('/med-database')}
								className="p-4 text-left bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors"
							>
								<p className="font-semibold text-green-900">{t('Search Medicines')}</p>
								<p className="text-sm text-green-700 mt-1">{t('Find medicines in the database')}</p>
							</button>
						</div>
					</div>

					{/* Healthcare Tips for Organizations */}
					<div className="mt-8 grid md:grid-cols-2 gap-6">
						<div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 transition-all duration-300 hover:shadow-xl">
							<div className="flex items-start gap-3">
								<div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
									<svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
									</svg>
								</div>
								<div>
									<h3 className="text-lg font-bold text-gray-900 mb-2">{t('Best Practice')}</h3>
									<p className="text-gray-600 text-sm leading-relaxed">
										{t('Always verify patient allergies and current medications before prescribing. Use the medicine database to check for potential drug interactions.')}
									</p>
								</div>
							</div>
						</div>

						<div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 transition-all duration-300 hover:shadow-xl">
							<div className="flex items-start gap-3">
								<div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
									<svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
									</svg>
								</div>
								<div>
									<h3 className="text-lg font-bold text-gray-900 mb-2">{t('Documentation')}</h3>
									<p className="text-gray-600 text-sm leading-relaxed">
										{t('Maintain clear and detailed prescription records. Include dosage instructions, duration, and timing to ensure patient safety and compliance.')}
									</p>
								</div>
							</div>
						</div>

						<div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 transition-all duration-300 hover:shadow-xl">
							<div className="flex items-start gap-3">
								<div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
									<svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
									</svg>
								</div>
								<div>
									<h3 className="text-lg font-bold text-gray-900 mb-2">{t('Efficiency Tip')}</h3>
									<p className="text-gray-600 text-sm leading-relaxed">
										{t('Use the OCR feature to quickly extract prescription data from images. This saves time and reduces manual data entry errors.')}
									</p>
								</div>
							</div>
						</div>

						<div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 transition-all duration-300 hover:shadow-xl">
							<div className="flex items-start gap-3">
								<div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
									<svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
									</svg>
								</div>
								<div>
									<h3 className="text-lg font-bold text-gray-900 mb-2">{t('Patient Care')}</h3>
									<p className="text-gray-600 text-sm leading-relaxed">
										{t('Review patient prescription history to identify adherence patterns. This helps in providing better personalized care.')}
									</p>
								</div>
							</div>
						</div>
					</div>

					{/* Inspirational Quote */}
					<div className="mt-8 bg-white rounded-lg shadow-lg p-8 border border-gray-200 text-center">
						<svg className="w-12 h-12 text-blue-600 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
							<path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
						</svg>
						<p className="text-xl text-gray-800 font-medium italic mb-3">
							{t('The art of medicine consists of amusing the patient while nature cures the disease.')}
						</p>
						<p className="text-sm text-gray-600">— {t('Voltaire')}</p>
					</div>
				</div>
			</div>
		);
	}

	// User Home View
	return (
		<div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
			<div className="max-w-7xl mx-auto">
				{/* Welcome Header */}
				<div className="mb-8">
					<h1 className="text-4xl font-bold text-gray-800 mb-2">
						{getGreeting()}, {user?.name?.split(" ")[0] || t("there")}!
					</h1>
					<p className="text-gray-600 font-medium">{getLocalizedDate()}</p>
				</div>

				{/* Daily Medicine Checklist */}
				<div className="mb-8">
					<DailyMedicineChecklist />
				</div>

				{/* Health Tips & Reminders */}
				<div className="grid md:grid-cols-2 gap-6 mb-8">
					<div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 transition-all duration-300 hover:shadow-xl">
						<div className="flex items-start gap-3">
							<div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
								<svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
								</svg>
							</div>
							<div>
								<h3 className="text-lg font-bold text-gray-900 mb-2">{t('Medication Reminder')}</h3>
								<p className="text-gray-600 text-sm leading-relaxed">
									{t('Take your medicines at the same time every day. Set alarms to help you remember your medication schedule.')}
								</p>
							</div>
						</div>
					</div>

					<div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 transition-all duration-300 hover:shadow-xl">
						<div className="flex items-start gap-3">
							<div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
								<svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
								</svg>
							</div>
							<div>
								<h3 className="text-lg font-bold text-gray-900 mb-2">{t('Stay Consistent')}</h3>
								<p className="text-gray-600 text-sm leading-relaxed">
									{t('Consistency is key to medication effectiveness. Never skip doses, even if you feel better.')}
								</p>
							</div>
						</div>
					</div>

					<div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 transition-all duration-300 hover:shadow-xl">
						<div className="flex items-start gap-3">
							<div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
								<svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
								</svg>
							</div>
							<div>
								<h3 className="text-lg font-bold text-gray-900 mb-2">{t('Storage Tips')}</h3>
								<p className="text-gray-600 text-sm leading-relaxed">
									{t('Store medicines in a cool, dry place away from direct sunlight. Keep them out of reach of children.')}
								</p>
							</div>
						</div>
					</div>

					<div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 transition-all duration-300 hover:shadow-xl">
						<div className="flex items-start gap-3">
							<div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
								<svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
								</svg>
							</div>
							<div>
								<h3 className="text-lg font-bold text-gray-900 mb-2">{t('Check Expiry Dates')}</h3>
								<p className="text-gray-600 text-sm leading-relaxed">
									{t('Regularly check medicine expiry dates. Dispose of expired medications safely at a pharmacy.')}
								</p>
							</div>
						</div>
					</div>
				</div>

				{/* Inspirational Quote */}
				<div className="bg-white rounded-lg shadow-lg p-8 border border-gray-200 text-center">
					<svg className="w-12 h-12 text-green-600 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
						<path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
					</svg>
					<p className="text-xl text-gray-800 font-medium italic mb-3">
						{t('Health is not valued until sickness comes.')}
					</p>
					<p className="text-sm text-gray-600">— {t('Thomas Fuller')}</p>
				</div>
			</div>
		</div>
	);
}

export default Home;