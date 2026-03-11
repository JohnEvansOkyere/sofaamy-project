import { useState } from 'react';
import { getGlassRecommendation, hasOpenAIKey } from '../utils/openaiClient';

const PROJECT_TYPES = [
  { id: 'shopfront', label: 'Shopfront / Facade', icon: '🏪' },
  { id: 'windows', label: 'Windows (Residential)', icon: '🪟' },
  { id: 'partition', label: 'Office Partition', icon: '🏢' },
  { id: 'shower', label: 'Shower Enclosure', icon: '🚿' },
  { id: 'curtainwall', label: 'Curtain Wall', icon: '🏗️' },
  { id: 'securitydoor', label: 'Security Door', icon: '🚪' },
  { id: 'balustrade', label: 'Balustrade / Railing', icon: '🏛️' },
];

const LOCATIONS = [
  { id: 'coastal', label: 'Coastal Area (High humidity, salt air)', icon: '🌊' },
  { id: 'accra', label: 'Accra / Urban Inland', icon: '☀️' },
  { id: 'northern', label: 'Northern Ghana (Dry heat)', icon: '🏔️' },
  { id: 'highrise', label: 'High-rise (Above 5 floors)', icon: '🏢' },
];

const CONCERNS = [
  { id: 'security', label: 'Security & Strength', icon: '🔒' },
  { id: 'heat', label: 'Heat & Sun Control', icon: '🌡️' },
  { id: 'privacy', label: 'Privacy', icon: '👁️' },
  { id: 'light', label: 'Maximum Natural Light', icon: '💡' },
  { id: 'value', label: 'Best Value for Budget', icon: '💰' },
  { id: 'aesthetics', label: 'Premium Aesthetics', icon: '✨' },
];

const STEPS = [
  { id: 1, title: 'Project Type' },
  { id: 2, title: 'Location' },
  { id: 3, title: 'Primary Concern' },
  { id: 4, title: 'Results' },
];

export default function GlassAdvisor({ onUseRecommendation }) {
  const [step, setStep] = useState(1);
  const [projectType, setProjectType] = useState(null);
  const [location, setLocation] = useState(null);
  const [concerns, setConcerns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const toggleConcern = (id) => {
    setConcerns((prev) => {
      const next = prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id];
      return next.length <= 2 ? next : prev;
    });
  };

  const canProceedStep2 = !!projectType;
  const canProceedStep3 = !!location;
  const canProceedStep4 = concerns.length >= 1 && concerns.length <= 2;

  const fetchRecommendation = async () => {
    setLoading(true);
    setError(null);
    try {
      const pt = PROJECT_TYPES.find((p) => p.id === projectType);
      const loc = LOCATIONS.find((l) => l.id === location);
      const conLabels = concerns.map((c) => CONCERNS.find((x) => x.id === c)?.label).filter(Boolean);
      const data = await getGlassRecommendation(
        pt?.label || projectType,
        loc?.label || location,
        conLabels.join(', ')
      );
      setResult(data);
      setStep(4);
    } catch (err) {
      setError(err.message || 'Something went wrong. Try manual entry instead.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tab-content max-w-3xl mx-auto px-4 py-6 sm:py-8">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-charcoal/70 mb-2">
          {STEPS.map((s) => (
            <span key={s.id} className={step >= s.id ? 'text-primary font-medium' : ''}>
              Step {s.id}
            </span>
          ))}
        </div>
        <div className="h-1.5 bg-primary/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-accent transition-all duration-300 rounded-full"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>
      </div>

      {step === 1 && (
        <>
          <h2 className="font-display text-xl text-primary mb-4">What are you building?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PROJECT_TYPES.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setProjectType(p.id)}
                className={`flex items-center gap-3 p-4 rounded-lg border-2 text-left transition-all shadow-card hover:shadow-card-hover ${
                  projectType === p.id
                    ? 'border-accent bg-accent/10'
                    : 'border-primary/20 bg-white hover:border-primary/40'
                }`}
              >
                <span className="text-2xl">{p.icon}</span>
                <span className="font-medium text-charcoal">{p.label}</span>
              </button>
            ))}
          </div>
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={() => setStep(2)}
              disabled={!canProceedStep2}
              className="px-6 py-2.5 rounded-lg bg-primary text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90"
            >
              Next
            </button>
          </div>
        </>
      )}

      {step === 2 && (
        <>
          <h2 className="font-display text-xl text-primary mb-4">Where is this project located?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {LOCATIONS.map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => setLocation(l.id)}
                className={`flex items-center gap-3 p-4 rounded-lg border-2 text-left transition-all shadow-card hover:shadow-card-hover ${
                  location === l.id
                    ? 'border-accent bg-accent/10'
                    : 'border-primary/20 bg-white hover:border-primary/40'
                }`}
              >
                <span className="text-2xl">{l.icon}</span>
                <span className="font-medium text-charcoal">{l.label}</span>
              </button>
            ))}
          </div>
          <div className="mt-6 flex justify-between">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-6 py-2.5 rounded-lg border-2 border-primary/30 text-primary font-medium hover:bg-primary/5"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              disabled={!canProceedStep3}
              className="px-6 py-2.5 rounded-lg bg-primary text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90"
            >
              Next
            </button>
          </div>
        </>
      )}

      {step === 3 && (
        <>
          <h2 className="font-display text-xl text-primary mb-2">What matters most for this project?</h2>
          <p className="text-charcoal/70 text-sm mb-4">Select up to 2 options.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {CONCERNS.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => toggleConcern(c.id)}
                disabled={!concerns.includes(c.id) && concerns.length >= 2}
                className={`flex items-center gap-3 p-4 rounded-lg border-2 text-left transition-all shadow-card hover:shadow-card-hover disabled:opacity-60 ${
                  concerns.includes(c.id)
                    ? 'border-accent bg-accent/10'
                    : 'border-primary/20 bg-white hover:border-primary/40'
                }`}
              >
                <span className="text-2xl">{c.icon}</span>
                <span className="font-medium text-charcoal">{c.label}</span>
              </button>
            ))}
          </div>
          <div className="mt-6 flex justify-between">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-6 py-2.5 rounded-lg border-2 border-primary/30 text-primary font-medium hover:bg-primary/5"
            >
              Back
            </button>
            {error && (
            <div className="mb-4 p-4 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm">
              {error}
            </div>
          )}
            <button
              type="button"
              onClick={fetchRecommendation}
              disabled={!canProceedStep4 || loading}
              className="px-6 py-2.5 rounded-lg bg-primary text-white font-medium disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <span className="spinner inline-block" />
                  Getting recommendation…
                </>
              ) : (
                'Get recommendation'
              )}
            </button>
          </div>
        </>
      )}

      {step === 4 && result && !loading && (
        <>
          <h2 className="font-display text-xl text-primary mb-4">Your recommendation</h2>
          {error && (
            <div className="mb-4 p-4 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="p-4 rounded-lg border-2 border-primary bg-primary/5 shadow-card">
              <h3 className="font-display font-medium text-primary mb-2">✅ Primary recommendation</h3>
              <p className="font-medium text-charcoal">
                {result.primaryRecommendation?.product} — {result.primaryRecommendation?.thickness}
              </p>
              <p className="text-charcoal/80 text-sm mt-2">{result.primaryRecommendation?.reason}</p>
            </div>
            {result.alternativeRecommendation?.product && (
              <div className="p-4 rounded-lg border-2 border-accent bg-accent/5 shadow-card">
                <h3 className="font-display font-medium text-accent mb-2">🔄 Alternative option</h3>
                <p className="font-medium text-charcoal">
                  {result.alternativeRecommendation.product} — {result.alternativeRecommendation.thickness}
                </p>
                <p className="text-charcoal/80 text-sm mt-2">{result.alternativeRecommendation.reason}</p>
              </div>
            )}
            {result.profileRecommendation?.product && (
              <div className="p-4 rounded-lg border-2 border-primary/30 bg-white shadow-card">
                <h3 className="font-display font-medium text-primary mb-2">🔩 Recommended profile</h3>
                <p className="font-medium text-charcoal">{result.profileRecommendation.product}</p>
                <p className="text-charcoal/80 text-sm mt-2">{result.profileRecommendation.reason}</p>
              </div>
            )}
            {result.importantNote && (
              <div className="p-4 rounded-lg bg-background border border-primary/20">
                <h3 className="font-medium text-primary mb-1">💡 Ghana-specific tip</h3>
                <p className="text-charcoal/80 text-sm">{result.importantNote}</p>
              </div>
            )}
          </div>

          <div className="mt-8">
            <button
              type="button"
              onClick={() => onUseRecommendation(result)}
              className="w-full py-4 px-6 rounded-lg bg-accent text-charcoal font-display font-bold text-lg hover:bg-accent/90 transition-colors shadow-card"
            >
              Use This Recommendation → Get My Cost Estimate
            </button>
          </div>
          <div className="mt-4 flex justify-center">
            <button
              type="button"
              onClick={() => { setResult(null); setStep(1); setProjectType(null); setLocation(null); setConcerns([]); setError(null); }}
              className="text-primary/80 text-sm hover:underline"
            >
              Start over
            </button>
          </div>
        </>
      )}

      {loading && step !== 4 && (
        <div className="flex flex-col items-center justify-center py-12">
          <span className="spinner mb-4" />
          <p className="text-charcoal/70">Getting your recommendation…</p>
        </div>
      )}
    </div>
  );
}

