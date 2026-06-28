import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import hero from "@/assets/images/hero-coffee.jpg";
import { loginSchema } from "@/schemas/auth.schema";
import useAuth from "@/hooks/useAuth";
import FieldError from "@/components/ui/FieldError";

export function LoginPage() {
  const [show, setShow] = useState(false);
  const [serverError, setServerError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    setServerError("");
    try {
      await login(data);
      navigate("/");
    } catch (err) {
      setServerError(
        err?.response?.data?.message ?? "Invalid email or password.",
      );
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden lg:block">
        <img
          src={hero}
          alt="Coffee cherries"
          className="h-full w-full object-cover grayscale"
        />
      </div>
      <div className="relative flex items-center justify-center bg-background px-6 py-16">
        <Link
          to="/"
          className="label-mono absolute left-6 top-6 inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={14} /> Return home
        </Link>
        <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-sm">
          <span className="label-mono text-[var(--color-accent)]">Account</span>
          <h1 className="mt-4 text-3xl font-extrabold">Welcome back.</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to continue to KapeKonek.
          </p>

          {serverError && (
            <div className="mt-6 border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-600">
              {serverError}
            </div>
          )}

          <div className="mt-10 space-y-5">
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
              <div className="relative">
                <input
                  type={show ? "text" : "password"}
                  placeholder="••••••••"
                  aria-invalid={!!errors.password}
                  className={`h-12 w-full border bg-background px-3 pr-10 text-sm outline-none focus:border-foreground ${
                    errors.password ? "border-red-400" : "border-border"
                  }`}
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShow((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 grid h-8 w-8 place-items-center text-muted-foreground"
                >
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <FieldError message={errors.password?.message} />
            </Field>

            <button
              type="submit"
              disabled={isSubmitting}
              className="label-mono mt-2 w-full bg-[var(--color-accent)] px-5 py-4 text-[var(--color-accent-foreground)] disabled:opacity-60"
            >
              {isSubmitting ? "Signing in..." : "Login"}
            </button>
            <Link
              to="/register"
              className="label-mono block w-full border border-foreground px-5 py-4 text-center text-foreground hover:bg-foreground hover:text-background"
            >
              Create Account
            </Link>
          </div>
        </form>
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
