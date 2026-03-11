export default function TabNav({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'advisor', label: 'Glass Advisor', icon: '💡' },
    { id: 'estimator', label: 'Material Estimator', icon: '🧮' },
  ];

  return (
    <nav className="flex border-b border-primary/20 bg-white/80 backdrop-blur sticky top-0 z-10 shadow-sm">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onTabChange(tab.id)}
          className={`flex-1 flex items-center justify-center gap-2 py-4 px-4 font-sans font-medium transition-all duration-200 ${
            activeTab === tab.id
              ? 'text-accent border-b-2 border-accent bg-background/50'
              : 'text-charcoal/70 hover:text-primary hover:bg-background/30'
          }`}
        >
          <span className="text-lg" aria-hidden>{tab.icon}</span>
          <span>{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
