import React from "react";

export default function TrackOrderModal({ order, onClose }) {
    const statuses = [
        { key: "PENDING", label: "Order Placed" },
        { key: "CONFIRMED", label: "Confirmed" },
        { key: "PROCESSING", label: "Processing" },
        { key: "SHIPPED", label: "Shipped" },
        { key: "OUT_FOR_DELIVERY", label: "Out For Delivery" },
        { key: "DELIVERED", label: "Delivered" },
    ];

    const getCurrentIndex = () => {
        if (order.status === "CANCELLED") return -1;
        const index = statuses.findIndex(s => s.key === order.status);
        return index === -1 ? 0 : index;
    };

    const currentIndex = getCurrentIndex();

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl scale-in">
                <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h3 className="font-bold text-gray-800 text-lg">Track Order #{order.id}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl transition-colors">×</button>
                </div>
                <div className="p-8">
                    {order.status === "CANCELLED" ? (
                        <div className="text-center py-10">
                            <div className="text-5xl mb-4">🚫</div>
                            <h4 className="text-xl font-bold text-red-500">Order Cancelled</h4>
                            <p className="text-gray-500 mt-2">Reason: {order.cancellationReason || "Not specified"}</p>
                        </div>
                    ) : (
                        <div className="relative">
                            {/* Vertical Line */}
                            <div className="absolute left-4 top-0 bottom-0 w-1 bg-gray-100 rounded-full"></div>

                            <div className="space-y-8 relative">
                                {statuses.map((s, idx) => (
                                    <div key={s.key} className="flex items-center gap-6">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 transition-all duration-500 border-4 ${idx <= currentIndex
                                                ? "bg-orange-500 border-orange-200"
                                                : "bg-white border-gray-100"
                                            }`}>
                                            {idx <= currentIndex && <span className="text-white text-xs">✓</span>}
                                        </div>
                                        <div>
                                            <p className={`font-bold transition-colors ${idx <= currentIndex ? "text-gray-900" : "text-gray-300"
                                                }`}>{s.label}</p>
                                            {idx === currentIndex && (
                                                <p className="text-xs text-orange-500 font-semibold animate-pulse">Current Status</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="mt-10 pt-6 border-t flex justify-end">
                        <button onClick={onClose} className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition">
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
