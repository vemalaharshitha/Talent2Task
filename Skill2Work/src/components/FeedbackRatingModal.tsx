import React, { useState } from 'react';
import { Check, Star, ThumbsUp, X } from 'lucide-react';
import type { Job, User, Language } from '../types';
import { localizeContent } from '../i18n/translations';
import { useLanguage } from '../i18n/LanguageContext';

interface FeedbackRatingModalProps {
  job: Job;
  currentUser: User;
  language: Language;
  onClose: () => void;
  onSubmitReview: (review: {
    job_id: string;
    job_title: string;
    from_user_id: string;
    from_user_name: string;
    to_user_id: string;
    rating: number;
    tags: string[];
    comment: string;
  }) => void;
}

const RATING_TAGS_SEEKER = [
  'Punctual',
  'Skilled Worker',
  'Friendly & Polite',
  'Fast Execution',
  'Clean & Organized',
  'Followed Instructions'
];

const RATING_TAGS_RECRUITER = [
  'Prompt Payout',
  'Clear Instructions',
  'Supportive Work Environment',
  'Professional',
  'Accurate Description',
  'Great Experience'
];

export const FeedbackRatingModal: React.FC<FeedbackRatingModalProps> = ({
  job,
  currentUser,
  language,
  onClose,
  onSubmitReview
}) => {
  const { t } = useLanguage();
  const isRecruiter = currentUser.role === 'recruiter';
  const targetUserId = isRecruiter ? (job.claimed_by || 'usr_seeker_1') : job.recruiter_id;
  const targetUserName = isRecruiter ? (job.claimed_by_name || 'Job Seeker') : (job.recruiter_name || 'Recruiter');

  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [comment, setComment] = useState<string>('');

  const availableTags = isRecruiter ? RATING_TAGS_SEEKER : RATING_TAGS_RECRUITER;

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitReview({
      job_id: job.id,
      job_title: job.title,
      from_user_id: currentUser.id,
      from_user_name: currentUser.name,
      to_user_id: targetUserId,
      rating,
      tags: selectedTags,
      comment: comment.trim() || 'Work completed seamlessly on Talent2Task.'
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
      <div 
        className="glass-panel w-full max-w-lg rounded-3xl border border-slate-200 shadow-2xl bg-white overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-500">
              <Star className="w-6 h-6 fill-current" />
            </div>
            <div>
              <h2 className="font-heading text-lg font-bold text-slate-900">
                {t.feedbackTitle}
              </h2>
              <p className="text-xs text-slate-500">
                {t.feedbackSubtitle}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-5 text-sm">
          {/* Rating Target User info */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <div className="text-[11px] text-slate-500 font-semibold uppercase">{localizeContent(job.title, language)}</div>
              <div className="font-bold text-slate-900 text-sm mt-0.5">{targetUserName}</div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200">
              {localizeContent(job.category, language)}
            </span>
          </div>

          {/* Star Rating Selector */}
          <div className="space-y-2 text-center py-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              {t.ratingScoreLabel}
            </label>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1.5 transition-transform hover:scale-125 focus:outline-none"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= (hoverRating || rating)
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Positive Feedback Tags */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              {t.feedbackTagsLabel}
            </label>
            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    type="button"
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 border ${
                      isSelected
                        ? 'bg-amber-50 text-amber-900 border-amber-300 shadow-xs font-bold'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 text-amber-600" />}
                    <span>{localizeContent(tag, language)}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Detailed Comment Box */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              {t.commentLabel}
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={t.commentPlaceholder}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white transition-all resize-none"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-3 rounded-2xl text-xs sm:text-sm font-bold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
          >
            <ThumbsUp className="w-4 h-4" />
            <span>{t.submitReviewBtn}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
