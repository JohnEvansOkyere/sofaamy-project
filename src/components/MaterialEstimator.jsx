import { useState } from 'react';
import { parseProjectDescription } from '../utils/openaiClient';
import { calculateEstimate, GLASS_THICKNESSES_BY_TYPE } from '../utils/calculations';
import ResultsCard from './ResultsCard';

const PROJECT_TYPES = [
  'Shopfront', 'Windows', 'Partition', 'Balustrade', 'Security Door', 'Curtain Wall', 'Shower Enclosure',
];
const GLASS_TYPES = ['Clear Float', 'Tempered', 'Frosted', 'Tinted', 'Laminated', 'Reflective'];
const PROFILE_TYPES = [
  'None', 'Standard Window Frame', 'Curtain Wall Profile', 'Casement Frame', 'Sliding Door Track',
];

const initialForm = {
  projectType: '',
  quantity: 1,
  width: 0,
  height: 0,
  glassType: '',
  glassThickness: '',
  profileType: 'None',
  includeAlucobond: false,
  alucobondArea: 0,
  includeSecurityDoor: false,
  securityDoorQuantity: 0,
};

function normalizeGlassType(name) {
  if (!name) return '';
  const n = String(name).toLowerCase();
  return GLASS_TYPES.find((g) => n === g.toLowerCase() || n.includes(g.toLowerCase())) || '';
}

function normalizeThickness(t, glassType) {
  if (t == null || t === '') return '';
  const s = String(t).replace(/\s/g, '').toLowerCase();
  const withMm = s.endsWith('mm') ? s : `${s}mm`;
  const valid = (glassType && GLASS_THICKNESSES_BY_TYPE[glassType]) || [];
  return valid.includes(withMm) ? withMm : valid[0] || '';
}

export default function MaterialEstimator({ prefill, onClearPrefill }) {
  const [mode, setMode] = useState(prefill ? 'manual' : 'describe');
  const [describeText, setDescribeText] = useState('');
  const [form, setForm] = useState({
    ...initialForm,
    ...(prefill ? {
      projectType: prefill.projectType || '',
      glassType: prefill.glassType || '',
      glassThickness: prefill.glassThickness || '',
      profileType: prefill.profileType || 'None',
    } : {}),
  });
  const [parseLoading, setParseLoading] = useState(false);
  const [parseError, setParseError] = useState(null);
  const [parsedSummary, setParsedSummary] = useState(null);
  const [estimate, setEstimate] = useState(null);

  const handleParse = async () => {
    if (!describeText.trim()) return;
    setParseLoading(true);
    setParseError(null);
    setParsedSummary(null);
    try {
      const data = await parseProjectDescription(describeText.trim());
      const summary = [
        data.projectType && `Project: ${data.projectType}`,
        data.quantity != null && `Quantity: ${data.quantity}`,
        (data.width != null || data.height != null) && `Dimensions: ${data.width ?? 0}m × ${data.height ?? 0}m`,
        data.glassType && `Glass: ${data.glassType} ${data.glassThickness || ''}`,
        data.profileType && data.profileType !== 'None' && `Profile: ${data.profileType}`,
        data.includeAlucobond && `Alucobond: ${data.alucobondArea ?? 0} sqm`,
        data.includeSecurityDoor && `Security doors: ${data.securityDoorQuantity ?? 0}`,
      ].filter(Boolean).join(' · ');
      setParsedSummary(summary);
      setForm((f) => ({
        ...f,
        projectType: data.projectType || f.projectType,
        quantity: data.quantity ?? f.quantity,
        width: Number(data.width) || f.width,
        height: Number(data.height) || f.height,
        glassType: normalizeGlassType(data.glassType) || f.glassType,
        glassThickness: normalizeThickness(data.glassThickness, normalizeGlassType(data.glassType) || f.glassType) || f.glassThickness,
        profileType: data.profileType || 'None',
        includeAlucobond: !!data.includeAlucobond,
        alucobondArea: Number(data.alucobondArea) || 0,
        includeSecurityDoor: !!data.includeSecurityDoor,
        securityDoorQuantity: Number(data.securityDoorQuantity) || 0,
      }));
    } catch (err) {
      setParseError(err.message || 'Could not parse. Try manual entry instead.');
    } finally {
      setParseLoading(false);
    }
  };

  const [validationError, setValidationError] = useState(null);

  const handleCalculate = () => {
    setValidationError(null);
    const hasGlass = form.glassType && form.glassThickness;
    const hasDimensions = (form.width || 0) > 0 && (form.height || 0) > 0;

    if (hasGlass && !hasDimensions) {
      setValidationError('Please enter width (m) and height (m) to calculate your estimate.');
      return;
    }
    if (form.includeAlucobond && (!form.alucobondArea || form.alucobondArea <= 0)) {
      setValidationError('Please enter Alucobond area (sqm).');
      return;
    }
    if (form.includeSecurityDoor && (!form.securityDoorQuantity || form.securityDoorQuantity <= 0)) {
      setValidationError('Please enter security door quantity.');
      return;
    }

    const result = calculateEstimate(form);
    if (!result.lines?.length) {
      setValidationError('Please complete the required fields: glass type, thickness, width, and height.');
      return;
    }
    setEstimate(result);
  };

  const updateForm = (key, value) => {
    setForm((f) => {
      const next = { ...f, [key]: value };
      if (key === 'glassType') {
        const validThicknesses = GLASS_THICKNESSES_BY_TYPE[value] || [];
        if (!validThicknesses.includes(next.glassThickness)) {
          next.glassThickness = validThicknesses[0] || '';
        }
      }
      return next;
    });
    setEstimate(null);
  };

  const resetForm = () => {
    setForm({ ...initialForm });
    setEstimate(null);
    setParsedSummary(null);
    setParseError(null);
    setDescribeText('');
    onClearPrefill?.();
  };

  return (
    <div className="tab-content max-w-3xl mx-auto px-4 py-6 sm:py-8">
      <div className="flex flex-wrap items-center gap-3 mb-6 p-3 rounded-xl bg-white border border-primary/10 shadow-sm">
        <span className="text-sm font-medium text-charcoal/80">Input mode:</span>
        <div className="flex rounded-lg border-2 border-primary/20 overflow-hidden">
          <button
            type="button"
            onClick={() => { setMode('describe'); setEstimate(null); }}
            className={`px-4 py-2.5 text-sm font-medium transition-all ${mode === 'describe' ? 'bg-primary text-white' : 'bg-background text-charcoal/80 hover:bg-primary/5'}`}
          >
            Describe Your Project
          </button>
          <button
            type="button"
            onClick={() => { setMode('manual'); setEstimate(null); }}
            className={`px-4 py-2.5 text-sm font-medium transition-all ${mode === 'manual' ? 'bg-primary text-white' : 'bg-background text-charcoal/80 hover:bg-primary/5'}`}
          >
            Manual Entry
          </button>
        </div>
      </div>

      {mode === 'describe' && (
        <div className="space-y-4 mb-8">
          <textarea
            value={describeText}
            onChange={(e) => setDescribeText(e.target.value)}
            placeholder="E.g. I need glass panels for a shop front, 6 meters wide by 3 meters high, tempered glass with aluminum frames. Also need 2 security doors."
            className="w-full min-h-[120px] px-4 py-3 rounded-lg border-2 border-primary/20 bg-white text-charcoal placeholder:text-charcoal/50 focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none resize-y"
            rows={4}
          />
          <button
            type="button"
            onClick={handleParse}
            disabled={!describeText.trim() || parseLoading}
            className="px-6 py-2.5 rounded-lg bg-primary text-white font-medium disabled:opacity-50 flex items-center gap-2"
          >
            {parseLoading ? (
              <>
                <span className="spinner inline-block w-4 h-4 border-2" />
                Parsing…
              </>
            ) : (
              'Parse My Project →'
            )}
          </button>
          {parseError && (
            <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm">
              {parseError}
            </div>
          )}
          {parsedSummary && (
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 text-sm text-charcoal shadow-sm">
              <strong>We understood your project as:</strong> {parsedSummary}
            </div>
          )}
        </div>
      )}

      {prefill && (
        <div className="mb-6 p-4 rounded-xl bg-primary/5 border border-primary/20 shadow-sm">
          <p className="text-sm text-charcoal font-medium">Pre-filled from Glass Advisor:</p>
          <p className="text-sm text-charcoal/80 mt-1">
            {[
              prefill.projectType && `Project: ${prefill.projectType}`,
              prefill.glassType && `Glass: ${prefill.glassType}`,
              prefill.glassThickness && `Thickness: ${prefill.glassThickness}`,
              prefill.profileType && prefill.profileType !== 'None' && `Profile: ${prefill.profileType}`,
            ].filter(Boolean).join(' · ') || 'No details detected'}
          </p>
          <p className="text-xs text-charcoal/60 mt-1">Fill in the remaining fields below (quantity, dimensions) and calculate.</p>
        </div>
      )}

      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm font-medium text-charcoal/80">Project type</span>
            <select
              value={form.projectType}
              onChange={(e) => updateForm('projectType', e.target.value)}
              className="mt-1 w-full px-4 py-2.5 rounded-lg border-2 border-primary/20 bg-white focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-shadow"
            >
              <option value="">Select</option>
              {PROJECT_TYPES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-charcoal/80">Number of panels/units</span>
            <input
              type="number"
              min={1}
              value={form.quantity}
              onChange={(e) => updateForm('quantity', Number(e.target.value) || 0)}
              className="mt-1 w-full px-4 py-2.5 rounded-lg border-2 border-primary/20 bg-white focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-shadow"
            />
          </label>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm font-medium text-charcoal/80">Width (m)</span>
            <input
              type="number"
              min={0}
              step={0.1}
              value={form.width || ''}
              onChange={(e) => updateForm('width', Number(e.target.value) || 0)}
              className="mt-1 w-full px-4 py-2.5 rounded-lg border-2 border-primary/20 bg-white focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-shadow"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-charcoal/80">Height (m)</span>
            <input
              type="number"
              min={0}
              step={0.1}
              value={form.height || ''}
              onChange={(e) => updateForm('height', Number(e.target.value) || 0)}
              className="mt-1 w-full px-4 py-2.5 rounded-lg border-2 border-primary/20 bg-white focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-shadow"
            />
          </label>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm font-medium text-charcoal/80">Glass type</span>
            <select
              value={form.glassType}
              onChange={(e) => updateForm('glassType', e.target.value)}
              className="mt-1 w-full px-4 py-2.5 rounded-lg border-2 border-primary/20 bg-white focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-shadow"
            >
              <option value="">Select</option>
              {GLASS_TYPES.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-charcoal/80">Glass thickness</span>
            <select
              value={form.glassThickness}
              onChange={(e) => updateForm('glassThickness', e.target.value)}
              className="mt-1 w-full px-4 py-2.5 rounded-lg border-2 border-primary/20 bg-white focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-shadow"
            >
              <option value="">Select glass type first</option>
              {(form.glassType ? (GLASS_THICKNESSES_BY_TYPE[form.glassType] || []) : []).map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </label>
        </div>
        <label className="block">
          <span className="text-sm font-medium text-charcoal/80">Aluminium profile</span>
          <select
            value={form.profileType}
            onChange={(e) => updateForm('profileType', e.target.value)}
            className="mt-1 w-full px-4 py-2.5 rounded-lg border-2 border-primary/20 bg-white focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-shadow"
          >
            {PROFILE_TYPES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </label>
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="alucobond"
            checked={form.includeAlucobond}
            onChange={(e) => updateForm('includeAlucobond', e.target.checked)}
            className="rounded border-primary/30 text-primary focus:ring-accent"
          />
          <label htmlFor="alucobond" className="text-sm font-medium text-charcoal">Include Alucobond panels</label>
        </div>
        {form.includeAlucobond && (
          <label className="block">
            <span className="text-sm font-medium text-charcoal/80">Alucobond area (sqm)</span>
            <input
              type="number"
              min={0}
              step={0.1}
              value={form.alucobondArea || ''}
              onChange={(e) => updateForm('alucobondArea', Number(e.target.value) || 0)}
              className="mt-1 w-full max-w-xs px-4 py-2 rounded-lg border-2 border-primary/20 bg-white focus:border-accent outline-none"
            />
          </label>
        )}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="security"
            checked={form.includeSecurityDoor}
            onChange={(e) => updateForm('includeSecurityDoor', e.target.checked)}
            className="rounded border-primary/30 text-primary focus:ring-accent"
          />
          <label htmlFor="security" className="text-sm font-medium text-charcoal">Include security door(s)</label>
        </div>
        {form.includeSecurityDoor && (
          <label className="block">
            <span className="text-sm font-medium text-charcoal/80">Quantity</span>
            <input
              type="number"
              min={1}
              value={form.securityDoorQuantity || ''}
              onChange={(e) => updateForm('securityDoorQuantity', Number(e.target.value) || 0)}
              className="mt-1 w-full max-w-xs px-4 py-2 rounded-lg border-2 border-primary/20 bg-white focus:border-accent outline-none"
            />
          </label>
        )}
      </div>

      {validationError && (
        <div className="mt-4 p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm">
          {validationError}
        </div>
      )}

      <div className="mt-6">
        <button
          type="button"
          onClick={handleCalculate}
          className="px-6 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 shadow-md hover:shadow-lg transition-all"
        >
          Calculate estimate
        </button>
      </div>

      {estimate && (
        <ResultsCard estimate={estimate} onNewEstimate={resetForm} />
      )}

      <p className="mt-6 text-xs text-charcoal/60">
        Indicative estimate only. Final pricing subject to site assessment and current stock availability. Prices in GHS.
      </p>
    </div>
  );
}
