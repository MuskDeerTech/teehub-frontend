"use client";

import { useState, useEffect } from "react";
import {
  auth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "@/firebase/config";
import Image from "next/image";
import { useRouter } from "next/navigation";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
// import type { User as FirebaseUser, ConfirmationResult } from "firebase/auth";
import type { ConfirmationResult } from "firebase/auth";

declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier;
    confirmationResult: ConfirmationResult;
  }
}

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  // const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
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
      window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
      });
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

    // ✅ Firebase user
    const user = result.user;

    // ✅ Fetch Firebase ID token
    const token = await user.getIdToken();

    // ✅ Store token for login session
    localStorage.setItem("authToken", token);

    // setFirebaseUser(user);
    setStep(3);

    // ✅ After success message
    setTimeout(() => setStep(4), 2000);

  } catch (err) {
    console.error(err);
    alert("Invalid OTP");
  }
  setLoading(false);
};


  const saveUserDetails = async () => {
    if (!name || !address) return alert("Please enter name and address");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/saveUserDetails`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: "+" + phone,
          name,
          address,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("user", JSON.stringify(data.user));
        console.log("Details saved successfully!");
        router.push("/");
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to save user details");
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 bg-[#fff9f6]">
      {/* Header with Back Arrow - visible except step 3 (success) */}
      {step !== 3 && (
        <div className="flex items-center justify-between w-full max-w-xs mb-4">
          {step > 1 && step < 4 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="text-gray-600 hover:text-orange-500 transition pl-2"
            >
              <svg
                width="18"
                height="16"
                viewBox="0 0 18 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M4.51297 9.12526H16.755C18.415 9.12526 18.415 6.42786 16.755 6.42786H4.51297L8.73199 2.278C9.90778 1.03304 8.04035 -0.834392 6.79539 0.410565L0.363111 6.84284C-0.121038 7.32699 -0.121038 8.15696 0.363111 8.71028L6.79539 15.1426C8.04035 16.3875 9.90778 14.4509 8.73199 13.2751L4.51297 9.12526Z"
                  fill="#FF6633"
                />
              </svg>
            </button>
          ) : (
            <div />
          )}
          <h2 className="text-lg font-semibold text-[#f97316]">
            {step <= 2 ? "Sign Up" : "Welcome"}
          </h2>
          <div />
        </div>
      )}

      {/* Step 1 - Phone Input */}
      {step === 1 && (
        <div className="bg-white shadow-xl rounded-2xl w-full max-w-xs p-6 relative overflow-hidden text-left">
          <h3 className="font-medium text-gray-700 mb-4">Phone Number</h3>
          <PhoneInput
            country={"in"}
            value={phone}
            onChange={(phone) => setPhone(phone)}
            inputClass="!w-full !border !border-[#f97316]/30 !rounded-lg !focus:border-[#f97316]"
            containerClass="mb-4"
            enableSearch
            countryCodeEditable={false}
          />
          <div id="recaptcha-container"></div>
          <button
            onClick={sendOTP}
            disabled={loading}
            className="w-full bg-[#f97316] text-white font-medium py-2 rounded-md hover:bg-[#ea580c] transition"
          >
            {loading ? "Sending..." : "Get OTP"}
          </button>
          <p className="text-[12px] text-gray-400 mt-2">
            *No spam, no calls — just a quick OTP to verify you.
          </p>
        </div>
      )}

      {/* Step 2 - OTP Input */}
      {step === 2 && (
        <div className="bg-white shadow-xl rounded-2xl w-full max-w-xs p-6 text-center">
          <h3 className="font-medium text-gray-700 mb-4">Enter the 6-digit OTP</h3>
          <div className="text-[#f97316] font-medium mb-4">
            00:{timer.toString().padStart(2, "0")}
          </div>
          <div className="flex items-center justify-center gap-2 mb-4">
            {Array.from({ length: 6 }, (_, i) => (
              <input
                key={i}
                type="text"
                maxLength={1}
                value={otp[i] || ""}
                onChange={(e) => {
                  const newOtp = [...otp];
                  newOtp[i] = e.target.value.replace(/\D/g, "");
                  setOtp(newOtp.join(""));
                  if (e.target.value && i < 5) {
                    const nextInput = document.getElementById(`otp-${i + 1}`);
                    nextInput?.focus();
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Backspace" && !otp[i] && i > 0) {
                    const prevInput = document.getElementById(`otp-${i - 1}`);
                    prevInput?.focus();
                  }
                }}
                id={`otp-${i}`}
                className="w-8 h-8 text-center text-xl font-medium border border-[#f97316]/30 rounded-md focus:outline-none focus:border-[#f97316] bg-[#fff9f6]"
                autoFocus={i === 0}
                aria-label={""}
              />
            ))}
          </div>

          <button
            onClick={verifyOTP}
            disabled={loading || otp.length !== 6}
            className="w-full bg-[#f97316] text-white font-medium py-2 rounded-lg hover:bg-[#ea580c] transition disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? "Verifying..." : "Submit"}
          </button>

          <p className="text-sm text-gray-500 mt-2">
            Didn’t receive OTP?{" "}
            <button onClick={sendOTP} className="text-[#f97316] underline">
              Resend
            </button>
          </p>
        </div>
      )}

      {/* Step 3 - Success message */}
      {step === 3 && (
        <div className="flex flex-col items-center justify-center min-h-screen">
          <div className="w-48 h-48 bg-[#ff6633] rounded-full flex flex-col items-center justify-center shadow-lg border border-white/40">
            <p className="text-white text-center text-md font-medium mb-2">
              Signed Up <br /> Successfully!
            </p>
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth={3}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
      )}

      {/* Step 4 - Name & Address */}
      {step === 4 && (
        <div className="text-center bg-white shadow-xl rounded-2xl w-full max-w-xs p-6">
          <Image
            src="/teehub_logo.png"
            alt="TeeHub Logo"
            width={120}
            height={40}
            className="object-contain mx-auto"
          />
          <input
            type="text"
            placeholder="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-4 w-full border border-[#f97316]/30 rounded-lg px-3 py-2 mb-3 focus:outline-none focus:border-[#f97316]"
          />
          <textarea
            placeholder="Your Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full border border-[#f97316]/30 rounded-lg px-3 py-2 mb-3 focus:outline-none focus:border-[#f97316]"
          />
          <button
            onClick={saveUserDetails}
            className="w-full bg-[#f97316] text-white font-medium py-2 rounded-lg hover:bg-[#ea580c] transition"
          >
            Continue
          </button>
        </div>
      )}
    </div>
  );
}
