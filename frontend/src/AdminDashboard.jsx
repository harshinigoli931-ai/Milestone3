import { useEffect, useState, useMemo } from "react";
import api from "./api";
import { useNavigate } from "react-router-dom";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { toast } from "react-toastify";



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

// ─── Icons (inline SVG) ────────────────────────────────────────────────────
const icons = {
    users: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
    ),
    pending: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    calendar: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
    ),
    shop: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
    ),
    plus: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
    ),
    logout: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
    ),
};

const TABS = [
    { id: "pending", label: "Dashboard", icon: icons.pending },
    { id: "users", label: "All Users", icon: icons.users },
    { id: "create", label: "Create Owner", icon: icons.plus },
    { id: "slots", label: "Appointment Slots", icon: icons.calendar },
    { id: "products", label: "Marketplace", icon: icons.shop },
    { id: "orders", label: "Orders", icon: icons.shop }, // Reuse shop icon for now
];

const CATEGORIES = ["FOOD", "TOYS", "MEDICINES", "ACCESSORIES", "GROOMING"];
const CAT_EMOJI = { FOOD: "🐾", TOYS: "🧸", MEDICINES: "💊", ACCESSORIES: "🎀", GROOMING: "🛁" };

// ─── Helpers ──────────────────────────────────────────────────────────────
function Badge({ status }) {
    const map = {
        PENDING: "bg-yellow-100 text-yellow-800",
        ACTIVE: "bg-green-100 text-green-800",
        REJECTED: "bg-red-100 text-red-800",
        SUSPENDED: "bg-gray-100 text-gray-600",
    };
    return (
        <span className={`text-xs px-3 py-1 rounded-full font-bold ${map[status] || "bg-gray-100 text-gray-600"}`}>
            {status}
        </span>
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

// ─── Tab: Pending Approvals ────────────────────────────────────────────────
function PendingTab({ setConfirmAction }) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadPending = async () => {
        try {
            setLoading(true);
            const res = await api.get("/admin/owners/pending");
            setUsers(res.data.data || []);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { loadPending(); }, []);

    const approve = async (id) => {
        try {
            await api.post(`/admin/owners/${id}/approve`);
            toast.success("User approved! Credentials sent by email.");
            loadPending();
        } catch (e) { toast.error(e.response?.data?.message || "Operation failed"); }
    };

    const reject = async (id) => {
        setConfirmAction({
            message: "Reject this registration?",
            onConfirm: async () => {
                try {
                    await api.post(`/admin/owners/${id}/reject`);
                    toast.success("Registration rejected");
                    loadPending();
                } catch (e) { toast.error(e.response?.data?.message || "Operation failed"); }
                setConfirmAction(null);
            }
        });
    };

    if (loading) return <Loader />;

    return (
        <div>
            <h2 className="text-xl font-bold text-gray-800 mb-6">Pending Owner Registrations</h2>
            {users.length === 0 ? (
                <EmptyState icon="🎉" message="No pending registrations." />
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-orange-50 text-gray-700 text-sm">
                                <th className="p-4 rounded-tl-lg">ID</th>
                                <th className="p-4">Email</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 rounded-tr-lg text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((u) => (
                                <tr key={u.userId} className="border-b hover:bg-orange-50/40 transition">
                                    <td className="p-4 text-gray-500 text-sm">#{u.userId}</td>
                                    <td className="p-4 font-medium text-gray-800">{u.email}</td>
                                    <td className="p-4"><Badge status={u.accountStatus} /></td>
                                    <td className="p-4 text-center space-x-2">
                                        <button onClick={() => approve(u.userId)}
                                            className="bg-green-500 hover:bg-green-600 text-white px-4 py-1.5 rounded-lg text-sm transition shadow-sm">
                                            Approve
                                        </button>
                                        <button onClick={() => reject(u.userId)}
                                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded-lg text-sm transition shadow-sm">
                                            Reject
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

// ─── Tab: All Users ────────────────────────────────────────────────────────
function UsersTab() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        api.get("/admin/users")
            .then(res => setUsers(res.data.data || []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const filtered = users.filter(u =>
        u.email?.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <Loader />;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">All Users</h2>
                <input
                    value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="🔍 Search by email..."
                    className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-orange-400 outline-none"
                />
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-orange-50 text-gray-700 text-sm">
                            <th className="p-4 rounded-tl-lg">ID</th>
                            <th className="p-4">Email</th>
                            <th className="p-4 rounded-tr-lg">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((u) => (
                            <tr key={u.userId} className="border-b hover:bg-orange-50/40 transition">
                                <td className="p-4 text-gray-500 text-sm">#{u.userId}</td>
                                <td className="p-4 font-medium text-gray-800">{u.email}</td>
                                <td className="p-4"><Badge status={u.accountStatus} /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filtered.length === 0 && <EmptyState icon="👥" message="No users found." />}
            </div>
        </div>
    );
}

// ─── Tab: Create Owner ─────────────────────────────────────────────────────
function CreateOwnerTab() {
    const [form, setForm] = useState({
        email: "", password: "", firstName: "", lastName: "", phone: "",
        dateOfBirth: "", gender: "MALE",
        street: "", city: "", state: "", zipCode: "", country: "",
        companyName: "", designation: "", yearsOfExperience: 0,
    });
    const [loading, setLoading] = useState(false);

    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async e => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post("/admin/owners", form);
            toast.success("Owner created! Login credentials sent to email.");
            setForm({ email: "", password: "", firstName: "", lastName: "", phone: "", dateOfBirth: "", gender: "MALE", street: "", city: "", state: "", zipCode: "", country: "", companyName: "", designation: "", yearsOfExperience: 0 });
        } catch (e) {
            toast.error(e.response?.data?.message || "Failed to create owner");
        } finally {
            setLoading(false);
        }
    };

    const inp = "w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-orange-400 outline-none";

    return (
        <div>
            <h2 className="text-xl font-bold text-gray-800 mb-6">Create Pet Owner Account</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <FormSection title="Account Details">
                    <Field label="Email *"><input name="email" type="email" required value={form.email} onChange={handleChange} className={inp} placeholder="owner@example.com" /></Field>
                    <Field label="Temporary Password *"><input name="password" type="password" required value={form.password} onChange={handleChange} className={inp} placeholder="Min 8 chars" /></Field>
                </FormSection>
                <FormSection title="Personal Info">
                    <Field label="First Name"><input name="firstName" value={form.firstName} onChange={handleChange} className={inp} placeholder="First name" /></Field>
                    <Field label="Last Name"><input name="lastName" value={form.lastName} onChange={handleChange} className={inp} placeholder="Last name" /></Field>
                    <Field label="Phone"><input name="phone" value={form.phone} onChange={handleChange} className={inp} placeholder="10-digit mobile" /></Field>
                    <Field label="Date of Birth"><input name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={handleChange} className={inp} /></Field>
                    <Field label="Gender">
                        <select name="gender" value={form.gender} onChange={handleChange} className={inp}>
                            <option value="MALE">Male</option>
                            <option value="FEMALE">Female</option>
                            <option value="OTHER">Other</option>
                        </select>
                    </Field>
                </FormSection>
                <FormSection title="Address">
                    <Field label="Street"><input name="street" value={form.street} onChange={handleChange} className={inp} placeholder="Street address" /></Field>
                    <Field label="City"><input name="city" value={form.city} onChange={handleChange} className={inp} /></Field>
                    <Field label="State"><input name="state" value={form.state} onChange={handleChange} className={inp} /></Field>
                    <Field label="ZIP Code"><input name="zipCode" value={form.zipCode} onChange={handleChange} className={inp} /></Field>
                    <Field label="Country"><input name="country" value={form.country} onChange={handleChange} className={inp} /></Field>
                </FormSection>
                <FormSection title="Work Details">
                    <Field label="Company"><input name="companyName" value={form.companyName} onChange={handleChange} className={inp} /></Field>
                    <Field label="Designation"><input name="designation" value={form.designation} onChange={handleChange} className={inp} /></Field>
                    <Field label="Years of Experience"><input name="yearsOfExperience" type="number" value={form.yearsOfExperience} onChange={handleChange} className={inp} min="0" /></Field>
                </FormSection>
                <div className="text-right">
                    <button type="submit" disabled={loading}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-full font-semibold transition shadow-md disabled:opacity-60">
                        {loading ? "Creating..." : "Create Owner Account"}
                    </button>
                </div>
            </form>
        </div>
    );
}
// ─── Tab: Appointment Slots ────────────────────────────────────────────────
function SlotsTab({ setConfirmAction }) {
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingSlot, setEditingSlot] = useState(null);
    const [form, setForm] = useState({ date: "", startTime: "", endTime: "", consultationType: "CLINIC", vetName: "" });

    const loadSlots = async () => {
        try {
            setLoading(true);
            const res = await api.get("/admin/slots");
            const fetchedSlots = res.data.data || [];

            fetchedSlots.sort((a, b) => {
                return new Date(b.date + "T" + b.startTime) - new Date(a.date + "T" + a.startTime);
            });

            setSlots(fetchedSlots);
        } catch (e) {
            console.error(e);
            toast.error("Failed to load slots");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSlots();
    }, []);

    const handleSlotSubmit = async e => {
        e.preventDefault();
        try {
            const payload = {
                ...form,
                startTime: form.startTime.length === 5 ? `${form.startTime}:00` : form.startTime,
                endTime: form.endTime.length === 5 ? `${form.endTime}:00` : form.endTime
            };

            if (editingSlot) {
                await api.put(`/admin/slots/${editingSlot.id}`, payload);
                toast.success("Slot updated successfully");
            } else {
                await api.post("/admin/slots", payload);
                toast.success("Slot created successfully");
            }

            setShowModal(false);
            setForm({ date: "", startTime: "", endTime: "", consultationType: "CLINIC", vetName: "" });
            setEditingSlot(null);
            loadSlots();

        } catch (e) {
            toast.error(e.response?.data?.message || "Failed to save slot");
        }
    };

    const deleteSlot = async (id) => {
        setConfirmAction({
            message: "Are you sure you want to delete this appointment slot?",
            onConfirm: async () => {
                try {
                    await api.delete(`/admin/slots/${id}`);
                    toast.success("Slot deleted successfully");
                    loadSlots();
                } catch (e) {
                    toast.error(e.response?.data?.message || "Failed to delete slot");
                }
                setConfirmAction(null);
            }
        });
    };

    const openEdit = (slot) => {
        setEditingSlot(slot);

        const formatTime = (t) => t ? t.substring(0, 5) : "";

        setForm({
            date: slot.date,
            startTime: formatTime(slot.startTime),
            endTime: formatTime(slot.endTime),
            consultationType: slot.consultationType,
            vetName: (slot.vet?.name ? slot.vet.name : slot.vetName) || ""
        });

        setShowModal(true);
    };

    const openCreate = () => {
        setEditingSlot(null);
        setForm({ date: "", startTime: "", endTime: "", consultationType: "CLINIC", vetName: "" });
        setShowModal(true);
    };

    const toggle = async (id) => {
        try {
            await api.put(`/admin/slots/${id}/toggle`);
            toast.success("Slot availability updated");
            loadSlots();
        } catch (e) {
            toast.error(e.response?.data?.message || "Failed to toggle slot");
        }
    };

    const inp = "w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-orange-400 outline-none";

    if (loading) return <Loader />;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Appointment Slots</h2>

                <button
                    onClick={openCreate}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-full text-sm font-semibold transition flex items-center gap-2 shadow-md"
                >
                    {icons.plus} New Slot
                </button>
            </div>

            {slots.length === 0 ? (
                <EmptyState icon="📅" message="No appointment slots created yet." />
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">

                    {slots.map(slot => (
                        <div key={slot.id} className="border border-gray-200 rounded-xl p-5 bg-white shadow-sm hover:shadow-md transition">

                            <div className="flex justify-between items-start mb-3">
                                <span className={`text-xs px-2 py-1 rounded-full font-bold ${slot.available ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                                    {slot.available ? "Available" : "Unavailable"}
                                </span>

                                <span className={`text-xs px-2 py-1 rounded-full ${slot.consultationType === "ONLINE" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"}`}>
                                    {slot.consultationType}
                                </span>
                            </div>

                            <p className="font-bold text-gray-800 text-sm mb-1">📅 {slot.date?.split("-").reverse().join("-")}</p>

                            <p className="text-gray-600 text-sm mb-1">
                                ⏰ {format12h(slot.startTime)} – {format12h(slot.endTime)}
                            </p>

                            {(slot.vet?.name || slot.vetName) && (
                                <p className="text-gray-500 text-xs mb-3">
                                    🩺 Dr. {(slot.vet?.name || slot.vetName || "").replace(/^Dr\.?\s*/i, "")}
                                </p>
                            )}

                            <div className="flex gap-2">

                                <button
                                    onClick={() => toggle(slot.id)}
                                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition ${slot.available ? "bg-red-50 text-red-600 hover:bg-red-100" : "bg-green-50 text-green-600 hover:bg-green-100"}`}
                                >
                                    {slot.available ? "Mark Unavailable" : "Mark Available"}
                                </button>

                                <button
                                    onClick={() => openEdit(slot)}
                                    className="px-3 py-1.5 border border-orange-500 text-orange-500 rounded-lg text-xs font-medium hover:bg-orange-50 transition"
                                >
                                    Edit
                                </button>

                                <button
                                    onClick={() => deleteSlot(slot.id)}
                                    className="px-3 py-1.5 border border-red-400 text-red-500 rounded-lg text-xs font-medium hover:bg-red-50 transition"
                                >
                                    Delete
                                </button>

                            </div>

                        </div>
                    ))}

                </div>
            )}

            {showModal && (
                <Modal title={editingSlot ? "Edit Appointment Slot" : "Create Appointment Slot"} onClose={() => setShowModal(false)}>

                    <form onSubmit={handleSlotSubmit} className="space-y-4">

                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">Date *</label>
                            <input type="date" required value={form.date}
                                onChange={e => setForm({ ...form, date: e.target.value })}
                                className={inp}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">

                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1 block">Start Time *</label>
                                <input type="time" required value={form.startTime}
                                    onChange={e => setForm({ ...form, startTime: e.target.value })}
                                    className={inp}
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1 block">End Time *</label>
                                <input type="time" required value={form.endTime}
                                    onChange={e => setForm({ ...form, endTime: e.target.value })}
                                    className={inp}
                                />
                            </div>

                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">Consultation Type</label>
                            <select value={form.consultationType}
                                onChange={e => setForm({ ...form, consultationType: e.target.value })}
                                className={inp}
                            >
                                <option value="CLINIC">Clinic</option>
                                <option value="ONLINE">Online</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">Veterinarian Name</label>
                            <input type="text"
                                value={form.vetName}
                                onChange={e => setForm({ ...form, vetName: e.target.value })}
                                className={inp}
                                placeholder="E.g. Dr. John Doe"
                            />
                        </div>

                        <div className="flex gap-3 pt-2">

                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-lg font-medium transition"
                            >
                                {editingSlot ? "Update Slot" : "Create Slot"}
                            </button>

                        </div>

                    </form>

                </Modal>
            )}
        </div>
    );
}

// ─── Tab: Products / Marketplace ───────────────────────────────────────────
function ProductsTab({ setConfirmAction }) {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [category, setCategory] = useState("");
    const [form, setForm] = useState({ name: "", description: "", price: "", stock: "", category: "FOOD", imageUrl: "" });

    const loadProducts = async () => {
        try {
            setLoading(true);
            const res = await api.get("/marketplace/products");
            setProducts(res.data.data || []);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { loadProducts(); }, []);

    const openEdit = (p) => {
        setEditing(p);
        setForm({ name: p.name, description: p.description, price: p.price, stock: p.stock, category: p.category, imageUrl: p.imageUrl || "" });
        setShowModal(true);
    };

    const openCreate = () => {
        setEditing(null);
        setForm({ name: "", description: "", price: "", stock: "", category: "FOOD", imageUrl: "" });
        setShowModal(true);
    };

    const handleSubmit = async e => {
        e.preventDefault();

        if (!form.imageUrl.trim()) {
            toast.error("Please enter product image URL");
            return;
        }

        const payload = {
            name: form.name,
            description: form.description,
            price: parseFloat(form.price),
            stock: parseInt(form.stock),
            category: form.category,
            imageUrl: form.imageUrl
        };

        console.log("Sending product data:", payload);

        try {
            if (editing) {
                await api.put(`/marketplace/products/${editing.id}`, {
                    name: form.name,
                    description: form.description,
                    price: Number(form.price),
                    stock: Number(form.stock),
                    category: form.category,
                    imageUrl: form.imageUrl
                });
                toast.success("Product updated successfully");
            } else {
                await api.post("/marketplace/products", payload);
                toast.success("Product added successfully");
            }
            setShowModal(false);
            loadProducts();
        } catch (e) {
            console.error("Product Save Error:", e);
            toast.error(e.response?.data?.message || "Failed to save product");
        }
    };

    const deleteProduct = async (id) => {
        setConfirmAction({
            message: "Remove this product from marketplace?",
            onConfirm: async () => {
                try {
                    await api.delete(`/marketplace/products/${id}`);
                    toast.success("Product deleted successfully");
                    loadProducts();
                } catch (e) { toast.error("Failed to delete"); }
                setConfirmAction(null);
            }
        });
    };

    const filtered = products.filter(p => !category || p.category === category);

    const inp = "w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-orange-400 outline-none";
    if (loading) return <Loader />;

    return (
        <div className="animate-fadeIn">
            {/* Orange Design Header */}
            <header className="bg-orange-500 text-white text-center py-6 rounded-t-2xl shadow-md mb-8 sticky top-0 z-20">
                <h1 className="text-2xl font-bold flex items-center justify-center gap-2">
                    <span className="text-3xl">🐾</span> Pet Product Marketplace (Admin)
                </h1>
                <button onClick={openCreate}
                    className="absolute right-6 top-1/2 -translate-y-1/2 bg-white text-orange-600 px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-md hover:bg-gray-50 active:scale-95 flex items-center gap-2">
                    {icons.plus} Add Product
                </button>
            </header>

            {/* Category Filter */}
            <div className="flex gap-2 overflow-x-auto pb-6 scrollbar-none mb-4">
                {["", ...CATEGORIES].map(cat => (
                    <button key={cat} onClick={() => setCategory(cat)}
                        className={`px-6 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all shadow-sm ${category === cat
                            ? "bg-orange-500 text-white scale-105"
                            : "bg-white border border-gray-200 text-gray-500 hover:border-orange-400 hover:text-orange-600"
                            }`}>
                        {cat ? `${CAT_EMOJI[cat] || ""} ${cat}` : "All Products"}
                    </button>
                ))}
            </div>

            {filtered.length === 0 ? (
                <EmptyState icon="🛍️" message="No products found in this category." />
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                    {filtered.map(p => (
                        <div key={p.id} className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group border-b-4 border-b-transparent hover:border-b-orange-500">
                            {/* Product Image Area */}
                            <div className="relative h-40 overflow-hidden bg-gray-50/50 p-4 flex items-center justify-center">
                                {p.imageUrl ? (
                                    <img
                                        src={p.imageUrl}
                                        alt={p.name}
                                        className="max-h-full object-contain transition-transform duration-500 group-hover:scale-110"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-xs font-bold uppercase tracking-widest text-center px-4">
                                        Image not available
                                    </div>
                                )}
                                <span className="absolute top-2 left-2 bg-white/90 text-gray-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-gray-100 uppercase">
                                    {p.category}
                                </span>
                            </div>

                            {/* Product Info */}
                            <div className="p-4 flex flex-col flex-1">
                                <h3 className="font-bold text-gray-800 text-sm mb-1 line-clamp-1 group-hover:text-orange-500 transition-colors">{p.name}</h3>
                                <p className="text-green-600 font-bold text-lg mb-2">₹{p.price}</p>

                                <div className="flex justify-between items-center mb-4 text-[10px] text-gray-400 font-medium">
                                    <span>Stock: {p.stock}</span>
                                    {p.brand && <span>{p.brand}</span>}
                                </div>

                                <div className="mt-auto flex gap-2">
                                    <button onClick={() => openEdit(p)}
                                        className="flex-1 bg-gray-100 hover:bg-orange-100 text-gray-600 hover:text-orange-600 py-2 rounded-xl text-xs font-bold transition-all">
                                        Edit
                                    </button>
                                    <button onClick={() => deleteProduct(p.id)}
                                        className="flex-1 bg-red-50 hover:bg-red-500 text-red-500 hover:text-white py-2 rounded-xl text-xs font-bold transition-all">
                                        Remove
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <Modal title={editing ? "Edit Product" : "Add New Product"} onClose={() => setShowModal(false)}>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">Product Name *</label>
                            <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className={inp} placeholder="e.g. Royal Canin Dog Food" />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">Description</label>
                            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className={inp} rows={2} placeholder="Short description..." />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1 block">Price (₹) *</label>
                                <input type="number" required step="0.01" min="0" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className={inp} />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1 block">Stock Qty *</label>
                                <input type="number" required min="0" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} className={inp} />
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">Category</label>
                            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className={inp}>
                                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">Image URL *</label>
                            <input
                                type="text"
                                placeholder="Paste product image URL"
                                value={form.imageUrl}
                                onChange={e => setForm({ ...form, imageUrl: e.target.value })}
                                className={inp}
                            />
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button type="button" onClick={() => setShowModal(false)}
                                className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition">Cancel</button>
                            <button type="submit"
                                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-lg font-medium transition">
                                {editing ? "Update" : "Add Product"}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
}

// ─── Tab: Admin Orders Management ─────────────────────────────────────
function AdminOrdersTab() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadOrders = async () => {
        try {
            setLoading(true);
            const res = await api.get("/admin/orders");
            setOrders(res.data.data || []);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { loadOrders(); }, []);

    const updateStatus = async (orderId, newStatus) => {
        try {
            await api.put(`/marketplace/orders/${orderId}/status`, null, {
                params: { status: newStatus }
            });
            toast.success("Order status updated successfully");
            loadOrders();
        } catch (e) {
            toast.error(e.response?.data?.message || "Operation failed");
        }
    };

    if (loading) return <Loader />;

    return (
        <div>
            <h2 className="text-xl font-bold text-gray-800 mb-6">Order Management</h2>
            {orders.length === 0 ? (
                <EmptyState icon="📦" message="No orders found." />
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-orange-50 text-gray-700 text-sm">
                                <th className="p-4 rounded-tl-lg">Order ID</th>
                                <th className="p-4">Customer</th>
                                <th className="p-4">Total</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 rounded-tr-lg">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => (
                                <tr key={order.id} className="border-b hover:bg-orange-50/40 transition">
                                    <td className="p-4 text-sm">#{order.id}</td>
                                    <td className="p-4 text-sm font-medium">{order.ownerEmail || "User"}</td>
                                    <td className="p-4 text-sm">₹{order.totalAmount}</td>
                                    <td className="p-4">
                                        <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="p-4 flex gap-2">
                                        <select
                                            className="text-xs border rounded p-1 outline-none"
                                            value={order.status}
                                            onChange={(e) => updateStatus(order.id, e.target.value)}
                                        >
                                            {["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"].map(s => (
                                                <option key={s} value={s}>{s}</option>
                                            ))}
                                        </select>
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
function Loader() {
    return (
        <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );
}

function EmptyState({ icon, message }) {
    return (
        <div className="text-center py-16 bg-orange-50 rounded-xl border-2 border-dashed border-orange-200">
            <div className="text-5xl mb-3">{icon}</div>
            <p className="text-gray-500">{message}</p>
        </div>
    );
}

function FormSection({ title, children }) {
    return (
        <div className="bg-orange-50/40 rounded-xl p-5 border border-orange-100">
            <h4 className="font-semibold text-orange-600 mb-4 text-sm uppercase tracking-wider">{title}</h4>
            <div className="grid md:grid-cols-2 gap-4">{children}</div>
        </div>
    );
}

function Field({ label, children }) {
    return (
        <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">{label}</label>
            {children}
        </div>
    );
}

// ─── Main AdminDashboard ───────────────────────────────────────────────────

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState("pending");
    const [confirmAction, setConfirmAction] = useState(null);
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        navigate("/login", { replace: true });
    };

    const tabContent = {
        pending: <PendingTab setConfirmAction={setConfirmAction} />,
        users: <UsersTab />,
        create: <CreateOwnerTab />,
        slots: <SlotsTab setConfirmAction={setConfirmAction} />,
        products: <ProductsTab setConfirmAction={setConfirmAction} />,
        orders: <AdminOrdersTab />,
        pet_stats: <PetStatisticsTab />,
        all_pets: <AllPetsTab />,
        vaccination_monitor: <VaccinationTab setConfirmAction={setConfirmAction} />,
    };

    return (
        <div className="min-h-screen bg-gray-50 flex font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-white shadow-lg flex flex-col fixed h-full z-10">
                {/* Logo */}
                <div className="p-6 border-b bg-gradient-to-r from-orange-500 to-orange-600">
                    <div className="flex items-center gap-3">
                        <span className="text-3xl">🐾</span>
                        <div>
                            <h1 className="text-white font-bold text-lg leading-tight">PetWellness</h1>
                            <p className="text-orange-100 text-xs">Admin Control Panel</p>
                        </div>
                    </div>
                </div>

                {/* Nav */}
                <nav className="flex-1 py-6 px-3 space-y-1">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === tab.id
                                ? "bg-orange-500 text-white shadow-md"
                                : "text-gray-600 hover:bg-orange-50 hover:text-orange-600"
                                }`}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </nav>

                {/* Logout */}
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

            {/* Main Content */}
            <main className="ml-64 flex-1 p-8 bg-gray-50/50 min-h-screen">
                <ConfirmDialog
                    message={confirmAction?.message}
                    onConfirm={confirmAction?.onConfirm}
                    onCancel={() => setConfirmAction(null)}
                />
                <div className="max-w-7xl mx-auto animate-fadeIn">
                    <div className="mb-8 flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                        <div>
                            <h2 className="text-3xl font-black text-gray-800 tracking-tight">
                                {TABS.find(t => t.id === activeTab)?.label}
                            </h2>
                            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Administrator Portal</p>
                        </div>
                        <div className="flex items-center gap-4 bg-gray-50 px-4 py-2 rounded-2xl border border-gray-100">
                            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-xl">🛡️</div>
                            <div>
                                <p className="text-[10px] text-gray-400 font-bold uppercase">System Status</p>
                                <p className="text-xs font-black text-green-600">Secure & Online</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl p-8 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.05)] border border-gray-100 min-h-[600px]">
                        {tabContent[activeTab]}
                    </div>
                </div>
            </main>
        </div>
    );
}

// --- Tab: Pet Statistics ------------------------------------
function PetStatisticsTab() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        api.get("/admin/statistics")
            .then(res => {
                if (res.data.success) setStats(res.data.data);
                else setError(res.data.message || "Failed to load statistics");
            })
            .catch(err => setError(err.message || "Error fetching stats"))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20 px-6">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#b5db1c]"></div>
                <span className="ml-3 text-gray-500 font-medium tracking-wide">Crunching numbers...</span>
            </div>
        );
    }
    if (error) {
        return (
            <div className="p-6">
                <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex items-center">
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {error}
                </div>
            </div>
        );
    }
    if (!stats) return null;

    const totalPets = stats.totalPets || 0;

    return (
        <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-800 tracking-tight mb-2">Platform Overview</h2>
            <p className="text-gray-500 mb-8">Snapshot of PetWellness system activities and registrations.</p>

            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] transition-all hover:-translate-y-1">
                    <div className="bg-orange-100 p-4 rounded-xl text-orange-600 mr-5">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" /></svg>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium mb-1">Total Registered Users</p>
                        <h3 className="text-3xl font-black text-gray-800">{stats.totalUsers}</h3>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] transition-all hover:-translate-y-1">
                    <div className="bg-[#eef8cc] p-4 rounded-xl text-[#8db10b] mr-5">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" /></svg>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium mb-1">Total Pets Tracked</p>
                        <h3 className="text-3xl font-black text-gray-800">{totalPets}</h3>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] transition-all hover:-translate-y-1">
                    <div className="bg-blue-50 p-4 rounded-xl text-blue-500 mr-5">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium mb-1">Appointments Booked</p>
                        <h3 className="text-3xl font-black text-gray-800">{stats.totalAppointments}</h3>
                    </div>
                </div>
            </div>

            {/* Species Distribution */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)]">
                <h3 className="text-lg font-bold text-gray-800 mb-6">Pet Species Distribution</h3>
                <div className="space-y-6">
                    {Object.entries(stats.petsBySpecies || {}).length > 0 ? (
                        Object.entries(stats.petsBySpecies).map(([species, count]) => {
                            const percentage = totalPets > 0 ? Math.round((count / totalPets) * 100) : 0;
                            return (
                                <div key={species}>
                                    <div className="flex justify-between items-end mb-2">
                                        <span className="font-semibold text-gray-700 capitalize text-sm">{species}</span>
                                        <span className="text-sm text-gray-500 font-medium">{count} ({percentage}%)</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                                        <div
                                            className="bg-gradient-to-r from-orange-400 to-[#b5db1c] h-3 rounded-full transition-all duration-1000 ease-out"
                                            style={{ width: `${percentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-center py-10 text-gray-400">
                            <p>No species data available.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// --- Tab: Medical Monitoring ------------------------------------
function MedicalMonitoringTab() { return <div className='p-6'>Medical Monitoring Pending</div>; }

// --- Tab: All Pets ------------------------------------
function AllPetsTab() {
    const [pets, setPets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        api.get("/admin/pets")
            .then(res => setPets(res.data.data || []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const filtered = pets.filter(p =>
        p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.ownerEmail?.toLowerCase().includes(search.toLowerCase()) ||
        p.species?.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <Loader />;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">All Registered Pets</h2>
                <input
                    value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="🔍 Search name, owner or species..."
                    className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-orange-400 outline-none w-80"
                />
            </div>

            {filtered.length === 0 ? (
                <EmptyState icon="🐾" message="No pets found." />
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-orange-50 text-gray-700 text-sm">
                                <th className="p-4 rounded-tl-lg">ID</th>
                                <th className="p-4">Pet Name</th>
                                <th className="p-4">Species & Breed</th>
                                <th className="p-4">Age / Gender</th>
                                <th className="p-4 rounded-tr-lg">Owner Email</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(p => (
                                <tr key={p.id} className="border-b hover:bg-orange-50/40 transition">
                                    <td className="p-4 text-gray-500 text-sm">#{p.id}</td>
                                    <td className="p-4 font-medium text-gray-800 flex items-center gap-2">
                                        {p.imageUrl ? (
                                            <img src={p.imageUrl} alt={p.name} className="w-8 h-8 rounded-full object-cover" />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-500">
                                                🐾
                                            </div>
                                        )}
                                        {p.name}
                                    </td>
                                    <td className="p-4 text-gray-600">
                                        {p.species} {p.breed ? `- ${p.breed}` : ''}
                                    </td>
                                    <td className="p-4 text-gray-600">
                                        {p.age ? `${p.age} yrs` : 'N/A'} / {p.gender || 'N/A'}
                                    </td>
                                    <td className="p-4 text-gray-600 text-sm">{p.ownerEmail || 'N/A'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

// --- Tab: Vaccination Monitoring ------------------------------------
function VaccinationTab({ setConfirmAction }) {
    const [vaccinations, setVaccinations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("ALL"); // ALL, OVERDUE, PENDING, COMPLETED
    const [showAddModal, setShowAddModal] = useState(false);
    const [pets, setPets] = useState([]);
    const [form, setForm] = useState({ petId: "", vaccineName: "", dateGiven: "", nextDueDate: "", batchNumber: "", administeredBy: "" });
    const [saving, setSaving] = useState(false);

    const inp = "w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-orange-400 outline-none";

    const handleDelete = async (vaxId) => {
        setConfirmAction({
            message: "Are you sure you want to delete this vaccination record?",
            onConfirm: async () => {
                try {
                    await api.delete(`/admin/vaccinations/${vaxId}`);
                    toast.success("Vaccination record deleted successfully");
                    setVaccinations(prev => prev.filter(v => v.id !== vaxId));
                } catch (e) {
                    toast.error(e.response?.data?.message || "Operation failed");
                }
                setConfirmAction(null);
            }
        });
    };

    const toggleStatus = async (vax) => {
        try {
            await api.put(`/admin/vaccinations/${vax.id}/toggle-complete`);
            toast.success(`Status updated!`);
            loadVaccinations();
        } catch (e) {
            toast.error("Failed to update status. Operation failed.");
        }
    };

    const loadVaccinations = async () => {
        try {
            setLoading(true);
            const res = await api.get("/admin/vaccinations");
            setVaccinations(res.data.data || []);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const loadPets = async () => {
        try {
            const res = await api.get("/admin/pets");
            setPets(res.data.data || []);
        } catch (e) {
            console.error("Failed to load pets for selection", e);
        }
    };

    useEffect(() => {
        loadVaccinations();
        loadPets();
    }, []);

    const handleAddVax = async (e) => {
        e.preventDefault();
        if (!form.petId) { toast.error("Please select a pet"); return; }
        setSaving(true);
        try {
            await api.post(`/admin/vaccinations/pets/${form.petId}`, form);
            toast.success("Vaccination record added successfully!");
            setShowAddModal(false);
            setForm({ petId: "", vaccineName: "", dateGiven: "", nextDueDate: "", batchNumber: "", administeredBy: "" });
            loadVaccinations();
        } catch (e) {
            toast.error(e.response?.data?.message || "Failed to add vaccination record");
        } finally {
            setSaving(false);
        }
    };

    const stats = useMemo(() => {
        const today = new Date().toISOString().split('T')[0];
        const total = vaccinations.length;
        const completed = vaccinations.filter(v => v.completed).length;
        const overdue = vaccinations.filter(v => !v.completed && v.nextDueDate && v.nextDueDate < today).length;
        const pending = vaccinations.filter(v => !v.completed && (!v.nextDueDate || v.nextDueDate >= today)).length;

        return { total, completed, overdue, pending };
    }, [vaccinations]);

    const chartData = [
        { name: 'Completed', value: stats.completed, color: '#22c55e' },
        { name: 'Overdue', value: stats.overdue, color: '#ef4444' },
        { name: 'Upcoming', value: stats.pending, color: '#eab308' },
    ].filter(d => d.value > 0);

    const filtered = vaccinations.filter(v => {
        const today = new Date().toISOString().split('T')[0];
        const matchesSearch =
            v.vaccineName?.toLowerCase().includes(search.toLowerCase()) ||
            v.pet?.name?.toLowerCase().includes(search.toLowerCase()) ||
            v.pet?.ownerEmail?.toLowerCase().includes(search.toLowerCase());

        if (!matchesSearch) return false;

        if (filter === "COMPLETED") return v.completed;
        if (filter === "OVERDUE") return !v.completed && v.nextDueDate && v.nextDueDate < today;
        if (filter === "PENDING") return !v.completed && (!v.nextDueDate || v.nextDueDate >= today);

        return true; // ALL
    });

    const getStatusInfo = (v) => {
        const today = new Date().toISOString().split('T')[0];
        if (v.completed) return { label: "COMPLETED", style: "bg-green-100 text-green-800" };
        if (v.nextDueDate && v.nextDueDate < today) return { label: "OVERDUE", style: "bg-red-100 text-red-800" };
        return { label: "PENDING", style: "bg-yellow-100 text-yellow-800" };
    };

    if (loading) return <Loader />;

    return (
        <div>
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Vaccination Monitoring</h2>
                    <p className="text-gray-500 text-sm mt-1">Track and manage pet vaccination schedules across the platform.</p>
                </div>
                <div className="flex flex-col md:flex-row gap-4 items-center w-full md:w-auto">
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="w-full md:w-auto bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2"
                    >
                        <span>+</span> Add Vaccination
                    </button>
                    <div className="relative w-full md:w-64">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                        <input
                            value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="Search vaccine, pet, or owner..."
                            className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-orange-400 outline-none transition-all shadow-sm"
                        />
                    </div>
                </div>
            </div>

            {/* Analytics Section */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
                <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard label="Total Records" value={stats.total} icon="📋" color="bg-blue-50 text-blue-600" />
                    <StatCard label="Overdue" value={stats.overdue} icon="⚠️" color="bg-red-50 text-red-600" />
                    <StatCard label="Upcoming" value={stats.pending} icon="⏳" color="bg-yellow-50 text-yellow-600" />
                    <StatCard label="Completed" value={stats.completed} icon="✅" color="bg-green-50 text-green-600" />
                </div>
                <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-4 h-48">
                    <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Status Distribution</h4>
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="80%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    innerRadius={30}
                                    outerRadius={50}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-300 text-xs">No data</div>
                    )}
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2 mb-6">
                {["ALL", "OVERDUE", "PENDING", "COMPLETED"].map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-full text-xs font-bold transition-all shadow-sm ${filter === f
                            ? "bg-orange-500 text-white"
                            : "bg-white text-gray-600 border border-gray-200 hover:bg-orange-50 hover:text-orange-600"
                            }`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* Table */}
            {filtered.length === 0 ? (
                <EmptyState icon="💉" message="No matching vaccination records found." />
            ) : (
                <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-gray-700 text-xs uppercase tracking-wider">
                                <th className="p-4 rounded-tl-xl">Pet & Owner</th>
                                <th className="p-4">Vaccine</th>
                                <th className="p-4">Administered</th>
                                <th className="p-4">Next Due Date</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 rounded-tr-xl text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filtered.map(v => {
                                const status = getStatusInfo(v);
                                return (
                                    <tr key={v.id} className="hover:bg-orange-50/30 transition group text-sm">
                                        <td className="p-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-800">{v.pet?.name || 'Unknown Pet'}</span>
                                                <span className="text-xs text-gray-400">{v.pet?.ownerEmail || 'No Owner'}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-gray-700">{v.vaccineName}</span>
                                                {v.batchNumber && <span className="text-[10px] text-gray-400 italic">Batch: {v.batchNumber}</span>}
                                            </div>
                                        </td>
                                        <td className="p-4 text-gray-600">
                                            <div className="flex flex-col">
                                                <span>{v.dateGiven || "N/A"}</span>
                                                {v.administeredBy && <span className="text-[10px] text-gray-400">By: {v.administeredBy}</span>}
                                            </div>
                                        </td>
                                        <td className="p-4 font-medium text-gray-600">{v.nextDueDate || "N/A"}</td>
                                        <td className="p-4">
                                            <span className={`text-[10px] px-2 py-1 rounded-full font-black ${status.style}`}>
                                                {status.label}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right space-x-3">
                                            {!v.completed && (
                                                <button
                                                    onClick={() => toggleStatus(v)}
                                                    className="text-green-500 hover:text-green-700 transition opacity-0 group-hover:opacity-100"
                                                    title="Mark as Completed"
                                                >
                                                    ✓
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDelete(v.id)}
                                                className="text-red-400 hover:text-red-600 transition"
                                                title="Delete record"
                                            >
                                                🗑️
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Add Vaccination Modal */}
            {showAddModal && (
                <Modal title="Record New Vaccination" onClose={() => setShowAddModal(false)}>
                    <form onSubmit={handleAddVax} className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">Select Pet *</label>
                            <select
                                required
                                value={form.petId}
                                onChange={e => setForm({ ...form, petId: e.target.value })}
                                className={inp}
                            >
                                <option value="">Choose a pet...</option>
                                {pets.map(p => (
                                    <option key={p.id} value={p.id}>
                                        {p.name} ({p.species}) - {p.ownerEmail}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">Vaccine Name *</label>
                            <input
                                required
                                value={form.vaccineName}
                                onChange={e => setForm({ ...form, vaccineName: e.target.value })}
                                className={inp}
                                placeholder="e.g. Rabies, Parvovirus"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1 block">Date Given *</label>
                                <input
                                    type="date"
                                    required
                                    value={form.dateGiven}
                                    onChange={e => setForm({ ...form, dateGiven: e.target.value })}
                                    className={inp}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1 block">Next Due Date</label>
                                <input
                                    type="date"
                                    value={form.nextDueDate}
                                    onChange={e => setForm({ ...form, nextDueDate: e.target.value })}
                                    className={inp}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1 block">Batch Number</label>
                                <input
                                    value={form.batchNumber}
                                    onChange={e => setForm({ ...form, batchNumber: e.target.value })}
                                    className={inp}
                                    placeholder="e.g. B12345"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1 block">Administered By</label>
                                <input
                                    value={form.administeredBy}
                                    onChange={e => setForm({ ...form, administeredBy: e.target.value })}
                                    className={inp}
                                    placeholder="e.g. Dr. Smith"
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={() => setShowAddModal(false)}
                                className="flex-1 border border-gray-300 py-2.5 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white py-2.5 rounded-xl font-bold transition shadow-md"
                            >
                                {saving ? "Saving..." : "Save Record"}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
}

function StatCard({ label, value, icon, color }) {
    return (
        <div className={`p-4 rounded-2xl border border-gray-100 bg-white shadow-sm flex items-center shadow-[0_4px_15px_-5px_rgba(0,0,0,0.05)]`}>
            <div className={`${color} p-3 rounded-xl mr-4 text-2xl shadow-inner`}>
                {icon}
            </div>
            <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{label}</p>
                <h3 className="text-2xl font-black text-gray-800 leading-tight">{value}</h3>
            </div>
        </div>
    );
}

