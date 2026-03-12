import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { X, Save, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

const parametros = [
  { key: 'aspecto_visual', label: 'Aspecto Visual', tipo: 'select' },
  { key: 'largura', label: 'Largura', tipo: 'select' },
  { key: 'sanfona', label: 'Sanfona', tipo: 'select' },
  { key: 'tratamento_dinas', label: 'Tratamento Dinas', tipo: 'select' },
  { key: 'espessura', label: 'Espessura', tipo: 'range' },
  { key: 'peso', label: 'Peso (kg)', tipo: 'number_status' },
  { key: 'planicidade_curvatura', label: 'Planicidade e Curvatura', tipo: 'select' },
  { key: 'diametro_interno', label: 'Diâmetro Interno', tipo: 'select' },
  { key: 'encanoamento', label: 'Encanoamento', tipo: 'select' },
  { key: 'encolhimento_dm', label: 'Encolhimento DM', tipo: 'range' },
  { key: 'encolhimento_dt', label: 'Encolhimento DT', tipo: 'range' },
  { key: 'cof', label: 'COF', tipo: 'number_status' },
];

export default function BobinaForm({ onSave, onCancel, inspecaoId }) {
  const [formData, setFormData] = useState({
    numero_bobina: '',
    observacoes: ''
  });
  const [showPlanoAcao, setShowPlanoAcao] = useState(false);

  const handleChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const calcularStatusGeral = () => {
    const statusFields = [
      'aspecto_visual', 'largura', 'sanfona', 'tratamento_dinas',
      'espessura_status', 'peso_status', 'planicidade_curvatura',
      'diametro_interno', 'encanoamento', 'encolhimento_dm_status',
      'encolhimento_dt_status', 'cof_status'
    ];
    
    return statusFields.some(field => formData[field] === 'Não Conforme')
      ? 'Não Conforme'
      : 'Conforme';
  };

  const handleSubmit = () => {
    const statusGeral = calcularStatusGeral();
    onSave({
      ...formData,
      inspecao_id: inspecaoId,
      status_geral: statusGeral
    });
  };

  const renderParametro = (param) => {
    if (param.tipo === 'select') {
      return (
        <div key={param.key} className="space-y-2">
          <Label className="text-sm font-medium text-slate-700">{param.label}</Label>
          <Select
            value={formData[param.key] || ''}
            onValueChange={(value) => handleChange(param.key, value)}
          >
            <SelectTrigger className={cn(
              "border-slate-200",
              formData[param.key] === 'Não Conforme' && "border-red-300 bg-red-50"
            )}>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Conforme">✓ Conforme</SelectItem>
              <SelectItem value="Não Conforme">✗ Não Conforme</SelectItem>
            </SelectContent>
          </Select>
        </div>
      );
    }

    if (param.tipo === 'range') {
      return (
        <div key={param.key} className="space-y-2">
          <Label className="text-sm font-medium text-slate-700">{param.label}</Label>
          <div className="grid grid-cols-3 gap-2">
            <Input
              type="number"
              placeholder="Mín"
              value={formData[`${param.key}_min`] || ''}
              onChange={(e) => handleChange(`${param.key}_min`, parseFloat(e.target.value))}
              className="border-slate-200"
            />
            <Input
              type="number"
              placeholder="Máx"
              value={formData[`${param.key}_max`] || ''}
              onChange={(e) => handleChange(`${param.key}_max`, parseFloat(e.target.value))}
              className="border-slate-200"
            />
            <Select
              value={formData[`${param.key}_status`] || ''}
              onValueChange={(value) => handleChange(`${param.key}_status`, value)}
            >
              <SelectTrigger className={cn(
                "border-slate-200",
                formData[`${param.key}_status`] === 'Não Conforme' && "border-red-300 bg-red-50"
              )}>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Conforme">✓</SelectItem>
                <SelectItem value="Não Conforme">✗</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      );
    }

    if (param.tipo === 'number_status') {
      return (
        <div key={param.key} className="space-y-2">
          <Label className="text-sm font-medium text-slate-700">{param.label}</Label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              placeholder="Valor"
              value={formData[param.key] || ''}
              onChange={(e) => handleChange(param.key, parseFloat(e.target.value))}
              className="border-slate-200"
            />
            <Select
              value={formData[`${param.key}_status`] || ''}
              onValueChange={(value) => handleChange(`${param.key}_status`, value)}
            >
              <SelectTrigger className={cn(
                "border-slate-200",
                formData[`${param.key}_status`] === 'Não Conforme' && "border-red-300 bg-red-50"
              )}>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Conforme">✓ Conforme</SelectItem>
                <SelectItem value="Não Conforme">✗ Não Conforme</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      );
    }
  };

  return (
    <Card className="border-0 shadow-xl bg-white">
      <CardHeader className="border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold text-slate-800">
            Adicionar Bobina
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="h-5 w-5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Identificação */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">Número da Bobina *</Label>
            <Input
              value={formData.numero_bobina}
              onChange={(e) => handleChange('numero_bobina', e.target.value)}
              placeholder="Ex: BOB-001"
              className="border-slate-200"
            />
          </div>

          {/* Parâmetros de Avaliação */}
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-800 pb-2 border-b border-slate-100">
              Parâmetros de Avaliação
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {parametros.map(renderParametro)}
            </div>
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">Observações</Label>
            <Textarea
              value={formData.observacoes}
              onChange={(e) => handleChange('observacoes', e.target.value)}
              placeholder="Observações adicionais..."
              className="border-slate-200 min-h-[100px]"
            />
          </div>

          {/* Status Preview */}
          {Object.keys(formData).some(k => k.includes('status') || ['aspecto_visual', 'largura', 'sanfona', 'tratamento_dinas', 'planicidade_curvatura', 'diametro_interno', 'encanoamento'].includes(k)) && (
            <div className={cn(
              "p-4 rounded-xl flex items-center gap-3",
              calcularStatusGeral() === 'Conforme' 
                ? "bg-emerald-50 border border-emerald-200"
                : "bg-red-50 border border-red-200"
            )}>
              {calcularStatusGeral() === 'Não Conforme' && (
                <AlertTriangle className="h-5 w-5 text-red-500" />
              )}
              <div>
                <p className={cn(
                  "font-semibold",
                  calcularStatusGeral() === 'Conforme' ? "text-emerald-700" : "text-red-700"
                )}>
                  Status Geral: {calcularStatusGeral()}
                </p>
                {calcularStatusGeral() === 'Não Conforme' && (
                  <p className="text-sm text-red-600 mt-1">
                    Será necessário criar um plano de ação
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={onCancel} className="flex-1">
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!formData.numero_bobina}
              className="flex-1 bg-blue-500 hover:bg-blue-600"
            >
              <Save className="h-4 w-4 mr-2" />
              Salvar Bobina
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}