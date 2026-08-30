import React from 'react';
import { ShieldCheck, Truck, HeartHandshake, Phone, Mail } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const Footer: React.FC = () => {
  const { language, t } = useLanguage();

  return (
    <footer className="bg-[#1a1a1a] text-gray-300 pt-12 pb-8 border-t border-gray-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Value Proposition Bento Grid Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-8 border-b border-gray-800">
          <div className="bg-white/5 rounded-2xl p-4.5 border border-white/10 flex items-start gap-3.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white mb-1">{t('footer.inspectionTitle')}</h4>
              <p className="text-gray-400 leading-relaxed text-[11px]">
                {t('footer.inspectionDesc')}
              </p>
            </div>
          </div>

          <div className="bg-white/5 rounded-2xl p-4.5 border border-white/10 flex items-start gap-3.5">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 shrink-0">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white mb-1">{t('footer.warrantyTitle')}</h4>
              <p className="text-gray-400 leading-relaxed text-[11px]">
                {t('footer.warrantyDesc')}
              </p>
            </div>
          </div>

          <div className="bg-white/5 rounded-2xl p-4.5 border border-white/10 flex items-start gap-3.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white mb-1">{t('footer.shippingTitle')}</h4>
              <p className="text-gray-400 leading-relaxed text-[11px]">
                {t('footer.shippingDesc')}
              </p>
            </div>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-8 py-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-black font-black text-sm">
                Re:
              </div>
              <span className="text-base font-black text-white tracking-tight">Re:Market</span>
            </div>
            <p className="text-[11px] text-gray-400 mb-3 leading-relaxed">
              {t('footer.companySummary')}
            </p>
            <div className="text-[11px] text-gray-400 space-y-1">
              <p className="flex items-center gap-1.5">
                <Phone className="w-3 h-3 text-gray-500" /> 03-1234-5678 (平日 10:00〜18:00 JST)
              </p>
              <p className="flex items-center gap-1.5">
                <Mail className="w-3 h-3 text-gray-500" /> support@remarket-reuse.jp
              </p>
            </div>
          </div>

          <div>
            <h5 className="font-bold text-white mb-3 text-xs">
              {language === 'ja' ? '商品カテゴリー' : 'Product Categories'}
            </h5>
            <ul className="space-y-1.5 text-gray-400 text-[11px]">
              <li><span className="hover:text-emerald-400 transition cursor-pointer">{language === 'ja' ? '中古カメラ・レンズ' : 'Used Cameras & Lenses'}</span></li>
              <li><span className="hover:text-emerald-400 transition cursor-pointer">{language === 'ja' ? '中古MacBook・ノートPC' : 'Used MacBooks & PCs'}</span></li>
              <li><span className="hover:text-emerald-400 transition cursor-pointer">{language === 'ja' ? '中古iPhone・スマホ' : 'Used iPhones & Smartphones'}</span></li>
              <li><span className="hover:text-emerald-400 transition cursor-pointer">{language === 'ja' ? '中古ゲーム機・ソフト' : 'Gaming & Consoles'}</span></li>
              <li><span className="hover:text-emerald-400 transition cursor-pointer">{language === 'ja' ? '中古ヘッドホン・音響' : 'Headphones & Audio'}</span></li>
              <li><span className="hover:text-emerald-400 transition cursor-pointer">{language === 'ja' ? '中古腕時計・G-SHOCK' : 'Watches & Wearables'}</span></li>
              <li><span className="hover:text-emerald-400 transition cursor-pointer">{language === 'ja' ? '中古アウトドア・工具' : 'Outdoor & Power Tools'}</span></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-white mb-3 text-xs">
              {language === 'ja' ? 'ご利用案内・サービス' : 'Customer Service & Guide'}
            </h5>
            <ul className="space-y-1.5 text-gray-400 text-[11px]">
              <li><span className="hover:text-emerald-400 transition cursor-pointer">{language === 'ja' ? '商品の状態ランク基準（S〜D）' : 'Condition Grading Standards (S-D)'}</span></li>
              <li><span className="hover:text-emerald-400 transition cursor-pointer">{language === 'ja' ? '宅配買取・店頭査定のご案内' : 'Trade-In Appraisal & Purchase'}</span></li>
              <li><span className="hover:text-emerald-400 transition cursor-pointer">{language === 'ja' ? 'お支払い方法・送料について' : 'Payment Methods & Shipping'}</span></li>
              <li><span className="hover:text-emerald-400 transition cursor-pointer">{language === 'ja' ? '返品・交換・動作保証規定' : 'Warranty & 14-Day Return Policy'}</span></li>
              <li><span className="hover:text-emerald-400 transition cursor-pointer">{language === 'ja' ? 'よくあるご質問（FAQ）' : 'Frequently Asked Questions (FAQ)'}</span></li>
              <li><span className="hover:text-emerald-400 transition cursor-pointer">{language === 'ja' ? '法人様向け買取・卸販売' : 'Corporate Trade-in & Wholesale'}</span></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-white mb-3 text-xs">
              {language === 'ja' ? 'コンプライアンス・古物営業法' : 'Legal & Compliance'}
            </h5>
            <div className="bg-white/5 p-3 rounded-xl border border-white/10 text-[11px] text-gray-300 space-y-1.5">
              <p className="font-semibold text-white">{language === 'ja' ? '古物商許可番号' : 'Antique Dealer License'}</p>
              <p className="text-gray-400">東京都公安委員会 第301000000000号</p>
              <p className="font-semibold text-white mt-2">{language === 'ja' ? '運営会社' : 'Operator'}</p>
              <p className="text-gray-400">Re:Market Inc. Reuse E-Commerce Div.</p>
              <p className="text-gray-400">〒150-0002 Shibuya, Tokyo, Japan</p>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-[10px] text-gray-500">
              <span className="hover:text-gray-300 cursor-pointer">{t('footer.law')}</span>
              <span>•</span>
              <span className="hover:text-gray-300 cursor-pointer">{t('footer.privacy')}</span>
              <span>•</span>
              <span className="hover:text-gray-300 cursor-pointer">{t('footer.terms')}</span>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-6 border-t border-gray-800 text-center text-gray-500 text-[11px]">
          <p>{t('footer.copyright')}</p>
        </div>
      </div>
    </footer>
  );
};


