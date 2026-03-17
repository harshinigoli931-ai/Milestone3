import React, { useEffect, useState } from "react";
import api from "./api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import HealthReports from "./HealthReports";
import Marketplace from "./Marketplace";
import OrderHistory from "./OrderHistory";
import Cart from "./Cart";

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
    { id: "myappts", label: "My Appointments", icon: "🗓️" },
    { id: "shop", label: "Marketplace", icon: icons.shop },
    { id: "cart", label: "My Cart", icon: "🛒" },
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl scale-in">
                <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h3 className="font-bold text-gray-800 text-lg">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl transition-colors">×</button>
                </div>
                <div className="p-6">{children}</div>
            </div>
        </div>
    );
}

function ConfirmDialog({ message, onConfirm, onCancel }) {
    if (!message) return null;
    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl scale-in p-6">
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">⚠️</div>
                    <h3 className="font-bold text-gray-800 text-lg">Are you sure?</h3>
                    <p className="text-gray-500 text-sm mt-2">{message}</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={onCancel} className="flex-1 py-3 border border-gray-200 rounded-xl font-bold text-sm text-gray-500 hover:bg-gray-50 transition">Cancel</button>
                    <button onClick={onConfirm} className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold text-sm hover:bg-red-600 transition shadow-lg shadow-red-500/20">Confirm</button>
                </div>
            </div>
        </div>
    );
}

// ─── Tab: My Pets ──────────────────────────────────────────────────────────
function PetsTab({ onSelectPet, setConfirmAction }) {
    const [pets, setPets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [petForm, setPetForm] = useState({ name: "", species: "DOG", breed: "", age: "", gender: "MALE", weight: "", color: "", microchipId: "", imageUrl: "" });

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
        if (pets.length >= 5) {
            toast.warning("🔒 Maximum limit of 5 pets reached per account!");
            return;
        }
        setEditing(null);
        setPetForm({ name: "", species: "DOG", breed: "", age: "", gender: "MALE", weight: "", color: "", microchipId: "", imageUrl: "" });
        setShowModal(true);
    };

    const openEdit = (pet) => {
        setEditing(pet);
        setPetForm({ name: pet.name, species: pet.species, breed: pet.breed, age: pet.age, gender: pet.gender, weight: pet.weight || "", color: pet.color || "", microchipId: pet.microchipId || "", imageUrl: pet.imageUrl || "" });
        setShowModal(true);
    };

    const handleSave = async e => {
        e.preventDefault();
        if (!editing && pets.length >= 5) {
            toast.error("Maximum limit of 5 pets reached!");
            return;
        }
        const payload = { ...petForm, age: parseInt(petForm.age), weight: petForm.weight ? parseFloat(petForm.weight) : null };
        try {
            if (editing) {
                await api.put(`/pets/${editing.id}`, payload);
                toast.success("✅ Pet updated!");
            } else {
                await api.post("/pets", payload);
                toast.success("✅ Pet added!");
            }
            setShowModal(false);
            loadPets();
        } catch (e) { toast.error(e.response?.data?.message || "Operation failed"); }
    };

    const deletePet = async (id) => {
        setConfirmAction({
            message: "Remove this pet? This will permanently delete all medical and vaccination records.",
            onConfirm: async () => {
                try {
                    await api.delete(`/pets/${id}`);
                    toast.success("Pet deleted successfully");
                    loadPets();
                } catch (e) { toast.error("Operation failed"); }
                setConfirmAction(null);
            }
        });
    };

    const PET_EMOJI = { DOG: "🐶", CAT: "🐱", BIRD: "🦜", RABBIT: "🐰", FISH: "🐠", OTHER: "🐾" };
    const getEmoji = (species) => PET_EMOJI[species?.toUpperCase()] || "🐾";

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">My Pets</h2>
                <button onClick={openAdd} className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition shadow-md">+ Add New Pet</button>
            </div>

            {loading ? <Loader /> : (
                pets.length === 0 ? (
                    <EmptyState icon="🐾" message="You haven't added any pets yet." action="Add Your First Pet" onAction={openAdd} />
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pets.map(pet => (
                            <div key={pet.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-xl transition-all group overflow-hidden relative">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-orange-100 group-hover:border-orange-400 transition-colors bg-orange-50 flex items-center justify-center text-3xl">
                                        {pet.imageUrl ? (
                                            <img src={pet.imageUrl} alt={pet.name} className="w-full h-full object-cover" />
                                        ) : (
                                            getEmoji(pet.species)
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800 text-lg">{pet.name}</h3>
                                        <p className="text-orange-500 text-xs font-semibold uppercase tracking-wider">{pet.breed || pet.species}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 mb-6">
                                    <div className="bg-gray-50 p-2 rounded-lg">🎂 <b>Age:</b> {pet.age} yrs</div>
                                    <div className="bg-gray-50 p-2 rounded-lg">⚖️ <b>Weight:</b> {pet.weight}kg</div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => onSelectPet(pet)} className="flex-1 bg-orange-50 text-orange-600 py-2 rounded-lg font-bold hover:bg-orange-500 hover:text-white transition">Health</button>
                                    <button onClick={() => openEdit(pet)} className="p-2 border border-gray-100 rounded-lg hover:border-blue-400 text-blue-500 transition">✏️</button>
                                    <button onClick={() => deletePet(pet.id)} className="p-2 border border-gray-100 rounded-lg hover:border-red-400 text-red-500 transition">🗑️</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )
            )}

            {showModal && (
                <Modal title={editing ? "Edit Pet Details" : "Add New Pet"} onClose={() => setShowModal(false)}>
                    <form onSubmit={handleSave} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1 block">Pet Name *</label>
                                <input required value={petForm.name} onChange={e => setPetForm({ ...petForm, name: e.target.value })} className={inp} />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1 block">Species *</label>
                                <select value={petForm.species} onChange={e => setPetForm({ ...petForm, species: e.target.value })} className={inp}>
                                    <option value="DOG">Dog</option>
                                    <option value="CAT">Cat</option>
                                    <option value="BIRD">Bird</option>
                                    <option value="RABBIT">Rabbit</option>
                                    <option value="OTHER">Other</option>
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1 block">Breed</label>
                                <input value={petForm.breed} onChange={e => setPetForm({ ...petForm, breed: e.target.value })} className={inp} />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1 block">Gender</label>
                                <select value={petForm.gender} onChange={e => setPetForm({ ...petForm, gender: e.target.value })} className={inp}>
                                    <option value="MALE">Male</option>
                                    <option value="FEMALE">Female</option>
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1 block">Age (Years)</label>
                                <input type="number" value={petForm.age} onChange={e => setPetForm({ ...petForm, age: e.target.value })} className={inp} />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1 block">Weight (kg)</label>
                                <input type="number" step="0.1" value={petForm.weight} onChange={e => setPetForm({ ...petForm, weight: e.target.value })} className={inp} />
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">Image URL</label>
                            <input value={petForm.imageUrl} onChange={e => setPetForm({ ...petForm, imageUrl: e.target.value })} className={inp} placeholder="https://..." />
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button type="button" onClick={() => setShowModal(false)} className="flex-1 border border-gray-300 py-2.5 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition">Cancel</button>
                            <button type="submit" className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-lg font-bold transition">Save Pet</button>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
}

// ─── Tab: Health Records ───────────────────────────────────────────────────
function HealthTab({ selectedPet, setSelectedPet, setConfirmAction }) {
    const [pets, setPets] = useState([]);
    const [petDetail, setPetDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showMedModal, setShowMedModal] = useState(false);
    const [showVaxModal, setShowVaxModal] = useState(false);
    const [medForm, setMedForm] = useState({ visitDate: "", diagnosis: "", treatment: "", prescription: "", notes: "", vetName: "" });
    const [vaxForm, setVaxForm] = useState({ vaccineName: "", dateGiven: "", nextDueDate: "", batchNumber: "", administeredBy: "" });

    const inp = "w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-orange-400 outline-none";

    const loadPetDetail = async (id) => {
        try {
            const res = await api.get(`/pets/${id}`);
            setPetDetail(res.data.data);
        } catch (e) { console.error(e); }
    };

    useEffect(() => {
        api.get("/pets").then(res => setPets(res.data.data || [])).catch(console.error).finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (selectedPet) loadPetDetail(selectedPet.id);
        else setPetDetail(null);
    }, [selectedPet]);

    const deleteVax = async (vaxId) => {
        setConfirmAction({
            message: "Are you sure you want to delete this vaccination record?",
            onConfirm: async () => {
                try {
                    await api.delete(`/pets/${selectedPet.id}/vaccinations/${vaxId}`);
                    toast.success("Vaccination record deleted successfully");
                    loadPetDetail(selectedPet.id);
                } catch (e) { toast.error(e.response?.data?.message || "Operation failed"); }
                setConfirmAction(null);
            }
        });
    };

    const addMedHistory = async e => {
        e.preventDefault();
        try {
            await api.post(`/pets/${selectedPet.id}/medical-history`, medForm);
            toast.success("Medical record added successfully");
            setShowMedModal(false);
            setMedForm({ visitDate: "", diagnosis: "", treatment: "", prescription: "", notes: "", vetName: "" });
            loadPetDetail(selectedPet.id);
        } catch (e) { toast.error(e.response?.data?.message || "Operation failed"); }
    };

    const addVax = async e => {
        e.preventDefault();
        try {
            await api.post(`/pets/${selectedPet.id}/vaccinations`, vaxForm);
            toast.success("Vaccination record added successfully");
            setShowVaxModal(false);
            setVaxForm({ vaccineName: "", dateGiven: "", nextDueDate: "", batchNumber: "", administeredBy: "" });
            loadPetDetail(selectedPet.id);
        } catch (e) { toast.error(e.response?.data?.message || "Operation failed"); }
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

// ─── Tab: Vaccination Full List ───────────────────────────────────────────
function VaccinationTab({ setConfirmAction }) {
    const [vaccinations, setVaccinations] = useState([]);
    const [pets, setPets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [showAddModal, setShowAddModal] = useState(false);
    const [vaxForm, setVaxForm] = useState({ petId: "", vaccineName: "", dateGiven: "", nextDueDate: "", batchNumber: "", administeredBy: "" });

    const inp = "w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-orange-400 outline-none";

    const loadData = async () => {
        try {
            setLoading(true);
            const [vRes, pRes] = await Promise.all([
                api.get("/pets/vaccinations/all"),
                api.get("/pets")
            ]);
            setVaccinations(vRes.data.data || []);
            setPets(pRes.data.data || []);
        } catch (e) {
            // Fallback if /all endpoint doesn't exist
            try {
                const petsRes = await api.get("/pets");
                const allPets = petsRes.data.data || [];
                setPets(allPets);
                const allVax = [];
                for (const p of allPets) {
                    const detail = await api.get(`/pets/${p.id}`);
                    if (detail.data.data.vaccinations) {
                        allVax.push(...detail.data.data.vaccinations.map(v => ({ ...v, petName: p.name, petId: p.id })));
                    }
                }
                setVaccinations(allVax);
            } catch (err) { console.error(err); }
        } finally { setLoading(false); }
    };

    useEffect(() => { loadData(); }, []);

    const handleDelete = async (petId, vaxId) => {
        setConfirmAction({
            message: "Delete this vaccination record?",
            onConfirm: async () => {
                try {
                    await api.delete(`/pets/${petId}/vaccinations/${vaxId}`);
                    toast.success("Deleted successfully");
                    setVaccinations(prev => prev.filter(v => v.id !== vaxId));
                } catch (e) { toast.error("Failed to delete"); }
                setConfirmAction(null);
            }
        });
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            await api.post(`/pets/${vaxForm.petId}/vaccinations`, vaxForm);
            toast.success("Vaccination added!");
            setShowAddModal(false);
            setVaxForm({ petId: "", vaccineName: "", dateGiven: "", nextDueDate: "", batchNumber: "", administeredBy: "" });
            loadData();
        } catch (e) { toast.error("Failed to add"); }
    };

    if (loading) return <Loader />;

    const filtered = vaccinations.filter(v =>
        v.vaccineName.toLowerCase().includes(search.toLowerCase()) ||
        v.petName?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Vaccination Management</h2>
                <button onClick={() => setShowAddModal(true)} className="bg-orange-500 text-white px-5 py-2 rounded-xl font-bold text-sm">+ Add Record</button>
            </div>

            <div className="mb-6">
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by vaccine or pet name..." className={inp} />
            </div>

            {filtered.length === 0 ? <EmptyState icon="💉" message="No vaccination records found." /> : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-gray-500 text-xs uppercase font-bold">
                                <th className="p-4 border-b">Pet</th>
                                <th className="p-4 border-b">Vaccine</th>
                                <th className="p-4 border-b">Date Given</th>
                                <th className="p-4 border-b">Next Due</th>
                                <th className="p-4 border-b">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm text-gray-700">
                            {filtered.map(v => (
                                <tr key={v.id} className="hover:bg-orange-50/30 transition">
                                    <td className="p-4 border-b font-medium">{v.petName}</td>
                                    <td className="p-4 border-b">{v.vaccineName}</td>
                                    <td className="p-4 border-b">{v.dateGiven}</td>
                                    <td className="p-4 border-b text-orange-600 font-semibold">{v.nextDueDate || "—"}</td>
                                    <td className="p-4 border-b">
                                        <button onClick={() => handleDelete(v.petId, v.id)} className="text-red-400 hover:text-red-600 transition">🗑️</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showAddModal && (
                <Modal title="Add Vaccination Record" onClose={() => setShowAddModal(false)}>
                    <form onSubmit={handleAdd} className="space-y-4">
                        <div>
                            <label className="text-sm font-medium mb-1 block">Select Pet *</label>
                            <select required value={vaxForm.petId} onChange={e => setVaxForm({ ...vaxForm, petId: e.target.value })} className={inp}>
                                <option value="">Choose a pet...</option>
                                {pets.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-1 block">Vaccine Name *</label>
                            <input required value={vaxForm.vaccineName} onChange={e => setVaxForm({ ...vaxForm, vaccineName: e.target.value })} className={inp} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium mb-1 block">Date Given *</label>
                                <input type="date" required value={vaxForm.dateGiven} onChange={e => setVaxForm({ ...vaxForm, dateGiven: e.target.value })} className={inp} />
                            </div>
                            <div>
                                <label className="text-sm font-medium mb-1 block">Next Due Date</label>
                                <input type="date" value={vaxForm.nextDueDate} onChange={e => setVaxForm({ ...vaxForm, nextDueDate: e.target.value })} className={inp} />
                            </div>
                        </div>
                        <button type="submit" className="w-full bg-orange-500 text-white py-3 rounded-xl font-bold mt-4 shadow-lg shadow-orange-200">Save Record</button>
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
    const [form, setForm] = useState({ slotId: "", petId: "", notes: "", consultationType: "" });
    const [booking, setBooking] = useState(false);

    const inp = "w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-orange-400 outline-none";

    useEffect(() => {
        Promise.all([
            api.get("/appointments/slots"),
            api.get("/pets")
        ]).then(([slotsRes, petsRes]) => {
            const today = new Date().toISOString().split('T')[0];
            const fetchedSlots = (slotsRes.data.data || []).filter(s => s.date >= today);
            fetchedSlots.sort((a, b) => new Date(`${a.date}T${a.startTime}`) - new Date(`${b.date}T${b.startTime}`));
            setSlots(fetchedSlots);
            setPets(petsRes.data.data || []);
        }).catch(console.error).finally(() => setLoading(false));
    }, []);

    const handleBook = async e => {
        e.preventDefault();
        setBooking(true);
        try {
            await api.post("/appointments/book", {
                slotId: parseInt(form.slotId),
                petId: parseInt(form.petId),
                notes: form.notes,
                consultationType: form.consultationType
            });
            toast.success("Appointment booked successfully!");
            setForm({ slotId: "", petId: "", notes: "", consultationType: "" });
        } catch (e) { toast.error(e.response?.data?.message || "Booking failed"); }
        finally { setBooking(false); }
    };

    if (loading) return <Loader />;

    return (
        <div>
            <h2 className="text-xl font-bold text-gray-800 mb-6">Book an Appointment</h2>
            {slots.length === 0 ? <EmptyState icon="📅" message="No Slots Available" /> : (
                <div className="grid lg:grid-cols-2 gap-8">
                    <div>
                        <h3 className="font-semibold text-gray-700 mb-4">Select Slot</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2">
                            {slots.map(s => (
                                <div key={s.id} onClick={() => setForm({ ...form, slotId: s.id.toString() })}
                                    className={`p-4 rounded-xl border-2 cursor-pointer transition ${form.slotId === s.id.toString() ? "border-orange-500 bg-orange-50" : "border-gray-100 bg-white"}`}>
                                    <p className="font-bold">{s.date.split("-").reverse().join("-")}</p>
                                    <p className="text-gray-500 text-sm">{format12h(s.startTime)} - {format12h(s.endTime)}</p>
                                    {s.vetName && <p className="text-xs text-orange-500 mt-1">🩺 {s.vetName}</p>}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-700 mb-4">Booking Details</h3>
                        <form onSubmit={handleBook} className="space-y-4 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                            <div>
                                <label className="text-xs font-bold uppercase text-gray-400 mb-1 block">Select Pet</label>
                                <select required value={form.petId} onChange={e => setForm({ ...form, petId: e.target.value })} className={inp}>
                                    <option value="">Choose pet...</option>
                                    {pets.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase text-gray-400 mb-1 block">Consultation Mode</label>
                                <select required value={form.consultationType} onChange={e => setForm({ ...form, consultationType: e.target.value })} className={inp}>
                                    <option value="">Select Mode...</option>
                                    <option value="CLINIC">Clinic Visit</option>
                                    <option value="ONLINE">Online Call</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold uppercase text-gray-400 mb-1 block">Notes</label>
                                <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className={inp} rows={3} />
                            </div>
                            <button type="submit" disabled={!form.slotId || booking} className="w-full bg-orange-500 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-orange-200">
                                {booking ? "Booking..." : "Confirm Booking"}
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

    const handleCancel = async (id) => {
        try {
            await api.post(`/appointments/${id}/cancel`);
            toast.success("Cancelled!");
            loadAppts();
        } catch (e) { toast.error("Failed to cancel"); }
    };

    if (loading) return <Loader />;

    return (
        <div>
            <h2 className="text-xl font-bold text-gray-800 mb-6">Active Appointments</h2>
            {appointments.length === 0 ? <EmptyState icon="🗓️" message="No bookings found." /> : (
                <div className="space-y-4">
                    {appointments.map(a => (
                        <div key={a.id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex justify-between items-center group hover:border-orange-200 transition">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${a.status === 'BOOKED' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>{a.status}</span>
                                    <span className="text-[10px] bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-bold">{a.consultationType}</span>
                                </div>
                                <p className="font-bold text-gray-800">📅 {a.date.split("-").reverse().join("-")} | {format12h(a.startTime)}</p>
                                <p className="text-gray-500 text-sm">Pet: <span className="text-orange-600 font-semibold">{a.petName}</span></p>
                            </div>
                            {a.status === 'BOOKED' && (
                                <button onClick={() => handleCancel(a.id)} className="bg-red-50 text-red-500 px-4 py-2 rounded-lg font-bold text-xs hover:bg-red-500 hover:text-white transition">Cancel</button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── Tab: My Profile ───────────────────────────────────────────────────────
// ─── Tab: My Profile ───────────────────────────────────────────────────────
function ProfileTab() {
    const [form, setForm] = useState({
        fullName: "",
        email: "",
        phone: "",
        dob: "",
        street: "",
        city: "",
        state: "",
        country: "",
        pincode: "",
        education: "",
        numberOfPets: "",
        petTypes: ""
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [pwdForm, setPwdForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
    const [changingPwd, setChangingPwd] = useState(false);

    const regex = {
        name: /^[A-Za-z ]{2,50}$/,
        email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        phone: /^[6-9]\d{9}$/,
        street: /^.{5,100}$/,
        city: /^[A-Za-z ]{2,40}$/,
        state: /^[A-Za-z ]{2,40}$/,
        country: /^[A-Za-z ]{2,40}$/,
        pincode: /^\d{6}$/,
        numberOfPets: /^[0-9]{1,2}$/,
        petTypes: /^[A-Za-z, ]{3,50}$/
    };

    const loadProfile = async () => {
        try {
            setLoading(true);
            const res = await api.get("/owner/profile");
            const d = res.data.data;
            setForm({
                fullName: (d.firstName || "") + (d.lastName ? " " + d.lastName : ""),
                email: d.email || "",
                phone: d.phone || "",
                dob: d.dateOfBirth || "",
                street: d.street || "",
                city: d.city || "",
                state: d.state || "",
                country: d.country || "",
                pincode: d.zipCode || "",
                education: d.education || "",
                numberOfPets: d.numberOfPets?.toString() || "",
                petTypes: d.petTypes || ""
            });
        } catch (e) {
            console.error(e);
            toast.error("Failed to load profile");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadProfile(); }, []);

    const completion = (() => {
        const requiredFields = [
            form.fullName, form.phone, form.dob, form.street,
            form.city, form.state, form.country, form.pincode,
            form.numberOfPets
        ];
        const completed = requiredFields.filter(f => f && f.toString().trim() !== "").length;
        return Math.round((completed / requiredFields.length) * 100);
    })();

    const isFormValid = () => {
        if (!regex.name.test(form.fullName)) return false;
        if (!regex.phone.test(form.phone)) return false;
        if (form.dob) {
            const age = new Date().getFullYear() - new Date(form.dob).getFullYear();
            if (age < 10) return false;
        } else return false;
        if (!regex.street.test(form.street)) return false;
        if (!regex.city.test(form.city)) return false;
        if (!regex.pincode.test(form.pincode)) return false;
        if (form.numberOfPets && !regex.numberOfPets.test(form.numberOfPets.toString())) return false;
        if (form.petTypes && !regex.petTypes.test(form.petTypes)) return false;
        return true;
    };

    const validate = () => {
        if (!regex.name.test(form.fullName)) {
            toast.error("Name should contain only letters and spaces (2-50 chars).");
            return false;
        }
        if (!regex.phone.test(form.phone)) {
            toast.error("Mobile number must contain 10 digits starting with 6-9.");
            return false;
        }
        if (form.dob) {
            const age = new Date().getFullYear() - new Date(form.dob).getFullYear();
            if (age < 10) {
                toast.error("Age must be above 10 years.");
                return false;
            }
        } else {
            toast.error("Date of birth is required.");
            return false;
        }
        if (!regex.street.test(form.street)) {
            toast.error("Street address must be at least 5 characters.");
            return false;
        }
        if (!regex.city.test(form.city)) {
            toast.error("City name should contain only letters.");
            return false;
        }
        if (!regex.pincode.test(form.pincode)) {
            toast.error("Enter a valid 6 digit pincode.");
            return false;
        }
        if (form.numberOfPets && !regex.numberOfPets.test(form.numberOfPets)) {
            toast.error("Enter a valid number of pets.");
            return false;
        }
        if (form.petTypes && !regex.petTypes.test(form.petTypes)) {
            toast.error("Pet types should contain letters and commas.");
            return false;
        }
        return true;
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setSaving(true);
        try {
            const names = form.fullName.trim().split(" ");
            const firstName = names[0];
            const lastName = names.slice(1).join(" ");

            const payload = {
                firstName,
                lastName,
                phone: form.phone,
                dateOfBirth: form.dob,
                street: form.street,
                city: form.city,
                state: form.state,
                country: form.country,
                zipCode: form.pincode,
                education: form.education,
                numberOfPets: parseInt(form.numberOfPets) || 0,
                petTypes: form.petTypes
            };
            await api.put("/owner/profile", payload);
            toast.success("🚀 Profile updated successfully!");
        } catch (e) {
            toast.error("Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (pwdForm.newPassword !== pwdForm.confirmPassword) {
            toast.error("Passwords do not match!");
            return;
        }
        if (pwdForm.newPassword.length < 6) {
            toast.error("Password must be at least 6 characters long");
            return;
        }
        setChangingPwd(true);
        try {
            await api.post("/owner/change-password", {
                currentPassword: pwdForm.currentPassword,
                newPassword: pwdForm.newPassword
            });
            toast.success("🔑 Password changed successfully!");
            setShowPasswordModal(false);
            setPwdForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
        } catch (e) {
            toast.error(e.response?.data?.message || "Failed to change password");
        } finally {
            setChangingPwd(false);
        }
    };

    const inp = "w-full border border-gray-200 rounded-xl p-3.5 text-sm focus:ring-2 focus:ring-orange-400 outline-none transition-all placeholder:text-gray-300";
    const label = "text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block";

    if (loading) return <Loader />;

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
            {/* Completion Dashboard */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                <div className="flex justify-between items-end mb-4">
                    <div>
                        <h3 className="text-2xl font-black text-gray-800 tracking-tight">Profile Completion</h3>
                        <p className="text-gray-400 text-sm font-medium">Complete your profile to unlock special rewards!</p>
                    </div>
                    <span className="text-4xl font-black text-orange-500">{completion}%</span>
                </div>
                <div className="w-full bg-gray-100 h-4 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-orange-400 to-orange-600 h-full transition-all duration-1000" style={{ width: `${completion}%` }}></div>
                </div>
            </div>

            <form onSubmit={handleSave} className="space-y-8">
                {/* 1. Personal Details */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                    <h4 className="text-lg font-black text-gray-800 mb-6 flex items-center gap-3">
                        <span className="bg-blue-50 p-2 rounded-xl text-lg">👤</span> Personal Details
                    </h4>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className={label}>Full Name</label>
                            <input value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} className={inp} placeholder="e.g. John Doe" />
                        </div>
                        <div>
                            <label className={label}>Email (Read Only)</label>
                            <input value={form.email} readOnly className={`${inp} bg-gray-50 text-gray-400 cursor-not-allowed`} />
                        </div>
                        <div>
                            <label className={label}>Mobile Number</label>
                            <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className={inp} placeholder="e.g. 9876543210" />
                        </div>
                        <div>
                            <label className={label}>Date of Birth</label>
                            <input type="date" value={form.dob} onChange={e => setForm({ ...form, dob: e.target.value })} className={inp} />
                        </div>
                    </div>
                </div>

                {/* 2. Address Details */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                    <h4 className="text-lg font-black text-gray-800 mb-6 flex items-center gap-3">
                        <span className="bg-green-50 p-2 rounded-xl text-lg">🏠</span> Address Details
                    </h4>
                    <div className="space-y-6">
                        <div>
                            <label className={label}>Street Address</label>
                            <input value={form.street} onChange={e => setForm({ ...form, street: e.target.value })} className={inp} placeholder="e.g. 123 Main St, Kotha Pet" />
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div>
                                <label className={label}>City</label>
                                <input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} className={inp} />
                            </div>
                            <div>
                                <label className={label}>State</label>
                                <input value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} className={inp} />
                            </div>
                            <div>
                                <label className={label}>Country</label>
                                <input value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} className={inp} />
                            </div>
                            <div>
                                <label className={label}>Pincode</label>
                                <input value={form.pincode} onChange={e => setForm({ ...form, pincode: e.target.value })} className={inp} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* 3. Education Details */}
                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                        <h4 className="text-lg font-black text-gray-800 mb-6 flex items-center gap-3">
                            <span className="bg-purple-50 p-2 rounded-xl text-lg">🎓</span> Education
                        </h4>
                        <div>
                            <label className={label}>Highest Qualification</label>
                            <input value={form.education} onChange={e => setForm({ ...form, education: e.target.value })} className={inp} placeholder="e.g. B.Tech in Computer Science" />
                        </div>
                    </div>

                    {/* 4. Pet Owner Details */}
                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                        <h4 className="text-lg font-black text-gray-800 mb-6 flex items-center gap-3">
                            <span className="bg-orange-50 p-2 rounded-xl text-lg">🐾</span> Pet Owner Info
                        </h4>
                        <div className="space-y-6">
                            <div>
                                <label className={label}>Number of Pets</label>
                                <input type="number" value={form.numberOfPets} onChange={e => setForm({ ...form, numberOfPets: e.target.value })} className={inp} placeholder="0" />
                            </div>
                            <div>
                                <label className={label}>Pet Types</label>
                                <input value={form.petTypes} onChange={e => setForm({ ...form, petTypes: e.target.value })} className={inp} placeholder="e.g. Dog, Cat" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={saving || !isFormValid()}
                        className="bg-[#1a1a1a] text-white px-12 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-black transition shadow-xl disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        {saving ? "Saving Changes..." : "Save Profile"}
                    </button>
                </div>
            </form>

            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm mt-8">
                <h4 className="text-lg font-black text-gray-800 mb-6 flex items-center gap-3">
                    <span className="bg-red-50 p-2 rounded-xl text-lg">🔒</span> Account Security
                </h4>
                <div>
                    <button
                        type="button"
                        onClick={() => setShowPasswordModal(true)}
                        className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-bold text-sm transition shadow-lg shadow-red-100"
                    >
                        Change Password
                    </button>
                </div>
            </div>

            {showPasswordModal && (
                <Modal title="Change Password" onClose={() => setShowPasswordModal(false)}>
                    <form onSubmit={handleChangePassword} className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">Current Password</label>
                            <input type="password" required value={pwdForm.currentPassword} onChange={e => setPwdForm({ ...pwdForm, currentPassword: e.target.value })} className={inp} />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">New Password</label>
                            <input type="password" required value={pwdForm.newPassword} onChange={e => setPwdForm({ ...pwdForm, newPassword: e.target.value })} className={inp} />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">Confirm New Password</label>
                            <input type="password" required value={pwdForm.confirmPassword} onChange={e => setPwdForm({ ...pwdForm, confirmPassword: e.target.value })} className={inp} />
                        </div>
                        <button type="submit" disabled={changingPwd} className="w-full bg-orange-500 text-white py-3 rounded-xl font-bold mt-4 shadow-lg shadow-orange-200">
                            {changingPwd ? "Changing..." : "Update Password"}
                        </button>
                    </form>
                </Modal>
            )}

        </div>
    );
}

// ─── Main Component ────────────────────────────────────────────────────────
export default function PetOwnerDashboard() {
    const [activeTab, setActiveTab] = useState("pets");
    const [selectedPet, setSelectedPet] = useState(null);
    const [confirmAction, setConfirmAction] = useState(null);
    const [cartCount, setCartCount] = useState(0);
    const navigate = useNavigate();

    const updateCartCount = () => {
        const cart = JSON.parse(localStorage.getItem("cart") || "[]");
        setCartCount(cart.reduce((s, i) => s + i.quantity, 0));
    };

    useEffect(() => {
        updateCartCount();
        window.addEventListener("cartUpdated", updateCartCount);
        window.addEventListener("storage", updateCartCount);
        return () => {
            window.removeEventListener("cartUpdated", updateCartCount);
            window.removeEventListener("storage", updateCartCount);
        };
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        navigate("/login", { replace: true });
    };

    const handleSelectPet = (pet) => {
        setSelectedPet(pet);
        setActiveTab("health");
    };

    const tabContent = {
        pets: <PetsTab onSelectPet={handleSelectPet} setConfirmAction={setConfirmAction} />,
        health: <HealthTab selectedPet={selectedPet} setSelectedPet={setSelectedPet} setConfirmAction={setConfirmAction} />,
        vaccinations: <VaccinationTab setConfirmAction={setConfirmAction} />,
        reports: <HealthReports />,
        book: <BookAppointmentTab />,
        myappts: <MyAppointmentsTab />,
        shop: <Marketplace />,
        cart: <Cart />,
        orders: <OrderHistory />,
        profile: <ProfileTab />,
    };

    return (
        <div className="min-h-screen bg-gray-50 flex font-sans">
            <ToastContainer position="top-right" autoClose={3000} />
            <ConfirmDialog
                message={confirmAction?.message}
                onConfirm={confirmAction?.onConfirm}
                onCancel={() => setConfirmAction(null)}
            />

            {/* Sidebar */}
            <aside className="w-64 bg-white shadow-xl flex flex-col fixed h-full z-10 border-r border-orange-50">
                <div className="p-8 border-b bg-gradient-to-br from-orange-500 to-orange-600">
                    <div className="flex items-center gap-3">
                        <span className="text-4xl drop-shadow-md">🐾</span>
                        <div>
                            <h1 className="text-white font-black text-xl leading-tight tracking-tight">PetWellness</h1>
                            <p className="text-orange-100 text-[10px] font-bold uppercase tracking-widest opacity-80">Owner Portal</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-1 py-8 px-4 space-y-2 overflow-y-auto Scrollbar-thin">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => {
                                setActiveTab(tab.id);
                                if (tab.id !== "health") setSelectedPet(null);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-300 ${activeTab === tab.id
                                ? "bg-orange-500 text-white shadow-lg shadow-orange-200"
                                : "text-gray-500 hover:bg-orange-50 hover:text-orange-600"
                                }`}
                        >
                            <span>{tab.icon}</span>
                            {tab.label}
                            {tab.id === "cart" && cartCount > 0 && (
                                <span className="ml-auto bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                                    {cartCount}
                                </span>
                            )}
                        </button>
                    ))}
                </nav>

                <div className="p-6 border-t bg-gray-50">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-red-500 hover:bg-red-100 transition-colors"
                    >
                        {icons.logout}
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="ml-64 flex-1 p-10 min-h-screen bg-gray-50/50">
                <div className="max-w-6xl mx-auto">
                    <div className="mb-10 flex items-center justify-between animate-fadeIn">
                        <div>
                            <h2 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                                {TABS.find(t => t.id === activeTab)?.icon} {TABS.find(t => t.id === activeTab)?.label}
                            </h2>
                            <p className="text-gray-400 text-sm mt-1 font-medium italic">Everything your pet needs, in one place.</p>
                        </div>
                        <div className="bg-white rounded-2xl px-6 py-3 shadow-sm border border-gray-100 text-sm flex items-center gap-3">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            <span className="text-gray-500">Welcome,</span>
                            <span className="font-black text-orange-600 uppercase tracking-tighter">Pet Parent!</span>
                        </div>
                    </div>

                    <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 border border-gray-50 p-10 min-h-[600px] animate-slideUp">
                        {tabContent[activeTab]}
                    </div>
                </div>
            </main>
        </div>
    );
}
