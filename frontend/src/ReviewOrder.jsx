import React from "react";

export default function ReviewOrder({ items, address, paymentMethod, total, onPlaceOrder, loading }) {
    const expectedDate = new Date();
    expectedDate.setDate(expectedDate.getDate() + 5);

    return (
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm animate-fadeIn">
            <h2 className="text-xl font-black text-gray-800 mb-8 flex items-center gap-3">
                <span className="bg-orange-50 p-2 rounded-xl text-lg">📝</span>
                Review Order
            </h2>

            <div className="space-y-8">
                {/* Items Review */}
                <div className="space-y-4">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Items Ordered</p>
                    {items.map(item => (
                        <div key={item.id} className="flex gap-4 items-center">
                            <div className="w-12 h-12 bg-gray-50 rounded-xl p-2 border border-gray-50 flex-shrink-0">
                                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-bold text-gray-800">{item.name}</p>
                                <p className="text-[10px] text-gray-400 font-bold">Qty: {item.quantity} | ₹{item.price}</p>
                            </div>
                            <p className="text-sm font-black text-gray-900">₹{item.price * item.quantity}</p>
                        </div>
                    ))}
                </div>

                <div className="grid sm:grid-cols-2 gap-8 pt-8 border-t border-gray-50">
                    {/* Address Review */}
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Delivery Address</p>
                        <div className="text-sm">
                            <p className="font-bold text-gray-800">{address?.fullName}</p>
                            <p className="text-gray-500 mt-1">{address?.street}</p>
                            <p className="text-gray-500">{address?.city}, {address?.state} - {address?.postalCode}</p>
                            <p className="text-gray-400 font-bold mt-2">📱 {address?.phone}</p>
                        </div>
                    </div>

                    {/* Payment Review */}
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Payment Method</p>
                        <div className="flex items-center gap-2">
                            <span className="text-lg">{paymentMethod === "COD" ? "💵" : "💳"}</span>
                            <p className="text-sm font-bold text-gray-800">
                                {paymentMethod === "COD" ? "Cash on Delivery" : "UPI / Razorpay Online"}
                            </p>
                        </div>
                        <p className="text-[10px] text-gray-400 font-bold mt-4 uppercase">Expected Delivery</p>
                        <p className="text-sm font-bold text-orange-600">
                            {expectedDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
                        </p>
                    </div>
                </div>

                <button
                    onClick={onPlaceOrder}
                    disabled={loading}
                    className="w-full mt-8 py-5 bg-orange-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest hover:bg-orange-500 transition shadow-xl shadow-orange-600/20 active:scale-95 disabled:bg-gray-400 disabled:shadow-none"
                >
                    {loading ? "Placing Order..." : "Place Order"}
                </button>
            </div>
        </div>
    );
}
