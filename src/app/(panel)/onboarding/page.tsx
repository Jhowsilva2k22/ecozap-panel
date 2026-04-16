"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import {
  Zap, ArrowRight, ArrowLeft, Building2, User, MessageSquare,
  BookOpen, Smartphone, CheckCircle, Sparkles, Globe, Heart,
  ShieldCheck, Flame, Coffee
} from "lucide-react";

type Step = 1 | 2 | 3 | 4 | 5 | 6;

const TONES = [
  { id: "acolhedor e direto", label: "Acolhedor e Direto", icon: Heart, desc: "Proximo e objetivo" },
  { id: "profissional e formal", label: "Profissional", icon: ShieldCheck, desc: "Serio e confiavel" },
  { id: "descontraido e amigavel", label: "Descontraido", icon: Coffee, desc: "Leve e informal" },
  { id: "persuasivo e energetico", label: "Energetico", icon: Flame, desc: "Vendas e urgencia" },
];

export default function OnboardingPage() {
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const router = useRouter();

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

  async function connectWA() {
    setLoading(true);
    try {
      const res = await api.connectWhatsApp(ownerPhone);
      if (res.qr_code) {
        setQrCode(res.qr_code);
      }
      setStep(5);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Erro ao conectar WhatsApp");
    }
    setLoading(false);
  }

  async function checkWAStatus() {
    try {
      const res = await api.whatsappStatus();
      if (res.connected) {
        setWaConnected(true);
      }
    } catch {
      // Retry later
    }
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#0f6b3a] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Top bar */}
      <div className="border-b border-zinc-100">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0f6b3a] flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold tracking-tight">EcoZap</span>
          </div>
          <span className="text-xs text-zinc-400 font-medium">{step} de 6</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="max-w-2xl mx-auto px-6 pt-4">
        <div className="h-1 bg-zinc-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#0f6b3a] rounded-full transition-all duration-500 ease-out"
            style={{ width: `${(step / 6) * 100}%` }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-6 py-12">
        {/* STEP 1: Welcome */}
        {step === 1 && (
          <div className="space-y-8 animate-in">
            <div className="text-center space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-[#e8f5ee] flex items-center justify-center mx-auto">
                <Sparkles className="w-8 h-8 text-[#0f6b3a]" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight">Bem-vindo ao EcoZap</h1>
              <p className="text-zinc-500 text-lg max-w-md mx-auto">
                Vamos configurar seu assistente de WhatsApp em poucos minutos.
              </p>
            </div>

            <div className="bg-zinc-50 rounded-2xl p-6 space-y-4">
              <h3 className="font-semibold text-sm text-zinc-500 uppercase tracking-wider">O que vamos fazer</h3>
              <div className="space-y-3">
                {[
                  { icon: Building2, text: "Dados do seu negocio" },
                  { icon: MessageSquare, text: "Identidade do seu bot" },
                  { icon: Smartphone, text: "Conectar seu WhatsApp" },
                  { icon: BookOpen, text: "Alimentar a base de conhecimento" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-lg bg-white border border-zinc-200 flex items-center justify-center">
                      <item.icon className="w-4 h-4 text-[#0f6b3a]" />
                    </div>
                    <span className="text-zinc-700">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full h-12 bg-[#0f6b3a] text-white font-medium rounded-xl
                hover:bg-[#0a4d2a] active:scale-[0.98]
                transition-all duration-200
                flex items-center justify-center gap-2"
            >
              Comecar configuracao <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 2: Business Profile */}
        {step === 2 && (
          <div className="space-y-8 animate-in">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Seu negocio</h1>
              <p className="text-zinc-500 mt-1">Essas informacoes ajudam o bot a entender o contexto.</p>
            </div>

            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-700">Nome do negocio</label>
                <input
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Ex: Studio Maria Hair"
                  className="w-full h-11 px-3.5 rounded-lg border border-zinc-200 bg-white text-sm
                    placeholder:text-zinc-400 outline-none
                    focus:border-[#0f6b3a] focus:ring-2 focus:ring-[#0f6b3a]/10
                    transition-all duration-200"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-700">Tipo de negocio</label>
                <select
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-lg border border-zinc-200 bg-white text-sm
                    text-zinc-700 outline-none
                    focus:border-[#0f6b3a] focus:ring-2 focus:ring-[#0f6b3a]/10
                    transition-all duration-200"
                >
                  <option value="">Selecione</option>
                  <option value="servicos">Prestacao de servicos</option>
                  <option value="ecommerce">E-commerce / Loja</option>
                  <option value="consultoria">Consultoria</option>
                  <option value="saude">Saude e Bem-estar</option>
                  <option value="educacao">Educacao / Cursos</option>
                  <option value="alimentacao">Alimentacao</option>
                  <option value="imobiliaria">Imobiliaria</option>
                  <option value="tecnologia">Tecnologia / SaaS</option>
                  <option value="outro">Outro</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-zinc-700">Seu nome</label>
                  <input
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="Joanderson"
                    className="w-full h-11 px-3.5 rounded-lg border border-zinc-200 bg-white text-sm
                      placeholder:text-zinc-400 outline-none
                      focus:border-[#0f6b3a] focus:ring-2 focus:ring-[#0f6b3a]/10
                      transition-all duration-200"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-zinc-700">WhatsApp</label>
                  <input
                    value={ownerPhone}
                    onChange={(e) => setOwnerPhone(e.target.value)}
                    placeholder="5511999998888"
                    className="w-full h-11 px-3.5 rounded-lg border border-zinc-200 bg-white text-sm
                      placeholder:text-zinc-400 outline-none
                      focus:border-[#0f6b3a] focus:ring-2 focus:ring-[#0f6b3a]/10
                      transition-all duration-200"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="h-12 px-5 border border-zinc-200 text-sm font-medium rounded-xl
                  hover:bg-zinc-50 transition-all duration-200
                  flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Voltar
              </button>
              <button
                onClick={saveProfile}
                disabled={!businessName || loading}
                className="flex-1 h-12 bg-[#0f6b3a] text-white font-medium rounded-xl
                  hover:bg-[#0a4d2a] active:scale-[0.98]
                  disabled:opacity-60 disabled:cursor-not-allowed
                  transition-all duration-200
                  flex items-center justify-center gap-2"
              >
                {loading ? "Salvando..." : "Proximo"}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Bot Identity */}
        {step === 3 && (
          <div className="space-y-8 animate-in">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Identidade do bot</h1>
              <p className="text-zinc-500 mt-1">Como seu assistente vai se comunicar.</p>
            </div>

            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-700">Nome do assistente</label>
                <input
                  value={botName}
                  onChange={(e) => setBotName(e.target.value)}
                  placeholder="Ex: Ana, Assistente, Lia..."
                  className="w-full h-11 px-3.5 rounded-lg border border-zinc-200 bg-white text-sm
                    placeholder:text-zinc-400 outline-none
                    focus:border-[#0f6b3a] focus:ring-2 focus:ring-[#0f6b3a]/10
                    transition-all duration-200"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700">Tom de voz</label>
                <div className="grid grid-cols-2 gap-3">
                  {TONES.map((tone) => (
                    <button
                      key={tone.id}
                      onClick={() => setBotTone(tone.id)}
                      className={`p-4 rounded-xl border text-left transition-all duration-200
                        ${botTone === tone.id
                          ? "border-[#0f6b3a] bg-[#e8f5ee] ring-1 ring-[#0f6b3a]/20"
                          : "border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50"
                        }`}
                    >
                      <tone.icon className={`w-5 h-5 mb-2 ${botTone === tone.id ? "text-[#0f6b3a]" : "text-zinc-400"}`} />
                      <div className="text-sm font-medium">{tone.label}</div>
                      <div className="text-xs text-zinc-500 mt-0.5">{tone.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-zinc-700">Mensagem de boas-vindas</label>
                <textarea
                  value={welcomeMessage}
                  onChange={(e) => setWelcomeMessage(e.target.value)}
                  placeholder="Oi! Sou a Ana, assistente da Studio Maria. Como posso te ajudar hoje?"
                  rows={3}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-200 bg-white text-sm
                    placeholder:text-zinc-400 outline-none resize-none
                    focus:border-[#0f6b3a] focus:ring-2 focus:ring-[#0f6b3a]/10
                    transition-all duration-200"
                />
                <p className="text-xs text-zinc-400">Primeira mensagem que o lead recebe ao entrar em contato.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="h-12 px-5 border border-zinc-200 text-sm font-medium rounded-xl
                  hover:bg-zinc-50 transition-all duration-200
                  flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Voltar
              </button>
              <button
                onClick={saveBot}
                disabled={loading}
                className="flex-1 h-12 bg-[#0f6b3a] text-white font-medium rounded-xl
                  hover:bg-[#0a4d2a] active:scale-[0.98]
                  disabled:opacity-60 disabled:cursor-not-allowed
                  transition-all duration-200
                  flex items-center justify-center gap-2"
              >
                {loading ? "Salvando..." : "Proximo"}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Connect WhatsApp */}
        {step === 4 && (
          <div className="space-y-8 animate-in">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Conectar WhatsApp</h1>
              <p className="text-zinc-500 mt-1">Vincule o numero que o bot vai usar para atender.</p>
            </div>

            <div className="bg-zinc-50 rounded-2xl p-6 space-y-4">
              <div className="flex items-start gap-3">
                <Smartphone className="w-5 h-5 text-[#0f6b3a] mt-0.5 shrink-0" />
                <div className="text-sm text-zinc-600 space-y-1">
                  <p className="font-medium text-zinc-900">Como funciona</p>
                  <p>Vamos criar uma conexao com o WhatsApp. Voce vai escanear um QR code com o celular — igual ao WhatsApp Web.</p>
                  <p className="text-zinc-500">Use um numero dedicado para o bot (nao o seu pessoal).</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(3)}
                className="h-12 px-5 border border-zinc-200 text-sm font-medium rounded-xl
                  hover:bg-zinc-50 transition-all duration-200
                  flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Voltar
              </button>
              <button
                onClick={connectWA}
                disabled={loading}
                className="flex-1 h-12 bg-[#0f6b3a] text-white font-medium rounded-xl
                  hover:bg-[#0a4d2a] active:scale-[0.98]
                  disabled:opacity-60 disabled:cursor-not-allowed
                  transition-all duration-200
                  flex items-center justify-center gap-2"
              >
                {loading ? "Criando instancia..." : "Gerar QR Code"}
                {!loading && <Smartphone className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}

        {/* STEP 5: QR Code + Knowledge */}
        {step === 5 && (
          <div className="space-y-8 animate-in">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Base de conhecimento</h1>
              <p className="text-zinc-500 mt-1">Ensine o bot sobre seu negocio.</p>
            </div>

            {/* QR Code status */}
            {qrCode && !waConnected && (
              <div className="bg-zinc-50 rounded-2xl p-6 text-center space-y-3">
                <p className="text-sm font-medium text-zinc-700">Escaneie o QR Code com seu WhatsApp</p>
                <div className="inline-block p-3 bg-white rounded-xl border border-zinc-200">
                  <img src={`data:image/png;base64,${qrCode}`} alt="QR Code" className="w-48 h-48" />
                </div>
                <button
                  onClick={checkWAStatus}
                  className="text-sm text-[#0f6b3a] font-medium hover:underline"
                >
                  Ja escaneei, verificar conexao
                </button>
              </div>
            )}

            {waConnected && (
              <div className="bg-[#e8f5ee] rounded-2xl p-4 flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-[#0f6b3a]" />
                <span className="text-sm font-medium text-[#0f6b3a]">WhatsApp conectado com sucesso!</span>
              </div>
            )}

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-zinc-400" />
                <label className="text-sm font-medium text-zinc-700">Links do seu negocio</label>
              </div>
              <textarea
                value={links}
                onChange={(e) => setLinks(e.target.value)}
                placeholder={"https://seusite.com.br\nhttps://instagram.com/seuperfil\nhttps://youtube.com/seuvideo"}
                rows={4}
                className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-200 bg-white text-sm
                  placeholder:text-zinc-400 outline-none resize-none
                  focus:border-[#0f6b3a] focus:ring-2 focus:ring-[#0f6b3a]/10
                  transition-all duration-200 font-mono"
              />
              <p className="text-xs text-zinc-400">
                Cole seus links (site, Instagram, YouTube). O bot vai aprender a partir deles. Um por linha.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(4)}
                className="h-12 px-5 border border-zinc-200 text-sm font-medium rounded-xl
                  hover:bg-zinc-50 transition-all duration-200
                  flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Voltar
              </button>
              <button
                onClick={saveKnowledge}
                disabled={loading}
                className="flex-1 h-12 bg-[#0f6b3a] text-white font-medium rounded-xl
                  hover:bg-[#0a4d2a] active:scale-[0.98]
                  disabled:opacity-60 disabled:cursor-not-allowed
                  transition-all duration-200
                  flex items-center justify-center gap-2"
              >
                {loading ? "Processando..." : links.trim() ? "Enviar e finalizar" : "Pular e finalizar"}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}

        {/* STEP 6: Done */}
        {step === 6 && (
          <div className="space-y-8 animate-in text-center">
            <div className="space-y-4">
              <div className="w-20 h-20 rounded-2xl bg-[#e8f5ee] flex items-center justify-center mx-auto">
                <CheckCircle className="w-10 h-10 text-[#0f6b3a]" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight">Tudo pronto!</h1>
              <p className="text-zinc-500 text-lg max-w-md mx-auto">
                Seu assistente esta configurado e pronto para atender no WhatsApp.
              </p>
            </div>

            <div className="bg-zinc-50 rounded-2xl p-6 text-left space-y-3 max-w-sm mx-auto">
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-500">Negocio</span>
                <span className="font-medium">{businessName}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-500">Bot</span>
                <span className="font-medium">{botName || "Assistente"}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-500">Tom</span>
                <span className="font-medium capitalize">{botTone}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-500">WhatsApp</span>
                <span className={`font-medium ${waConnected ? "text-[#0f6b3a]" : "text-amber-600"}`}>
                  {waConnected ? "Conectado" : "Pendente"}
                </span>
              </div>
            </div>

            <button
              onClick={() => router.push("/dashboard")}
              className="h-12 px-8 bg-[#0f6b3a] text-white font-medium rounded-xl
                hover:bg-[#0a4d2a] active:scale-[0.98]
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
