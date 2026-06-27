import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
import farm from "@/assets/images/coffee-farm.jpg";
import { registerSchema } from "@/schemas/auth.schema";
import useAuth from "@/hooks/useAuth";
import FieldError from "@/components/ui/FieldError";

export default function RegisterPage() {
  const [serverError, setServerError] = useState("");
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: "buyer" },
  });

  const onSubmit = async (data) => {
    setServerError("");
    try {
      const { confirmPassword, ...payload } = data;
      await registerUser(payload);
      navigate("/login");
    } catch (err) {
      setServerError(
        err?.response?.data?.message ?? "Something went wrong. Try again.",
      );
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative flex items-center justify-center bg-background px-6 py-16 lg:order-2">
        <Link
          to="/"
          className="label-mono absolute left-6 top-6 inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={14} /> Return home
        </Link>
        <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-sm">
          <span className="label-mono text-[var(--color-accent)]">
            Get Started
          </span>
          <h1 className="mt-4 text-3xl font-extrabold">Create your account.</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Join the KapeKonek coffee community.
          </p>

          {serverError && (
            <div className="mt-6 border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-600">
              {serverError}
            </div>
          )}

          <div className="mt-10 space-y-5">
            <Field label="Full Name">
              <input
                placeholder="Your full name"
                aria-invalid={!!errors.fullname}
                className={`h-12 w-full border bg-background px-3 text-sm outline-none focus:border-foreground ${
                  errors.fullname ? "border-red-400" : "border-border"
                }`}
                {...register("fullname")}
              />
              <FieldError message={errors.fullname?.message} />
            </Field>

            <Field label="Email">
              <input
                type="email"
                placeholder="you@example.com"
                aria-invalid={!!errors.email}
                className={`h-12 w-full border bg-background px-3 text-sm outline-none focus:border-foreground ${
                  errors.email ? "border-red-400" : "border-border"
                }`}
                {...register("email")}
              />
              <FieldError message={errors.email?.message} />
            </Field>

            <Field label="Password">
              <input
                type="password"
                placeholder="••••••••"
                aria-invalid={!!errors.password}
                className={`h-12 w-full border bg-background px-3 text-sm outline-none focus:border-foreground ${
                  errors.password ? "border-red-400" : "border-border"
                }`}
                {...register("password")}
              />
              <FieldError message={errors.password?.message} />
            </Field>

            <Field label="Confirm Password">
              <input
                type="password"
                placeholder="••••••••"
                aria-invalid={!!errors.confirmPassword}
                className={`h-12 w-full border bg-background px-3 text-sm outline-none focus:border-foreground ${
                  errors.confirmPassword ? "border-red-400" : "border-border"
                }`}
                {...register("confirmPassword")}
              />
              <FieldError message={errors.confirmPassword?.message} />
            </Field>

            <Field label="Account Type">
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <div className="grid grid-cols-2 border border-border">
                    {["buyer", "farmer"].map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => field.onChange(r)}
                        className={`label-mono px-4 py-3 ${
                          field.value === r
                            ? "bg-foreground text-background"
                            : "bg-background text-foreground hover:bg-[var(--color-neutral-warm)]"
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                )}
              />
              <FieldError message={errors.role?.message} />
            </Field>

            <button
              type="submit"
              disabled={isSubmitting}
              className="label-mono mt-2 w-full bg-[var(--color-accent)] px-5 py-4 text-[var(--color-accent-foreground)] disabled:opacity-60"
            >
              {isSubmitting ? "Creating account..." : "Create Account"}
            </button>
            <Link
              to="/login"
              className="label-mono block w-full border border-foreground px-5 py-4 text-center text-foreground hover:bg-foreground hover:text-background"
            >
              Back to Login
            </Link>
          </div>
        </form>
      </div>
      <div className="hidden lg:order-1 lg:block">
        <img
          src={farm}
          alt="Coffee farm"
          className="h-full w-full object-cover grayscale"
        />
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="label-mono text-muted-foreground">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}
