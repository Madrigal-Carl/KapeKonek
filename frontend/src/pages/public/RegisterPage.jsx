import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import farm from "@/assets/images/coffee-farm.jpg";
import { registerSchema } from "@/schemas/auth.schema";
import useAuth from "@/hooks/useAuth";
import FieldError from "@/components/ui/FieldError";

export function RegisterPage() {
  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
        <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-lg">
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

          <div className="mt-10 space-y-8">
            {/* Personal information section */}
            <SectionGroup title="Personal Information">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Last Name">
                  <input
                    placeholder="Dela Cruz"
                    aria-invalid={!!errors.lastName}
                    className={`h-12 w-full border bg-background px-3 text-sm outline-none focus:border-foreground ${
                      errors.lastName ? "border-red-400" : "border-border"
                    }`}
                    {...register("lastName")}
                  />
                  <FieldError message={errors.lastName?.message} />
                </Field>

                <Field label="First Name">
                  <input
                    placeholder="Juan"
                    aria-invalid={!!errors.firstName}
                    className={`h-12 w-full border bg-background px-3 text-sm outline-none focus:border-foreground ${
                      errors.firstName ? "border-red-400" : "border-border"
                    }`}
                    {...register("firstName")}
                  />
                  <FieldError message={errors.firstName?.message} />
                </Field>
              </div>

              <Field label="Middle Name (Optional)">
                <input
                  placeholder="Santos"
                  aria-invalid={!!errors.middleName}
                  className={`h-12 w-full border bg-background px-3 text-sm outline-none focus:border-foreground ${
                    errors.middleName ? "border-red-400" : "border-border"
                  }`}
                  {...register("middleName")}
                />
                <FieldError message={errors.middleName?.message} />
              </Field>

              <Field label="Contact Number">
                <input
                  type="tel"
                  placeholder="09XX XXX XXXX"
                  aria-invalid={!!errors.contactNumber}
                  className={`h-12 w-full border bg-background px-3 text-sm outline-none focus:border-foreground ${
                    errors.contactNumber ? "border-red-400" : "border-border"
                  }`}
                  {...register("contactNumber")}
                />
                <FieldError message={errors.contactNumber?.message} />
              </Field>

              <Field label="Address">
                <input
                  placeholder="Street, Barangay, City/Municipality, Province"
                  aria-invalid={!!errors.address}
                  className={`h-12 w-full border bg-background px-3 text-sm outline-none focus:border-foreground ${
                    errors.address ? "border-red-400" : "border-border"
                  }`}
                  {...register("address")}
                />
                <FieldError message={errors.address?.message} />
              </Field>
            </SectionGroup>

            {/* Account section */}
            <SectionGroup title="Account">
              <Field label="Username">
                <input
                  placeholder="juandelacruz"
                  aria-invalid={!!errors.username}
                  className={`h-12 w-full border bg-background px-3 text-sm outline-none focus:border-foreground ${
                    errors.username ? "border-red-400" : "border-border"
                  }`}
                  {...register("username")}
                />
                <FieldError message={errors.username?.message} />
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
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    aria-invalid={!!errors.password}
                    className={`h-12 w-full border bg-background px-3 pr-10 text-sm outline-none focus:border-foreground ${
                      errors.password ? "border-red-400" : "border-border"
                    }`}
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 grid h-8 w-8 place-items-center text-muted-foreground"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <FieldError message={errors.password?.message} />
              </Field>

              <Field label="Confirm Password">
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    aria-invalid={!!errors.confirmPassword}
                    className={`h-12 w-full border bg-background px-3 pr-10 text-sm outline-none focus:border-foreground ${
                      errors.confirmPassword
                        ? "border-red-400"
                        : "border-border"
                    }`}
                    {...register("confirmPassword")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((s) => !s)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 grid h-8 w-8 place-items-center text-muted-foreground"
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={16} />
                    ) : (
                      <Eye size={16} />
                    )}
                  </button>
                </div>
                <FieldError message={errors.confirmPassword?.message} />
              </Field>
            </SectionGroup>

            {/* Account type */}
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

function SectionGroup({ title, children }) {
  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <span className="label-mono shrink-0 text-muted-foreground">
          {title}
        </span>
        <div className="h-px flex-1 bg-border" />
      </div>
      <div className="space-y-5">{children}</div>
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
