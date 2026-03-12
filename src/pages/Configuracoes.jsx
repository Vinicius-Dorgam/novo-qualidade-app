import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Edit2, FileText, Users, Layers, Package } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import ProdutoForm from '../components/configuracoes/ProdutoForm';

export default function Configuracoes() {
  const queryClient = useQueryClient();
  const [showNewTipo, setShowNewTipo] = useState(false);
  const [editingTipo, setEditingTipo] = useState(null);
  const [newTipo, setNewTipo] = useState({ nome: '', descricao: '', ativo: true });
  const [showNewProduto, setShowNewProduto] = useState(false);
  const [editingProduto, setEditingProduto] = useState(null);

  const { data: tiposInspecao = [] } = useQuery({
    queryKey: ['tipos-inspecao'],
    queryFn: () => base44.entities.TipoInspecao.list()
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list()
  });

  const { data: produtos = [] } = useQuery({
    queryKey: ['produtos'],
    queryFn: () => base44.entities.Produto.list()
  });

  const createTipoMutation = useMutation({
    mutationFn: (data) => base44.entities.TipoInspecao.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tipos-inspecao'] });
      setShowNewTipo(false);
      setNewTipo({ nome: '', descricao: '', ativo: true });
    }
  });

  const updateTipoMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.TipoInspecao.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tipos-inspecao'] });
      setEditingTipo(null);
    }
  });

  const deleteTipoMutation = useMutation({
    mutationFn: (id) => base44.entities.TipoInspecao.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tipos-inspecao'] })
  });

  const createProdutoMutation = useMutation({
    mutationFn: (data) => base44.entities.Produto.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['produtos'] });
      setShowNewProduto(false);
    }
  });

  const updateProdutoMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Produto.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['produtos'] });
      setEditingProduto(null);
    }
  });

  const deleteProdutoMutation = useMutation({
    mutationFn: (id) => base44.entities.Produto.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['produtos'] })
  });

  return (
    <div className="space-y-6 pb-24 lg:pb-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-800">Configurações</h1>
        <p className="text-slate-500 mt-1">Gerencie produtos, tipos de inspeção e auditores</p>
      </div>

      <Tabs defaultValue="produtos" className="space-y-6">
        <TabsList className="bg-white/80 border border-slate-200 p-1">
          <TabsTrigger value="produtos" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
            <Package className="h-4 w-4 mr-2" />
            Produtos
          </TabsTrigger>
          <TabsTrigger value="tipos" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
            <Layers className="h-4 w-4 mr-2" />
            Tipos de Inspeção
          </TabsTrigger>
          <TabsTrigger value="auditores" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
            <Users className="h-4 w-4 mr-2" />
            Auditores
          </TabsTrigger>
        </TabsList>

        {/* Produtos */}
        <TabsContent value="produtos" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-slate-800">Produtos Cadastrados</h2>
            <Button onClick={() => setShowNewProduto(true)} className="bg-blue-500 hover:bg-blue-600">
              <Plus className="h-4 w-4 mr-2" />
              Novo Produto
            </Button>
          </div>

          <div className="grid gap-4">
            <AnimatePresence>
              {produtos.length === 0 ? (
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                      <Package className="h-8 w-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-700">Nenhum produto cadastrado</h3>
                    <p className="text-slate-500 mt-1">Cadastre produtos com suas especificações para classificação automática</p>
                  </CardContent>
                </Card>
              ) : (
                produtos.map((produto, index) => (
                  <motion.div key={produto.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                    <Card className="border-0 shadow-lg shadow-slate-200/50 bg-white/80">
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-4 flex-1 min-w-0">
                            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0", produto.ativo ? "bg-blue-100" : "bg-slate-100")}>
                              <Package className={cn("h-5 w-5", produto.ativo ? "text-blue-600" : "text-slate-400")} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-semibold text-slate-800">{produto.nome}</h3>
                                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">{produto.codigo}</span>
                                {!produto.ativo && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded">Inativo</span>}
                              </div>
                              <div className="flex flex-wrap gap-3 mt-2 text-xs text-slate-500">
                                {produto.cof_min != null && <span>COF: <strong>{produto.cof_min}–{produto.cof_max}</strong></span>}
                                {produto.peso_min != null && <span>Peso: <strong>{produto.peso_min}–{produto.peso_max} kg</strong></span>}
                                {produto.espessura_min != null && <span>Espessura: <strong>{produto.espessura_min}–{produto.espessura_max} µm</strong></span>}
                                {produto.encolhimento_dm_min != null && <span>Enc.DM: <strong>{produto.encolhimento_dm_min}–{produto.encolhimento_dm_max}%</strong></span>}
                                {produto.encolhimento_dt_min != null && <span>Enc.DT: <strong>{produto.encolhimento_dt_min}–{produto.encolhimento_dt_max}%</strong></span>}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <Button variant="ghost" size="icon" onClick={() => setEditingProduto(produto)}>
                              <Edit2 className="h-4 w-4 text-slate-500" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => deleteProdutoMutation.mutate(produto.id)}>
                              <Trash2 className="h-4 w-4 text-red-500" />
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
        </TabsContent>

        {/* Tipos de Inspeção */}
        <TabsContent value="tipos" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-slate-800">Tipos de Inspeção Cadastrados</h2>
            <Button onClick={() => setShowNewTipo(true)} className="bg-blue-500 hover:bg-blue-600">
              <Plus className="h-4 w-4 mr-2" />
              Novo Tipo
            </Button>
          </div>
          <div className="grid gap-4">
            <AnimatePresence>
              {tiposInspecao.length === 0 ? (
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                      <FileText className="h-8 w-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-700">Nenhum tipo cadastrado</h3>
                    <p className="text-slate-500 mt-1">Crie tipos de inspeção personalizados</p>
                  </CardContent>
                </Card>
              ) : (
                tiposInspecao.map((tipo, index) => (
                  <motion.div key={tipo.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                    <Card className="border-0 shadow-lg shadow-slate-200/50 bg-white/80">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", tipo.ativo ? "bg-emerald-100" : "bg-slate-100")}>
                              <FileText className={cn("h-5 w-5", tipo.ativo ? "text-emerald-600" : "text-slate-400")} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-slate-800">{tipo.nome}</h3>
                                {!tipo.ativo && <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded">Inativo</span>}
                              </div>
                              <p className="text-sm text-slate-500">{tipo.descricao || 'Sem descrição'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" onClick={() => setEditingTipo(tipo)}>
                              <Edit2 className="h-4 w-4 text-slate-500" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => deleteTipoMutation.mutate(tipo.id)}>
                              <Trash2 className="h-4 w-4 text-red-500" />
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
        </TabsContent>

        {/* Auditores */}
        <TabsContent value="auditores" className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-800">Auditores do Sistema</h2>
          <div className="grid gap-4">
            {users.length === 0 ? (
              <Card className="border-0 shadow-lg">
                <CardContent className="p-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-700">Nenhum auditor encontrado</h3>
                  <p className="text-slate-500 mt-1">Convide auditores através das configurações do app</p>
                </CardContent>
              </Card>
            ) : (
              users.map((user, index) => (
                <motion.div key={user.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                  <Card className="border-0 shadow-lg shadow-slate-200/50 bg-white/80">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-lg">
                          {user.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-800">{user.full_name || 'Sem nome'}</h3>
                          <p className="text-sm text-slate-500">{user.email}</p>
                        </div>
                        <div className="ml-auto">
                          <span className={cn("px-3 py-1 rounded-full text-xs font-medium", user.role === 'admin' ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700")}>
                            {user.role === 'admin' ? 'Administrador' : 'Auditor'}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal Novo Produto */}
      <Dialog open={showNewProduto} onOpenChange={setShowNewProduto}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo Produto</DialogTitle>
          </DialogHeader>
          <ProdutoForm
            onSave={(data) => createProdutoMutation.mutate(data)}
            onCancel={() => setShowNewProduto(false)}
            isPending={createProdutoMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Modal Editar Produto */}
      <Dialog open={!!editingProduto} onOpenChange={() => setEditingProduto(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Produto</DialogTitle>
          </DialogHeader>
          {editingProduto && (
            <ProdutoForm
              initial={editingProduto}
              onSave={(data) => updateProdutoMutation.mutate({ id: editingProduto.id, data })}
              onCancel={() => setEditingProduto(null)}
              isPending={updateProdutoMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Modal Novo Tipo */}
      <Dialog open={showNewTipo} onOpenChange={setShowNewTipo}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Tipo de Inspeção</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome *</Label>
              <Input value={newTipo.nome} onChange={(e) => setNewTipo({ ...newTipo, nome: e.target.value })} placeholder="Ex: Inspeção de Embalagem" />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea value={newTipo.descricao} onChange={(e) => setNewTipo({ ...newTipo, descricao: e.target.value })} placeholder="Descreva este tipo de inspeção..." />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={newTipo.ativo} onCheckedChange={(checked) => setNewTipo({ ...newTipo, ativo: checked })} />
              <Label>Ativo</Label>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setShowNewTipo(false)}>Cancelar</Button>
            <Button className="flex-1 bg-blue-500 hover:bg-blue-600" onClick={() => createTipoMutation.mutate(newTipo)} disabled={!newTipo.nome || createTipoMutation.isPending}>
              Criar Tipo
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Editar Tipo */}
      <Dialog open={!!editingTipo} onOpenChange={() => setEditingTipo(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Tipo de Inspeção</DialogTitle>
          </DialogHeader>
          {editingTipo && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Nome *</Label>
                <Input value={editingTipo.nome} onChange={(e) => setEditingTipo({ ...editingTipo, nome: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea value={editingTipo.descricao || ''} onChange={(e) => setEditingTipo({ ...editingTipo, descricao: e.target.value })} />
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={editingTipo.ativo} onCheckedChange={(checked) => setEditingTipo({ ...editingTipo, ativo: checked })} />
                <Label>Ativo</Label>
              </div>
            </div>
          )}
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setEditingTipo(null)}>Cancelar</Button>
            <Button className="flex-1 bg-blue-500 hover:bg-blue-600"
              onClick={() => updateTipoMutation.mutate({ id: editingTipo.id, data: { nome: editingTipo.nome, descricao: editingTipo.descricao, ativo: editingTipo.ativo } })}
              disabled={!editingTipo?.nome || updateTipoMutation.isPending}>
              Salvar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}