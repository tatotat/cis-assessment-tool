import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Shield, Mail, Hash, ArrowRight, RefreshCw, AlertCircle, CheckCircle, Ticket } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import useAssessmentStore from '../stores/assessmentStore';
import { getSettings } from '../lib/settings';
import { getEnrollmentByToken } from '../lib/supabase';
import clsx from 'clsx';

export default function Home() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get('invite');
  const { startSession, loading, error, clearError, status, sessionId } = useAssessmentStore();

  const [mode, setMode] = useState('new'); // 'new' | 'resume'
  const [email, setEmail] = useState('');
  const [orgCode, setOrgCode] = useState('');
  const [guestMode, setGuestMode] = useState(false);
  const [resumeSessionId, setResumeSessionId] = useState('');
  const [formError, setFormError] = useState('');
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);

  // Invite state
  const [invite, setInvite] = useState(null);        // enrollment record
  const [inviteError, setInviteError] = useState(''); // invalid/expired token message
  const [inviteLoading, setInviteLoading] = useState(!!inviteToken);

  const [settings, setSettings] = useState({});

  useEffect(() => {
    setSettings(getSettings());
  }, []);

  // Resolve an invite token (?invite=…) into a locked enrollment
  useEffect(() => {
    if (!inviteToken) return;
    let cancelled = false;
    (async () => {
      setInviteLoading(true);
      const { data } = await getEnrollmentByToken(inviteToken);
      if (cancelled) return;
      if (data && data.organization) {
        setInvite(data);
        setEmail(data.email);
        setInviteError('');
      } else {
        setInviteError(t('home.invite.invalid'));
      }
      setInviteLoading(false);
    })();
    return () => { cancelled = true; };
  }, [inviteToken]);

  function validateEmail(e) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');
    clearError();

    if (!validateEmail(email)) {
      setFormError(t('home.errors.invalidEmail'));
      return;
    }
    // Invited users assess their invite's organization; otherwise use the entered/guest code
    const effectiveOrgCode = invite
      ? invite.organization.code
      : (guestMode ? (settings.guestOrgCode || '').trim() : orgCode.trim());
    if (!effectiveOrgCode) {
      setFormError(guestMode
        ? t('home.errors.guestNotConfigured')
        : t('home.errors.orgCodeRequired')
      );
      return;
    }
    if (mode === 'resume' && !resumeSessionId.trim()) {
      setFormError(t('home.errors.sessionRequired'));
      return;
    }
    if (settings.disclaimer && settings.requireDisclaimerAccept && !disclaimerAccepted) {
      setFormError(t('home.errors.disclaimerRequired'));
      return;
    }

    // An invite that already has a linked assessment resumes it; otherwise start new
    const resumeViaInvite = invite && invite.resume_session_id;
    const isResume = mode === 'resume' || !!resumeViaInvite;
    const resumeId = mode === 'resume'
      ? resumeSessionId.trim()
      : (resumeViaInvite ? invite.resume_session_id : null);

    const success = await startSession(
      email,
      effectiveOrgCode,
      isResume,
      resumeId,
      invite ? inviteToken : null
    );

    if (success) {
      if (isResume) {
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
          <p className="text-lg text-gray-600 mb-2">{t('home.subtitle')}</p>
          <p className="text-sm text-gray-500 max-w-sm mx-auto">
            {t('home.description')}
          </p>
        </div>

        {/* Invite banner */}
        {invite && (
          <div className="bg-primary-50 border border-primary-200 rounded-xl p-4 mb-6 text-sm text-primary-900">
            <div className="font-semibold mb-1 flex items-center gap-2">
              <Ticket className="w-4 h-4" />
              {t('home.invite.title', { org: invite.organization.name })}
            </div>
            <p className="text-primary-700">
              {invite.resume_session_id ? t('home.invite.resumeHint') : t('home.invite.hint')}
            </p>
            {invite.audit_label && (
              <p className="text-xs text-primary-500 mt-1">{invite.audit_label}</p>
            )}
          </div>
        )}

        {/* Invalid invite */}
        {inviteError && !invite && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-sm text-amber-900 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            {inviteError}
          </div>
        )}

        {/* Disclaimer */}
        {hasDisclaimer && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-sm text-amber-900">
            <div className="font-semibold mb-1 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              {t('home.importantNotice')}
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
          {/* Mode toggle (hidden for invited users) */}
          {!invite && (
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
                  {t('home.tabs.new')}
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
                  {t('home.tabs.resume')}
                </button>
              </div>
            </div>
          )}

          <div className="card-body">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label className="label">
                  <Mail className="w-4 h-4 inline mr-1" />
                  {t('home.emailLabel')}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder={t('home.emailPlaceholder')}
                  className={clsx('input-field', invite && 'bg-gray-50 text-gray-500 cursor-not-allowed')}
                  required
                  autoComplete="email"
                  readOnly={!!invite}
                />
              </div>

              {/* Org Code — for invited users the org is fixed by the invite */}
              {invite ? (
                <div>
                  <label className="label">
                    <Hash className="w-4 h-4 inline mr-1" />
                    {t('home.orgCodeLabel')}
                  </label>
                  <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                    <Shield className="w-4 h-4 text-primary-600 flex-shrink-0" />
                    <span className="text-sm text-gray-700 font-medium">{invite.organization.name}</span>
                    <span className="ml-auto text-xs text-gray-400 font-mono">{invite.organization.code}</span>
                  </div>
                </div>
              ) : (
              <div>
                <label className="label">
                  <Hash className="w-4 h-4 inline mr-1" />
                  {t('home.orgCodeLabel')}
                </label>
                {guestMode ? (
                  <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                    <Shield className="w-4 h-4 text-primary-600 flex-shrink-0" />
                    <span className="text-sm text-gray-700 font-medium">{t('home.guestAccessLabel')}</span>
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
                      ? t('home.accessingAsGuest')
                      : t('home.orgCodeHint')}
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
                      {guestMode ? t('home.useOrgCodeLink') : t('home.continueAsGuestLink')}
                    </button>
                  )}
                </div>
              </div>
              )}

              {/* Session ID (resume only) */}
              {mode === 'resume' && !invite && (
                <div>
                  <label className="label">{t('home.sessionIdLabel')}</label>
                  <input
                    type="text"
                    value={resumeSessionId}
                    onChange={e => setResumeSessionId(e.target.value.trim())}
                    placeholder={t('home.sessionIdPlaceholder')}
                    className="input-field font-mono text-sm"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {t('home.sessionIdHint')}
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
                {(() => {
                  const isNew = mode === 'new' && !(invite && invite.resume_session_id);
                  if (loading) {
                    return (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                        {isNew ? t('home.buttons.creating') : t('home.buttons.loading')}
                      </>
                    );
                  }
                  return (
                    <>
                      {isNew ? t('home.buttons.start') : t('home.buttons.continue')}
                      <ArrowRight className="w-5 h-5" />
                    </>
                  );
                })()}
              </button>
            </form>
          </div>
        </div>

        {/* Info cards */}
        <div className="grid grid-cols-3 gap-3 mt-6">
          {[
            { label: t('home.features.safeguards.label'), desc: t('home.features.safeguards.desc'), icon: '🛡️' },
            { label: t('home.features.riskLevels.label'), desc: t('home.features.riskLevels.desc'), icon: '📊' },
            { label: t('home.features.pdfReport.label'), desc: t('home.features.pdfReport.desc'), icon: '📄' },
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
            <strong>{t('home.demoNoteStrong')}</strong> {t('home.demoNoteText')}
          </p>
        </div>
      </div>
    </div>
  );
}
