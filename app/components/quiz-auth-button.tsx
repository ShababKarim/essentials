"use client";

import { LogIn, LogOut } from "lucide-react";
import { signIn, signOut } from "next-auth/react";

import { Button } from "@/components/ui/button";

type QuizAuthButtonProps = {
  isAuthenticated: boolean;
  userName?: string | null;
};

export function QuizAuthButton({
  isAuthenticated,
  userName,
}: QuizAuthButtonProps) {
  const handleLogin = async () => {
    await signIn("google", { callbackUrl: "/quiz" });
  };

  const handleLogout = async () => {
    await fetch("/api/guest", {
      method: "POST",
    });

    await signOut({ callbackUrl: "/quiz" });
  };

  return (
    <div className="flex items-center gap-3">
      {isAuthenticated && userName ? (
        <p className="hidden text-sm font-semibold text-emerald-900/70 sm:block">
          {userName}
        </p>
      ) : null}
      <Button
        onClick={isAuthenticated ? handleLogout : handleLogin}
        variant="outline"
        className="gap-2 rounded-full border-amber-200 bg-white/80 text-emerald-950 hover:bg-amber-50"
      >
        {isAuthenticated ? (
          <>
            <LogOut className="h-4 w-4" />
            Log Out
          </>
        ) : (
          <>
            <LogIn className="h-4 w-4" />
            Log In
          </>
        )}
      </Button>
    </div>
  );
}
