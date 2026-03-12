import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Save, X } from 'lucide-react';

const camposInspecao = [
  { key: 'aspecto_visual', label: 'Aspecto Visual' },
  { key: 'largura', label: 'Largura' },
  { key: 'sanfona', label: 'Sanfona' },
  { key: 'tratamento_dinas', label: 'Tratamento Dinas' },
  { key: 'planicidade_curvatura', label: 'Planicidade/Curvatura' },
  { key: 'diametro_interno', label: 'Diâmetro Interno' },
  { key: 'encanoamento', label: 'Encanoamento' },
];

const defaultForm = {
  codigo: '', nome: '', descricao: '', ativo: true,
  cof_min: '', cof_max: '',
  peso_min: '', peso_max: '',
  espessura_min: '', espessura_max: '',
  encolhimento_dm_min: '', encolhimento_dm_max: '',
  encolhimento_dt_min: '', encolhimento_dt_max: '',
  aspecto_visual: true, largura: true, sanfona: true, tratamento_dinas: true,
  planicidade_curvatura: true, diametro_interno: true, encanoamento: true,
};

export default function ProdutoForm({ initial, onSave, onCancel, isPending }) {
  const [form, setForm] = useState(initial ? {
    ...defaultForm,
    ...initial,
    cof_min: initial.cof_min ?? '',
    cof_max: initial.cof_max ?? '',
    peso_min: initial.peso_min ?? '',
    peso_max: initial.peso_max ?? '',
    espessura_min: initial.espessura_min ?? '',
    espessura_max: initial.espessura_max ?? '',
    encolhimento_dm_min: initial.encolhimento_dm_min ?? '',
    encolhimento_dm_max: initial.encolhimento_dm_max ?? '',
    encolhimento_dt_min: initial.encolhimento_dt_min ?? '',
    encolhimento_dt_max: initial.encolhimento_dt_max ?? '',
  } : defaultForm);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const setNum = (k, v) => setForm(p => ({ ...p, [k]: v === '' ? '' : parseFloat(v) }));

  const handleSave = () => {
    const data = { ...form };
    ['cof_min','cof_max','peso_min','peso_max','espessura_min','espessura_max',
     'encolhimento_dm_min','encolhimento_dm_max','encolhimento_dt_min','encolhimento_dt_max'
    ].forEach(k => { if (data[k] === '') delete data[k]; });
    onSave(data);
  };

  return (
    <div className="space-y-6">
      {/* Identificação */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label>Código *</Label>
          <Input value={form.codigo} onChange={e => set('codigo', e.target.value)} placeholder="LCS5004070" />
        </div>
        <div className="space-y-1">
          <Label>Nome *</Label>
          <Input value={form.nome} onChange={e => set('nome', e.target.value)} placeholder="Nome do produto" />
        </div>
      </div>
      <div className="space-y-1">
        <Label>Descrição</Label>
        <Textarea value={form.descricao} onChange={e => set('descricao', e.target.value)} placeholder="Descrição..." className="min-h-[60px]" />
      </div>

      {/* Limites Numéricos */}
      <div>
        <h4 className="font-semibold text-slate-700 mb-3 text-sm uppercase tracking-wide">Especificações (Limites)</h4>
        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
          {[
            { label: 'COF', min: 'cof_min', max: 'cof_max' },
            { label: 'Peso (kg)', min: 'peso_min', max: 'peso_max' },
            { label: 'Espessura (µm)', min: 'espessura_min', max: 'espessura_max' },
            { label: 'Encolhimento DM (%)', min: 'encolhimento_dm_min', max: 'encolhimento_dm_max' },
            { label: 'Encolhimento DT (%)', min: 'encolhimento_dt_min', max: 'encolhimento_dt_max' },
          ].map(({ label, min, max }) => (
            <div key={min} className="space-y-1">
              <Label className="text-xs text-slate-600">{label}</Label>
              <div className="flex gap-2 items-center">
                <Input type="number" placeholder="Mín" value={form[min]} onChange={e => setNum(min, e.target.value)} className="h-8 text-sm" />
                <span className="text-slate-400 text-xs">a</span>
                <Input type="number" placeholder="Máx" value={form[max]} onChange={e => setNum(max, e.target.value)} className="h-8 text-sm" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Campos de inspeção habilitados */}
      <div>
        <h4 className="font-semibold text-slate-700 mb-3 text-sm uppercase tracking-wide">Itens de Inspeção</h4>
        <div className="grid grid-cols-2 gap-2">
          {camposInspecao.map(({ key, label }) => (
            <div key={key} className="flex items-center gap-2">
              <Switch checked={!!form[key]} onCheckedChange={v => set(key, v)} />
              <Label className="text-sm">{label}</Label>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Switch checked={form.ativo} onCheckedChange={v => set('ativo', v)} />
        <Label>Produto ativo</Label>
      </div>

      <div className="flex gap-3 pt-2 border-t border-slate-100">
        <Button variant="outline" className="flex-1" onClick={onCancel}>
          <X className="h-4 w-4 mr-1" /> Cancelar
        </Button>
        <Button className="flex-1 bg-blue-500 hover:bg-blue-600" onClick={handleSave} disabled={!form.codigo || !form.nome || isPending}>
          <Save className="h-4 w-4 mr-1" /> Salvar
        </Button>
      </div>
    </div>
  );
}