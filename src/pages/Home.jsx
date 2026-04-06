import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Mail, Hash, ArrowRight, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import useAssessmentStore from '../stores/assessmentStore';
import { getSettings } from '../lib/settings';
import clsx from 'clsx';

export default function Home() {
  const navigate = useNavigate();
  const { startSession, loading, error, clearError, status, sessionId } = useAssessmentStore();

  const [mode, setMode] = useState('new'); // 'new' | 'resume'
  const [email, setEmail] = useState('');
  const [orgCode, setOrgCode] = useState('');
  const [guestMode, setGuestMode] = useState(false);
  const [resumeSessionId, setResumeSessionId] = useState('');
  const [formError, setFormError] = useState('');
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);

  const [settings, setSettings] = useState({});

  useEffect(() => {
    setSettings(getSettings());
  }, []);

  function validateEmail(e) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');
    clearError();

    if (!validateEmail(email)) {
      setFormError('Please enter a valid email address.');
      return;
    }
    const effectiveOrgCode = guestMode ? (settings.guestOrgCode || '').trim() : orgCode.trim();
    if (!effectiveOrgCode) {
      setFormError(guestMode
        ? 'Guest access is not configured. Contact your administrator.'
        : 'Organization code is required.'
      );
      return;
    }
    if (mode === 'resume' && !resumeSessionId.trim()) {
      setFormError('Session ID is required to resume an assessment.');
      return;
    }
    if (settings.disclaimer && settings.requireDisclaimerAccept && !disclaimerAccepted) {
      setFormError('Please accept the disclaimer to continue.');
      return;
    }

    const success = await startSession(
      email,
      effectiveOrgCode,
      mode === 'resume',
      mode === 'resume' ? resumeSessionId.trim() : null
    );

    if (success) {
      if (mode === 'resume') {
        const store = useAssessmentStore.getState();
        if (store.status === 'completed') {
          navigate('/report');
        } else if (store.status === 'in_progress') {
          navigate('/assessment');
        } else {
          navigate('/screening');
        }
      } else {
        navigate('/screening');
      }
    }
  }

  const toolName = settings.orgDisplayName || 'CIS RAM v2.1';
  const hasDisclaimer = Boolean(settings.disclaimer);

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-lg">
        {/* Hero section */}
        <div className="text-center mb-10">
          {settings.logoUrl ? (
            <div className="flex justify-center mb-5">
              <img
                src={settings.logoUrl}
                alt={toolName}
                className="h-16 object-contain"
                onError={e => { e.target.style.display = 'none'; }}
              />
            </div>
          ) : (
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl mb-5 shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
          )}
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            {toolName}
          </h1>
          <p className="text-lg text-gray-600 mb-2">Risk Assessment Tool</p>
          <p className="text-sm text-gray-500 max-w-sm mx-auto">
            Assess your organization's cybersecurity risk posture using the CIS Controls Risk Assessment Method, aligned with CIS Controls v8.1.
          </p>
        </div>

        {/* Disclaimer */}
        {hasDisclaimer && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-sm text-amber-900">
            <div className="font-semibold mb-1 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Important Notice
            </div>
            <p className="whitespace-pre-wrap">{settings.disclaimer}</p>
            {settings.requireDisclaimerAccept && (
              <div className="flex items-start gap-2 mt-3 pt-3 border-t border-amber-200">
                <input
                  type="checkbox"
                  id="disclaimerAccept"
                  checked={disclaimerAccepted}
                  onChange={e => setDisclaimerAccepted(e.target.checked)}
                  className="mt-0.5"
                />
                <label htmlFor="disclaimerAccept" className="text-sm text-amber-800 cursor-pointer">
                  {settings.disclaimerCheckboxLabel || 'I have read and agree to the terms of this assessment'}
                </label>
              </div>
            )}
          </div>
        )}

        {/* Card */}
        <div className="card">
          {/* Mode toggle */}
          <div className="card-header">
            <div className="flex rounded-lg bg-gray-100 p-1 gap-1">
              <button
                type="button"
                onClick={() => { setMode('new'); setFormError(''); clearError(); }}
                className={clsx(
                  'flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all duration-150',
                  mode === 'new'
                    ? 'bg-white text-primary-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                )}
              >
                New Assessment
              </button>
              <button
                type="button"
                onClick={() => { setMode('resume'); setFormError(''); clearError(); }}
                className={clsx(
                  'flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all duration-150 flex items-center justify-center gap-1.5',
                  mode === 'resume'
                    ? 'bg-white text-primary-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                )}
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Continue Assessment
              </button>
            </div>
          </div>

          <div className="card-body">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="label">
                  <Mail className="w-4 h-4 inline mr-1" />
                  Your Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@organization.com"
                  className="input-field"
                  required
                  autoComplete="email"
                />
              </div>

              {/* Org Code */}
              <div>
                <label className="label">
                  <Hash className="w-4 h-4 inline mr-1" />
                  Organization Code
                </label>
                {guestMode ? (
                  <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                    <Shield className="w-4 h-4 text-primary-600 flex-shrink-0" />
                    <span className="text-sm text-gray-700 font-medium">Guest Access</span>
                    <span className="ml-auto text-xs text-gray-400 font-mono">{settings.guestOrgCode || '—'}</span>
                  </div>
                ) : (
                  <input
                    type="text"
                    value={orgCode}
                    onChange={e => setOrgCode(e.target.value.toUpperCase())}
                    placeholder="e.g. DEMO001"
                    className="input-field font-mono uppercase"
                    required={!guestMode}
                    maxLength={20}
                  />
                )}
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-gray-500">
                    {guestMode
                      ? 'You are accessing as a guest.'
                      : 'Contact your administrator for your organization code.'}
                  </p>
                  {settings.guestOrgCode && (
                    <button
                      type="button"
                      onClick={() => {
                        setGuestMode(g => !g);
                        setFormError('');
                        clearError();
                      }}
                      className="text-xs text-primary-600 hover:text-primary-700 underline underline-offset-2 flex-shrink-0 ml-2"
                    >
                      {guestMode ? 'Use org code instead' : 'Continue as Guest'}
                    </button>
                  )}
                </div>
              </div>

              {/* Session ID (resume only) */}
              {mode === 'resume' && (
                <div>
                  <label className="label">Session ID</label>
                  <input
                    type="text"
                    value={resumeSessionId}
                    onChange={e => setResumeSessionId(e.target.value.trim())}
                    placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                    className="input-field font-mono text-sm"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Your session ID was shown when you started your assessment.
                  </p>
                </div>
              )}

              {/* Errors */}
              {(formError || error) && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  {formError || error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || (settings.disclaimer && settings.requireDisclaimerAccept && !disclaimerAccepted)}
                className="btn-primary w-full justify-center py-3 text-base disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    {mode === 'new' ? 'Creating Assessment...' : 'Loading Session...'}
                  </>
                ) : (
                  <>
                    {mode === 'new' ? 'Start New Assessment' : 'Continue Assessment'}
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Info cards */}
        <div className="grid grid-cols-3 gap-3 mt-6">
          {[
            { label: '153 Safeguards', desc: 'CIS Controls v8.1', icon: '🛡️' },
            { label: '3 Risk Levels', desc: 'IG1, IG2, IG3', icon: '📊' },
            { label: 'PDF Report', desc: 'Exportable results', icon: '📄' },
          ].map(item => (
            <div key={item.label} className="bg-white rounded-xl border p-3 text-center shadow-sm">
              <div className="text-2xl mb-1">{item.icon}</div>
              <div className="text-xs font-semibold text-gray-800">{item.label}</div>
              <div className="text-xs text-gray-500">{item.desc}</div>
            </div>
          ))}
        </div>

        {/* Demo note */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2">
          <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-blue-700">
            <strong>Demo:</strong> Use organization code <code className="font-mono bg-blue-100 px-1 rounded">DEMO001</code> to try the tool. Contact your admin to set up your organization's code.
          </p>
        </div>
      </div>
    </div>
  );
}
