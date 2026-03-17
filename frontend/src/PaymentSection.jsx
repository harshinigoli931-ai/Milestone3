import React, { useState } from "react";

export default function PaymentSection({ selectedMethod, onSelect, onContinue, loading }) {
    const [cardDetails, setCardDetails] = useState({ name: "", number: "", cvv: "", date: "" });
    const [paymentTab, setPaymentTab] = useState("CARD"); // "CARD", "UPI"
    const [selectedUpi, setSelectedUpi] = useState("");
    return (
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm animate-fadeIn">
            <h2 className="text-xl font-black text-gray-800 mb-6 flex items-center gap-3">
                <span className="bg-orange-50 p-2 rounded-xl text-lg">💳</span>
                Payment Method
            </h2>

            <div className="grid gap-4">
                <div>
                    <div
                        onClick={() => !loading && onSelect("RAZORPAY")}
                        className={`p-6 rounded-3xl border-2 cursor-pointer transition-all flex items-center justify-between ${selectedMethod === "RAZORPAY"
                            ? 'border-orange-500 bg-orange-50/30'
                            : 'border-gray-50 bg-gray-50 hover:border-gray-200'
                            } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <div className="flex items-center gap-4">
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedMethod === "RAZORPAY" ? 'border-orange-500 bg-orange-500' : 'border-gray-300'
                                }`}>
                                {selectedMethod === "RAZORPAY" && <span className="text-white text-[10px]">✓</span>}
                            </div>
                            <div>
                                <p className="font-black text-gray-800">Online Payments</p>
                                <p className="text-xs text-gray-400 font-bold">Fast & Secure Payments</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <span className="text-xs font-black text-blue-600 bg-blue-50 px-2 py-1 rounded">UPI</span>
                            <span className="text-xs font-black text-orange-600 bg-orange-50 px-2 py-1 rounded">CARD</span>
                        </div>
                    </div>
                </div>

                <div
                    onClick={() => !loading && onSelect("COD")}
                    className={`p-6 rounded-3xl border-2 cursor-pointer transition-all flex items-center justify-between ${selectedMethod === "COD"
                        ? 'border-orange-500 bg-orange-50/30'
                        : 'border-gray-50 bg-gray-50 hover:border-gray-200'
                        } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    <div className="flex items-center gap-4">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedMethod === "COD" ? 'border-orange-500 bg-orange-500' : 'border-gray-300'
                            }`}>
                            {selectedMethod === "COD" && <span className="text-white text-[10px]">✓</span>}
                        </div>
                        <div>
                            <p className="font-black text-gray-800">Cash on Delivery (COD)</p>
                            <p className="text-xs text-gray-400 font-bold">Pay when you receive</p>
                        </div>
                    </div>
                    <span className="text-xs font-black text-green-600 bg-green-50 px-2 py-1 rounded">CASH</span>
                </div>
            </div>

            <button
                onClick={onContinue}
                disabled={loading}
                className="w-full mt-8 py-4 bg-[#1a1a1a] text-white rounded-2xl font-black uppercase tracking-widest hover:bg-black transition shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? "Processing..." : (selectedMethod === "RAZORPAY" ? "Proceed to Pay →" : "Next → Review")}
            </button>
        </div>
    );
}
