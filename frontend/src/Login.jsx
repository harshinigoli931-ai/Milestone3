import { useState } from "react";
import api from "./api";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const validate = () => {
    let temp = {};

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!form.email) {
      temp.email = "Email is required";
    } else if (!emailRegex.test(form.email)) {
      temp.email = "Enter a valid email address.";
    }

    if (!form.password) {
      temp.password = "Password is required";
    }

    setErrors(temp);
    return Object.keys(temp).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const response = await api.post("/auth/login", {
        email: form.email,
        password: form.password
      });

      console.log("Login response:", response.data);

      const token = response?.data?.token;
      const role = response?.data?.role;

      if (!token) {
        toast.error("Login failed. No token received.");
        return;
      }

      // Normalize role (ROLE_ADMIN → ADMIN)
      const normalizedRole = role?.replace("ROLE_", "").toUpperCase();

      localStorage.setItem("token", token);
      localStorage.setItem("role", normalizedRole);

      toast.success("Login successful!");

      if (normalizedRole === "ADMIN") {
        navigate("/admin");
      } else if (normalizedRole === "PET_OWNER") {
        navigate("/dashboard");
      } else {
        navigate("/dashboard");
      }

    } catch (err) {
      toast.error(err.response?.data?.message || "Login Failed");
    }
  };

  const inputStyle =
    "w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F97316] focus:border-[#F97316] outline-none transition";

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFF6E9] p-6">
      <div className="bg-white shadow-xl rounded-2xl w-full max-w-md">

        <div className="bg-gradient-to-r from-[#F97316] to-[#EA580C] text-white p-6 rounded-t-2xl text-center">
          <h2 className="text-3xl font-bold">Sign In</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">

          <div>
            <label className="block font-medium mb-2 text-gray-700">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className={inputStyle}
              placeholder="Enter your email"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block font-medium mb-2 text-gray-700">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
                className={inputStyle}
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {showPassword ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.049m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  )}
                </svg>
              </button>
            </div>

            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}

            <div className="text-right mt-2">
              <Link
                to="/forgot-password"
                className="text-sm text-[#F97316] hover:underline"
              >
                Forgot Password?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#F97316] hover:bg-[#EA580C] text-white py-3 rounded-full text-lg font-semibold transition shadow-md"
          >
            Login
          </button>

        </form>

        <div className="pb-6 text-center text-sm text-gray-600">
          Don't have an account?
          <Link
            to="/register"
            className="text-[#F97316] font-semibold ml-1 hover:underline"
          >
            Register
          </Link>
        </div>

        <div className="pb-6 text-center text-sm">
          <Link to="/" className="text-gray-400 font-bold hover:underline flex items-center justify-center gap-1">
            ← Back to Home
          </Link>
        </div>

      </div>
    </div>
  );
}