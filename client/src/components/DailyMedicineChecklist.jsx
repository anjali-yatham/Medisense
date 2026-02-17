import { useState, useEffect } from "react";
import useTranslation from "../hooks/useTranslation";

const API_URL = import.meta.env.VITE_API_URL;

function DailyMedicineChecklist() {
	const { t } = useTranslation();
	const [medicines, setMedicines] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [actionLoading, setActionLoading] = useState({});
	const [isSpeaking, setIsSpeaking] = useState(false);

	const TIMING_LABELS = {
		beforeBreakfast: {
			label: t("Before Breakfast"),
			short: t("B.Bfast"),
		},
		afterBreakfast: {
			label: t("After Breakfast"),
			short: t("A.Bfast"),
		},
		beforeLunch: { label: t("Before Lunch"), short: t("B.Lunch") },
		afterLunch: { label: t("After Lunch"), short: t("A.Lunch") },
		beforeDinner: {
			label: t("Before Dinner"),
			short: t("B.Dinner"),
		},
		afterDinner: { label: t("After Dinner"), short: t("A.Dinner") },
	};

	const TIMING_SPEECH = {
		beforeBreakfast: "before breakfast",
		afterBreakfast: "after breakfast",
		beforeLunch: "before lunch",
		afterLunch: "after lunch",
		beforeDinner: "before dinner",
		afterDinner: "after dinner",
	};

	useEffect(() => {
		fetchTodaysMedicines();
	}, []);

	const fetchTodaysMedicines = async () => {
		try {
			setLoading(true);
			const token = localStorage.getItem("token");

			const response = await fetch(`${API_URL}/api/medicines/today`, {
				headers: { Authorization: `Bearer ${token}` },
			});

			if (!response.ok) throw new Error("Failed to fetch medicines");

			const data = await response.json();
			console.log(data);
			setMedicines(data.data || []);
			setError(null);
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	const handleToggleMedicine = async (medicineId, timing, currentlyTaken) => {
		const key = `${medicineId}-${timing}`;
		setActionLoading((prev) => ({ ...prev, [key]: true }));

		try {
			const token = localStorage.getItem("token");
			const endpoint = currentlyTaken ? "untake" : "take";

			const response = await fetch(
				`${API_URL}/api/medicines/${medicineId}/${endpoint}`,
				{
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify({ timing }),
				}
			);

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || "Failed to update");
			}

			// Refresh medicines
			await fetchTodaysMedicines();
		} catch (err) {
			alert(err.message);
		} finally {
			setActionLoading((prev) => ({ ...prev, [key]: false }));
		}
	};

	const readPendingMedicines = () => {
		// Stop if already speaking
		if (isSpeaking) {
			window.speechSynthesis.cancel();
			setIsSpeaking(false);
			return;
		}

		// Get available voices and select a more natural one
		const voices = window.speechSynthesis.getVoices();
		// Prefer natural/enhanced voices (Google, Microsoft Neural, or any "Natural" voice)
		const preferredVoice =
			voices.find(
				(v) =>
					v.name.includes("Google") ||
					v.name.includes("Natural") ||
					v.name.includes("Neural") ||
					v.name.includes("Samantha") ||
					v.name.includes("Karen") ||
					v.name.includes("Daniel")
			) ||
			voices.find((v) => v.lang.startsWith("en")) ||
			voices[0];

		// Collect all pending medicines with their timings
		const pendingList = [];
		medicines.forEach((medicine) => {
			const pendingTimings = medicine.timings
				.filter((t) => !t.taken)
				.map((t) => TIMING_SPEECH[t.slot]);

			if (pendingTimings.length > 0) {
				pendingList.push({
					name: medicine.name,
					timings: pendingTimings,
				});
			}
		});

		if (pendingList.length === 0) {
			const utterance = new SpeechSynthesisUtterance(
				"Great job! You have taken all your medicines for today."
			);
			utterance.rate = 0.95;
			utterance.pitch = 1.05;
			utterance.volume = 1;
			if (preferredVoice) utterance.voice = preferredVoice;
			utterance.onend = () => setIsSpeaking(false);
			setIsSpeaking(true);
			window.speechSynthesis.speak(utterance);
			return;
		}

		// Build the speech text with more natural phrasing
		let speechText = "Hi! Here's your medicine reminder. ";
		pendingList.forEach((item, index) => {
			const timingsText = item.timings.join(" and ");
			if (index === 0) {
				speechText += `You still need to take ${item.name} ${timingsText}. `;
			} else {
				speechText += `Also, ${item.name} ${timingsText}. `;
			}
		});
		speechText += "Don't forget to take them on time. Take care!";

		const utterance = new SpeechSynthesisUtterance(speechText);
		utterance.rate = 0.95; // Slightly slower for clarity
		utterance.pitch = 1.05; // Slightly higher for friendliness
		utterance.volume = 1;
		if (preferredVoice) utterance.voice = preferredVoice;
		utterance.onend = () => setIsSpeaking(false);
		utterance.onerror = () => setIsSpeaking(false);

		setIsSpeaking(true);
		window.speechSynthesis.speak(utterance);
	};

	// Load voices when component mounts (needed for some browsers)
	useEffect(() => {
		window.speechSynthesis.getVoices();
	}, []);

	if (loading) {
		return (
			<div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
				<div className="flex justify-center items-center h-20">
					<div className="text-xl text-gray-600">{t('Loading...')}</div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
				<p>{error}</p>
				<button
					onClick={fetchTodaysMedicines}
					className="mt-2 text-sm text-red-600 underline hover:text-red-800">
					{t("Retry")}
				</button>
			</div>
		);
	}

	if (medicines.length === 0) {
		return (
			<div className="bg-white rounded-lg shadow-lg p-12 text-center border border-gray-200">
				<p className="text-gray-500 text-lg">{t("No medicines scheduled for today")}</p>
			</div>
		);
	}

	// Calculate progress
	const totalSlots = medicines.reduce(
		(acc, med) => acc + med.timings.length,
		0
	);
	const takenSlots = medicines.reduce(
		(acc, med) => acc + med.timings.filter((t) => t.taken).length,
		0
	);
	const progressPercent =
		totalSlots > 0 ? Math.round((takenSlots / totalSlots) * 100) : 0;

	return (
		<div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200 transition-all duration-500 hover:shadow-xl hover:-translate-y-0.5">
			{/* Header with Progress */}
			<div className="px-6 py-5 bg-gray-50 border-b border-gray-200">
				<div className="flex items-center justify-between mb-3">
					<div>
						<h3 className="text-xl font-bold text-gray-800">{t("Today's Medicines")}</h3>
						<p className="text-gray-600 text-sm mt-1">
							{takenSlots} {t("of")} {totalSlots} {t("doses taken")}
						</p>
					</div>
					<div className="flex items-center gap-3">
						{/* Read Aloud Button */}
						<button
							onClick={readPendingMedicines}
							className={`p-2 rounded-lg transition-all duration-500 border transform hover:scale-105 ${
								isSpeaking
									? "bg-blue-600 text-white border-blue-600 animate-pulse"
									: "bg-white text-gray-600 border-gray-300 hover:bg-blue-50 hover:border-blue-500 hover:text-blue-600"
							}`}
							title={
								isSpeaking ? t("Stop reading") : t("Read pending medicines")
							}>
							{isSpeaking ? (
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="h-5 w-5"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor">
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
									/>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
									/>
								</svg>
							) : (
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="h-5 w-5"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor">
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
									/>
								</svg>
							)}
						</button>
						<div className="text-right">
							<p className="text-3xl font-bold text-gray-900 transition-all duration-500">{progressPercent}%</p>
							<p className="text-gray-500 text-xs">{t("completed")}</p>
						</div>
					</div>
				</div>
				{/* Progress Bar */}
				<div className="h-2 bg-gray-200 rounded-full overflow-hidden">
					<div
						className="h-full bg-blue-600 transition-all duration-700 ease-out"
						style={{ width: `${progressPercent}%` }}
					/>
				</div>
			</div>

			{/* Medicine List */}
			<div className="divide-y divide-gray-100">
				{medicines.map((medicine) => {
					// Sort timings: untaken first, taken last (rightmost)
					const sortedTimings = [...medicine.timings].sort((a, b) => {
						if (a.taken === b.taken) return 0;
						return a.taken ? 1 : -1;
					});

					return (
						<div key={medicine.id} className="px-6 py-4 transition-colors duration-300 hover:bg-gray-50">
							<div className="flex items-center justify-between mb-3">
								<div className="flex items-center gap-2">
									<span className="font-semibold text-gray-900 transition-colors duration-300 hover:text-blue-600">
										{medicine.name}
									</span>
									<span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full font-medium transition-all duration-300 hover:bg-blue-100 hover:text-blue-700">
										{medicine.quantity} {t("left")}
									</span>
								</div>
							</div>

							{/* Timing Checkboxes */}
							<div className="flex flex-wrap gap-2">
								{sortedTimings.map((timing) => {
									const key = `${medicine.id}-${timing.slot}`;
									const isLoading = actionLoading[key];
									const info = TIMING_LABELS[timing.slot];

									return (
										<label
											key={timing.slot}
											className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all duration-400 transform hover:scale-102 ${
												timing.taken
													? "bg-green-50 border-green-400 text-green-700 hover:bg-green-100 hover:border-green-500 shadow-sm hover:shadow-md"
													: "bg-white border-gray-300 hover:border-blue-500 hover:bg-blue-50 hover:shadow-md"
											} ${isLoading ? "opacity-50 cursor-wait" : ""}`}>
											<input
												type="checkbox"
												checked={timing.taken}
												disabled={isLoading}
												onChange={() =>
													handleToggleMedicine(
														medicine.id,
														timing.slot,
														timing.taken
													)
												}
												className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer"
											/>
											<span className="text-sm font-medium">{info.short}</span>
											{isLoading && (
												<span className="text-xs text-gray-500">{t('...')}</span>
											)}
										</label>
									);
								})}
							</div>
						</div>
					);
				})}
			</div>

			{/* Footer */}
			{progressPercent === 100 && (
				<div className="px-6 py-3 bg-green-50 border-t border-green-200 text-center animate-fadeIn">
					<p className="text-green-700 font-semibold transition-all duration-400 hover:scale-102">
						{t("All medicines taken for today!")}
					</p>
				</div>
			)}
		</div>
	);
}

export default DailyMedicineChecklist;