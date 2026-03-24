import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Shield, ChevronRight, LayoutDashboard } from 'lucide-react';
import useAssessmentStore from '../stores/assessmentStore';

const steps = [
  { path: '/', label: 'Identify', step: 1 },
  { path: '/screening', label: 'Screening', step: 2 },
  { path: '/assessment', label: 'Assessment', step: 3 },
  { path: '/report', label: 'Report', step: 4 },
];

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { status, sessionId, reset } = useAssessmentStore();

  const currentStep = steps.findIndex(s => s.path === location.pathname) + 1 || 1;

  function handleNewAssessment() {
    if (window.confirm('Start a new assessment? Your current session will be lost.')) {
      reset();
      navigate('/');
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-primary-600 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
              <div className="bg-white/20 rounded-lg p-1.5">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <div className="font-bold text-lg leading-tight">CIS RAM v2.1</div>
                <div className="text-xs text-primary-200 leading-tight">Risk Assessment Tool</div>
              </div>
            </Link>

            <div className="flex items-center gap-3">
              {sessionId && status !== 'idle' && (
                <button
                  onClick={handleNewAssessment}
                  className="text-sm text-primary-200 hover:text-white transition-colors"
                >
                  New Assessment
                </button>
              )}
              <Link
                to="/admin"
                className="flex items-center gap-1.5 text-sm text-primary-200 hover:text-white transition-colors"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden sm:inline">Admin</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Progress stepper */}
      {location.pathname !== '/' && (
        <div className="bg-white border-b shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <nav className="flex items-center gap-1 text-sm">
              {steps.map((step, idx) => {
                const isActive = step.path === location.pathname;
                const isPast = currentStep > step.step;
                const isFuture = currentStep < step.step;
                return (
                  <React.Fragment key={step.path}>
                    {idx > 0 && <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />}
                    <span
                      className={`flex items-center gap-1.5 px-2 py-1 rounded-md font-medium transition-colors ${
                        isActive
                          ? 'bg-primary-50 text-primary-700'
                          : isPast
                          ? 'text-green-600'
                          : 'text-gray-400'
                      }`}
                    >
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                          isActive
                            ? 'bg-primary-600 text-white'
                            : isPast
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-200 text-gray-500'
                        }`}
                      >
                        {isPast ? '✓' : step.step}
                      </span>
                      <span className="hidden sm:inline">{step.label}</span>
                    </span>
                  </React.Fragment>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-gray-500">
            <p>CIS RAM v2.1 Risk Assessment Tool — Based on CIS Controls v8.1</p>
            <p>Center for Internet Security</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
