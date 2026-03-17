import React, { useEffect, useState } from "react";
import api from "./api";
import { toast } from "react-toastify";
import OrderDetails from "./OrderDetails";
import CancelOrderModal from "./CancelOrderModal";

export default function OrderHistory() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const [orderToCancel, setOrderToCancel] = useState(null);
    const [showCancelModal, setShowCancelModal] = useState(false);

    const loadOrders = async () => {
        try {
            setLoading(true);
            const res = await api.get("/marketplace/orders");
            const sorted = (res.data.data || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setOrders(sorted);
        } catch (e) {
            console.error(e);
            toast.error("Failed to load order history");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOrders();
    }, []);

    const openCancel = (e, order) => {
        e.stopPropagation();
        setOrderToCancel(order);
        setShowCancelModal(true);
    };

    const canCancel = (status) => {
        return ["PENDING", "CONFIRMED", "PROCESSING"].includes(status);
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    if (selectedOrderId) {
        return <OrderDetails orderId={selectedOrderId} onBack={() => setSelectedOrderId(null)} />;
    }

    if (loading) return (
        <div className="flex justify-center items-center py-20">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    if (orders.length === 0) {
        return (
            <div className="text-center py-20 bg-gray-50 rounded-[2.5rem] border-2 border-dashed mx-4">
                <div className="text-7xl mb-6">📦</div>
                <h3 className="text-2xl font-black text-gray-800">No orders yet</h3>
                <p className="text-gray-500 max-w-xs mx-auto mt-2">Looks like you haven't explored our marketplace yet.</p>
            </div>
        );
    }

    return (
        <div className="animate-fadeIn pb-10">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black text-gray-800 flex items-center gap-3">
                    <span className="bg-orange-100 p-2 rounded-xl">📦</span> My Orders
                </h2>
                <span className="text-sm font-bold text-gray-300 uppercase tracking-widest">{orders.length} Orders Placed</span>
            </div>

            <div className="grid gap-6">
                {orders.map(order => (
                    <div
                        key={order.id}
                        onClick={() => setSelectedOrderId(order.id)}
                        className="bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group flex flex-col md:flex-row gap-6 relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-orange-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                        {/* Product Image Summary */}
                        <div className="w-24 h-24 bg-gray-50 rounded-2xl p-4 flex-shrink-0 flex items-center justify-center border border-gray-50 group-hover:border-orange-100 transition">
                            {order.items && order.items.length > 0 ? (
                                <img
                                    src={order.items[0].productImageUrl || "https://via.placeholder.com/100"}
                                    alt="Product"
                                    className="w-full h-full object-contain"
                                />
                            ) : <span className="text-3xl">📦</span>}
                        </div>

                        {/* Order Info */}
                        <div className="flex-1 space-y-2">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-black text-gray-800 group-hover:text-orange-600 transition tracking-tight">
                                        {order.items && order.items.length > 0 ? order.items[0].productName : "Product"}
                                        {order.items && order.items.length > 1 && <span className="text-gray-400 text-sm ml-2 font-bold">(+ {order.items.length - 1} more)</span>}
                                    </h3>
                                    <p className="text-[10px] uppercase font-black text-gray-400 tracking-wider">Order ID: #{order.id}</p>
                                </div>
                                <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter shadow-sm ${order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                                    order.status === 'CANCELLED' ? 'bg-red-100 text-red-600' :
                                        'bg-orange-100 text-orange-600'
                                    }`}>
                                    {order.status}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                                <div>
                                    <p className="text-[9px] uppercase font-black text-gray-400">Date</p>
                                    <p className="text-xs font-bold text-gray-700">{formatDate(order.createdAt)}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] uppercase font-black text-gray-400">Total</p>
                                    <p className="text-xs font-bold text-orange-600">₹{order.totalAmount}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] uppercase font-black text-gray-400">Expected Delivery</p>
                                    <p className="text-xs font-bold text-gray-700">{formatDate(order.expectedDeliveryDate)}</p>
                                </div>
                                <div className="flex items-end justify-end gap-3 flex-wrap">
                                    <button className="text-[10px] font-black uppercase text-orange-600 hover:tracking-widest transition-all">
                                        View Details →
                                    </button>
                                    {canCancel(order.status) && (
                                        <button
                                            onClick={(e) => openCancel(e, order)}
                                            className="text-[10px] font-black uppercase text-red-500 hover:text-red-700 hover:tracking-widest transition-all border-l border-gray-100 pl-3"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>
                ))}
            </div>

            {showCancelModal && orderToCancel && (
                <CancelOrderModal
                    order={orderToCancel}
                    onClose={() => setShowCancelModal(false)}
                    onSuccess={loadOrders}
                />
            )}
        </div>
    );
}
