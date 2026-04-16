"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Users, MessageSquare, Flame, TrendingUp,
  Smartphone, BookOpen, Settings, LogOut, ChevronRight,
  BarChart3, CheckCircle, AlertCircle
} from "lucide-react";
import { EcoZapIcon } from "@/components/ecozap-icon";

interface Stats {
  total_leads: number;
  hot_leads: number;
  warm_leads: number;
  cold_leads: number;
  clients: number;
  total_messages: number;
  msg_used: number;
  msg_limit: number;
  plan: string;
  plan_status: string;
  trial_ends_at: string | null;
  whatsapp_connected: boolean;
}

interface Tenant {
  business_name: string;
  bot_name: string;
  plan: string;
  plan_status: string;
  whatsapp_connected: boolean;
  owner_name: string;
  slug: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }
      try {
        const [tenantRes, statsRes] = await Promise.all([
          api.getTenant(),
          api.getStats(),
        ]);
        setTenant(tenantRes.tenant);
        setStats(statsRes.stats);

        if (!tenantRes.tenant?.business_name) {
          router.push("/onboarding");
          return;
        }
      } catch {
        router.push("/onboarding");
        return;
      }
      setLoading(false);
    }
    load();
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f7f5] flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-[#0f6b3a]/25 border-t-[#0f6b3a] rounded-full animate-spin" />
      </div>
    );
  }

  const planLabels: Record<string, string> = {
    starter: "Starter",
    pro: "Pro",
    business: "Business",
    founder: "Founder",
  };

  const statusConfig: Record<string, { label: string; dot: string }> = {
    trial: { label: "Trial", dot: "bg-amber-500" },
    active: { label: "Ativo", dot: "bg-[#0f6b3a]" },
    paused: { label: "Pausado", dot: "bg-zinc-400" },
    cancelled: { label: "Cancelado", dot: "bg-red-500" },
  };

  const planStatus = statusConfig[stats?.plan_status || "trial"] || statusConfig.trial;
  const msgPercent = stats ? Math.min((stats.msg_used / stats.msg_limit) * 100, 100) : 0;

  return (
    <div className="min-h-screen bg-[#f7f7f5] flex">
      {/* ── SIDEBAR ── */}
      <aside className="fixed left-0 top-0 bottom-0 w-[260px] bg-[#111113] hidden lg:flex flex-col z-20">
        {/* Logo */}
        <div className="px-5 py-5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-white/[0.07] flex items-center justify-center">
            <EcoZapIcon className="w-[18px] h-[18px] text-[#0f6b3a]" />
          </div>
          <div className="min-w-0">
            <div className="text-[13px] font-semibold text-white tracking-tight">EcoZap</div>
            <div className="text-[11px] text-white/35 truncate">{tenant?.business_name}</div>
          </div>
        </div>

        {/* Divider */}
        <div className="mx-5 h-px bg-white/[0.06]" />

        {/* Nav */}
        <nav className="flex-1 px-3 mt-4 space-y-0.5">
          <NavItem icon={BarChart3} label="Dashboard" href="/dashboard" active />
          <NavItem icon={Users} label="Leads" href="/customers" />
          <NavItem icon={BookOpen} label="Conhecimento" href="/onboarding" />
          <NavItem icon={Settings} label="Configuracoes" href="/settings" />
        </nav>

        {/* Plan + Logout */}
        <div className="px-3 pb-4">
          <div className="mx-2 h-px bg-white/[0.06] mb-3" />
          <div className="px-3 py-2 mb-1">
            <div className="flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full ${planStatus.dot}`} />
              <span className="text-[11px] text-white/50 font-medium">
                {planLabels[stats?.plan || "starter"]} · {planStatus.label}
              </span>
            </div>
            {stats?.plan_status === "trial" && stats.trial_ends_at && (
              <span className="text-[10px] text-white/25 mt-1 block pl-3.5">
                Expira {new Date(stats.trial_ends_at).toLocaleDateString("pt-BR")}
              </span>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-[13px] text-white/30
              hover:text-white/50 hover:bg-white/[0.03] rounded-lg transition-all duration-150"
          >
            <LogOut className="w-[18px] h-[18px]" strokeWidth={1.7} />
            Sair
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className="lg:ml-[260px] flex-1 min-h-screen">
        {/* Mobile header */}
        <div className="lg:hidden sticky top-0 z-10 bg-[#111113] px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/[0.07] flex items-center justify-center">
              <EcoZapIcon className="w-4 h-4 text-[#0f6b3a]" />
            </div>
            <span className="text-[13px] font-semibold text-white tracking-tight">{tenant?.business_name}</span>
          </div>
          <button onClick={handleLogout} className="text-white/30 hover:text-white/50 transition-colors">
            <LogOut className="w-[18px] h-[18px]" strokeWidth={1.7} />
          </button>
        </div>

        <div className="p-5 lg:p-10 max-w-[1080px] space-y-8">
          {/* Header */}
          <div className="pt-1">
            <h1 className="text-[26px] font-semibold tracking-tight text-[#111113] leading-tight">
              Ola, {tenant?.owner_name || "voce"}
            </h1>
            <p className="text-[13px] text-zinc-400 mt-1">
              {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
            </p>
          </div>

          {/* WhatsApp alert */}
          {!stats?.whatsapp_connected && (
            <div className="bg-[#fdf8f0] rounded-xl px-5 py-4 flex items-center gap-4">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                <AlertCircle className="w-4 h-4 text-amber-600" strokeWidth={1.7} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-[#111113]">WhatsApp nao conectado</p>
                <p className="text-[12px] text-zinc-400 mt-0.5">Conecte para comecar a receber mensagens.</p>
              </div>
              <Link
                href="/onboarding"
                className="text-[12px] font-medium text-[#0f6b3a] hover:text-[#0a4d2a]
                  flex items-center gap-1 shrink-0 transition-colors"
              >
                Conectar <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          )}

          {/* Stats grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
            <StatCard icon={Users} label="Total de leads" value={stats?.total_leads || 0} accent="#3b6fb5" />
            <StatCard icon={Flame} label="Leads quentes" value={stats?.hot_leads || 0} accent="#b5403b" />
            <StatCard icon={TrendingUp} label="Leads mornos" value={stats?.warm_leads || 0} accent="#b8861d" />
            <StatCard icon={CheckCircle} label="Clientes" value={stats?.clients || 0} accent="#0f6b3a" />
          </div>

          {/* Message usage */}
          <div className="bg-white rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-[14px] font-semibold text-[#111113]">Mensagens</h3>
                <p className="text-[12px] text-zinc-400 mt-0.5">Uso do mes atual</p>
              </div>
              <div className="text-right">
                <span className="text-[22px] font-semibold tracking-tight text-[#111113]">
                  {stats?.msg_used?.toLocaleString("pt-BR")}
                </span>
                <span className="text-[13px] text-zinc-400 font-normal">
                  {" "}/ {stats?.msg_limit?.toLocaleString("pt-BR")}
                </span>
              </div>
            </div>
            <div className="h-[5px] bg-[#f0f0ee] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${msgPercent}%`,
                  backgroundColor: msgPercent > 90 ? "#b5403b" : msgPercent > 70 ? "#b8861d" : "#0f6b3a",
                }}
              />
            </div>
            <p className="text-[11px] text-zinc-400 mt-3">
              {msgPercent > 90
                ? "Proximo do limite. Considere fazer upgrade."
                : `${(100 - msgPercent).toFixed(0)}% disponivel este mes.`}
            </p>
          </div>

          {/* Quick actions */}
          <div>
            <h3 className="text-[11px] uppercase tracking-[0.08em] text-zinc-400 font-medium mb-4">Acoes rapidas</h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
              <QuickAction
                icon={Smartphone}
                title="WhatsApp"
                desc={stats?.whatsapp_connected ? "Conectado e ativo" : "Conectar agora"}
                href="/onboarding"
                connected={stats?.whatsapp_connected}
              />
              <QuickAction
                icon={BookOpen}
                title="Conhecimento"
                desc="Adicionar links e conteudo"
                href="/onboarding"
              />
              <QuickAction
                icon={Users}
                title="Leads"
                desc="Ver todos os contatos"
                href="/customers"
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

/* ── COMPONENTS ── */

function NavItem({
  icon: Icon,
  label,
  href,
  active = false,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  href: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] transition-all duration-150
        ${active
          ? "bg-white/[0.07] text-white font-medium"
          : "text-white/40 hover:text-white/60 hover:bg-white/[0.03]"
        }`}
    >
      {active && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-r-full bg-[#0f6b3a]" />
      )}
      <Icon className={`w-[18px] h-[18px] ${active ? "opacity-80" : "opacity-40"}`} strokeWidth={1.7} />
      {label}
    </Link>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  value: number;
  accent: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between mb-4">
        <Icon className="w-4 h-4 text-zinc-300" strokeWidth={1.7} />
        <div className="w-[6px] h-[6px] rounded-full" style={{ backgroundColor: accent }} />
      </div>
      <div className="text-[28px] font-semibold tracking-tight text-[#111113] leading-none">{value}</div>
      <div className="text-[11px] text-zinc-400 mt-2 uppercase tracking-[0.06em] font-medium">{label}</div>
    </div>
  );
}

function QuickAction({
  icon: Icon,
  title,
  desc,
  href,
  connected,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  title: string;
  desc: string;
  href: string;
  connected?: boolean;
}) {
  return (
    <Link
      href={href}
      className="bg-white rounded-xl px-5 py-4 flex items-center gap-4
        shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)]
        transition-all duration-200 group"
    >
      <div className="w-10 h-10 rounded-xl bg-[#f7f7f5] flex items-center justify-center
        group-hover:bg-[#f0f7f2] transition-colors duration-200">
        <Icon className="w-[18px] h-[18px] text-zinc-400 group-hover:text-[#0f6b3a] transition-colors duration-200" strokeWidth={1.7} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-medium text-[#111113]">{title}</div>
        <div className="text-[12px] text-zinc-400 truncate">{desc}</div>
      </div>
      {connected !== undefined && (
        <div className={`w-[6px] h-[6px] rounded-full shrink-0 ${connected ? "bg-[#0f6b3a]" : "bg-amber-500"}`} />
      )}
    </Link>
  );
}
