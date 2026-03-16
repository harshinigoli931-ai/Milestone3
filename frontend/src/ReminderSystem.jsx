import React, { useState } from "react";
import api from "./api";
import { toast } from "react-toastify";

export default function ReminderSystem() {
    const [name, setName] = useState("");
    const [vaccine, setVaccine] = useState("");
    const [date, setDate] = useState("");
    const [email, setEmail] = useState("");
    const [vaccines, setVaccines] = useState([]);

    const addVaccine = () => {
        if (!name || !vaccine || !date || !email) {
            toast.error("Please fill all fields!");
            return;
        }

        const vaccineData = { name, vaccine, date, email };
        setVaccines([...vaccines, vaccineData]);

        // Send to reminder backend running on 3001
        fetch("http://localhost:3001/add-vaccine", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(vaccineData)
        })
            .then(() => toast.success("Vaccination saved successfully!"))
            .catch(() => toast.error("Operation failed"));

        setName("");
        setVaccine("");
        setDate("");
    };

    return (
        <div className="w-full">
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 mb-8 max-w-lg mx-auto mt-6">
                <h2 className="text-xl font-bold mb-6 text-gray-800 border-b pb-3">Vaccination Reminder System</h2>

                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Pet Name *</label>
                        <input
                            type="text"
                            placeholder="e.g. Max"
                            value={name} onChange={e => setName(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-orange-400 outline-none"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Vaccine *</label>
                        <select
                            value={vaccine} onChange={e => setVaccine(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-orange-400 outline-none"
                        >
                            <option value="">Select Vaccine</option>
                            <option>Rabies</option>
                            <option>Distemper</option>
                            <option>Parvovirus</option>
                            <option>Hepatitis</option>
                            <option>Leptospirosis</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Date *</label>
                        <input
                            type="date"
                            value={date} onChange={e => setDate(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-orange-400 outline-none"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Email for Reminder *</label>
                        <input
                            type="email"
                            placeholder="e.g. owner@example.com"
                            value={email} onChange={e => setEmail(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-orange-400 outline-none"
                        />
                    </div>

                    <button
                        onClick={addVaccine}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white p-3 rounded-full shadow-md font-bold transition mt-2"
                    >
                        + Add Vaccination
                    </button>
                </div>
            </div>

            {vaccines.length > 0 && (
                <div className="max-w-lg mx-auto mt-8">
                    <h3 className="font-bold text-gray-700 mb-4">Saved Reminders</h3>
                    <div className="space-y-3">
                        {vaccines.map((item, idx) => (
                            <div key={idx} className="bg-white p-4 border border-gray-200 border-l-4 border-l-orange-500 shadow-sm rounded-xl">
                                <div className="flex justify-between items-start mb-2">
                                    <strong className="text-gray-800">{item.name}</strong>
                                    <span className="text-xs font-bold bg-orange-100 text-orange-700 px-2 py-1 rounded-full">{item.date}</span>
                                </div>
                                <div className="text-sm text-gray-600">
                                    <p><strong>Vaccine:</strong> {item.vaccine}</p>
                                    <p><strong>Email:</strong> {item.email}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
