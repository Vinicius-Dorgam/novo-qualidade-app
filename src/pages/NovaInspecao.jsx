import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { 
  ArrowLeft, 
  Plus, 
  CheckCircle2, 
  AlertTriangle,
  Package,
  Calendar,
  Clock,
  Factory,
  FileText,
  Trash2
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import BobinaTableRow from '../components/inspecao/BobinaTableRow';
import PlanoAcaoForm from '../components/inspecao/PlanoAcaoForm';

const selectFields = [
  { key: 'aspecto_visual', label: 'Asp. Visual' },
  { key: 'largura', label: 'Largura' },
  { key: 'sanfona', label: 'Sanfona' },
  { key: 'tratamento_dinas', label: 'Trat. Dinas' },
  { key: 'planicidade_curvatura', label: 'Planicidade' },
  { key: 'diametro_interno', label: 'Diâm. Interno' },
  { key: 'encanoamento', label: 'Encanoamento' },
];

export default function NovaInspecao() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const inspecaoId = urlParams.get('id');

  const [addingRow, setAddingRow] = useState(false);
  const [showPlanoForm, setShowPlanoForm] = useState(false);
  const [selectedBobinaForPlano, setSelectedBobinaForPlano] = useState(null);

  const { data: inspecoes_list = [], isLoading: loadingInspecao } = useQuery({
    queryKey: ['inspecao-detail', inspecaoId],
    queryFn: () => base44.entities.Inspecao.filter({ id: inspecaoId }),
    enabled: !!inspecaoId,
    staleTime: 30_000
  });
  const inspecao = inspecoes_list[0];

  const { data: bobinas = [], isLoading: loadingBobinas } = useQuery({
    queryKey: ['bobinas', inspecaoId],
    queryFn: () => base44.entities.Bobina.filter({ inspecao_id: inspecaoId }),
    enabled: !!inspecaoId
  });

  const { data: planosAcao = [] } = useQuery({
    queryKey: ['planos-acao', inspecaoId],
    queryFn: () => base44.entities.PlanoAcao.filter({ inspecao_id: inspecaoId }),
    enabled: !!inspecaoId
  });

  // Buscar produto cadastrado para classificação automática
  const { data: produtos = [] } = useQuery({
    queryKey: ['produtos'],
    queryFn: () => base44.entities.Produto.list(),
    staleTime: 120_000
  });

  const produtoSpec = inspecao 
    ? produtos.find(p => p.codigo?.toLowerCase() === inspecao.produto?.toLowerCase() || p.nome?.toLowerCase() === inspecao.produto?.toLowerCase())
    : null;

  const updateStats = async (updatedBobinas) => {
    const total = updatedBobinas.length;
    const naoConformes = updatedBobinas.filter(b => b.status_geral === 'Não Conforme').length;
    const pesoNC = updatedBobinas
      .filter(b => b.status_geral === 'Não Conforme')
      .reduce((acc, b) => acc + (b.peso || 0), 0);
    await base44.entities.Inspecao.update(inspecaoId, {
      total_bobinas: total,
      bobinas_conformes: total - naoConformes,
      bobinas_nao_conformes: naoConformes,
      peso_total_nao_conforme: pesoNC
    });
    queryClient.invalidateQueries({ queryKey: ['inspecao-detail', inspecaoId] });
  };

  const createBobinaMutation = useMutation({
    mutationFn: (data) => base44.entities.Bobina.create(data),
    onSuccess: async (newBobina) => {
      const updatedBobinas = [...(bobinas || []), newBobina];
      queryClient.setQueryData(['bobinas', inspecaoId], updatedBobinas);
      setAddingRow(false);
      await updateStats(updatedBobinas);
    }
  });

  const createPlanoMutation = useMutation({
    mutationFn: (data) => base44.entities.PlanoAcao.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planos-acao', inspecaoId] });
      setShowPlanoForm(false);
      setSelectedBobinaForPlano(null);
    }
  });

  const deleteBobinaMutation = useMutation({
    mutationFn: (id) => base44.entities.Bobina.delete(id),
    onSuccess: async (_, deletedId) => {
      const updatedBobinas = (bobinas || []).filter(b => b.id !== deletedId);
      queryClient.setQueryData(['bobinas', inspecaoId], updatedBobinas);
      await updateStats(updatedBobinas);
    }
  });

  const finalizarMutation = useMutation({
    mutationFn: () => base44.entities.Inspecao.update(inspecaoId, { status: 'Finalizada' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inspecao-detail', inspecaoId] });
      navigate(createPageUrl('Inspecoes'));
    }
  });

  const handleOpenPlanoAcao = (bobina) => {
    setSelectedBobinaForPlano(bobina);
    setShowPlanoForm(true);
  };

  if (loadingInspecao) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-200"></div>
          <div className="h-4 w-32 bg-slate-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!inspecao) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-slate-700">Inspeção não encontrada</h2>
        <Button onClick={() => navigate(createPageUrl('Inspecoes'))} className="mt-4">
          Voltar para Inspeções
        </Button>
      </div>
    );
  }

  const conformes = bobinas.filter(b => b.status_geral === 'Conforme').length;
  const naoConformes = bobinas.filter(b => b.status_geral === 'Não Conforme').length;
  const bobinasNCSemPlano = bobinas.filter(b => 
    b.status_geral === 'Não Conforme' && 
    !planosAcao.some(p => p.bobina_id === b.id)
  );

  const enabledSelects = selectFields.filter(f => !produtoSpec || produtoSpec[f.key] !== false);

  return (
    <div className="space-y-6 pb-24 lg:pb-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate(createPageUrl('Inspecoes'))}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">
                Inspeção #{inspecao.op}
              </h1>
              <Badge className={cn(
                "border",
                inspecao.status === 'Finalizada' ? "bg-emerald-100 text-emerald-700 border-emerald-200" :
                inspecao.status === 'Em andamento' ? "bg-blue-100 text-blue-700 border-blue-200" :
                "bg-amber-100 text-amber-700 border-amber-200"
              )}>
                {inspecao.status}
              </Badge>
            </div>
            <p className="text-slate-500 mt-1">
              {inspecao.cliente} - {inspecao.produto}
              {produtoSpec && (
                <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                  Specs: {produtoSpec.codigo}
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          {inspecao.status !== 'Finalizada' && (
            <>
              <Button 
                variant="outline"
                onClick={() => setAddingRow(true)}
                disabled={addingRow}
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Bobina
              </Button>
              <Button 
                className="bg-emerald-500 hover:bg-emerald-600"
                onClick={() => finalizarMutation.mutate()}
                disabled={bobinasNCSemPlano.length > 0 || bobinas.length === 0}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Finalizar
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="border-0 shadow-lg shadow-slate-200/50 bg-white/80">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Data</p>
                <p className="font-semibold text-slate-800">
                  {inspecao.data && format(new Date(inspecao.data), 'dd/MM/yyyy')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg shadow-slate-200/50 bg-white/80">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Turno</p>
                <p className="font-semibold text-slate-800">{inspecao.turno}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg shadow-slate-200/50 bg-white/80">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                <Factory className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Máquina</p>
                <p className="font-semibold text-slate-800 truncate">{inspecao.maquina}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg shadow-slate-200/50 bg-white/80">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Conformes</p>
                <p className="font-semibold text-emerald-600">{conformes}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg shadow-slate-200/50 bg-white/80">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Não Conformes</p>
                <p className="font-semibold text-red-600">{naoConformes}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Warning */}
      {bobinasNCSemPlano.length > 0 && (
        <Card className="border-0 shadow-lg bg-amber-50 border-amber-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <div>
                <p className="font-semibold text-amber-800">Atenção!</p>
                <p className="text-sm text-amber-700">
                  {bobinasNCSemPlano.length} bobina(s) não conforme(s) sem plano de ação.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabela de Bobinas */}
      <Card className="border-0 shadow-lg shadow-slate-200/50 bg-white/80">
        <CardHeader className="border-b border-slate-100">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-slate-400" />
              Bobinas Inspecionadas ({bobinas.length})
            </CardTitle>
            {produtoSpec && (
              <div className="flex gap-3 text-xs text-slate-500">
                {produtoSpec.cof_min != null && <span>COF: {produtoSpec.cof_min}–{produtoSpec.cof_max}</span>}
                {produtoSpec.peso_min != null && <span>Peso: {produtoSpec.peso_min}–{produtoSpec.peso_max} kg</span>}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loadingBobinas ? (
            <div className="p-8 text-center text-slate-400">Carregando...</div>
          ) : (bobinas.length === 0 && !addingRow) ? (
            <div className="p-12 text-center">
              <Package className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">Nenhuma bobina inspecionada ainda</p>
              {inspecao.status !== 'Finalizada' && (
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setAddingRow(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Primeira Bobina
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600 whitespace-nowrap">Nº Bobina</th>
                    {enabledSelects.map(f => (
                      <th key={f.key} className="px-2 py-2 text-left text-xs font-semibold text-slate-600 whitespace-nowrap">{f.label}</th>
                    ))}
                    <th className="px-2 py-2 text-left text-xs font-semibold text-slate-600 whitespace-nowrap">Espessura</th>
                    <th className="px-2 py-2 text-left text-xs font-semibold text-slate-600 whitespace-nowrap">Peso (kg)</th>
                    <th className="px-2 py-2 text-left text-xs font-semibold text-slate-600 whitespace-nowrap">Enc. DM</th>
                    <th className="px-2 py-2 text-left text-xs font-semibold text-slate-600 whitespace-nowrap">Enc. DT</th>
                    <th className="px-2 py-2 text-left text-xs font-semibold text-slate-600 whitespace-nowrap">COF</th>
                    <th className="px-2 py-2 text-left text-xs font-semibold text-slate-600 whitespace-nowrap">Status</th>
                    <th className="px-2 py-2 text-left text-xs font-semibold text-slate-600"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {bobinas.map((bobina, index) => {
                    const temPlano = planosAcao.some(p => p.bobina_id === bobina.id);
                    return (
                      <motion.tr
                        key={bobina.id}
                        component="tr"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: Math.min(index * 0.03, 0.2) }}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-3 py-2.5 font-medium text-slate-800 whitespace-nowrap">{bobina.numero_bobina}</td>
                        {enabledSelects.map(f => (
                          <td key={f.key} className="px-2 py-2.5">
                            <span className={cn(
                              "text-xs px-1.5 py-0.5 rounded font-medium",
                              bobina[f.key] === 'Conforme' ? "bg-emerald-100 text-emerald-700" :
                              bobina[f.key] === 'Não Conforme' ? "bg-red-100 text-red-700" : "text-slate-400"
                            )}>
                              {bobina[f.key] === 'Conforme' ? '✓' : bobina[f.key] === 'Não Conforme' ? '✗' : '-'}
                            </span>
                          </td>
                        ))}
                        <td className="px-2 py-2.5 text-xs text-slate-600 whitespace-nowrap">
                          {bobina.espessura_min != null ? `${bobina.espessura_min}–${bobina.espessura_max}` : '-'}
                          {bobina.espessura_status && (
                            <span className={cn("ml-1 font-bold", bobina.espessura_status === 'Conforme' ? "text-emerald-600" : "text-red-600")}>
                              {bobina.espessura_status === 'Conforme' ? '✓' : '✗'}
                            </span>
                          )}
                        </td>
                        <td className="px-2 py-2.5 text-xs text-slate-600 whitespace-nowrap">
                          {bobina.peso || '-'}
                          {bobina.peso_status && (
                            <span className={cn("ml-1 font-bold", bobina.peso_status === 'Conforme' ? "text-emerald-600" : "text-red-600")}>
                              {bobina.peso_status === 'Conforme' ? '✓' : '✗'}
                            </span>
                          )}
                        </td>
                        <td className="px-2 py-2.5 text-xs text-slate-600 whitespace-nowrap">
                          {bobina.encolhimento_dm_min != null ? `${bobina.encolhimento_dm_min}–${bobina.encolhimento_dm_max}` : '-'}
                          {bobina.encolhimento_dm_status && (
                            <span className={cn("ml-1 font-bold", bobina.encolhimento_dm_status === 'Conforme' ? "text-emerald-600" : "text-red-600")}>
                              {bobina.encolhimento_dm_status === 'Conforme' ? '✓' : '✗'}
                            </span>
                          )}
                        </td>
                        <td className="px-2 py-2.5 text-xs text-slate-600 whitespace-nowrap">
                          {bobina.encolhimento_dt_min != null ? `${bobina.encolhimento_dt_min}–${bobina.encolhimento_dt_max}` : '-'}
                          {bobina.encolhimento_dt_status && (
                            <span className={cn("ml-1 font-bold", bobina.encolhimento_dt_status === 'Conforme' ? "text-emerald-600" : "text-red-600")}>
                              {bobina.encolhimento_dt_status === 'Conforme' ? '✓' : '✗'}
                            </span>
                          )}
                        </td>
                        <td className="px-2 py-2.5 text-xs text-slate-600 whitespace-nowrap">
                          {bobina.cof || '-'}
                          {bobina.cof_status && (
                            <span className={cn("ml-1 font-bold", bobina.cof_status === 'Conforme' ? "text-emerald-600" : "text-red-600")}>
                              {bobina.cof_status === 'Conforme' ? '✓' : '✗'}
                            </span>
                          )}
                        </td>
                        <td className="px-2 py-2.5">
                          <span className={cn(
                            "text-xs font-semibold px-2 py-0.5 rounded-full",
                            bobina.status_geral === 'Conforme' ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                          )}>
                            {bobina.status_geral === 'Conforme' ? 'C' : 'NC'}
                          </span>
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-1">
                            {bobina.status_geral === 'Não Conforme' && !temPlano && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="h-7 text-xs text-red-600 border-red-200 hover:bg-red-50 px-2"
                                onClick={() => handleOpenPlanoAcao(bobina)}
                              >
                                <FileText className="h-3 w-3 mr-1" />
                                Plano
                              </Button>
                            )}
                            {bobina.status_geral === 'Não Conforme' && temPlano && (
                              <Badge className="bg-blue-100 text-blue-700 text-xs h-6">
                                <FileText className="h-3 w-3 mr-1" />
                                Plano ✓
                              </Badge>
                            )}
                            {inspecao.status !== 'Finalizada' && (
                              <Button 
                                size="sm" 
                                variant="ghost"
                                className="h-7 w-7 p-0 text-red-400 hover:text-red-600 hover:bg-red-50"
                                onClick={() => deleteBobinaMutation.mutate(bobina.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}

                  {/* Nova linha inline */}
                  {addingRow && inspecao.status !== 'Finalizada' && (
                    <BobinaTableRow
                      inspecaoId={inspecaoId}
                      produto={produtoSpec}
                      onSave={(data) => createBobinaMutation.mutate(data)}
                      onCancel={() => setAddingRow(false)}
                      isSaving={createBobinaMutation.isPending}
                    />
                  )}
                </tbody>
              </table>

              {/* Botão adicionar outra linha */}
              {!addingRow && inspecao.status !== 'Finalizada' && bobinas.length > 0 && (
                <div className="px-3 py-2 border-t border-slate-100">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    onClick={() => setAddingRow(true)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Adicionar Bobina
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Plano de Ação Form Dialog */}
      <Dialog open={showPlanoForm} onOpenChange={setShowPlanoForm}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedBobinaForPlano && (
            <PlanoAcaoForm
              bobina={selectedBobinaForPlano}
              inspecaoId={inspecaoId}
              onSave={(data) => createPlanoMutation.mutate(data)}
              onCancel={() => {
                setShowPlanoForm(false);
                setSelectedBobinaForPlano(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}