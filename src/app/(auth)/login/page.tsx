"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginFormData } from "@/../src/utils/validation";
import { auth, googleProvider } from "@/lib/firebase";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { apiService } from "@/lib/api";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, Chrome } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const { setUser } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  /**
   * SYNC HELPER (Production Web)
   */
  const syncLoginWithBackend = async (firebaseUser: any) => {
    const idToken = await firebaseUser.getIdToken();
    const res = await apiService.post("/auth/login", { idToken });
    
    // Force refresh to get custom claims (mongoId/roles)
    await firebaseUser.getIdToken(true);

    if (res.data?.user) {
      setUser(res.data.user);
      router.push("/"); // Redirect to home feed
    }
  };

  const onLoginSubmit = async (data: LoginFormData) => {
    setServerError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        data.email.toLowerCase().trim(),
        data.password
      );
      await syncLoginWithBackend(userCredential.user);
    } catch (error: any) {
      setServerError("Invalid email or password. Please try again.");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await syncLoginWithBackend(result.user);
    } catch (error) {
      setServerError("Google sign-in failed.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        
        {/* Header Section */}
        <div className="mb-10 text-center md:text-left">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-2xl text-white font-extrabold text-2xl mb-6 shadow-lg shadow-blue-200">
            S
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Welcome back</h1>
          <p className="text-gray-500 mt-2 font-medium">Continue to your account</p>
        </div>

        {serverError && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-medium animate-pulse">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onLoginSubmit)} className="space-y-5">
          {/* Email */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 ml-1">Email</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-blue-600">
                <Mail size={18} />
              </div>
              <input
                {...register("email")}
                type="email"
                placeholder="you@example.com"
                className={`block w-full pl-11 pr-4 py-3.5 bg-gray-50 border-2 rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-4 focus:ring-blue-50 focus:border-blue-600 outline-none transition-all duration-200 ${
                  errors.email ? "border-red-300" : "border-gray-100"
                }`}
              />
            </div>
            {errors.email && <p className="text-red-500 text-xs font-semibold ml-1">{errors.email.message}</p>}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 ml-1">Password</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-blue-600">
                <Lock size={18} />
              </div>
              <input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className={`block w-full pl-11 pr-12 py-3.5 bg-gray-50 border-2 rounded-xl text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-4 focus:ring-blue-50 focus:border-blue-600 outline-none transition-all duration-200 ${
                  errors.password ? "border-red-300" : "border-gray-100"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-blue-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs font-semibold ml-1">{errors.password.message}</p>}
          </div>

          <div className="flex justify-end">
            <Link href="/forgot-password" size={14} className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">
              Forgot password?
            </Link>
          </div>

          <button
            disabled={isSubmitting}
            type="submit"
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-100 transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : "Sign in"}
          </button>
        </form>

        <div className="relative my-10">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
          <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-4 text-gray-400 font-bold tracking-widest">or</span></div>
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full py-4 bg-white border-2 border-gray-100 hover:border-blue-100 hover:bg-blue-50/30 text-gray-700 font-bold rounded-xl transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
        >
          <Chrome size={20} className="text-blue-500" />
          Continue with Google
        </button>

        <p className="text-center mt-10 text-gray-500 font-medium">
          New here?{" "}
          <Link href="/register" className="text-blue-600 font-bold hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}