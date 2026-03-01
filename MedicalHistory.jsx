import { useState } from "react";

export default function MedicalHistory() {
  const emptyRecord = {
    petName: "",
    visitDate: "",
    doctorName: "",
    clinicName: "",
    symptoms: "",
    diagnosis: "",
    treatment: "",
    medication: "",
    followUpDate: "",
    prescriptionFile: null,
    fileError: "",
  };

  const [records, setRecords] = useState([emptyRecord]);

  // ---------------- FILE VALIDATION ----------------
  const validateFile = (file) => {
    const allowed = ["application/pdf", "image/jpeg", "image/jpg"];
    const maxSize = 2 * 1024 * 1024;

    if (!allowed.includes(file.type)) return "Only PDF/JPG files allowed";
    if (file.size > maxSize) return "File must be less than 2MB";

    return "";
  };

  // ---------------- UPDATE FIELDS ----------------
  const handleChange = (index, field, value) => {
    const updated = [...records];
    updated[index][field] = value;
    setRecords(updated);
  };

  // ---------------- FILE DROPPED ----------------
  const handleDrop = (e, index) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    updateFile(file, index);
  };

  // ---------------- FILE SELECTED ----------------
  const handleFileChange = (e, index) => {
    const file = e.target.files[0];
    updateFile(file, index);
  };

  // ---------------- FILE UPDATE LOGIC ----------------
  const updateFile = (file, index) => {
    if (!file) return;

    const error = validateFile(file);
    const updated = [...records];

    if (error) {
      updated[index].fileError = error;
      updated[index].prescriptionFile = null;
    } else {
      updated[index].fileError = "";
      updated[index].prescriptionFile = file;
    }

    setRecords(updated);
  };

  // ---------------- REMOVE FILE ----------------
  const removeFile = (index) => {
    const updated = [...records];
    updated[index].prescriptionFile = null;
    updated[index].fileError = "";
    setRecords(updated);
  };

  // ---------------- ADD NEW RECORD ----------------
  const addRecord = () => {
    setRecords([...records, { ...emptyRecord }]);
  };

  // ---------------- DELETE RECORD ----------------
  const removeRecord = (i) => {
    setRecords(records.filter((_, index) => index !== i));
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg max-w-4xl mx-auto mt-10">
      <h2 className="text-2xl font-bold text-orange-600 mb-4">
        Medical History Records
      </h2>

      {records.map((rec, index) => (
        <div
          key={index}
          className="border border-orange-200 bg-orange-50 p-5 rounded-xl mb-8"
        >
          <div className="flex justify-between mb-3">
            <h3 className="font-semibold text-lg">Record #{index + 1}</h3>

            {index > 0 && (
              <button
                onClick={() => removeRecord(index)}
                className="text-red-500 hover:text-red-700"
              >
                ✕ Remove
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* PET NAME */}
            <Input
              label="Pet Name"
              value={rec.petName}
              onChange={(e) =>
                handleChange(index, "petName", e.target.value)
              }
            />

            <Input
              label="Visit Date"
              type="date"
              value={rec.visitDate}
              onChange={(e) =>
                handleChange(index, "visitDate", e.target.value)
              }
            />

            <Input
              label="Doctor Name"
              value={rec.doctorName}
              onChange={(e) =>
                handleChange(index, "doctorName", e.target.value)
              }
            />

            <Input
              label="Clinic / Hospital"
              value={rec.clinicName}
              onChange={(e) =>
                handleChange(index, "clinicName", e.target.value)
              }
            />

            <Input
              label="Symptoms"
              value={rec.symptoms}
              onChange={(e) =>
                handleChange(index, "symptoms", e.target.value)
              }
            />

            <Input
              label="Diagnosis"
              value={rec.diagnosis}
              onChange={(e) =>
                handleChange(index, "diagnosis", e.target.value)
              }
            />

            <Input
              label="Treatment"
              value={rec.treatment}
              onChange={(e) =>
                handleChange(index, "treatment", e.target.value)
              }
            />

            <Input
              label="Medication"
              value={rec.medication}
              onChange={(e) =>
                handleChange(index, "medication", e.target.value)
              }
            />

            <Input
              label="Follow-up Date"
              type="date"
              value={rec.followUpDate}
              onChange={(e) =>
                handleChange(index, "followUpDate", e.target.value)
              }
            />
          </div>

          {/* FILE UPLOAD AREA */}
          <div className="mt-4">
            <label className="block font-semibold mb-2 text-orange-600">
              Upload Prescription (PDF / JPG, Max 2MB)
            </label>

            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, index)}
              className="border-2 border-dashed border-orange-400 rounded-xl p-6 text-center bg-orange-100 hover:bg-orange-200 transition"
            >
              {!rec.prescriptionFile ? (
                <>
                  <p className="text-gray-600 mb-2">
                    Drag & Drop file here
                  </p>
                  <p className="text-gray-400 text-sm mb-3">or</p>

                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg"
                    className="hidden"
                    id={`fileUpload-${index}`}
                    onChange={(e) => handleFileChange(e, index)}
                  />

                  <label
                    htmlFor={`fileUpload-${index}`}
                    className="bg-orange-500 text-white px-6 py-2 rounded-lg cursor-pointer hover:bg-orange-600 transition"
                  >
                    Browse File
                  </label>
                </>
              ) : (
                <div className="flex items-center justify-center gap-4">
                  <span className="text-gray-700 text-sm truncate max-w-xs">
                    {rec.prescriptionFile.name}
                  </span>
                  <button
                    onClick={() => removeFile(index)}
                    className="text-red-600 font-bold text-lg"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>

            {rec.fileError && (
              <p className="text-red-500 text-sm mt-2">{rec.fileError}</p>
            )}
          </div>
        </div>
      ))}

      {/* ADD NEW RECORD BUTTON */}
      <div className="text-center">
        <button
          onClick={addRecord}
          className="bg-orange-500 text-white px-8 py-3 rounded-full font-semibold hover:bg-orange-600"
        >
          + Add New Visit Record
        </button>
      </div>
    </div>
  );
}

/********** Reusable Input Component **********/
function Input({ label, type = "text", value, onChange }) {
  return (
    <div>
      <label className="block font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 outline-none"
      />
    </div>
  );
}