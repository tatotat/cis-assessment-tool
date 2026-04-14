import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Info, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import useAssessmentStore from '../stores/assessmentStore';
import clsx from 'clsx';

// IG display config (colors only — labels/descriptions come from translations)
const IG_COLORS = {
  1: { color: 'bg-green-50 border-green-200 text-green-800', badgeColor: 'bg-green-100 text-green-800', safeguardCount: 56 },
  2: { color: 'bg-blue-50 border-blue-200 text-blue-800', badgeColor: 'bg-blue-100 text-blue-800', safeguardCount: 130 },
  3: { color: 'bg-purple-50 border-purple-200 text-purple-800', badgeColor: 'bg-purple-100 text-purple-800', safeguardCount: 153 },
};

function calculateIG(answers) {
  if (answers.length < 5 || answers.some(a => !a)) return null;
  const avg = answers.reduce((a, b) => a + b, 0) / answers.length;
  if (avg <= 1.6) return 1;
  if (avg <= 2.3) return 2;
  return 3;
}

export default function Screening() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { completeScreening, status, sessionId, organization } = useAssessmentStore();

  // Build question list from translations
  const SCREENING_QUESTIONS = [1, 2, 3, 4, 5].map(id => ({
    id,
    question: t(`screening.questions.${id}.question`),
    description: t(`screening.questions.${id}.description`),
    options: [1, 2, 3].map(v => ({
      value: v,
      label: t(`screening.questions.${id}.options.${v}.label`),
      detail: t(`screening.questions.${id}.options.${v}.detail`),
      ig: `IG${v}`,
    })),
  }));

  const [answers, setAnswers] = useState(Array(5).fill(null));
  const [name, setName] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!sessionId) {
      navigate('/');
    }
  }, [sessionId]);

  const allAnswered = answers.every(a => a !== null);
  const projectedIG = allAnswered ? calculateIG(answers) : null;

  async function handleContinue() {
    if (!allAnswered) return;
    if (!showResult) {
      setShowResult(true);
      return;
    }
    setSubmitting(true);
    await completeScreening(answers, name);
    navigate('/assessment');
  }

  function handleAnswer(questionIdx, value) {
    const updated = [...answers];
    updated[questionIdx] = value;
    setAnswers(updated);
    if (showResult) setShowResult(false);
  }

  const igColors = projectedIG ? IG_COLORS[projectedIG] : null;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('screening.title')}</h1>
        <p className="text-gray-600">
          {t('screening.description')}
        </p>
        {organization && (
          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-primary-50 border border-primary-200 rounded-lg text-sm text-primary-700">
            <span className="font-medium">{organization.name}</span>
            <span className="text-primary-400">|</span>
            <span className="font-mono text-xs">{organization.code}</span>
          </div>
        )}
      </div>

      {/* Assessor name */}
      <div className="card mb-6">
        <div className="card-body">
          <label className="label">
            <User className="w-4 h-4 inline mr-1" />
            {t('screening.yourName')}
          </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder={t('screening.namePlaceholder')}
            className="input-field max-w-sm"
          />
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-6">
        {SCREENING_QUESTIONS.map((q, idx) => (
          <div key={q.id} className="card">
            <div className="card-header">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                  {q.id}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{q.question}</h3>
                  <p className="text-sm text-gray-500 mt-0.5">{q.description}</p>
                </div>
              </div>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {q.options.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleAnswer(idx, opt.value)}
                    className={clsx(
                      'flex flex-col items-start p-4 rounded-xl border-2 transition-all duration-150 text-left',
                      answers[idx] === opt.value
                        ? 'border-primary-500 bg-primary-50 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    )}
                  >
                    <div className="flex items-center justify-between w-full mb-2">
                      <span className={clsx(
                        'text-xs font-bold px-2 py-0.5 rounded-full',
                        answers[idx] === opt.value ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'
                      )}>
                        {opt.ig}
                      </span>
                      <div className={clsx(
                        'w-4 h-4 rounded-full border-2 flex items-center justify-center',
                        answers[idx] === opt.value ? 'border-primary-500 bg-primary-500' : 'border-gray-300'
                      )}>
                        {answers[idx] === opt.value && (
                          <div className="w-2 h-2 rounded-full bg-white" />
                        )}
                      </div>
                    </div>
                    <div className="font-semibold text-gray-800 text-sm">{opt.label}</div>
                    <div className="text-xs text-gray-500 mt-1 leading-relaxed">{opt.detail}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Live IG Preview */}
      {projectedIG && !showResult && (
        <div className={clsx('mt-6 p-4 rounded-xl border-2 transition-all', igColors?.color)}>
          <div className="flex items-center gap-2">
            <Info className="w-5 h-5 flex-shrink-0" />
            <div>
              <span className="font-semibold">{t('screening.basedOnAnswers')} </span>
              <span className="font-bold">{t(`screening.ig.${projectedIG}.label`)}</span>
              <span className="text-sm ml-2">({igColors.safeguardCount} {t('assessment.safeguardsUnit')})</span>
            </div>
          </div>
        </div>
      )}

      {/* IG Result */}
      {showResult && projectedIG && igColors && (
        <div className={clsx('mt-6 p-6 rounded-xl border-2', igColors.color)}>
          <div className="flex items-start gap-4">
            <div className={clsx('px-3 py-2 rounded-lg text-lg font-black', igColors.badgeColor)}>
              {`IG${projectedIG}`}
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg">{t(`screening.ig.${projectedIG}.label`)}</h3>
              <p className="text-sm mt-1 opacity-90">{t(`screening.ig.${projectedIG}.description`)}</p>
              <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="font-medium">{t('screening.safeguardsLabel')} </span>
                  <span className="font-bold">{igColors.safeguardCount}</span>
                </div>
                <div>
                  <span className="font-medium">{t('screening.scoringLabel')} </span>
                  <span>{t(`screening.ig.${projectedIG}.scaleInfo`)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Progress indicator */}
      <div className="flex items-center gap-2 mt-4 text-sm text-gray-500">
        {answers.map((a, i) => (
          <div key={i} className={clsx(
            'w-2.5 h-2.5 rounded-full transition-colors',
            a !== null ? 'bg-primary-500' : 'bg-gray-300'
          )} />
        ))}
        <span className="ml-1">{t('screening.answeredCount', { count: answers.filter(a => a !== null).length })}</span>
      </div>

      {/* Actions */}
      <div className="mt-6 flex justify-between items-center">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="btn-secondary"
        >
          {t('screening.back')}
        </button>

        <button
          type="button"
          onClick={handleContinue}
          disabled={!allAnswered || submitting}
          className="btn-primary px-6 py-3"
        >
          {submitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              {t('screening.startingAssessment')}
            </>
          ) : showResult ? (
            <>
              {t('screening.startAssessment')}
              <ArrowRight className="w-5 h-5" />
            </>
          ) : (
            <>
              {t('screening.reviewResult')}
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
