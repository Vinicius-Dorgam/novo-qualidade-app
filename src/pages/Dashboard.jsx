import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { 
  ClipboardList, 
  AlertTriangle, 
  CheckCircle2, 
  PackageX,
  Calendar
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';
import StatsCard from '../components/dashboard/StatsCard';
import ChartCard from '../components/dashboard/ChartCard';

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'];

export default function Dashboard() {
  const [periodo, setPeriodo] = useState('30');

  const { data: inspecoes = [] } = useQuery({
    queryKey: ['inspecoes'],
    queryFn: () => base44.entities.Inspecao.list('-created_date', 500),
    staleTime: 60_000
  });

  const { data: bobinas = [] } = useQuery({
    queryKey: ['bobinas-dashboard'],
    queryFn: () => base44.entities.Bobina.list('-created_date', 2000),
    staleTime: 60_000
  });

  const { data: planosAcao = [] } = useQuery({
    queryKey: ['planos-acao'],
    queryFn: () => base44.entities.PlanoAcao.list('-created_date', 500),
    staleTime: 60_000
  });

  const stats = useMemo(() => {
    const totalBobinas = bobinas.length;
    const bobinasNaoConformes = bobinas.filter(b => b.status_geral === 'Não Conforme').length;
    const pesoNaoConforme = bobinas
      .filter(b => b.status_geral === 'Não Conforme')
      .reduce((acc, b) => acc + (b.peso || 0), 0);
    const taxaConformidade = totalBobinas > 0
      ? ((totalBobinas - bobinasNaoConformes) / totalBobinas * 100).toFixed(1)
      : 0;

    // Índice de inspeções por id para lookups O(1)
    const inspecaoIdSet = {};
    const inspecaoPorTurno = { 'Manhã': new Set(), 'Tarde': new Set(), 'Noite': new Set() };
    const inspecaoPorMaquina = {};
    inspecoes.forEach(i => {
      inspecaoIdSet[i.id] = i;
      if (i.turno && inspecaoPorTurno[i.turno]) inspecaoPorTurno[i.turno].add(i.id);
      if (i.maquina) {
        if (!inspecaoPorMaquina[i.maquina]) inspecaoPorMaquina[i.maquina] = new Set();
        inspecaoPorMaquina[i.maquina].add(i.id);
      }
    });

    // Dados por turno
    const dadosPorTurno = ['Manhã', 'Tarde', 'Noite'].map(turno => {
      const ids = inspecaoPorTurno[turno];
      const bobinasTurno = bobinas.filter(b => ids.has(b.inspecao_id));
      return {
        turno,
        conformes: bobinasTurno.filter(b => b.status_geral === 'Conforme').length,
        naoConformes: bobinasTurno.filter(b => b.status_geral === 'Não Conforme').length
      };
    });

    // Dados por máquina
    const dadosPorMaquina = Object.entries(inspecaoPorMaquina).map(([maquina, ids]) => {
      const bobinasMaq = bobinas.filter(b => ids.has(b.inspecao_id));
      return {
        maquina: maquina.length > 10 ? maquina.substring(0, 10) + '...' : maquina,
        naoConformes: bobinasMaq.filter(b => b.status_geral === 'Não Conforme').length
      };
    }).sort((a, b) => b.naoConformes - a.naoConformes).slice(0, 8);

    const dadosPizza = [
      { name: 'Conforme', value: totalBobinas - bobinasNaoConformes },
      { name: 'Não Conforme', value: bobinasNaoConformes }
    ];

    const statusPlanos = [
      { name: 'Pendente', value: planosAcao.filter(p => p.status === 'Pendente').length, color: '#f59e0b' },
      { name: 'Em andamento', value: planosAcao.filter(p => p.status === 'Em andamento').length, color: '#3b82f6' },
      { name: 'Concluído', value: planosAcao.filter(p => p.status === 'Concluído').length, color: '#10b981' }
    ];

    return { totalBobinas, bobinasNaoConformes, pesoNaoConforme, taxaConformidade, dadosPorTurno, dadosPorMaquina, dadosPizza, statusPlanos };
  }, [inspecoes, bobinas, planosAcao]);

  const { totalBobinas, bobinasNaoConformes, pesoNaoConforme, taxaConformidade, dadosPorTurno, dadosPorMaquina, dadosPizza, statusPlanos } = stats;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-slate-500 mt-1">Visão geral do controle de qualidade</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={periodo} onValueChange={setPeriodo}>
            <SelectTrigger className="w-44 bg-white border-slate-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Últimos 7 dias</SelectItem>
              <SelectItem value="30">Últimos 30 dias</SelectItem>
              <SelectItem value="90">Últimos 90 dias</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatsCard
          title="Total Inspeções"
          value={inspecoes.length}
          icon={ClipboardList}
          color="blue"
          subtitle="Realizadas no período"
        />
        <StatsCard
          title="Taxa Conformidade"
          value={`${taxaConformidade}%`}
          icon={CheckCircle2}
          color="green"
          subtitle={`${totalBobinas - bobinasNaoConformes} de ${totalBobinas} bobinas`}
        />
        <StatsCard
          title="Não Conformidades"
          value={bobinasNaoConformes}
          icon={AlertTriangle}
          color="red"
          subtitle="Bobinas com desvios"
        />
        <StatsCard
          title="Peso Não Conforme"
          value={`${pesoNaoConforme.toFixed(1)} kg`}
          icon={PackageX}
          color="orange"
          subtitle="Material com desvios"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard 
          title="Conformidade por Turno"
          subtitle="Distribuição de bobinas conformes e não conformes"
        >
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dadosPorTurno}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="turno" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: 'none', 
                    borderRadius: '12px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
                  }}
                />
                <Legend />
                <Bar dataKey="conformes" name="Conformes" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="naoConformes" name="Não Conformes" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard 
          title="Taxa de Conformidade"
          subtitle="Visão geral de qualidade"
        >
          <div className="h-72 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dadosPizza}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  <Cell fill="#10b981" />
                  <Cell fill="#ef4444" />
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: 'none', 
                    borderRadius: '12px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard 
          title="Não Conformidades por Máquina"
          subtitle="Top máquinas com mais desvios"
        >
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dadosPorMaquina} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" stroke="#64748b" fontSize={12} />
                <YAxis dataKey="maquina" type="category" stroke="#64748b" fontSize={11} width={80} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: 'none', 
                    borderRadius: '12px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
                  }}
                />
                <Bar dataKey="naoConformes" name="Não Conformes" fill="#f59e0b" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard 
          title="Status dos Planos de Ação"
          subtitle="Acompanhamento de ações corretivas"
        >
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusPlanos}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusPlanos.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: 'none', 
                    borderRadius: '12px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}