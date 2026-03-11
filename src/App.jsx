import { useState } from 'react';
import Header from './components/Header';
import TabNav from './components/TabNav';
import GlassAdvisor from './components/GlassAdvisor';
import MaterialEstimator from './components/MaterialEstimator';
import { hasOpenAIKey } from './utils/openaiClient';

export default function App() {
  const [activeTab, setActiveTab] = useState('advisor');
  const [estimatorPrefill, setEstimatorPrefill] = useState(null);

  const handleUseRecommendation = (result) => {
    setEstimatorPrefill(result);
    setActiveTab('estimator');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      {!hasOpenAIKey() && (
        <div className="bg-accent/20 border-b border-accent/40 px-4 py-2 text-center text-sm text-charcoal">
          Demo mode — AI features require API key. Manual entry still works.
        </div>
      )}
      <TabNav activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="pb-16">
        {activeTab === 'advisor' && (
          <GlassAdvisor onUseRecommendation={handleUseRecommendation} />
        )}
        {activeTab === 'estimator' && (
          <MaterialEstimator
            prefill={estimatorPrefill}
            onClearPrefill={() => setEstimatorPrefill(null)}
          />
        )}
      </main>
      <footer className="border-t border-primary/20 bg-white/60 py-6 px-4 text-center text-sm text-charcoal/70">
        <p>Powered by Veloxa Technology Limited</p>
        <p className="text-xs mt-1">Built for Sofaamy Co. Ltd. · Demo Version</p>
      </footer>
    </div>
  );
}
