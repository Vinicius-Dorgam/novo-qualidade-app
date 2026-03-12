import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { X, Save, Upload, FileText } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function PlanoAcaoForm({ bobina, inspecaoId, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    descricao_nao_conformidade: '',
    causa_raiz: '',
    acao_corretiva: '',
    responsavel: '',
    prazo: '',
    anexos: []
  });
  const [uploading, setUploading] = useState(false);

  const handleChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files.length) return;

    setUploading(true);
    const newAnexos = [...formData.anexos];

    for (const file of files) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      newAnexos.push(file_url);
    }

    setFormData(prev => ({ ...prev, anexos: newAnexos }));
    setUploading(false);
  };

  const handleSubmit = () => {
    onSave({
      ...formData,
      bobina_id: bobina.id,
      inspecao_id: inspecaoId,
      status: 'Pendente'
    });
  };

  return (
    <Card className="border-0 shadow-xl bg-white">
      <CardHeader className="border-b border-slate-100 bg-red-50">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-semibold text-red-800">
              Plano de Ação - Não Conformidade
            </CardTitle>
            <p className="text-sm text-red-600 mt-1">
              Bobina: {bobina.numero_bobina}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="h-5 w-5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">Descrição da Não Conformidade *</Label>
            <Textarea
              value={formData.descricao_nao_conformidade}
              onChange={(e) => handleChange('descricao_nao_conformidade', e.target.value)}
              placeholder="Descreva detalhadamente a não conformidade identificada..."
              className="border-slate-200 min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">Análise da Causa Raiz</Label>
            <Textarea
              value={formData.causa_raiz}
              onChange={(e) => handleChange('causa_raiz', e.target.value)}
              placeholder="Qual a causa raiz do problema identificado?"
              className="border-slate-200 min-h-[80px]"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">Ação Corretiva *</Label>
            <Textarea
              value={formData.acao_corretiva}
              onChange={(e) => handleChange('acao_corretiva', e.target.value)}
              placeholder="Descreva a ação corretiva proposta..."
              className="border-slate-200 min-h-[100px]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">Responsável *</Label>
              <Input
                value={formData.responsavel}
                onChange={(e) => handleChange('responsavel', e.target.value)}
                placeholder="Nome do responsável"
                className="border-slate-200"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-700">Prazo *</Label>
              <Input
                type="date"
                value={formData.prazo}
                onChange={(e) => handleChange('prazo', e.target.value)}
                className="border-slate-200"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">Anexos</Label>
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-blue-400 transition-colors">
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm text-slate-600">
                  {uploading ? 'Enviando...' : 'Clique para adicionar arquivos'}
                </p>
              </label>
            </div>
            {formData.anexos.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.anexos.map((url, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-full text-sm">
                    <FileText className="h-4 w-4 text-slate-500" />
                    <span className="text-slate-600">Anexo {idx + 1}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={onCancel} className="flex-1">
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!formData.descricao_nao_conformidade || !formData.acao_corretiva || !formData.responsavel || !formData.prazo}
              className="flex-1 bg-red-500 hover:bg-red-600"
            >
              <Save className="h-4 w-4 mr-2" />
              Salvar Plano de Ação
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}