import { useState } from "react";

export default function Register() {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const [selectedFile, setSelectedFile] = useState(null);
const [fileError, setFileError] = useState("");
const validateFile = (file) => {
  const allowedTypes = ["application/pdf", "image/jpeg", "image/jpg"];
  const maxSize = 2 * 1024 * 1024;

  if (!allowedTypes.includes(file.type)) {
    return "Only PDF and JPG files are allowed.";
  }

  if (file.size > maxSize) {
    return "File size must be less than 2MB.";
  }

  return "";
};

const handleFileChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const error = validateFile(file);

  if (error) {
    setFileError(error);
    setSelectedFile(null);
  } else {
    setFileError("");
    setSelectedFile(file);
  }
};

const handleDrop = (e) => {
  e.preventDefault();
  const file = e.dataTransfer.files[0];
  if (!file) return;

  const error = validateFile(file);

  if (error) {
    setFileError(error);
    setSelectedFile(null);
  } else {
    setFileError("");
    setSelectedFile(file);
  }
};

const removeFile = () => {
  setSelectedFile(null);
  setFileError("");
};


  const validate = () => {
    let newErrors = {};

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const mobileRegex = /^[6-9]\d{9}$/;
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
    const pincodeRegex = /^[0-9]{6}$/;

    if (!emailRegex.test(formData.email || "")) {
      newErrors.email = "Invalid email format";
    }

    if (!mobileRegex.test(formData.mobile || "")) {
      newErrors.mobile = "Enter valid 10-digit mobile number";
    }

    if (!passwordRegex.test(formData.password || "")) {
      newErrors.password =
        "Password must contain 8+ chars, uppercase, lowercase, number & special character";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!pincodeRegex.test(formData.pincode || "")) {
      newErrors.pincode = "Enter valid 6-digit pincode";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      alert("Registration Successful");
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

          {/* PERSONAL DETAILS */}
          <Section title="Personal Details">
            <Input name="firstName" placeholder="First Name" style={inputStyle} handleChange={handleChange}/>
            <Input name="lastName" placeholder="Last Name" style={inputStyle} handleChange={handleChange}/>
            <Input name="email" placeholder="Email" style={inputStyle} handleChange={handleChange} error={errors.email}/>
            <Input name="mobile" placeholder="Mobile Number" style={inputStyle} handleChange={handleChange} error={errors.mobile}/>
            <Input name="password" type="password" placeholder="Password" style={inputStyle} handleChange={handleChange} error={errors.password}/>
            <Input name="confirmPassword" type="password" placeholder="Re-enter Password" style={inputStyle} handleChange={handleChange} error={errors.confirmPassword}/>
            <Input name="dob" type="date" style={inputStyle} handleChange={handleChange}/>
            <select name="gender" className={inputStyle} onChange={handleChange}>
              <option value="">Select Gender</option>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </Section>

          {/* WORK DETAILS */}
          <Section title="Work Details">
            <Input name="jobRole" placeholder="Job Role" style={inputStyle} handleChange={handleChange}/>
            <Input name="company" placeholder="Company Name" style={inputStyle} handleChange={handleChange}/>
            <Input name="experience" type="number" placeholder="Years of Experience" style={inputStyle} handleChange={handleChange}/>
          </Section>

          {/* ADDRESS DETAILS */}
          <Section title="Address Details">
            <Input name="street" placeholder="Street Address" style={inputStyle} handleChange={handleChange}/>
            <Input name="city" placeholder="City" style={inputStyle} handleChange={handleChange}/>
            <Input name="state" placeholder="State" style={inputStyle} handleChange={handleChange}/>
            <Input name="country" placeholder="Country" style={inputStyle} handleChange={handleChange}/>
            <Input name="pincode" placeholder="Pincode" style={inputStyle} handleChange={handleChange} error={errors.pincode}/>
          </Section>

          {/* EDUCATIONAL DETAILS */}
          <Section title="Educational Details">
            <Input name="qualification" placeholder="Highest Qualification" style={inputStyle} handleChange={handleChange}/>
            <Input name="college" placeholder="College/University Name" style={inputStyle} handleChange={handleChange}/>
            <Input name="graduationYear" type="number" placeholder="Year of Graduation" style={inputStyle} handleChange={handleChange}/>
          </Section>
{/* ID PROOF */}
<Section title="ID Verification">

  {/* ID TYPE */}
  <select
    name="idType"
    className={inputStyle}
    onChange={handleChange}
  >
    <option value="">Select ID Proof</option>
    <option>Aadhaar Card</option>
    <option>PAN Card</option>
    <option>Passport</option>
    <option>Driving License</option>
  </select>

  {/* ID NUMBER */}
  <Input
    name="idNumber"
    placeholder="ID Number"
    style={inputStyle}
    handleChange={handleChange}
  />

  {/* FILE UPLOAD (FULL WIDTH) */}
  <div className="col-span-2">
    <label className="block font-semibold mb-2 text-[#F97316]">
      Upload ID Proof (PDF / JPG, Max 2MB)
    </label>

    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      className="border-2 border-dashed border-[#F97316] rounded-xl p-6 text-center bg-[#FFF7ED] hover:bg-[#FFEDD5] transition"
    >
      {!selectedFile ? (
        <>
          <p className="text-gray-600 mb-3">
            Drag & Drop file here
          </p>

          <p className="text-gray-400 text-sm mb-4">
            or
          </p>

          <input
            type="file"
            accept=".pdf,.jpg,.jpeg"
            onChange={handleFileChange}
            className="hidden"
            id="fileUpload"
          />

          <label
            htmlFor="fileUpload"
            className="bg-[#F97316] text-white px-6 py-2 rounded-lg cursor-pointer hover:bg-[#EA580C] transition"
          >
            Browse File
          </label>
        </>
      ) : (
        <div className="flex items-center justify-center gap-4">
          <span className="text-gray-700 text-sm truncate max-w-xs">
            {selectedFile.name}
          </span>

          <button
            type="button"
            onClick={removeFile}
            className="text-red-500 font-bold hover:text-red-700"
          >
            ✕
          </button>
        </div>
      )}
    </div>

    {fileError && (
      <p className="text-red-500 text-sm mt-2">
        {fileError}
      </p>
    )}
  </div>

</Section>


          {/* SUBMIT BUTTON */}
          <div className="text-center pt-4">
            <button
              type="submit"
              className="bg-[#F97316] text-white px-12 py-3 rounded-full font-semibold hover:bg-[#EA580C] transition"
            >
              Register
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

/* SECTION COMPONENT */
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

/* INPUT COMPONENT */
function Input({ name, type="text", placeholder, style, handleChange, error }) {
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
