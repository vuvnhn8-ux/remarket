import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  SlidersHorizontal,
  RotateCcw,
  Check,
  ChevronDown,
  X,
  Sparkles,
} from 'lucide-react';
import { ProductItem, ProductCategory, ConditionRank, CONDITION_DETAILS } from '../../types';
import { CATEGORIES, BRANDS_BY_CATEGORY } from '../../data/seedData';
import { ProductCard } from './ProductCard';
import { useLanguage } from '../../context/LanguageContext';

interface ProductListingPageProps {
  products: ProductItem[];
  favorites: string[];
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onSelectProduct: (product: ProductItem) => void;
  initialCategory?: string;
  initialQuery?: string;
  initialRank?: string;
  initialSort?: string;
  onOpenAiAssistant: () => void;
}

export const ProductListingPage: React.FC<ProductListingPageProps> = ({
  products,
  favorites,
  onToggleFavorite,
  onSelectProduct,
  initialCategory = 'all',
  initialQuery = '',
  initialRank = 'all',
  initialSort = 'recommended',
  onOpenAiAssistant,
}) => {
  const { language, t, getCategoryName, getRankLabel } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedRank, setSelectedRank] = useState<string>(initialRank);
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>(initialQuery);
  const [sortBy, setSortBy] = useState<string>(initialSort);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState<boolean>(false);

  // Available brands based on selected category
  const availableBrands = useMemo(() => {
    if (selectedCategory !== 'all' && BRANDS_BY_CATEGORY[selectedCategory as ProductCategory]) {
      return BRANDS_BY_CATEGORY[selectedCategory as ProductCategory];
    }
    // All unique brands
    const set = new Set<string>();
    products.forEach((p) => set.add(p.brand));
    return Array.from(set).sort();
  }, [selectedCategory, products]);

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }
      if (selectedBrand !== 'all' && item.brand !== selectedBrand) {
        return false;
      }
      if (selectedRank !== 'all' && item.conditionRank !== selectedRank) {
        return false;
      }
      if (minPrice && Number(minPrice) > 0 && item.price < Number(minPrice)) {
        return false;
      }
      if (maxPrice && Number(maxPrice) > 0 && item.price > Number(maxPrice)) {
        return false;
      }
      if (inStockOnly && (item.isSold || item.stock <= 0)) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches =
          item.name.toLowerCase().includes(q) ||
          item.brand.toLowerCase().includes(q) ||
          item.model.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.keywords.some((k) => k.toLowerCase().includes(q)) ||
          item.description.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'newest') return b.createdAt.localeCompare(a.createdAt);
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      if (sortBy === 'popularity') return b.viewCount - a.viewCount;
      // Recommended: in stock first, then views
      if (a.stock !== b.stock) return b.stock - a.stock;
      return b.viewCount - a.viewCount;
    });
  }, [products, selectedCategory, selectedBrand, selectedRank, minPrice, maxPrice, inStockOnly, searchQuery, sortBy]);

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSelectedBrand('all');
    setSelectedRank('all');
    setMinPrice('');
    setMaxPrice('');
    setInStockOnly(false);
    setSearchQuery('');
    setSortBy('recommended');
  };

  const activeFilterCount = [
    selectedCategory !== 'all',
    selectedBrand !== 'all',
    selectedRank !== 'all',
    minPrice !== '',
    maxPrice !== '',
    inStockOnly,
    searchQuery !== '',
  ].filter(Boolean).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Search & Breadcrumb Bar */}
      <div className="bg-white/90 backdrop-blur-xs p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-slate-900 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Verified Stock
            </span>
            <span className="text-xs text-slate-500 font-medium">{filteredProducts.length} {t('hero.inStock')}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
            <span>{t('listing.title')}</span>
            {searchQuery && (
              <span className="text-sm font-normal text-slate-500">
                {language === 'ja' ? `「${searchQuery}」の検索結果` : `Search results for "${searchQuery}"`}
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {t('listing.subtitle')}
          </p>
        </div>

        {/* AI Concierge Shortcut */}
        <button
          type="button"
          onClick={onOpenAiAssistant}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-purple-50 to-indigo-50 text-purple-800 hover:from-purple-100 hover:to-indigo-100 border border-purple-200/80 rounded-2xl text-xs font-bold transition shadow-2xs cursor-pointer shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-600 animate-subtle-pulse" />
          <span>{language === 'ja' ? 'お探しの条件をAIに相談する' : 'Ask AI Shopping Assistant'}</span>
        </button>
      </div>

      {/* Main Content Layout (Sidebar Filters + Product Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block bg-white/95 backdrop-blur-xs p-5 rounded-3xl border border-slate-200/90 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
              {t('listing.filters')}
            </span>
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer font-medium"
              >
                <RotateCcw className="w-3 h-3" />
                {t('listing.reset')} ({activeFilterCount})
              </button>
            )}
          </div>

          {/* In Stock Only Toggle */}
          <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-xs font-bold text-slate-800">{t('listing.inStockOnly')}</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          {/* Category Filter */}
          <div>
            <label className="text-xs font-bold text-slate-800 block mb-2">{t('listing.category')}</label>
            <div className="space-y-1 max-h-48 overflow-y-auto pr-1 text-xs">
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedBrand('all');
                }}
                className={`w-full text-left px-2.5 py-1.5 rounded-md transition ${
                  selectedCategory === 'all'
                    ? 'bg-emerald-50 text-emerald-700 font-bold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {t('listing.allCategories')} ({products.length})
              </button>
              {CATEGORIES.map((cat) => {
                const count = products.filter((p) => p.category === cat).length;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(cat);
                      setSelectedBrand('all');
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-md transition flex items-center justify-between ${
                      selectedCategory === cat
                        ? 'bg-emerald-50 text-emerald-700 font-bold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>{getCategoryName(cat)}</span>
                    <span className="text-[10px] text-slate-400">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Brand Filter */}
          <div>
            <label className="text-xs font-bold text-slate-800 block mb-2">{t('listing.brand')}</label>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="w-full h-9 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">{t('listing.allBrands')} ({availableBrands.length})</option>
              {availableBrands.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* Condition Rank Filter */}
          <div>
            <label className="text-xs font-bold text-slate-800 block mb-2">{t('listing.conditionRank')}</label>
            <div className="space-y-1 text-xs">
              <button
                type="button"
                onClick={() => setSelectedRank('all')}
                className={`w-full text-left px-2.5 py-1.5 rounded-md transition ${
                  selectedRank === 'all'
                    ? 'bg-emerald-50 text-emerald-700 font-bold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {t('listing.allRanks')}
              </button>
              {(['S', 'A', 'B', 'C', 'D'] as ConditionRank[]).map((r) => {
                const info = getRankLabel(r);
                const count = products.filter((p) => p.conditionRank === r).length;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setSelectedRank(r)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-md transition flex items-center justify-between ${
                      selectedRank === r
                        ? 'bg-emerald-50 text-emerald-700 font-bold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-black text-xs">
                        {language === 'ja' ? `ランク${r}` : `RANK ${r}`}
                      </span>
                      <span className="text-[11px] text-slate-500">{info.label}</span>
                    </div>
                    <span className="text-[10px] text-slate-400">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price Range Filter */}
          <div>
            <label className="text-xs font-bold text-slate-800 block mb-2">{t('listing.priceRange')}</label>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder={t('listing.minPrice')}
                className="w-full h-8 px-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden"
              />
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder={t('listing.maxPrice')}
                className="w-full h-8 px-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden"
              />
            </div>
            {/* Quick Price Buttons */}
            <div className="flex flex-wrap gap-1">
              {[
                { label: language === 'ja' ? '〜3万' : '≤ ¥30k', max: '30000' },
                { label: language === 'ja' ? '〜5万' : '≤ ¥50k', max: '50000' },
                { label: language === 'ja' ? '〜10万' : '≤ ¥100k', max: '100000' },
                { label: language === 'ja' ? '10万〜' : '≥ ¥100k', min: '100000' },
              ].map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    if (preset.max) {
                      setMinPrice('');
                      setMaxPrice(preset.max);
                    } else if (preset.min) {
                      setMinPrice(preset.min);
                      setMaxPrice('');
                    }
                  }}
                  className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-[10px] text-slate-600 font-medium cursor-pointer"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Product Grid & Controls */}
        <main className="lg:col-span-3 space-y-4">
          {/* Top Results Bar */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">{t('listing.resultsCount')}:</span>
              <span className="text-sm font-black text-slate-900">{filteredProducts.length}</span>
              <span className="text-xs text-slate-500">{t('listing.itemsUnit')}</span>

              {/* Mobile Filter Button */}
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
                className="lg:hidden ml-2 px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md text-xs font-bold flex items-center gap-1"
              >
                <Filter className="w-3 h-3" />
                {t('listing.filters')}
                {activeFilterCount > 0 && ` (${activeFilterCount})`}
              </button>
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 hidden sm:inline">{t('listing.sortBy')}:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="h-8 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden cursor-pointer"
              >
                <option value="recommended">{t('listing.sortRecommended')}</option>
                <option value="newest">{t('listing.sortNewest')}</option>
                <option value="price_asc">{t('listing.sortPriceAsc')}</option>
                <option value="price_desc">{t('listing.sortPriceDesc')}</option>
                <option value="popularity">{t('listing.sortPopularity')}</option>
              </select>
            </div>
          </div>

          {/* Active Filters Pill Chips */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-[11px] text-slate-400">{t('listing.activeFilters')}:</span>
              {selectedCategory !== 'all' && (
                <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                  {getCategoryName(selectedCategory)}
                  <button type="button" onClick={() => setSelectedCategory('all')}><X className="w-3 h-3" /></button>
                </span>
              )}
              {selectedBrand !== 'all' && (
                <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md border border-blue-200 flex items-center gap-1">
                  {selectedBrand}
                  <button type="button" onClick={() => setSelectedBrand('all')}><X className="w-3 h-3" /></button>
                </span>
              )}
              {selectedRank !== 'all' && (
                <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md border border-amber-200 flex items-center gap-1">
                  {language === 'ja' ? `ランク${selectedRank}` : `RANK ${selectedRank}`}
                  <button type="button" onClick={() => setSelectedRank('all')}><X className="w-3 h-3" /></button>
                </span>
              )}
              {inStockOnly && (
                <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                  {t('listing.inStockOnly')}
                  <button type="button" onClick={() => setInStockOnly(false)}><X className="w-3 h-3" /></button>
                </span>
              )}
              {(minPrice || maxPrice) && (
                <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200 flex items-center gap-1">
                  ¥{minPrice || '0'} 〜 ¥{maxPrice || (language === 'ja' ? '上限なし' : 'No limit')}
                  <button type="button" onClick={() => { setMinPrice(''); setMaxPrice(''); }}><X className="w-3 h-3" /></button>
                </span>
              )}
            </div>
          )}

          {/* Product Grid */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {filteredProducts.map((prod) => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  isFavorite={favorites.includes(prod.id)}
                  onToggleFavorite={onToggleFavorite}
                  onSelectProduct={onSelectProduct}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800">{t('listing.noProductsFound')}</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {t('listing.noProductsSub')}
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition cursor-pointer"
              >
                {t('listing.clearAllFilters')}
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

