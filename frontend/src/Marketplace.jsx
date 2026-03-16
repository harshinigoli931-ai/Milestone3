import React, { useEffect, useState } from "react";
import api from "./api";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

// ─── Shared UI Components ──────────────────────────────────────────────────
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
            <p className="text-gray-500 mb-4">{message}</p>
        </div>
    );
}

const CAT_EMOJI = { FOOD: "🐾", TOYS: "🧸", MEDICINES: "💊", ACCESSORIES: "🎀", GROOMING: "🛁" };

export default function Marketplace() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        api.get("/marketplace/products")
            .then(res => setProducts(res.data.data || []))
            .catch(() => toast.error("Failed to load products"))
            .finally(() => setLoading(false));
    }, []);

    const addToCart = (product) => {
        const cart = JSON.parse(localStorage.getItem("cart") || "[]");
        const existing = cart.find(item => item.id === product.id);

        if (existing) {
            existing.quantity += 1;
        } else {
            cart.push({ ...product, quantity: 1 });
        }

        localStorage.setItem("cart", JSON.stringify(cart));
        window.dispatchEvent(new Event("cartUpdated"));
        toast.success("Product added to cart");
    };

    const buyNow = (product) => {
        // Clear cart and add only this item, or just navigate with state
        navigate("/checkout", { state: { items: [{ ...product, quantity: 1 }] } });
    };

    const filtered = products.filter(p => {
        const matchSearch = p.name?.toLowerCase().includes(search.toLowerCase());
        const matchCat = !category || p.category === category;
        return matchSearch && matchCat;
    });

    if (loading) return <Loader />;

    return (
        <div className="animate-fadeIn p-4 md:p-8">
            <header className="bg-orange-500 text-white py-6 rounded-2xl shadow-md mb-8 flex justify-between items-center px-8">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <span className="text-3xl">🐾</span> Pet Product Marketplace
                </h1>
                <button
                    onClick={() => navigate("/cart")}
                    className="relative bg-white text-orange-600 px-5 py-2 rounded-full font-bold flex items-center gap-2 hover:bg-orange-50 transition shadow-lg"
                >
                    Cart 🛒
                </button>
            </header>

            {/* Filters */}
            <div className="flex gap-4 mb-8 flex-wrap items-center bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="relative flex-1 min-w-[300px]">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                    <input
                        value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search for dog food, toys, accessories..."
                        className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-orange-400 outline-none transition-all shadow-sm"
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-Scrollbar-none">
                    {["", "FOOD", "TOYS", "MEDICINES", "ACCESSORIES", "GROOMING"].map(cat => (
                        <button key={cat} onClick={() => setCategory(cat)}
                            className={`px-6 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${category === cat
                                ? "bg-orange-500 text-white shadow-md"
                                : "bg-white border border-gray-200 text-gray-600 hover:border-orange-400"
                                }`}>
                            {cat ? `${CAT_EMOJI[cat] || ""} ${cat}` : "All Products"}
                        </button>
                    ))}
                </div>
            </div>

            {filtered.length === 0 ? (
                <EmptyState icon="🛍️" message="No products found matching your search." />
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {filtered.map(p => (
                        <div key={p.id} className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group border-b-4 border-b-transparent hover:border-b-orange-500">
                            <div className="relative h-48 overflow-hidden bg-white p-4 flex items-center justify-center">
                                {p.imageUrl ? (
                                    <img src={p.imageUrl} alt={p.name} className="max-h-full object-contain transition-transform duration-500 group-hover:scale-110" />
                                ) : (
                                    <div className="w-full h-full bg-gray-50 flex items-center justify-center text-gray-400 text-xs font-bold uppercase text-center px-4">Image not available</div>
                                )}
                            </div>
                            <div className="p-5 flex flex-col items-center text-center flex-1">
                                <h3 className="font-bold text-gray-800 text-lg mb-1 group-hover:text-orange-500 transition-colors line-clamp-1">{p.name}</h3>
                                <p className="text-gray-500 text-xs mb-2 line-clamp-2">{p.description || "Premium quality product for your pet's wellness."}</p>
                                <p className="text-green-600 font-black text-xl mb-4">₹{p.price}</p>
                                <div className="mt-auto w-full space-y-2">
                                    <div className="flex gap-2">
                                        <button onClick={() => addToCart(p)} className="flex-1 bg-white border-2 border-orange-500 text-orange-600 hover:bg-orange-500 hover:text-white py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 shadow-sm active:scale-95">Add Cart 🛒</button>
                                        <button onClick={() => buyNow(p)} className="flex-1 bg-orange-500 text-white hover:bg-orange-600 py-2 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95">Buy Now ⚡</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
