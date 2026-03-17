import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "./api";
import { toast } from "react-toastify";
import PaymentSection from "./PaymentSection";
import ReviewOrder from "./ReviewOrder";

export default function Checkout() {
    const { state } = useLocation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1); // 1: Address, 2: Payment, 3: Review

    const [addresses, setAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState("COD");

    const [newAddress, setNewAddress] = useState({
        fullName: "",
        phone: "",
        street: "",
        city: "",
        state: "",
        postalCode: ""
    });
    const [isEditing, setIsEditing] = useState(false);
    const [editingAddressId, setEditingAddressId] = useState(null);

    const paymentRef = useRef(null);
    const reviewRef = useRef(null);

    const items = state?.items || [];
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const loadAddresses = async () => {
        try {
            const res = await api.get("/users/addresses");
            const data = Array.isArray(res.data.data) ? res.data.data : (Array.isArray(res.data) ? res.data : []);
            setAddresses(data);
            if (data.length > 0 && !selectedAddressId) {
                setSelectedAddressId(data[0].id);
            }
        } catch (e) {
            console.error("Failed to load addresses", e);
            setAddresses([]);
        }
    };

    useEffect(() => {
        if (!state?.items) {
            navigate("/dashboard");
            return;
        }
        loadAddresses();

        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        document.body.appendChild(script);
    }, [state, navigate]);

    const handleSaveAddress = async (e) => {
        e.preventDefault();
        try {
            let res;
            if (isEditing) {
                res = await api.put(`/users/addresses/${editingAddressId}`, newAddress);
                toast.success("Address updated successfully");
            } else {
                res = await api.post("/users/addresses", newAddress);
                toast.success("Address saved successfully");
            }

            const savedAddr = res.data.data || res.data;
            if (savedAddr && savedAddr.id) {
                loadAddresses();
                setSelectedAddressId(savedAddr.id);
                setShowAddressForm(false);
                setIsEditing(false);
                setEditingAddressId(null);
                setNewAddress({ fullName: "", phone: "", street: "", city: "", state: "", postalCode: "" });
                if (!isEditing) {
                    setStep(2);
                    setTimeout(() => paymentRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
                }
            }
        } catch (e) {
            console.error(e);
            toast.error(isEditing ? "Failed to update address" : "Failed to save address");
        }
    };

    const handleEditAddress = (addr) => {
        setNewAddress({
            fullName: addr.fullName,
            phone: addr.phone,
            street: addr.street,
            city: addr.city,
            state: addr.state,
            postalCode: addr.postalCode
        });
        setIsEditing(true);
        setEditingAddressId(addr.id);
        setShowAddressForm(true);
    };

    const handleDeleteAddress = async (id) => {
        if (!window.confirm("Are you sure you want to delete this address?")) return;
        try {
            await api.delete(`/users/addresses/${id}`);
            toast.success("Address deleted successfully");
            loadAddresses();
            if (selectedAddressId === id) setSelectedAddressId(null);
        } catch (e) {
            console.error(e);
            toast.error("Failed to delete address");
        }
    };

    const handleContinueToPayment = () => {
        if (!selectedAddressId) {
            toast.warning("Please select a delivery address");
            return;
        }
        setStep(2);
        setTimeout(() => reviewRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    };

    const handleContinueToReview = () => {
        setStep(3);
        setTimeout(() => paymentRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    };

    const handlePlaceOrder = async () => {
        if (paymentMethod === "RAZORPAY") {
            handleRazorpayPayment();
        } else {
            handleFinalOrderPlacement("COD");
        }
    };

    const handleRazorpayPayment = async () => {
        setLoading(true);
        try {
            const orderRes = await api.post("/payments/create-order", {
                items: items.map(i => ({ productId: i.id, quantity: i.quantity }))
            });

            const { id: razorpayOrderId, amount, currency, key } = orderRes.data.data;

            const selectedAddr = Array.isArray(addresses) ? addresses.find(a => a.id === selectedAddressId) : null;
            const options = {
                key,
                amount,
                currency,
                name: "Pet Wellness",
                description: "Purchase of Pet Products",
                order_id: razorpayOrderId,
                handler: async function (response) {
                    setLoading(true); // Show loader immediately after payment closes
                    try {
                        const verifyRes = await api.post("/payments/verify", {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            order_details: {
                                items: items.map(i => ({ productId: i.id, quantity: i.quantity })),
                                shippingAddress: selectedAddr ? `${selectedAddr.street}, ${selectedAddr.city}` : "",
                                addressId: selectedAddressId
                            }
                        });

                        if (verifyRes.data.success) {
                            localStorage.removeItem("cart");
                            toast.success("Order placed successfully");
                            navigate("/dashboard", { state: { activeTab: "orders" } });
                        }
                    } catch (e) {
                        toast.error("Payment verification failed");
                    } finally {
                        setLoading(false);
                    }
                },
                prefill: {
                    name: selectedAddr?.fullName,
                    contact: selectedAddr?.phone
                },
                theme: { color: "#f97316" }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', () => toast.error("Payment failed"));
            rzp.open();

        } catch (e) {
            toast.error("Failed to initialize payment");
        } finally {
            setLoading(false);
        }
    };

    const handleFinalOrderPlacement = async (method) => {
        setLoading(true);
        try {
            const selectedAddr = Array.isArray(addresses) ? addresses.find(a => a.id === selectedAddressId) : null;
            const res = await api.post("/marketplace/orders", {
                items: items.map(i => ({ productId: i.id, quantity: i.quantity })),
                addressId: selectedAddressId,
                paymentMethod: method,
                shippingAddress: selectedAddr ? `${selectedAddr.street}, ${selectedAddr.city}` : ""
            });

            if (res.data.success) {
                localStorage.removeItem("cart");
                toast.success("Order placed successfully");
                navigate("/dashboard", { state: { activeTab: "orders" } });
            }
        } catch (e) {
            toast.error("Failed to place order");
        } finally {
            setLoading(false);
        }
    };

    if (items.length === 0) return null;

    const selectedAddr = Array.isArray(addresses) ? addresses.find(a => a.id === selectedAddressId) : null;

    return (
        <div className="bg-gray-50 min-h-screen pt-24 pb-20 px-4 md:px-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center gap-4 mb-10">
                    <button onClick={() => navigate("/cart")} className="p-3 bg-white rounded-2xl border border-gray-100 hover:bg-gray-50 transition drop-shadow-sm">← Cart</button>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Checkout</h1>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Guided Order Process</p>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-2 space-y-10">
                        {/* 1. Delivery Address */}
                        <div className={`transition-all duration-500 ${step > 1 ? 'opacity-60 grayscale-[0.2]' : ''}`}>
                            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden">
                                {step > 1 && (
                                    <button onClick={() => setStep(1)} className="absolute top-8 right-8 text-[10px] font-black text-orange-600 uppercase tracking-widest hover:underline">Edit Address</button>
                                )}
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-black text-gray-800 flex items-center gap-3">
                                        <span className="bg-orange-50 p-2 rounded-xl text-lg">📍</span>
                                        Delivery Address
                                    </h2>
                                    {step === 1 && !showAddressForm && (
                                        <button
                                            onClick={() => setShowAddressForm(true)}
                                            className="text-xs font-black text-orange-600 uppercase tracking-widest hover:bg-orange-50 px-4 py-2 rounded-xl transition"
                                        >
                                            + Add New
                                        </button>
                                    )}
                                </div>

                                {showAddressForm ? (
                                    <form onSubmit={handleSaveAddress} className="space-y-4 animate-fadeIn">
                                        <div className="grid grid-cols-2 gap-4">
                                            <input placeholder="Full Name" className="w-full border-none bg-gray-50 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-orange-400 outline-none transition" value={newAddress.fullName} onChange={e => setNewAddress({ ...newAddress, fullName: e.target.value })} required />
                                            <input placeholder="Phone Number" className="w-full border-none bg-gray-50 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-orange-400 outline-none transition" value={newAddress.phone} onChange={e => setNewAddress({ ...newAddress, phone: e.target.value })} required />
                                        </div>
                                        <input placeholder="Street Address" className="w-full border-none bg-gray-50 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-orange-400 outline-none transition" value={newAddress.street} onChange={e => setNewAddress({ ...newAddress, street: e.target.value })} required />
                                        <div className="grid grid-cols-3 gap-4">
                                            <input placeholder="City" className="w-full border-none bg-gray-50 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-orange-400 outline-none transition" value={newAddress.city} onChange={e => setNewAddress({ ...newAddress, city: e.target.value })} required />
                                            <input placeholder="State" className="w-full border-none bg-gray-50 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-orange-400 outline-none transition" value={newAddress.state} onChange={e => setNewAddress({ ...newAddress, state: e.target.value })} required />
                                            <input placeholder="Postal Code" className="w-full border-none bg-gray-50 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-orange-400 outline-none transition" value={newAddress.postalCode} onChange={e => setNewAddress({ ...newAddress, postalCode: e.target.value })} required />
                                        </div>
                                        <div className="flex gap-4 pt-4">
                                            <button type="button" onClick={() => setShowAddressForm(false)} className="flex-1 py-4 bg-gray-50 rounded-2xl font-bold text-gray-400">Cancel</button>
                                            <button type="submit" className="flex-1 py-4 bg-orange-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-orange-600/20">Save & Select</button>
                                        </div>
                                    </form>
                                ) : (
                                    <div className="grid gap-4">
                                        {!Array.isArray(addresses) || addresses.length === 0 ? (
                                            <div className="text-center py-10 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100">
                                                <p className="text-gray-400 text-sm font-bold">No saved addresses found.</p>
                                            </div>
                                        ) : (
                                            addresses.map(addr => (
                                                <div key={addr.id} onClick={() => step === 1 && setSelectedAddressId(addr.id)} className={`p-6 rounded-3xl border-2 transition-all ${selectedAddressId === addr.id ? 'border-red-500 bg-red-50/20' : 'border-gray-50 bg-gray-50'} ${step === 1 ? 'cursor-pointer hover:border-red-100' : ''}`}>
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <p className="font-black text-gray-800 text-lg">{addr.fullName}</p>
                                                            <p className="text-gray-500 text-sm mt-1">{addr.street}, {addr.city}</p>
                                                            <p className="text-gray-400 text-xs mt-3 font-bold">📞 {addr.phone}</p>
                                                            <div className="mt-4 flex gap-3">
                                                                <button
                                                                    className="text-blue-500 text-sm font-bold hover:underline"
                                                                    onClick={(e) => { e.stopPropagation(); handleEditAddress(addr); }}
                                                                >
                                                                    Edit
                                                                </button>
                                                                <span className="text-gray-300">|</span>
                                                                <button
                                                                    className="text-red-500 text-sm font-bold hover:underline"
                                                                    onClick={(e) => { e.stopPropagation(); handleDeleteAddress(addr.id); }}
                                                                >
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        </div>
                                                        {selectedAddressId === addr.id && <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-white text-[10px]">✓</div>}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                        {step === 1 && Array.isArray(addresses) && addresses.length > 0 && (
                                            <div className="flex justify-end mt-6">
                                                <button onClick={handleContinueToPayment} className="px-8 py-4 bg-[#1a1a1a] text-white rounded-2xl font-black uppercase tracking-widest hover:bg-black transition flex items-center justify-center gap-2">
                                                    Next: Payment →
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 2. Review Order */}
                        <div ref={reviewRef} className={`transition-all duration-500 ${step < 2 ? 'opacity-30 pointer-events-none' : step > 2 ? 'opacity-60 grayscale-[0.2]' : ''}`}>
                            {step >= 2 && (
                                <div className="space-y-6">
                                    <ReviewOrder
                                        items={items}
                                        address={selectedAddr}
                                        paymentMethod={null}
                                        total={total}
                                        onPlaceOrder={handleContinueToReview}
                                        loading={loading}
                                        buttonText="Proceed to Payment →"
                                    />
                                    {step === 2 && (
                                        <div className="flex items-center px-8">
                                            <button
                                                onClick={() => setStep(1)}
                                                className="px-6 py-3 border-2 border-gray-100 rounded-2xl font-bold text-gray-400 hover:bg-gray-50 transition"
                                            >
                                                ← Previous: Address
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* 3. Payment Method */}
                        <div ref={paymentRef} className={`transition-all duration-500 ${step < 3 ? 'opacity-30 pointer-events-none' : ''}`}>
                            {step >= 3 && (
                                <div className="space-y-6">
                                    <PaymentSection
                                        selectedMethod={paymentMethod}
                                        onSelect={setPaymentMethod}
                                        onContinue={paymentMethod === "RAZORPAY" ? handleRazorpayPayment : () => handleFinalOrderPlacement("COD")}
                                        loading={loading}
                                    />
                                    {step === 3 && (
                                        <div className="flex justify-between items-center px-8">
                                            <button
                                                onClick={() => setStep(2)}
                                                disabled={loading}
                                                className="px-6 py-3 border-2 border-gray-100 rounded-2xl font-bold text-gray-400 hover:bg-gray-50 transition disabled:opacity-50"
                                            >
                                                ← Previous: Review
                                            </button>
                                            <button
                                                onClick={paymentMethod === "RAZORPAY" ? handleRazorpayPayment : () => handleFinalOrderPlacement("COD")}
                                                disabled={loading}
                                                className="px-8 py-4 bg-[#1a1a1a] text-white rounded-2xl font-black uppercase tracking-widest hover:bg-black transition disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {loading ? "Processing..." : (paymentMethod === "RAZORPAY" ? "Proceed to Pay →" : "Place Order")}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Order Summary Sidebar */}
                    <div className="bg-white border border-gray-200 rounded-[2.5rem] p-10 h-fit sticky top-24 shadow-sm">
                        <p className="text-red-500 text-xs font-black uppercase tracking-[0.2em] mb-8">Order Summary</p>
                        <div className="space-y-5">
                            <div className="flex justify-between text-gray-600 text-sm font-bold">
                                <span>Items ({items.length})</span>
                                <span>₹{total}</span>
                            </div>
                            <div className="flex justify-between text-gray-600 text-sm font-bold">
                                <span>Delivery Fee</span>
                                <span className="text-green-600">FREE</span>
                            </div>
                            <div className="pt-6 border-t border-gray-100 flex justify-between items-end">
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Amount</p>
                                    <p className="text-5xl font-black text-red-500 tracking-tighter">₹{total}</p>
                                </div>
                            </div>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-10 text-center font-bold uppercase tracking-widest">Secure Checkout</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
