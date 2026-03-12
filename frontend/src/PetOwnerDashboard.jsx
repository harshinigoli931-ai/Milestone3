import React, { useEffect, useState } from "react";
import api from "./api";
import { useNavigate } from "react-router-dom";
import HealthReports from "./HealthReports";

// Convert 24h time string (e.g. "14:00:00" or "14:00") to 12h format ("2:00 PM")
const format12h = (t) => {
    if (!t) return "";
    const [hStr, mStr] = t.split(":");
    let h = parseInt(hStr, 10);
    const m = mStr || "00";
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return `${h}:${m.substring(0, 2)} ${ampm}`;
};

// ─── Icons ─────────────────────────────────────────────────────────────────
const icons = {
    paw: <span className="text-xl">🐾</span>,
    heart: <span className="text-xl">❤️</span>,
    calendar: <span className="text-xl">📅</span>,
    shop: <span className="text-xl">🛍️</span>,
    orders: <span className="text-xl">📦</span>,
    logout: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
    ),
};

const TABS = [
    { id: "pets", label: "Dashboard", icon: icons.paw },
    { id: "health", label: "Health & Tracking", icon: icons.heart },
    { id: "vaccinations", label: "Vaccinations", icon: "💉" },
    { id: "reports", label: "Health Reports", icon: "📋" },
    { id: "book", label: "Book Vet Appointment", icon: icons.calendar },
    { id: "shop", label: "Marketplace", icon: icons.shop },
    { id: "myappts", label: "My Appointments", icon: "🗓️" },
    { id: "orders", label: "Order History", icon: icons.orders },
    { id: "profile", label: "My Profile", icon: "👤" },
];

// ─── Shared UI ─────────────────────────────────────────────────────────────
function Loader() {
    return (
        <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );
}

function EmptyState({ icon, message, action, onAction }) {
    return (
        <div className="text-center py-16 bg-orange-50 rounded-xl border-2 border-dashed border-orange-200">
            <div className="text-5xl mb-3">{icon}</div>
            <p className="text-gray-500 mb-4">{message}</p>
            {action && (
                <button onClick={onAction}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-full text-sm font-semibold transition">
                    {action}
                </button>
            )}
        </div>
    );
}

function Modal({ title, onClose, children }) {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 my-6">
                <div className="flex justify-between items-center p-6 border-b">
                    <h3 className="text-lg font-bold text-gray-800">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
                </div>
                <div className="p-6 max-h-[75vh] overflow-y-auto">{children}</div>
            </div>
        </div>
    );
}

// ─── Tab: My Pets ──────────────────────────────────────────────────────────
function PetsTab({ onSelectPet }) {
    const [pets, setPets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ name: "", species: "", breed: "", age: "", gender: "MALE", weight: "", color: "", microchipId: "", imageUrl: "" });

    const inp = "w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-orange-400 outline-none";

    const loadPets = async () => {
        try {
            setLoading(true);
            const res = await api.get("/pets");
            setPets(res.data.data || []);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { loadPets(); }, []);

    const openAdd = () => {
        setEditing(null);
        setForm({ name: "", species: "", breed: "", age: "", gender: "MALE", weight: "", color: "", microchipId: "", imageUrl: "" });
        setShowModal(true);
    };

    const openEdit = (pet) => {
        setEditing(pet);
        setForm({ name: pet.name, species: pet.species, breed: pet.breed, age: pet.age, gender: pet.gender, weight: pet.weight || "", color: pet.color || "", microchipId: pet.microchipId || "", imageUrl: pet.imageUrl || "" });
        setShowModal(true);
    };

    const handleSubmit = async e => {
        e.preventDefault();
        const payload = { ...form, age: parseInt(form.age), weight: form.weight ? parseFloat(form.weight) : null };
        try {
            if (editing) {
                await api.put(`/pets/${editing.id}`, payload);
                alert("✅ Pet updated!");
            } else {
                await api.post("/pets", payload);
                alert("✅ Pet added!");
            }
            setShowModal(false);
            loadPets();
        } catch (e) { alert(e.response?.data?.message || "Failed"); }
    };

    const deletePet = async (id) => {
        if (!window.confirm("Remove this pet?")) return;
        try {
            await api.delete(`/pets/${id}`);
            loadPets();
        } catch (e) { alert("Failed"); }
    };

    const PET_EMOJI = { DOG: "🐶", CAT: "🐱", BIRD: "🦜", RABBIT: "🐰", FISH: "🐠", OTHER: "🐾" };
    const getEmoji = (species) => PET_EMOJI[species?.toUpperCase()] || "🐾";

    if (loading) return <Loader />;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">My Pets</h2>
                <button onClick={openAdd}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-full text-sm font-semibold transition flex items-center gap-2 shadow-md">
                    + Add Pet
                </button>
            </div>

            {pets.length === 0 ? (
                <EmptyState icon="🐾" message="You haven't added any pets yet." action="Add Your First Pet" onAction={openAdd} />
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {pets.map(pet => (
                        <div key={pet.id} className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition overflow-hidden">
                            <div className="flex justify-center p-6 bg-gradient-to-br from-orange-50 to-amber-50">
                                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-md bg-white flex items-center justify-center text-6xl">
                                    {pet.imageUrl ? (
                                        <img src={pet.imageUrl} alt={pet.name} className="w-full h-full object-cover" />
                                    ) : (
                                        getEmoji(pet.species)
                                    )}
                                </div>
                            </div>
                            <div className="p-4">
                                <h3 className="font-bold text-gray-800 text-lg">{pet.name}</h3>
                                <p className="text-gray-500 text-sm">{pet.breed || pet.species} • {pet.age} yr{pet.age !== 1 ? "s" : ""}</p>
                                {pet.weight && <p className="text-gray-400 text-xs mt-1">⚖️ {pet.weight} kg</p>}
                                <div className="flex gap-2 mt-4">
                                    <button onClick={() => onSelectPet(pet)}
                                        className="flex-1 bg-orange-50 text-orange-600 border border-orange-200 py-2 rounded-lg text-xs font-medium hover:bg-orange-100 transition">
                                        Health Records
                                    </button>
                                    <button onClick={() => openEdit(pet)}
                                        className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-lg text-xs font-medium hover:bg-gray-50 transition">
                                        Edit
                                    </button>
                                    <button onClick={() => deletePet(pet.id)}
                                        className="border border-red-200 text-red-400 py-2 px-3 rounded-lg text-xs hover:bg-red-50 transition">
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <Modal title={editing ? "Edit Pet" : "Add New Pet"} onClose={() => setShowModal(false)}>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1 block">Pet Name *</label>
                                <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className={inp} placeholder="e.g. Max" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1 block">Species *</label>
                                <select required value={form.species} onChange={e => setForm({ ...form, species: e.target.value })} className={inp}>
                                    <option value="">Select species</option>
                                    {["DOG", "CAT", "BIRD", "RABBIT", "FISH", "OTHER"].map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1 block">Breed</label>
                                <input value={form.breed} onChange={e => setForm({ ...form, breed: e.target.value })} className={inp} placeholder="e.g. Labrador" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1 block">Age (years) *</label>
                                <input type="number" required min="0" value={form.age} onChange={e => setForm({ ...form, age: e.target.value })} className={inp} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1 block">Gender</label>
                                <select value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })} className={inp}>
                                    <option value="MALE">Male</option>
                                    <option value="FEMALE">Female</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1 block">Weight (kg)</label>
                                <input type="number" step="0.1" value={form.weight} onChange={e => setForm({ ...form, weight: e.target.value })} className={inp} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1 block">Color</label>
                                <input value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} className={inp} placeholder="e.g. Golden" />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1 block">Microchip ID</label>
                                <input value={form.microchipId} onChange={e => setForm({ ...form, microchipId: e.target.value })} className={inp} />
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">Pet Photo URL</label>
                            <input value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })} className={inp} placeholder="https://example.com/pet-photo.jpg" />
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button type="button" onClick={() => setShowModal(false)}
                                className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition">Cancel</button>
                            <button type="submit"
                                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-lg font-medium transition">
                                {editing ? "Update Pet" : "Add Pet"}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
}

// ─── Tab: Health Records ───────────────────────────────────────────────────
function HealthTab({ selectedPet, setSelectedPet }) {
    const [pets, setPets] = useState([]);
    const [petDetail, setPetDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showMedModal, setShowMedModal] = useState(false);
    const [showVaxModal, setShowVaxModal] = useState(false);
    const [medForm, setMedForm] = useState({ visitDate: "", diagnosis: "", treatment: "", prescription: "", notes: "", vetName: "" });
    const [vaxForm, setVaxForm] = useState({ vaccineName: "", dateGiven: "", nextDueDate: "", batchNumber: "", administeredBy: "" });

    const inp = "w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-orange-400 outline-none";

    useEffect(() => {
        api.get("/pets").then(res => setPets(res.data.data || [])).catch(console.error).finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (selectedPet) loadPetDetail(selectedPet.id);
        else setPetDetail(null);
    }, [selectedPet]);

    const loadPetDetail = async (id) => {
        try {
            const res = await api.get(`/pets/${id}`);
            setPetDetail(res.data.data);
        } catch (e) { console.error(e); }
    };

    const deleteVax = async (vaxId) => {
        if (!window.confirm("Are you sure you want to delete this vaccination record?")) return;
        try {
            await api.delete(`/pets/${selectedPet.id}/vaccinations/${vaxId}`);
            alert("✅ Vaccination deleted!");
            loadPetDetail(selectedPet.id);
        } catch (e) { alert(e.response?.data?.message || "Failed to delete"); }
    };

    const addMedHistory = async e => {
        e.preventDefault();
        try {
            await api.post(`/pets/${selectedPet.id}/medical-history`, medForm);
            alert("✅ Medical record added!");
            setShowMedModal(false);
            setMedForm({ visitDate: "", diagnosis: "", treatment: "", prescription: "", notes: "", vetName: "" });
            loadPetDetail(selectedPet.id);
        } catch (e) { alert(e.response?.data?.message || "Failed"); }
    };

    const addVax = async e => {
        e.preventDefault();
        try {
            await api.post(`/pets/${selectedPet.id}/vaccinations`, vaxForm);
            alert("✅ Vaccination record added!");
            setShowVaxModal(false);
            setVaxForm({ vaccineName: "", dateGiven: "", nextDueDate: "", batchNumber: "", administeredBy: "" });
            loadPetDetail(selectedPet.id);
        } catch (e) { alert(e.response?.data?.message || "Failed"); }
    };

    if (loading) return <Loader />;

    return (
        <div>
            <h2 className="text-xl font-bold text-gray-800 mb-6">Health Records</h2>

            {!selectedPet ? (
                <div>
                    <p className="text-gray-600 mb-4">Select a pet to view records:</p>
                    {pets.length === 0 ? (
                        <EmptyState icon="🐾" message="Add a pet first to track health records." />
                    ) : (
                        <div className="grid md:grid-cols-3 gap-4">
                            {pets.map(pet => (
                                <button key={pet.id} onClick={() => setSelectedPet(pet)}
                                    className="p-5 border-2 border-gray-200 rounded-xl text-left hover:border-orange-400 hover:bg-orange-50/40 transition flex flex-col items-center">
                                    <div className="w-20 h-20 rounded-full overflow-hidden mb-3 border-2 border-white shadow-sm bg-orange-100 flex items-center justify-center text-4xl">
                                        {pet.imageUrl ? (
                                            <img src={pet.imageUrl} alt={pet.name} className="w-full h-full object-cover" />
                                        ) : (
                                            "🐾"
                                        )}
                                    </div>
                                    <h3 className="font-bold text-gray-800">{pet.name}</h3>
                                    <p className="text-gray-500 text-sm italic">{pet.breed || pet.species}</p>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                <div>
                    <div className="flex items-center justify-between mb-8 bg-orange-50 p-4 rounded-2xl">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm">
                                {selectedPet.imageUrl ? (
                                    <img src={selectedPet.imageUrl} alt={selectedPet.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-orange-100 text-xl">🐾</div>
                                )}
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-800">{selectedPet.name}</h3>
                                <p className="text-xs text-gray-500">Health & Medical History</p>
                            </div>
                        </div>
                        <button onClick={() => { setSelectedPet(null); setPetDetail(null); }}
                            className="bg-white text-orange-500 border border-orange-200 px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-orange-100 transition shadow-sm">
                            ← Switch Pet
                        </button>
                    </div>

                    {/* Medical History */}
                    <div className="mb-8">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="font-semibold text-gray-700">Medical History</h4>
                            <button onClick={() => setShowMedModal(true)}
                                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full text-xs font-semibold transition">
                                + Add Record
                            </button>
                        </div>
                        {!petDetail?.medicalHistories?.length ? (
                            <p className="text-gray-400 text-sm bg-gray-50 p-4 rounded-xl">No medical history recorded.</p>
                        ) : (
                            <div className="space-y-3">
                                {petDetail.medicalHistories.map((m, i) => (
                                    <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                                        <div className="flex justify-between mb-2">
                                            <span className="font-semibold text-gray-800 text-sm">{m.diagnosis}</span>
                                            <span className="text-gray-400 text-xs">{m.visitDate}</span>
                                        </div>
                                        <p className="text-gray-600 text-sm">Treatment: {m.treatment}</p>
                                        {m.prescription && <p className="text-gray-500 text-xs mt-1">💊 {m.prescription}</p>}
                                        {m.vetName && <p className="text-gray-400 text-xs mt-1">👨‍⚕️ Dr. {m.vetName}</p>}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Vaccinations */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="font-semibold text-gray-700">Vaccination Records</h4>
                            <button onClick={() => setShowVaxModal(true)}
                                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full text-xs font-semibold transition">
                                + Add Vaccine
                            </button>
                        </div>
                        {!petDetail?.vaccinations?.length ? (
                            <p className="text-gray-400 text-sm bg-gray-50 p-4 rounded-xl">No vaccination records.</p>
                        ) : (
                            <div className="grid md:grid-cols-2 gap-3">
                                {petDetail.vaccinations.map((v, i) => (
                                    <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                                        <div className="flex justify-between items-start mb-1">
                                            <div className="flex-1">
                                                <div className="flex justify-between mb-1">
                                                    <span className="font-semibold text-gray-800 text-sm">💉 {v.vaccineName}</span>
                                                    {v.nextDueDate && (
                                                        <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                                                            Due: {v.nextDueDate}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-gray-500 text-xs">Given: {v.dateGiven}</p>
                                                {v.administeredBy && <p className="text-gray-400 text-xs">👨‍⚕️ Dr. {v.administeredBy}</p>}
                                            </div>
                                            <button
                                                onClick={() => deleteVax(v.id)}
                                                className="ml-2 text-red-300 hover:text-red-500 transition text-sm"
                                                title="Delete record"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Medical History Modal */}
            {showMedModal && (
                <Modal title="Add Medical Record" onClose={() => setShowMedModal(false)}>
                    <form onSubmit={addMedHistory} className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">Visit Date *</label>
                            <input type="date" required value={medForm.visitDate} onChange={e => setMedForm({ ...medForm, visitDate: e.target.value })} className={inp} />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">Diagnosis *</label>
                            <input required value={medForm.diagnosis} onChange={e => setMedForm({ ...medForm, diagnosis: e.target.value })} className={inp} placeholder="e.g. Ear Infection" />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">Treatment</label>
                            <textarea value={medForm.treatment} onChange={e => setMedForm({ ...medForm, treatment: e.target.value })} className={inp} rows={2} placeholder="Treatment given..." />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">Prescribed Medications</label>
                            <input value={medForm.prescription} onChange={e => setMedForm({ ...medForm, prescription: e.target.value })} className={inp} placeholder="e.g. Amoxicillin 50mg" />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">Vet Name</label>
                            <input value={medForm.vetName} onChange={e => setMedForm({ ...medForm, vetName: e.target.value })} className={inp} placeholder="Dr. Sharma" />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">Notes</label>
                            <textarea value={medForm.notes} onChange={e => setMedForm({ ...medForm, notes: e.target.value })} className={inp} rows={2} />
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button type="button" onClick={() => setShowMedModal(false)}
                                className="flex-1 border border-gray-300 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50 transition">Cancel</button>
                            <button type="submit"
                                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-lg transition">Save Record</button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* Vaccination Modal */}
            {showVaxModal && (
                <Modal title="Add Vaccination Record" onClose={() => setShowVaxModal(false)}>
                    <form onSubmit={addVax} className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">Vaccine Name *</label>
                            <input required value={vaxForm.vaccineName} onChange={e => setVaxForm({ ...vaxForm, vaccineName: e.target.value })} className={inp} placeholder="e.g. Rabies, Distemper" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1 block">Date Given *</label>
                                <input type="date" required value={vaxForm.dateGiven} onChange={e => setVaxForm({ ...vaxForm, dateGiven: e.target.value })} className={inp} />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1 block">Next Due Date</label>
                                <input type="date" value={vaxForm.nextDueDate} onChange={e => setVaxForm({ ...vaxForm, nextDueDate: e.target.value })} className={inp} />
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">Batch Number</label>
                            <input value={vaxForm.batchNumber} onChange={e => setVaxForm({ ...vaxForm, batchNumber: e.target.value })} className={inp} />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">Vet Name / Administered By</label>
                            <input value={vaxForm.administeredBy} onChange={e => setVaxForm({ ...vaxForm, administeredBy: e.target.value })} className={inp} placeholder="Dr. Patel" />
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button type="button" onClick={() => setShowVaxModal(false)}
                                className="flex-1 border border-gray-300 py-2.5 rounded-lg text-gray-700 hover:bg-gray-50 transition">Cancel</button>
                            <button type="submit"
                                className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2.5 rounded-lg transition">Save Vaccine</button>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
}

// ─── Tab: Book Appointment ─────────────────────────────────────────────────
function BookAppointmentTab() {
    const [slots, setSlots] = useState([]);
    const [pets, setPets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState({ slotId: "", petId: "", notes: "", consultationType: "", preferredTime: "" });
    const [booking, setBooking] = useState(false);
    const [bookedTimes, setBookedTimes] = useState([]);
    const [timeConflict, setTimeConflict] = useState(false);

    const inp = "w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-orange-400 outline-none";

    useEffect(() => {
        Promise.all([
            api.get("/appointments/slots"),
            api.get("/pets")
        ]).then(([slotsRes, petsRes]) => {
            const fetchedSlots = slotsRes.data.data || [];
            fetchedSlots.sort((a, b) => {
                const dateTimeA = new Date(`${a.date}T${a.startTime}`);
                const dateTimeB = new Date(`${b.date}T${b.startTime}`);
                return dateTimeB - dateTimeA;
            });
            setSlots(fetchedSlots);
            setPets(petsRes.data.data || []);
        }).catch(console.error).finally(() => setLoading(false));
    }, []);

    const handleSlotSelect = async (slotId) => {
        setForm({ ...form, slotId: slotId.toString(), preferredTime: "" });
        setTimeConflict(false);
        try {
            const res = await api.get(`/appointments/slots/${slotId}/booked-times`);
            setBookedTimes(res.data.data || []);
        } catch (e) {
            setBookedTimes([]);
        }
    };

    const handleTimeChange = (time) => {
        setForm({ ...form, preferredTime: time });
        if (time && bookedTimes.length > 0) {
            const [h, m] = time.split(":").map(Number);
            const selectedMins = h * 60 + m;
            const tooClose = bookedTimes.some(bt => {
                const [bh, bm] = bt.split(":").map(Number);
                const bookedMins = bh * 60 + bm;
                return Math.abs(selectedMins - bookedMins) < 10;
            });
            setTimeConflict(tooClose);
        } else {
            setTimeConflict(false);
        }
    };

    const handleBook = async e => {
        e.preventDefault();
        if (timeConflict) {
            alert("⚠️ This preferred time is within 10 minutes of an existing booking. Please choose a different time.");
            return;
        }
        setBooking(true);
        try {
            await api.post("/appointments/book", {
                slotId: parseInt(form.slotId),
                petId: parseInt(form.petId),
                notes: form.notes,
                consultationType: form.consultationType,
                preferredTime: form.preferredTime
            });
            alert("✅ Appointment booked successfully!");
            setForm({ slotId: "", petId: "", notes: "", consultationType: "", preferredTime: "" });
            setBookedTimes([]);
            setTimeConflict(false);
        } catch (e) { alert(e.response?.data?.message || "Booking failed"); }
        finally { setBooking(false); }
    };

    if (loading) return <Loader />;

    return (
        <div>
            <h2 className="text-xl font-bold text-gray-800 mb-6">Book an Appointment</h2>
            {slots.length === 0 ? (
                <EmptyState icon="📅" message="No appointment slots available right now. Check back later!" />
            ) : (
                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Slots Grid */}
                    <div>
                        <h3 className="font-semibold text-gray-700 mb-4">Available Slots</h3>
                        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                            {slots.map(slot => (
                                <div
                                    key={slot.id}
                                    onClick={() => handleSlotSelect(slot.id)}
                                    className={`p-4 rounded-xl border-2 cursor-pointer transition ${form.slotId === slot.id.toString()
                                        ? "border-orange-500 bg-orange-50"
                                        : "border-gray-200 bg-white hover:border-orange-300"
                                        }`}
                                >
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="font-semibold text-gray-800 text-sm">📅 {slot.date}</p>
                                            <p className="text-gray-500 text-xs">⏰ {format12h(slot.startTime)} – {format12h(slot.endTime)}</p>
                                            {slot.vetName && <p className="text-gray-400 text-xs mt-1">🩺 Dr. {slot.vetName}</p>}
                                        </div>
                                        <span className={`text-xs px-3 py-1 rounded-full font-bold ${slot.consultationType === "ONLINE" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
                                            }`}>
                                            {slot.consultationType}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Booking Form */}
                    <div>
                        <h3 className="font-semibold text-gray-700 mb-4">Booking Details</h3>
                        <form onSubmit={handleBook} className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5 shadow-sm">
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1 block">Selected Slot</label>
                                <input readOnly value={
                                    form.slotId
                                        ? (() => { const s = slots.find(s => s.id === parseInt(form.slotId)); return s ? `${s.date} | ${format12h(s.startTime)} – ${format12h(s.endTime)}` : ""; })()
                                        : "Click a slot on the left"
                                } className={inp + " bg-gray-50 cursor-not-allowed"} />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1 block">Select Pet *</label>
                                {pets.length === 0 ? (
                                    <div className="text-sm text-red-500 mb-2 border border-red-200 bg-red-50 p-3 rounded-lg">
                                        ⚠️ You have no pets registered. Please go to the <strong>Dashboard</strong> tab and add a pet first to book an appointment.
                                    </div>
                                ) : (
                                    <select required value={form.petId} onChange={e => setForm({ ...form, petId: e.target.value })} className={inp}>
                                        <option value="">Choose your pet...</option>
                                        {pets.map(p => <option key={p.id} value={p.id}>{p.name} ({p.breed})</option>)}
                                    </select>
                                )}
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1 block">Notes / Concerns</label>
                                <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className={inp} rows={3} placeholder="Describe any symptoms or concerns..." />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-1 block">Consultation Mode *</label>
                                    <select required value={form.consultationType} onChange={e => setForm({ ...form, consultationType: e.target.value })} className={inp}>
                                        <option value="">Select Mode...</option>
                                        <option value="CLINIC">Clinic Visit</option>
                                        <option value="ONLINE">Online/Video Call</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700 mb-1 block">Preferred Time (Optional)</label>
                                    <input type="time" value={form.preferredTime}
                                        onChange={e => handleTimeChange(e.target.value)}
                                        className={`${inp} ${timeConflict ? "border-red-400 ring-2 ring-red-200" : ""}`} />
                                    {timeConflict && (
                                        <p className="text-red-500 text-xs mt-1 font-medium">
                                            ⚠️ Must be at least 10 minutes apart from existing bookings.
                                        </p>
                                    )}
                                </div>
                            </div>
                            {bookedTimes.length > 0 && form.slotId && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
                                    <p className="text-xs font-semibold text-yellow-700 mb-1">⏰ Already booked times for this slot:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {bookedTimes.map(t => (
                                            <span key={t} className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-medium">{format12h(t)}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <button type="submit" disabled={!form.slotId || !form.petId || !form.consultationType || booking || timeConflict}
                                className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white py-3 rounded-full font-semibold transition shadow-md">
                                {booking ? "Booking..." : "Confirm Appointment"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Tab: My Appointments ──────────────────────────────────────────────────
function MyAppointmentsTab() {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadAppts = async () => {
        try {
            setLoading(true);
            const res = await api.get("/appointments/my");
            setAppointments(res.data.data || []);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { loadAppts(); }, []);

    const cancel = async (id) => {
        if (!window.confirm("Cancel this appointment?")) return;
        try {
            await api.post(`/appointments/${id}/cancel`);
            loadAppts();
        } catch (e) { alert(e.response?.data?.message || "Failed to cancel"); }
    };

    const STATUS_STYLE = {
        BOOKED: "bg-blue-100 text-blue-700",
        COMPLETED: "bg-green-100 text-green-700",
        CANCELLED: "bg-red-100 text-red-600",
        NO_SHOW: "bg-yellow-100 text-yellow-700",
    };

    if (loading) return <Loader />;

    return (
        <div>
            <h2 className="text-xl font-bold text-gray-800 mb-6">My Appointments</h2>
            {appointments.length === 0 ? (
                <EmptyState icon="🗓️" message="No appointments booked yet." />
            ) : (
                <div className="space-y-4">
                    {appointments.map(appt => (
                        <div key={appt.id} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className={`text-xs px-3 py-1 rounded-full font-bold ${STATUS_STYLE[appt.status] || "bg-gray-100 text-gray-600"}`}>
                                            {appt.status}
                                        </span>
                                        {appt.consultationType && (
                                            <span className={`text-xs px-3 py-1 rounded-full ${appt.consultationType === "ONLINE" ? "bg-blue-50 text-blue-600" : "bg-purple-50 text-purple-600"}`}>
                                                {appt.consultationType}
                                            </span>
                                        )}
                                    </div>
                                    <p className="font-semibold text-gray-800">📅 {appt.appointmentDate}</p>
                                    {appt.preferredTime ? (
                                        <p className="text-gray-500 text-sm">⏰ {format12h(appt.preferredTime)}</p>
                                    ) : (
                                        <p className="text-gray-500 text-sm">⏰ {format12h(appt.startTime)} – {format12h(appt.endTime)}</p>
                                    )}
                                    {appt.petName && <p className="text-gray-500 text-sm mt-1">🐾 {appt.petName}</p>}
                                    {appt.vetName && <p className="text-gray-400 text-xs">🩺 Dr. {appt.vetName}</p>}
                                </div>
                                {appt.status === "SCHEDULED" || appt.status === "PENDING" ? (
                                    <button onClick={() => cancel(appt.id)}
                                        className="border border-red-300 text-red-500 px-4 py-2 rounded-lg text-sm hover:bg-red-50 transition">
                                        Cancel
                                    </button>
                                ) : null}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── Tab: Marketplace ──────────────────────────────────────────────────────
// ─── Component: Product Details View ───────────────────────────────────────
function ProductDetailsView({ product, onBack, onAddToCart }) {
    const [reviewText, setReviewText] = useState("");
    const [reviews, setReviews] = useState([]);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const res = await api.get(`/reviews/product/${product.id}`);
                setReviews(res.data.data || []);
            } catch (e) {
                console.error("Failed to fetch reviews", e);
            }
        };
        fetchReviews();
    }, [product.id]);

    const addReview = async () => {
        if (!reviewText.trim()) return;
        try {
            await api.post("/reviews", {
                productId: product.id,
                rating: 5, // Defaulting to 5 for now, or could add stars here
                comment: reviewText
            });
            setReviews([...reviews, reviewText]);
            setReviewText("");
            alert("✅ Review submitted!");
        } catch (e) {
            alert(e.response?.data?.message || "Failed to submit review");
        }
    };

    return (
        <div className="animate-fadeIn">
            <header className="bg-orange-500 text-white text-center py-6 rounded-t-2xl shadow-md mb-8">
                <h1 className="text-2xl font-bold">🐾 Pet Product Details</h1>
            </header>

            <div className="flex flex-col lg:flex-row gap-8 px-4">
                {/* Image Section */}
                <div className="lg:w-1/2 bg-white p-4 rounded-2xl shadow-lg border border-gray-100 flex items-center justify-center">
                    {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} className="max-w-full h-[400px] object-contain rounded-xl transition-transform hover:scale-105 duration-300" />
                    ) : (
                        <div className="w-full h-[400px] bg-gray-50 flex items-center justify-center text-8xl rounded-xl">
                            {product.category === "FOOD" ? "🐾" : product.category === "TOYS" ? "🧸" : product.category === "MEDICINES" ? "💊" : "🎀"}
                        </div>
                    )}
                </div>

                {/* Info Section */}
                <div className="lg:w-1/2 bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">{product.name}</h2>
                    <p className="text-[#27ae60] text-3xl font-bold mb-4">₹{product.price}</p>
                    <p className="text-orange-400 text-lg mb-6">⭐⭐⭐⭐☆ 4.2 Rating</p>

                    <div className="mb-8">
                        <h3 className="text-lg font-bold text-gray-800 mb-2">Description</h3>
                        <p className="text-gray-600 leading-relaxed">{product.description || "No description available for this premium pet product."}</p>
                    </div>

                    <div className="space-y-3 mb-8 text-sm">
                        <p><span className="font-bold text-gray-700">Category:</span> {product.category}</p>
                        <p><span className="font-bold text-gray-700">Brand:</span> {product.brand || "PetCare Premium"}</p>
                        <p><span className="font-bold text-gray-700">Weight:</span> {product.weight || "1 kg"}</p>
                        <p className="text-green-600 font-bold flex items-center gap-2">
                            <span>✔</span> In Stock
                        </p>
                        <p className="text-gray-500">🚚 Delivery in 3-5 days</p>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={() => onAddToCart(product)}
                            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-md active:scale-95 flex-1"
                        >
                            Add to Cart
                        </button>
                        <button
                            onClick={onBack}
                            className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-md active:scale-95"
                        >
                            Back to Products
                        </button>
                    </div>

                    <div className="mt-12 border-t pt-8">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Customer Reviews ({reviews.length})</h3>
                        <div className="space-y-4 mb-6">
                            {reviews.length === 0 ? (
                                <p className="text-gray-400 text-sm italic">No reviews yet for this product.</p>
                            ) : (
                                reviews.map((r, i) => (
                                    <div key={i} className="bg-gray-50 p-4 rounded-xl border border-gray-100 shadow-sm">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="font-bold text-gray-800 text-sm">{r.userName}</span>
                                            <span className="text-[#ff9f00] text-xs">
                                                {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
                                            </span>
                                        </div>
                                        <p className="text-gray-600 text-sm leading-relaxed italic">"{r.comment}"</p>
                                        <p className="text-[10px] text-gray-400 mt-2">{new Date(r.createdAt).toLocaleDateString()}</p>
                                    </div>
                                ))
                            )}
                        </div>
                        <div className="flex flex-col gap-2">
                            <textarea
                                value={reviewText}
                                onChange={(e) => setReviewText(e.target.value)}
                                className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-orange-400 outline-none min-h-[80px]"
                                placeholder="Write your review here..."
                            />
                            <button
                                onClick={addReview}
                                className="bg-gray-800 hover:bg-black text-white px-6 py-2 rounded-xl text-sm font-bold transition-all self-end"
                            >
                                Submit Review
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Tab: Marketplace ──────────────────────────────────────────────────────
function MarketplaceTab({ onAddToCart, onViewCart, cartCount }) {
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");

    // Mock products removed - now fetched from database
    const dummyProducts = [];

    useEffect(() => {
        api.get("/marketplace/products")
            .then(res => {
                const apiProducts = res.data.data || [];
                // Add ratings to products from review API logic
                setProducts([...apiProducts, ...dummyProducts]);
            })
            .catch(() => setProducts(dummyProducts))
            .finally(() => setLoading(false));
    }, []);

    const filtered = products.filter(p => {
        const matchSearch = p.name?.toLowerCase().includes(search.toLowerCase());
        const matchCat = !category || p.category === category;
        return matchSearch && matchCat;
    });

    const CAT_EMOJI = { FOOD: "🐾", TOYS: "🧸", MEDICINES: "💊", ACCESSORIES: "🎀", GROOMING: "🛁" };

    if (loading) return <Loader />;

    if (selectedProduct) {
        return (
            <ProductDetailsView
                product={selectedProduct}
                onBack={() => {
                    setSelectedProduct(null);
                    window.scrollTo(0, 0);
                }}
                onAddToCart={onAddToCart}
            />
        );
    }

    return (
        <div className="animate-fadeIn">
            {/* Orange Design Header */}
            <header className="bg-orange-500 text-white py-6 rounded-t-2xl shadow-md mb-8 sticky top-0 z-20 flex justify-between items-center px-8">
                <div className="w-10"></div> {/* Spacer for symmetry */}
                <h1 className="text-2xl font-bold flex items-center justify-center gap-2">
                    <span className="text-3xl">🐾</span> Pet Product Marketplace
                </h1>
                <button
                    onClick={onViewCart}
                    className="relative bg-white text-orange-600 px-5 py-2 rounded-full font-bold flex items-center gap-2 hover:bg-orange-50 transition shadow-lg active:scale-95"
                >
                    Cart 🛒
                    {cartCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold border-2 border-white ring-2 ring-orange-500">
                            {cartCount}
                        </span>
                    )}
                </button>
            </header>

            {/* Filters */}
            <div className="flex gap-4 mb-8 flex-wrap items-center bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="relative flex-1 min-w-[300px]">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                    <input
                        value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search for dog food, toys, accessories..."
                        className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-orange-400 outline-none transition-all shadow-sm"
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                    {["", "FOOD", "TOYS", "MEDICINES", "ACCESSORIES", "GROOMING"].map(cat => (
                        <button key={cat} onClick={() => setCategory(cat)}
                            className={`px-6 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all shadow-sm ${category === cat
                                ? "bg-orange-500 text-white scale-105"
                                : "bg-white border border-gray-200 text-gray-600 hover:border-orange-400 hover:text-orange-600"
                                }`}>
                            {cat ? `${CAT_EMOJI[cat] || ""} ${cat}` : "All Products"}
                        </button>
                    ))}
                </div>
            </div>

            {filtered.length === 0 ? (
                <EmptyState icon="🛍️" message="No products found matching your search." />
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                    {filtered.map(p => (
                        <div key={p.id} className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group border-b-4 border-b-transparent hover:border-b-orange-500">
                            {/* Product Image Area */}
                            <div className="relative h-48 overflow-hidden bg-white p-4 flex items-center justify-center">
                                {p.imageUrl ? (
                                    <img src={p.imageUrl} alt={p.name} className="max-h-full object-contain transition-transform duration-500 group-hover:scale-110" />
                                ) : (
                                    <div className="w-full h-full bg-orange-50/30 flex items-center justify-center text-6xl rounded-xl transition-colors group-hover:bg-orange-50">
                                        {CAT_EMOJI[p.category] || "🐾"}
                                    </div>
                                )}
                                {p.stockQuantity <= 5 && p.stockQuantity > 0 && (
                                    <span className="absolute top-2 right-2 bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-tighter">Only {p.stockQuantity} left</span>
                                )}
                            </div>

                            {/* Product Info */}
                            <div className="p-5 flex flex-col items-center text-center flex-1">
                                <h3 className="font-bold text-gray-800 text-lg mb-1 group-hover:text-orange-500 transition-colors">{p.name}</h3>
                                <p className="text-green-600 font-black text-xl mb-4">₹{p.price}</p>

                                <div className="mt-auto w-full space-y-2">
                                    <button
                                        onClick={() => {
                                            setSelectedProduct(p);
                                            window.scrollTo(0, 0);
                                        }}
                                        className="w-full bg-orange-50 hover:bg-orange-500 hover:text-white text-orange-600 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 shadow-sm"
                                    >
                                        View Details
                                    </button>
                                    <button
                                        onClick={() => onAddToCart(p)}
                                        className="w-full bg-white border-2 border-orange-500 text-orange-600 hover:bg-orange-500 hover:text-white py-2 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
                                    >
                                        Add to Cart 🛒
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── Tab: Orders (Flipkart Redesign) ──────────────────────────────────────
function OrdersTab() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [reviewItem, setReviewItem] = useState(null);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [search, setSearch] = useState("");
    const [activeStatus, setActiveStatus] = useState("ALL");

    const loadOrders = async () => {
        try {
            setLoading(true);
            const res = await api.get("/marketplace/orders");
            setOrders(res.data.data || []);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { loadOrders(); }, []);

    const handleSubmitReview = async () => {
        if (!comment.trim()) { alert("Please provide a comment."); return; }
        try {
            await api.post("/reviews", {
                productId: reviewItem.productId,
                rating: rating,
                comment: comment
            });
            alert(`✅ Review submitted for "${reviewItem?.productName}"!`);
            setReviewItem(null);
            setRating(5);
            setComment("");
        } catch (e) {
            alert(e.response?.data?.message || "Failed to submit review");
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch = order.items.some(item => 
            item.productName.toLowerCase().includes(search.toLowerCase())
        );
        const matchesStatus = activeStatus === "ALL" || order.status === activeStatus;
        
        return matchesSearch && matchesStatus;
    });

    if (loading) return <Loader />;

    const statuses = [
        { id: "ALL", label: "All Orders" },
        { id: "ON THE WAY", label: "On the way" },
        { id: "DELIVERED", label: "Delivered" },
        { id: "CANCELLED", label: "Cancelled" },
        { id: "RETURNED", label: "Returned" },
    ];

    return (
        <div className="bg-[#f1f3f6] -m-8 min-h-screen p-4 md:p-8">
            <div className="max-w-5xl mx-auto">
                <div className="bg-white rounded-sm shadow-sm mb-4 p-4">
                    {/* Search Bar */}
                    <div className="relative mb-6 flex">
                        <input 
                            type="text" 
                            placeholder="Search your orders here" 
                            className="flex-1 border p-2.5 pl-4 rounded-l-sm outline-none text-sm focus:border-[#2874f0] transition-colors"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <button className="bg-[#2874f0] text-white px-8 py-2.5 rounded-r-sm text-sm font-bold flex items-center gap-2 hover:bg-[#1a5bb8] transition shadow-md">
                            🔍 Search
                        </button>
                    </div>

                    {/* Horizontal Filters */}
                    <div className="flex flex-wrap gap-2 border-t pt-4">
                        {statuses.map(s => (
                            <button
                                key={s.id}
                                onClick={() => setActiveStatus(s.id)}
                                className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
                                    activeStatus === s.id 
                                    ? "bg-[#2874f0] text-white shadow-md border-[#2874f0]" 
                                    : "bg-gray-50 text-gray-600 border border-gray-200 hover:border-[#2874f0] hover:text-[#2874f0]"
                                }`}
                            >
                                {s.label}
                            </button>
                        ))}
                    </div>
                </div>

                {filteredOrders.length === 0 ? (
                    <div className="bg-white p-20 text-center rounded-sm shadow-sm border">
                        <div className="text-6xl mb-4">📦</div>
                        <p className="text-gray-400 font-medium">No {activeStatus !== "ALL" ? activeStatus.toLowerCase() : ""} orders found.</p>
                        {search && <p className="text-xs text-gray-400 mt-2">Try searching for something else or clearing filters.</p>}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredOrders.map(order => (
                            <div key={order.id} className="bg-white border rounded-sm hover:shadow-lg transition-all cursor-pointer p-4 group">
                                {order.items.map((item, idx) => (
                                    <React.Fragment key={idx}>
                                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
                                            {/* Product Info */}
                                            <div className="flex gap-4 md:col-span-2">
                                                <div className="w-24 h-24 flex-shrink-0 bg-gray-50 rounded-md p-2">
                                                    <img 
                                                        src={item.productImageUrl || "https://via.placeholder.com/100"} 
                                                        alt={item.productName} 
                                                        className="w-full h-full object-contain mix-blend-multiply"
                                                    />
                                                </div>
                                                <div className="flex flex-col justify-center">
                                                    <p className="text-sm font-bold text-gray-800 group-hover:text-[#2874f0] transition-colors mb-1 line-clamp-2">{item.productName}</p>
                                                    <p className="text-xs text-gray-400 mb-1">Color: Standard</p>
                                                    <p className="text-xs text-gray-500 font-medium">Qty: {item.quantity}</p>
                                                </div>
                                            </div>

                                            {/* Price */}
                                            <div className="text-center md:text-left">
                                                <p className="text-base font-black text-gray-900">₹{item.totalPrice.toLocaleString()}</p>
                                            </div>

                                            {/* Status & Review */}
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center gap-2">
                                                    <span className={`w-2.5 h-2.5 rounded-full shadow-sm ${
                                                        order.status === 'DELIVERED' ? 'bg-green-500 animate-pulse' : 
                                                        order.status === 'CANCELLED' ? 'bg-red-500' : 'bg-orange-500'
                                                    }`}></span>
                                                    <p className="text-sm font-black text-gray-800">
                                                        {order.status === 'DELIVERED' ? `Delivered on ${new Date(order.createdAt).toLocaleDateString()}` : 
                                                         order.status === 'CANCELLED' ? `Cancelled on ${new Date(order.createdAt).toLocaleDateString()}` : 
                                                         order.status}
                                                    </p>
                                                </div>
                                                <p className="text-[11px] text-gray-500 ml-4 font-medium italic">
                                                    {order.status === 'DELIVERED' ? 'Your item has been delivered' : 
                                                     order.status === 'CANCELLED' ? 'Your order was cancelled as per your request.' : 
                                                     'Your order is under process'}
                                                </p>
                                                
                                                {/* Conditional Rate & Review Button */}
                                                {order.status === 'DELIVERED' && (
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setReviewItem(item);
                                                        }}
                                                        className="flex items-center gap-2 text-[#2874f0] text-xs font-black mt-3 ml-4 bg-[#2874f0]/5 px-3 py-1.5 rounded-lg hover:bg-[#2874f0] hover:text-white transition-all w-fit border border-[#2874f0]/20"
                                                    >
                                                        <span>★</span> Rate & Review
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        {idx < order.items.length - 1 && <div className="my-4 border-t border-dashed"></div>}
                                    </React.Fragment>
                                ))}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Review Modal */}
            {reviewItem && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 shadow-2xl">
                    <div className="bg-white rounded-md w-full max-w-lg overflow-hidden flex flex-col">
                        <div className="p-4 bg-[#2874f0] text-white flex justify-between items-center">
                            <h3 className="font-bold">Rate & Review Product</h3>
                            <button onClick={() => setReviewItem(null)} className="text-2xl">&times;</button>
                        </div>
                        <div className="p-6">
                            <div className="flex gap-4 mb-6">
                                <img src={reviewItem.productImageUrl} className="w-16 h-16 object-contain" />
                                <div>
                                    <p className="text-sm font-medium">{reviewItem.productName}</p>
                                    <div className="flex gap-1 mt-2">
                                        {[1, 2, 3, 4, 5].map(s => (
                                            <button 
                                                key={s} 
                                                onClick={() => setRating(s)} 
                                                className={`text-2xl ${s <= rating ? 'text-[#ff9f00]' : 'text-gray-300'}`}
                                            >
                                                ★
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <textarea 
                                className="w-full border rounded-sm p-3 text-sm h-32 outline-none focus:border-[#2874f0]" 
                                placeholder="Review this product"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                            ></textarea>
                            <div className="mt-6 flex justify-end">
                                <button 
                                    onClick={handleSubmitReview}
                                    className="bg-[#fb641b] text-white px-10 py-2 rounded-sm font-bold shadow hover:bg-[#e65a19] transition"
                                >
                                    SUBMIT
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Tab: Profile & Settings ──────────────────────────────────────────────
function ProfileTab() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [form, setForm] = useState({});
    const [pwdForm, setPwdForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
    const [saving, setSaving] = useState(false);
    const [changingPwd, setChangingPwd] = useState(false);

    const inp = "w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-orange-400 outline-none";

    useEffect(() => {
        api.get("/owner/profile")
            .then(res => {
                const d = res.data.data;
                setProfile(d);
                setForm({
                    firstName: d.firstName || "",
                    lastName: d.lastName || "",
                    phone: d.phone || "",
                    dateOfBirth: d.dateOfBirth || "",
                    street: d.street || "",
                    city: d.city || "",
                    state: d.state || "",
                    zipCode: d.zipCode || "",
                    country: d.country || "",
                });
            })
            .catch(e => console.error(e))
            .finally(() => setLoading(false));
    }, []);

    const handleSave = async e => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.put("/owner/profile", form);
            alert("✅ Profile updated!");
            setEditMode(false);
            setProfile(prev => ({ ...prev, ...form }));
        } catch (e) { alert(e.response?.data?.message || "Failed to update profile"); }
        finally { setSaving(false); }
    };

    const handleChangePassword = async e => {
        e.preventDefault();
        if (pwdForm.newPassword !== pwdForm.confirmPassword) {
            alert("New passwords do not match!"); return;
        }
        if (pwdForm.newPassword.length < 8) {
            alert("Password must be at least 8 characters!"); return;
        }
        setChangingPwd(true);
        try {
            await api.post("/owner/change-password", {
                currentPassword: pwdForm.currentPassword,
                newPassword: pwdForm.newPassword
            });
            alert("✅ Password changed successfully!");
            setPwdForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
        } catch (e) { alert(e.response?.data?.message || "Failed to change password"); }
        finally { setChangingPwd(false); }
    };

    if (loading) return <Loader />;

    return (
        <div>
            <h2 className="text-xl font-bold text-gray-800 mb-6">My Profile</h2>
            <div className="grid lg:grid-cols-2 gap-8">

                {/* Profile Info */}
                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-6 flex items-center gap-4">
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-3xl">
                            👤
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-lg">{profile?.firstName} {profile?.lastName}</h3>
                            <p className="text-orange-100 text-sm">{profile?.email}</p>
                        </div>
                    </div>
                    <div className="p-6">
                        {!editMode ? (
                            <div className="space-y-3">
                                {[
                                    { label: "Phone", val: profile?.phone },
                                    { label: "Date of Birth", val: profile?.dateOfBirth },
                                    { label: "City", val: profile?.city },
                                    { label: "State", val: profile?.state },
                                    { label: "Country", val: profile?.country },
                                    { label: "PIN / ZIP", val: profile?.zipCode },
                                ].map(({ label, val }) => (
                                    <div key={label} className="flex justify-between border-b pb-2 text-sm">
                                        <span className="text-gray-500 font-medium">{label}</span>
                                        <span className="text-gray-800">{val || "—"}</span>
                                    </div>
                                ))}
                                <button onClick={() => setEditMode(true)}
                                    className="w-full mt-4 border-2 border-orange-400 text-orange-600 py-2.5 rounded-xl font-semibold hover:bg-orange-50 transition">
                                    ✏️ Edit Profile
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSave} className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs font-medium text-gray-600 mb-1 block">First Name</label>
                                        <input value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} className={inp} />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-gray-600 mb-1 block">Last Name</label>
                                        <input value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} className={inp} />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-600 mb-1 block">Phone</label>
                                    <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className={inp} />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-600 mb-1 block">Date of Birth</label>
                                    <input type="date" value={form.dateOfBirth} onChange={e => setForm({ ...form, dateOfBirth: e.target.value })} className={inp} />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-600 mb-1 block">Street</label>
                                    <input value={form.street} onChange={e => setForm({ ...form, street: e.target.value })} className={inp} />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs font-medium text-gray-600 mb-1 block">City</label>
                                        <input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} className={inp} />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-gray-600 mb-1 block">ZIP</label>
                                        <input value={form.zipCode} onChange={e => setForm({ ...form, zipCode: e.target.value })} className={inp} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs font-medium text-gray-600 mb-1 block">State</label>
                                        <input value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} className={inp} />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-gray-600 mb-1 block">Country</label>
                                        <input value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} className={inp} />
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <button type="button" onClick={() => setEditMode(false)}
                                        className="flex-1 border border-gray-300 text-gray-600 py-2.5 rounded-xl hover:bg-gray-50 transition font-medium">
                                        Cancel
                                    </button>
                                    <button type="submit" disabled={saving}
                                        className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-xl font-semibold transition disabled:opacity-60">
                                        {saving ? "Saving..." : "Save Changes"}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>

                {/* Change Password */}
                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
                    <h3 className="font-bold text-gray-800 mb-5 text-lg">🔒 Change Password</h3>
                    <form onSubmit={handleChangePassword} className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">Current Password</label>
                            <input type="password" required value={pwdForm.currentPassword}
                                onChange={e => setPwdForm({ ...pwdForm, currentPassword: e.target.value })}
                                className={inp} placeholder="Enter current password" />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">New Password</label>
                            <input type="password" required value={pwdForm.newPassword}
                                onChange={e => setPwdForm({ ...pwdForm, newPassword: e.target.value })}
                                className={inp} placeholder="Min 8 characters" />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">Confirm New Password</label>
                            <input type="password" required value={pwdForm.confirmPassword}
                                onChange={e => setPwdForm({ ...pwdForm, confirmPassword: e.target.value })}
                                className={inp} placeholder="Repeat new password" />
                        </div>
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-700">
                            💡 Password must be at least 8 characters. Use letters, numbers, and symbols for best security.
                        </div>
                        <button type="submit" disabled={changingPwd}
                            className="w-full bg-gray-800 hover:bg-gray-900 text-white py-3 rounded-xl font-semibold transition disabled:opacity-60">
                            {changingPwd ? "Changing..." : "Change Password"}
                        </button>
                    </form>
                </div>

            </div>
        </div>
    );
}

// ─── Tab: Vaccination Management ───────────────────────────────────────────
function VaccinationTab() {
    const [vaccinations, setVaccinations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const handleDelete = async (petId, vaxId) => {
        if (!window.confirm("Are you sure you want to delete this vaccination record?")) return;
        try {
            await api.delete(`/pets/${petId}/vaccinations/${vaxId}`);
            alert("✅ Vaccination record deleted!");
            setVaccinations(prev => prev.filter(v => v.id !== vaxId));
        } catch (e) {
            alert(e.response?.data?.message || "Failed to delete");
        }
    };

    useEffect(() => {
        const fetchAllVaccinations = async () => {
            try {
                setLoading(true);
                const petsRes = await api.get("/pets");
                const petsList = petsRes.data.data || [];

                const detailsPromises = petsList.map(p => api.get(`/pets/${p.id}`));
                const detailsResponses = await Promise.all(detailsPromises);

                let allVax = [];
                detailsResponses.forEach(res => {
                    const petData = res.data.data;
                    if (petData.vaccinations) {
                        petData.vaccinations.forEach(v => {
                            allVax.push({ ...v, petName: petData.name, petId: petData.id });
                        });
                    }
                });

                allVax.sort((a, b) => new Date(b.dateGiven || 0) - new Date(a.dateGiven || 0));
                setVaccinations(allVax);
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        };

        fetchAllVaccinations();
    }, []);

    const filtered = vaccinations.filter(v =>
        v.vaccineName?.toLowerCase().includes(search.toLowerCase()) ||
        v.petName?.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <Loader />;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Vaccination Management</h2>
                <input
                    value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="🔍 Search vaccine or pet..."
                    className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-orange-400 outline-none"
                />
            </div>

            {filtered.length === 0 ? (
                <EmptyState icon="💉" message="No vaccination records found for any of your pets." />
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-orange-50 text-gray-700 text-sm">
                                <th className="p-4 rounded-tl-lg">Pet Name</th>
                                <th className="p-4">Vaccine</th>
                                <th className="p-4">Date Given</th>
                                <th className="p-4">Next Due</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 rounded-tr-lg">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((v, i) => (
                                <tr key={i} className="border-b hover:bg-orange-50/40 transition">
                                    <td className="p-4 font-medium text-gray-800">{v.petName}</td>
                                    <td className="p-4 text-gray-800">{v.vaccineName}</td>
                                    <td className="p-4 text-gray-600">{v.dateGiven || "N/A"}</td>
                                    <td className="p-4 text-gray-600">{v.nextDueDate || "N/A"}</td>
                                    <td className="p-4">
                                        <span className={`text-xs px-3 py-1 rounded-full font-bold ${v.completed ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                                            {v.completed ? "COMPLETED" : "PENDING"}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <button
                                            onClick={() => handleDelete(v.petId, v.id)}
                                            className="text-red-500 hover:text-red-700 transition"
                                            title="Delete record"
                                        >
                                            🗑️
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

// ─── Main PetOwnerDashboard ────────────────────────────────────────────────
export default function PetOwnerDashboard() {
    const [activeTab, setActiveTab] = useState("pets");
    const [selectedPet, setSelectedPet] = useState(null);
    const [cart, setCart] = useState([]);
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        navigate("/login");
    };

    const handleSelectPet = (pet) => {
        setSelectedPet(pet);
        setActiveTab("health");
    };

    // ─── Tab: My Cart ─────────────────────────────────────────────────────────
    function CartTab({ cart, onCartChange, onOrderPlaced, onBack }) {
        const [placing, setPlacing] = useState(false);
        const [paymentMethod, setPaymentMethod] = useState("ONLINE");
        const [address, setAddress] = useState({
            name: "Kotala Praneeth",
            details: "3-75/9/1, Kamalapur 7th ward, Nizamabad District",
            pincode: "503102"
        });
        const [isEditingAddress, setIsEditingAddress] = useState(false);
        const [addressForm, setAddressForm] = useState({ ...address });

        const itemsPrice = cart.reduce((sum, i) => sum + (i.product.price * i.qty), 0);
        const discount = itemsPrice * 0.1; // 10% mock discount
        const deliveryCharges = itemsPrice > 500 ? 0 : 40;
        const secularFee = 3;
        const cartTotal = itemsPrice - discount + deliveryCharges + secularFee;

        const placeOrder = async () => {
            if (cart.length === 0) return;
            setPlacing(true);
            try {
                const items = cart.map(item => ({ productId: item.product.id, quantity: item.qty }));
                const shippingAddress = `${address.name}, ${address.details}, ${address.pincode}`;
                await api.post("/marketplace/orders", { items, paymentMethod, shippingAddress });
                alert("✅ Order placed successfully! Check Order History for status.");
                onOrderPlaced();
            } catch (e) { alert(e.response?.data?.message || "Order failed"); }
            finally { setPlacing(false); }
        };

        const CAT_EMOJI = { FOOD: "🐾", TOYS: "🧸", MEDICINES: "💊", ACCESSORIES: "🎀", GROOMING: "🛁" };

        if (cart.length === 0) {
            return (
                <div className="animate-fadeIn">
                    <header className="bg-orange-500 text-white rounded-t-2xl p-6 mb-8 flex items-center justify-between">
                        <button onClick={onBack} className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-full text-sm font-bold transition">← Marketplace</button>
                        <h1 className="text-xl font-bold">My Shopping Cart</h1>
                        <div className="w-24"></div>
                    </header>
                    <EmptyState icon="🛒" message="Your cart is empty. Start shopping in the Marketplace!" />
                </div>
            );
        }

        return (
            <div className="animate-fadeIn max-w-6xl mx-auto pb-10">
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Left Column */}
                    <div className="lg:w-2/3 space-y-4">
                        <div className="bg-white border border-gray-200 rounded-lg p-4 flex justify-between items-center shadow-sm">
                            <div className="text-sm">
                                <p className="text-gray-600 mb-1 flex items-center gap-1">Deliver to: <span className="font-bold text-gray-800">{address.name}, {address.pincode}</span></p>
                                <p className="text-gray-500 truncate max-w-sm">{address.details}</p>
                            </div>
                            <button 
                                onClick={() => { setAddressForm({ ...address }); setIsEditingAddress(true); }}
                                className="text-orange-600 font-bold border border-orange-200 px-4 py-2 rounded-lg text-sm hover:bg-orange-50 transition"
                            >
                                CHANGE
                            </button>
                        </div>

                        {/* Address Editing Modal */}
                        {isEditingAddress && (
                            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
                                <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl scale-in">
                                    <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                        <h3 className="font-bold text-gray-800 text-lg">Edit Delivery Address</h3>
                                        <button onClick={() => setIsEditingAddress(false)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
                                    </div>
                                    <div className="p-6 space-y-4">
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Full Name</label>
                                            <input 
                                                type="text" 
                                                className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:border-orange-500 outline-none transition"
                                                value={addressForm.name}
                                                onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Detailed Address</label>
                                            <textarea 
                                                className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:border-orange-500 outline-none transition h-24 resize-none"
                                                value={addressForm.details}
                                                onChange={(e) => setAddressForm({ ...addressForm, details: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Pincode</label>
                                            <input 
                                                type="text" 
                                                className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:border-orange-500 outline-none transition"
                                                value={addressForm.pincode}
                                                onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="p-6 pt-2 flex gap-3">
                                        <button 
                                            onClick={() => setIsEditingAddress(false)}
                                            className="flex-1 py-3 border border-gray-200 rounded-xl font-bold text-sm text-gray-500 hover:bg-gray-50 transition"
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            onClick={() => { setAddress({ ...addressForm }); setIsEditingAddress(false); }}
                                            className="flex-1 py-3 bg-orange-500 text-white rounded-xl font-bold text-sm hover:bg-orange-600 transition shadow-lg shadow-orange-500/20"
                                        >
                                            Save Address
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                            {cart.map((item, idx) => {
                                const p = item.product;
                                return (
                                    <div key={p.id} className={`p-6 flex gap-6 ${idx !== cart.length - 1 ? 'border-b border-gray-100' : ''}`}>
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-28 h-28 flex items-center justify-center p-2 bg-gray-50 rounded-lg">
                                                {p.imageUrl ? (
                                                    <img src={p.imageUrl} alt={p.name} className="max-h-full object-contain" />
                                                ) : (
                                                    <span className="text-4xl">{CAT_EMOJI[p.category] || "🐾"}</span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <button onClick={() => onCartChange(p, -1)} className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50">－</button>
                                                <span className="font-bold text-sm w-4 text-center">{item.qty}</span>
                                                <button onClick={() => onCartChange(p, 1)} className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50">＋</button>
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h3 className="font-medium text-gray-800 text-lg hover:text-orange-500 cursor-pointer">{p.name}</h3>
                                                    <p className="text-xs text-gray-400 mt-1">{p.brand || "PetCare Premium"} • {p.category}</p>
                                                </div>
                                                <p className="text-xs text-gray-500">Delivery by Mar 16, Mon</p>
                                            </div>
                                            <div className="flex items-baseline gap-2 mb-4">
                                                <span className="text-2xl font-bold text-gray-900">₹{p.price}</span>
                                                <span className="text-sm text-gray-400 line-through">₹{(p.price * 1.5).toFixed(0)}</span>
                                                <span className="text-sm text-green-600 font-bold">33% Off</span>
                                            </div>
                                            <div className="flex gap-6">
                                                <button className="text-gray-700 font-bold text-sm hover:text-orange-500 uppercase">Save for later</button>
                                                <button onClick={() => onCartChange(p, -item.qty)} className="text-gray-700 font-bold text-sm hover:text-red-500 uppercase">Remove</button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div className="p-4 flex justify-end sticky bottom-0 bg-white border-t rounded-b-lg shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
                                <button onClick={placeOrder} disabled={placing} className="bg-[#fb641b] text-white px-12 py-3 rounded-sm font-bold text-sm hover:shadow-lg transition active:scale-95 disabled:opacity-50">
                                    {placing ? "PLACING ORDER..." : "PLACE ORDER"}
                                </button>
                            </div>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">💳 Payment Method</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <button onClick={() => setPaymentMethod("ONLINE")} className={`p-4 border-2 rounded-xl text-left transition ${paymentMethod === "ONLINE" ? 'border-orange-500 bg-orange-50' : 'border-gray-100 hover:border-gray-200'}`}>
                                    <p className="font-bold text-gray-800">Online Payment</p>
                                    <p className="text-xs text-gray-500">Fast & Secure (GPay, Cards)</p>
                                </button>
                                <button onClick={() => setPaymentMethod("COD")} className={`p-4 border-2 rounded-xl text-left transition ${paymentMethod === "COD" ? 'border-orange-500 bg-orange-50' : 'border-gray-100 hover:border-gray-200'}`}>
                                    <p className="font-bold text-gray-800">Cash on Delivery</p>
                                    <p className="text-xs text-gray-500">Pay when you receive</p>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="lg:w-1/3">
                        <div className="bg-white border border-gray-200 rounded-lg shadow-sm sticky top-4">
                            <h4 className="p-4 border-b border-gray-100 text-gray-500 font-bold text-sm uppercase">Price Details</h4>
                            <div className="p-4 space-y-4">
                                <div className="flex justify-between text-base">
                                    <span>Price ({cart.length} item{cart.length > 1 ? 's' : ''})</span>
                                    <span>₹{itemsPrice.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-base text-green-600 font-medium">
                                    <span>Discount</span>
                                    <span>− ₹{discount.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-base">
                                    <span>Secured Packaging Fee</span>
                                    <span>₹{secularFee}</span>
                                </div>
                                <div className="flex justify-between text-base border-b border-dashed border-gray-200 pb-4">
                                    <span>Delivery Charges</span>
                                    {deliveryCharges === 0 ? <span className="text-green-600 font-bold">FREE</span> : <span>₹{deliveryCharges}</span>}
                                </div>
                                <div className="flex justify-between text-lg font-bold pt-2">
                                    <span>Total Amount</span>
                                    <span>₹{cartTotal.toLocaleString()}</span>
                                </div>
                                <p className="text-green-600 font-bold text-sm border-t border-gray-100 pt-3">You will save ₹{discount.toLocaleString()} on this order</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const handleAddToCart = (product) => {
        setCart(prev => {
            const existing = prev.find(i => i.product.id === product.id);
            if (existing) return prev.map(i => i.product.id === product.id ? { ...i, qty: i.qty + 1 } : i);
            return [...prev, { product, qty: 1 }];
        });
        // Show brief confirmation
        const tab = TABS.find(t => t.id === "orders");
        alert(`✅ "${product.name}" added to cart! Go to Order History to checkout.`);
    };

    const handleCartChange = (product, delta) => {
        setCart(prev => {
            const updated = prev.map(i => i.product.id === product.id ? { ...i, qty: Math.max(0, i.qty + delta) } : i);
            return updated.filter(i => i.qty > 0);
        });
    };

    const cartCount = cart.reduce((s, i) => s + i.qty, 0);

    const tabContent = {
        pets: <PetsTab onSelectPet={handleSelectPet} />,
        health: <HealthTab selectedPet={selectedPet} setSelectedPet={setSelectedPet} />,
        vaccinations: <VaccinationTab />,
        reports: <HealthReports />,
        book: <BookAppointmentTab />,
        myappts: <MyAppointmentsTab />,
        shop: <MarketplaceTab onAddToCart={handleAddToCart} onViewCart={() => setActiveTab("cart")} cartCount={cartCount} />,
        cart: <CartTab cart={cart} onCartChange={handleCartChange} onOrderPlaced={() => setCart([])} onBack={() => setActiveTab("shop")} />,
        orders: <OrdersTab />,
        profile: <ProfileTab />,
    };

    return (
        <div className="min-h-screen bg-gray-50 flex font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-white shadow-lg flex flex-col fixed h-full z-10">
                <div className="p-6 border-b bg-gradient-to-r from-orange-500 to-orange-600">
                    <div className="flex items-center gap-3">
                        <span className="text-3xl">🐾</span>
                        <div>
                            <h1 className="text-white font-bold text-lg leading-tight">PetWellness</h1>
                            <p className="text-orange-100 text-xs">Pet Owner Portal</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 py-6 px-3 space-y-1">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => {
                                setActiveTab(tab.id);
                                if (tab.id !== "health") setSelectedPet(null);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === tab.id
                                ? "bg-orange-500 text-white shadow-md"
                                : "text-gray-600 hover:bg-orange-50 hover:text-orange-600"
                                }`}
                        >
                            <span>{tab.icon}</span>
                            {tab.label}
                            {tab.id === "cart" && cartCount > 0 && (
                                <span className="ml-auto bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                                    {cartCount}
                                </span>
                            )}
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition"
                    >
                        {icons.logout}
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main */}
            <main className="ml-64 flex-1 p-8 min-h-screen">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">
                            {TABS.find(t => t.id === activeTab)?.icon} {TABS.find(t => t.id === activeTab)?.label}
                        </h2>
                        <p className="text-gray-500 text-sm mt-1">Pet Wellness Platform</p>
                    </div>
                    <div className="bg-white rounded-xl px-4 py-2 shadow-sm border text-sm text-gray-600">
                        👋 Welcome, <span className="font-semibold text-orange-600">Pet Parent!</span>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 min-h-[500px]">
                    {tabContent[activeTab]}
                </div>
            </main>
        </div>
    );
}
