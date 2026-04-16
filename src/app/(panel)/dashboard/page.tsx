"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Zap, Users, MessageSquare, Flame, TrendingUp,
  Smartphone, BookOpen, Settings, LogOut, ChevronRight,
  BarChart3, Clock, CheckCircle, AlertCircle
} from "lucide-react";

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

        // If no business_name, redirect to onboarding
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#0f6b3a] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const planLabels: Record<string, string> = {
    starter: "Starter",
    pro: "Pro",
    business: "Business",
    founder: "Founder",
  };

  const statusLabels: Record<string, { label: string; color: string }> = {
    trial: { label: "Trial", color: "text-amber-600 bg-amber-50" },
    active: { label: "Ativo", color: "text-[#0f6b3a] bg-[#e8f5ee]" },
    paused: { label: "Pausado", color: "text-zinc-500 bg-zinc-100" },
    cancelled: { label: "Cancelado", color: "text-red-600 bg-red-50" },
  };

  const planStatus = statusLabels[stats?.plan_status || "trial"] || statusLabels.trial;
  const msgPercent = stats ? Math.min((stats.msg_used / stats.msg_limit) * 100, 100) : 0;

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Sidebar (desktop) */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-zinc-100 hidden lg:flex flex-col">
        <div className="p-6 border-b border-zinc-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#0f6b3a] flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="font-semibold text-sm tracking-tight">EcoZap</div>
              <div className="text-xs text-zinc-400">{tenant?.business_name}</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
          <NavItem icon={BarChart3} label="Dashboard" href="/dashboard" active />
          <NavItem icon={Users} label="Leads" href="/customers" />
          <NavItem icon={BookOpen} label="Conhecimento" href="/onboarding" />
          <NavItem icon={Settings} label="Configuracoes" href="/settings" />
        </nav>

        <div className="p-4 border-t border-zinc-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-500 hover:text-zinc-700
              hover:bg-zinc-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:ml-64">
        {/* Top bar mobile */}
        <div className="lg:hidden sticky top-0 z-10 bg-white border-b border-zinc-100 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#0f6b3a] flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold text-sm">{tenant?.business_name}</span>
          </div>
          <button onClick={handleLogout} className="text-zinc-400 hover:text-zinc-600">
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 lg:p-8 space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Ola, {tenant?.owner_name || "voce"} \ud83d\udc4b
            </h1>
            <p className="text-zinc-500 mt-1">Aqui esta o resumo do seu negocio.</p>
          </div>

          {/* WhatsApp status alert */}
          {!stats?.whatsapp_connected && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-800">WhatsApp nao conectado</p>
                <p className="text-xs text-amber-600 mt-0.5">Conecte para comecar a receber mensagens.</p>
              </div>
              <Link
                href="/onboarding"
                className="text-sm font-medium text-amber-700 hover:text-amber-800 flex items-center gap-1"
              >
                Conectar <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          )}

          {/* Plan badge */}
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${planStatus.color}`}>
              {planLabels[stats?.plan || "starter"]} — {planStatus.label}
            </span>
            {stats?.plan_status === "trial" && stats.trial_ends_at && (
              <span className="text-xs text-zinc-400">
                Expira em {new Date(stats.trial_ends_at).toLocaleDateString("pt-BR")}
              </span>
            )}
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={Users}
              label="Total de leads"
              value={stats?.total_leads || 0}
              color="blue"
            />
            <StatCard
              icon={Flame}
              label="Leads quentes"
              value={stats?.hot_leads || 0}
              color="red"
            />
            <StatCard
              icon={TrendingUp}
              label="Leads mornos"
              value={stats?.warm_leads || 0}
              color="amber"
            />
            <StatCard
              icon={CheckCircle}
              label="Clientes"
              value={stats?.clients || 0}
              color="green"
            />
          </div>

          {/* Message usage */}
          <div className="bg-white rounded-2xl border border-zinc-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-zinc-400" />
                <h3 className="text-sm font-semibold">Mensagens do mes</h3>
              </div>
              <span className="text-sm text-zinc-500">
                {stats?.msg_used?.toLocaleString("pt-BR")} / {stats?.msg_limit?.toLocaleString("pt-BR")}
              </span>
            </div>
            <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  msgPercent > 90 ? "bg-red-500" : msgPercent > 70 ? "bg-amber-500" : "bg-[#0f6b3a]"
                }`}
                style={{ width: `${msgPercent}%` }}
              />
            </div>
            <p className="text-xs text-zinc-400 mt-2">
              {msgPercent > 90 ? "Voce esta perto do limite." : `${(100 - msgPercent).toFixed(0)}% disponivel.`}
            </p>
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <QuickAction
              icon={Smartphone}
              title="WhatsApp"
              desc={stats?.whatsapp_connected ? "Conectado e ativo" : "Conectar agora"}
              href="/onboarding"
              status={stats?.whatsapp_connected ? "success" : "warning"}
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
      </main>
    </div>
  );
}

function NavItem({
  icon: Icon,
  label,
  href,
  active = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors
        ${active
          ? "bg-[#e8f5ee] text-[#0f6b3a]"
          : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
        }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </Link>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  color: "blue" | "red" | "amber" | "green";
}) {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    red: "bg-red-50 text-red-600",
    amber: "bg-amber-50 text-amber-600",
    green: "bg-[#e8f5ee] text-[#0f6b3a]",
  };

  return (
    <div className="bg-white rounded-2xl border border-zinc-100 p-5">
      <div className={`w-9 h-9 rounded-lg ${colors[color]} flex items-center justify-center mb-3`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="text-2xl font-bold tracking-tight">{value}</div>
      <div className="text-xs text-zinc-500 mt-0.5">{label}</div>
    </div>
  );
}

function QuickAction({
  icon: Icon,
  title,
  desc,
  href,
  status,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
  href: string;
  status?: "success" | "warning";
}) {
  return (
    <Link
      href={href}
      className="bg-white rounded-2xl border border-zinc-100 p-5 hover:border-zinc-200 hover:shadow-sm
        transition-all duration-200 group flex items-center gap-4"
    >
      <div className="w-10 h-10 rounded-xl bg-zinc-50 flex items-center justify-center
        group-hover:bg-[#e8f5ee] transition-colors">
        <Icon className="w-5 h-5 text-zinc-400 group-hover:text-[#0f6b3a] transition-colors" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold">{title}</div>
        <div className="text-xs text-zinc-500 truncate">{desc}</div>
      </div>
      {status === "success" && <div className="w-2 h-2 rounded-full bg-[#0f6b3a]" />}
      {status === "warning" && <div className="w-2 h-2 rounded-full bg-amber-500" />}
      <ChevronRight className="w-4 h-4 text-zinc-300 group-hover:text-zinc-500 transition-colors" />
    </Link>
  );
}
