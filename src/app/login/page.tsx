"use client";
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation"; // ✅ for navigation

export default function OTPLoginPage() {
  const [tab, setTab] = useState<"email" | "phone">("email");
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter(); // ✅ initialize router

  const sendOTP = async () => {
    setError("");
    setLoading(true);
    try {
      // First check if user exists before sending OTP
      const checkRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/checkUser`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: tab === "email" ? email : "",
            phone: tab === "phone" ? phone : "",
          }),
        }
      );
      const checkData = await checkRes.json();
      if (!checkRes.ok) {
        setError(checkData.message || "User not found. Please register first.");
        return;
      }

      // Send OTP if user exists
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sendOTP`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: tab === "email" ? email : "",
          phone: tab === "phone" ? phone : "",
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        setError(err.message || "Failed to send OTP");
        return;
      }
      setStep(2);
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/verifyOTP`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: tab === "email" ? email : "",
          phone: tab === "phone" ? phone : "",
          otp,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        setError(err.message || "OTP verification failed");
        return;
      }

      alert("Login successful!");
      router.push("/"); // ✅ redirect to home
      // router.push("/") — redirect if needed
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <button
        onClick={() => router.back()}
        className="absolute top-6 left-6 text-gray-600 hover:text-gray-800 transition"
      >
        ← Back
      </button>
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-sm text-center">
        {/* Logo */}
        <Image
          src="/teehub_logo.png"
          alt="Logo"
          width={100}
          height={40}
          className="mx-auto mb-4"
        />

        <h2 className="text-xl font-bold mb-2 text-gray-800">
          Sign in to Teehub
        </h2>
        <p className="text-gray-500 mb-6 text-sm">
          Continue using your preferred method
        </p>

        {/* Tab buttons */}
        <div className="flex border-b mb-6">
          <button
            onClick={() => {
              setTab("email");
              setStep(1);
            }}
            className={`flex-1 py-2 text-sm font-medium border-b-2 ${
              tab === "email"
                ? "border-orange-600 text-orange-600"
                : "border-transparent text-gray-500 hover:text-orange-500"
            }`}
          >
            Email
          </button>
          <button
            onClick={() => {
              setTab("phone");
              setStep(1);
            }}
            className={`flex-1 py-2 text-sm font-medium border-b-2 ${
              tab === "phone"
                ? "border-orange-600 text-orange-600"
                : "border-transparent text-gray-500 hover:text-orange-500"
            }`}
          >
            Phone
          </button>
        </div>

        {error && <p className="text-red-600 mb-3 text-sm">{error}</p>}

        {/* Step 1: Send OTP */}
        {step === 1 && (
          <>
            {tab === "email" && (
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border rounded-lg px-4 py-2 mb-4 focus:ring-2 focus:ring-orange-400"
              />
            )}
            {tab === "phone" && (
              <input
                type="tel"
                placeholder="Enter your phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border rounded-lg px-4 py-2 mb-4 focus:ring-2 focus:ring-orange-400"
              />
            )}

            <button
              onClick={sendOTP}
              disabled={loading}
              className="w-full bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 transition disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </>
        )}

        {/* Step 2: Verify OTP */}
        {step === 2 && (
          <>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full border rounded-lg px-4 py-2 mb-4 focus:ring-2 focus:ring-orange-400"
            />
            <button
              onClick={verifyOTP}
              disabled={loading}
              className="w-full bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 transition disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>

            <p className="text-sm text-gray-500 mt-3">
              Didn’t get the OTP?{" "}
              <button
                onClick={sendOTP}
                disabled={loading}
                className="text-orange-600 font-medium hover:underline disabled:opacity-50"
              >
                Resend
              </button>
            </p>
          </>
        )}

        {/* Add this at the very end inside the card div, after Step 2 */}
        <p className="text-sm text-gray-500 mt-6">
          Don’t have an account?{" "}
          <button
            onClick={() => router.push("/register")}
            className="text-orange-600 font-medium hover:underline"
          >
            Create one
          </button>
        </p>
      </div>
    </div>
  );
}
