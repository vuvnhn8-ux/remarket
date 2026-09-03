import React, { useState } from 'react';
import {
  ShieldCheck,
  Heart,
  ShoppingCart,
  Zap,
  ArrowLeft,
  Truck,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Package,
  Info,
  Calendar,
  UserCheck,
  Hash,
  Sparkles,
  Share2,
} from 'lucide-react';
import { ProductItem, CONDITION_DETAILS } from '../../types';
import { ConditionBadge } from '../common/ConditionBadge';
import { useLanguage } from '../../context/LanguageContext';

interface ProductDetailPageProps {
  product: ProductItem;
  isFavorite: boolean;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onAddToCart: (product: ProductItem) => void;
  onBuyNow: (product: ProductItem) => void;
  onBack: () => void;
  onOpenAiAssistant: () => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product,
  isFavorite,
  onToggleFavorite,
  onAddToCart,
  onBuyNow,
  onBack,
  onOpenAiAssistant,
}) => {
  const { language, t, getRankLabel, getCategoryName } = useLanguage();
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [addedToast, setAddedToast] = useState<boolean>(false);

  const images = product.images && product.images.length > 0
    ? product.images
    : [product.featuredImage];

  const rankInfo = getRankLabel(product.conditionRank);
  const rawRankInfo = CONDITION_DETAILS[product.conditionRank] || CONDITION_DETAILS.B;

  const discountPercent =
    product.originalRetailPrice && product.originalRetailPrice > product.price
      ? Math.round(((product.originalRetailPrice - product.price) / product.originalRetailPrice) * 100)
      : null;

  const handleAddToCartClick = () => {
    onAddToCart(product);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Breadcrumb / Back Button */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-700 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('product.backToList')}</span>
        </button>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>{t('product.managementId')}:</span>
          <span className="font-mono font-bold text-slate-800">{product.id}</span>
        </div>
      </div>

      {/* Main Detail Grid (Left: Images, Right: Pricing & Purchase) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Multi-Angle Real Photo Gallery (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Large Image */}
          <div className="relative aspect-4/3 bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 shadow-xs">
            <img
              src={images[selectedImageIndex] || product.featuredImage}
              alt={product.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center"
            />

            {/* Sold Banner */}
            {product.isSold && (
              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center">
                <span className="bg-rose-600 text-white text-base font-black px-6 py-2.5 rounded-lg tracking-wider shadow-lg">
                  {language === 'ja' ? '売却済み (SOLD OUT)' : 'SOLD OUT'}
                </span>
              </div>
            )}

            {/* Condition Badge on photo */}
            <div className="absolute top-3 left-3 z-10">
              <ConditionBadge rank={product.conditionRank} size="lg" showLabel={true} />
            </div>

            {/* Real Item Photo Notice */}
            <div className="absolute bottom-3 left-3 z-10 bg-slate-900/80 backdrop-blur-2xs text-white text-xs px-2.5 py-1 rounded-md font-medium flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t('product.realPhotoNotice')}</span>
            </div>
          </div>

          {/* Thumbnail Strip */}
          {images.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-20 h-16 rounded-lg overflow-hidden border-2 transition shrink-0 cursor-pointer ${
                    selectedImageIndex === idx
                      ? 'border-emerald-600 ring-2 ring-emerald-500/20 shadow-xs'
                      : 'border-slate-200 hover:border-slate-400 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" loading="lazy" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Transparent Condition Disclosure Panel (状態の完全開示) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">{t('product.conditionDisclosure')}</h3>
              </div>
              <span className="text-xs bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded border border-emerald-200">
                {t('product.inspectorVerified')}
              </span>
            </div>

            {/* Rank Criteria Box */}
            <div className={`p-4 rounded-xl border ${rawRankInfo.badgeBg} ${rawRankInfo.badgeBorder}`}>
              <div className="flex items-center gap-2 mb-1.5">
                <span className={`font-mono font-black text-sm ${rawRankInfo.badgeText}`}>
                  {language === 'ja' ? `ランク${product.conditionRank}判定の基準` : `Rank ${product.conditionRank} Grading Criteria`}
                </span>
                <span className="text-xs font-semibold text-slate-700">（{rankInfo.label}）</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                {rankInfo.desc}
              </p>
            </div>

            {/* Inspection Checklist Table */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Exterior Check */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h4 className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  {t('product.exteriorCheck')}
                </h4>
                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span>{t('product.scratches')}:</span>
                    <span className="font-semibold text-slate-800">
                      {product.defects && product.defects.length > 0
                        ? product.defects.join('、')
                        : (language === 'ja' ? '目立つ傷なし' : 'No noticeable scratches')}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span>{t('product.dents')}:</span>
                    <span className="font-semibold text-slate-800">
                      {language === 'ja' ? 'なし' : 'None'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>{t('product.cleaning')}:</span>
                    <span className="font-semibold text-slate-800">
                      {language === 'ja' ? 'クリーニング・除菌済' : 'Cleaned & Sanitized'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Function Check */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h4 className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  {t('product.functionCheck')}
                </h4>
                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span>{t('product.powerOn')}:</span>
                    <span className="font-semibold text-emerald-700">
                      {language === 'ja' ? '正常動作確認済' : 'Passed & Tested'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span>{t('product.keyFunctions')}:</span>
                    <span className="font-semibold text-emerald-700">
                      {language === 'ja' ? '全テスト項目パス' : 'All Tests Passed'}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>{t('product.portsConnectivity')}:</span>
                    <span className="font-semibold text-emerald-700">
                      {language === 'ja' ? '正常動作確認済' : 'Passed & Tested'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Accessories & Missing Items */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-200/60">
                <h4 className="text-xs font-bold text-emerald-900 mb-2 flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-emerald-600" />
                  {t('product.includedItems')}
                </h4>
                <ul className="text-xs text-emerald-800 space-y-1">
                  {product.includedAccessories && product.includedAccessories.length > 0 ? (
                    product.includedAccessories.map((acc, i) => (
                      <li key={i} className="flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span>{acc}</span>
                      </li>
                    ))
                  ) : (
                    <li>{language === 'ja' ? '本体のみ' : 'Main device only'}</li>
                  )}
                </ul>
              </div>

              <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-200/60">
                <h4 className="text-xs font-bold text-amber-900 mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  {t('product.missingItems')}
                </h4>
                <ul className="text-xs text-amber-800 space-y-1">
                  {product.missingAccessories && product.missingAccessories.length > 0 ? (
                    product.missingAccessories.map((miss, i) => (
                      <li key={i} className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                        <span>{miss}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-slate-500">{language === 'ja' ? '特になし（標準付属品完備）' : 'None (All standard accessories included)'}</li>
                  )}
                </ul>
              </div>
            </div>

            {/* Inspector Certificate Info */}
            <div className="bg-slate-100 p-3.5 rounded-xl text-xs text-slate-600 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-slate-700" />
                <span>
                  {t('product.inspector')}: <strong className="text-slate-900">
                    {product.inspectorName || (language === 'ja' ? '専門検品員' : 'Specialized Inspector')}
                  </strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-700" />
                <span>
                    {t('product.inspectedDate')}: <strong className="text-slate-900">{product.inspectionDate || product.createdAt.slice(0, 10)}</strong>
                </span>
              </div>
              {product.serialNumber && (
                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4 text-slate-700" />
                  <span>
                    {t('product.serialNo')}: <strong className="font-mono text-slate-900">{product.serialNumber}</strong>
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Pricing, Product Details & Action Box (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-6 sticky top-24">
            {/* Header info */}
            <div>
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                  {product.brand}
                </span>
                <span className="text-slate-400">{getCategoryName(product.category)}</span>
              </div>

              <h1 className="text-lg sm:text-xl font-black text-slate-900 leading-snug">
                {product.name}
              </h1>

              <p className="text-xs text-slate-500 mt-1 font-mono">
                {language === 'ja' ? `型番: ${product.model}` : `Model: ${product.model}`}
              </p>
            </div>

            {/* Price Box */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>{t('product.usedPrice')}</span>
                {product.originalRetailPrice && (
                  <span className="line-through">
                    {t('product.referencePrice')}: ¥{product.originalRetailPrice.toLocaleString()}
                  </span>
                )}
              </div>

              <div className="flex items-baseline justify-between">
                <div className="flex items-baseline gap-1">
                  <span className="text-base font-bold text-emerald-700">¥</span>
                  <span className="text-3xl font-black text-slate-900 tracking-tight">
                    {product.price.toLocaleString()}
                  </span>
                  <span className="text-xs text-slate-500 font-normal">
                    {language === 'ja' ? '（税込・送料無料）' : ' (incl. tax & shipping)'}
                  </span>
                </div>

                {discountPercent && discountPercent > 0 && (
                  <span className="bg-rose-600 text-white text-xs font-bold px-2 py-0.5 rounded shadow-2xs">
                    {discountPercent}% OFF
                  </span>
                )}
              </div>
            </div>

            {/* Stock & Resale Assurance */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600">{t('product.stockStatus')}:</span>
                {!product.isSold ? (
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {t('product.onlyOneInStock')}
                  </span>
                ) : (
                  <span className="font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded">
                    {t('product.soldOut')}
                  </span>
                )}
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed">
                {t('product.oneOfAKindNote')}
              </p>
            </div>

            {/* Action Buttons */}
            {!product.isSold ? (
              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={() => onBuyNow(product)}
                  className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 text-sm cursor-pointer"
                >
                  <Zap className="w-4 h-4" />
                  <span>{t('product.buyNow')}</span>
                </button>

                <button
                  type="button"
                  onClick={handleAddToCartClick}
                  className="w-full h-11 bg-white hover:bg-slate-50 active:bg-slate-100 border-2 border-emerald-600 text-emerald-700 font-bold rounded-xl transition flex items-center justify-center gap-2 text-sm cursor-pointer shadow-2xs"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>{t('product.addToCart')}</span>
                </button>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={(e) => onToggleFavorite(product.id, e)}
                    className={`flex-1 h-10 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      isFavorite
                        ? 'bg-rose-50 border-rose-200 text-rose-600'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                    <span>{isFavorite ? t('product.inWishlist') : t('product.addToWishlist')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={onOpenAiAssistant}
                    className="px-3 h-10 rounded-xl border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                    title={language === 'ja' ? 'AIに相談' : 'Ask AI'}
                  >
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <span>{t('product.aiAdvice')}</span>
                  </button>
                </div>

                {addedToast && (
                  <div className="p-2.5 bg-emerald-600 text-white text-xs font-bold rounded-lg text-center shadow-md animate-fade-in">
                    {t('product.addedToCartMsg')}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 bg-slate-100 rounded-xl text-center text-xs text-slate-600 font-medium">
                {t('product.soldOutMsg')}
              </div>
            )}

            {/* Reassurance Guarantees */}
            <div className="border-t border-slate-100 pt-4 space-y-3 text-xs text-slate-600">
              <div className="flex items-start gap-2.5">
                <Truck className="w-4 h-4 text-slate-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900">{t('product.shippingGuarantee')}</span>
                  <p className="text-[11px] text-slate-500">{t('product.shippingGuaranteeSub')}</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900">{t('product.warrantyGuarantee')}</span>
                  <p className="text-[11px] text-slate-500">{t('product.warrantyGuaranteeSub')}</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <RotateCcw className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-900">{t('product.returnGuarantee')}</span>
                  <p className="text-[11px] text-slate-500">{t('product.returnGuaranteeSub')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

