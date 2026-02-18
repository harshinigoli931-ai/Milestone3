import { useState } from "react";

export default function Login() {
  const [form, setForm] = useState({
    email: "",
    password: ""
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    let temp = {};

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

    if (!emailRegex.test(form.email)) {
      temp.email = "Enter a valid email address.";
    }

    if (!passwordRegex.test(form.password)) {
      temp.password =
        "Password must contain 8+ characters, uppercase, lowercase, number & special character.";
    }

    setErrors(temp);
    return Object.keys(temp).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      alert("Login Successful!");
    }
  };

  const inputStyle =
    "w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F97316] focus:border-[#F97316] outline-none transition";

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFF6E9] p-6">
      <div className="bg-white shadow-xl rounded-2xl w-full max-w-md">

        {/* HEADER */}
        <div className="bg-gradient-to-r from-[#F97316] to-[#EA580C] text-white p-6 rounded-t-2xl text-center">
          <h2 className="text-3xl font-bold">Pet Owner Login</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">

          {/* EMAIL */}
          <div>
            <label className="block font-medium mb-2 text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
              className={inputStyle}
              placeholder="Enter your email"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">
                {errors.email}
              </p>
            )}
          </div>

          {/* PASSWORD */}
          <div>
            <label className="block font-medium mb-2 text-gray-700">
              Password
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
              className={inputStyle}
              placeholder="Enter your password"
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">
                {errors.password}
              </p>
            )}
          </div>

          {/* BUTTON */}
          <button
            type="submit"
            className="w-full bg-[#F97316] hover:bg-[#EA580C] text-white py-3 rounded-full text-lg font-semibold transition shadow-md"
          >
            Login
          </button>

        </form>

        {/* FOOTER LINK */}
        <div className="pb-6 text-center text-sm text-gray-600">
          Don't have an account?
          <a
            href="/register"
            className="text-[#F97316] font-semibold ml-1 hover:underline"
          >
            Register
          </a>
        </div>

      </div>
    </div>
  );
}
