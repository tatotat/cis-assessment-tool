import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, AlertCircle, Info, CheckCircle, Copy, Check } from 'lucide-react';
import { supabase, IS_DEMO_MODE, getAdminProfile, claimFirstAdmin } from '../../lib/supabase';
import useAssessmentStore from '../../stores/assessmentStore';

export default function AdminLogin() {
  const navigate = useNavigate();
  const setAdminUser = useAssessmentStore(s => s.setAdminUser);
  const adminUser = useAssessmentStore(s => s.adminUser);

  const [email, setEmail] = useState(IS_DEMO_MODE ? 'admin@demo.com' : '');
  const [password, setPassword] = useState(IS_DEMO_MODE ? 'demo1234' : '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // State for "not admin yet" flow
  const [notAdmin, setNotAdmin] = useState(false);
  const [pendingUser, setPendingUser] = useState(null); // the auth user who signed in but isn't admin
  const [claiming, setClaiming] = useState(false);
  const [claimResult, setClaimResult] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (adminUser) { navigate('/admin'); return; }
    if (!IS_DEMO_MODE) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) navigate('/admin');
      });
    }
  }, [adminUser]);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setNotAdmin(false);
    setPendingUser(null);

    // Demo mode
    if (IS_DEMO_MODE) {
      if (email.toLowerCase() === 'admin@demo.com' && password === 'demo1234') {
        setAdminUser({ id: 'demo-admin', email: 'admin@demo.com', role: 'admin' });
        navigate('/admin');
      } else {
        setError('Demo credentials: admin@demo.com / demo1234');
      }
      setLoading(false);
      return;
    }

    // Sign in with Supabase Auth
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      setError(authError.message || 'Invalid email or password.');
      setLoading(false);
      return;
    }

    // Check admin role in profiles table
    const { data: profile } = await getAdminProfile(data.user.id);
    if (!profile || profile.role !== 'admin') {
      // Sign out immediately — don't let a non-admin into the console
      await supabase.auth.signOut();
      setPendingUser(data.user);
      setNotAdmin(true);
      setLoading(false);
      return;
    }

    setAdminUser(data.user);
    navigate('/admin');
    setLoading(false);
  }

  async function handleClaimAdmin() {
    setClaiming(true);
    setClaimResult(null);

    // Re-authenticate to get a fresh session for the RPC call
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      setClaimResult({ success: false, message: 'Could not re-authenticate. Check your credentials.' });
      setClaiming(false);
      return;
    }

    const result = await claimFirstAdmin();
    if (result.success) {
      setAdminUser(authData.user);
      navigate('/admin');
    } else {
      await supabase.auth.signOut();
      setClaimResult({ success: false, message: result.message });
    }
    setClaiming(false);
  }

  function copySQL() {
    const sql = `UPDATE profiles SET role = 'admin' WHERE email = '${email || 'your@email.com'}';`;
    navigator.clipboard.writeText(sql).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // ── "Not admin yet" screen ────────────────────────────────────────────────
  if (notAdmin) {
    const sql = `UPDATE profiles SET role = 'admin' WHERE email = '${email}';`;
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-amber-500 rounded-2xl mb-4 shadow-lg">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Access Required</h1>
            <p className="text-sm text-gray-500 mt-1">
              <span className="font-medium text-gray-700">{email}</span> is not marked as admin yet.
            </p>
          </div>

          <div className="card mb-4">
            <div className="card-header">
              <h2 className="font-semibold text-gray-800">Option 1 — Claim First Admin</h2>
              <p className="text-xs text-gray-500 mt-1">Works only if no admin has been set up yet.</p>
            </div>
            <div className="card-body">
              <button
                onClick={handleClaimAdmin}
                disabled={claiming}
                className="btn-primary w-full justify-center"
              >
                {claiming
                  ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> Claiming...</>
                  : <><CheckCircle className="w-4 h-4" /> Claim Admin Access</>
                }
              </button>
              {claimResult && (
                <div className={`mt-3 flex items-start gap-2 p-3 rounded-lg text-sm ${
                  claimResult.success
                    ? 'bg-green-50 border border-green-200 text-green-700'
                    : 'bg-red-50 border border-red-200 text-red-700'
                }`}>
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  {claimResult.message}
                </div>
              )}
            </div>
          </div>

          <div className="card mb-4">
            <div className="card-header">
              <h2 className="font-semibold text-gray-800">Option 2 — Run SQL in Supabase</h2>
              <p className="text-xs text-gray-500 mt-1">
                Go to your Supabase project → SQL Editor and run:
              </p>
            </div>
            <div className="card-body">
              <div className="relative bg-gray-900 rounded-lg p-3">
                <code className="text-green-400 text-xs font-mono break-all">
                  {sql}
                </code>
                <button
                  onClick={copySQL}
                  className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors"
                  title="Copy SQL"
                >
                  {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Then come back and log in again.
              </p>
            </div>
          </div>

          <button
            onClick={() => { setNotAdmin(false); setError(''); setClaimResult(null); }}
            className="btn-secondary w-full justify-center"
          >
            ← Back to Login
          </button>
        </div>
      </div>
    );
  }

  // ── Normal login screen ───────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-600 rounded-2xl mb-4 shadow-lg">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Console</h1>
          <p className="text-sm text-gray-500 mt-1">CIS RAM v2.1 Assessment Tool</p>
        </div>

        {IS_DEMO_MODE && (
          <div className="mb-4 flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
            <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div>
              <strong>Demo Mode</strong> — No Supabase credentials configured.
              <br />Use <code className="bg-blue-100 px-1 rounded">admin@demo.com</code> / <code className="bg-blue-100 px-1 rounded">demo1234</code>
            </div>
          </div>
        )}

        <div className="card">
          <div className="card-body">
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="label">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="input-field"
                  required
                  autoComplete="email"
                />
              </div>
              <div>
                <label className="label">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-field"
                  required
                  autoComplete="current-password"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full justify-center py-2.5"
              >
                {loading ? (
                  <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> Signing in...</>
                ) : 'Sign In'}
              </button>
            </form>
          </div>
        </div>

        <div className="text-center mt-4">
          <a href="/" className="text-sm text-primary-600 hover:text-primary-800">
            ← Back to Assessment Tool
          </a>
        </div>
      </div>
    </div>
  );
}
