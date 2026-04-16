"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { EcoZapIcon } from "@/components/ecozap-icon";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError("Email ou senha incorretos.");
      setLoading(false);
      return;
    }
    router.push("/dashboard");
  }

  async function handleGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
  }

  return (
    <div className="min-h-screen flex">
      {/* Left — Branding */}
      <div className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-[#0f6b3a] to-[#0a4d2a] flex-col justify-between p-12 text-white">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur">
            <EcoZapIcon className="w-6 h-6" />
          </div>
          <span className="text-xl font-semibold tracking-tight">EcoZap</span>
        </div>

        <div className="space-y-6">
          <h1 className="text-4xl font-bold leading-tight tracking-tight">
            Seu negocio no<br />
            WhatsApp. Automatizado.
          </h1>
          <p className="text-white/70 text-lg leading-relaxed max-w-md">
            Qualifique leads, atenda clientes e escale seu atendimento com inteligencia com aspecto natural — tudo pelo WhatsApp.
          </p>
        </div>

        <p className="text-white/40 text-sm">&copy; {new Date().getFullYear()} EcoZap</p>
      </div>

      {/* Right — Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-xl bg-[#0f6b3a] flex items-center justify-center">
              <EcoZapIcon className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-semibold tracking-tight">EcoZap</span>
          </div>

          <div>
            <h2 className="text-2xl font-bold tracking-tight">Entrar</h2>
            <p className="text-zinc-500 mt-1">Acesse seu painel de controle</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="w-full h-11 px-3.5 rounded-lg border border-zinc-200 bg-white text-sm
                  placeholder:text-zinc-400 outline-none
                  focus:border-[#0f6b3a] focus:ring-2 focus:ring-[#0f6b3a]/10
                  transition-all duration-200"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-700">Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full h-11 px-3.5 rounded-lg border border-zinc-200 bg-white text-sm
                  placeholder:text-zinc-400 outline-none
                  focus:border-[#0f6b3a] focus:ring-2 focus:ring-[#0f6b3a]/10
                  transition-all duration-200"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-[#0f6b3a] text-white text-sm font-medium rounded-lg
                hover:bg-[#0a4d2a] active:scale-[0.98]
                disabled:opacity-60 disabled:cursor-not-allowed
                transition-all duration-200
                flex items-center justify-center gap-2"
            >
              {loading ? "Entrando..." : "Entrar"}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-100" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-xs text-zinc-400 uppercase tracking-wider">ou</span>
            </div>
          </div>

          <button
            onClick={handleGoogle}
            className="w-full h-11 border border-zinc-200 text-sm font-medium rounded-lg
              hover:bg-zinc-50 active:scale-[0.98]
              transition-all duration-200
              flex items-center justify-center gap-2.5"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continuar com Google
          </button>

          <p className="text-center text-sm text-zinc-500">
            Nao tem conta?{" "}
            <Link href="/signup" className="text-[#0f6b3a] font-medium hover:underline">
              Criar agora
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
