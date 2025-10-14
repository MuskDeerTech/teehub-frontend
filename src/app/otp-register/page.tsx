"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function OTPRegister() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const sendOTP = async () => {
    setError("");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sendOTP`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const err = await res.json();
        setError(err.message || "Failed to send OTP");
        return;
      }
      setStep(2); // move to OTP verification step
    } catch (err) {
      setError("Something went wrong");
    }
  };

  const verifyOTP = async () => {
    setError("");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/verifyOTP`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, name, password }),
      });
      if (!res.ok) {
        const err = await res.json();
        setError(err.message || "OTP verification failed");
        return;
      }
      router.push("/login"); // redirect after success
    } catch (err) {
      setError("Something went wrong");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-4 text-center">Sign Up with OTP</h2>
        {error && <p className="text-red-600 mb-2">{error}</p>}

        {step === 1 && (
          <>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border px-4 py-2 rounded mb-4"
            />
            <button
              onClick={sendOTP}
              className="w-full bg-orange-600 text-white py-2 rounded hover:bg-orange-700"
            >
              Send OTP
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border px-4 py-2 rounded mb-2"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border px-4 py-2 rounded mb-2"
            />
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full border px-4 py-2 rounded mb-4"
            />
            <button
              onClick={verifyOTP}
              className="w-full bg-orange-600 text-white py-2 rounded hover:bg-orange-700"
            >
              Verify & Register
            </button>
          </>
        )}
      </div>
    </div>
  );
}
