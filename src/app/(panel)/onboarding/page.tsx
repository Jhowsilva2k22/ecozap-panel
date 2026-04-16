"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { EcoZapIcon } from "@/components/ecozap-icon";
import {
  ArrowRight, ArrowLeft, Building2, MessageSquare,
  BookOpen, Smartphone, CheckCircle, Sparkles, Globe, Heart,
  ShieldCheck, Flame, Coffee, QrCode, RefreshCw, Loader2, Wifi,
  Bot, Zap, Clock, MapPin, AtSign, Brain, Target,
  HelpCircle, DollarSign, CalendarClock, Users, Megaphone,
  GraduationCap, Smile, Briefcase, Stethoscope, ShoppingBag,
  UtensilsCrossed, Home, Car, Scissors, PawPrint, Dumbbell,
  Scale, Wrench, Camera, Palette, Music, Plane
} from "lucide-react";

type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7;

const BUSINESS_TYPES = [
  { value: "beleza", label: "Beleza e Estetica", icon: Scissors },
  { value: "saude", label: "Saude e Bem-estar", icon: Stethoscope },
  { value: "odontologia", label: "Odontologia", icon: Smile },
  { value: "advocacia", label: "Advocacia / Juridico", icon: Scale },
  { value: "ecommerce", label: "E-commerce / Loja", icon: ShoppingBag },
  { value: "alimentacao", label: "Alimentacao / Restaurante", icon: UtensilsCrossed },
  { value: "imobiliaria", label: "Imobiliaria", icon: Home },
  { value: "automotivo", label: "Automotivo", icon: Car },
  { value: "pet", label: "Pet Shop / Veterinario", icon: PawPrint },
  { value: "academia", label: "Academia / Personal", icon: Dumbbell },
  { value: "educacao", label: "Educacao / Cursos", icon: GraduationCap },
  { value: "tecnologia", label: "Tecnologia / SaaS", icon: Zap },
  { value: "consultoria", label: "Consultoria", icon: Briefcase },
  { value: "servicos", label: "Prestacao de Servicos", icon: Wrench },
  { value: "moda", label: "Moda / Confeccao", icon: Palette },
  { value: "fotografia", label: "Fotografia / Video", icon: Camera },
  { value: "musica", label: "Musica / Entretenimento", icon: Music },
  { value: "turismo", label: "Turismo / Viagens", icon: Plane },
  { value: "marketing", label: "Marketing / Publicidade", icon: Megaphone },
  { value: "outro", label: "Outro", icon: Building2 },
];

const TONES = [
  { id: "acolhedor e direto", label: "Acolhedor", icon: Heart, desc: "Proximo, caloroso e objetivo" },
  { id: "profissional e formal", label: "Profissional", icon: ShieldCheck, desc: "Serio, confiavel e tecnico" },
  { id: "descontraido e amigavel", label: "Descontraido", icon: Coffee, desc: "Leve, informal e amigavel" },
  { id: "persuasivo e energetico", label: "Energetico", icon: Flame, desc: "Vendas, urgencia e acao" },
  { id: "consultivo e estrategico", label: "Consultivo", icon: Brain, desc: "Analisa, orienta e guia" },
  { id: "empatico e sensivel", label: "Empatico", icon: Smile, desc: "Escuta ativa e acolhimento" },
  { id: "coach e motivador", label: "Coach", icon: Target, desc: "Motiva, desafia e transforma" },
  { id: "humoristico e criativo", label: "Humoristico", icon: Sparkles, desc: "Criativo, leve e memoravel" },
];

const QUALIFICATION_TEMPLATES = [
  { id: "orcamento", label: "Orcamento disponivel", icon: DollarSign, question: "Qual seu orcamento para este servico?" },
  { id: "urgencia", label: "Nivel de urgencia", icon: CalendarClock, question: "Para quando voce precisa?" },
  { id: "decisor", label: "Quem decide", icon: Users, question: "Voce e quem decide sobre isso?" },
  { id: "experiencia", label: "Experiencia anterior", icon: HelpCircle, question: "Ja utilizou esse tipo de servico antes?" },
  { id: "tamanho", label: "Tamanho do projeto", icon: Target, question: "Qual o tamanho/escopo do que precisa?" },
  { id: "localizacao", label: "Localizacao", icon: MapPin, question: "Qual sua cidade/regiao?" },
];

function normalizeQrCode(qr: string): string {
  if (!qr) return "";
  if (qr.startsWith("data:image")) return qr;
  return `data:image/png;base64,${qr}`;
}

export default function OnboardingPage() {
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const router = useRouter();
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Step 2
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");
  const [businessHours, setBusinessHours] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [businessInstagram, setBusinessInstagram] = useState("");

  // Step 3
  const [botName, setBotName] = useState("");
  const [botTone, setBotTone] = useState("acolhedor e direto");
  const [welcomeMessage, setWelcomeMessage] = useState("");

  // Step 4
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [waConnected, setWaConnected] = useState(false);
  const [waVerifying, setWaVerifying] = useState(false);

  // Step 5
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [customQuestion, setCustomQuestion] = useState("");

  // Step 6
  const [links, setLinks] = useState("");

  // Auto-poll WhatsApp
  useEffect(() => {
    if (step === 4 && qrCode && !waConnected) {
      const check = async () => {
        try {
          const res = await api.whatsappStatus();
          if (res.connected) {
            setWaConnected(true);
            if (pollingRef.current) clearInterval(pollingRef.current);
          }
        } catch { /* retry */ }
      };
      check();
      pollingRef.current = setInterval(check, 5000);
      return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
    }
  }, [step, qrCode, waConnected]);

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }
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
          if (t.whatsapp_connected) setWaConnected(true);
        }
      } catch { /* new tenant */ }
      setChecking(false);
    }
    init();
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
      alert(err instanceof Error ? err.message : "Erro ao salvar");
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
      if (res.qr_code) setQrCode(res.qr_code);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Erro ao gerar QR Code");
    }
    setLoading(false);
  }

  async function manualCheck() {
    setWaVerifying(true);
    try {
      const res = await api.whatsappStatus();
      if (res.connected) setWaConnected(true);
      else alert("Ainda nao conectado. Escaneie o QR e tente novamente.");
    } catch { alert("Erro ao verificar."); }
    setWaVerifying(false);
  }

  async function saveKnowledge() {
    setLoading(true);
    try {
      const linkList = links.split("\n").map(l => l.trim()).filter(Boolean);
      if (linkList.length > 0) await api.addKnowledge(linkList);
      setStep(7);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Erro ao processar links");
    }
    setLoading(false);
  }

  function toggleQuestion(id: string) {
    setSelectedQuestions(prev =>
      prev.includes(id) ? prev.filter(q => q !== id) : [...prev, id]
    );
  }

  const GlassCard = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <div className={`rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] ${className}`}>
      {children}
    </div>
  );

  const GreenBtn = ({ onClick, disabled, children, className = "" }: { onClick: () => void; disabled?: boolean; children: React.ReactNode; className?: string }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`h-12 bg-gradient-to-r from-[#2dd272] to-[#0fa968] text-[#050506] font-bold rounded-xl
        hover:shadow-lg hover:shadow-[#2dd272]/20 active:scale-[0.98]
        disabled:opacity-40 disabled:cursor-not-allowed
        transition-all duration-200 flex items-center justify-center gap-2 ${className}`}
    >
      {children}
    </button>
  );

  const BackBtn = ({ onClick }: { onClick: () => void }) => (
    <button
      onClick={onClick}
      className="h-12 px-5 border border-white/[0.08] text-white/60 text-sm font-medium rounded-xl
        hover:bg-white/[0.04] transition-all duration-200 flex items-center gap-2"
    >
      <ArrowLeft className="w-4 h-4" /> Voltar
    </button>
  );

  if (checking) {
    return (
      <div className="min-h-screen bg-[#050506] flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-[#2dd272] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050506]">
      {/* Header */}
      <div className="border-b border-white/[0.06]">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <EcoZapIcon className="w-7 h-7 text-[#2dd272]" />
            <span className="font-bold text-white tracking-tight">EcoZap</span>
          </div>
          <span className="text-xs text-white/25 font-medium">{step} de 7</span>
        </div>
      </div>

      {/* Progress */}
      <div className="max-w-2xl mx-auto px-6 pt-4">
        <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#2dd272] to-[#0fa968] rounded-full transition-all duration-500"
            style={{ width: `${(step / 7) * 100}%` }}
          />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-10">

        {/* STEP 1: Welcome + Como a IA funciona */}
        {step === 1 && (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-[#2dd272]/10 border border-[#2dd272]/20 flex items-center justify-center mx-auto">
                <Bot className="w-8 h-8 text-[#2dd272]" />
              </div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">Seu assistente AI no WhatsApp</h1>
              <p className="text-white/40 text-[15px] max-w-md mx-auto leading-relaxed">
                Em poucos minutos, seu negocio tera um atendente inteligente disponivel 24 horas.
              </p>
            </div>

            <GlassCard className="p-6 space-y-5">
              <h3 className="text-xs font-bold text-white/30 uppercase tracking-widest">Como funciona a IA</h3>
              <div className="space-y-4">
                {[
                  { icon: MessageSquare, title: "Atende no WhatsApp automaticamente", desc: "Responde leads em segundos, 24h por dia, com linguagem natural e humanizada." },
                  { icon: Brain, title: "Aprende sobre seu negocio", desc: "Voce alimenta com links, FAQs e contexto. A IA absorve e responde com base nisso." },
                  { icon: Target, title: "Qualifica leads em tempo real", desc: "Faz perguntas estrategicas e classifica cada lead (quente, morno, frio) com score." },
                  { icon: Zap, title: "Te avisa quando importa", desc: "Lead quente? Voce recebe alerta no WhatsApp. Sem perder oportunidade." },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-4.5 h-4.5 text-[#2dd272]/70" />
                    </div>
                    <div>
                      <p className="text-[14px] font-semibold text-white/80">{item.title}</p>
                      <p className="text-[12px] text-white/30 mt-0.5 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>

            <GlassCard className="p-5">
              <h3 className="text-xs font-bold text-white/30 uppercase tracking-widest mb-3">O que vamos configurar</h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { icon: Building2, text: "Dados do negocio" },
                  { icon: Bot, text: "Identidade do bot" },
                  { icon: Smartphone, text: "Conexao WhatsApp" },
                  { icon: Target, text: "Perguntas de qualificacao" },
                  { icon: BookOpen, text: "Base de conhecimento" },
                  { icon: CheckCircle, text: "Pronto pra atender" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-[12px] text-white/40 py-1.5">
                    <item.icon className="w-3.5 h-3.5 text-[#2dd272]/50" />
                    {item.text}
                  </div>
                ))}
              </div>
            </GlassCard>

            <GreenBtn onClick={() => setStep(2)} className="w-full">
              Comecar configuracao <ArrowRight className="w-4 h-4" />
            </GreenBtn>
          </div>
        )}

        {/* STEP 2: Business Profile (expandido) */}
        {step === 2 && (
          <div className="space-y-7">
            <div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">Seu negocio</h1>
              <p className="text-white/40 mt-1 text-[14px]">Essas informacoes ajudam a IA a entender seu contexto.</p>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-[12px] font-semibold text-white/40 uppercase tracking-wider">Nome do negocio</label>
                <input value={businessName} onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Ex: Studio Maria Hair"
                  className="w-full h-11 px-4 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-white placeholder:text-white/20 outline-none focus:border-[#2dd272]/40 focus:ring-1 focus:ring-[#2dd272]/10 transition-all" />
              </div>

              <div className="space-y-2">
                <label className="text-[12px] font-semibold text-white/40 uppercase tracking-wider">Tipo de negocio</label>
                <div className="grid grid-cols-4 gap-2 max-h-[280px] overflow-y-auto pr-1 scrollbar-thin">
                  {BUSINESS_TYPES.map((type) => (
                    <button key={type.value} onClick={() => setBusinessType(type.value)}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all
                        ${businessType === type.value
                          ? "border-[#2dd272]/40 bg-[#2dd272]/10"
                          : "border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.02]"}`}>
                      <type.icon className={`w-5 h-5 ${businessType === type.value ? "text-[#2dd272]" : "text-white/30"}`} />
                      <span className={`text-[10px] font-medium leading-tight ${businessType === type.value ? "text-[#2dd272]" : "text-white/50"}`}>
                        {type.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-[12px] font-semibold text-white/40 uppercase tracking-wider">Seu nome</label>
                  <input value={ownerName} onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="Seu nome"
                    className="w-full h-11 px-4 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-white placeholder:text-white/20 outline-none focus:border-[#2dd272]/40 focus:ring-1 focus:ring-[#2dd272]/10 transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[12px] font-semibold text-white/40 uppercase tracking-wider">Seu WhatsApp</label>
                  <input value={ownerPhone} onChange={(e) => setOwnerPhone(e.target.value)}
                    placeholder="5511999998888"
                    className="w-full h-11 px-4 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-white placeholder:text-white/20 outline-none focus:border-[#2dd272]/40 focus:ring-1 focus:ring-[#2dd272]/10 transition-all" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-[12px] font-semibold text-white/40 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3 h-3" /> Horario de atendimento
                  </label>
                  <input value={businessHours} onChange={(e) => setBusinessHours(e.target.value)}
                    placeholder="Seg-Sex 9h-18h"
                    className="w-full h-11 px-4 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-white placeholder:text-white/20 outline-none focus:border-[#2dd272]/40 focus:ring-1 focus:ring-[#2dd272]/10 transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[12px] font-semibold text-white/40 uppercase tracking-wider flex items-center gap-1.5">
                    <AtSign className="w-3 h-3" /> Instagram
                  </label>
                  <input value={businessInstagram} onChange={(e) => setBusinessInstagram(e.target.value)}
                    placeholder="@seuperfil"
                    className="w-full h-11 px-4 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-white placeholder:text-white/20 outline-none focus:border-[#2dd272]/40 focus:ring-1 focus:ring-[#2dd272]/10 transition-all" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[12px] font-semibold text-white/40 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3 h-3" /> Endereco / Cidade
                </label>
                <input value={businessAddress} onChange={(e) => setBusinessAddress(e.target.value)}
                  placeholder="Rua X, 123 — Sao Paulo, SP"
                  className="w-full h-11 px-4 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-white placeholder:text-white/20 outline-none focus:border-[#2dd272]/40 focus:ring-1 focus:ring-[#2dd272]/10 transition-all" />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <BackBtn onClick={() => setStep(1)} />
              <GreenBtn onClick={saveProfile} disabled={!businessName || !businessType || !ownerName || !ownerPhone || loading} className="flex-1">
                {loading ? "Salvando..." : "Proximo"} {!loading && <ArrowRight className="w-4 h-4" />}
              </GreenBtn>
            </div>
          </div>
        )}

        {/* STEP 3: Bot Identity (expandido) */}
        {step === 3 && (
          <div className="space-y-7">
            <div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">Identidade do bot</h1>
              <p className="text-white/40 mt-1 text-[14px]">Como seu assistente vai se comunicar com os leads.</p>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-[12px] font-semibold text-white/40 uppercase tracking-wider">Nome do assistente</label>
                <input value={botName} onChange={(e) => setBotName(e.target.value)}
                  placeholder="Ex: Ana, Lia, Max, Assistente..."
                  className="w-full h-11 px-4 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-white placeholder:text-white/20 outline-none focus:border-[#2dd272]/40 focus:ring-1 focus:ring-[#2dd272]/10 transition-all" />
              </div>

              <div className="space-y-2">
                <label className="text-[12px] font-semibold text-white/40 uppercase tracking-wider">Tom de voz</label>
                <div className="grid grid-cols-4 gap-2">
                  {TONES.map((tone) => (
                    <button key={tone.id} onClick={() => setBotTone(tone.id)}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all
                        ${botTone === tone.id
                          ? "border-[#2dd272]/40 bg-[#2dd272]/10"
                          : "border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.02]"}`}>
                      <tone.icon className={`w-5 h-5 ${botTone === tone.id ? "text-[#2dd272]" : "text-white/30"}`} />
                      <span className={`text-[10px] font-medium leading-tight ${botTone === tone.id ? "text-[#2dd272]" : "text-white/50"}`}>
                        {tone.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[12px] font-semibold text-white/40 uppercase tracking-wider">Mensagem de boas-vindas</label>
                <textarea value={welcomeMessage} onChange={(e) => setWelcomeMessage(e.target.value)}
                  placeholder="Oi! Sou a Ana, assistente da Studio Maria. Como posso te ajudar hoje?"
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-white placeholder:text-white/20 outline-none resize-none focus:border-[#2dd272]/40 focus:ring-1 focus:ring-[#2dd272]/10 transition-all" />
                <p className="text-[11px] text-white/20">Primeira mensagem que o lead recebe ao entrar em contato.</p>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <BackBtn onClick={() => setStep(2)} />
              <GreenBtn onClick={saveBot} disabled={loading} className="flex-1">
                {loading ? "Salvando..." : "Proximo"} {!loading && <ArrowRight className="w-4 h-4" />}
              </GreenBtn>
            </div>
          </div>
        )}

        {/* STEP 4: Connect WhatsApp */}
        {step === 4 && (
          <div className="space-y-7">
            <div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">Conectar WhatsApp</h1>
              <p className="text-white/40 mt-1 text-[14px]">Vincule o numero que o bot vai usar para atender.</p>
            </div>

            {!qrCode && !waConnected && (
              <>
                <GlassCard className="p-6 space-y-3">
                  <div className="flex items-start gap-3">
                    <Smartphone className="w-5 h-5 text-[#2dd272] mt-0.5 flex-shrink-0" />
                    <div className="text-[13px] text-white/60 space-y-2">
                      <p className="font-semibold text-white/80">Como funciona</p>
                      <p>Vamos criar uma conexao com o WhatsApp. Voce vai escanear um QR code com o celular — igual ao WhatsApp Web.</p>
                      <p className="text-white/40">Use um numero dedicado para o bot (nao o seu pessoal).</p>
                    </div>
                  </div>
                </GlassCard>
                <div className="flex gap-3">
                  <BackBtn onClick={() => setStep(3)} />
                  <GreenBtn onClick={generateQR} disabled={loading} className="flex-1">
                    {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Gerando...</> : <><QrCode className="w-4 h-4" /> Gerar QR Code</>}
                  </GreenBtn>
                </div>
              </>
            )}

            {qrCode && !waConnected && (
              <div className="space-y-5">
                <GlassCard className="p-6 text-center space-y-4">
                  <p className="text-sm font-semibold text-white/60">Escaneie o QR Code com seu WhatsApp</p>
                  <div className="inline-block p-3 bg-white rounded-xl">
                    <img src={normalizeQrCode(qrCode)} alt="QR Code" className="w-52 h-52" />
                  </div>
                  <div className="flex items-center justify-center gap-2 text-[11px] text-white/30">
                    <Loader2 className="w-3 h-3 animate-spin" /> Verificando conexao automaticamente...
                  </div>
                </GlassCard>
                <div className="flex gap-3">
                  <BackBtn onClick={() => setStep(3)} />
                  <button onClick={manualCheck} disabled={waVerifying}
                    className="flex-1 h-12 border border-white/[0.08] text-white/60 text-sm font-medium rounded-xl hover:bg-white/[0.04] disabled:opacity-40 transition-all flex items-center justify-center gap-2">
                    {waVerifying ? <><Loader2 className="w-4 h-4 animate-spin" /> Verificando...</> : <><RefreshCw className="w-4 h-4" /> Ja escaneei</>}
                  </button>
                </div>
              </div>
            )}

            {waConnected && (
              <div className="space-y-5">
                <GlassCard className="p-4 flex items-center gap-3 border-[#2dd272]/20 bg-[#2dd272]/5">
                  <CheckCircle className="w-5 h-5 text-[#2dd272]" />
                  <span className="text-sm font-semibold text-[#2dd272]">WhatsApp conectado com sucesso!</span>
                </GlassCard>
                <div className="flex gap-3">
                  <BackBtn onClick={() => setStep(3)} />
                  <GreenBtn onClick={() => setStep(5)} className="flex-1">
                    Proximo <ArrowRight className="w-4 h-4" />
                  </GreenBtn>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 5: Perguntas de Qualificacao */}
        {step === 5 && (
          <div className="space-y-7">
            <div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">Perguntas de qualificacao</h1>
              <p className="text-white/40 mt-1 text-[14px]">Quais perguntas o bot deve fazer aos leads para qualifica-los?</p>
            </div>

            <GlassCard className="p-5 space-y-2">
              <div className="flex items-start gap-3 text-[12px] text-white/40">
                <Brain className="w-4 h-4 text-[#2dd272]/60 mt-0.5 flex-shrink-0" />
                <p>A IA usa essas perguntas para classificar cada lead com um score de 0 a 100. Leads quentes (score alto) geram alerta imediato pra voce.</p>
              </div>
            </GlassCard>

            <div className="space-y-3">
              <label className="text-[12px] font-semibold text-white/40 uppercase tracking-wider">Selecione as perguntas</label>
              <div className="grid grid-cols-2 gap-2">
                {QUALIFICATION_TEMPLATES.map((q) => (
                  <button key={q.id} onClick={() => toggleQuestion(q.id)}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all
                      ${selectedQuestions.includes(q.id)
                        ? "border-[#2dd272]/40 bg-[#2dd272]/10"
                        : "border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.02]"}`}>
                    <q.icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${selectedQuestions.includes(q.id) ? "text-[#2dd272]" : "text-white/30"}`} />
                    <div>
                      <p className={`text-[12px] font-medium ${selectedQuestions.includes(q.id) ? "text-[#2dd272]" : "text-white/60"}`}>{q.label}</p>
                      <p className="text-[10px] text-white/25 mt-0.5">{q.question}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[12px] font-semibold text-white/40 uppercase tracking-wider">Pergunta personalizada (opcional)</label>
              <input value={customQuestion} onChange={(e) => setCustomQuestion(e.target.value)}
                placeholder="Ex: Qual modelo de carro voce tem?"
                className="w-full h-11 px-4 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-white placeholder:text-white/20 outline-none focus:border-[#2dd272]/40 focus:ring-1 focus:ring-[#2dd272]/10 transition-all" />
            </div>

            <div className="flex gap-3 pt-2">
              <BackBtn onClick={() => setStep(4)} />
              <GreenBtn onClick={() => setStep(6)} className="flex-1">
                Proximo <ArrowRight className="w-4 h-4" />
              </GreenBtn>
            </div>
          </div>
        )}

        {/* STEP 6: Knowledge Links */}
        {step === 6 && (
          <div className="space-y-7">
            <div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">Base de conhecimento</h1>
              <p className="text-white/40 mt-1 text-[14px]">Ensine o bot sobre seu negocio com links.</p>
            </div>

            <GlassCard className="p-4 flex items-center gap-3 border-[#2dd272]/20 bg-[#2dd272]/5">
              <Wifi className="w-4 h-4 text-[#2dd272]" />
              <span className="text-[12px] font-medium text-[#2dd272]">WhatsApp conectado</span>
            </GlassCard>

            <GlassCard className="p-5 space-y-2">
              <div className="flex items-start gap-3 text-[12px] text-white/40">
                <BookOpen className="w-4 h-4 text-[#2dd272]/60 mt-0.5 flex-shrink-0" />
                <p>A IA vai acessar esses links, extrair informacoes sobre seu negocio e usar como base para responder perguntas dos leads. Quanto mais contexto, melhor as respostas.</p>
              </div>
            </GlassCard>

            <div className="space-y-2">
              <label className="text-[12px] font-semibold text-white/40 uppercase tracking-wider flex items-center gap-1.5">
                <Globe className="w-3 h-3" /> Links do seu negocio
              </label>
              <textarea value={links} onChange={(e) => setLinks(e.target.value)}
                placeholder={"https://seusite.com.br\nhttps://instagram.com/seuperfil\nhttps://youtube.com/seuvideo"}
                rows={5}
                className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08] text-sm text-white placeholder:text-white/20 outline-none resize-none font-mono focus:border-[#2dd272]/40 focus:ring-1 focus:ring-[#2dd272]/10 transition-all" />
              <p className="text-[11px] text-white/20">Site, Instagram, YouTube, Google Meu Negocio, cardapio online... Um por linha.</p>
            </div>

            <div className="flex gap-3 pt-2">
              <BackBtn onClick={() => setStep(5)} />
              <GreenBtn onClick={saveKnowledge} disabled={loading} className="flex-1">
                {loading ? "Processando..." : links.trim() ? "Enviar e finalizar" : "Finalizar sem links"}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </GreenBtn>
            </div>
          </div>
        )}

        {/* STEP 7: Done */}
        {step === 7 && (
          <div className="space-y-8 text-center">
            <div className="space-y-4">
              <div className="w-20 h-20 rounded-2xl bg-[#2dd272]/10 border border-[#2dd272]/20 flex items-center justify-center mx-auto">
                <CheckCircle className="w-10 h-10 text-[#2dd272]" />
              </div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">Tudo pronto!</h1>
              <p className="text-white/40 text-[15px] max-w-md mx-auto leading-relaxed">
                Seu assistente esta configurado e pronto para atender no WhatsApp.
              </p>
            </div>

            <GlassCard className="p-6 text-left space-y-3 max-w-sm mx-auto">
              {[
                { label: "Negocio", value: businessName },
                { label: "Tipo", value: BUSINESS_TYPES.find(t => t.value === businessType)?.label || businessType },
                { label: "Bot", value: botName || "Assistente" },
                { label: "Tom", value: TONES.find(t => t.id === botTone)?.label || botTone },
                { label: "WhatsApp", value: "Conectado", green: true },
                { label: "Qualificacao", value: `${selectedQuestions.length} perguntas` },
              ].map((row, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/40">{row.label}</span>
                    <span className={`font-medium ${row.green ? "text-[#2dd272]" : "text-white/80"}`}>{row.value}</span>
                  </div>
                  {i < 5 && <div className="h-px bg-white/[0.04] mt-3" />}
                </div>
              ))}
            </GlassCard>

            <GreenBtn onClick={() => router.push("/dashboard")} className="px-10 mx-auto">
              Ir para o painel <ArrowRight className="w-4 h-4" />
            </GreenBtn>
          </div>
        )}
      </div>
    </div>
  );
}
