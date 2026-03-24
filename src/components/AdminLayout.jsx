import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Shield, LayoutDashboard, Building2, ClipboardList,
  LogOut, Menu, X, ChevronRight, Users, Settings
} from 'lucide-react';
import { supabase, IS_DEMO_MODE } from '../lib/supabase';
import useAssessmentStore from '../stores/assessmentStore';

const navItems = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { path: '/admin/organizations', label: 'Organizations', icon: Building2 },
  { path: '/admin/assessments', label: 'Assessments', icon: ClipboardList },
  { path: '/admin/users', label: 'Users', icon: Users },
  { path: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const setAdminUser = useAssessmentStore(s => s.setAdminUser);
  const adminUser = useAssessmentStore(s => s.adminUser);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  async function handleSignOut() {
    if (!IS_DEMO_MODE) await supabase.auth.signOut();
    setAdminUser(null);
    navigate('/admin/login');
  }

  function isActive(item) {
    if (item.exact) return location.pathname === item.path;
    return location.pathname.startsWith(item.path);
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-primary-700">
        <Link to="/admin" className="flex items-center gap-3">
          <div className="bg-white/20 rounded-lg p-1.5">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-bold text-white text-sm">CIS RAM v2.1</div>
            <div className="text-xs text-primary-300">Admin Console</div>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(item => {
          const Icon = item.icon;
          const active = isActive(item);
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-primary-700 text-white'
                  : 'text-primary-200 hover:bg-primary-700/50 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
              {active && <ChevronRight className="w-4 h-4 ml-auto" />}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="px-3 py-4 border-t border-primary-700">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-primary-400 flex items-center justify-center text-white text-xs font-bold">
            {adminUser?.email?.charAt(0).toUpperCase() || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs text-primary-300 truncate">{adminUser?.email || 'Admin'}</div>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-primary-200 hover:bg-primary-700/50 hover:text-white transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
        <Link
          to="/"
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-primary-200 hover:bg-primary-700/50 hover:text-white transition-colors mt-1"
        >
          <Shield className="w-4 h-4" />
          Assessment Tool
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 flex-col bg-primary-600 fixed inset-y-0 left-0 z-10">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 inset-y-0 w-64 flex flex-col bg-primary-600 z-50">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 text-primary-200 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Mobile header */}
        <header className="md:hidden bg-primary-600 text-white px-4 py-3 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            <span className="font-semibold">Admin Console</span>
          </div>
        </header>

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
