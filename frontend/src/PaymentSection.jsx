import React, { useState } from "react";

export default function PaymentSection({ selectedMethod, onSelect, onContinue }) {
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
                        onClick={() => onSelect("RAZORPAY")}
                        className={`p-6 rounded-3xl border-2 cursor-pointer transition-all flex items-center justify-between ${(selectedMethod === "RAZORPAY" || (selectedMethod && selectedMethod.startsWith("ONLINE_")))
                            ? 'border-orange-500 bg-orange-50/30'
                            : 'border-gray-50 bg-gray-50 hover:border-gray-200'
                            }`}
                    >
                        <div className="flex items-center gap-4">
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${(selectedMethod === "RAZORPAY" || (selectedMethod && selectedMethod.startsWith("ONLINE_"))) ? 'border-orange-500 bg-orange-500' : 'border-gray-300'
                                }`}>
                                {(selectedMethod === "RAZORPAY" || (selectedMethod && selectedMethod.startsWith("ONLINE_"))) && <span className="text-white text-[10px]">✓</span>}
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

                    {(selectedMethod === "RAZORPAY" || (selectedMethod && selectedMethod.startsWith("ONLINE_"))) && (
                        <div className="mt-4 p-6 bg-gray-50/30 rounded-3xl border-2 border-orange-100/50 space-y-4 animate-fadeIn">
                            {/* Tabs */}
                            <div className="flex gap-4 border-b border-gray-100 pb-3">
                                <button type="button" onClick={() => setPaymentTab("CARD")} className={`pb-2 text-sm font-black transition-all ${paymentTab === 'CARD' ? 'text-orange-500 border-b-2 border-orange-500' : 'text-gray-400'}`}>Debit/Credit Card</button>
                                <button type="button" onClick={() => setPaymentTab("UPI")} className={`pb-2 text-sm font-black transition-all ${paymentTab === 'UPI' ? 'text-orange-500 border-b-2 border-orange-500' : 'text-gray-400'}`}>UPI Apps</button>
                            </div>

                            {paymentTab === "CARD" ? (
                                <div className="space-y-4 animate-fadeIn">
                                    <div className="flex gap-2 mb-2 items-center">
                                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Cards Accepted:</span>
                                        <div className="flex gap-1">
                                            <span className="text-[10px] font-black bg-white border border-gray-100 px-1.5 py-0.5 rounded shadow-sm text-gray-600">VISA</span>
                                            <span className="text-[10px] font-black bg-white border border-gray-100 px-1.5 py-0.5 rounded shadow-sm text-orange-600">MASTER</span>
                                            <span className="text-[10px] font-black bg-white border border-gray-100 px-1.5 py-0.5 rounded shadow-sm text-blue-600">AMEX</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1 block">Cardholder name</label>
                                        <input placeholder="e.g. Simon Petrikov" value={cardDetails.name} onChange={e => setCardDetails({ ...cardDetails, name: e.target.value })} className="w-full border-none bg-white rounded-xl p-3 text-sm focus:ring-2 focus:ring-orange-400 outline-none transition shadow-sm" />
                                    </div>
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="col-span-2">
                                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1 block">Card number</label>
                                            <input placeholder="1234 5678 1234 5678" maxLength="19" value={cardDetails.number} onChange={e => {
                                                const v = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
                                                const matches = v.match(/\d{4,16}/g);
                                                const match = matches && matches[0] || '';
                                                const parts = [];
                                                for (let i = 0, len = match.length; i < len; i += 4) parts.push(match.substring(i, i + 4));
                                                if (parts.length) setCardDetails({ ...cardDetails, number: parts.join(' ') });
                                                else setCardDetails({ ...cardDetails, number: v });
                                            }} className="w-full border-none bg-white rounded-xl p-3 text-sm focus:ring-2 focus:ring-orange-400 outline-none transition shadow-sm" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1 block">Expiry Date</label>
                                            <input placeholder="MM/YY" maxLength="5" value={cardDetails.date} onChange={e => {
                                                const v = e.target.value.replace(/[^0-9/]/g, "");
                                                if (v.length === 2 && !v.includes("/")) setCardDetails({ ...cardDetails, date: v + "/" });
                                                else setCardDetails({ ...cardDetails, date: v });
                                            }} className="w-full border-none bg-white rounded-xl p-3 text-sm focus:ring-2 focus:ring-orange-400 outline-none transition shadow-sm" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1 block">CVV</label>
                                        <input placeholder="123" maxLength="3" type="password" value={cardDetails.cvv} onChange={e => setCardDetails({ ...cardDetails, cvv: e.target.value.replace(/[^0-9]/g, "") })} className="w-4/12 border-none bg-white rounded-xl p-3 text-sm focus:ring-2 focus:ring-orange-400 outline-none transition shadow-sm" />
                                    </div>
                                    <button type="button" onClick={() => { onSelect("ONLINE_CARD"); onContinue(); }} className="w-full mt-2 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-black text-sm transition shadow-lg shadow-green-100 flex items-center justify-center">
                                        Verify & Pay
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4 animate-fadeIn">
                                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1 block">Select UPI Option</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div onClick={() => { setSelectedUpi("BHIM"); onSelect("ONLINE_BHIM"); }} className={`p-4 bg-white rounded-2xl border-2 flex items-center justify-center cursor-pointer transition-all ${selectedUpi === 'BHIM' || selectedMethod === "ONLINE_BHIM" ? 'border-green-500 bg-green-50/10' : 'border-gray-50 hover:border-gray-100'}`}>
                                            <img src="/bhim.png" className="h-6 object-contain" alt="BHIM" />
                                        </div>
                                        <div onClick={() => { setSelectedUpi("PHONEPE"); onSelect("ONLINE_PHONEPE"); }} className={`p-4 bg-white rounded-2xl border-2 flex items-center justify-center cursor-pointer transition-all ${selectedUpi === 'PHONEPE' || selectedMethod === "ONLINE_PHONEPE" ? 'border-purple-500 bg-purple-50/10' : 'border-gray-50 hover:border-gray-100'}`}>
                                            <img src="/phonepe.svg" className="h-6 object-contain" alt="PhonePe" />
                                        </div>
                                        <div onClick={() => { setSelectedUpi("PAYTM"); onSelect("ONLINE_PAYTM"); }} className={`p-4 bg-white rounded-2xl border-2 flex items-center justify-center cursor-pointer transition-all ${selectedUpi === 'PAYTM' || selectedMethod === "ONLINE_PAYTM" ? 'border-blue-500 bg-blue-50/10' : 'border-gray-50 hover:border-gray-100'}`}>
                                            <img src="/paytm.svg" className="h-6 object-contain" alt="Paytm" />
                                        </div>
                                        <div onClick={() => { setSelectedUpi("GPAY"); onSelect("ONLINE_GPAY"); }} className={`p-4 bg-white rounded-2xl border-2 flex items-center justify-center cursor-pointer transition-all ${selectedUpi === 'GPAY' || selectedMethod === "ONLINE_GPAY" ? 'border-blue-500 bg-blue-50/20' : 'border-gray-50 hover:border-gray-100'}`}>
                                            <img src="/gpay.png" className="h-6 object-contain" alt="G Pay" />
                                        </div>
                                        <div onClick={() => { setSelectedUpi("RAZORPAY"); onSelect("ONLINE_RAZORPAY"); }} className={`p-4 bg-white rounded-2xl border-2 flex items-center justify-center cursor-pointer transition-all col-span-2 ${selectedUpi === 'RAZORPAY' || selectedMethod === "ONLINE_RAZORPAY" ? 'border-orange-500 bg-orange-50/10' : 'border-gray-50 hover:border-gray-100'}`}>
                                            <img src="/razorpay.svg" className="h-6 object-contain" alt="Razorpay" />
                                        </div>
                                    </div>

                                    {(selectedUpi || (selectedMethod && selectedMethod.startsWith("ONLINE_") && selectedMethod !== "ONLINE_CARD")) && (
                                        <div className="mt-4 space-y-3 animate-fadeIn">
                                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest block">Enter your UPI ID</label>
                                            <div className="flex border border-gray-100 rounded-xl overflow-hidden shadow-sm bg-white">
                                                <input placeholder="Username/Number" className="flex-1 p-3 text-sm focus:outline-none bg-white" />
                                                <div className="bg-gray-50 flex items-center px-4 border-l border-gray-100 text-xs font-bold text-gray-400">@upi</div>
                                            </div>
                                            <button type="button" onClick={() => { onSelect("ONLINE_" + (selectedUpi || selectedMethod.split("_")[1])); onContinue(); }} className="w-full mt-2 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-black text-sm transition shadow-lg shadow-green-100 flex items-center justify-center">
                                                Verify & Pay
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div
                    onClick={() => onSelect("COD")}
                    className={`p-6 rounded-3xl border-2 cursor-pointer transition-all flex items-center justify-between ${selectedMethod === "COD"
                        ? 'border-orange-500 bg-orange-50/30'
                        : 'border-gray-50 bg-gray-50 hover:border-gray-200'
                        }`}
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
                className="w-full mt-8 py-4 bg-[#1a1a1a] text-white rounded-2xl font-black uppercase tracking-widest hover:bg-black transition shadow-xl"
            >
                Next → Review
            </button>
        </div>
    );
}
