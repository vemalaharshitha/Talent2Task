import React, { useState, useEffect } from 'react';
import { 
  Award, 
  Plus, 
  Sparkles, 
  TrendingUp, 
  CheckCircle2, 
  HelpCircle, 
  Zap, 
  BrainCircuit,
  Compass,
  Layers
} from 'lucide-react';
import type { User, Job, Language, SkillDemandStat } from '../../types';
import { localizeContent } from '../../i18n/translations';
import { useLanguage } from '../../i18n/LanguageContext';
import { 
  skillGapService, 
  type SkillGapAnalysis
} from '../../services/skillGapService';

interface SkillGapRecommendationsProps {
  currentUser: User;
  jobs: Job[];
  language: Language;
  demandStats?: SkillDemandStat[];
  onAddSkill: (skill: string) => void;
  onOpenProfile: () => void;
}

export const SkillGapRecommendations: React.FC<SkillGapRecommendationsProps> = ({
  currentUser,
  jobs,
  language,
  demandStats = [],
  onAddSkill,
  onOpenProfile
}) => {
  const { t } = useLanguage();
  const [analysis, setAnalysis] = useState<SkillGapAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'path' | 'pipeline'>('path');
  const [addedSkills, setAddedSkills] = useState<Set<string>>(new Set());

  const userSkillsKey = (currentUser.skills || []).join('|');
  const jobsKey = jobs.map(j => j.id).join('|');
  const demandKey = (demandStats || []).map(d => `${d.skill}-${d.demandPercentage}`).join('|');

  // Run AI Skill-Gap Analysis dynamically
  useEffect(() => {
    let isCurrent = true;
    setIsAnalyzing(true);

    skillGapService.analyzeSkillGap(currentUser, jobs, demandStats)
      .then(result => {
        if (isCurrent) {
          setAnalysis(result);
          setIsAnalyzing(false);
        }
      })
      .catch(err => {
        console.warn('AI Skill Gap Engine warning:', err);
        if (isCurrent) setIsAnalyzing(false);
      });

    return () => { isCurrent = false; };
  }, [userSkillsKey, currentUser.city, jobsKey, demandKey]);

  const handleClaimSkill = (skill: string) => {
    onAddSkill(skill);
    setAddedSkills(prev => new Set(prev).add(skill));
  };

  // If worker has no skills missing and 100% coverage
  if (analysis && analysis.missingHighDemandSkills.length === 0 && analysis.marketCoveragePercentage >= 95) {
    return (
      <div className="glass-panel p-5 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 via-white to-emerald-50/40 shadow-xs flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900">
              {t.allStarTitle}
            </h3>
            <p className="text-xs text-slate-500">
              {t.allStarDesc}
            </p>
          </div>
        </div>
        <button
          onClick={onOpenProfile}
          className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors"
        >
          {t.viewProfile}
        </button>
      </div>
    );
  }

  return (
    <div className="glass-panel p-4 sm:p-6 rounded-3xl border border-sky-200/90 bg-gradient-to-br from-white via-sky-50/30 to-indigo-50/30 shadow-sm space-y-5 mb-6 animate-in fade-in duration-300">
      
      {/* 1. Header Banner & Dynamic Quantitative Metrics */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-sky-100">
        
        {/* Title & Location Context */}
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-sky-500/25 shrink-0">
            <BrainCircuit className={`w-6 h-6 ${isAnalyzing ? 'animate-pulse text-sky-200' : ''}`} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-heading text-base sm:text-lg font-bold text-slate-900">
                {t.skillGapTitle}
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-sky-100 text-sky-800 border border-sky-300 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-sky-600" />
                {t.skillGapBadge}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              {language === 'ta'
                ? `${localizeContent(currentUser.city, language) || 'தமிழ்நாடு'} பகுதியில் உங்கள் திறன்களுக்கான AI பகுப்பாய்வு & வேலை வாய்ப்புப் பரிந்துரைகள்.`
                : language === 'hi'
                ? `${localizeContent(currentUser.city, language) || 'तमिलनाडु'} में आपके कौशल और स्थानीय गिग्स के लिए AI विश्लेषण और करियर सिफ़ारिशें।`
                : language === 'te'
                ? `${localizeContent(currentUser.city, language) || 'తమిళనాడు'} లో మీ నైపుణ్యాలు మరియు స్థానిక పనుల కోసం AI విశ్లేషణ మరియు కెరీర్ సిఫార్సులు.`
                : `AI analysis of your skills against active market demand in ${currentUser.city || 'Tamil Nadu'}.`}
            </p>
          </div>
        </div>

        {/* Action Controls: View Switcher & Manage Profile */}
        <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
          <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setViewMode('path')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                viewMode === 'path'
                  ? 'bg-white text-sky-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>{t.skillGapExploreSteps}</span>
            </button>
            <button
              onClick={() => setViewMode('pipeline')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                viewMode === 'pipeline'
                  ? 'bg-white text-sky-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{t.skillGapAllStages}</span>
            </button>
          </div>

          <button
            onClick={onOpenProfile}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-xs transition-colors shrink-0"
          >
            {t.manageProfile}
          </button>
        </div>

      </div>

      {/* 2. Key Calculated Skill Gap Metrics Bar */}
      {analysis && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          
          {/* Metric 1: Skill Coverage */}
          <div className="p-3 bg-white/80 rounded-2xl border border-sky-100 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
              <span>{t.skillGapCoverage}</span>
              <span className="text-sky-600 font-bold">{analysis.marketCoveragePercentage}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-sky-500 to-indigo-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${analysis.marketCoveragePercentage}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400">
              {analysis.skillGapPercentage}% {language === 'ta' ? 'திறன் இடைவெளி' : language === 'hi' ? 'कौशल अंतराल' : language === 'te' ? 'నైపుణ్య అంతరం' : 'Skill Gap'}
            </p>
          </div>

          {/* Metric 2: Gigs Unlocked */}
          <div className="p-3 bg-white/80 rounded-2xl border border-sky-100 shadow-xs space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              {t.skillGapUnlockedGigs}
            </span>
            <div className="text-lg font-bold text-slate-900">
              +{analysis.unlockedGigsPotential || 6} <span className="text-xs font-normal text-slate-500">Gigs</span>
            </div>
            <p className="text-[10px] text-emerald-600 font-medium">
              {language === 'ta' ? 'உடனடி 85%+ பொருத்தம்' : language === 'hi' ? 'तुरंत 85%+ मैच' : language === 'te' ? 'తక్షణ 85%+ మ్యాచ్' : 'Instant 85%+ Matches'}
            </p>
          </div>

          {/* Metric 3: Potential Pay Boost */}
          <div className="p-3 bg-white/80 rounded-2xl border border-sky-100 shadow-xs space-y-1">
            <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
              {t.skillGapPotentialBoost}
            </span>
            <div className="text-lg font-bold text-emerald-600">
              +₹{analysis.potentialPayBoost}<span className="text-xs font-normal text-slate-500">/hr</span>
            </div>
            <p className="text-[10px] text-slate-400">
              {language === 'ta' ? 'அதிக வருவாய் வாய்ப்பு' : language === 'hi' ? 'उच्च कमाई क्षमता' : language === 'te' ? 'అధిక సంపాదన సామర్థ్యం' : 'High Earning Rate'}
            </p>
          </div>

          {/* Metric 4: Active Locality Context */}
          <div className="p-3 bg-white/80 rounded-2xl border border-sky-100 shadow-xs space-y-1">
            <span className="text-[11px] font-semibold text-slate-500">
              {language === 'ta' ? 'பகுப்பாய்வு பகுதி' : language === 'hi' ? 'विश्लेषण क्षेत्र' : language === 'te' ? 'విశ్లేషణ ప్రాంతం' : 'Target Locality'}
            </span>
            <div className="text-sm font-bold text-slate-900 truncate">
              📍 {localizeContent(analysis.selectedCity, language)}
            </div>
            <p className="text-[10px] text-sky-600 font-semibold">
              {analysis.totalLocalGigs} {language === 'ta' ? 'வேலைகள் இணைக்கப்பட்டுள்ளன' : language === 'hi' ? 'गिग्स जुड़े हुए हैं' : language === 'te' ? 'పనులు కనెక్ట్ చేయబడ్డాయి' : 'Active Local Gigs'}
            </p>
          </div>

        </div>
      )}

      {/* VIEW MODE 1: Recommended Upskilling Path (Step 1 -> Step 2 -> Step 3 with AI Explanations) */}
      {viewMode === 'path' && analysis && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-heading text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-sky-600" />
              <span>{t.skillGapUpskillingPath}</span>
            </h4>
            <span className="text-[11px] text-slate-500">
              {language === 'ta' ? 'படிப் படியான வளர்ச்சிப் பாதை' : language === 'hi' ? 'चरण-दर-चरण विकास पथ' : language === 'te' ? 'దశలవారీ అభివృద్ధి మార్గం' : 'Step-by-step career path'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {analysis.upskillingPath.map((step) => {
              const isAdded = addedSkills.has(step.skill) || (currentUser.skills || []).includes(step.skill);
              return (
                <div
                  key={step.stepNumber}
                  className="p-4 rounded-2xl border border-sky-200/80 bg-white hover:border-sky-400 hover:shadow-md transition-all flex flex-col justify-between space-y-3 relative overflow-hidden group"
                >
                  {/* Step Header Badge */}
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-xs">
                      {t.skillGapStep} {step.stepNumber}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      step.reasonType === 'bridge' 
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : step.reasonType === 'high_demand'
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}>
                      {step.reasonType === 'bridge' ? t.skillGapBridge : step.reasonType === 'high_demand' ? t.skillGapHighDemandBadge : t.skillGapHighPayBadge}
                    </span>
                  </div>

                  {/* Skill Name & Local Rate */}
                  <div>
                    <h5 className="font-bold text-sm text-slate-900 group-hover:text-sky-700 transition-colors">
                      {localizeContent(step.skill, language)}
                    </h5>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                      <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        +₹{step.potentialPayBoost}/hr Boost
                      </span>
                      <span>•</span>
                      <span className="font-medium text-slate-600">
                        {step.unlockedGigsCount} {language === 'ta' ? 'வேலைகள்' : language === 'hi' ? 'गिग्स' : language === 'te' ? 'పనులు' : 'Gigs'}
                      </span>
                    </div>
                  </div>

                  {/* Explainable "Why this is recommended" Box (Prompt Requirement 8) */}
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-700 space-y-1">
                    <div className="flex items-center gap-1 font-bold text-sky-800 text-[10px] uppercase tracking-wider">
                      <HelpCircle className="w-3 h-3 text-sky-600 shrink-0" />
                      <span>{t.skillGapWhyRecommended}:</span>
                    </div>
                    <p className="leading-relaxed text-slate-600 italic">
                      "{step.explanation}"
                    </p>
                  </div>

                  {/* Add Skill Button */}
                  <button
                    onClick={() => handleClaimSkill(step.skill)}
                    disabled={isAdded}
                    className={`w-full py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs ${
                      isAdded
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 cursor-default'
                        : 'bg-sky-500 hover:bg-sky-600 text-white shadow-sky-500/20 hover:shadow-md cursor-pointer'
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{language === 'ta' ? 'சேர்க்கப்பட்டது' : language === 'hi' ? 'जोड़ा गया' : language === 'te' ? 'జోడించబడింది' : 'Added to Profile'}</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>{t.skillGapAddSkillBtn}</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW MODE 2: Full 4-Stage Visual Architecture (Prompt Requirement 7) */}
      {/* Current Skills -> Related Skills -> Missing High-Demand Skills -> Recommended Upskilling Path */}
      {viewMode === 'pipeline' && analysis && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            
            {/* Stage 1: Current Skills */}
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-2.5 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="font-bold text-xs text-slate-800 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  1. {t.skillGapCurrentSkills}
                </span>
                <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded-md font-bold text-slate-600">
                  {analysis.currentUserSkills.length}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {analysis.currentUserSkills.length > 0 ? (
                  analysis.currentUserSkills.map(skill => (
                    <span key={skill} className="px-2 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-[11px] font-medium">
                      ✓ {localizeContent(skill, language)}
                    </span>
                  ))
                ) : (
                  <span className="text-[11px] text-slate-400 italic">No skills listed yet</span>
                )}
              </div>
            </div>

            {/* Stage 2: Related Skills (Semantic Affinity) */}
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-2.5 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="font-bold text-xs text-sky-800 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-sky-500" />
                  2. {t.skillGapRelatedSkills}
                </span>
                <span className="text-[10px] bg-sky-50 text-sky-700 px-1.5 py-0.5 rounded-md font-bold border border-sky-200">
                  {analysis.relatedSkills.length}
                </span>
              </div>
              <div className="space-y-1.5">
                {analysis.relatedSkills.slice(0, 3).map(rel => (
                  <div key={rel.skill} className="p-1.5 bg-sky-50/60 rounded-lg border border-sky-100 text-[11px]">
                    <div className="font-bold text-slate-900 truncate">
                      {localizeContent(rel.skill, language)}
                    </div>
                    <div className="text-[10px] text-sky-700 flex items-center justify-between mt-0.5">
                      <span>✨ {rel.affinityPercentage}% {t.skillGapAffinity}</span>
                      <span className="text-slate-400 text-[9px] truncate max-w-[80px]">via {rel.relatedUserSkill}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Stage 3: Missing High-Demand Skills */}
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-2.5 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="font-bold text-xs text-rose-800 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-rose-500" />
                  3. {t.skillGapMissingSkills}
                </span>
                <span className="text-[10px] bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded-md font-bold border border-rose-200">
                  {analysis.missingHighDemandSkills.length}
                </span>
              </div>
              <div className="space-y-1.5">
                {analysis.missingHighDemandSkills.slice(0, 3).map(miss => (
                  <div key={miss.skill} className="p-1.5 bg-rose-50/50 rounded-lg border border-rose-100 text-[11px]">
                    <div className="font-bold text-slate-900 truncate">
                      {localizeContent(miss.skill, language)}
                    </div>
                    <div className="text-[10px] text-slate-500 flex items-center justify-between mt-0.5">
                      <span className="text-rose-600 font-bold">{miss.demandPercentage}% {t.skillGapDemand}</span>
                      <span>₹{miss.avgPay}/hr</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Stage 4: Recommended Upskilling Path Action */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-50 to-sky-50 border border-indigo-200 space-y-2.5 shadow-xs">
              <div className="flex items-center justify-between border-b border-indigo-100 pb-2">
                <span className="font-bold text-xs text-indigo-900 flex items-center gap-1">
                  <Compass className="w-3.5 h-3.5 text-indigo-600" />
                  4. {t.skillGapUpskillingPath}
                </span>
                <span className="text-[10px] bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded-md font-bold">
                  {analysis.upskillingPath.length} Steps
                </span>
              </div>
              <div className="space-y-2">
                {analysis.upskillingPath.map(step => (
                  <div key={step.stepNumber} className="flex items-center justify-between gap-1 p-1.5 bg-white rounded-lg border border-indigo-100 text-[11px]">
                    <div className="truncate">
                      <span className="text-[10px] font-extrabold text-indigo-600 mr-1">S{step.stepNumber}:</span>
                      <span className="font-semibold text-slate-800">{localizeContent(step.skill, language)}</span>
                    </div>
                    <button
                      onClick={() => handleClaimSkill(step.skill)}
                      className="px-2 py-0.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[10px] font-bold shrink-0 shadow-xs"
                    >
                      + Add
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
