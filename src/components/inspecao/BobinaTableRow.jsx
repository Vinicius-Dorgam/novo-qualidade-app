import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Save, Trash2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { cn } from "@/lib/utils";

// Todos os parâmetros de inspeção de uma bobina
const selectFields = [
  { key: 'aspecto_visual', label: 'Asp. Visual' },
  { key: 'largura', label: 'Largura' },
  { key: 'sanfona', label: 'Sanfona' },
  { key: 'tratamento_dinas', label: 'Trat. Dinas' },
  { key: 'planicidade_curvatura', label: 'Planicidade' },
  { key: 'diametro_interno', label: 'Diâm. Interno' },
  { key: 'encanoamento', label: 'Encanoamento' },
];

function autoStatus(value, min, max) {
  if (value === '' || value === undefined || value === null) return '';
  const v = parseFloat(value);
  if (isNaN(v)) return '';
  const hasMin = min !== '' && min !== undefined && min !== null;
  const hasMax = max !== '' && max !== undefined && max !== null;
  if (!hasMin && !hasMax) return '';
  if (hasMin && v < parseFloat(min)) return 'Não Conforme';
  if (hasMax && v > parseFloat(max)) return 'Não Conforme';
  return 'Conforme';
}

export default function BobinaTableRow({ inspecaoId, produto, onSave, onCancel, isSaving }) {
  const [form, setForm] = useState({ numero_bobina: '', observacoes: '' });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  // Auto classificar COF quando valor muda
  useEffect(() => {
    if (produto && form.cof !== undefined && form.cof !== '') {
      const st = autoStatus(form.cof, produto.cof_min, produto.cof_max);
      if (st) setForm(p => ({ ...p, cof_status: st }));
    }
  }, [form.cof, produto]);

  // Auto classificar Peso
  useEffect(() => {
    if (produto && form.peso !== undefined && form.peso !== '') {
      const st = autoStatus(form.peso, produto.peso_min, produto.peso_max);
      if (st) setForm(p => ({ ...p, peso_status: st }));
    }
  }, [form.peso, produto]);

  // Auto classificar Espessura min/max
  useEffect(() => {
    if (produto && (form.espessura_min !== undefined || form.espessura_max !== undefined)) {
      const val = form.espessura_min ?? form.espessura_max;
      if (val !== '' && val !== undefined) {
        const st = autoStatus(val, produto.espessura_min, produto.espessura_max);
        if (st) setForm(p => ({ ...p, espessura_status: st }));
      }
    }
  }, [form.espessura_min, form.espessura_max, produto]);

  // Auto classificar Encolhimento DM
  useEffect(() => {
    if (produto && form.encolhimento_dm_min !== undefined && form.encolhimento_dm_min !== '') {
      const st = autoStatus(form.encolhimento_dm_min, produto.encolhimento_dm_min, produto.encolhimento_dm_max);
      if (st) setForm(p => ({ ...p, encolhimento_dm_status: st }));
    }
  }, [form.encolhimento_dm_min, form.encolhimento_dm_max, produto]);

  // Auto classificar Encolhimento DT
  useEffect(() => {
    if (produto && form.encolhimento_dt_min !== undefined && form.encolhimento_dt_min !== '') {
      const st = autoStatus(form.encolhimento_dt_min, produto.encolhimento_dt_min, produto.encolhimento_dt_max);
      if (st) setForm(p => ({ ...p, encolhimento_dt_status: st }));
    }
  }, [form.encolhimento_dt_min, form.encolhimento_dt_max, produto]);

  const calcularStatusGeral = () => {
    const statusFields = [
      'aspecto_visual', 'largura', 'sanfona', 'tratamento_dinas',
      'espessura_status', 'peso_status', 'planicidade_curvatura',
      'diametro_interno', 'encanoamento', 'encolhimento_dm_status',
      'encolhimento_dt_status', 'cof_status'
    ];
    return statusFields.some(f => form[f] === 'Não Conforme') ? 'Não Conforme' : 'Conforme';
  };

  const handleSave = () => {
    onSave({ ...form, inspecao_id: inspecaoId, status_geral: calcularStatusGeral() });
  };

  const statusGeral = calcularStatusGeral();
  const hasData = Object.keys(form).some(k => k !== 'numero_bobina' && k !== 'observacoes' && form[k] !== '' && form[k] !== undefined);

  const enabledSelects = selectFields.filter(f => !produto || produto[f.key] !== false);

  return (
    <tr className="bg-blue-50/60">
      {/* Nº Bobina */}
      <td className="px-3 py-2 min-w-[110px]">
        <Input
          value={form.numero_bobina}
          onChange={e => set('numero_bobina', e.target.value)}
          placeholder="BOB-001"
          className="h-8 text-sm border-slate-300"
          autoFocus
        />
      </td>

      {/* Campos select */}
      {enabledSelects.map(({ key, label }) => (
        <td key={key} className="px-2 py-2 min-w-[110px]">
          <Select value={form[key] || ''} onValueChange={v => set(key, v)}>
            <SelectTrigger className={cn("h-8 text-xs", form[key] === 'Não Conforme' && "border-red-400 bg-red-50")}>
              <SelectValue placeholder="-" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Conforme">✓ C</SelectItem>
              <SelectItem value="Não Conforme">✗ NC</SelectItem>
            </SelectContent>
          </Select>
        </td>
      ))}

      {/* Espessura min/max/status */}
      <td className="px-2 py-2 min-w-[180px]">
        <div className="flex gap-1 items-center">
          <Input type="number" placeholder="Mín" value={form.espessura_min ?? ''} onChange={e => set('espessura_min', e.target.value === '' ? '' : parseFloat(e.target.value))} className="h-8 text-xs w-16 border-slate-300" />
          <Input type="number" placeholder="Máx" value={form.espessura_max ?? ''} onChange={e => set('espessura_max', e.target.value === '' ? '' : parseFloat(e.target.value))} className="h-8 text-xs w-16 border-slate-300" />
          <Select value={form.espessura_status || ''} onValueChange={v => set('espessura_status', v)}>
            <SelectTrigger className={cn("h-8 text-xs w-14", form.espessura_status === 'Não Conforme' && "border-red-400 bg-red-50")}>
              <SelectValue placeholder="-" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Conforme">✓</SelectItem>
              <SelectItem value="Não Conforme">✗</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </td>

      {/* Peso */}
      <td className="px-2 py-2 min-w-[140px]">
        <div className="flex gap-1 items-center">
          <Input type="number" placeholder="kg" value={form.peso ?? ''} onChange={e => set('peso', e.target.value === '' ? '' : parseFloat(e.target.value))} className="h-8 text-xs w-20 border-slate-300" />
          <Select value={form.peso_status || ''} onValueChange={v => set('peso_status', v)}>
            <SelectTrigger className={cn("h-8 text-xs w-14", form.peso_status === 'Não Conforme' && "border-red-400 bg-red-50")}>
              <SelectValue placeholder="-" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Conforme">✓</SelectItem>
              <SelectItem value="Não Conforme">✗</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </td>

      {/* Encolhimento DM */}
      <td className="px-2 py-2 min-w-[160px]">
        <div className="flex gap-1 items-center">
          <Input type="number" placeholder="Mín" value={form.encolhimento_dm_min ?? ''} onChange={e => set('encolhimento_dm_min', e.target.value === '' ? '' : parseFloat(e.target.value))} className="h-8 text-xs w-16 border-slate-300" />
          <Input type="number" placeholder="Máx" value={form.encolhimento_dm_max ?? ''} onChange={e => set('encolhimento_dm_max', e.target.value === '' ? '' : parseFloat(e.target.value))} className="h-8 text-xs w-16 border-slate-300" />
          <Select value={form.encolhimento_dm_status || ''} onValueChange={v => set('encolhimento_dm_status', v)}>
            <SelectTrigger className={cn("h-8 text-xs w-14", form.encolhimento_dm_status === 'Não Conforme' && "border-red-400 bg-red-50")}>
              <SelectValue placeholder="-" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Conforme">✓</SelectItem>
              <SelectItem value="Não Conforme">✗</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </td>

      {/* Encolhimento DT */}
      <td className="px-2 py-2 min-w-[160px]">
        <div className="flex gap-1 items-center">
          <Input type="number" placeholder="Mín" value={form.encolhimento_dt_min ?? ''} onChange={e => set('encolhimento_dt_min', e.target.value === '' ? '' : parseFloat(e.target.value))} className="h-8 text-xs w-16 border-slate-300" />
          <Input type="number" placeholder="Máx" value={form.encolhimento_dt_max ?? ''} onChange={e => set('encolhimento_dt_max', e.target.value === '' ? '' : parseFloat(e.target.value))} className="h-8 text-xs w-16 border-slate-300" />
          <Select value={form.encolhimento_dt_status || ''} onValueChange={v => set('encolhimento_dt_status', v)}>
            <SelectTrigger className={cn("h-8 text-xs w-14", form.encolhimento_dt_status === 'Não Conforme' && "border-red-400 bg-red-50")}>
              <SelectValue placeholder="-" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Conforme">✓</SelectItem>
              <SelectItem value="Não Conforme">✗</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </td>

      {/* COF */}
      <td className="px-2 py-2 min-w-[130px]">
        <div className="flex gap-1 items-center">
          <Input type="number" placeholder="COF" value={form.cof ?? ''} onChange={e => set('cof', e.target.value === '' ? '' : parseFloat(e.target.value))} className="h-8 text-xs w-20 border-slate-300" />
          <Select value={form.cof_status || ''} onValueChange={v => set('cof_status', v)}>
            <SelectTrigger className={cn("h-8 text-xs w-14", form.cof_status === 'Não Conforme' && "border-red-400 bg-red-50")}>
              <SelectValue placeholder="-" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Conforme">✓</SelectItem>
              <SelectItem value="Não Conforme">✗</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </td>

      {/* Status Geral + Ações */}
      <td className="px-3 py-2 min-w-[120px]">
        {hasData && (
          <span className={cn(
            "inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full",
            statusGeral === 'Conforme' ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
          )}>
            {statusGeral === 'Conforme' ? <CheckCircle2 className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
            {statusGeral === 'Conforme' ? 'C' : 'NC'}
          </span>
        )}
      </td>

      <td className="px-3 py-2">
        <div className="flex gap-1">
          <Button size="sm" className="h-8 bg-blue-500 hover:bg-blue-600 px-2" onClick={handleSave} disabled={!form.numero_bobina || isSaving}>
            <Save className="h-3 w-3" />
          </Button>
          <Button size="sm" variant="ghost" className="h-8 px-2 text-slate-400 hover:text-red-500" onClick={onCancel}>
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </td>
    </tr>
  );
}