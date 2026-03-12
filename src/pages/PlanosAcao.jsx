import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { 
  Search, 
  FileText,
  Calendar,
  User,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
  ExternalLink
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function PlanosAcao() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedPlano, setSelectedPlano] = useState(null);

  const { data: planos = [], isLoading } = useQuery({
    queryKey: ['planos-acao'],
    queryFn: () => base44.entities.PlanoAcao.list('-created_date', 500)
  });

  const { data: inspecoes = [] } = useQuery({
    queryKey: ['inspecoes'],
    queryFn: () => base44.entities.Inspecao.list()
  });

  const { data: bobinas = [] } = useQuery({
    queryKey: ['bobinas-all'],
    queryFn: () => base44.entities.Bobina.list()
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.PlanoAcao.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['planos-acao'] });
      setSelectedPlano(null);
    }
  });

  const filteredPlanos = planos.filter(plano => {
    const matchSearch = 
      plano.descricao_nao_conformidade?.toLowerCase().includes(search.toLowerCase()) ||
      plano.responsavel?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || plano.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const getStatusConfig = (status) => {
    switch (status) {
      case 'Pendente':
        return { color: 'bg-amber-100 text-amber-700 border-amber-200', icon: Clock };
      case 'Em andamento':
        return { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Clock };
      case 'Concluído':
        return { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle2 };
      case 'Cancelado':
        return { color: 'bg-red-100 text-red-700 border-red-200', icon: AlertCircle };
      default:
        return { color: 'bg-slate-100 text-slate-700 border-slate-200', icon: FileText };
    }
  };

  const getInspecaoInfo = (inspecaoId) => {
    return inspecoes.find(i => i.id === inspecaoId);
  };

  const getBobinaInfo = (bobinaId) => {
    return bobinas.find(b => b.id === bobinaId);
  };

  const handleUpdateStatus = (plano, newStatus) => {
    const data = { status: newStatus };
    if (newStatus === 'Concluído') {
      data.data_conclusao = format(new Date(), 'yyyy-MM-dd');
    }
    updateMutation.mutate({ id: plano.id, data });
  };

  // Stats
  const pendentes = planos.filter(p => p.status === 'Pendente').length;
  const emAndamento = planos.filter(p => p.status === 'Em andamento').length;
  const concluidos = planos.filter(p => p.status === 'Concluído').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">Planos de Ação</h1>
        <p className="text-slate-500 mt-1">Acompanhamento de ações corretivas</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-0 shadow-lg shadow-slate-200/50 bg-amber-50 border-l-4 border-l-amber-500">
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-amber-700">{pendentes}</p>
            <p className="text-sm text-amber-600">Pendentes</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg shadow-slate-200/50 bg-blue-50 border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-blue-700">{emAndamento}</p>
            <p className="text-sm text-blue-600">Em Andamento</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg shadow-slate-200/50 bg-emerald-50 border-l-4 border-l-emerald-500">
          <CardContent className="p-4">
            <p className="text-2xl font-bold text-emerald-700">{concluidos}</p>
            <p className="text-sm text-emerald-600">Concluídos</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-lg shadow-slate-200/50 bg-white/80 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar por descrição ou responsável..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 border-slate-200"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full lg:w-48 border-slate-200">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="Pendente">Pendente</SelectItem>
                <SelectItem value="Em andamento">Em andamento</SelectItem>
                <SelectItem value="Concluído">Concluído</SelectItem>
                <SelectItem value="Cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Plans List */}
      <div className="grid gap-4">
        <AnimatePresence>
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="border-0 shadow-lg animate-pulse">
                <CardContent className="p-6">
                  <div className="h-24 bg-slate-100 rounded"></div>
                </CardContent>
              </Card>
            ))
          ) : filteredPlanos.length === 0 ? (
            <Card className="border-0 shadow-lg">
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-700">Nenhum plano de ação encontrado</h3>
                <p className="text-slate-500 mt-1">Os planos são criados automaticamente ao identificar não conformidades</p>
              </CardContent>
            </Card>
          ) : (
            filteredPlanos.map((plano, index) => {
              const statusConfig = getStatusConfig(plano.status);
              const StatusIcon = statusConfig.icon;
              const inspecao = getInspecaoInfo(plano.inspecao_id);
              const bobina = getBobinaInfo(plano.bobina_id);
              
              return (
                <motion.div
                  key={plano.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="border-0 shadow-lg shadow-slate-200/50 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <Badge className={cn("border", statusConfig.color)}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {plano.status}
                            </Badge>
                            {bobina && (
                              <Badge variant="outline" className="border-slate-200">
                                Bobina: {bobina.numero_bobina}
                              </Badge>
                            )}
                          </div>
                          <p className="font-semibold text-slate-800 mb-2">
                            {plano.descricao_nao_conformidade}
                          </p>
                          <p className="text-sm text-slate-600 mb-3">
                            <strong>Ação:</strong> {plano.acao_corretiva}
                          </p>
                          <div className="flex flex-wrap gap-4 text-sm">
                            <div className="flex items-center gap-2 text-slate-500">
                              <User className="h-4 w-4" />
                              {plano.responsavel}
                            </div>
                            <div className="flex items-center gap-2 text-slate-500">
                              <Calendar className="h-4 w-4" />
                              Prazo: {plano.prazo && format(new Date(plano.prazo), 'dd/MM/yyyy')}
                            </div>
                            {inspecao && (
                              <div className="flex items-center gap-2 text-slate-500">
                                <FileText className="h-4 w-4" />
                                OP: {inspecao.op}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedPlano(plano)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Ver Detalhes
                          </Button>
                          {plano.status !== 'Concluído' && plano.status !== 'Cancelado' && (
                            <Select
                              value={plano.status}
                              onValueChange={(value) => handleUpdateStatus(plano, value)}
                            >
                              <SelectTrigger className="w-36">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Pendente">Pendente</SelectItem>
                                <SelectItem value="Em andamento">Em andamento</SelectItem>
                                <SelectItem value="Concluído">Concluído</SelectItem>
                                <SelectItem value="Cancelado">Cancelado</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* Detail Modal */}
      <Dialog open={!!selectedPlano} onOpenChange={() => setSelectedPlano(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Plano de Ação</DialogTitle>
          </DialogHeader>
          {selectedPlano && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500">Status</p>
                  <Badge className={cn("border mt-1", getStatusConfig(selectedPlano.status).color)}>
                    {selectedPlano.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Responsável</p>
                  <p className="font-medium">{selectedPlano.responsavel}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Prazo</p>
                  <p className="font-medium">
                    {selectedPlano.prazo && format(new Date(selectedPlano.prazo), 'dd/MM/yyyy')}
                  </p>
                </div>
                {selectedPlano.data_conclusao && (
                  <div>
                    <p className="text-sm text-slate-500">Data de Conclusão</p>
                    <p className="font-medium">
                      {format(new Date(selectedPlano.data_conclusao), 'dd/MM/yyyy')}
                    </p>
                  </div>
                )}
              </div>
              
              <div>
                <p className="text-sm text-slate-500 mb-1">Descrição da Não Conformidade</p>
                <p className="bg-slate-50 p-3 rounded-lg">{selectedPlano.descricao_nao_conformidade}</p>
              </div>

              {selectedPlano.causa_raiz && (
                <div>
                  <p className="text-sm text-slate-500 mb-1">Causa Raiz</p>
                  <p className="bg-slate-50 p-3 rounded-lg">{selectedPlano.causa_raiz}</p>
                </div>
              )}

              <div>
                <p className="text-sm text-slate-500 mb-1">Ação Corretiva</p>
                <p className="bg-slate-50 p-3 rounded-lg">{selectedPlano.acao_corretiva}</p>
              </div>

              {selectedPlano.anexos?.length > 0 && (
                <div>
                  <p className="text-sm text-slate-500 mb-2">Anexos</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedPlano.anexos.map((url, idx) => (
                      <a
                        key={idx}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-2 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Anexo {idx + 1}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}