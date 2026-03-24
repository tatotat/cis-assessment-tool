import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';
import Home from './pages/Home';
import Screening from './pages/Screening';
import Assessment from './pages/Assessment';
import Report from './pages/Report';
import AdminDashboard from './pages/admin/Dashboard';
import Organizations from './pages/admin/Organizations';
import AssessmentsList from './pages/admin/AssessmentsList';
import AdminLogin from './pages/admin/Login';
import AdminUsers from './pages/admin/Users';
import AdminSettings from './pages/admin/Settings';
import { supabase, IS_DEMO_MODE } from './lib/supabase';
import useAssessmentStore from './stores/assessmentStore';

function ProtectedAdminRoute({ children }) {
  const [session, setSession] = useState(undefined);
  const setAdminUser = useAssessmentStore(s => s.setAdminUser);
  const adminUser = useAssessmentStore(s => s.adminUser);

  useEffect(() => {
    // In demo mode, check our in-memory admin user state
    if (IS_DEMO_MODE) {
      // If adminUser is already set in store (from demo login), allow through
      setSession(adminUser ? { user: adminUser } : null);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAdminUser(session?.user || null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setAdminUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, [adminUser]);

  if (session === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public assessment flow */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="screening" element={<Screening />} />
          <Route path="assessment" element={<Assessment />} />
          <Route path="report" element={<Report />} />
        </Route>

        {/* Admin login (no layout) */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Protected admin area */}
        <Route
          path="/admin"
          element={
            <ProtectedAdminRoute>
              <AdminLayout />
            </ProtectedAdminRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="organizations" element={<Organizations />} />
          <Route path="assessments" element={<AssessmentsList />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
