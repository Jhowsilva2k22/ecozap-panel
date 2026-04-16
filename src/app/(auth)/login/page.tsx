"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Shield, Zap, MessageSquare } from "lucide-react";
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
    <div className="min-h-screen flex bg-[#060807]">
      {/* Left — Immersive branding */}
      <div className="hidden lg:flex lg:w-[50%] relative overflow-hidden flex-col justify-between p-14 text-white">
        {/* Background layers */}
        <div className="absolute inset-0 bg-[#060807]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#0f6b3a]/[0.07] blur-[120px]" />
        <div className="absolute top-1/4 right-0 w-[300px] h-[300px] rounded-full bg-[#0f6b3a]/[0.04] blur-[80px]" />
        <div className="absolute bottom-0 left-0 w-[200px] h-[200px] rounded-full bg-[#0f6b3a]/[0.03] blur-[60px]" />
        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-white/[0.06] border border-white/[0.06] flex items-center justify-center backdrop-blur-sm">
              <EcoZapIcon className="w-5 h-5" />
            </div>
            <span className="text-[17px] font-semibold tracking-tight">EcoZap</span>
          </div>
        </div>

        <div className="relative z-10 space-y-8">
          <div className="space-y-4">
            <h1 className="text-[52px] font-bold leading-[1.05] tracking-tight">
              Seu negocio no
              <br />
              <span className="text-[#2dd272]">WhatsApp.</span>
              <br />
              Automatizado.
            </h1>
            <p className="text-white/40 text-lg leading-relaxed max-w-[400px]">
              Atendimento inteligente que qualifica, converte e escala — sem perder o toque humano.
            </p>
          </div>

          {/* Trust signals */}
          <div className="flex items-center gap-6 pt-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/[0.06] flex items-center justify-center">
                <MessageSquare className="w-3.5 h-3.5 text-[#2dd272]/70" />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-white/80">24/7</p>
                <p className="text-[11px] text-white/30">Atendimento</p>
              </div>
            </div>
            <div className="w-px h-8 bg-white/[0.06]" />
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/[0.06] flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-[#2dd272]/70" />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-white/80">&lt;3s</p>
                <p className="text-[11px] text-white/30">Resposta</p>
              </div>
            </div>
            <div className="w-px h-8 bg-white/[0.06]" />
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/[0.06] flex items-center justify-center">
                <Shield className="w-3.5 h-3.5 text-[#2dd272]/70" />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-white/80">100%</p>
                <p className="text-[11px] text-white/30">Seu controle</p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-white/20 text-[13px]">&copy; {new Date().getFullYear()} EcoZap. Todos os direitos reservados.</p>
        </div>
      </div>

      {/* Right — Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-[#fafaf8] lg:rounded-l-[32px] lg:shadow-[-20px_0_60px_rgba(0,0,0,0.15)]">
        <div className="w-full max-w-[380px] space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-6">
            <div className="w-11 h-11 rounded-xl bg-[#060807] flex items-center justify-center">
              <EcoZapIcon className="w-5 h-5 text-[#2dd272]" />
            </div>
            <span className="text-lg font-semibold tracking-tight text-[#111113]">EcoZap</span>
          </div>

          <div className="space-y-1.5">
            <h2 className="text-[28px] font-bold tracking-tight text-[#111113]">Bem-vindo de volta</h2>
            <p className="text-zinc-400 text-[15px]">Entre no seu painel de controle</p>
          </div>

          {/* Google first */}
          <button
            onClick={handleGoogle}
            className="w-full h-12 border border-zinc-200/80 bg-white text-[14px] font-medium rounded-xl
              hover:bg-zinc-50/80 hover:border-zinc-300/60 active:scale-[0.98]
              transition-all duration-200
              flex items-center justify-center gap-3 text-zinc-700
              shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
          >
            <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continuar com Google
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-200/60" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-[#fafaf8] px-4 text-[11px] text-zinc-400 uppercase tracking-widest font-medium">ou com email</span>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[13px] font-medium text-zinc-500">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="w-full h-12 px-4 rounded-xl border border-zinc-200/70 bg-white text-[14px]
                  placeholder:text-zinc-300 outline-none
                  focus:border-[#2dd272]/40 focus:ring-2 focus:ring-[#2dd272]/10
                  transition-all duration-200
                  shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[13px] font-medium text-zinc-500">Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full h-12 px-4 rounded-xl border border-zinc-200/70 bg-white text-[14px]
                  placeholder:text-zinc-300 outline-none
                  focus:border-[#2dd272]/40 focus:ring-2 focus:ring-[#2dd272]/10
                  transition-all duration-200
                  shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
              />
            </div>

            {error && (
              <p className="text-[13px] text-red-600 bg-red-50/80 px-3.5 py-2.5 rounded-xl">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-[#111113] text-white text-[14px] font-semibold rounded-xl
                hover:bg-[#1a1a1d] active:scale-[0.98]
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-200
                flex items-center justify-center gap-2
                shadow-[0_2px_8px_rgba(0,0,0,0.12)]"
            >
              {loading ? "Entrando..." : "Entrar"}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>

          <p className="text-center text-[14px] text-zinc-400">
            Nao tem conta?{" "}
            <Link href="/signup" className="text-[#111113] font-semibold hover:underline">
              Comece gratis
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
