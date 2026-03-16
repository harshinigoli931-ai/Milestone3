import React, { useState } from "react";
import api from "./api";
import { toast } from "react-toastify";

export default function CancelOrderModal({ order, onClose, onSuccess }) {
    const [reason, setReason] = useState("");
    const [otherReason, setOtherReason] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const reasons = [
        "Ordered by mistake",
        "Found cheaper elsewhere",
        "Delivery taking too long",
        "Wrong address",
        "Other"
    ];

    const handleCancel = async () => {
        if (!reason) {
            toast.warning("Please select a reason for cancellation");
            return;
        }

        const finalReason = reason === "Other" ? otherReason : reason;
        if (reason === "Other" && !otherReason.trim()) {
            toast.warning("Please provide a reason");
            return;
        }

        try {
            setSubmitting(true);
            await api.put(`/marketplace/orders/${order.id}/cancel`, null, {
                params: { reason: finalReason }
            });
            toast.success("Order cancelled successfully");
            onSuccess();
            onClose();
        } catch (e) {
            console.error(e);
            toast.error("Failed to cancel order");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl scale-in">
                <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h3 className="font-bold text-gray-800 text-lg">Cancel Order</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl transition-colors">×</button>
                </div>

                <div className="p-6">
                    <div className="bg-orange-50 p-4 rounded-xl mb-6">
                        <p className="text-xs font-bold text-orange-600 uppercase mb-2">Order Summary</p>
                        <div className="flex gap-4">
                            <div className="w-12 h-12 bg-white rounded border flex items-center justify-center text-xl">📦</div>
                            <div>
                                <p className="text-sm font-bold text-gray-800">Order ID: #{order.id}</p>
                                <p className="text-xs text-gray-500">Amount: ₹{order.totalAmount}</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Select Reason</label>
                            <select
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-orange-400 outline-none"
                            >
                                <option value="">Choose a reason...</option>
                                {reasons.map(r => (
                                    <option key={r} value={r}>{r}</option>
                                ))}
                            </select>
                        </div>

                        {reason === "Other" && (
                            <textarea
                                placeholder="Tell us more..."
                                value={otherReason}
                                onChange={(e) => setOtherReason(e.target.value)}
                                className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-orange-400 outline-none"
                                rows={3}
                            />
                        )}
                    </div>

                    <div className="mt-8 flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 border border-gray-200 rounded-xl font-bold text-sm text-gray-500 hover:bg-gray-50 transition"
                        >
                            Back
                        </button>
                        <button
                            onClick={handleCancel}
                            disabled={submitting}
                            className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold text-sm hover:bg-red-600 transition shadow-lg shadow-red-500/20 disabled:opacity-50"
                        >
                            {submitting ? "Processing..." : "Confirm Cancellation"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
