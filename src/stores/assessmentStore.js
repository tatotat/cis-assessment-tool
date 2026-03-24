import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  calculateRiskScore,
  getRiskLevel,
  calculateIG1Expectancy,
  determineIG,
  getIGScore,
  calculateORI,
  generateSessionId,
} from '../lib/calculations';
import { getSafeguardsForIG } from '../lib/safeguards';
import {
  createAssessment,
  updateAssessment,
  upsertResponse,
  getAssessmentBySessionId,
  getResponsesForAssessment,
  getOrganizationByCode,
} from '../lib/supabase';

const useAssessmentStore = create(
  persist(
    (set, get) => ({
      // Session state
      sessionId: null,
      assessmentId: null,
      organization: null,
      assessorEmail: '',
      assessorName: '',

      // Screening
      screeningAnswers: [],
      implementationGroup: null,
      igScore: null,

      // Assessment progress
      safeguards: [],
      currentIndex: 0,
      responses: {}, // keyed by safeguard id
      status: 'idle', // idle | screening | in_progress | completed

      // Admin state
      adminUser: null,

      // UI state
      loading: false,
      error: null,
      saveStatus: 'idle', // idle | saving | saved | error

      // Initialize or resume a session
      async startSession(email, orgCode, isResume = false, resumeSessionId = null) {
        set({ loading: true, error: null });
        try {
          // Look up organization
          const { data: org, error: orgError } = await getOrganizationByCode(orgCode);
          if (orgError || !org) {
            set({ loading: false, error: 'Organization code not found. Please check your code and try again.' });
            return false;
          }

          if (isResume && resumeSessionId) {
            // Try to resume existing session
            const { data: assessment, error: assessError } = await getAssessmentBySessionId(resumeSessionId);
            if (assessError || !assessment) {
              set({ loading: false, error: 'Session not found. Please check your session ID.' });
              return false;
            }
            // Load responses
            const { data: existingResponses } = await getResponsesForAssessment(assessment.id);
            const responsesMap = {};
            if (existingResponses) {
              existingResponses.forEach(r => { responsesMap[r.safeguard_id] = r; });
            }
            const ig = assessment.implementation_group || 1;
            const safeguards = getSafeguardsForIG(ig);
            set({
              sessionId: assessment.session_id,
              assessmentId: assessment.id,
              organization: org,
              assessorEmail: assessment.assessor_email,
              assessorName: assessment.assessor_name || '',
              screeningAnswers: assessment.ig_screening_answers || [],
              implementationGroup: ig,
              igScore: assessment.ig_screening_score || null,
              safeguards,
              currentIndex: assessment.current_safeguard_index || 0,
              responses: responsesMap,
              status: assessment.status || 'in_progress',
              loading: false,
              error: null,
            });
            return true;
          } else {
            // New session
            const sessionId = generateSessionId();
            const { data: assessment, error: createError } = await createAssessment({
              session_id: sessionId,
              organization_id: org.id,
              assessor_email: email.toLowerCase(),
              status: 'screening',
            });
            if (createError || !assessment) {
              set({ loading: false, error: 'Failed to create assessment. Please try again.' });
              return false;
            }
            set({
              sessionId,
              assessmentId: assessment.id,
              organization: org,
              assessorEmail: email.toLowerCase(),
              screeningAnswers: [],
              implementationGroup: null,
              igScore: null,
              safeguards: [],
              currentIndex: 0,
              responses: {},
              status: 'screening',
              loading: false,
              error: null,
            });
            return true;
          }
        } catch (err) {
          set({ loading: false, error: err.message || 'An unexpected error occurred.' });
          return false;
        }
      },

      // Complete screening and set IG
      async completeScreening(answers, name) {
        const ig = determineIG(answers);
        const score = getIGScore(answers);
        const safeguards = getSafeguardsForIG(ig);
        const { assessmentId } = get();

        set({
          screeningAnswers: answers,
          implementationGroup: ig,
          igScore: score,
          safeguards,
          currentIndex: 0,
          assessorName: name || '',
          status: 'in_progress',
        });

        if (assessmentId) {
          await updateAssessment(assessmentId, {
            implementation_group: ig,
            ig_screening_answers: answers,
            ig_screening_score: score,
            assessor_name: name || null,
            total_safeguards: safeguards.length,
            status: 'in_progress',
          });
        }
      },

      // Save a response for the current safeguard
      async saveResponse(safeguardId, responseData) {
        set({ saveStatus: 'saving' });
        const { assessmentId, sessionId, responses, implementationGroup, safeguards } = get();

        const safeguard = safeguards.find(s => s.id === safeguardId);
        if (!safeguard) return;

        // Calculate risk score
        const riskScore = calculateRiskScore(responseData, implementationGroup);
        const riskLevel = getRiskLevel(riskScore, implementationGroup);

        // Calculate expectancy for IG1
        let expectancyScore = responseData.expectancy_score;
        if (implementationGroup === 1 && responseData.maturity_score) {
          expectancyScore = calculateIG1Expectancy(safeguard.assetClass, responseData.maturity_score);
        }

        const fullResponse = {
          ...responseData,
          assessment_id: assessmentId,
          session_id: sessionId,
          safeguard_id: safeguardId,
          control_number: safeguard.control,
          asset_class: safeguard.assetClass,
          expectancy_score: expectancyScore,
          risk_score: riskScore,
          risk_level: riskLevel,
        };

        const updatedResponses = { ...responses, [safeguardId]: fullResponse };
        set({ responses: updatedResponses });

        try {
          await upsertResponse(fullResponse);

          // Update assessment progress
          const completedCount = Object.values(updatedResponses).filter(r =>
            r.risk_score !== null && r.risk_score !== undefined
          ).length;

          if (assessmentId) {
            await updateAssessment(assessmentId, {
              completed_safeguards: completedCount,
            });
          }

          set({ saveStatus: 'saved' });
          setTimeout(() => set({ saveStatus: 'idle' }), 2000);
        } catch (err) {
          set({ saveStatus: 'error' });
          console.error('Failed to save response:', err);
        }
      },

      // Navigate to a specific safeguard index
      setCurrentIndex(index) {
        const { safeguards } = get();
        if (index >= 0 && index < safeguards.length) {
          set({ currentIndex: index });
        }
      },

      // Complete the assessment
      async completeAssessment() {
        const { assessmentId, responses, implementationGroup, safeguards } = get();
        const allResponses = Object.values(responses);
        const ori = calculateORI(allResponses, implementationGroup);

        set({ status: 'completed' });

        if (assessmentId) {
          await updateAssessment(assessmentId, {
            status: 'completed',
            organizational_risk_index: ori,
            completed_safeguards: allResponses.length,
            completed_at: new Date().toISOString(),
          });
        }
      },

      // Reset store
      reset() {
        set({
          sessionId: null,
          assessmentId: null,
          organization: null,
          assessorEmail: '',
          assessorName: '',
          screeningAnswers: [],
          implementationGroup: null,
          igScore: null,
          safeguards: [],
          currentIndex: 0,
          responses: {},
          status: 'idle',
          loading: false,
          error: null,
          saveStatus: 'idle',
        });
      },

      setAdminUser(user) {
        set({ adminUser: user });
      },

      clearError() {
        set({ error: null });
      },
    }),
    {
      name: 'cis-assessment-storage',
      partialize: (state) => ({
        sessionId: state.sessionId,
        assessmentId: state.assessmentId,
        organization: state.organization,
        assessorEmail: state.assessorEmail,
        assessorName: state.assessorName,
        screeningAnswers: state.screeningAnswers,
        implementationGroup: state.implementationGroup,
        igScore: state.igScore,
        safeguards: state.safeguards,
        currentIndex: state.currentIndex,
        responses: state.responses,
        status: state.status,
      }),
    }
  )
);

export default useAssessmentStore;
