import { useEffect, useState } from "react";
import api from "./api";
import { useNavigate } from "react-router-dom";

// â”€â”€â”€ Icons (inline SVG) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
    { id: "pet_stats", label: "Pet Statistics", icon: icons.calendar },
    { id: "all_pets", label: "All Pets", icon: icons.users },
    { id: "vaccination", label: "Vaccination", icon: icons.plus },
    { id: "medical_records", label: "Medical Monitoring", icon: icons.shop },
    { id: "users", label: "All Users", icon: icons.users },
    { id: "create", label: "Create Owner", icon: icons.plus },
    { id: "slots", label: "Book Vet Appointment", icon: icons.calendar },
    { id: "products", label: "Marketplace", icon: icons.shop },
];

// â”€â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4">
                <div className="flex justify-between items-center p-6 border-b">
                    <h3 className="text-lg font-bold text-gray-800">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
                </div>
                <div className="p-6">{children}</div>
            </div>
        </div>
    );
}

// â”€â”€â”€ Tab: Pending Approvals â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function PendingTab() {
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
            alert("âœ… User approved! Credentials sent by email.");
            loadPending();
        } catch (e) { alert(e.response?.data?.message || "Failed"); }
    };

    const reject = async (id) => {
        if (!window.confirm("Reject this registration?")) return;
        try {
            await api.post(`/admin/owners/${id}/reject`);
            loadPending();
        } catch (e) { alert(e.response?.data?.message || "Failed"); }
    };

    if (loading) return <Loader />;

    return (
        <div>
            <h2 className="text-xl font-bold text-gray-800 mb-6">Pending Owner Registrations</h2>
            {users.length === 0 ? (
                <EmptyState icon="ðŸŽ‰" message="No pending registrations." />
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

// â”€â”€â”€ Tab: All Users â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
                    placeholder="ðŸ” Search by email..."
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
                {filtered.length === 0 && <EmptyState icon="ðŸ‘¥" message="No users found." />}
            </div>
        </div>
    );
}

// â”€â”€â”€ Tab: Create Owner â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
            alert("âœ… Owner created! Login credentials sent to email.");
            setForm({ email: "", password: "", firstName: "", lastName: "", phone: "", dateOfBirth: "", gender: "MALE", street: "", city: "", state: "", zipCode: "", country: "", companyName: "", designation: "", yearsOfExperience: 0 });
        } catch (e) {
            alert(e.response?.data?.message || "Failed to create owner");
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

// â”€â”€â”€ Tab: Appointment Slots â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function SlotsTab() {
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ date: "", startTime: "", endTime: "", consultationType: "CLINIC", veterinarianName: "" });

    const loadSlots = async () => {
        try {
            setLoading(true);
            const res = await api.get("/admin/slots");
            setSlots(res.data.data || []);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { loadSlots(); }, []);

    const createSlot = async e => {
        e.preventDefault();
        try {
            await api.post("/admin/slots", form);
            alert("âœ… Slot created!");
            setShowModal(false);
            setForm({ date: "", startTime: "", endTime: "", consultationType: "CLINIC", veterinarianName: "" });
            loadSlots();
        } catch (e) { alert(e.response?.data?.message || "Failed"); }
    };

    const toggle = async (id) => {
        try {
            await api.put(`/admin/slots/${id}/toggle`);
            loadSlots();
        } catch (e) { alert("Failed to toggle slot"); }
    };

    const inp = "w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-orange-400 outline-none";

    if (loading) return <Loader />;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Appointment Slots</h2>
                <button onClick={() => setShowModal(true)}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-full text-sm font-semibold transition flex items-center gap-2 shadow-md">
                    {icons.plus} New Slot
                </button>
            </div>

            {slots.length === 0 ? (
                <EmptyState icon="ðŸ“…" message="No appointment slots created yet." />
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
                            <p className="font-bold text-gray-800 text-sm mb-1">ðŸ“… {slot.date}</p>
                            <p className="text-gray-600 text-sm mb-1">â° {slot.startTime} â€“ {slot.endTime}</p>
                            {slot.veterinarianName && <p className="text-gray-500 text-xs mb-3">ðŸ©º Dr. {slot.veterinarianName}</p>}
                            <button onClick={() => toggle(slot.id)}
                                className={`w-full py-2 rounded-lg text-sm font-medium transition ${slot.available ? "bg-red-50 text-red-600 hover:bg-red-100" : "bg-green-50 text-green-600 hover:bg-green-100"}`}>
                                {slot.available ? "Mark Unavailable" : "Mark Available"}
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <Modal title="Create Appointment Slot" onClose={() => setShowModal(false)}>
                    <form onSubmit={createSlot} className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">Date *</label>
                            <input type="date" required value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className={inp} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1 block">Start Time *</label>
                                <input type="time" required value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} className={inp} />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1 block">End Time *</label>
                                <input type="time" required value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })} className={inp} />
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">Consultation Type</label>
                            <select value={form.consultationType} onChange={e => setForm({ ...form, consultationType: e.target.value })} className={inp}>
                                <option value="CLINIC">Clinic</option>
                                <option value="ONLINE">Online</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">Veterinarian Name</label>
                            <input value={form.veterinarianName} onChange={e => setForm({ ...form, veterinarianName: e.target.value })} className={inp} placeholder="Dr. Smith" />
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button type="button" onClick={() => setShowModal(false)}
                                className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition">
                                Cancel
                            </button>
                            <button type="submit"
                                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-lg font-medium transition">
                                Create Slot
                            </button>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
}

// â”€â”€â”€ Tab: Products / Marketplace â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const CATEGORIES = ["FOOD", "TOYS", "MEDICINES", "ACCESSORIES"];

function ProductsTab() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ name: "", description: "", price: "", stockQuantity: "", category: "FOOD", imageUrl: "" });

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
        setForm({ name: p.name, description: p.description, price: p.price, stockQuantity: p.stockQuantity, category: p.category, imageUrl: p.imageUrl || "" });
        setShowModal(true);
    };

    const openCreate = () => {
        setEditing(null);
        setForm({ name: "", description: "", price: "", stockQuantity: "", category: "FOOD", imageUrl: "" });
        setShowModal(true);
    };

    const handleSubmit = async e => {
        e.preventDefault();
        const payload = { ...form, price: parseFloat(form.price), stockQuantity: parseInt(form.stockQuantity) };
        try {
            if (editing) {
                await api.put(`/admin/products/${editing.id}`, payload);
                alert("âœ… Product updated!");
            } else {
                await api.post("/admin/products", payload);
                alert("âœ… Product created!");
            }
            setShowModal(false);
            loadProducts();
        } catch (e) { alert(e.response?.data?.message || "Failed"); }
    };

    const deleteProduct = async (id) => {
        if (!window.confirm("Remove this product from marketplace?")) return;
        try {
            await api.delete(`/admin/products/${id}`);
            loadProducts();
        } catch (e) { alert("Failed to delete"); }
    };

    const inp = "w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-orange-400 outline-none";
    if (loading) return <Loader />;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Marketplace Products</h2>
                <button onClick={openCreate}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-full text-sm font-semibold transition flex items-center gap-2 shadow-md">
                    {icons.plus} Add Product
                </button>
            </div>

            {products.length === 0 ? (
                <EmptyState icon="ðŸ›ï¸" message="No products added yet." />
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {products.map(p => (
                        <div key={p.id} className="border border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md transition overflow-hidden">
                            <div className="bg-gradient-to-br from-orange-50 to-yellow-50 h-36 flex items-center justify-center text-5xl">
                                {p.category === "FOOD" ? "ðŸ¾" : p.category === "TOYS" ? "ðŸ§¸" : p.category === "MEDICINES" ? "ðŸ’Š" : "ðŸŽ€"}
                            </div>
                            <div className="p-4">
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className="font-bold text-gray-800 text-sm">{p.name}</h3>
                                    <span className="text-orange-600 font-bold text-sm">â‚¹{p.price}</span>
                                </div>
                                <p className="text-gray-500 text-xs mb-2 line-clamp-2">{p.description}</p>
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">{p.category}</span>
                                    <span className="text-xs text-gray-500">Stock: {p.stockQuantity}</span>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => openEdit(p)}
                                        className="flex-1 border border-orange-500 text-orange-500 py-1.5 rounded-lg text-xs font-medium hover:bg-orange-50 transition">
                                        Edit
                                    </button>
                                    <button onClick={() => deleteProduct(p.id)}
                                        className="flex-1 border border-red-400 text-red-500 py-1.5 rounded-lg text-xs font-medium hover:bg-red-50 transition">
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
                                <label className="text-sm font-medium text-gray-700 mb-1 block">Price (â‚¹) *</label>
                                <input type="number" required step="0.01" min="0" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className={inp} />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-700 mb-1 block">Stock Qty *</label>
                                <input type="number" required min="0" value={form.stockQuantity} onChange={e => setForm({ ...form, stockQuantity: e.target.value })} className={inp} />
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">Category</label>
                            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className={inp}>
                                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-1 block">Image URL</label>
                            <input value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })} className={inp} placeholder="https://..." />
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

// â”€â”€â”€ Shared UI â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

// â”€â”€â”€ Main AdminDashboard â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState("pending");
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        navigate("/login");
    };

    const tabContent = {
        pending: <PendingTab />,
        pet_stats: <PetStatisticsTab />,
        all_pets: <AllPetsTab />,
        vaccination: <VaccinationTab />,
        medical_records: <MedicalMonitoringTab />,
        users: <UsersTab />,
        create: <CreateOwnerTab />,
        slots: <SlotsTab />,
        products: <ProductsTab />,
    };

    return (
        <div className="min-h-screen bg-gray-50 flex font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-white shadow-lg flex flex-col fixed h-full z-10">
                {/* Logo */}
                <div className="p-6 border-b bg-gradient-to-r from-orange-500 to-orange-600">
                    <div className="flex items-center gap-3">
                        <span className="text-3xl">ðŸ¾</span>
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
            <main className="ml-64 flex-1 p-8 min-h-screen">
                {/* Top bar */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">
                            {TABS.find(t => t.id === activeTab)?.label}
                        </h2>
                        <p className="text-gray-500 text-sm mt-1">Pet Wellness Platform</p>
                    </div>
                    <div className="bg-white rounded-xl px-4 py-2 shadow-sm border text-sm text-gray-600">
                        ðŸ‘‹ Hello, <span className="font-semibold text-orange-600">Admin</span>
                    </div>
                </div>

                {/* Content Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 min-h-[500px]">
                    {tabContent[activeTab]}
                </div>
            </main>
        </div>
    );
}

// --- Tab: Pet Statistics ------------------------------------
function PetStatisticsTab() { return <div>Pet Statistics Pending</div>; }

// --- Tab: Medical Monitoring ------------------------------------
function MedicalMonitoringTab() { return <div className='p-6'>Medical Monitoring Pending</div>; }

// --- Tab: All Pets ------------------------------------
function AllPetsTab() { return <div className='p-6'>All Pets Pending</div>; }

// --- Tab: Vaccination ------------------------------------
function VaccinationTab() { return <div className='p-6'>Vaccination Monitoring Pending</div>; }
/ /   m e d i c a l   t a b s   a p p e n d e d . . . 
 
 
