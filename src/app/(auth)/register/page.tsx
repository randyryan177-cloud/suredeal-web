"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, RegisterFormData } from "@/../src/utils/validation";
import { auth, googleProvider } from "@/lib/firebase";
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { apiService } from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { User, Mail, Lock, Phone, Eye, EyeOff, Chrome, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
  const [showPass, setShowPass] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const { setUser } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const syncWithBackend = async (firebaseUser: any, fullName?: string, phoneNumber?: string) => {
    const idToken = await firebaseUser.getIdToken();
    
    const res = await apiService.post("auth/register", {
      idToken,
      roles: ["USER"],
      displayName: fullName || firebaseUser.displayName || null,
      profilePhoto: firebaseUser.photoURL || null,
      phoneNumber: phoneNumber || null,
    });

    // Refresh token to pull in the new 'mongoId' claim from the backend
    await firebaseUser.getIdToken(true);

    if (res.data?.user) {
      setUser(res.data.user);
      router.push("/");
    }
  };

  const onSubmit = async (data: RegisterFormData) => {
    setServerError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email.toLowerCase().trim(),
        data.password
      );
      await syncWithBackend(userCredential.user, data.fullName, data.phoneNumber);
    } catch (error: any) {
      if (error.code === "auth/email-already-in-use") {
        setServerError("That email is already registered.");
      } else {
        setServerError(error.response?.data?.message || "Registration failed. Please try again.");
      }
    }
  };

  const handleGoogleSignup = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await syncWithBackend(result.user);
    } catch (error) {
      setServerError("Google sign-up failed.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
        
        <Link href="/login" className="inline-flex items-center text-gray-400 hover:text-gray-600 mb-6 transition-colors">
          <ArrowLeft size={20} className="mr-2" />
          <span className="text-sm font-bold">Back to login</span>
        </Link>

        <div className="mb-8">
          <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center text-white font-black text-2xl mb-4 shadow-lg shadow-green-100">
            S
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 leading-tight">Create account</h1>
          <p className="text-gray-500 font-medium">Get started in seconds</p>
        </div>

        {serverError && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm font-bold rounded-xl border-l-4 border-red-500">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Full Name */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider ml-1">Full Name</label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-500" size={18} />
              <input
                {...register("fullName")}
                placeholder="John Doe"
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-gray-50 rounded-xl focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-50 outline-none transition-all"
              />
            </div>
            {errors.fullName && <p className="text-red-500 text-xs font-bold mt-1">{errors.fullName.message}</p>}
          </div>

          {/* Phone */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider ml-1">Phone Number</label>
            <div className="relative group">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-500" size={18} />
              <input
                {...register("phoneNumber")}
                placeholder="+254..."
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-gray-50 rounded-xl focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-50 outline-none transition-all"
              />
            </div>
            {errors.phoneNumber && <p className="text-red-500 text-xs font-bold mt-1">{errors.phoneNumber.message}</p>}
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider ml-1">Email</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-500" size={18} />
              <input
                {...register("email")}
                type="email"
                placeholder="you@example.com"
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-gray-50 rounded-xl focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-50 outline-none transition-all"
              />
            </div>
            {errors.email && <p className="text-red-500 text-xs font-bold mt-1">{errors.email.message}</p>}
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider ml-1">Password</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-500" size={18} />
              <input
                {...register("password")}
                type={showPass ? "text" : "password"}
                placeholder="••••••••"
                className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border-2 border-gray-50 rounded-xl focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-50 outline-none transition-all"
              />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-600">
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs font-bold mt-1">{errors.password.message}</p>}
          </div>

          {/* Confirm Password */}
<div className="space-y-1">
  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider ml-1">
    Confirm Password
  </label>
  <div className="relative group">
    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-500" size={18} />
    <input
      {...register("confirmPassword")}
      type={showPass ? "text" : "password"} 
      placeholder="••••••••"
      className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border-2 border-gray-50 rounded-xl focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-50 outline-none transition-all"
    />
  </div>
  {errors.confirmPassword && (
    <p className="text-red-500 text-xs font-bold mt-1">
      {errors.confirmPassword.message}
    </p>
  )}
</div>

          <button
            disabled={isSubmitting}
            type="submit"
            className="w-full py-4 bg-green-500 hover:bg-green-600 text-white font-black rounded-xl shadow-lg shadow-green-100 transition-all active:scale-[0.98] disabled:opacity-70 mt-4 flex items-center justify-center"
          >
            {isSubmitting ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" /> : "Create account"}
          </button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
          <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-4 text-gray-400 font-bold tracking-widest">or</span></div>
        </div>

        <button
          onClick={handleGoogleSignup}
          className="w-full py-4 bg-white border-2 border-gray-100 hover:bg-gray-50 text-gray-700 font-bold rounded-xl transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
        >
          <Chrome size={20} className="text-blue-500" />
          Sign up with Google
        </button>

        <p className="text-center mt-8 text-gray-500 font-medium">
          Already have an account?{" "}
          <Link href="/login" className="text-green-600 font-bold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}