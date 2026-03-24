import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

// Detect if we are in "demo / offline" mode (no real Supabase credentials)
export const IS_DEMO_MODE =
  !import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.VITE_SUPABASE_URL.includes('placeholder') ||
  import.meta.env.VITE_SUPABASE_ANON_KEY === 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ─── In-memory store for demo/offline mode ────────────────────────────────────
const _db = {
  organizations: [
    {
      id: 'demo-org-1',
      name: 'Demo Organization',
      code: 'DEMO001',
      industry: 'Technology',
      contact_email: 'demo@example.com',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'demo-org-2',
      name: 'Acme Healthcare',
      code: 'ACME001',
      industry: 'Healthcare',
      contact_email: 'security@acme.com',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  assessments: [],
  responses: {},
  users: [
    {
      id: 'demo-user-1',
      email: 'assessor@demo.com',
      organization_id: 'demo-org-1',
      role: 'user',
      created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      last_assessment_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'demo-user-2',
      email: 'security@acme.com',
      organization_id: 'demo-org-2',
      role: 'user',
      created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      last_assessment_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'demo-admin-1',
      email: 'admin@demo.com',
      organization_id: 'demo-org-1',
      role: 'admin',
      created_at: new Date().toISOString(),
      last_assessment_at: null,
    },
  ],
};

function genId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

// ─── Organization helpers ──────────────────────────────────────────────────────

export async function getOrganizationByCode(code) {
  if (IS_DEMO_MODE) {
    const org = _db.organizations.find(o => o.code === code.toUpperCase());
    return org
      ? { data: org, error: null }
      : { data: null, error: { message: 'Organization not found' } };
  }
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('code', code.toUpperCase())
    .single();
  return { data, error };
}

export async function createOrganization(org) {
  if (IS_DEMO_MODE) {
    const newOrg = {
      id: genId(),
      name: org.name,
      code: org.code.toUpperCase(),
      industry: org.industry || null,
      contact_email: org.contact_email || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    // Check for duplicate code
    if (_db.organizations.find(o => o.code === newOrg.code)) {
      return { data: null, error: { message: 'Organization code already exists' } };
    }
    _db.organizations.push(newOrg);
    return { data: newOrg, error: null };
  }
  const { data, error } = await supabase
    .from('organizations')
    .insert([{
      name: org.name,
      code: org.code.toUpperCase(),
      industry: org.industry || null,
      contact_email: org.contact_email || null,
    }])
    .select()
    .single();
  return { data, error };
}

export async function updateOrganization(id, updates) {
  if (IS_DEMO_MODE) {
    const idx = _db.organizations.findIndex(o => o.id === id);
    if (idx === -1) return { data: null, error: { message: 'Not found' } };
    // Check code uniqueness
    if (updates.code) {
      const conflict = _db.organizations.find(o => o.code === updates.code && o.id !== id);
      if (conflict) return { data: null, error: { message: 'Organization code already exists' } };
    }
    _db.organizations[idx] = { ..._db.organizations[idx], ...updates, updated_at: new Date().toISOString() };
    return { data: _db.organizations[idx], error: null };
  }
  const { data, error } = await supabase
    .from('organizations')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  return { data, error };
}

export async function deleteOrganization(id) {
  if (IS_DEMO_MODE) {
    _db.organizations = _db.organizations.filter(o => o.id !== id);
    _db.assessments = _db.assessments.filter(a => a.organization_id !== id);
    return { error: null };
  }
  const { error } = await supabase.from('organizations').delete().eq('id', id);
  return { error };
}

export async function getAllOrganizations() {
  if (IS_DEMO_MODE) {
    return { data: [..._db.organizations].sort((a, b) => b.created_at.localeCompare(a.created_at)), error: null };
  }
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .order('created_at', { ascending: false });
  return { data, error };
}

// ─── Assessment helpers ────────────────────────────────────────────────────────

export async function createAssessment(assessment) {
  if (IS_DEMO_MODE) {
    const newAssessment = {
      id: genId(),
      session_id: assessment.session_id || genId(),
      organization_id: assessment.organization_id,
      assessor_email: assessment.assessor_email,
      assessor_name: assessment.assessor_name || null,
      implementation_group: assessment.implementation_group || null,
      ig_screening_answers: assessment.ig_screening_answers || null,
      ig_screening_score: assessment.ig_screening_score || null,
      status: assessment.status || 'screening',
      current_safeguard_index: 0,
      organizational_risk_index: null,
      total_safeguards: assessment.total_safeguards || null,
      completed_safeguards: 0,
      completed_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    _db.assessments.push(newAssessment);
    return { data: newAssessment, error: null };
  }
  const { data, error } = await supabase
    .from('assessments')
    .insert([assessment])
    .select()
    .single();
  return { data, error };
}

export async function getAssessmentBySessionId(sessionId) {
  if (IS_DEMO_MODE) {
    const assessment = _db.assessments.find(a => a.session_id === sessionId);
    if (!assessment) return { data: null, error: { message: 'Session not found' } };
    const org = _db.organizations.find(o => o.id === assessment.organization_id);
    return { data: { ...assessment, organizations: org || null }, error: null };
  }
  const { data, error } = await supabase
    .from('assessments')
    .select('*, organizations(*)')
    .eq('session_id', sessionId)
    .single();
  return { data, error };
}

export async function updateAssessment(id, updates) {
  if (IS_DEMO_MODE) {
    const idx = _db.assessments.findIndex(a => a.id === id);
    if (idx === -1) return { data: null, error: { message: 'Not found' } };
    _db.assessments[idx] = { ..._db.assessments[idx], ...updates, updated_at: new Date().toISOString() };
    return { data: _db.assessments[idx], error: null };
  }
  const { data, error } = await supabase
    .from('assessments')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  return { data, error };
}

export async function getAllAssessments() {
  if (IS_DEMO_MODE) {
    const sorted = [..._db.assessments].sort((a, b) => b.created_at.localeCompare(a.created_at));
    return {
      data: sorted.map(a => ({
        ...a,
        organizations: _db.organizations.find(o => o.id === a.organization_id) || null,
      })),
      error: null,
    };
  }
  const { data, error } = await supabase
    .from('assessments')
    .select('*, organizations(name, code)')
    .order('created_at', { ascending: false });
  return { data, error };
}

export async function getAssessmentsByOrg(orgId) {
  if (IS_DEMO_MODE) {
    return {
      data: _db.assessments.filter(a => a.organization_id === orgId),
      error: null,
    };
  }
  const { data, error } = await supabase
    .from('assessments')
    .select('*')
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false });
  return { data, error };
}

// ─── Response helpers ──────────────────────────────────────────────────────────

export async function upsertResponse(response) {
  if (IS_DEMO_MODE) {
    const key = `${response.assessment_id}::${response.safeguard_id}`;
    _db.responses[key] = { id: genId(), ...response, updated_at: new Date().toISOString() };
    return { data: _db.responses[key], error: null };
  }
  const { data, error } = await supabase
    .from('assessment_responses')
    .upsert([response], { onConflict: 'assessment_id,safeguard_id' })
    .select()
    .single();
  return { data, error };
}

export async function getResponsesForAssessment(assessmentId) {
  if (IS_DEMO_MODE) {
    const responses = Object.values(_db.responses).filter(r => r.assessment_id === assessmentId);
    return { data: responses, error: null };
  }
  const { data, error } = await supabase
    .from('assessment_responses')
    .select('*')
    .eq('assessment_id', assessmentId)
    .order('safeguard_id');
  return { data, error };
}

// ─── Auth helpers ──────────────────────────────────────────────────────────────

export async function signInAdmin(email, password) {
  if (IS_DEMO_MODE) {
    // Accept demo credentials
    if (email === 'admin@demo.com' && password === 'demo1234') {
      return { data: { user: { id: 'demo-admin', email } }, error: null };
    }
    return { data: null, error: { message: 'Invalid credentials. Use admin@demo.com / demo1234 in demo mode.' } };
  }
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { data, error };
}

export async function signOutAdmin() {
  if (IS_DEMO_MODE) return { error: null };
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getCurrentUser() {
  if (IS_DEMO_MODE) return null;
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getAdminProfile(userId) {
  if (IS_DEMO_MODE) return { data: { role: 'admin' }, error: null };
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  return { data, error };
}

// ─── User management helpers ───────────────────────────────────────────────────

export async function getAllUsers() {
  if (IS_DEMO_MODE) {
    const users = _db.users.map(u => {
      const org = _db.organizations.find(o => o.id === u.organization_id) || null;
      const assessmentCount = _db.assessments.filter(a => a.assessor_email === u.email).length;
      return { ...u, organizations: org, assessment_count: assessmentCount };
    });
    return { data: users, error: null };
  }
  // Use app_users table (does not require Supabase Auth account)
  const { data, error } = await supabase
    .from('app_users')
    .select('*, organizations(name, code)')
    .order('created_at', { ascending: false });
  if (error) return { data: null, error };

  // Enrich with assessment counts
  const emails = (data || []).map(u => u.email);
  let countMap = {};
  if (emails.length > 0) {
    const { data: asmData } = await supabase
      .from('assessments')
      .select('assessor_email')
      .in('assessor_email', emails);
    (asmData || []).forEach(a => {
      countMap[a.assessor_email] = (countMap[a.assessor_email] || 0) + 1;
    });
  }

  return {
    data: (data || []).map(u => ({ ...u, assessment_count: countMap[u.email] || 0 })),
    error: null,
  };
}

export async function createUser(email, orgId, role = 'user') {
  if (IS_DEMO_MODE) {
    if (_db.users.find(u => u.email === email)) {
      return { data: null, error: { message: 'User with this email already exists' } };
    }
    const newUser = {
      id: genId(),
      email,
      organization_id: orgId,
      role,
      created_at: new Date().toISOString(),
      last_assessment_at: null,
    };
    _db.users.push(newUser);
    return { data: newUser, error: null };
  }
  // Insert into app_users (no Supabase Auth dependency — just a registry of known users)
  const { data, error } = await supabase
    .from('app_users')
    .insert([{
      email: email.toLowerCase().trim(),
      organization_id: orgId || null,
      role,
    }])
    .select('*, organizations(name, code)')
    .single();
  return { data, error };
}

export async function updateUser(id, updates) {
  if (IS_DEMO_MODE) {
    const idx = _db.users.findIndex(u => u.id === id);
    if (idx === -1) return { data: null, error: { message: 'User not found' } };
    _db.users[idx] = { ..._db.users[idx], ...updates };
    return { data: _db.users[idx], error: null };
  }
  const { data, error } = await supabase
    .from('app_users')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  return { data, error };
}

export async function deleteUser(id) {
  if (IS_DEMO_MODE) {
    _db.users = _db.users.filter(u => u.id !== id);
    return { error: null };
  }
  const { error } = await supabase.from('app_users').delete().eq('id', id);
  return { error };
}

// ─── Supabase diagnostics & admin setup ───────────────────────────────────────

/** Quick connection test — verifies the Supabase credentials work. */
export async function testConnection() {
  if (IS_DEMO_MODE) return { ok: true, mode: 'demo', message: 'Running in offline demo mode.' };
  try {
    const { error } = await supabase.from('organizations').select('id').limit(1);
    if (error) return { ok: false, mode: 'production', message: error.message };
    return { ok: true, mode: 'production', message: 'Connected to Supabase successfully.' };
  } catch (e) {
    return { ok: false, mode: 'production', message: e.message };
  }
}

/**
 * Check if the currently signed-in user has admin role in profiles.
 * Returns { isAdmin: bool, email: string|null }
 */
export async function checkIsAdmin() {
  if (IS_DEMO_MODE) return { isAdmin: true, email: 'admin@demo.com' };
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { isAdmin: false, email: null };
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, email')
    .eq('id', user.id)
    .single();
  return { isAdmin: profile?.role === 'admin', email: profile?.email || user.email };
}

/**
 * Claim admin access for the first user. Calls the make_first_admin() RPC
 * which only works when NO admin exists yet. Returns { success, message }.
 */
export async function claimFirstAdmin() {
  if (IS_DEMO_MODE) return { success: false, message: 'Not available in demo mode.' };
  const { data, error } = await supabase.rpc('make_first_admin');
  if (error) return { success: false, message: error.message };
  return data || { success: false, message: 'No response from server.' };
}
