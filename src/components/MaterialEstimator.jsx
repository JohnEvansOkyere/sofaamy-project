import { useState, useEffect } from 'react';
import { parseProjectDescription, hasOpenAIKey } from '../utils/openaiClient';
import { calculateEstimate } from '../utils/calculations';
import ResultsCard from './ResultsCard';

const PROJECT_TYPES = [
  'Shopfront', 'Windows', 'Partition', 'Balustrade', 'Security Door', 'Curtain Wall', 'Shower Enclosure',
];
const GLASS_TYPES = ['Clear Float', 'Tempered', 'Frosted', 'Tinted', 'Laminated', 'Reflective'];
const GLASS_THICKNESSES = ['4mm', '6mm', '8mm', '10mm', '12mm'];
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
  const n = name.toLowerCase();
  return GLASS_TYPES.find((g) => g.toLowerCase() === n || n.includes(g.toLowerCase())) || name;
}

function normalizeThickness(t) {
  if (!t) return '';
  const s = String(t).replace(/\s/g, '');
  return GLASS_THICKNESSES.find((x) => x === s || s === x.replace('mm', '')) || t;
}

export default function MaterialEstimator({ prefill, onClearPrefill }) {
  const [mode, setMode] = useState('describe'); // 'describe' | 'manual'
  const [describeText, setDescribeText] = useState('');
  const [form, setForm] = useState({ ...initialForm });
  const [parseLoading, setParseLoading] = useState(false);
  const [parseError, setParseError] = useState(null);
  const [parsedSummary, setParsedSummary] = useState(null);
  const [estimate, setEstimate] = useState(null);

  // Prefill from Glass Advisor
  useEffect(() => {
    if (!prefill) return;
    const primary = prefill.primaryRecommendation;
    const profile = prefill.profileRecommendation;
    if (primary?.product) {
      setForm((f) => ({
        ...f,
        glassType: normalizeGlassType(primary.product),
        glassThickness: normalizeThickness(primary.thickness),
        profileType: profile?.product && PROFILE_TYPES.some((p) => (profile.product || '').toLowerCase().includes(p.toLowerCase()))
          ? PROFILE_TYPES.find((p) => (profile.product || '').toLowerCase().includes(p.toLowerCase()))
          : (profile?.product || 'None'),
      }));
    }
    setMode('manual');
  }, [prefill]);

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
        glassThickness: normalizeThickness(data.glassThickness) || f.glassThickness,
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

  const handleCalculate = () => {
    const result = calculateEstimate(form);
    setEstimate(result);
  };

  const updateForm = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
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
      <div className="flex items-center gap-2 mb-6">
        <span className="text-sm font-medium text-charcoal/80">Input mode:</span>
        <button
          type="button"
          onClick={() => { setMode('describe'); setEstimate(null); }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'describe' ? 'bg-primary text-white' : 'bg-white border border-primary/30 text-primary'}`}
        >
          Describe Your Project
        </button>
        <button
          type="button"
          onClick={() => { setMode('manual'); setEstimate(null); }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${mode === 'manual' ? 'bg-primary text-white' : 'bg-white border border-primary/30 text-primary'}`}
        >
          Manual Entry
        </button>
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
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 text-sm text-charcoal">
              <strong>We understood your project as:</strong> {parsedSummary}
            </div>
          )}
        </div>
      )}

      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm font-medium text-charcoal/80">Project type</span>
            <select
              value={form.projectType}
              onChange={(e) => updateForm('projectType', e.target.value)}
              className="mt-1 w-full px-4 py-2 rounded-lg border-2 border-primary/20 bg-white focus:border-accent outline-none"
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
              className="mt-1 w-full px-4 py-2 rounded-lg border-2 border-primary/20 bg-white focus:border-accent outline-none"
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
              className="mt-1 w-full px-4 py-2 rounded-lg border-2 border-primary/20 bg-white focus:border-accent outline-none"
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
              className="mt-1 w-full px-4 py-2 rounded-lg border-2 border-primary/20 bg-white focus:border-accent outline-none"
            />
          </label>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm font-medium text-charcoal/80">Glass type</span>
            <select
              value={form.glassType}
              onChange={(e) => updateForm('glassType', e.target.value)}
              className="mt-1 w-full px-4 py-2 rounded-lg border-2 border-primary/20 bg-white focus:border-accent outline-none"
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
              className="mt-1 w-full px-4 py-2 rounded-lg border-2 border-primary/20 bg-white focus:border-accent outline-none"
            >
              <option value="">Select</option>
              {GLASS_THICKNESSES.map((t) => (
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
            className="mt-1 w-full px-4 py-2 rounded-lg border-2 border-primary/20 bg-white focus:border-accent outline-none"
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

      <div className="mt-6">
        <button
          type="button"
          onClick={handleCalculate}
          className="px-6 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary/90"
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
