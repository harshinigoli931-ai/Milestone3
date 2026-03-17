import { useState } from "react";
import api from "./api";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Registration Form, 2: OTP Verification
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // File state (kept for UI completeness, though backend doesn't support file upload in this endpoint yet)
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState("");

  // ... keep file validation logic ...
  const validateFile = (file) => { /* ... */ return ""; };
  const handleFileChange = (e) => { /* ... */ };
  const handleDrop = (e) => { /* ... */ };
  const removeFile = () => { setSelectedFile(null); setFileError(""); };

  const validate = () => {
    let newErrors = {};

    if (step === 1) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const mobileRegex = /^[6-9]\d{9}$/;
      // const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/; 
      const pincodeRegex = /^[0-9]{6}$/;

      if (!emailRegex.test(formData.email || "")) {
        newErrors.email = "Invalid email format";
      }

      if (!mobileRegex.test(formData.mobile || "")) {
        newErrors.mobile = "Enter valid 10-digit mobile number";
      }

      if (!formData.password || formData.password.length < 8) {
        newErrors.password = "Password must be at least 8 characters";
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }

      if (!pincodeRegex.test(formData.pincode || "")) {
        newErrors.pincode = "Enter valid 6-digit pincode";
      }
    } else {
      if (!formData.otp || formData.otp.length < 6) {
        newErrors.otp = "Enter valid 6-digit OTP";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);

    if (step === 1) {
      // Map frontend fields to backend DTO
      const type = formData.gender === "Male" ? "MALE" : formData.gender === "Female" ? "FEMALE" : "OTHER";

      const payload = {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.mobile,
        dateOfBirth: formData.dob,
        gender: type,
        street: formData.street,
        city: formData.city,
        state: formData.state,
        zipCode: formData.pincode,
        country: formData.country,
        companyName: formData.company,
        designation: formData.jobRole,
        yearsOfExperience: formData.experience ? parseInt(formData.experience) : 0
      };

      try {
        const response = await api.post("/auth/register", payload);
        if (response.data.success) {
          toast.success(response.data.message || "Registration Successful! OTP sent to your email.");
          setStep(2);
        }
      } catch (err) {
        console.error(err);
        const errorData = err.response?.data;
        if (errorData?.data && typeof errorData.data === 'object') {
          const validationErrors = Object.entries(errorData.data)
            .map(([field, msg]) => `${field}: ${msg}`)
            .join(", ");
          toast.error(validationErrors || "Validation Failed");
        } else {
          toast.error(errorData?.message || "Registration Failed");
        }
      } finally {
        setSubmitting(false);
      }
    } else {
      try {
        const response = await api.post("/auth/verify-otp", {
          email: formData.email,
          otpCode: formData.otp,
          purpose: "EMAIL_VERIFICATION"
        });

        if (response.data.success) {
          toast.success("Account verified successfully!");
          setStep(3);
        }
      } catch (err) {
        console.error(err);
        toast.error(err.response?.data?.message || "Invalid OTP");
      } finally {
        setSubmitting(false);
      }
    }
  };

  const inputStyle =
    "w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#F97316] focus:border-[#F97316] outline-none transition";

  return (
    <div className="min-h-screen bg-[#FFF6E9] py-10 px-6">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl">
        {/* HEADER */}
        <div className="bg-gradient-to-r from-[#F97316] to-[#EA580C] text-white p-6 text-center rounded-t-2xl">
          <h2 className="text-3xl font-bold">Pet Owner Registration</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-10">

          {step === 1 && (
            <>
              {/* PERSONAL DETAILS */}
              <Section title="Personal Details">
                <Input name="firstName" placeholder="First Name" style={inputStyle} handleChange={handleChange} />
                <Input name="lastName" placeholder="Last Name" style={inputStyle} handleChange={handleChange} />
                <Input name="email" placeholder="Email" style={inputStyle} handleChange={handleChange} error={errors.email} />
                <Input name="mobile" placeholder="Mobile Number" style={inputStyle} handleChange={handleChange} error={errors.mobile} />
                <Input name="password" type="password" placeholder="Password" style={inputStyle} handleChange={handleChange} error={errors.password} />
                <Input name="confirmPassword" type="password" placeholder="Re-enter Password" style={inputStyle} handleChange={handleChange} error={errors.confirmPassword} />
                <Input name="dob" type="date" style={inputStyle} handleChange={handleChange} />
                <select name="gender" className={inputStyle} onChange={handleChange}>
                  <option value="">Select Gender</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </Section>

              {/* WORK DETAILS */}
              <Section title="Work Details">
                <Input name="jobRole" placeholder="Job Role" style={inputStyle} handleChange={handleChange} />
                <Input name="company" placeholder="Company Name" style={inputStyle} handleChange={handleChange} />
                <Input name="experience" type="number" placeholder="Years of Experience" style={inputStyle} handleChange={handleChange} />
              </Section>

              {/* ADDRESS DETAILS */}
              <Section title="Address Details">
                <Input name="street" placeholder="Street Address" style={inputStyle} handleChange={handleChange} />
                <Input name="city" placeholder="City" style={inputStyle} handleChange={handleChange} />
                <Input name="state" placeholder="State" style={inputStyle} handleChange={handleChange} />
                <Input name="country" placeholder="Country" style={inputStyle} handleChange={handleChange} />
                <Input name="pincode" placeholder="Pincode" style={inputStyle} handleChange={handleChange} error={errors.pincode} />
              </Section>
            </>
          )}

          {step === 2 && (
            <Section title="OTP Verification">
              <div className="col-span-full">
                <p className="mb-4 text-gray-700">Please enter the 6-digit OTP sent to your email to verify your account.</p>
                <Input name="otp" placeholder="Enter 6-digit OTP" style={inputStyle} handleChange={handleChange} error={errors.otp} />
              </div>
            </Section>
          )}

          {step === 3 && (
            <div className="text-center space-y-6 py-10">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-200">
                <span className="text-4xl">✅</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-800">Registration Complete!</h3>
              <p className="text-gray-600 max-w-md mx-auto text-lg">
                Your account is verified.
                <span className="block mt-2 font-bold text-orange-600">Pending Admin Approval</span>
                You will be able to log in once your profile is approved by the workspace admins.
              </p>
              <button
                type="button"
                onClick={() => navigate("/")}
                className="bg-[#F97316] text-white px-10 py-3 rounded-full font-semibold hover:bg-[#EA580C] transition shadow-md"
              >
                Go to Home
              </button>
            </div>
          )}

          {/* SUBMIT BUTTON */}
          {step < 3 && (
            <div className="text-center pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="bg-[#F97316] text-white px-12 py-3 rounded-full font-semibold hover:bg-[#EA580C] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Processing..." : (step === 1 ? "Register" : "Verify OTP")}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="bg-[#FFFDF8] p-6 rounded-xl shadow-sm border border-orange-100">
      <h3 className="text-xl font-semibold text-[#F97316] mb-6">{title}</h3>
      <div className="grid md:grid-cols-2 gap-6">
        {children}
      </div>
    </div>
  );
}

function Input({ name, type = "text", placeholder, style, handleChange, error }) {
  return (
    <div>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        className={style}
        onChange={handleChange}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}
