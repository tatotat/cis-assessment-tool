import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, AlertCircle, Info } from 'lucide-react';
import { supabase, IS_DEMO_MODE } from '../../lib/supabase';
import useAssessmentStore from '../../stores/assessmentStore';

export default function AdminLogin() {
  const navigate = useNavigate();
  const setAdminUser = useAssessmentStore(s => s.setAdminUser);
  const adminUser = useAssessmentStore(s => s.adminUser);

  const [email, setEmail] = useState(IS_DEMO_MODE ? 'admin@demo.com' : '');
  const [password, setPassword] = useState(IS_DEMO_MODE ? 'demo1234' : '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Already logged in
    if (adminUser) {
      navigate('/admin');
      return;
    }
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

    if (IS_DEMO_MODE) {
      // Demo login: accept admin@demo.com / demo1234
      if (email.toLowerCase() === 'admin@demo.com' && password === 'demo1234') {
        setAdminUser({ id: 'demo-admin', email: 'admin@demo.com', role: 'admin' });
        navigate('/admin');
      } else {
        setError('Demo credentials: admin@demo.com / demo1234');
      }
      setLoading(false);
      return;
    }

    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError(authError.message || 'Invalid email or password.');
      setLoading(false);
      return;
    }

    setAdminUser(data.user);
    navigate('/admin');
  }

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
