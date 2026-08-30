import React from 'react';
import { ConditionRank, CONDITION_DETAILS } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface ConditionBadgeProps {
  rank: ConditionRank;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  showExplanation?: boolean;
  className?: string;
}

export const ConditionBadge: React.FC<ConditionBadgeProps> = ({
  rank,
  size = 'md',
  showLabel = true,
  showExplanation = false,
  className = '',
}) => {
  const { language, getRankLabel } = useLanguage();
  const detail = CONDITION_DETAILS[rank] || CONDITION_DETAILS.B;
  const localized = getRankLabel(rank);

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs font-semibold rounded-md',
    md: 'px-2.5 py-1 text-sm font-semibold rounded-md',
    lg: 'px-3.5 py-1.5 text-base font-bold rounded-lg',
  };

  return (
    <div className={`inline-flex flex-col ${className}`}>
      <span
        className={`inline-flex items-center gap-1.5 border shadow-2xs ${detail.badgeBg} ${detail.badgeText} ${detail.badgeBorder} ${sizeClasses[size]}`}
      >
        <span className="font-mono tracking-tight font-black">
          {language === 'ja' ? `ランク${rank}` : `RANK ${rank}`}
        </span>
        {showLabel && (
          <span className="font-medium text-xs opacity-90 border-l border-current/20 pl-1.5">
            {localized.label}
          </span>
        )}
      </span>
      {showExplanation && (
        <p className="mt-1.5 text-xs text-slate-600 leading-relaxed max-w-sm">
          {localized.desc}
        </p>
      )}
    </div>
  );
};

