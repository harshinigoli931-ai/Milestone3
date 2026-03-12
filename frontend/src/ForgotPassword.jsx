import { useState } from "react";
import api from "./api";
import { Link, useNavigate } from "react-router-dom";

export default function ForgotPassword() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [form, setForm] = useState({
        email: "",
        otp: "",
        newPassword: ""
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const validateEmail = () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!form.email) {
            setErrors({ email: "Email is required" });
            return false;
        } else if (!emailRegex.test(form.email)) {
            setErrors({ email: "Enter a valid email address." });
            return false;
        }
        setErrors({});
        return true;
    };

    const validateReset = () => {
        let temp = {};
        if (!form.otp || form.otp.length < 6) {
            temp.otp = "Enter valid 6-digit OTP";
        }
        if (!form.newPassword || form.newPassword.length < 8) {
            temp.newPassword = "Password must be at least 8 characters";
        }
        setErrors(temp);
        return Object.keys(temp).length === 0;
    };

    const handleRequestOtp = async (e) => {
        e.preventDefault();
        if (!validateEmail()) return;

        setLoading(true);
        try {
            const response = await api.post(`/auth/forgot-password?email=${encodeURIComponent(form.email)}`);
            if (response.data.success) {
                alert("OTP sent! Please check your email.");
                setStep(2);
            }
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || "Failed to send OTP. Account may not exist.");
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (!validateReset()) return;

        setLoading(true);
        try {
            const response = await api.post("/auth/reset-password", {
                email: form.email,
                otpCode: form.otp,
                newPassword: form.newPassword
            });
            if (response.data.success) {
                alert("Password reset successfully! You can now log in.");
                navigate("/login");
            }
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || "Failed to reset password. OTP might be invalid or expired.");
        } finally {
            setLoading(false);
        }
    };

    const inputStyle =
        "w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F97316] focus:border-[#F97316] outline-none transition";

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#FFF6E9] p-6">
            <div className="bg-white shadow-xl rounded-2xl w-full max-w-md">
                {/* HEADER */}
                <div className="bg-gradient-to-r from-[#F97316] to-[#EA580C] text-white p-6 rounded-t-2xl text-center">
                    <h2 className="text-3xl font-bold">Reset Password</h2>
                </div>

                <div className="p-8 space-y-6">
                    {step === 1 && (
                        <form onSubmit={handleRequestOtp} className="space-y-6">
                            <p className="text-gray-600 text-sm">
                                Enter your registered email address to receive a 6-digit OTP to reset your password.
                            </p>
                            <div>
                                <label className="block font-medium mb-2 text-gray-700">Email Address</label>
                                <input
                                    type="email"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    className={inputStyle}
                                    placeholder="Enter your email"
                                    disabled={loading}
                                />
                                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full bg-[#F97316] hover:bg-[#EA580C] text-white py-3 rounded-full text-lg font-semibold transition shadow-md ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {loading ? "Sending..." : "Send OTP"}
                            </button>
                        </form>
                    )}

                    {step === 2 && (
                        <form onSubmit={handleResetPassword} className="space-y-6">
                            <p className="text-gray-600 text-sm">
                                An OTP has been sent to <strong>{form.email}</strong>
                            </p>
                            <div>
                                <label className="block font-medium mb-2 text-gray-700">Enter OTP</label>
                                <input
                                    type="text"
                                    value={form.otp}
                                    onChange={(e) => setForm({ ...form, otp: e.target.value })}
                                    className={inputStyle}
                                    placeholder="Enter 6-digit OTP"
                                    maxLength={6}
                                    disabled={loading}
                                />
                                {errors.otp && <p className="text-red-500 text-sm mt-1">{errors.otp}</p>}
                            </div>

                            <div>
                                <label className="block font-medium mb-2 text-gray-700">New Password</label>
                                <input
                                    type="password"
                                    value={form.newPassword}
                                    onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                                    className={inputStyle}
                                    placeholder="Enter new 8-character password"
                                    disabled={loading}
                                />
                                {errors.newPassword && <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>}
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full bg-[#F97316] hover:bg-[#EA580C] text-white py-3 rounded-full text-lg font-semibold transition shadow-md ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {loading ? "Resetting..." : "Reset Password"}
                            </button>
                        </form>
                    )}

                    {/* FOOTER LINK */}
                    <div className="pt-2 text-center text-sm text-gray-600">
                        Remember your password?
                        <Link
                            to="/login"
                            className="text-[#F97316] font-semibold ml-1 hover:underline"
                        >
                            Sign In
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
