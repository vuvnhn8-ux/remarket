import React from 'react';
import { Heart, ShieldCheck, Check, Plus, ShoppingBag } from 'lucide-react';
import { ProductItem } from '../../types';
import { ConditionBadge } from '../common/ConditionBadge';
import { useLanguage } from '../../context/LanguageContext';

interface ProductCardProps {
  product: ProductItem;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string, e: React.MouseEvent) => void;
  onSelectProduct: (product: ProductItem) => void;
  onQuickAddToCart?: (product: ProductItem, e: React.MouseEvent) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isFavorite = false,
  onToggleFavorite,
  onSelectProduct,
  onQuickAddToCart,
}) => {
  const { language, t, getCategoryName } = useLanguage();

  const discountPercent =
    product.originalRetailPrice && product.originalRetailPrice > product.price
      ? Math.round(((product.originalRetailPrice - product.price) / product.originalRetailPrice) * 100)
      : null;

  return (
    <div
      onClick={() => onSelectProduct(product)}
      className="group card-elevated rounded-2xl p-3.5 flex flex-col justify-between cursor-pointer relative"
    >
      <div>
        {/* Product Image Stage in Bento Style */}
        <div className="relative mb-3 overflow-hidden rounded-xl bg-slate-100 aspect-4/3 border border-slate-100">
          <img
            src={product.featuredImage}
            alt={product.name}
            referrerPolicy="no-referrer"
            className={`w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ${
              product.isSold ? 'grayscale opacity-70' : ''
            }`}
            loading="lazy"
          />

          {/* Sold Overlay */}
          {product.isSold && (
            <div className="absolute inset-0 bg-black/65 backdrop-blur-2xs flex items-center justify-center">
              <span className="bg-rose-600 text-white text-[11px] font-black px-3 py-1 rounded-full tracking-wider shadow-md">
                {language === 'ja' ? 'SOLD OUT (完売)' : 'SOLD OUT'}
              </span>
            </div>
          )}

          {/* Condition Badge (Top Left) */}
          <div className="absolute top-2.5 left-2.5 z-10 drop-shadow-xs">
            <ConditionBadge rank={product.conditionRank} size="sm" showLabel={true} />
          </div>

          {/* Favorite Button (Top Right) */}
          {onToggleFavorite && (
            <button
              type="button"
              onClick={(e) => onToggleFavorite(product.id, e)}
              className={`absolute top-2.5 right-2.5 p-1.5 rounded-full z-10 transition ${
                isFavorite
                  ? 'bg-white text-rose-500 shadow-sm'
                  : 'bg-white/85 text-slate-400 hover:text-rose-500 hover:bg-white shadow-xs backdrop-blur-xs'
              }`}
              title={language === 'ja' ? 'お気に入りに追加' : 'Add to Wishlist'}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
          )}

          {/* Discount / Value Tag */}
          {discountPercent && discountPercent > 0 && !product.isSold && (
            <div className="absolute bottom-2 left-2 z-10 bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
              {discountPercent}% OFF
            </div>
          )}

          {/* Inspection Verified Icon */}
          <div className="absolute bottom-2 right-2 z-10 bg-slate-900/80 backdrop-blur-xs text-white text-[9px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1 border border-white/10">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>{language === 'ja' ? '検品済' : 'Inspected'}</span>
          </div>
        </div>

        {/* Brand & Title */}
        <div className="mb-2">
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium mb-0.5">
            <span>{product.brand}</span>
            <span>{getCategoryName(product.category)}</span>
          </div>
          <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 line-clamp-1 transition-colors leading-snug">
            {product.name}
          </h4>
          <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
            {product.defects && product.defects.length > 0
              ? `${language === 'ja' ? '【特記】' : '[Note] '}${product.defects.join('、')}`
              : product.cosmeticSummary || (language === 'ja' ? '専門スタッフ検品済み・動作良好' : 'Inspected & working tested')}
          </p>
        </div>
      </div>

      {/* Price & Action Row */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-end justify-between">
        <div>
          {product.originalRetailPrice && (
            <span className="text-[10px] text-slate-400 line-through block leading-tight">
              ¥{product.originalRetailPrice.toLocaleString()}
            </span>
          )}
          <div className="flex items-baseline gap-1">
            <span className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              ¥{product.price.toLocaleString()}
            </span>
            <span className="text-[10px] font-normal text-slate-400">
              {language === 'ja' ? '（税込）' : ' (incl. tax)'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {!product.isSold ? (
            <button
              type="button"
              onClick={(e) => {
                if (onQuickAddToCart) {
                  onQuickAddToCart(product, e);
                } else {
                  onSelectProduct(product);
                }
              }}
              className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
              title={language === 'ja' ? '商品詳細をみる' : 'View Product Details'}
            >
              <Plus className="w-4 h-4" />
            </button>
          ) : (
            <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
              {language === 'ja' ? '完売' : 'Sold Out'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};


