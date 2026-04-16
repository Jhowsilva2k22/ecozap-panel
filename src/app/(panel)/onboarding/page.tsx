"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { EcoZapIcon } from "@/components/ecozap-icon";
import {
  ArrowRight, ArrowLeft, Building2, User, MessageSquare,
  BookOpen, Smartphone, CheckCircle, Sparkles, Globe, Heart,
  ShieldCheck, Flame, Coffee, QrCode, RefreshCw, Loader2, Wifi, WifiOff
} from "lucide-react";

type Step = 1 | 2 | 3 | 4 | 5 | 6;

const TONES = [
  { id: "acolhedor e direto", label: "Acolhedor e Direto", icon: Heart, desc: "Próximo e objetivo" },
  { id: "profissional e formal", label: "Profissional", icon: ShieldCheck, desc: "Sério e confiável" },
  { id: "descontraído e amigável", label: "Descontraído", icon: Coffee, desc: "Leve e informal" },
  { id: "persuasivo e energético", label: "Energético", icon: Flame, desc: "Vendas e urgência" },
];

const BUSINESS_TYPES = [
  { value: "servicos", label: "Prestação de Serviços" },
  { value: "ecommerce", label: "E-commerce / Loja" },
  { value: "consultoria", label: "Consultoria" },
  { value: "saude", label: "Saúde e Bem-estar" },
  { value: "educacao", label: "Educação / Cursos" },
  { value: "alimentacao", label: "Alimentação" },
  { value: "imobiliaria", label: "Imobiliária" },
  { value: "tecnologia", label: "Tecnologia / SaaS" },
  { value: "outro", label: "Outro" },
];

function normalizeQrCode(qrCode: string): string {
  if (!qrCode) return "";
  
  // If it already has the data: prefix, return as is
  if (qrCode.startsWith("data:image")) {
    return qrCode;
  }
  
  // Otherwise, add the prefix
  return `data:image/png;base64,${qrCode}`;
}

export default function OnboardingPage() {
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const router = useRouter();
  const pollingInterval = useRef<NodeJS.Timeout | null>(null);

  // Form state
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");
  const [botName, setBotName] = useState("");
  const [botTone, setBotTone] = useState("acolhedor e direto");
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [links, setLinks] = useState("");
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [waConnected, setWaConnected] = useState(false);
  const [waVerifying, setWaVerifying] = useState(false);

  // Auto-polling for WhatsApp status
  useEffect(() => {
    if (step === 4 && qrCode && !waConnected) {
      const checkStatus = async () => {
        try {
          const res = await api.whatsappStatus();
          if (res.connected) {
            setWaConnected(true);
            if (pollingInterval.current) {
              clearInterval(pollingInterval.current);
            }
          }
        } catch {
          // Retry on next interval
        }
      };

      // Initial check
      checkStatus();

      // Setup polling every 5 seconds
      pollingInterval.current = setInterval(checkStatus, 5000);

      return () => {
        if (pollingInterval.current) {
          clearInterval(pollingInterval.current);
        }
      };
    }
  }, [step, qrCode, waConnected]);

  useEffect(() => {
    async function check() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }
      // Pre-fill from tenant if exists
      try {
        const res = await api.getTenant();
        if (res.tenant) {
          const t = res.tenant;
          if (t.business_name) setBusinessName(t.business_name);
          if (t.business_type) setBusinessType(t.business_type);
          if (t.owner_name) setOwnerName(t.owner_name);
          if (t.owner_phone) setOwnerPhone(t.owner_phone);
          if (t.bot_name && t.bot_name !== "Assistente") setBotName(t.bot_name);
          if (t.bot_tone) setBotTone(t.bot_tone);
          if (t.welcome_message) setWelcomeMessage(t.welcome_message);
          if (t.whatsapp_connected) {
            setWaConnected(true);
          }
        }
      } catch {
        // New tenant, no data yet
      }
      setChecking(false);
    }
    check();
  }, [router]);

  async function saveProfile() {
    setLoading(true);
    try {
      await api.updateProfile({
        business_name: businessName,
        business_type: businessType,
        owner_name: ownerName,
        owner_phone: ownerPhone,
        slug: businessName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
      });
      setStep(3);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Erro ao salvar perfil");
    }
    setLoading(false);
  }

  async function saveBot() {
    setLoading(true);
    try {
      await api.setupBot({
        bot_name: botName || "Assistente",
        bot_tone: botTone,
        welcome_message: welcomeMessage,
      });
      setStep(4);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Erro ao configurar bot");
    }
    setLoading(false);
  }

  async function generateQR() {
    setLoading(true);
    try {
      const res = await api.connectWhatsApp(ownerPhone);
      if (res.qr_code) {
        setQrCode(res.qr_code);
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Erro ao gerar QR Code");
    }
    setLoading(false);
  }

  async function manualCheckWAStatus() {
    setWaVerifying(true);
    try {
      const res = await api.whatsappStatus();
      if (res.connected) {
        setWaConnected(true);
      } else {
        alert("WhatsApp ainda não conectado. Escaneie o QR Code e tente novamente.");
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Erro ao verificar conexão");
    }
    setWaVerifying(false);
  }

  async function proceedFromWhatsApp() {
    if (!waConnected) {
      alert("WhatsApp deve estar conectado para continuar.");
      return;
    }
    setStep(5);
  }

  async function saveKnowledge() {
    setLoading(true);
    try {
      const linkList = links.split("\n").map(l => l.trim()).filter(Boolean);
      if (linkList.length > 0) {
        await api.addKnowledge(linkList);
      }
      setStep(6);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Erro ao processar links");
    }
    setLoading(false);
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-[#050506] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-6 h-6 text-[#2dd272] animate-spin" />
          <span className="text-white/50 text-sm">Carregando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050506]">
      {/* Top bar */}
      <div className="border-b border-white/[0.06]">
        <div className="max-w-lg mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <EcoZapIcon className="w-8 h-8" />
            <span className="font-semibold text-white tracking-tight">EcoZap</span>
          </div>
          <span className="text-xs text-white/30 font-medium">{step} de 6</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="max-w-lg mx-auto px-6 pt-4">
        <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#2dd272] to-[#0fa968] rounded-full transition-all duration-500 ease-out"
            style={{ width: `${(step / 6) * 100}%` }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-6 py-12">
        {/* STEP 1: Welcome */}
        {step === 1 && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2dd272]/20 to-[#0fa968]/20 backdrop-blur-xl border border-[#2dd272]/30 flex items-center justify-center mx-auto">
                <Sparkles className="w-8 h-8 text-[#2dd272]" />
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tight">Bem-vindo ao EcoZap</h1>
              <p className="text-white/50 text-base max-w-md mx-auto leading-relaxed">
                Vamos configurar seu assistente de WhatsApp AI em poucos minutos.
              </p>
            </div>

            <div className="glass-card rounded-2xl p-8 space-y-4 border border-white/[0.08]">
              <h3 className="font-semibold text-xs text-white/40 uppercase tracking-wider">O que vamos fazer</h3>
              <div className="space-y-3">
                {[
                  { icon: Building2, text: "Dados do seu negócio" },
                  { icon: MessageSquare, text: "Identidade do seu bot" },
                  { icon: Smartphone, text: "Conectar seu WhatsApp" },
                  { icon: BookOpen, text: "Alimentar base de conhecimento" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-4 h-4 text-[#2dd272]" />
                    </div>
                    <span className="text-white/70">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full h-12 bg-gradient-to-r from-[#2dd272] to-[#0fa968] text-white/95 font-semibold rounded-xl
                hover:shadow-lg hover:shadow-[#2dd272]/20 active:scale-[0.98]
                transition-all duration-200
                flex items-center justify-center gap-2"
            >
              Começar configuração <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 2: Business Profile */}
        {step === 2 && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Seu negócio</h1>
              <p className="text-white/50 mt-2">Essas informações ajudam o bot a entender o contexto.</p>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/70">Nome do negócio</label>
                <input
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Ex: Studio Maria Hair"
                  className="w-full h-11 px-3.5 rounded-lg bg-white/[0.05] border border-white/[0.08] text-white text-sm
                    placeholder:text-white/30 outline-none
                    focus:border-[#2dd272]/50 focus:ring-2 focus:ring-[#2dd272]/20
                    transition-all duration-200"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white/70">Tipo de negócio</label>
                <select
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-lg bg-white/[0.05] border border-white/[0.08] text-white text-sm
                    outline-none
                    focus:border-[#2dd272]/50 focus:ring-2 focus:ring-[#2dd272]/20
                    transition-all duration-200"
                >
                  <option value="" className="bg-[#050506] text-white">Selecione</option>
                  {BUSINESS_TYPES.map((type) => (
                    <option key={type.value} value={type.value} className="bg-[#050506] text-white">
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/70">Seu nome</label>
                  <input
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="Seu nome"
                    className="w-full h-11 px-3.5 rounded-lg bg-white/[0.05] border border-white/[0.08] text-white text-sm
                      placeholder:text-white/30 outline-none
                      focus:border-[#2dd272]/50 focus:ring-2 focus:ring-[#2dd272]/20
                      transition-all duration-200"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/70">WhatsApp</label>
                  <input
                    value={ownerPhone}
                    onChange={(e) => setOwnerPhone(e.target.value)}
                    placeholder="5511999998888"
                    className="w-full h-11 px-3.5 rounded-lg bg-white/[0.05] border border-white/[0.08] text-white text-sm
                      placeholder:text-white/30 outline-none
                      focus:border-[#2dd272]/50 focus:ring-2 focus:ring-[#2dd272]/20
                      transition-all duration-200"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setStep(1)}
                className="h-12 px-5 border border-white/[0.08] text-white/70 text-sm font-medium rounded-xl
                  hover:bg-white/[0.05] transition-all duration-200
                  flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Voltar
              </button>
              <button
                onClick={saveProfile}
                disabled={!businessName || !businessType || !ownerName || !ownerPhone || loading}
                className="flex-1 h-12 bg-gradient-to-r from-[#2dd272] to-[#0fa968] text-white/95 font-semibold rounded-xl
                  hover:shadow-lg hover:shadow-[#2dd272]/20 active:scale-[0.98]
                  disabled:opacity-40 disabled:cursor-not-allowed
                  transition-all duration-200
                  flex items-center justify-center gap-2"
              >
                {loading ? "Salvando..." : "Próximo"}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Bot Identity */}
        {step === 3 && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Identidade do bot</h1>
              <p className="text-white/50 mt-2">Como seu assistente vai se comunicar.</p>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/70">Nome do assistente</label>
                <input
                  value={botName}
                  onChange={(e) => setBotName(e.target.value)}
                  placeholder="Ex: Ana, Assistente, Lia..."
                  className="w-full h-11 px-3.5 rounded-lg bg-white/[0.05] border border-white/[0.08] text-white text-sm
                    placeholder:text-white/30 outline-none
                    focus:border-[#2dd272]/50 focus:ring-2 focus:ring-[#2dd272]/20
                    transition-all duration-200"
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-white/70">Tom de voz</label>
                <div className="grid grid-cols-2 gap-3">
                  {TONES.map((tone) => (
                    <button
                      key={tone.id}
                      onClick={() => setBotTone(tone.id)}
                      className={`p-4 rounded-xl border transition-all duration-200 text-left
                        ${botTone === tone.id
                          ? "border-[#2dd272]/50 bg-white/[0.05] ring-1 ring-[#2dd272]/20"
                          : "border-white/[0.08] hover:border-white/[0.12] hover:bg-white/[0.02]"
                        }`}
                    >
                      <tone.icon className={`w-5 h-5 mb-2 ${botTone === tone.id ? "text-[#2dd272]" : "text-white/40"}`} />
                      <div className="text-sm font-medium text-white">{tone.label}</div>
                      <div className="text-xs text-white/40 mt-0.5">{tone.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-white/70">Mensagem de boas-vindas</label>
                <textarea
                  value={welcomeMessage}
                  onChange={(e) => setWelcomeMessage(e.target.value)}
                  placeholder="Oi! Sou a Ana, assistente da Studio Maria. Como posso te ajudar hoje?"
                  rows={3}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-white/[0.05] border border-white/[0.08] text-white text-sm
                    placeholder:text-white/30 outline-none resize-none
                    focus:border-[#2dd272]/50 focus:ring-2 focus:ring-[#2dd272]/20
                    transition-all duration-200"
                />
                <p className="text-xs text-white/30">Primeira mensagem que o lead recebe ao entrar em contato.</p>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setStep(2)}
                className="h-12 px-5 border border-white/[0.08] text-white/70 text-sm font-medium rounded-xl
                  hover:bg-white/[0.05] transition-all duration-200
                  flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Voltar
              </button>
              <button
                onClick={saveBot}
                disabled={loading}
                className="flex-1 h-12 bg-gradient-to-r from-[#2dd272] to-[#0fa968] text-white/95 font-semibold rounded-xl
                  hover:shadow-lg hover:shadow-[#2dd272]/20 active:scale-[0.98]
                  disabled:opacity-40 disabled:cursor-not-allowed
                  transition-all duration-200
                  flex items-center justify-center gap-2"
              >
                {loading ? "Salvando..." : "Próximo"}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Connect WhatsApp */}
        {step === 4 && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Conectar WhatsApp</h1>
              <p className="text-white/50 mt-2">Vincule o número que o bot vai usar para atender.</p>
            </div>

            <div className="glass-card rounded-2xl p-6 space-y-4 border border-white/[0.08]">
              <div className="flex items-start gap-3">
                <Smartphone className="w-5 h-5 text-[#2dd272] mt-0.5 flex-shrink-0" />
                <div className="text-sm text-white/70 space-y-2">
                  <p className="font-medium text-white">Como funciona</p>
                  <p>Vamos criar uma conexão com o WhatsApp. Você vai escanear um QR code com o celular — igual ao WhatsApp Web.</p>
                  <p className="text-white/50">Use um número dedicado para o bot (não o seu pessoal).</p>
                </div>
              </div>
            </div>

            {!qrCode && (
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setStep(3)}
                  className="h-12 px-5 border border-white/[0.08] text-white/70 text-sm font-medium rounded-xl
                    hover:bg-white/[0.05] transition-all duration-200
                    flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" /> Voltar
                </button>
                <button
                  onClick={generateQR}
                  disabled={loading}
                  className="flex-1 h-12 bg-gradient-to-r from-[#2dd272] to-[#0fa968] text-white/95 font-semibold rounded-xl
                    hover:shadow-lg hover:shadow-[#2dd272]/20 active:scale-[0.98]
                    disabled:opacity-40 disabled:cursor-not-allowed
                    transition-all duration-200
                    flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Gerando QR...
                    </>
                  ) : (
                    <>
                      <QrCode className="w-4 h-4" /> Gerar QR Code
                    </>
                  )}
                </button>
              </div>
            )}

            {qrCode && !waConnected && (
              <div className="space-y-6">
                <div className="glass-card rounded-2xl p-6 text-center space-y-4 border border-white/[0.08]">
                  <p className="text-sm font-medium text-white/70">Escaneie o QR Code com seu WhatsApp</p>
                  <div className="inline-block p-4 bg-white/[0.05] rounded-xl border border-white/[0.08]">
                    <img src={normalizeQrCode(qrCode)} alt="QR Code" className="w-48 h-48" />
                  </div>
                  <div className="space-y-2 text-xs text-white/50">
                    <p>Abrindo WhatsApp no celular...</p>
                    <p>Câmera → Escanear código</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(3)}
                    className="h-12 px-5 border border-white/[0.08] text-white/70 text-sm font-medium rounded-xl
                      hover:bg-white/[0.05] transition-all duration-200
                      flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" /> Voltar
                  </button>
                  <button
                    onClick={manualCheckWAStatus}
                    disabled={waVerifying}
                    className="flex-1 h-12 border border-white/[0.08] text-white/70 text-sm font-medium rounded-xl
                      hover:bg-white/[0.05] transition-all duration-200
                      disabled:opacity-40
                      flex items-center justify-center gap-2"
                  >
                    {waVerifying ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Verificando...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4" /> Já escaneei
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {waConnected && (
              <div className="space-y-6">
                <div className="glass-card rounded-2xl p-4 flex items-center gap-3 border border-[#2dd272]/30 bg-[#2dd272]/10 animate-in fade-in">
                  <CheckCircle className="w-5 h-5 text-[#2dd272] flex-shrink-0" />
                  <span className="text-sm font-medium text-[#2dd272]">WhatsApp conectado com sucesso!</span>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(3)}
                    className="h-12 px-5 border border-white/[0.08] text-white/70 text-sm font-medium rounded-xl
                      hover:bg-white/[0.05] transition-all duration-200
                      flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" /> Voltar
                  </button>
                  <button
                    onClick={proceedFromWhatsApp}
                    className="flex-1 h-12 bg-gradient-to-r from-[#2dd272] to-[#0fa968] text-white/95 font-semibold rounded-xl
                      hover:shadow-lg hover:shadow-[#2dd272]/20 active:scale-[0.98]
                      transition-all duration-200
                      flex items-center justify-center gap-2"
                  >
                    Próximo <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 5: Knowledge Links */}
        {step === 5 && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Base de conhecimento</h1>
              <p className="text-white/50 mt-2">Ensine o bot sobre seu negócio (opcional).</p>
            </div>

            <div className="glass-card rounded-2xl p-4 flex items-center gap-3 border border-[#2dd272]/30 bg-[#2dd272]/10">
              <Wifi className="w-5 h-5 text-[#2dd272] flex-shrink-0" />
              <span className="text-sm font-medium text-[#2dd272]">WhatsApp conectado</span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-white/40" />
                <label className="text-sm font-medium text-white/70">Links do seu negócio</label>
              </div>
              <textarea
                value={links}
                onChange={(e) => setLinks(e.target.value)}
                placeholder={"https://seusite.com.br\nhttps://instagram.com/seuperfil\nhttps://youtube.com/seuvideo"}
                rows={5}
                className="w-full px-3.5 py-2.5 rounded-lg bg-white/[0.05] border border-white/[0.08] text-white text-sm
                  placeholder:text-white/30 outline-none resize-none font-mono
                  focus:border-[#2dd272]/50 focus:ring-2 focus:ring-[#2dd272]/20
                  transition-all duration-200"
              />
              <p className="text-xs text-white/30">
                Cole seus links (site, Instagram, YouTube). O bot vai aprender a partir deles. Um por linha.
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setStep(4)}
                className="h-12 px-5 border border-white/[0.08] text-white/70 text-sm font-medium rounded-xl
                  hover:bg-white/[0.05] transition-all duration-200
                  flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Voltar
              </button>
              <button
                onClick={saveKnowledge}
                disabled={loading}
                className="flex-1 h-12 bg-gradient-to-r from-[#2dd272] to-[#0fa968] text-white/95 font-semibold rounded-xl
                  hover:shadow-lg hover:shadow-[#2dd272]/20 active:scale-[0.98]
                  disabled:opacity-40 disabled:cursor-not-allowed
                  transition-all duration-200
                  flex items-center justify-center gap-2"
              >
                {loading ? "Processando..." : links.trim() ? "Enviar e finalizar" : "Pular e finalizar"}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}

        {/* STEP 6: Success */}
        {step === 6 && (
          <div className="space-y-8 animate-in fade-in duration-500 text-center">
            <div className="space-y-4">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#2dd272]/20 to-[#0fa968]/20 backdrop-blur-xl border border-[#2dd272]/30 flex items-center justify-center mx-auto">
                <CheckCircle className="w-10 h-10 text-[#2dd272]" />
              </div>
              <h1 className="text-3xl font-bold text-white tracking-tight">Tudo pronto!</h1>
              <p className="text-white/50 text-base max-w-md mx-auto leading-relaxed">
                Seu assistente está configurado e pronto para atender no WhatsApp.
              </p>
            </div>

            <div className="glass-card rounded-2xl p-6 text-left space-y-3 max-w-sm mx-auto border border-white/[0.08]">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/50">Negócio</span>
                <span className="font-medium text-white">{businessName}</span>
              </div>
              <div className="h-px bg-white/[0.06]" />
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/50">Bot</span>
                <span className="font-medium text-white">{botName || "Assistente"}</span>
              </div>
              <div className="h-px bg-white/[0.06]" />
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/50">Tom</span>
                <span className="font-medium text-white capitalize">{botTone}</span>
              </div>
              <div className="h-px bg-white/[0.06]" />
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/50">WhatsApp</span>
                <span className="font-medium text-[#2dd272]">Conectado</span>
              </div>
            </div>

            <button
              onClick={() => router.push("/dashboard")}
              className="h-12 px-8 bg-gradient-to-r from-[#2dd272] to-[#0fa968] text-white/95 font-semibold rounded-xl
                hover:shadow-lg hover:shadow-[#2dd272]/20 active:scale-[0.98]
                transition-all duration-200
                inline-flex items-center gap-2"
            >
              Ir para o painel <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
