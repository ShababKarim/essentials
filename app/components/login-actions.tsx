"use client";

import { useState, useTransition } from "react";
import { ArrowRight, LogIn } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

export function LoginActions() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setError(null);
    await signIn("google", { callbackUrl: "/quiz" });
  };

  const handleSkip = () => {
    setError(null);
    startTransition(async () => {
      const response = await fetch("/api/guest", {
        method: "POST",
      });

      if (!response.ok) {
        setError("We could not continue as guest right now.");
        return;
      }

      router.push("/quiz");
      router.refresh();
    });
  };

  return (
    <div className="space-y-4">
      <Button
        onClick={handleGoogleSignIn}
        size="lg"
        className="w-full gap-2 rounded-full bg-emerald-900 text-amber-50 hover:bg-emerald-800"
      >
        <LogIn className="h-4 w-4" />
        Continue With Google
      </Button>
      <Button
        onClick={handleSkip}
        size="lg"
        variant="secondary"
        className="w-full gap-2 rounded-full"
        disabled={isPending}
      >
        Skip For Now
        <ArrowRight className="h-4 w-4" />
      </Button>
      {error ? <p className="text-sm font-semibold text-amber-700">{error}</p> : null}
    </div>
  );
}
