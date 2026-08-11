"use client";

import { useState } from "react";
import { Button, Input, Label } from "@bytecats/ui-kit";

interface LoginScreenProps {
  onLogin: (pubkey: string, name: string) => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [pubkey, setPubkey] = useState("");
  const [name, setName] = useState("");

  function handleQuickLogin() {
    onLogin("admin", "Admin");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (pubkey.trim() && name.trim()) {
      onLogin(pubkey.trim(), name.trim());
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#070b14] p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white">Seridian Dashboard</h1>
          <p className="mt-2 text-sm text-slate-400">Sign in to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-400">Your ID</Label>
            <Input
              value={pubkey}
              onChange={(e) => setPubkey(e.target.value)}
              placeholder="e.g. admin"
              className="bg-white/5 border-white/10"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-slate-400">Display Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Admin"
              className="bg-white/5 border-white/10"
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-seridian-500 text-slate-950 hover:bg-seridian-400"
            disabled={!pubkey.trim() || !name.trim()}
          >
            Sign In
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-[#070b14] px-2 text-slate-500">or</span>
          </div>
        </div>

        <Button
          onClick={handleQuickLogin}
          variant="outline"
          className="w-full border-white/10 text-white hover:bg-white/5"
        >
          Quick Login as Admin
        </Button>

        <p className="text-center text-xs text-slate-600">
          Seed data: use &quot;admin&quot; / &quot;Admin&quot; or &quot;rod&quot; / &quot;Rod&quot;
        </p>
      </div>
    </div>
  );
}
