import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Calendar,
  User,
  Factory,
  Package,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ClipboardList
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
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function Inspecoes() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [filterTurno, setFilterTurno] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showNewModal, setShowNewModal] = useState(false);
  const [newInspecao, setNewInspecao] = useState({
    data: format(new Date(), 'yyyy-MM-dd'),
    hora_analise: format(new Date(), 'HH:mm'),
    turno: '',
    op: '',
    cliente: '',
    produto: '',
    maquina: ''
  });

  const { data: inspecoes = [], isLoading } = useQuery({
    queryKey: ['inspecoes'],
    queryFn: () => base44.entities.Inspecao.list('-created_date', 500)
  });

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Inspecao.create(data),
    onSuccess: (newInsp) => {
      queryClient.invalidateQueries({ queryKey: ['inspecoes'] });
      setShowNewModal(false);
      navigate(createPageUrl(`NovaInspecao?id=${newInsp.id}`));
    }
  });

  const filteredInspecoes = inspecoes.filter(insp => {
    const matchSearch = 
      insp.op?.toLowerCase().includes(search.toLowerCase()) ||
      insp.cliente?.toLowerCase().includes(search.toLowerCase()) ||
      insp.produto?.toLowerCase().includes(search.toLowerCase()) ||
      insp.maquina?.toLowerCase().includes(search.toLowerCase());
    const matchTurno = filterTurno === 'all' || insp.turno === filterTurno;
    const matchStatus = filterStatus === 'all' || insp.status === filterStatus;
    return matchSearch && matchTurno && matchStatus;
  });

  const handleCreate = () => {
    createMutation.mutate({
      ...newInspecao,
      auditor: user?.email,
      status: 'Em andamento'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Finalizada': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Em andamento': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Pendente': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">Inspeções</h1>
          <p className="text-slate-500 mt-1">Gerencie todas as inspeções de qualidade</p>
        </div>
        <Button 
          onClick={() => setShowNewModal(true)}
          className="bg-blue-500 hover:bg-blue-600 shadow-lg shadow-blue-500/25"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Inspeção
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-lg shadow-slate-200/50 bg-white/80 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar por OP, cliente, produto ou máquina..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 border-slate-200"
              />
            </div>
            <Select value={filterTurno} onValueChange={setFilterTurno}>
              <SelectTrigger className="w-full lg:w-40 border-slate-200">
                <SelectValue placeholder="Turno" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os turnos</SelectItem>
                <SelectItem value="Manhã">Manhã</SelectItem>
                <SelectItem value="Tarde">Tarde</SelectItem>
                <SelectItem value="Noite">Noite</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full lg:w-44 border-slate-200">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="Em andamento">Em andamento</SelectItem>
                <SelectItem value="Finalizada">Finalizada</SelectItem>
                <SelectItem value="Pendente">Pendente</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Inspections List */}
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
          ) : filteredInspecoes.length === 0 ? (
            <Card className="border-0 shadow-lg">
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                  <ClipboardList className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-700">Nenhuma inspeção encontrada</h3>
                <p className="text-slate-500 mt-1">Crie uma nova inspeção para começar</p>
              </CardContent>
            </Card>
          ) : (
            filteredInspecoes.map((insp, index) => (
              <motion.div
                key={insp.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="border-0 shadow-lg shadow-slate-200/50 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 cursor-pointer group"
                  onClick={() => navigate(createPageUrl(`NovaInspecao?id=${insp.id}`))}
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <Badge className={cn("border", getStatusColor(insp.status))}>
                            {insp.status}
                          </Badge>
                          <Badge variant="outline" className="border-slate-200">
                            <Clock className="h-3 w-3 mr-1" />
                            {insp.turno}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-slate-400" />
                            <span className="text-sm text-slate-600">
                              {insp.data && format(new Date(insp.data), "dd/MM/yyyy")}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-slate-400" />
                            <span className="text-sm text-slate-600 truncate">OP: {insp.op}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-slate-400" />
                            <span className="text-sm text-slate-600 truncate">{insp.cliente}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Factory className="h-4 w-4 text-slate-400" />
                            <span className="text-sm text-slate-600 truncate">{insp.maquina}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="flex items-center gap-2 justify-end">
                            {insp.bobinas_nao_conformes > 0 ? (
                              <AlertTriangle className="h-4 w-4 text-red-500" />
                            ) : (
                              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            )}
                            <span className="font-semibold text-slate-800">
                              {insp.total_bobinas || 0} bobinas
                            </span>
                          </div>
                          <p className="text-sm text-slate-500">
                            {insp.bobinas_nao_conformes || 0} não conformes
                          </p>
                        </div>
                        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* New Inspection Modal */}
      <Dialog open={showNewModal} onOpenChange={setShowNewModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Nova Inspeção</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data *</Label>
                <Input
                  type="date"
                  value={newInspecao.data}
                  onChange={(e) => setNewInspecao({ ...newInspecao, data: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Hora da Análise *</Label>
                <Input
                  type="time"
                  value={newInspecao.hora_analise}
                  onChange={(e) => setNewInspecao({ ...newInspecao, hora_analise: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Turno *</Label>
              <Select 
                value={newInspecao.turno} 
                onValueChange={(v) => setNewInspecao({ ...newInspecao, turno: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o turno" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Manhã">Manhã</SelectItem>
                  <SelectItem value="Tarde">Tarde</SelectItem>
                  <SelectItem value="Noite">Noite</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Ordem de Produção (OP) *</Label>
              <Input
                value={newInspecao.op}
                onChange={(e) => setNewInspecao({ ...newInspecao, op: e.target.value })}
                placeholder="Ex: OP-2024-001"
              />
            </div>
            <div className="space-y-2">
              <Label>Cliente *</Label>
              <Input
                value={newInspecao.cliente}
                onChange={(e) => setNewInspecao({ ...newInspecao, cliente: e.target.value })}
                placeholder="Nome do cliente"
              />
            </div>
            <div className="space-y-2">
              <Label>Produto *</Label>
              <Input
                value={newInspecao.produto}
                onChange={(e) => setNewInspecao({ ...newInspecao, produto: e.target.value })}
                placeholder="Nome do produto"
              />
            </div>
            <div className="space-y-2">
              <Label>Máquina *</Label>
              <Input
                value={newInspecao.maquina}
                onChange={(e) => setNewInspecao({ ...newInspecao, maquina: e.target.value })}
                placeholder="Ex: MAQ-01"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setShowNewModal(false)}>
              Cancelar
            </Button>
            <Button 
              className="flex-1 bg-blue-500 hover:bg-blue-600"
              onClick={handleCreate}
              disabled={!newInspecao.turno || !newInspecao.op || !newInspecao.cliente || !newInspecao.produto || !newInspecao.maquina || createMutation.isPending}
            >
              {createMutation.isPending ? 'Criando...' : 'Criar Inspeção'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}