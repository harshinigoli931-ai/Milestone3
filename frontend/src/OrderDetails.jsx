import React, { useEffect, useState } from "react";
import api from "./api";
import { toast } from "react-toastify";
import TrackOrderModal from "./TrackOrderModal";

export default function OrderDetails({ orderId, onBack }) {
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showTrack, setShowTrack] = useState(false);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const res = await api.get(`/marketplace/orders/${orderId}`);
                setOrder(res.data.data);
            } catch (e) {
                console.error(e);
                toast.error("Failed to load order details");
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [orderId]);

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'DELIVERED': return 'text-green-600 bg-green-50 border-green-100';
            case 'CANCELLED': return 'text-red-600 bg-red-50 border-red-100';
            default: return 'text-orange-600 bg-orange-50 border-orange-100';
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center py-20">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    if (!order) return <div className="text-center py-20 font-bold text-gray-400">Order not found</div>;

    return (
        <div className="animate-fadeIn max-w-5xl mx-auto pb-12">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={onBack}
                    className="p-3 bg-white border border-gray-100 rounded-2xl hover:bg-gray-50 transition text-gray-400 hover:text-orange-600 shadow-sm"
                >
                    ←
                </button>
                <div>
                    <h2 className="text-2xl font-black text-gray-800 tracking-tight">Order Details</h2>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-full w-fit mt-1">
                        Order # {order.id}
                    </p>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Left Column: Summary & Products */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Summary Card */}
                    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] overflow-hidden">
                        <div className="p-8 border-b border-gray-50 flex justify-between items-start">
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Order Summary</p>
                                <h3 className="text-lg font-black text-gray-800">Everything looks good!</h3>
                            </div>
                            <span className={`px-4 py-2 rounded-2xl text-xs font-black border uppercase tracking-tighter ${getStatusColor(order.status)}`}>
                                {order.status}
                            </span>
                        </div>
                        <div className="p-8 grid sm:grid-cols-2 gap-8">
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Order Date</p>
                                <p className="text-sm font-bold text-gray-700">{formatDate(order.createdAt)}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Payment Status</p>
                                <p className="text-sm font-bold text-green-600 flex items-center gap-2">
                                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                    {order.paymentStatus || "PAID"}
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Payment Method</p>
                                <p className="text-sm font-bold text-gray-700 uppercase tracking-tighter">
                                    {order.paymentMethod === 'COD' ? 'Cash on Delivery' :
                                        order.paymentMethod === 'ONLINE' ? 'Online Payment' : (order.paymentMethod || 'N/A')}
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Expected Delivery</p>
                                <p className="text-sm font-bold text-orange-600">{formatDate(order.expectedDeliveryDate)}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Transaction ID</p>
                                <p className="text-sm font-medium text-gray-500 font-mono">{order.transactionId || "N/A"}</p>
                            </div>
                        </div>
                    </div>

                    {/* Product List */}
                    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] p-8">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-lg font-black text-gray-800">Items Ordered</h3>
                            <span className="text-xs font-bold text-gray-400 uppercase bg-gray-50 px-3 py-1 rounded-full">
                                {order.items.length} Products
                            </span>
                        </div>
                        <div className="space-y-6">
                            {order.items.map((item, idx) => (
                                <div key={idx} className="flex gap-6 items-center group p-4 rounded-3xl hover:bg-gray-50/50 transition border border-transparent hover:border-gray-100">
                                    <div className="w-20 h-20 bg-white rounded-2xl p-3 border border-gray-50 flex-shrink-0">
                                        <img
                                            src={item.productImageUrl || "https://via.placeholder.com/100"}
                                            alt={item.productName}
                                            className="w-full h-full object-contain"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-gray-800 group-hover:text-orange-600 transition">{item.productName}</h4>
                                        <div className="flex gap-8 mt-2">
                                            <p className="text-xs font-bold text-gray-400">Qty: {item.quantity}</p>
                                            <p className="text-xs font-bold text-gray-400">Unit: ₹{item.unitPrice}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-black text-gray-900 tracking-tighter">₹{item.totalPrice}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-8 pt-8 border-t border-gray-100 flex justify-between items-center">
                            <span className="text-lg font-bold text-gray-800">Total Amount</span>
                            <span className="text-2xl font-black text-orange-600 tracking-tighter">₹{order.totalAmount}</span>
                        </div>
                    </div>
                </div>

                {/* Right Column: Address & Tracking */}
                <div className="space-y-8">
                    {/* Delivery Address */}
                    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                        <p className="text-red-500 text-sm font-semibold mb-2 uppercase tracking-widest">
                            DELIVERY ADDRESS
                        </p>
                        {order.deliveryAddress ? (
                            <div className="space-y-1">
                                <h3 className="text-lg font-bold text-gray-900">
                                    {order.deliveryAddress.fullName}
                                </h3>
                                <p className="text-gray-600 text-sm">{order.deliveryAddress.street}</p>
                                <p className="text-gray-600 text-sm">
                                    {order.deliveryAddress.city}, {order.deliveryAddress.state}
                                </p>
                                <p className="text-gray-600 text-sm">{order.deliveryAddress.postalCode}</p>
                                <p className="text-gray-900 font-medium mt-2 text-sm">
                                    {order.deliveryAddress.phone}
                                </p>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 italic leading-relaxed">
                                {order.shippingAddress || "Address details not available"}
                            </p>
                        )}
                    </div>

                    {/* Tracking Quick View */}
                    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] p-8">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-6">Order Status Tracking</h3>

                        <div className="space-y-6 pl-4 border-l-2 border-orange-100 relative">
                            {[
                                { label: 'Order Placed', status: 'CONFIRMED' },
                                { label: 'Processing', status: 'PROCESSING' },
                                { label: 'Shipped', status: 'SHIPPED' },
                                { label: 'Out for Delivery', status: 'OUT_FOR_DELIVERY' },
                                { label: 'Delivered', status: 'DELIVERED' }
                            ].map((s, idx) => {
                                // Simplified logic for quick view
                                const steps = ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'];
                                const currentIndex = steps.indexOf(order.status);
                                const isCompleted = steps.indexOf(s.status) <= currentIndex;
                                const isCurrent = s.status === order.status;

                                return (
                                    <div key={idx} className="relative">
                                        <div className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full border-2 bg-white transition-all duration-500 ${isCompleted ? 'border-orange-500 bg-orange-500' : 'border-orange-200'
                                            } ${isCurrent ? 'ring-4 ring-orange-100' : ''}`}></div>
                                        <p className={`text-sm font-bold transition-colors ${isCompleted ? 'text-gray-800' : 'text-gray-300'}`}>
                                            {s.label}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>

                        <button
                            onClick={() => setShowTrack(true)}
                            className="w-full mt-8 py-4 bg-orange-50 text-orange-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-orange-100 transition"
                        >
                            Open Detailed Tracker
                        </button>
                    </div>

                    {order.status === 'CANCELLED' && (
                        <div className="bg-red-50 p-6 rounded-[2.5rem] border border-red-100">
                            <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-2">Cancellation Detail</p>
                            <p className="text-sm font-bold text-red-600 leading-relaxed italic">
                                "{order.cancellationReason || "No reason provided."}"
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {showTrack && (
                <TrackOrderModal
                    order={order}
                    onClose={() => setShowTrack(false)}
                />
            )}
        </div>
    );
}
