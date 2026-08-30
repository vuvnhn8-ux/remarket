import React, { useState } from 'react';
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  RefreshCw,
  ShieldCheck,
  Tag,
  Sparkles,
  Layers,
  ChevronDown,
  Menu,
  X,
  Play,
  RotateCcw,
  Globe,
  Check,
  Activity,
  Radio,
} from 'lucide-react';
import { ProductCategory, UserRole, PublicUser } from '../../types';
import { CATEGORIES } from '../../data/seedData';
import { useLanguage } from '../../context/LanguageContext';
import { useSimulation } from '../../context/SimulationContext';

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  user: PublicUser | null;
  onLoginClick: () => void;
  onLogout: () => void;
  activeView: string;
  onNavigate: (view: string, param?: any) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSearchSubmit: (q: string) => void;
  selectedCategory: string;
  onCategorySelect: (cat: string) => void;
  cartCount: number;
  onOpenCart: () => void;
  favoritesCount: number;
  onOpenAiAssistant: () => void;
  onRunDemoScenario: (scenario: 'A' | 'B' | 'C') => void;
  onResetDb: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  user,
  onLoginClick,
  onLogout,
  activeView,
  onNavigate,
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  selectedCategory,
  onCategorySelect,
  cartCount,
  onOpenCart,
  favoritesCount,
  onOpenAiAssistant,
  onRunDemoScenario,
  onResetDb,
}) => {
  const { language, setLanguage, toggleLanguage, t, getCategoryName } = useLanguage();
  const { isSimulationMode, toggleSimulationMode, setIsLiveMonitorOpen } = useSimulation();
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDemoMenuOpen, setIsDemoMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearchSubmit(searchQuery);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
      {/* Top Demo & Role & Language Control Bar */}
      <div className="bg-slate-900 text-slate-200 px-4 py-1.5 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          {/* Tagline & Business Concept */}
          <div className="flex items-center gap-3">
            <span className="font-semibold text-emerald-400">
              {t('brand.slogan')}
            </span>
            <span className="hidden sm:inline-block text-slate-500">|</span>
            <span className="hidden sm:inline-flex items-center gap-1 text-emerald-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              {language === 'ja' ? '全品専門スタッフ動作検品済・安心保証付' : '100% Verified Inspection & Free Warranty'}
            </span>
          </div>

          {/* Controls: Language Selector, Demo Scenario, Role Switcher */}
          <div className="flex items-center gap-2">
            {/* Simulation Mode Toggle & Live Indicator */}
            <div className="relative group inline-flex items-center gap-1.5 bg-slate-800 px-2.5 py-1 rounded border border-slate-700">
              <button
                type="button"
                onClick={() => setIsLiveMonitorOpen(true)}
                className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer hover:opacity-90 transition"
                title="Demo environment — no real API calls are being made."
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isSimulationMode ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                  }`}
                />
                <span className={isSimulationMode ? 'text-emerald-300 font-bold' : 'text-slate-400'}>
                  {isSimulationMode ? 'Simulation' : 'Real API'}
                </span>
              </button>

              {/* ON/OFF Switch */}
              <button
                type="button"
                onClick={toggleSimulationMode}
                className={`relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  isSimulationMode ? 'bg-emerald-500' : 'bg-slate-600'
                }`}
                title={
                  isSimulationMode
                    ? 'Simulation Mode: ON (Click to switch to Real API mode)'
                    : 'Simulation Mode: OFF (Click to switch to Simulation Mode)'
                }
              >
                <span
                  className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out ${
                    isSimulationMode ? 'translate-x-3' : 'translate-x-0'
                  }`}
                />
              </button>

              {/* Tooltip on hover */}
              <div className="absolute top-full right-0 mt-1 hidden group-hover:block z-50 w-64 p-2 bg-slate-950 text-slate-200 text-[11px] rounded-lg border border-slate-700 shadow-xl pointer-events-none">
                <div className="font-bold text-emerald-400 flex items-center gap-1 mb-0.5">
                  <Activity className="w-3 h-3" />
                  <span>
                    {isSimulationMode
                      ? language === 'ja'
                        ? '● シミュレーションモード稼働中'
                        : '● Simulation Mode (Active)'
                      : '● Real API Mode'}
                  </span>
                </div>
                <span>
                  {language === 'ja'
                    ? 'デモ環境：API設定不要でリアルタイム自動化・検品・査定・注文を体感できます。'
                    : 'Demo environment — no real API calls are being made.'}
                </span>
              </div>
            </div>

            {/* Language Switcher Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium transition cursor-pointer text-xs"
                title="言語切替 / Change Language"
              >
                <Globe className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-semibold">
                  {language === 'ja' ? '🇯🇵 日本語' : '🇺🇸 English'}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {isLangMenuOpen && (
                <div className="absolute right-0 mt-1 w-36 bg-slate-900 border border-slate-700 rounded-lg shadow-xl py-1 z-50 text-slate-200">
                  <button
                    type="button"
                    onClick={() => {
                      setLanguage('ja');
                      setIsLangMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs hover:bg-slate-800 flex items-center justify-between transition cursor-pointer ${
                      language === 'ja' ? 'text-emerald-400 font-bold bg-slate-800/60' : 'text-slate-300'
                    }`}
                  >
                    <span>🇯🇵 日本語</span>
                    {language === 'ja' && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLanguage('en');
                      setIsLangMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs hover:bg-slate-800 flex items-center justify-between transition cursor-pointer ${
                      language === 'en' ? 'text-emerald-400 font-bold bg-slate-800/60' : 'text-slate-300'
                    }`}
                  >
                    <span>🇺🇸 English</span>
                    {language === 'en' && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                  </button>
                </div>
              )}
            </div>

            {/* Demo Scenario Dropdown */}
            <div className="relative hidden sm:block">
              <button
                type="button"
                onClick={() => setIsDemoMenuOpen(!isDemoMenuOpen)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-indigo-900/80 hover:bg-indigo-800 text-indigo-200 border border-indigo-700/60 font-medium transition cursor-pointer"
              >
                <Play className="w-3 h-3 text-indigo-400" />
                <span>{language === 'ja' ? 'デモシナリオ実行' : 'Demo Scenarios'}</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {isDemoMenuOpen && (
                <div className="absolute right-0 mt-1 w-72 bg-slate-900 border border-slate-700 rounded-lg shadow-xl py-1 z-50 text-slate-200">
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 border-b border-slate-800">
                    {language === 'ja' ? '選考・面接用 実演シナリオ' : 'Interactive Demo Flows'}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsDemoMenuOpen(false);
                      onRunDemoScenario('A');
                    }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-slate-800 flex flex-col gap-0.5 transition cursor-pointer"
                  >
                    <div className="font-semibold text-emerald-400 flex items-center gap-1">
                      <span>{language === 'ja' ? 'シナリオA：買取 → 検品 → 出品' : 'Scenario A: Acquisition → Inspection → Listing'}</span>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {language === 'ja' ? 'スタッフ目線：Fujifilm X-T4を受取、動作検品、AI出品登録' : 'Staff perspective: Receive trade-in, test item, generate AI listing'}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsDemoMenuOpen(false);
                      onRunDemoScenario('B');
                    }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-slate-800 flex flex-col gap-0.5 transition border-t border-slate-800 cursor-pointer"
                  >
                    <div className="font-semibold text-blue-400 flex items-center gap-1">
                      <span>{language === 'ja' ? 'シナリオB：検索 → 状態確認 → 購入' : 'Scenario B: Search → Inspect Grade → Checkout'}</span>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {language === 'ja' ? '顧客目線：カメラ検索、ランク詳細確認、注文、在庫0化' : 'Customer perspective: Filter camera, inspect rank disclosures, order 1-of-a-kind'}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsDemoMenuOpen(false);
                      onRunDemoScenario('C');
                    }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-slate-800 flex flex-col gap-0.5 transition border-t border-slate-800 cursor-pointer"
                  >
                    <div className="font-semibold text-purple-400 flex items-center gap-1">
                      <span>{language === 'ja' ? 'シナリオC：AI機能活用（3種）' : 'Scenario C: Gemini AI Features (3 types)'}</span>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {language === 'ja' ? '出品文自動生成・AIコンシェルジュ・経営分析' : 'AI Listing Copy, Shopping Concierge & Strategy Advisor'}
                    </span>
                  </button>
                  <div className="border-t border-slate-800 p-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setIsDemoMenuOpen(false);
                        onResetDb();
                      }}
                      className="w-full text-center py-1 text-[11px] text-slate-400 hover:text-rose-300 hover:bg-rose-950/40 rounded flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>{language === 'ja' ? 'DBデータを初期状態にリセット' : 'Reset Database to Initial State'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Account / Auth Section (AGENTS.md mục 3) */}
            <div className="flex items-center gap-2">
              {user ? (
                <>
                  <div className="hidden sm:flex flex-col items-end leading-tight">
                    <span className="text-[11px] font-semibold text-white truncate max-w-[160px]">
                      {user.name}
                    </span>
                    <span
                      className={`text-[10px] font-medium ${
                        user.role === 'admin' ? 'text-purple-300' : user.role === 'staff' ? 'text-blue-300' : 'text-emerald-300'
                      }`}
                    >
                      {user.role === 'admin'
                        ? '管理者'
                        : user.role === 'staff'
                        ? 'スタッフ'
                        : '顧客'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={onLogout}
                    className="px-2.5 py-1 rounded-md bg-slate-800 text-xs font-medium text-rose-300 hover:bg-rose-950/50 hover:text-rose-200 transition cursor-pointer border border-slate-700"
                  >
                    {language === 'ja' ? 'ログアウト' : 'Logout'}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={onLoginClick}
                  className="px-2.5 py-1 rounded-md bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition cursor-pointer"
                >
                  {language === 'ja' ? 'ログイン' : 'Login'}
                </button>
              )}

              {user && user.role !== 'customer' && (
                <button
                  type="button"
                  onClick={() => onRoleChange('customer')}
                  className="px-2 py-0.5 rounded text-xs font-medium transition cursor-pointer bg-slate-800 text-slate-300 hover:text-white border border-slate-700"
                >
                  購入者ビュー
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5">
        <div className="flex items-center justify-between gap-6">
          {/* Brand Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onNavigate('home')}
              className="text-left group cursor-pointer flex items-center gap-2.5"
            >
              <img
                src="/favicon.svg"
                alt="Re:Market logo"
                className="w-10 h-10 shrink-0"
                width={40}
                height={40}
              />
              <div className="flex flex-col">
                <span className="text-2xl font-black tracking-tighter text-[#1a1a1a] leading-none">
                  {t('brand.title')}
                </span>
                <span className="text-[10px] text-gray-500 font-medium tracking-widest leading-tight mt-0.5">
                  {t('brand.tagline')}
                </span>
              </div>
            </button>
          </div>
          {/* Center Search Bar */}
          <div className="flex-1 max-w-xl hidden md:block">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400 pointer-events-none z-10" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                onKeyDown={handleSearchKeyPress}
                placeholder={t('nav.searchPlaceholder')}
                className="w-full bg-gray-100 border-none rounded-full py-2 pl-10 pr-28 text-sm text-gray-800 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-gray-300 transition-all outline-hidden"
              />
              {/* Category Quick Selector */}
              <div className="absolute right-1 flex items-center">
                <button
                  type="button"
                  onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                  className="h-7 px-2.5 bg-gray-200/70 hover:bg-gray-200 text-[11px] font-medium text-gray-700 rounded-full flex items-center gap-1 cursor-pointer transition"
                >
                  <span className="max-w-[80px] truncate">
                    {selectedCategory === 'all' ? t('nav.allCategories') : getCategoryName(selectedCategory)}
                  </span>
                  <ChevronDown className="w-3 h-3 text-gray-500" />
                </button>

                {isCategoryOpen && (
                  <div className="absolute top-full right-0 mt-1.5 w-48 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-50">
                    <button
                      type="button"
                      onClick={() => {
                        onCategorySelect('all');
                        setIsCategoryOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 font-medium text-gray-800 cursor-pointer"
                    >
                      {t('nav.allCategories')}
                    </button>
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          onCategorySelect(cat);
                          setIsCategoryOpen(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 text-xs hover:bg-gray-100 cursor-pointer ${
                          selectedCategory === cat ? 'bg-gray-100 text-black font-bold' : 'text-gray-700'
                        }`}
                      >
                        {getCategoryName(cat)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* AI Concierge Shopping Assistant Button */}
            <button
              type="button"
              onClick={onOpenAiAssistant}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white rounded-full text-xs font-bold shadow-xs transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span className="hidden sm:inline">{t('nav.aiConsult')}</span>
            </button>

            {/* Favorites */}
            <button
              type="button"
              onClick={() => onNavigate('mypage', { tab: 'favorites' })}
              className="flex flex-col items-center p-1 text-gray-700 hover:text-black transition cursor-pointer relative"
              title={t('nav.favorites')}
            >
              <Heart className="w-5 h-5 text-gray-700 hover:text-black transition" />
              <span className="text-[9px] mt-0.5 text-gray-500 font-medium hidden sm:inline">{t('nav.favorites')}</span>
              {favoritesCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {favoritesCount}
                </span>
              )}
            </button>

            {/* Cart */}
            <button
              type="button"
              onClick={onOpenCart}
              className="flex flex-col items-center p-1 text-gray-700 hover:text-black transition cursor-pointer relative"
              title={t('nav.cart')}
            >
              <ShoppingCart className="w-5 h-5 text-gray-700 hover:text-black transition" />
              <span className="text-[9px] mt-0.5 text-gray-500 font-medium hidden sm:inline">{t('nav.cart')}</span>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full min-w-[16px] text-center">
                  {cartCount}
                </span>
              )}
            </button>

            {/* My Page (Pill Button in Bento Style) */}
            <button
              type="button"
              onClick={() => onNavigate('mypage')}
              className="flex items-center space-x-1.5 bg-gray-900 text-white px-4 py-1.5 rounded-full cursor-pointer hover:bg-gray-800 transition-colors text-xs font-semibold"
              title={t('nav.myPage')}
            >
              <User className="w-3.5 h-3.5 text-gray-300" />
              <span>{t('nav.myPage')}</span>
            </button>

            {/* Mobile Menu Trigger */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 md:hidden hover:bg-gray-100 rounded-lg text-gray-700 cursor-pointer"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="mt-2.5 md:hidden">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyDown={handleSearchKeyPress}
              placeholder={t('nav.searchPlaceholder')}
              className="w-full bg-gray-100 border-none rounded-full py-2 pl-9 pr-3 text-xs text-gray-800 focus:bg-white focus:ring-2 focus:ring-gray-300 outline-hidden"
            />
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-3 pt-3 border-t border-gray-200 space-y-3 pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-700">Language / 言語</span>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setLanguage('ja')}
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    language === 'ja' ? 'bg-black text-white' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  🇯🇵 日本語
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    language === 'en' ? 'bg-black text-white' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  🇺🇸 English
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => {
                  onNavigate('catalog', { category: 'all' });
                  setIsMobileMenuOpen(false);
                }}
                className="px-2.5 py-1 bg-gray-100 rounded-lg text-xs font-medium text-gray-800"
              >
                {t('nav.allCategories')}
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    onNavigate('catalog', { category: cat });
                    setIsMobileMenuOpen(false);
                  }}
                  className="px-2.5 py-1 bg-gray-100 rounded-lg text-xs font-medium text-gray-800"
                >
                  {getCategoryName(cat)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Sub-Navigation Categories / Internal View Links */}
        <div className="mt-2.5 pt-2 border-t border-slate-100 hidden sm:flex items-center justify-between text-xs text-slate-600">
          {/* Customer Category Navigation */}
          {currentRole === 'customer' && (
            <div className="flex items-center gap-4 overflow-x-auto whitespace-nowrap pb-1">
              <button
                type="button"
                onClick={() => onNavigate('catalog', { category: 'all' })}
                className={`hover:text-emerald-700 font-semibold cursor-pointer ${
                  activeView === 'catalog' && selectedCategory === 'all' ? 'text-emerald-700' : 'text-slate-800'
                }`}
              >
                {t('nav.allCategories')}
              </button>
              {CATEGORIES.slice(0, 7).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => onNavigate('catalog', { category: cat })}
                  className={`hover:text-emerald-700 transition cursor-pointer ${
                    activeView === 'catalog' && selectedCategory === cat
                      ? 'text-emerald-700 font-bold'
                      : 'text-slate-600'
                  }`}
                >
                  {getCategoryName(cat)}
                </button>
              ))}
            </div>
          )}

          {/* Staff Sub-Navigation */}
          {currentRole === 'staff' && (
            <div className="flex items-center gap-4 font-medium text-slate-700">
              <span className="text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded text-[11px]">
                {language === 'ja' ? 'スタッフ業務ポータル' : 'Staff Portal'}
              </span>
              <button
                type="button"
                onClick={() => onNavigate('staff-acquisitions')}
                className={`hover:text-blue-700 cursor-pointer ${
                  activeView === 'staff-acquisitions' ? 'text-blue-700 font-bold border-b-2 border-blue-600 pb-0.5' : ''
                }`}
              >
                {t('staff.navAcquisition')}
              </button>
              <button
                type="button"
                onClick={() => onNavigate('staff-inspections')}
                className={`hover:text-blue-700 cursor-pointer ${
                  activeView === 'staff-inspections' ? 'text-blue-700 font-bold border-b-2 border-blue-600 pb-0.5' : ''
                }`}
              >
                {t('staff.navInspection')}
              </button>
              <button
                type="button"
                onClick={() => onNavigate('staff-listing')}
                className={`hover:text-blue-700 cursor-pointer ${
                  activeView === 'staff-listing' ? 'text-blue-700 font-bold border-b-2 border-blue-600 pb-0.5' : ''
                }`}
              >
                {t('staff.navListing')}
              </button>
            </div>
          )}

          {/* Admin Sub-Navigation */}
          {currentRole === 'admin' && (
            <div className="flex items-center gap-4 font-medium text-slate-700">
              <span className="text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded text-[11px]">
                {language === 'ja' ? '経営・管理者ポータル' : 'Admin Portal'}
              </span>
              <button
                type="button"
                onClick={() => onNavigate('admin-dashboard')}
                className={`hover:text-purple-700 cursor-pointer ${
                  activeView === 'admin-dashboard' ? 'text-purple-700 font-bold border-b-2 border-purple-600 pb-0.5' : ''
                }`}
              >
                {t('admin.navDashboard')}
              </button>
              <button
                type="button"
                onClick={() => onNavigate('admin-inventory')}
                className={`hover:text-purple-700 cursor-pointer ${
                  activeView === 'admin-inventory' ? 'text-purple-700 font-bold border-b-2 border-purple-600 pb-0.5' : ''
                }`}
              >
                {t('admin.navInventory')}
              </button>
              <button
                type="button"
                onClick={() => onNavigate('admin-orders')}
                className={`hover:text-purple-700 cursor-pointer ${
                  activeView === 'admin-orders' ? 'text-purple-700 font-bold border-b-2 border-purple-600 pb-0.5' : ''
                }`}
              >
                {t('admin.navOrders')}
              </button>
              <button
                type="button"
                onClick={() => onNavigate('admin-ai-insights')}
                className={`hover:text-purple-700 cursor-pointer ${
                  activeView === 'admin-ai-insights' ? 'text-purple-700 font-bold border-b-2 border-purple-600 pb-0.5' : ''
                }`}
              >
                {t('admin.navAiInsights')}
              </button>
            </div>
          )}

          {/* Right Trust Badges */}
          <div className="flex items-center gap-3 text-slate-500">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              {language === 'ja' ? '14日間返品無料' : '14-Day Free Returns'}
            </span>
            <span className="flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-blue-600" />
              {language === 'ja' ? '¥5,000以上で送料無料' : 'Free Shipping over ¥5,000'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

