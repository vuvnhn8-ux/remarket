import React from 'react';
import {
  Search,
  ShieldCheck,
  RefreshCw,
  Award,
  Sparkles,
  Camera,
  Laptop,
  Smartphone,
  Gamepad2,
  Headphones,
  Watch,
  Tv,
  Wrench,
  Tent,
  Car,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import { ProductItem, ProductCategory } from '../../types';
import { ProductCard } from './ProductCard';
import { WorkflowStepBanner } from '../common/WorkflowStepBanner';
import { useLanguage } from '../../context/LanguageContext';

interface HomePageProps {
  products: ProductItem[];
  favorites: string[];
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onSelectProduct: (product: ProductItem) => void;
  onNavigateCategory: (category: ProductCategory) => void;
  onNavigateCatalog: (filter?: any) => void;
  onSearchSubmit: (q: string) => void;
  onOpenAiAssistant: () => void;
}

const HERO_SLIDES = [
  {
    id: 'camera',
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=1600',
    badgeJa: 'カメラ・光学機器',
    badgeEn: 'Cameras & Lenses',
  },
  {
    id: 'laptop',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=1600',
    badgeJa: 'MacBook・PC プレミアム',
    badgeEn: 'MacBooks & Laptops',
  },
  {
    id: 'mobile',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=1600',
    badgeJa: 'スマホ・タブレット',
    badgeEn: 'Smartphones & Tablets',
  },
  {
    id: 'audio',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=1600',
    badgeJa: 'オーディオ・ゲーム機器',
    badgeEn: 'Audio & Gaming Gear',
  },
];

const LOOP_SLIDES = [...HERO_SLIDES, { ...HERO_SLIDES[0], id: 'camera-clone' }];

const CATEGORY_META: { name: ProductCategory; icon: any; color: string }[] = [
  { name: 'カメラ', icon: Camera, color: 'bg-blue-50 text-blue-600 border-blue-100 hover:border-blue-300' },
  { name: 'パソコン', icon: Laptop, color: 'bg-indigo-50 text-indigo-600 border-indigo-100 hover:border-indigo-300' },
  { name: 'スマートフォン', icon: Smartphone, color: 'bg-purple-50 text-purple-600 border-purple-100 hover:border-purple-300' },
  { name: 'ゲーム', icon: Gamepad2, color: 'bg-rose-50 text-rose-600 border-rose-100 hover:border-rose-300' },
  { name: 'オーディオ', icon: Headphones, color: 'bg-amber-50 text-amber-600 border-amber-100 hover:border-amber-300' },
  { name: '腕時計', icon: Watch, color: 'bg-slate-100 text-slate-700 border-slate-200 hover:border-slate-400' },
  { name: '家電', icon: Tv, color: 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:border-emerald-300' },
  { name: '工具', icon: Wrench, color: 'bg-orange-50 text-orange-600 border-orange-100 hover:border-orange-300' },
  { name: 'アウトドア', icon: Tent, color: 'bg-green-50 text-green-600 border-green-100 hover:border-green-300' },
  { name: 'カー用品', icon: Car, color: 'bg-cyan-50 text-cyan-600 border-cyan-100 hover:border-cyan-300' },
];

export const HomePage: React.FC<HomePageProps> = ({
  products,
  favorites,
  onToggleFavorite,
  onSelectProduct,
  onNavigateCategory,
  onNavigateCatalog,
  onSearchSubmit,
  onOpenAiAssistant,
}) => {
  const [heroSearch, setHeroSearch] = React.useState('');
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const [isTransitioning, setIsTransitioning] = React.useState(true);
  const { language, t, getCategoryName } = useLanguage();

  // Continuous auto-rotation every 3.5 seconds
  React.useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setCurrentSlide((prev) => prev + 1);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const handleTransitionEnd = () => {
    if (currentSlide >= HERO_SLIDES.length) {
      setIsTransitioning(false);
      setCurrentSlide(0);
    }
  };

  const activeSlideIndex = currentSlide % HERO_SLIDES.length;

  // Segment products
  const inStock = products.filter((p) => !p.isSold);
  const recentItems = [...inStock].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 8);
  const recommendedItems = [...inStock].sort((a, b) => b.viewCount - a.viewCount).slice(0, 8);
  const highConditionItems = inStock.filter((p) => p.conditionRank === 'S' || p.conditionRank === 'A').slice(0, 8);
  const bargainItems = [...inStock].sort((a, b) => a.price - b.price).slice(0, 8);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroSearch.trim()) {
      onSearchSubmit(heroSearch.trim());
    }
  };

  return (
    <div className="space-y-10 pb-16 pt-2 relative">
      {/* Top Bento Grid Module & Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 relative space-y-4">
        {/* Soft Ambient Hero Glow (Pure CSS) */}
        <div className="absolute -top-10 left-1/4 w-96 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-20 right-10 w-96 h-48 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none -z-10" />

        {/* Floating Marketplace Nodes Ticker (Subtle, sleek, non-intrusive) */}
        <div className="hidden md:flex items-center justify-between px-2 text-[11px] text-slate-500 font-medium">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 bg-white/80 border border-slate-200/80 px-2.5 py-0.5 rounded-full shadow-2xs backdrop-blur-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-subtle-pulse" />
              <span className="text-slate-700 font-semibold">{language === 'ja' ? '東京・大阪 査定ハブ 稼働中' : 'Tokyo & Osaka Intake Hubs Online'}</span>
            </span>
            <span className="text-slate-400">|</span>
            <span className="text-slate-500">{language === 'ja' ? '本日検品完了: 148 点' : 'Inspected Today: 148 items'}</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-slate-600 bg-slate-100/80 border border-slate-200/60 px-2 py-0.5 rounded-md text-[10px]">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>20-Point Inspection Guaranteed</span>
            </span>
            <span className="flex items-center gap-1 text-purple-700 bg-purple-50 border border-purple-200/60 px-2 py-0.5 rounded-md text-[10px]">
              <Sparkles className="w-3 h-3 text-purple-600" />
              <span>AI Auto-Valuation Active</span>
            </span>
          </div>
        </div>

        {/* Full-Width Auto-Rotating Hero Slider */}
        <div className="relative rounded-3xl overflow-hidden bg-slate-900 group shadow-md border border-slate-200/80 min-h-[440px] sm:min-h-[480px] lg:min-h-[520px] flex flex-col justify-between p-6 sm:p-10 card-interactive">
          {/* Horizontal Sliding Track for Seamless Left Transition */}
          <div className="absolute inset-0 overflow-hidden z-0">
            <div
              className="flex h-full w-full"
              style={{
                transform: `translateX(-${currentSlide * 100}%)`,
                transition: isTransitioning ? 'transform 700ms ease-out' : 'none',
              }}
              onTransitionEnd={handleTransitionEnd}
            >
              {LOOP_SLIDES.map((slide, idx) => (
                <div key={`${slide.id}-${idx}`} className="w-full h-full shrink-0 relative">
                  <img
                    src={slide.image}
                    className="w-full h-full object-cover"
                    alt={`Re:Market Hero Slide ${idx + 1}`}
                    referrerPolicy="no-referrer"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Vignette & Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/75 to-slate-950/40 z-10" />

          {/* Top Mission Pill & Live Category Tag */}
          <div className="relative z-20 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-semibold border border-white/25 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-subtle-pulse" />
                <span>{t('hero.tag')}</span>
              </div>
              <span className="hidden md:inline-flex items-center px-3 py-1 rounded-full bg-emerald-500/30 backdrop-blur-xs text-emerald-200 text-xs font-semibold border border-emerald-400/40 transition-all duration-500">
                {language === 'ja' ? HERO_SLIDES[activeSlideIndex].badgeJa : HERO_SLIDES[activeSlideIndex].badgeEn}
              </span>
            </div>

            {/* Slogan Pill */}
            <div className="hidden sm:block bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/20 text-right shadow-xs">
              <p className="text-[10px] uppercase tracking-widest text-emerald-300 font-semibold">{t('brand.sloganLabel')}</p>
              <p className="text-xs font-bold text-white tracking-wide">{t('hero.slogan')}</p>
            </div>
          </div>

          {/* Hero Main Content */}
          <div className="relative z-20 mt-8 sm:mt-10 max-w-2xl text-white">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold leading-tight mb-3 tracking-tight drop-shadow-sm">
              {t('hero.title')}
            </h2>
            <p className="text-xs sm:text-sm text-white/90 mb-6 leading-relaxed font-normal max-w-xl">
              {t('hero.desc')}
            </p>

            {/* Search Inside Hero */}
            <form onSubmit={handleHeroSearch} className="mb-4">
              <div className="bg-white/95 backdrop-blur-md p-1.5 rounded-full shadow-xl flex items-center gap-2 border border-white/50 max-w-xl transition-all focus-within:ring-2 focus-within:ring-emerald-400">
                <div className="pl-4 text-slate-400">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={heroSearch}
                  onChange={(e) => setHeroSearch(e.target.value)}
                  placeholder={t('hero.searchPlaceholder')}
                  className="w-full py-2 px-1 text-slate-900 placeholder-slate-400 text-xs sm:text-sm focus:outline-hidden bg-transparent"
                />
                <button
                  type="submit"
                  className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-full font-bold text-xs sm:text-sm transition shadow-sm whitespace-nowrap cursor-pointer"
                >
                  {t('common.search')}
                </button>
              </div>
            </form>

            <div className="flex flex-wrap items-center gap-2 text-[11px] text-white/80">
              <span className="font-semibold text-white">{t('hero.featured')}:</span>
              {['SONY α7 III', 'MacBook Air', 'iPhone 15', 'PS5', 'Beats'].map((kw) => (
                <button
                  key={kw}
                  type="button"
                  onClick={() => onSearchSubmit(kw)}
                  className="bg-black/40 hover:bg-black/60 px-3 py-1 rounded-full backdrop-blur-xs border border-white/20 transition cursor-pointer text-[11px]"
                >
                  {kw}
                </button>
              ))}
            </div>
          </div>

          {/* Carousel Dot Indicators */}
          <div className="relative z-20 flex items-center justify-between pt-4 border-t border-white/10 mt-6">
            <div className="flex items-center gap-2">
              {HERO_SLIDES.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setIsTransitioning(true);
                    setCurrentSlide(idx);
                  }}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    idx === activeSlideIndex ? 'w-8 bg-emerald-400' : 'w-2 bg-white/40 hover:bg-white/70'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>

            <div className="hidden sm:flex items-center gap-4 text-xs text-white/75 font-medium">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>20-Point Verified</span>
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>14-Day Free Returns</span>
              </span>
            </div>
          </div>
        </div>

        {/* 4 Bento Cards Grid Underneath Hero Banner */}
        <div className="grid grid-cols-12 gap-4">
          {/* Trade-in Process Bento Cell (Span 3) */}
          <div className="col-span-12 sm:col-span-6 lg:col-span-3 bg-white/90 backdrop-blur-xs rounded-3xl p-5 flex flex-col justify-between border border-slate-200/90 shadow-sm card-interactive">
            <div>
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    {language === 'ja' ? '買取・リユースプロセス' : 'Resale & Trade-in Model'}
                  </h3>
                </div>
                <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold px-2 py-0.5 rounded-full">
                  {language === 'ja' ? '高価買取' : 'Top Valuations'}
                </span>
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-2.5 p-1.5 rounded-xl hover:bg-slate-50 transition border border-transparent hover:border-slate-100">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px] font-black shrink-0 shadow-2xs">01</div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">{t('workflow.step1')}</span>
                    <span className="text-[10px] text-slate-500">{t('workflow.step1Sub')}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2.5 p-1.5 rounded-xl hover:bg-slate-50 transition border border-transparent hover:border-slate-100">
                  <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-[10px] font-black shrink-0 shadow-2xs">02</div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">{t('workflow.step2')}</span>
                    <span className="text-[10px] text-slate-500">{t('workflow.step2Sub')}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2.5 p-1.5 rounded-xl hover:bg-slate-50 transition border border-transparent hover:border-slate-100">
                  <div className="w-5 h-5 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center text-[10px] font-black shrink-0 shadow-2xs">03</div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">{t('workflow.step4')}</span>
                    <span className="text-[10px] text-slate-500">{t('workflow.step4Sub')}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => onNavigateCatalog({ category: 'all' })}
                className="w-full bg-slate-900 hover:bg-slate-800 py-2.5 rounded-xl text-xs font-bold text-white transition shadow-sm cursor-pointer text-center block"
              >
                {language === 'ja' ? '商品をさがす / Web査定' : 'Browse Products / Trade-in'}
              </button>
            </div>
          </div>

          {/* Stat Bento Widget (Span 3) */}
          <div className="col-span-12 sm:col-span-6 lg:col-span-3 bg-white/90 backdrop-blur-xs rounded-3xl p-5 flex flex-col justify-between shadow-sm border border-slate-200/90 card-interactive">
            <div>
              <p className="text-xs text-slate-400 font-bold">{t('hero.statNew')}</p>
              <p className="text-2xl font-black text-slate-900 mt-1 tracking-tight">
                {products.length * 15 + 120} <span className="text-xs font-normal text-slate-500">{t('hero.inStock')}</span>
              </p>
              <p className="text-[10px] text-emerald-700 font-medium mt-2 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-subtle-pulse" />
                {language === 'ja' ? `本日 ${recentItems.length} 点 新規検品完了` : `${recentItems.length} items inspected today`}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] text-slate-500 font-medium">Verified Inventory</span>
              <div className="flex -space-x-2">
                <img src="https://images.unsplash.com/photo-1581591524425-c7e0978865fc?w=100" className="w-8 h-8 rounded-full border-2 border-white object-cover shadow-2xs" alt="tech1" referrerPolicy="no-referrer" />
                <img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100" className="w-8 h-8 rounded-full border-2 border-white object-cover shadow-2xs" alt="tech2" referrerPolicy="no-referrer" />
                <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-900 text-white flex items-center justify-center text-[9px] font-bold shadow-2xs">
                  +{recentItems.length}
                </div>
              </div>
            </div>
          </div>

          {/* Category Dark Bento Widget (Span 3) */}
          <div className="col-span-12 sm:col-span-6 lg:col-span-3 bg-slate-900 rounded-3xl p-5 text-white flex flex-col justify-between shadow-md border border-slate-800 card-interactive">
            <div>
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
                <h3 className="text-xs font-bold tracking-widest text-slate-300 uppercase">{t('hero.categoryTitle')}</h3>
                <button
                  type="button"
                  onClick={() => onNavigateCatalog({ category: 'all' })}
                  className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold hover:underline cursor-pointer"
                >
                  {t('hero.viewAll')}
                </button>
              </div>
              <nav className="space-y-1.5">
                {CATEGORY_META.slice(0, 4).map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.name}
                      type="button"
                      onClick={() => onNavigateCategory(cat.name)}
                      className="w-full flex justify-between items-center text-xs py-1 px-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/80 transition group cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <Icon className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-400 transition" />
                        <span>{getCategoryName(cat.name)}</span>
                      </span>
                      <ArrowRight className="w-3 h-3 text-slate-500 group-hover:text-white transition group-hover:translate-x-0.5" />
                    </button>
                  );
                })}
              </nav>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                {t('hero.fastShipping')}
              </span>
              <span>{t('hero.returnGuaranteed')}</span>
            </div>
          </div>

          {/* AI Concierge Bento Widget (Span 3) */}
          <div className="col-span-12 sm:col-span-6 lg:col-span-3 bg-gradient-to-br from-purple-950 via-slate-900 to-indigo-950 rounded-3xl p-5 text-white flex flex-col justify-between shadow-md border border-purple-800/50 card-interactive">
            <div>
              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-purple-800/30">
                <div className="w-6 h-6 rounded-lg bg-purple-500/30 border border-purple-400/30 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-subtle-pulse" />
                </div>
                <h3 className="text-xs font-bold text-purple-200">{t('hero.aiTitle')}</h3>
              </div>
              <p className="text-xs text-slate-200 font-normal leading-relaxed mb-2">
                {t('hero.aiDesc')}
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenAiAssistant}
              className="mt-3 w-full bg-white text-purple-950 font-bold py-2 rounded-xl text-xs hover:bg-purple-50 transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>{t('hero.openAi')}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Categories Horizontal Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-4 bg-slate-900 rounded-full" />
            <div>
              <h2 className="text-base font-bold text-slate-900">{t('categories.title')}</h2>
              <p className="text-[11px] text-slate-500">{t('categories.subtitle')}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigateCatalog({ category: 'all' })}
            className="text-xs font-semibold text-slate-700 hover:text-black flex items-center gap-1 cursor-pointer"
          >
            {t('categories.allCategories')} <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-10 gap-2">
          {CATEGORY_META.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.name}
                type="button"
                onClick={() => onNavigateCategory(cat.name)}
                className="p-2.5 rounded-2xl bg-white/90 backdrop-blur-xs border border-slate-200/80 flex flex-col items-center justify-center gap-1.5 transition-all hover:border-slate-400 hover:shadow-xs cursor-pointer group hover:-translate-y-0.5"
              >
                <div className="p-1.5 rounded-xl bg-slate-100 group-hover:bg-slate-200 text-slate-700 transition">
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-bold text-slate-800 tracking-tight">{getCategoryName(cat.name)}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Section 1: 新着商品 (Recently Acquired & Listed) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-4 bg-emerald-600 rounded-full" />
            <div>
              <h2 className="text-base font-bold text-slate-900">{t('sections.recentTitle')}</h2>
              <p className="text-[11px] text-slate-500">{t('sections.recentSubtitle')}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigateCatalog({ sort: 'newest' })}
            className="text-xs font-semibold text-slate-700 hover:text-black flex items-center gap-1 cursor-pointer"
          >
            {t('sections.viewMore')} <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {recentItems.map((prod) => (
            <ProductCard
              key={prod.id}
              product={prod}
              isFavorite={favorites.includes(prod.id)}
              onToggleFavorite={onToggleFavorite}
              onSelectProduct={onSelectProduct}
            />
          ))}
        </div>
      </section>

      {/* Trust & Peace of Mind Bento 3-Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-white/95 backdrop-blur-xs border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="text-center max-w-2xl mx-auto mb-6">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
              {t('trust.tag')}
            </span>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900">
              {t('trust.title')}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200/80 card-interactive">
              <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 text-emerald-700 flex items-center justify-center font-bold mb-3 shadow-2xs">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-xs sm:text-sm mb-1">{t('trust.card1Title')}</h4>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                {t('trust.card1Desc')}
              </p>
            </div>

            <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200/80 card-interactive">
              <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 text-blue-700 flex items-center justify-center font-bold mb-3 shadow-2xs">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-xs sm:text-sm mb-1">{t('trust.card2Title')}</h4>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                {t('trust.card2Desc')}
              </p>
            </div>

            <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200/80 card-interactive">
              <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 text-amber-700 flex items-center justify-center font-bold mb-3 shadow-2xs">
                <Award className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-xs sm:text-sm mb-1">{t('trust.card3Title')}</h4>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                {t('trust.card3Desc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: 高評価コンディション (S / A Rank) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-4 bg-blue-600 rounded-full" />
            <div>
              <h2 className="text-base font-bold text-slate-900">{t('sections.highRankTitle')}</h2>
              <p className="text-[11px] text-slate-500">{t('sections.highRankSubtitle')}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigateCatalog({ conditionRank: 'A' })}
            className="text-xs font-semibold text-slate-700 hover:text-black flex items-center gap-1 cursor-pointer"
          >
            {t('sections.viewMore')} <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {highConditionItems.map((prod) => (
            <ProductCard
              key={prod.id}
              product={prod}
              isFavorite={favorites.includes(prod.id)}
              onToggleFavorite={onToggleFavorite}
              onSelectProduct={onSelectProduct}
            />
          ))}
        </div>
      </section>

      {/* Section 3: おすすめ商品 (Popular / Highly Viewed) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-4 bg-purple-600 rounded-full" />
            <div>
              <h2 className="text-base font-bold text-slate-900">{t('sections.popularTitle')}</h2>
              <p className="text-[11px] text-slate-500">{t('sections.popularSubtitle')}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigateCatalog({ sort: 'popularity' })}
            className="text-xs font-semibold text-slate-700 hover:text-black flex items-center gap-1 cursor-pointer"
          >
            {t('sections.viewMore')} <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {recommendedItems.map((prod) => (
            <ProductCard
              key={prod.id}
              product={prod}
              isFavorite={favorites.includes(prod.id)}
              onToggleFavorite={onToggleFavorite}
              onSelectProduct={onSelectProduct}
            />
          ))}
        </div>
      </section>

      {/* Section 4: お買い得商品 (Attractive Prices) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-4 bg-amber-500 rounded-full" />
            <div>
              <h2 className="text-base font-bold text-slate-900">{t('sections.bargainTitle')}</h2>
              <p className="text-[11px] text-slate-500">{t('sections.bargainSubtitle')}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigateCatalog({ sort: 'price_asc' })}
            className="text-xs font-semibold text-slate-700 hover:text-black flex items-center gap-1 cursor-pointer"
          >
            {t('sections.viewMore')} <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {bargainItems.map((prod) => (
            <ProductCard
              key={prod.id}
              product={prod}
              isFavorite={favorites.includes(prod.id)}
              onToggleFavorite={onToggleFavorite}
              onSelectProduct={onSelectProduct}
            />
          ))}
        </div>
      </section>
    </div>
  );
};

