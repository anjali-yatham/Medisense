import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	BarElement,
	ArcElement,
	Title,
	Tooltip,
	Legend,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import useTranslation from "../hooks/useTranslation";

ChartJS.register(
	CategoryScale,
	LinearScale,
	BarElement,
	ArcElement,
	Title,
	Tooltip,
	Legend
);

const Reports = () => {
	const [medicineData, setMedicineData] = useState({});
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const navigate = useNavigate();
	const { t } = useTranslation();

	useEffect(() => {
		const user = localStorage.getItem("user");
		if (!user) {
			navigate("/signin");
			return;
		}
		fetchMedicineCounts();
	}, [navigate]);

	const fetchMedicineCounts = async () => {
		const token = localStorage.getItem("token");
		setLoading(true);
		setError("");

		try {
			const response = await fetch(
				`${import.meta.env.VITE_API_URL}/api/medicines/medicine-counts`,
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);

			const data = await response.json();

			if (response.ok) {
				setMedicineData(data.data || {});
			} else {
				setError(data.message || "Failed to fetch medicine data");
			}
		} catch (err) {
			setError("Network error. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	// Calculate stats
	const medicines = Object.entries(medicineData);
	const totalTaken = medicines.reduce((sum, [_, counts]) => sum + counts[0], 0);
	const totalMissed = medicines.reduce(
		(sum, [_, counts]) => sum + counts[1],
		0
	);
	const totalDoses = totalTaken + totalMissed;
	const adherenceRate =
		totalDoses > 0 ? Math.round((totalTaken / totalDoses) * 100) : 100;

	// Find most missed medicine
	const mostMissed =
		medicines.length > 0
			? medicines.reduce(
					(max, curr) => (curr[1][1] > max[1][1] ? curr : max),
					medicines[0]
			  )
			: null;

	// Bar chart data
	const barChartData = {
		labels: medicines.map(([name]) => name),
		datasets: [
			{
				label: t("Taken"),
				data: medicines.map(([_, counts]) => counts[0]),
				backgroundColor: "rgba(34, 197, 94, 0.8)",
				borderColor: "rgb(34, 197, 94)",
				borderWidth: 1,
			},
			{
				label: t("Missed"),
				data: medicines.map(([_, counts]) => counts[1]),
				backgroundColor: "rgba(239, 68, 68, 0.8)",
				borderColor: "rgb(239, 68, 68)",
				borderWidth: 1,
			},
		],
	};

	const barChartOptions = {
		responsive: true,
		plugins: {
			legend: { position: "top" },
			title: { display: true, text: t("Medicine Taken vs Missed") },
		},
		scales: {
			y: { beginAtZero: true, ticks: { stepSize: 1 } },
		},
	};

	// Doughnut chart data
	const doughnutData = {
		labels: [t("Taken"), t("Missed")],
		datasets: [
			{
				data: [totalTaken, totalMissed],
				backgroundColor: ["rgba(34, 197, 94, 0.8)", "rgba(239, 68, 68, 0.8)"],
				borderColor: ["rgb(34, 197, 94)", "rgb(239, 68, 68)"],
				borderWidth: 2,
			},
		],
	};

	const doughnutOptions = {
		responsive: true,
		plugins: {
			legend: { position: "bottom" },
			title: { display: true, text: t("Overall Adherence") },
		},
	};

	const downloadPDF = () => {
		const doc = new jsPDF();
		const pageWidth = doc.internal.pageSize.getWidth();

		// Title
		doc.setFontSize(20);
		doc.setTextColor(31, 41, 55);
		doc.text(t("Medicine Adherence Report"), pageWidth / 2, 20, {
			align: "center",
		});

		// Date
		doc.setFontSize(10);
		doc.setTextColor(107, 114, 128);
		doc.text(
			`${t("Generated on")}: ${new Date().toLocaleDateString("en-US", {
				weekday: "long",
				year: "numeric",
				month: "long",
				day: "numeric",
			})}`,
			pageWidth / 2,
			28,
			{ align: "center" }
		);

		// Summary Section
		doc.setFontSize(14);
		doc.setTextColor(31, 41, 55);
		doc.text(t("Summary"), 14, 42);

		doc.setFontSize(11);
		doc.setTextColor(55, 65, 81);
		doc.text(`${t("Total Medicines")}: ${medicines.length}`, 14, 52);
		doc.text(`${t("Total Doses Taken")}: ${totalTaken}`, 14, 60);
		doc.text(`${t("Total Doses Missed")}: ${totalMissed}`, 14, 68);
		doc.text(`${t("Overall Adherence Rate")}: ${adherenceRate}%`, 14, 76);

		// Most Missed Medicine
		if (mostMissed && mostMissed[1][1] > 0) {
			doc.setTextColor(220, 38, 38);
			doc.text(
				`${t("Most Missed")}: ${mostMissed[0]} (${mostMissed[1][1]} ${t("doses")})`,
				14,
				84
			);
		}

		// Medicine Details Table
		doc.setFontSize(14);
		doc.setTextColor(31, 41, 55);
		doc.text(t("Medicine Details"), 14, 98);

		const tableData = medicines.map(([name, counts]) => {
			const taken = counts[0];
			const missed = counts[1];
			const total = taken + missed;
			const rate = total > 0 ? Math.round((taken / total) * 100) : 100;
			return [
				name,
				taken.toString(),
				missed.toString(),
				total.toString(),
				`${rate}%`,
			];
		});

		autoTable(doc, {
			startY: 102,
			head: [[t("Medicine"), t("Taken"), t("Missed"), t("Total"), t("Adherence")]],
			body: tableData,
			theme: "striped",
			headStyles: {
				fillColor: [59, 130, 246],
				textColor: 255,
				fontStyle: "bold",
			},
			alternateRowStyles: { fillColor: [249, 250, 251] },
			styles: {
				fontSize: 10,
				cellPadding: 4,
			},
			columnStyles: {
				0: { cellWidth: 60 },
				1: { cellWidth: 25, halign: "center" },
				2: { cellWidth: 25, halign: "center" },
				3: { cellWidth: 25, halign: "center" },
				4: { cellWidth: 30, halign: "center" },
			},
		});

		// Footer
		const finalY = doc.lastAutoTable.finalY + 15;
		doc.setFontSize(9);
		doc.setTextColor(156, 163, 175);
		doc.text(
			t("This report was generated automatically by MediSense Medicine Tracker."),
			pageWidth / 2,
			finalY,
			{ align: "center" }
		);

		// Save the PDF
		doc.save(`medicine-report-${new Date().toISOString().split("T")[0]}.pdf`);
	};

	if (loading) {
		return (
			<div className="container mx-auto px-4 py-8">
				<div className="flex justify-center items-center h-64">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
				</div>
			</div>
		);
	}

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="max-w-5xl mx-auto">
				{/* Header */}
				<div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
					<div>
				<h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
					<svg className="w-8 h-8 text-black-600" fill="currentColor" viewBox="0 0 24 24">
						<path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
					</svg>
					{t("Medicine Reports")}
				</h1>
						<p className="text-gray-500 mt-1">
							{t("Track your medicine adherence and statistics")}
						</p>
					</div>
					{medicines.length > 0 && (
						<button
							onClick={downloadPDF}
							className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-black-700 transition-colors shadow-md">
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
									d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
								/>
							</svg>
							{t("Download PDF")}
						</button>
					)}
				</div>

				{error && (
					<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
						{error}
					</div>
				)}

				{medicines.length === 0 ? (
					<div className="bg-white rounded-xl shadow-md p-8 text-center">
						<div className="text-6xl mb-4">💊</div>
						<h3 className="text-xl font-semibold text-gray-700 mb-2">
							{t("No Medicine Data")}
						</h3>
						<p className="text-gray-500">
							{t("You don't have any medicine records yet.")}
						</p>
					</div>
				) : (
					<>
						{/* Summary Cards */}
						<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
							<div className="bg-white rounded-xl shadow-md p-5">
								<p className="text-gray-500 text-sm">{t("Total Medicines")}</p>
								<p className="text-2xl font-bold text-gray-800">
									{medicines.length}
								</p>
							</div>
							<div className="bg-white rounded-xl shadow-md p-5">
								<p className="text-gray-500 text-sm">{t("Doses Taken")}</p>
								<p className="text-2xl font-bold text-green-600">
									{totalTaken}
								</p>
							</div>
							<div className="bg-white rounded-xl shadow-md p-5">
								<p className="text-gray-500 text-sm">{t("Doses Missed")}</p>
								<p className="text-2xl font-bold text-red-600">{totalMissed}</p>
							</div>
							<div className="bg-white rounded-xl shadow-md p-5">
								<p className="text-gray-500 text-sm">{t("Adherence Rate")}</p>
								<p
									className={`text-2xl font-bold ${
										adherenceRate >= 80
											? "text-green-600"
											: adherenceRate >= 50
											? "text-yellow-600"
											: "text-red-600"
									}`}>
									{adherenceRate}%
								</p>
							</div>
						</div>

						{/* Medicine Table */}
						<div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
							<div className="px-6 py-4 border-b border-gray-200">
								<h2 className="text-xl font-semibold text-gray-800">
									{t("Medicine Details")}
								</h2>
							</div>
							<div className="overflow-x-auto">
								<table className="w-full">
									<thead className="bg-gray-50">
										<tr>
											<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
												{t("Medicine")}
											</th>
											<th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
												{t("Taken")}
											</th>
											<th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
												{t("Missed")}
											</th>
											<th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
												{t("Adherence")}
											</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-gray-200">
										{medicines.map(([name, counts]) => {
											const taken = counts[0];
											const missed = counts[1];
											const total = taken + missed;
											const rate =
												total > 0 ? Math.round((taken / total) * 100) : 100;
											return (
												<tr key={name} className="hover:bg-gray-50">
													<td className="px-6 py-4 font-medium text-gray-900">
														{name}
													</td>
													<td className="px-6 py-4 text-center">
														<span className="px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800">
															{taken}
														</span>
													</td>
													<td className="px-6 py-4 text-center">
														<span className="px-3 py-1 text-sm font-semibold rounded-full bg-red-100 text-red-800">
															{missed}
														</span>
													</td>
													<td className="px-6 py-4 text-center">
														<span
															className={`px-3 py-1 text-sm font-semibold rounded-full ${
																rate >= 80
																	? "bg-green-100 text-green-800"
																	: rate >= 50
																	? "bg-yellow-100 text-yellow-800"
																	: "bg-red-100 text-red-800"
															}`}>
															{rate}%
														</span>
													</td>
												</tr>
											);
										})}
									</tbody>
								</table>
							</div>
						</div>

						{/* Most Missed Medicine */}
						{mostMissed && mostMissed[1][1] > 0 && (
							<div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
								<h3 className="text-lg font-semibold text-red-800 mb-2">
									⚠️ {t("Most Missed Medicine")}
								</h3>
								<p className="text-red-700">
									<span className="font-bold">{mostMissed[0]}</span> {t("has been missed")} {mostMissed[1][1]} {t("times")}. {t("Consider setting reminders!")}
								</p>
							</div>
						)}

						{/* Charts */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<div className="bg-white rounded-xl shadow-md p-6">
								<Bar data={barChartData} options={barChartOptions} />
							</div>
							<div className="bg-white rounded-xl shadow-md p-6">
								<Doughnut data={doughnutData} options={doughnutOptions} />
							</div>
						</div>
					</>
				)}
			</div>
		</div>
	);
};

export default Reports;