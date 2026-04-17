import { useState } from "react";
import { useAdminLogin, getGetAdminMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Music2, Lock } from "lucide-react";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const login = useAdminLogin();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    login.mutate(
      { data: { username, password } },
      {
        onSuccess: (data) => {
          if (data.success) {
            queryClient.invalidateQueries({ queryKey: getGetAdminMeQueryKey() });
            setLocation("/admin");
          }
        },
        onError: (err: any) => {
          setError(err?.data?.error || "Invalid credentials");
        },
      }
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Music2 className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-2xl font-black">Admin Access</h1>
          <p className="text-muted-foreground text-sm mt-1">WAVSTREAM Control Panel</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-card border border-card-border rounded-2xl p-6 space-y-4">
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm px-3 py-2 rounded-lg">
              {error}
            </div>
          )}
          <div>
            <label className="text-sm font-medium text-muted-foreground block mb-1.5">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              className="w-full bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              data-testid="input-username"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground block mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="w-full bg-secondary border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              data-testid="input-password"
            />
          </div>
          <button
            type="submit"
            disabled={login.isPending || !username || !password}
            className="w-full bg-primary text-white py-2.5 rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            data-testid="button-login"
          >
            <Lock className="w-4 h-4" />
            {login.isPending ? "Signing in..." : "Sign In"}
          </button>
        </form>
        <p className="text-center text-xs text-muted-foreground mt-4">Default: admin / admin123</p>
      </div>
    </div>
  );
}
