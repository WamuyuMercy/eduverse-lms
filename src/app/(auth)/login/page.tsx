"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, BookOpen, Loader2, GraduationCap } from "lucide-react";
import { loginSchema, type LoginInput } from "@/lib/validations";
import { getRoleDashboard } from "@/lib/utils";

// Need to install @hookform/resolvers
// If not available, use manual validation instead

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn("credentials", {
        email: data.email.toLowerCase(),
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
        return;
      }

      if (result?.ok) {
        // Fetch session to get role for redirect
        const response = await fetch("/api/auth/session");
        const session = await response.json();
        if (session?.user?.role) {
          router.push(getRoleDashboard(session.user.role));
        } else {
          router.push("/");
        }
        router.refresh();
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-purple-gradient flex-col justify-between p-12 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <GraduationCap className="w-6 h-6" />
          </div>
          <span className="text-xl font-bold">EduVerse LMS</span>
        </div>

        <div>
          <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center mb-8">
            <BookOpen className="w-10 h-10" />
          </div>
          <h1 className="text-4xl font-bold mb-4 leading-tight">
            Kenya&apos;s Premier
            <br />
            Virtual Homeschool
          </h1>
          <p className="text-purple-200 text-lg leading-relaxed">
            Supporting IGCSE and CBC students with world-class virtual learning,
            interactive assignments, and live classes from anywhere.
          </p>

          <div className="mt-10 grid grid-cols-3 gap-6">
            {[
              { label: "Students", value: "500+" },
              { label: "Teachers", value: "30+" },
              { label: "Subjects", value: "15+" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold">{stat.value}</div>
                <div className="text-purple-200 text-sm mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          {["IGCSE", "CBC Kenya", "Live Classes", "AI-Powered"].map((tag) => (
            <span
              key={tag}
              className="px-3 py-1.5 bg-white/10 rounded-full text-sm"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">EduVerse LMS</span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Welcome back</h2>
            <p className="text-gray-500 mt-2">
              Sign in to your account to continue learning
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-600 font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="form-label">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                className={`form-input ${errors.email ? "border-red-400 focus:ring-red-400" : ""}`}
                {...register("email")}
                disabled={isLoading}
              />
              {errors.email && (
                <p className="form-error">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className={`form-input pr-11 ${errors.password ? "border-red-400 focus:ring-red-400" : ""}`}
                  {...register("password")}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="form-error">{errors.password.message}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-700 disabled:opacity-60
                         text-white font-semibold rounded-xl transition-all duration-200
                         focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
                         flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-6">
            &copy; {new Date().getFullYear()} EduVerse LMS. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
