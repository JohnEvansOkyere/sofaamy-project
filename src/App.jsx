import { useState } from 'react';
import Header from './components/Header';
import TabNav from './components/TabNav';
import GlassAdvisor from './components/GlassAdvisor';
import MaterialEstimator from './components/MaterialEstimator';
import { hasOpenAIKey } from './utils/openaiClient';

export default function App() {
  const [activeTab, setActiveTab] = useState('advisor');
  const [estimatorPrefill, setEstimatorPrefill] = useState(null);
  const [estimatorKey, setEstimatorKey] = useState(0);

  const handleUseRecommendation = (payload) => {
    setEstimatorPrefill(payload);
    setEstimatorKey((k) => k + 1);
    setActiveTab('estimator');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      {!hasOpenAIKey() && (
        <div className="bg-amber-50/90 border-b border-amber-200/60 px-4 py-2.5 text-center text-sm text-charcoal/90">
          Demo mode — AI features require API key. Manual entry and calculations work without it.
        </div>
      )}
      <TabNav activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="pb-16">
        {activeTab === 'advisor' && (
          <GlassAdvisor onUseRecommendation={handleUseRecommendation} />
        )}
        {activeTab === 'estimator' && (
          <MaterialEstimator
            key={estimatorKey}
            prefill={estimatorPrefill}
            onClearPrefill={() => setEstimatorPrefill(null)}
          />
        )}
      </main>
      <footer className="border-t border-primary/20 bg-white/80 py-8 px-4 text-center">
        <p className="text-sm font-medium text-charcoal/80">Powered by Veloxa Technology Limited</p>
        <p className="text-xs mt-1 text-charcoal/60">Built for Sofaamy Co. Ltd. · Demo Version</p>
      </footer>
    </div>
  );
}
