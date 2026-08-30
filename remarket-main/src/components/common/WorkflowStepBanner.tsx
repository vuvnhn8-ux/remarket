import React from 'react';
import { RefreshCw, CheckCircle2, ShieldCheck, Box, Tag, ShoppingBag, Truck } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface WorkflowStepBannerProps {
  currentStep?: 'acquisition' | 'inspection' | 'inventory' | 'listing' | 'purchase' | 'shipping' | 'all';
  compact?: boolean;
}

export const WorkflowStepBanner: React.FC<WorkflowStepBannerProps> = ({
  currentStep = 'all',
  compact = false,
}) => {
  const { t } = useLanguage();

  const steps = [
    { id: 'acquisition', label: t('workflow.step1'), sub: t('workflow.step1Sub'), icon: RefreshCw },
    { id: 'inspection', label: t('workflow.step2'), sub: t('workflow.step2Sub'), icon: ShieldCheck },
    { id: 'inventory', label: t('workflow.step3'), sub: t('workflow.step3Sub'), icon: Tag },
    { id: 'listing', label: t('workflow.step4'), sub: t('workflow.step4Sub'), icon: Box },
    { id: 'purchase', label: t('workflow.step5'), sub: t('workflow.step5Sub'), icon: ShoppingBag },
    { id: 'shipping', label: t('workflow.step6'), sub: t('workflow.step6Sub'), icon: Truck },
  ];

  if (compact) {
    return (
      <div className="bg-[#1a1a1a] text-white px-4 py-2 text-xs flex items-center justify-between overflow-x-auto gap-2">
        <div className="flex items-center gap-1.5 shrink-0 font-medium text-emerald-400">
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Used-Goods Resale Model:</span>
        </div>
        <div className="flex items-center gap-1.5 text-gray-300 overflow-x-auto whitespace-nowrap">
          {steps.map((step, idx) => (
            <React.Fragment key={step.id}>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  currentStep === step.id
                    ? 'bg-emerald-500 text-black font-black'
                    : 'bg-white/10 text-gray-300'
                }`}
              >
                {step.label}
              </span>
              {idx < steps.length - 1 && <span className="text-gray-600">→</span>}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-2">
      <div className="bg-white border border-gray-200/80 rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <span className="bg-gray-100 text-gray-800 text-xs px-2.5 py-1 rounded-full font-mono font-bold border border-gray-200 flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
              Consumer → Used-goods Company → Consumer
            </span>
            <h3 className="text-xs sm:text-sm font-bold text-[#1a1a1a]">
              Re:Market {t('workflow.model')}
            </h3>
          </div>
          <span className="text-[11px] text-gray-500">
            {t('workflow.subtitle')}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {steps.map((step) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id || currentStep === 'all';
            return (
              <div
                key={step.id}
                className={`p-2.5 rounded-xl border transition-all ${
                  isActive
                    ? 'bg-[#f8f9fa] border-gray-300 text-gray-900 shadow-2xs'
                    : 'bg-gray-50/50 border-gray-100 opacity-60 text-gray-500'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-0.5">
                  <div className={`p-1 rounded-md ${isActive ? 'bg-black text-white' : 'bg-gray-200 text-gray-600'}`}>
                    <Icon className="w-3 h-3" />
                  </div>
                  <span className="text-[11px] font-bold tracking-tight">{step.label}</span>
                </div>
                <p className="text-[10px] text-gray-500 pl-6">{step.sub}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

