"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  IconChevronLeft,
  IconUserCircle,
  IconBrandGoogle,
  IconCheck,
} from "@tabler/icons-react";
import CheckoutOverlay from "@/components/cart/CheckoutOverlay";
import { AuthApiError, useAuth } from "@/components/auth/AuthContext";

type AuthMode = "login" | "register" | "verify";

interface AuthFormProps {
  open: boolean;
  onClose: () => void;
  initialMode?: Exclude<AuthMode, "verify">;
  onAuthenticated?: () => void;
  onBack?: () => void;
}

export default function AuthForm({
  open,
  onClose,
  initialMode = "login",
  onAuthenticated,
  onBack,
}: AuthFormProps) {
  const router = useRouter();
  const { login, register, verifyEmail, resendVerificationCode } = useAuth();
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [fullName, setFullName] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [pendingEmail, setPendingEmail] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isRegister = mode === "register";
  const isVerify = mode === "verify";

  const switchMode = (next: AuthMode) => {
    setMode(next);
    setError("");
    setNotice("");
  };

  const finishAuth = () => {
    onClose();
    if (onAuthenticated) {
      onAuthenticated();
    } else {
      router.push("/account?welcome=1");
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (isVerify) {
      const code = verificationCode.replace(/\D/g, "").slice(0, 6);
      if (code.length !== 6) {
        setError("Enter the 6-digit code sent to your email.");
        return;
      }

      setError("");
      setNotice("");
      setSubmitting(true);
      try {
        await verifyEmail(pendingEmail, code, password);
        finishAuth();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      } finally {
        setSubmitting(false);
      }
      return;
    }

    const value = identifier.trim().toLowerCase();
    if (isRegister && !fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!value) {
      setError(
        isRegister
          ? "Please enter your email."
          : "Please enter your email or phone.",
      );
      return;
    }
    if (isRegister && !value.includes("@")) {
      setError("Sign up requires an email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setError("");
    setNotice("");
    setSubmitting(true);
    try {
      if (isRegister) {
        const result = await register({
          fullName: fullName.trim(),
          email: value,
          password,
        });
        setPendingEmail(result.email);
        setVerificationCode("");
        setMode("verify");
      } else {
        try {
          await login(value, password);
          onClose();
          onAuthenticated?.();
        } catch (err) {
          if (err instanceof AuthApiError && err.code === "EMAIL_NOT_VERIFIED") {
            const email = err.email || value;
            await resendVerificationCode(email);
            setPendingEmail(email);
            setVerificationCode("");
            setMode("verify");
            setNotice("We sent you a new verification code.");
            return;
          }
          throw err;
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setNotice("");
    setSubmitting(true);
    try {
      await resendVerificationCode(pendingEmail);
      setNotice("We sent you a new code.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <CheckoutOverlay
      open={open}
      onClose={onClose}
      ariaLabel={isRegister ? "Register" : isVerify ? "Verify email" : "Sign in"}
      variant="drawer"
    >
      <div className="px-6 py-6">
        <div className="flex items-center gap-2">
          <button type="button" onClick={onBack ?? onClose} aria-label="Back">
            <IconChevronLeft size={28} />
          </button>
          <Image
            src="/images/teehub-logo.png"
            alt="TeeHub Logo"
            width={181}
            height={57}
            style={{ height: "40px", width: "auto" }}
          />
        </div>

        <div className="mt-6 mb-5 flex items-center gap-2">
          <IconUserCircle size={24} />
          <span className="text-lg font-semibold">
            {isVerify ? "Verify Your Email" : "Sign In/ Register To Continue"}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {isVerify ? (
            <>
              <p className="text-sm leading-6 text-gray-600">
                We sent a 6-digit code to{" "}
                <span className="font-semibold text-black">{pendingEmail}</span>.
              </p>
              <Field label="Verification Code*">
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={verificationCode}
                  onChange={(e) =>
                    setVerificationCode(
                      e.target.value.replace(/\D/g, "").slice(0, 6),
                    )
                  }
                  placeholder="Enter 6-digit code"
                  className={`${inputClass} text-center text-xl tracking-[6px]`}
                />
              </Field>
            </>
          ) : (
            <>
              {isRegister && (
                <Field label="Your Full Name">
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your Name"
                    className={inputClass}
                  />
                </Field>
              )}

              <Field label={isRegister ? "Email*" : "Email* / Phone Number*"}>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={isRegister ? "you@example.com" : "Email or phone"}
                  className={inputClass}
                />
              </Field>

              <Field label="Password*">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className={inputClass}
                />
              </Field>
            </>
          )}

          {error && <p className="px-2 text-xs text-red-500">{error}</p>}
          {notice && <p className="px-2 text-xs text-green-600">{notice}</p>}

          {!isVerify && (
            <div className="flex items-center justify-between px-1">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-600">
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded border ${
                    remember ? "border-[#F26522]" : "border-gray-400"
                  }`}
                  onClick={() => setRemember((v) => !v)}
                >
                  {remember && <IconCheck size={14} className="text-[#F26522]" />}
                </span>
                Remember me
              </label>
              <button
                type="button"
                className="text-sm font-medium text-blue-600 hover:underline"
              >
                Forgot password?
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 h-14 w-full rounded-[10px] bg-[#F26522] text-lg font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
          >
            {submitting
              ? "Please wait..."
              : isVerify
                ? "Verify Email"
                : isRegister
                  ? "Create Account"
                  : "Sign In"}
          </button>

          {isVerify && (
            <button
              type="button"
              onClick={handleResend}
              disabled={submitting}
              className="text-sm font-semibold text-[#F26522] hover:underline disabled:opacity-60"
            >
              Resend code
            </button>
          )}
        </form>

        {!isVerify && (
          <>
            <div className="my-6 flex items-center gap-3 text-gray-400">
              <span className="h-px flex-1 bg-gray-200" />
              <span className="text-xs">OR</span>
              <span className="h-px flex-1 bg-gray-200" />
            </div>

            <button
              type="button"
              className="flex h-12 w-full items-center justify-center gap-3 rounded-[10px] border border-gray-300 font-medium text-gray-700 transition hover:bg-gray-50"
            >
              <IconBrandGoogle size={20} />
              Continue with Google
            </button>
          </>
        )}

        <p className="mt-6 text-center text-sm text-gray-500">
          {isVerify ? (
            <>
              Wrong email?{" "}
              <button
                type="button"
                onClick={() => switchMode("register")}
                className="font-semibold text-[#F26522] hover:underline"
              >
                Start again
              </button>
            </>
          ) : isRegister ? (
            <>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => switchMode("login")}
                className="font-semibold text-[#F26522] hover:underline"
              >
                Sign in
              </button>
            </>
          ) : (
            <>
              Don&apos;t have an account?{" "}
              <button
                type="button"
                onClick={() => switchMode("register")}
                className="font-semibold text-[#F26522] hover:underline"
              >
                Register
              </button>
              <span className="mt-1 block text-xs text-gray-400">
                Register now to get Rs. 150 off + free shipping
              </span>
            </>
          )}
        </p>

        <p className="mt-5 text-center text-xs text-gray-400">
          By proceeding, I agree to TeeHub&apos;s{" "}
          <Link
            href="/policies/privacy-policy"
            onClick={onClose}
            className="underline hover:text-[#F26522]"
          >
            Privacy Policy
          </Link>{" "}
          and{" "}
          <Link
            href="/policies/terms-of-service"
            onClick={onClose}
            className="underline hover:text-[#F26522]"
          >
            T&amp;C
          </Link>
        </p>
      </div>
    </CheckoutOverlay>
  );
}

const inputClass =
  "h-14 w-full rounded-full border border-gray-300 bg-transparent px-5 outline-none transition-colors focus:border-[#F26522]";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="relative block">
      <span className="absolute -top-2 left-5 bg-white px-1 text-[11px] text-gray-500">
        {label}
      </span>
      {children}
    </label>
  );
}
