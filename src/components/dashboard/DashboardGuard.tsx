"use client";

import { useState, useEffect, useCallback } from "react";
import { LoginScreen } from "@/components/auth/LoginScreen";

export interface DashboardUser {
  pubkey: string;
  name: string;
}

function getStoredUser(): DashboardUser | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem("seridian_user");
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }
  return null;
}

export function useDashboardAuth() {
  const [user, setUser] = useState<DashboardUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUser(getStoredUser());
    setLoading(false);
  }, []);

  const handleLogin = useCallback((pubkey: string, name: string) => {
    localStorage.setItem("seridian_user", JSON.stringify({ pubkey, name }));
    setUser({ pubkey, name });
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("seridian_user");
    setUser(null);
  }, []);

  return { user, loading, handleLogin, handleLogout };
}

export function DashboardGuard({ children }: { children: React.ReactNode }) {
  const { user, loading, handleLogin, handleLogout } = useDashboardAuth();

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-seridian-500 border-t-transparent" />
          <p className="text-xs text-slate-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div />
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500">
            {user.name}
          </span>
          <button
            onClick={handleLogout}
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
      {children}
    </div>
  );
}
