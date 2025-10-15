"use client";

import { useState, useEffect } from "react";
import {
  auth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "@/firebase/config";
import { useRouter } from "next/navigation";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import type { User as FirebaseUser, ConfirmationResult } from "firebase/auth";
declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier;
    confirmationResult: ConfirmationResult; // ✅ no more 'any'
  }
}

interface User {
  uid: string;
  phone: string;
  name?: string;
  address?: string;
}

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");

const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
const [user, setUser] = useState<{ phone: string; name: string; address: string } | null>(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(30);

  const router = useRouter();

  useEffect(() => {
    if (step === 2 && timer > 0) {
      const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [step, timer]);

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(
        auth,
        "recaptcha-container",
        {
          size: "invisible",
        }
      );
    }
  };

  const sendOTP = async () => {
    if (!phone) return alert("Please enter phone number");
    setLoading(true);
    setupRecaptcha();

    try {
      const confirmationResult = await signInWithPhoneNumber(
        auth,
        "+" + phone,
        window.recaptchaVerifier
      );
      window.confirmationResult = confirmationResult;
      setStep(2);
      setTimer(30);
    } catch (err) {
      console.error(err);
      alert("Failed to send OTP");
    }
    setLoading(false);
  };

  const verifyOTP = async () => {
    if (!otp) return alert("Please enter OTP");
    setLoading(true);

    try {
    const result = await window.confirmationResult.confirm(otp);
setFirebaseUser(result.user); // ✅ correct type
setStep(3);

    } catch (err) {
      console.error(err);
      alert("Invalid OTP");
    }
    setLoading(false);
  };

  const saveUserDetails = async () => {
    if (!name || !address) return alert("Please enter name and address");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/saveUserDetails`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone: "+" + phone,
            name,
            address,
          }),
        }
      );

      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("user", JSON.stringify(data.user));
        setStep(4); // ✅ Show success screen
        setTimeout(() => router.push("/"), 2000); // Redirect after 2s
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to save user details");
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-50">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm text-center">
        {step !== 4 && (
          <h2 className="text-lg font-semibold text-center mb-6">
            Login with Phone
          </h2>
        )}

        {/* Step 1: Phone */}
        {step === 1 && (
          <>
            <PhoneInput
              country={"in"}
              value={phone}
              onChange={(phone) => setPhone(phone)}
              inputClass="w-full border rounded-lg px-4 py-2 mb-4"
              containerClass="mb-4"
              enableSearch
              countryCodeEditable={false}
            />
            <div id="recaptcha-container"></div>
            <button
              onClick={sendOTP}
              disabled={loading}
              className="w-full bg-orange-600 text-white py-2 rounded-lg"
            >
              {loading ? "Sending..." : "Next"}
            </button>
          </>
        )}

        {/* Step 2: OTP */}
        {step === 2 && (
          <>
            <p className="text-sm text-gray-500 mb-2">
              OTP sent to +{phone}. {timer}s remaining
            </p>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full border rounded-lg px-4 py-2 mb-4"
            />
            <button
              onClick={verifyOTP}
              disabled={loading || timer === 0}
              className="w-full bg-orange-600 text-white py-2 rounded-lg mb-2"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
            {timer === 0 && (
              <button
                onClick={sendOTP}
                className="w-full bg-gray-300 text-gray-700 py-2 rounded-lg"
              >
                Resend OTP
              </button>
            )}
          </>
        )}

        {/* Step 3: Name & Address */}
        {step === 3 && (
          <>
            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded-lg px-4 py-2 mb-4"
            />
            <textarea
              placeholder="Enter your address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full border rounded-lg px-4 py-2 mb-4"
            />
            <button
              onClick={saveUserDetails}
              className="w-full bg-orange-600 text-white py-2 rounded-lg"
            >
              Save & Continue
            </button>
          </>
        )}

        {/* ✅ Step 4: Success Tick */}
        {step === 4 && (
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="w-16 h-16 flex items-center justify-center rounded-full bg-green-100 animate-bounce">
              <svg
                className="w-10 h-10 text-green-600"
                fill="none"
                stroke="currentColor"
                strokeWidth={3}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-green-600">
              Logged in successfully!
            </h3>
            <p className="text-gray-500 text-sm">Redirecting to home...</p>
          </div>
        )}
      </div>
    </div>
  );
}
