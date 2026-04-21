import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
// Note: Using standard SVG for icons to ensure no extra dependency errors
const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const EyeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
  </svg>
);

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  
  // Visibility States
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const navigate = useNavigate();

  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:3000/api/auth/check-email", { email });
      if (res.data.success) { setStep(2); setError(""); }
    } catch (err) {
      setError(err.response?.data?.message || "Email not found");
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) return setError("Passwords do not match");
    try {
      const res = await axios.post("http://localhost:3000/api/auth/reset-password-direct", { email, password });
      if (res.data.success) { alert("Password updated successfully!"); navigate("/login"); }
    } catch (err) {
      setError(err.response?.data?.message || "Reset failed");
    }
  };

  const inputClass = "w-full border px-3 py-2 rounded focus:outline-teal-500 text-sm pr-10";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-sm bg-white p-6 sm:p-8 rounded shadow-xl border-t-4 border-teal-600">
        <h2 className="text-xl sm:text-2xl font-bold mb-6 text-center text-gray-800">
          {step === 1 ? "Verify Identity" : "Reset Password"}
        </h2>

        {error && <p className="text-red-500 text-sm mb-4 bg-red-50 p-2 rounded">{error}</p>}

        {step === 1 ? (
          <form onSubmit={handleVerifyEmail}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Registered Email</label>
              <input type="email" className={inputClass} placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <button className="w-full bg-teal-600 text-white py-2 rounded hover:bg-teal-700 transition-colors cursor-pointer font-semibold">
              Verify Email
            </button>
          </form>
        ) : (
          <form onSubmit={handleUpdatePassword}>
            <p className="text-sm text-gray-500 mb-4 text-center">Resetting for: <b>{email}</b></p>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">New Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  className={inputClass} 
                  placeholder="********" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                />
                <button 
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-teal-600 cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2">Confirm Password</label>
              <div className="relative">
                <input 
                  type={showConfirmPassword ? "text" : "password"} 
                  className={inputClass} 
                  placeholder="********" 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  required 
                />
                <button 
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-teal-600 cursor-pointer"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            <button className="w-full bg-teal-600 text-white py-2 rounded hover:bg-teal-700 transition-colors cursor-pointer font-semibold">
              Update Password
            </button>
          </form>
        )}

        <button onClick={() => navigate('/login')} className="w-full mt-4 text-sm text-teal-600 hover:underline cursor-pointer">
          Return to Login
        </button>
      </div>
    </div>
  );
};

export default ForgotPassword;