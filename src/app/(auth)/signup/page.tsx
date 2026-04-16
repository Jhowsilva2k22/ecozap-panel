"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, CheckCircle, Sparkles, Bot, Plug, Rocket } from "lucide-react";
import { EcoZapIcon } from "@/components/ecozap-icon";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!name.trim()) {
      setError("Informe seu nome.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("A senha precisa ter pelo menos 6 caracteres.");
      setLoading(false);
      return;
    }

    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name },
        },
      });

      if (signUpError) {
        if (signUpError.message === "User already registered") {
          setError("Email ja cadastrado.");
        } else if (signUpError.message.includes("Invalid API key") || signUpError.message.includes("fetch")) {
          setError("Erro de configuracao do servidor. Tente novamente em instantes.");
        } else if (signUpError.message.includes("rate") || signUpError.message.includes("limit")) {
          setError("Muitas tentativas. Aguarde alguns minutos.");
        } else {
          setError(signUpError.message);
        }
        setLoading(false);
        return;
      }

      setSuccess(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro inesperado";
      if (message.includes("Failed to fetch") || message.includes("NetworkError")) {
        setError("Sem conexao com o servidor. Verifique sua internet.");
      } else {
        setError("Erro ao criar conta: " + message);
      }
      setLoading(false);
    }
  }

  async function handleGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/onboarding` },
    });
  }

  if (success) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-[#050506] flex items-center justify-center p-8">
        <div className="absolute top-[30%] left-[40%] w-[500px] h-[500px] rounded-full bg-[#2dd272]/[0.06] blur-[130px]" />
        <div className="noise absolute inset-0" />
        <div className="relative z-10 text-center space-y-6 max-w-sm">
          <div className="w-16 h-16 rounded-2xl glass-card flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8 text-[#2dd272]" />
          </div>
          <h2 className="text-[28px] font-extrabold tracking-tight text-white">Conta criada!</h2>
          <p className="text-white/35 text-[15px] leading-relaxed">
            Enviamos um link de confirmacao para <strong className="text-white/70">{email}</strong>.
            Verifique sua caixa de entrada.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-[#2dd272] font-bold hover:text-[#2dd272]/80 transition-colors mt-4 text-[15px]"
          >
            Ir para o login <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  const steps = [
    { icon: Sparkles, label: "Crie sua conta", time: "30 segundos" },
    { icon: Bot, label: "Configure o bot", time: "Nome, tom, contexto" },
    { icon: Plug, label: "Conecte o WhatsApp", time: "Escaneie o QR" },
    { icon: Rocket, label: "Pronto", time: "Bot atendendo ao vivo" },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#050506]">
      {/* ── Mesh gradient background ── */}
      <div className="absolute inset-0">
        <div className="absolute top-[-10%] left-[-5%] w-[700px] h-[700px] rounded-full bg-[#2dd272]/[0.05] blur-[140px] glow-pulse" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[#6b21a8]/[0.04] blur-[120px]" />
        <div className="absolute top-[50%] right-[20%] w-[350px] h-[350px] rounded-full bg-[#0d9488]/[0.03] blur-[90px]" />
      </div>

      {/* ── Noise texture ── */}
      <div className="noise absolute inset-0" />

      {/* ── Grid ── */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      {/* ── Content ── */}
      <div className="relative z-10 min-h-screen flex flex-col lg:flex-row items-center justify-center gap-16 lg:gap-24 px-6 py-12 lg:px-20">

        {/* Left — Branding */}
        <div className="hidden lg:flex flex-col justify-center max-w-[440px] space-y-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl glass-card flex items-center justify-center">
              <EcoZapIcon className="w-5.5 h-5.5 text-[#2dd272]" />
            </div>
            <span className="text-[18px] font-bold tracking-tight text-white">EcoZap</span>
          </div>

          <div className="space-y-5">
            <h1 className="text-[52px] font-extrabold leading-[1.05] tracking-tight text-white">
              Comece em
              <br />
              <span className="bg-gradient-to-r from-[#2dd272] to-[#0d9488] bg-clip-text text-transparent">5 minutos.</span>
            </h1>
            <p className="text-white/35 text-[17px] leading-relaxed max-w-[380px]">
              Do zero ao primeiro atendimento automatizado — sem codigo, sem complicacao.
            </p>
          </div>

          {/* Visual steps */}
          <div className="space-y-3">
            {steps.map((step, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl glass-card flex items-center justify-center">
                    <step.icon className="w-4 h-4 text-[#2dd272]/60" />
                  </div>
                  {i < steps.length - 1 && (
                    <div className="absolute left-1/2 top-full w-px h-3 bg-white/[0.06] -translate-x-1/2" />
                  )}
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-white/70">{step.label}</p>
                  <p className="text-[11px] text-white/20">{step.time}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="text-white/15 text-[12px] pt-4">&copy; {new Date().getFullYear()} EcoZap. Todos os direitos reservados.</p>
        </div>

        {/* Right — Glass form card */}
        <div className="w-full max-w-[420px]">
          <div className="gradient-border rounded-[28px] p-px">
            <div className="glass-card rounded-[27px] p-8 lg:p-10 space-y-7">

              {/* Mobile logo */}
              <div className="lg:hidden flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl glass-card flex items-center justify-center">
                  <EcoZapIcon className="w-5 h-5 text-[#2dd272]" />
                </div>
                <span className="text-lg font-bold tracking-tight text-white">EcoZap</span>
              </div>

              <div className="space-y-1.5">
                <h2 className="text-[26px] font-extrabold tracking-tight text-white">Criar conta</h2>
                <p className="text-white/35 text-[14px]">7 dias gratis. Sem cartao.</p>
              </div>

              {/* Google */}
              <button
                onClick={handleGoogle}
                className="w-full h-12 glass-card rounded-xl text-[14px] font-semibold
                  hover:bg-white/[0.06] active:scale-[0.98]
                  transition-all duration-200
                  flex items-center justify-center gap-3 text-white/80"
              >
                <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Cadastrar com Google
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/[0.06]" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-transparent px-4 text-[10px] text-white/20 uppercase tracking-[0.2em] font-semibold backdrop-blur-sm">ou com email</span>
                </div>
              </div>

              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[12px] font-semibold text-white/30 uppercase tracking-wider">Seu nome</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome completo"
                    required
                    className="w-full h-12 px-4 rounded-xl bg-white/[0.05] border border-white/[0.08] text-[14px] text-white
                      placeholder:text-white/20 outline-none
                      focus:border-[#2dd272]/30 focus:bg-white/[0.07] focus:ring-1 focus:ring-[#2dd272]/10
                      transition-all duration-300"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[12px] font-semibold text-white/30 uppercase tracking-wider">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    required
                    className="w-full h-12 px-4 rounded-xl bg-white/[0.05] border border-white/[0.08] text-[14px] text-white
                      placeholder:text-white/20 outline-none
                      focus:border-[#2dd272]/30 focus:bg-white/[0.07] focus:ring-1 focus:ring-[#2dd272]/10
                      transition-all duration-300"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[12px] font-semibold text-white/30 uppercase tracking-wider">Senha</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimo 6 caracteres"
                    required
                    className="w-full h-12 px-4 rounded-xl bg-white/[0.05] border border-white/[0.08] text-[14px] text-white
                      placeholder:text-white/20 outline-none
                      focus:border-[#2dd272]/30 focus:bg-white/[0.07] focus:ring-1 focus:ring-[#2dd272]/10
                      transition-all duration-300"
                  />
                </div>

                {error && (
                  <p className="text-[13px] text-red-400 bg-red-500/10 border border-red-500/20 px-4 py-2.5 rounded-xl">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-gradient-to-r from-[#2dd272] to-[#0fa968] text-[#050506] text-[14px] font-bold rounded-xl
                    hover:brightness-110 active:scale-[0.98]
                    disabled:opacity-40 disabled:cursor-not-allowed
                    transition-all duration-200
                    flex items-center justify-center gap-2
                    shadow-[0_4px_20px_rgba(45,210,114,0.2)]"
                >
                  {loading ? "Criando..." : "Criar conta gratis"}
                  {!loading && <ArrowRight className="w-4 h-4" />}
                </button>
              </form>

              <p className="text-center text-[13px] text-white/30">
                Ja tem conta?{" "}
                <Link href="/login" className="text-[#2dd272] font-semibold hover:text-[#2dd272]/80 transition-colors">
                  Entrar
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
