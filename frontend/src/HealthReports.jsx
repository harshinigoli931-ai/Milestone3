import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import {
  FaSyringe,
  FaWeight,
  FaBell,
  FaDownload,
  FaHeartbeat,
} from "react-icons/fa";
import api from "./api";

const weightData = [
  { month: "Jan", weight: 10 },
  { month: "Feb", weight: 11 },
  { month: "Mar", weight: 12 },
  { month: "Apr", weight: 13 },
  { month: "May", weight: 14 },
];

const temperatureData = [
  { month: "Jan", temp: 101 },
  { month: "Feb", temp: 102 },
  { month: "Mar", temp: 101 },
  { month: "Apr", temp: 103 },
  { month: "May", temp: 102 },
];

const HealthReports = () => {
  const [pets, setPets] = useState([]);
  const [selectedPetId, setSelectedPetId] = useState("");
  const [selectedPetDetail, setSelectedPetDetail] = useState(null);
  const [downloaded, setDownloaded] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get("/pets")
      .then(res => setPets(res.data.data || []))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (selectedPetId) {
      setLoading(true);
      api.get(`/pets/${selectedPetId}`)
        .then(res => {
          setSelectedPetDetail(res.data.data);
          setLoading(false);
        })
        .catch(e => {
          console.error(e);
          setLoading(false);
        });
    } else {
      setSelectedPetDetail(null);
    }
  }, [selectedPetId]);

  // Compute dynamic vs mock fallback metrics
  const selectedPet = selectedPetDetail ? {
    name: selectedPetDetail.name,
    breed: selectedPetDetail.breed || selectedPetDetail.species,
    age: selectedPetDetail.age + " Years",
    weight: selectedPetDetail.weight ? selectedPetDetail.weight + " kg" : "N/A",
    healthScore: 92, // Mock aesthetic
    vaccinationStatus: selectedPetDetail.vaccinations?.length > 0 ? "Completed" : "Pending",
    vaccinationProgress: selectedPetDetail.vaccinations?.length > 0 ? 100 : 0,
    nextCheckup: "15 March 2026", // Mock aesthetic
    medicalRecords: selectedPetDetail.medicalHistories?.length > 0
      ? selectedPetDetail.medicalHistories.map(m => `${m.diagnosis} (${m.visitDate})`)
      : ["No immediate concerns noted", "Healthy diet recommended"],
    diet: "Dry kibble + chicken", // Mock
    exercise: "Walks twice daily", // Mock
    preventiveCare: "Dewormed, flea/tick treatment done", // Mock
    behavior: "Friendly, playful", // Mock
    emergencyInfo: "Vet: Dr. Smith, PetCare Clinic", // Mock
    advancedMetrics: { heartRate: "90 bpm", hydration: "Normal", mobility: "Excellent" }
  } : null;

  const handleDownload = async () => {
    if (!selectedPetId) return;

    try {
      setLoading(true);
      const res = await api.get(`/pets/${selectedPetId}/health-report`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${selectedPet ? selectedPet.name : 'Pet'}_Health_Report.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 4000);
    } catch (e) {
      console.error("Failed to download PDF", e);
      alert("Failed to download Health Report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* PET SELECTOR */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 mb-8">
        <h2 className="text-xl font-bold mb-4 text-gray-800">
          Select Pet to View Report
        </h2>

        <select
          value={selectedPetId}
          onChange={(e) => setSelectedPetId(e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-orange-400 outline-none"
        >
          <option value="">-- Choose a Pet --</option>
          {pets.map((pet) => (
            <option key={pet.id} value={pet.id}>
              {pet.name} ({pet.breed})
            </option>
          ))}
        </select>
      </div>

      {/* IF PET NOT SELECTED */}
      {!selectedPet && (
        <div className="text-center py-16 bg-orange-50 rounded-xl border-2 border-dashed border-orange-200">
          <div className="text-5xl mb-3">🐾</div>
          <p className="text-gray-500 mb-4 font-semibold">Please select a pet to view health reports</p>
        </div>
      )}

      {/* IF PET SELECTED */}
      {selectedPet && (
        <>
          {/* Header */}
          <div className="flex justify-between items-center mb-8 bg-orange-50 p-6 rounded-2xl">
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <span className="text-4xl shadow-sm">🐾</span>
              {selectedPet.name}'s Health Report
            </h1>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 bg-orange-500 text-white px-5 py-2.5 rounded-full shadow hover:bg-orange-600 transition font-semibold"
            >
              <FaDownload /> Download Report
            </button>
          </div>

          {downloaded && (
            <div className="bg-green-100 text-green-700 p-3 rounded-lg mb-6 text-center font-semibold border border-green-200">
              ✅ Download Completed Successfully!
            </div>
          )}

          {/* CARDS */}
          <div className="grid md:grid-cols-5 gap-6 mb-8">
            <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition flex items-center gap-4">
              <FaWeight className="text-orange-500 text-4xl" />
              <div>
                <h2 className="text-sm text-gray-500 font-semibold">Current Weight</h2>
                <p className="text-xl font-bold text-gray-800">{selectedPet.weight}</p>
              </div>
            </div>

            <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition flex items-center gap-4">
              <FaSyringe className="text-green-500 text-4xl" />
              <div>
                <h2 className="text-sm text-gray-500 font-semibold">Vaccination</h2>
                <p className={`font-bold ${selectedPet.vaccinationStatus === "Completed"
                  ? "text-green-600"
                  : selectedPet.vaccinationStatus === "Pending"
                    ? "text-red-500"
                    : "text-yellow-500"
                  }`}>
                  {selectedPet.vaccinationStatus}
                </p>
              </div>
            </div>

            <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition flex items-center gap-4">
              <FaBell className="text-red-400 text-4xl" />
              <div>
                <h2 className="text-sm text-gray-500 font-semibold">Next Checkup</h2>
                <p className="text-sm font-bold text-gray-800">{selectedPet.nextCheckup}</p>
              </div>
            </div>

            <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition flex items-center gap-4">
              <FaHeartbeat className="text-pink-500 text-4xl" />
              <div>
                <h2 className="text-sm text-gray-500 font-semibold">Health Score</h2>
                <p className="text-xl font-bold text-pink-600">
                  {selectedPet.healthScore}%
                </p>
              </div>
            </div>

            <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition flex flex-col justify-center gap-2">
              <h2 className="text-sm text-gray-500 font-semibold flex items-center gap-2">
                <FaSyringe className="text-green-500" /> Vaccination Progress
              </h2>
              <div className="w-full bg-gray-100 rounded-full h-4 border border-gray-200 overflow-hidden">
                <div
                  className="bg-green-500 h-full rounded-full text-[10px] text-white flex items-center justify-center font-bold"
                  style={{ width: `${selectedPet.vaccinationProgress}%` }}
                >
                  {selectedPet.vaccinationProgress}%
                </div>
              </div>
            </div>
          </div>


          {/* CHARTS LAYER */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* WEIGHT CHART */}
            <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
              <h2 className="text-lg font-bold mb-4 text-gray-800">
                Weight Trend
              </h2>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={weightData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ stroke: '#f97316', strokeWidth: 1, strokeDasharray: '3 3' }} />
                  <Area
                    type="monotone"
                    dataKey="weight"
                    stroke="#f97316"
                    strokeWidth={3}
                    fill="#ffedd5"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* TEMPERATURE CHART */}
            <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
              <h2 className="text-lg font-bold mb-4 text-gray-800">
                Temperature Trend
              </h2>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={temperatureData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} domain={['dataMin - 1', 'dataMax + 1']} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="temp"
                    stroke="#ef4444"
                    strokeWidth={3}
                    dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* DETAILS LAYER */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* MEDICAL RECORDS */}
            <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
              <h2 className="text-lg font-bold mb-4 text-gray-800 border-b pb-2">Medical Records</h2>
              <ul className="space-y-2 mt-4">
                {selectedPet.medicalRecords.map((record, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-gray-600 text-sm">
                    <span className="text-orange-500">•</span> {record}
                  </li>
                ))}
              </ul>
            </div>

            {/* LIFESTYLE & NUTRITION */}
            <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
              <h2 className="text-lg font-bold mb-4 text-gray-800 border-b pb-2">Lifestyle & Nutrition</h2>
              <div className="space-y-3 mt-4 text-sm">
                <p className="text-gray-600"><span className="font-semibold text-gray-800">Diet:</span> {selectedPet.diet}</p>
                <p className="text-gray-600"><span className="font-semibold text-gray-800">Exercise:</span> {selectedPet.exercise}</p>
              </div>
            </div>

            {/* PREVENTIVE CARE */}
            <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
              <h2 className="text-lg font-bold mb-4 text-gray-800 border-b pb-2">Preventive Care</h2>
              <p className="text-sm text-gray-600 mt-4">{selectedPet.preventiveCare}</p>
            </div>

            {/* BEHAVIOR & WELLBEING */}
            <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
              <h2 className="text-lg font-bold mb-4 text-gray-800 border-b pb-2">Behavior & Wellbeing</h2>
              <p className="text-sm text-gray-600 mt-4">{selectedPet.behavior}</p>
            </div>

            {/* EMERGENCY INFO */}
            <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
              <h2 className="text-lg font-bold mb-4 text-gray-800 border-b pb-2">Emergency Info</h2>
              <p className="text-sm text-gray-600 mt-4 bg-red-50 p-3 rounded-lg border border-red-100 text-red-700 font-medium">{selectedPet.emergencyInfo}</p>
            </div>

            {/* ADVANCED METRICS */}
            <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm">
              <h2 className="text-lg font-bold mb-4 text-gray-800 border-b pb-2">Advanced Metrics</h2>
              <div className="space-y-3 mt-4 text-sm">
                <p className="text-gray-600"><span className="font-semibold text-gray-800">Heart Rate:</span> {selectedPet.advancedMetrics.heartRate}</p>
                <p className="text-gray-600"><span className="font-semibold text-gray-800">Hydration:</span> {selectedPet.advancedMetrics.hydration}</p>
                <p className="text-gray-600"><span className="font-semibold text-gray-800">Mobility:</span> {selectedPet.advancedMetrics.mobility}</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default HealthReports;
