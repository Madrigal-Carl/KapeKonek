import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { verifyEmail } from "@/services/auth.service";
import useAuth from "@/hooks/useAuth";

export function VerifyEmailPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { fetchCurrentUser } = useAuth();
  const [status, setStatus] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        await verifyEmail(token);
        if (cancelled) return;
        await fetchCurrentUser();
        setStatus("success");
      } catch (err) {
        if (cancelled) return;
        setErrorMessage(
          err?.response?.data?.message ??
            "This verification link is invalid or has expired.",
        );
        setStatus("error");
      }
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [token, fetchCurrentUser]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 py-16">
      <div className="w-full max-w-sm text-center">
        {status === "loading" && (
          <>
            <span className="label-mono text-[var(--color-accent)]">
              Account
            </span>
            <Loader2 className="mx-auto mt-6 h-10 w-10 animate-spin text-muted-foreground" />
            <h1 className="mt-6 text-3xl font-extrabold">
              Verifying your email.
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Hang tight, this won&apos;t take long.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <span className="label-mono text-[var(--color-accent)]">
              Account
            </span>
            <div className="mx-auto mt-6 grid h-16 w-16 place-items-center border border-[var(--color-accent)]">
              <CheckCircle2 size={28} className="text-[var(--color-accent)]" />
            </div>
            <h1 className="mt-6 text-3xl font-extrabold">
              Your email has been verified.
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              You&apos;re all set. Welcome to KapeKonek.
            </p>
            <button
              onClick={() => navigate("/")}
              className="label-mono mt-10 w-full bg-[var(--color-accent)] px-5 py-4 text-[var(--color-accent-foreground)]"
            >
              Continue to Home
            </button>
          </>
        )}

        {status === "error" && (
          <>
            <span className="label-mono text-red-500">Account</span>
            <div className="mx-auto mt-6 grid h-16 w-16 place-items-center border border-red-400">
              <XCircle size={28} className="text-red-500" />
            </div>
            <h1 className="mt-6 text-3xl font-extrabold">
              Verification failed.
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">{errorMessage}</p>
            <Link
              to="/login"
              className="label-mono mt-10 block w-full border border-foreground px-5 py-4 text-foreground hover:bg-foreground hover:text-background"
            >
              Back to Login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
