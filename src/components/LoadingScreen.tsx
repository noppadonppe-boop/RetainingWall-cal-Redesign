interface LoadingScreenProps {
  message?: string;
}

export const LoadingScreen = ({ message = 'Loading workspace...' }: LoadingScreenProps) => (
  <div className="min-h-screen bg-background flex items-center justify-center px-6">
    <div className="bg-surface border border-border-card rounded-3xl shadow-sm px-10 py-8 text-center max-w-md w-full">
      <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-primary animate-spin mx-auto mb-5" />
      <h1 className="text-xl font-bold text-slate-900 font-sans">RetainCalc Pro</h1>
      <p className="text-sm text-slate-500 mt-2">{message}</p>
    </div>
  </div>
);
