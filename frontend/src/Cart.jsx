import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function Cart() {
    const [cart, setCart] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const storedCart = JSON.parse(localStorage.getItem("cart") || "[]");
        setCart(storedCart);
    }, []);

    const updateQuantity = (id, delta) => {
        const updated = cart.map(item => {
            if (item.id === id) {
                const newQty = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQty };
            }
            return item;
        });
        setCart(updated);
        localStorage.setItem("cart", JSON.stringify(updated));
    };

    const removeItem = (id) => {
        const updated = cart.filter(item => item.id !== id);
        setCart(updated);
        localStorage.setItem("cart", JSON.stringify(updated));
        toast.info("Item removed from cart");
    };

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    if (cart.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-white min-h-screen pt-24">
                <div className="text-8xl mb-4">🛒</div>
                <h2 className="text-2xl font-bold text-gray-800">Your cart is empty</h2>
                <button onClick={() => navigate("/dashboard")} className="mt-6 bg-orange-500 text-white px-8 py-3 rounded-xl font-bold">Start Shopping</button>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen pt-24 pb-12 px-4 md:px-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-4">
                        {cart.map(item => (
                            <div key={item.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex gap-4">
                                <img src={item.imageUrl} alt={item.name} className="w-24 h-24 object-contain rounded-lg border p-2" />
                                <div className="flex-1">
                                    <h3 className="font-bold text-gray-800">{item.name}</h3>
                                    <p className="text-sm text-gray-500 line-clamp-1">{item.category}</p>
                                    <p className="text-orange-600 font-bold mt-2">₹{item.price}</p>

                                    <div className="flex justify-between items-center mt-3">
                                        <div className="flex items-center border rounded-lg overflow-hidden">
                                            <button onClick={() => updateQuantity(item.id, -1)} className="px-3 py-1 bg-gray-50 hover:bg-gray-100">-</button>
                                            <span className="px-4 font-medium">{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.id, 1)} className="px-3 py-1 bg-gray-50 hover:bg-gray-100">+</button>
                                        </div>
                                        <button onClick={() => removeItem(item.id)} className="text-red-500 text-sm font-medium hover:underline">Remove</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-fit space-y-4">
                        <h2 className="text-xl font-bold text-gray-800 border-b pb-4">Order Summary</h2>
                        <div className="flex justify-between text-gray-600">
                            <span>Subtotal</span>
                            <span>₹{total}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                            <span>Delivery</span>
                            <span className="text-green-500 px-1 rounded-md bg-green-50">FREE</span>
                        </div>
                        <div className="border-t pt-4 flex justify-between text-xl font-bold text-gray-900">
                            <span>Total</span>
                            <span>₹{total}</span>
                        </div>
                        <button
                            onClick={() => navigate("/checkout", { state: { items: cart } })}
                            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-xl font-bold transition shadow-lg"
                        >
                            Checkout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
