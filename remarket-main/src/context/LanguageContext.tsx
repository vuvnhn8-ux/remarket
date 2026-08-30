import React, { createContext, useContext, useState, useEffect } from 'react';
import { ConditionRank, ProductCategory } from '../types';

export type Language = 'ja' | 'en';

export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string, defaultText?: string) => string;
  getCategoryName: (cat: ProductCategory | string) => string;
  getRankLabel: (rank: ConditionRank) => { label: string; sub: string; desc: string };
  getOrderStatusLabel: (status: string) => string;
  getPaymentMethodLabel: (method: string) => string;
}

export const translations = {
  ja: {
    // Header & Navigation
    'brand.title': 'ReMarket',
    'brand.tagline': 'リマーケット・循環型リユースEC',
    'brand.heroTitle': 'いいモノに、もう一度新しい価値を。',
    'brand.slogan': '買う。売る。再利用する。つなげる。',
    'brand.sloganLabel': 'スローガン',
    'brand.mission': '中古品の売買を、もっと簡単で安心でき、誰もが利用しやすいものにします。',
    'brand.vision': 'まだ価値のあるモノが廃棄されず、次の人へつながっていく世界を目指します。',
    'nav.categories': 'カテゴリー',
    'nav.tradeIn': '買取案内',
    'nav.favorites': 'お気に入り',
    'nav.cart': 'カート',
    'nav.myPage': 'マイページ',
    'nav.aiConsult': 'AI相談',
    'nav.aiConsultFull': 'AIお買い物相談',
    'nav.searchPlaceholder': '商品名・ブランド・型番などで検索',
    'nav.allCategories': '全カテゴリー',
    'role.customer': '一般購入者モード',
    'role.staff': 'リユース現場スタッフ',
    'role.admin': '統括管理者・経営',
    'role.modeSwitch': '権限切替',

    // Workflow banner
    'workflow.model': '循環型リユース・一貫バリューチェーン',
    'workflow.subtitle': '中古一点物特有の「買取・検品・個別在庫・出品・販売」全プロセスを管理',
    'workflow.step1': '1. お客様から買取',
    'workflow.step1Sub': '買取査定・受入',
    'workflow.step2': '2. 厳格な動作検品',
    'workflow.step2Sub': '20項目検査・ランク付',
    'workflow.step3': '3. 在庫・適正価格',
    'workflow.step3Sub': 'シリアル・粗利管理',
    'workflow.step4': '4. ECサイト出品',
    'workflow.step4Sub': 'AI出品文・状態開示',
    'workflow.step5': '5. 次のお客様が購入',
    'workflow.step5Sub': '一点物在庫・即時決済',
    'workflow.step6': '6. 即日出荷・お届け',
    'workflow.step6Sub': '安心保証＆アフター',

    // Bento Hero
    'hero.title': 'いいモノに、もう一度新しい価値を。',
    'hero.slogan': '買う。売る。再利用する。つなげる。',
    'hero.mission': '中古品の売買を、もっと簡単で安心でき、誰もが利用しやすいものにします。',
    'hero.vision': 'まだ価値のあるモノが廃棄されず、次の人へつながっていく世界を目指します。',
    'hero.tagline': 'いいモノに、もう一度新しい価値を。',
    'hero.subtitle': '中古品の売買を、もっと簡単で安心でき、誰もが利用しやすいものにします。まだ価値のあるモノが廃棄されず、次の人へつながっていく世界を目指します。',
    'hero.desc': '中古品の売買を、もっと簡単で安心でき、誰もが利用しやすいものにします。まだ価値のあるモノが廃棄されず、次の人へつながっていく世界を目指します。',
    'hero.tag': '循環型リユースマーケットプレイス',
    'hero.badge': '循環型リユースマーケットプレイス',
    'hero.missionLabel': 'Mission',
    'hero.visionLabel': 'Vision',
    'hero.sloganLabel': 'Slogan',
    'hero.searchPlaceholder': '商品名・ブランド・型番で検索',
    'hero.searchButton': '検索',
    'hero.trending': '注目：',
    'hero.featured': '注目',
    'hero.processTitle': '買取・リユースプロセス',
    'hero.highPriceBadge': '高価買取',
    'hero.process1': 'お客様から買取・受取',
    'hero.process1Sub': '宅配・店頭でスピード無料査定',
    'hero.process2': '専門スタッフが精密検品',
    'hero.process2Sub': '20項目動作検証＆クリーニング',
    'hero.process3': 'コンディション格付け・出品',
    'hero.process3Sub': 'S〜Dランク・実物写真で透明販売',
    'hero.processButton': '商品をさがす / Web査定',
    'hero.statNew': '新着・即納アイテム',
    'hero.inStock': '点 在庫中',
    'hero.stockStatTitle': '新着・即納アイテム',
    'hero.stockStatUnit': '点 在庫中',
    'hero.stockStatToday': '本日 新規検品完了',
    'hero.categoryTitle': 'CATEGORY',
    'hero.categoryAll': 'すべて見る',
    'hero.viewAll': 'すべて見る',
    'hero.shippingBadge': '24時間以内 全国即日発送',
    'hero.fastShipping': '24時間以内 全国即日発送',
    'hero.warrantyBadge': '14日間 返品保証付',
    'hero.returnGuaranteed': '14日間 返品保証付',
    'hero.aiTitle': 'AIショッピング相談',
    'hero.aiDesc': '「予算10万円以内で動画撮影向きのカメラを探して」等、AIが実在庫から最適な中古品をご案内。',
    'hero.aiButton': 'AIコンシェルジュを開く',
    'hero.openAi': 'AIコンシェルジュを開く',
    'common.search': '検索',

    // Home Sections
    'categories.title': 'カテゴリーから探す',
    'categories.subtitle': 'お探しのジャンルから厳選中古品をチェック',
    'categories.allCategories': '全カテゴリー',
    'section.browseCategory': 'カテゴリーから探す',
    'section.browseCategorySub': 'お探しのジャンルから厳選中古品をチェック',
    'section.allCategories': '全カテゴリー',
    'sections.recentTitle': '新着商品',
    'sections.recentSubtitle': '専門スタッフによる検品・クリーニングを完了したばかりの最新入荷アイテム',
    'sections.viewMore': 'もっと見る',
    'section.newArrivals': '新着商品',
    'section.newArrivalsSub': '専門スタッフによる検品・クリーニングを完了したばかりの最新入荷アイテム',
    'section.viewMoreNew': '新着をもっと見る',
    'sections.highRankTitle': '高評価コンディション特選（S・Aランク）',
    'sections.highRankSubtitle': '新品同様・極上コンディションの厳選中古アイテム',
    'section.highRank': '高評価コンディション特選（S・Aランク）',
    'section.highRankSub': '新品同様・極上コンディションの厳選中古アイテム',
    'section.viewMoreRank': '美品を見る',
    'sections.popularTitle': 'おすすめ・人気の商品',
    'sections.popularSubtitle': '多くのお客様に閲覧・検討されている注目の中古アイテム',
    'section.popular': 'おすすめ・人気の商品',
    'section.popularSub': '多くのお客様に閲覧・検討されている注目の中古アイテム',
    'section.viewMorePopular': '人気順で見る',
    'sections.bargainTitle': 'お買い得商品',
    'sections.bargainSubtitle': 'コストパフォーマンス抜群のバリュープライス中古品',
    'section.deals': 'お買い得商品',
    'section.dealsSub': 'コストパフォーマンス抜群のバリュープライス中古品',
    'section.viewMoreDeals': '価格順で見る',

    // Trust Pillars
    'trust.tag': 'TRUST & TRANSPARENCY',
    'trust.title': '中古品だからこそ、新品以上の透明性を。',
    'trust.badge': 'Re:Market 3つの安心',
    'trust.card1Title': '20項目以上の厳格検品',
    'trust.card1Desc': '専任の技術査定士が通電、主要機能、センサーゴミ、バッテリー劣化度などを1点ずつ徹底テスト。全品に検品担当者名と検品日を明記。',
    'trust.card2Title': '実物写真と傷の完全開示',
    'trust.card2Desc': 'イメージ画像ではなく、お届けする実物の写真を掲載。微細なスレや欠品情報も包み隠さず記載し、届いてからのギャップをゼロに。',
    'trust.card3Title': '最大6ヶ月保証 & 返品無料',
    'trust.card3Desc': '初期不良時は14日間返品・返金無料。ランクに応じて最大6ヶ月の無償動作保証が付帯するため、安心してお使いいただけます。',
    'trust.p1Title': '20項目以上の厳格検品',
    'trust.p1Desc': '専任の技術査定士が通電、主要機能、センサーゴミ、バッテリー劣化度などを1点ずつ徹底テスト。全品に検品担当者名と検品日を明記。',
    'trust.p2Title': '実物写真と傷の完全開示',
    'trust.p2Desc': 'イメージ画像ではなく、お届けする実物の写真を掲載。微細なスレや欠品情報も包み隠さず記載し、届いてからのギャップをゼロに。',
    'trust.p3Title': '最大6ヶ月保証 & 返品無料',
    'trust.p3Desc': '初期不良時は14日間返品・返金無料。ランクに応じて最大6ヶ月の無償動作保証が付帯するため、安心してお使いいただけます。',

    // Product Card & Listing
    'listing.title': '一点物 在庫カタログ',
    'listing.subtitle': 'プロの査定士による20項目検品をクリアした一点物中古品。全品実物写真・保証付き。',
    'listing.filters': '絞り込み検索',
    'listing.reset': 'リセット',
    'listing.inStockOnly': '在庫ありのみ表示',
    'listing.category': 'カテゴリー',
    'listing.allCategories': 'すべてのカテゴリー',
    'listing.brand': 'ブランド・メーカー',
    'listing.allBrands': 'すべてのブランド',
    'listing.conditionRank': '状態ランク',
    'listing.priceRange': '価格帯（円）',
    'listing.sortBy': '並び順',
    'listing.sortRecommended': 'おすすめ順',
    'listing.sortNewest': '新着順',
    'listing.sortPriceAsc': '価格が安い順',
    'listing.sortPriceDesc': '価格が高い順',
    'listing.sortPopular': '人気・閲覧数順',
    'listing.noProducts': '条件に一致する商品が見つかりませんでした。',
    'product.taxIncluded': '（税込）',
    'product.refPrice': '参考定価',
    'product.off': 'OFF',
    'product.verified': '検品済',
    'product.inStock': '在庫1点',
    'product.soldOut': 'SOLD OUT (完売)',
    'product.specialNote': '【特記】',
    'product.sort': '並び替え',
    'product.sortNewest': '新着順',
    'product.sortPriceAsc': '価格が安い順',
    'product.sortPriceDesc': '価格が高い順',
    'product.sortPopularity': '人気順',
    'product.filterCondition': '状態ランク',
    'product.filterCategory': 'カテゴリー',
    'product.filterPrice': '価格帯',
    'product.filterAll': 'すべて',
    'product.resultsCount': '件の商品',
    'product.noResults': '該当する商品が見つかりませんでした。',
    'product.resetFilters': '条件をクリア',

    // Product Detail
    'detail.serialNumber': 'シリアル番号',
    'detail.warehouseLocation': '保管倉庫',
    'detail.inspectionBadge': '20項目精密検品合格',
    'detail.inspector': '検品担当査定士',
    'detail.inspectionDate': '検品実施日',
    'detail.warrantyPeriod': '動作保証期間',
    'detail.warrantyMonths': 'ヶ月無償保証',
    'detail.shippingEstimate': '発送予定',
    'detail.shippingEstimateVal': 'ご注文確定後24時間以内に発送（ヤマト運輸）',
    'detail.accessories': '付属品状況',
    'detail.included': '同梱付属品',
    'detail.missing': '欠品',
    'detail.defects': '外観・特記事項（傷・スレ等の開示）',
    'detail.noDefects': '特記すべき目立つ傷・不具合はありません。',
    'detail.functionalStatus': '機能・動作検証結果',
    'detail.addToCart': 'カートに追加する',
    'detail.buyNow': '今すぐ購入手続きへ',
    'detail.oneOfAKindNotice': '※本商品は一点物のため、ご注文完了順の確保となります。',
    'detail.returnPolicy': '14日間初期不良 返品・返金全額保証',
    'detail.returnPolicySub': '万一の初期不良時は着払いにてご返品いただけます。',
    'detail.backToCatalog': '商品一覧に戻る',

    // Cart & Checkout
    'cart.title': 'ショッピングカート',
    'cart.empty': 'カートに商品が入っていません。',
    'cart.emptySub': '気になる一点物中古品を探してみましょう。',
    'cart.browseButton': '商品を探しに行く',
    'cart.subtotal': '小計',
    'cart.tax': '消費税 (10%)',
    'cart.shipping': '送料',
    'cart.shippingFree': '無料 (全国一律)',
    'cart.total': '合計金額',
    'cart.proceedCheckout': 'ご購入手続きへ進む',
    'cart.remove': '削除',
    'cart.oneStockWarning': '※中古一点物のため、決済完了まで在庫は確保されません。',

    'checkout.title': 'ご注文・決済手続き',
    'checkout.shippingInfo': 'お届け先情報',
    'checkout.name': 'お名前',
    'checkout.email': 'メールアドレス',
    'checkout.phone': '電話番号',
    'checkout.postalCode': '郵便番号',
    'checkout.address': 'お届け先住所',
    'checkout.deliverySlot': '配達希望時間帯',
    'checkout.slotAny': '指定なし（最短でお届け）',
    'checkout.slotMorning': '午前中（8時〜12時）',
    'checkout.slot1416': '14時〜16時',
    'checkout.slot1618': '16時〜18時',
    'checkout.slot1820': '18時〜20時',
    'checkout.slot1921': '19時〜21時',
    'checkout.paymentMethod': 'お支払い方法',
    'checkout.orderSummary': 'ご注文内容',
    'checkout.confirmOrder': '注文を確定する',
    'checkout.completeTitle': 'ご注文ありがとうございました！',
    'checkout.completeDesc': 'ご注文番号を発行し、発送準備を開始しました。',
    'checkout.orderId': 'ご注文番号',
    'checkout.tracking': 'ヤマト追跡番号',
    'checkout.viewMyPage': 'マイページで注文を確認',
    'checkout.continueShopping': 'お買い物を続ける',

    // My Page
    'mypage.title': 'マイページ',
    'mypage.tabOrders': 'ご注文履歴・配送状況',
    'mypage.tabFavorites': 'お気に入りリスト',
    'mypage.tabProfile': '会員情報・お届け先',
    'mypage.noOrders': 'ご注文履歴はありません。',
    'mypage.noFavorites': 'お気に入りに登録された商品はありません。',
    'mypage.trackPackage': '配送状況を追跡',
    'mypage.orderDate': '注文日時',
    'mypage.carrier': '配送業者',

    // Staff & Admin
    'staff.navAcquisition': '1. 買取・仕入管理',
    'staff.navInspection': '2. 動作検品・格付け',
    'staff.navListing': '3. AI出品・商品登録',
    'staff.newAcquisition': '新規買取受付',
    'staff.startInspection': '検品を開始する',
    'staff.generateAiCopy': 'Gemini AIで出品文を自動生成',

    'admin.navDashboard': 'ダッシュボード',
    'admin.navInventory': '一点物在庫・粗利台帳',
    'admin.navOrders': '注文・出荷管理',
    'admin.navAiInsights': 'AI経営戦略インサイト',

    // Footer
    'footer.inspectionTitle': 'プロによる20項目精密検品',
    'footer.inspectionDesc': '全商品、専門の査定士・技術スタッフが通電・主要機能・センサー・端子を徹底検査。全品に検品担当者名と検品日を開示。',
    'footer.warrantyTitle': '安心の動作保証 & 返品対応',
    'footer.warrantyDesc': '万が一の初期不良時は商品到着後14日間返品・返金無料。ランクに応じた最大6ヶ月の無償動作保証をお付けしています。',
    'footer.shippingTitle': '自社リユースセンターより即日発送',
    'footer.shippingDesc': '国内自社倉庫で大切に温湿度管理・除菌保管。平日・土日祝問わず14時までのご注文は即日発送いたします（ヤマト運輸）。',
    'footer.companySummary': '「中古品に、もう一度価値を。」不要になったモノを適正価格でお買取し、徹底的な検品と価値再生を行って次の方へお届けする循環型リユースECプラットフォームです。',
    'footer.license': '古物商許可番号: 東京都公安委員会 第301000000000号',
    'footer.companyName': 'Re:Market株式会社 リユースEC事業本部',
    'footer.terms': '利用規約',
    'footer.privacy': 'プライバシーポリシー',
    'footer.law': '特定商取引法に基づく表記',
    'footer.copyright': '© 2026 Re:Market Co., Ltd. All rights reserved. 「中古品に、もう一度価値を。」',
  },
  en: {
    // Header & Navigation
    'brand.title': 'ReMarket',
    'brand.tagline': 'Circular Reuse E-Commerce Platform',
    'brand.heroTitle': 'Give Good Things Another Life.',
    'brand.slogan': 'Buy. Sell. Reuse. Repeat.',
    'brand.sloganLabel': 'Slogan',
    'brand.mission': 'We make buying and selling pre-owned products simple, trusted, and accessible.',
    'brand.vision': 'A world where good products keep moving instead of becoming waste.',
    'nav.categories': 'Categories',
    'nav.tradeIn': 'Trade-In',
    'nav.favorites': 'Favorites',
    'nav.cart': 'Cart',
    'nav.myPage': 'My Account',
    'nav.aiConsult': 'AI Assistant',
    'nav.aiConsultFull': 'AI Shopping Concierge',
    'nav.searchPlaceholder': 'Search by product, brand, or model...',
    'nav.allCategories': 'All Categories',
    'role.customer': 'Customer Mode',
    'role.staff': 'Warehouse Staff',
    'role.admin': 'Admin / Executive',
    'role.modeSwitch': 'Switch Role',

    // Workflow banner
    'workflow.model': 'Circular Reuse Value-Chain Model',
    'workflow.subtitle': 'Managing the complete single-item lifecycle: Acquisition → Inspection → Inventory → Listing → Sale',
    'workflow.step1': '1. Trade-In Acquisition',
    'workflow.step1Sub': 'Appraisal & Receipt',
    'workflow.step2': '2. Precision Inspection',
    'workflow.step2Sub': '20-Point Check & Grading',
    'workflow.step3': '3. Inventory & Pricing',
    'workflow.step3Sub': 'Serial & Margin Tracking',
    'workflow.step4': '4. E-Commerce Listing',
    'workflow.step4Sub': 'AI Copy & Full Disclosure',
    'workflow.step5': '5. Customer Purchase',
    'workflow.step5Sub': 'One-of-a-kind Reservation',
    'workflow.step6': '6. Same-Day Delivery',
    'workflow.step6Sub': 'Warranty & Aftercare',

    // Bento Hero
    'hero.title': 'Give Good Things Another Life.',
    'hero.slogan': 'Buy. Sell. Reuse. Repeat.',
    'hero.mission': 'We make buying and selling pre-owned products simple, trusted, and accessible.',
    'hero.vision': 'A world where good products keep moving instead of becoming waste.',
    'hero.tagline': 'Give Good Things Another Life.',
    'hero.subtitle': 'We make buying and selling pre-owned products simple, trusted, and accessible. A world where good products keep moving instead of becoming waste.',
    'hero.desc': 'We make buying and selling pre-owned products simple, trusted, and accessible. A world where good products keep moving instead of becoming waste.',
    'hero.tag': 'Circular Reuse Marketplace',
    'hero.badge': 'Circular Reuse Marketplace',
    'hero.missionLabel': 'Mission',
    'hero.visionLabel': 'Vision',
    'hero.sloganLabel': 'Slogan',
    'hero.searchPlaceholder': 'Search product name, brand, or model',
    'hero.searchButton': 'Search',
    'hero.trending': 'Popular:',
    'hero.featured': 'Popular',
    'hero.processTitle': 'Trade-in & Reuse Process',
    'hero.highPriceBadge': 'Best Value',
    'hero.process1': 'Customer Trade-In Receipt',
    'hero.process1Sub': 'Fast free appraisal online or in-store',
    'hero.process2': 'Expert Technical Inspection',
    'hero.process2Sub': '20-point diagnostics & cleaning',
    'hero.process3': 'Condition Grading & Listing',
    'hero.process3Sub': 'Transparent Rank S–D disclosure',
    'hero.processButton': 'Explore Products / Free Appraisal',
    'hero.statNew': 'Ready-to-Ship Stock',
    'hero.inStock': 'items in stock',
    'hero.stockStatTitle': 'Ready-to-Ship Stock',
    'hero.stockStatUnit': 'items in stock',
    'hero.stockStatToday': 'inspected & verified today',
    'hero.categoryTitle': 'CATEGORY',
    'hero.categoryAll': 'View All',
    'hero.viewAll': 'View All',
    'hero.shippingBadge': 'Ships Nationwide in 24h',
    'hero.fastShipping': 'Ships Nationwide in 24h',
    'hero.warrantyBadge': '14-Day Free Returns',
    'hero.returnGuaranteed': '14-Day Free Returns',
    'hero.aiTitle': 'AI Shopping Concierge',
    'hero.aiDesc': 'Ask: "Find me a video-capable camera under ¥100,000" — AI searches live inventory instantly.',
    'hero.aiButton': 'Open AI Concierge',
    'hero.openAi': 'Open AI Concierge',
    'common.search': 'Search',

    // Home Sections
    'categories.title': 'Browse by Category',
    'categories.subtitle': 'Explore certified pre-owned items by genre',
    'categories.allCategories': 'All Categories',
    'section.browseCategory': 'Browse by Category',
    'section.browseCategorySub': 'Explore certified pre-owned items by genre',
    'section.allCategories': 'All Categories',
    'sections.recentTitle': 'New Arrivals',
    'sections.recentSubtitle': 'Freshly inspected and cleaned pre-owned gear listed today',
    'sections.viewMore': 'View More',
    'section.newArrivals': 'New Arrivals',
    'section.newArrivalsSub': 'Freshly inspected and cleaned pre-owned gear listed today',
    'section.viewMoreNew': 'View More New',
    'sections.highRankTitle': 'Pristine Condition Specials (Rank S & A)',
    'sections.highRankSubtitle': 'Like-new and mint condition certified pre-owned gear',
    'section.highRank': 'Pristine Condition Specials (Rank S & A)',
    'section.highRankSub': 'Like-new and mint condition certified pre-owned gear',
    'section.viewMoreRank': 'View Mint Items',
    'sections.popularTitle': 'Trending & Recommended',
    'sections.popularSubtitle': 'Most viewed and highly requested pre-owned gear',
    'section.popular': 'Trending & Recommended',
    'section.popularSub': 'Most viewed and highly requested pre-owned gear',
    'section.viewMorePopular': 'View Popular',
    'sections.bargainTitle': 'Value Deals & Steals',
    'sections.bargainSubtitle': 'Top performance-to-price ratio certified gear',
    'section.deals': 'Value Deals & Steals',
    'section.dealsSub': 'Top performance-to-price ratio certified gear',
    'section.viewMoreDeals': 'View by Price',

    // Trust Pillars
    'trust.tag': 'TRUST & TRANSPARENCY',
    'trust.title': 'Because it is pre-owned, transparency exceeds new.',
    'trust.badge': 'Re:Market 3 Pillars of Trust',
    'trust.card1Title': '20-Point Rigorous Inspection',
    'trust.card1Desc': 'Certified technicians test power, screen, sensors, and battery health on every single unit. Inspector name and date included on every item.',
    'trust.card2Title': 'Actual Photos & Honest Disclosure',
    'trust.card2Desc': 'No generic stock photos. We photograph the exact item you receive with full disclosure of minor scratches, cosmetic wear, and accessories.',
    'trust.card3Title': 'Up to 6-Month Warranty & Free Returns',
    'trust.card3Desc': '14-day hassle-free returns for any defects. Includes up to 6 months of complimentary hardware warranty based on condition grade.',
    'trust.p1Title': '20-Point Rigorous Inspection',
    'trust.p1Desc': 'Certified technicians test power, screen, sensors, and battery health on every single unit. Inspector name and date included on every item.',
    'trust.p2Title': 'Actual Photos & Honest Disclosure',
    'trust.p2Desc': 'No generic stock photos. We photograph the exact item you receive with full disclosure of minor scratches, cosmetic wear, and accessories.',
    'trust.p3Title': 'Up to 6-Month Warranty & Free Returns',
    'trust.p3Desc': '14-day hassle-free returns for any defects. Includes up to 6 months of complimentary hardware warranty based on condition grade.',

    // Product Card & Listing
    'listing.title': 'Certified Pre-Owned Inventory',
    'listing.subtitle': 'Explore 100% inspected and certified pre-owned items with guaranteed authenticity.',
    'listing.filters': 'Filters',
    'listing.reset': 'Reset',
    'listing.inStockOnly': 'In Stock Only',
    'listing.category': 'Category',
    'listing.allCategories': 'All Categories',
    'listing.brand': 'Brand / Manufacturer',
    'listing.allBrands': 'All Brands',
    'listing.conditionRank': 'Condition Rank',
    'listing.priceRange': 'Price Range (JPY)',
    'listing.sortBy': 'Sort By',
    'listing.sortRecommended': 'Recommended',
    'listing.sortNewest': 'Newest First',
    'listing.sortPriceAsc': 'Price: Low to High',
    'listing.sortPriceDesc': 'Price: High to Low',
    'listing.sortPopular': 'Most Popular',
    'listing.noProducts': 'No matching products found.',
    'product.taxIncluded': '(Tax Incl.)',
    'product.refPrice': 'MSRP',
    'product.off': 'OFF',
    'product.verified': 'Inspected',
    'product.inStock': '1 In Stock',
    'product.soldOut': 'SOLD OUT',
    'product.specialNote': '[Note]',
    'product.sort': 'Sort By',
    'product.sortNewest': 'Newest First',
    'product.sortPriceAsc': 'Price: Low to High',
    'product.sortPriceDesc': 'Price: High to Low',
    'product.sortPopularity': 'Most Popular',
    'product.filterCondition': 'Condition Rank',
    'product.filterCategory': 'Category',
    'product.filterPrice': 'Price Range',
    'product.filterAll': 'All',
    'product.resultsCount': 'items found',
    'product.noResults': 'No matching products found.',
    'product.resetFilters': 'Reset Filters',

    // Product Detail
    'detail.serialNumber': 'Serial Number',
    'detail.warehouseLocation': 'Warehouse Location',
    'detail.inspectionBadge': '20-Point Inspection Passed',
    'detail.inspector': 'Certified Inspector',
    'detail.inspectionDate': 'Inspection Date',
    'detail.warrantyPeriod': 'Warranty Period',
    'detail.warrantyMonths': 'months free warranty',
    'detail.shippingEstimate': 'Shipping Time',
    'detail.shippingEstimateVal': 'Ships within 24 hours of order confirmation (Yamato Transport)',
    'detail.accessories': 'Accessories Status',
    'detail.included': 'Included',
    'detail.missing': 'Missing / Not Included',
    'detail.defects': 'Cosmetic Wear & Defect Disclosures',
    'detail.noDefects': 'No noticeable scratches or defects found.',
    'detail.functionalStatus': 'Functional Verification Results',
    'detail.addToCart': 'Add to Cart',
    'detail.buyNow': 'Buy Now',
    'detail.oneOfAKindNotice': '*As this is a single-unit pre-owned item, stock is reserved upon checkout completion.',
    'detail.returnPolicy': '14-Day Free Returns & Full Refund Guarantee',
    'detail.returnPolicySub': 'Pre-paid return shipping provided for any defect within 14 days.',
    'detail.backToCatalog': 'Back to Catalog',

    // Cart & Checkout
    'cart.title': 'Shopping Cart',
    'cart.empty': 'Your cart is currently empty.',
    'cart.emptySub': 'Explore our one-of-a-kind certified pre-owned items.',
    'cart.browseButton': 'Start Shopping',
    'cart.subtotal': 'Subtotal',
    'cart.tax': 'Consumption Tax (10%)',
    'cart.shipping': 'Shipping',
    'cart.shippingFree': 'Free (Nationwide)',
    'cart.total': 'Total Amount',
    'cart.proceedCheckout': 'Proceed to Checkout',
    'cart.remove': 'Remove',
    'cart.oneStockWarning': '*Stock is only secured upon completion of payment.',

    'checkout.title': 'Checkout & Payment',
    'checkout.shippingInfo': 'Shipping Details',
    'checkout.name': 'Full Name',
    'checkout.email': 'Email Address',
    'checkout.phone': 'Phone Number',
    'checkout.postalCode': 'Postal Code',
    'checkout.address': 'Shipping Address',
    'checkout.deliverySlot': 'Preferred Delivery Time',
    'checkout.slotAny': 'No preference (Fastest delivery)',
    'checkout.slotMorning': 'Morning (8:00 - 12:00)',
    'checkout.slot1416': '14:00 - 16:00',
    'checkout.slot1618': '16:00 - 18:00',
    'checkout.slot1820': '18:00 - 20:00',
    'checkout.slot1921': '19:00 - 21:00',
    'checkout.paymentMethod': 'Payment Method',
    'checkout.orderSummary': 'Order Summary',
    'checkout.confirmOrder': 'Place Order',
    'checkout.completeTitle': 'Thank You for Your Order!',
    'checkout.completeDesc': 'Your order number has been issued and shipping preparation has begun.',
    'checkout.orderId': 'Order ID',
    'checkout.tracking': 'Yamato Tracking #',
    'checkout.viewMyPage': 'View Order in My Account',
    'checkout.continueShopping': 'Continue Shopping',

    // My Page
    'mypage.title': 'My Account',
    'mypage.tabOrders': 'Order History & Tracking',
    'mypage.tabFavorites': 'Saved Favorites',
    'mypage.tabProfile': 'Account & Address',
    'mypage.noOrders': 'No previous orders found.',
    'mypage.noFavorites': 'No saved items in favorites yet.',
    'mypage.trackPackage': 'Track Package (Yamato)',
    'mypage.orderDate': 'Order Date',
    'mypage.carrier': 'Carrier',

    // Staff & Admin
    'staff.navAcquisition': '1. Acquisition & Trade-In',
    'staff.navInspection': '2. Technical Inspection & Grading',
    'staff.navListing': '3. AI Listing & Inventory Catalog',
    'staff.newAcquisition': 'New Acquisition Entry',
    'staff.startInspection': 'Start Inspection',
    'staff.generateAiCopy': 'Generate AI Product Copy with Gemini',

    'admin.navDashboard': 'Executive Dashboard',
    'admin.navInventory': 'Single-Item Stock & Gross Margin Ledger',
    'admin.navOrders': 'Orders & Fulfillment',
    'admin.navAiInsights': 'AI Strategic Advisor',

    // Footer
    'footer.inspectionTitle': '20-Point Expert Inspection',
    'footer.inspectionDesc': 'Every unit undergoes thorough diagnostics of power, sensor, ports, and battery health by certified technicians. Inspector name and date disclosed.',
    'footer.warrantyTitle': 'Warranty & Free Returns',
    'footer.warrantyDesc': '14-day hassle-free returns for initial defects. Up to 6 months of hardware warranty included based on condition grade.',
    'footer.shippingTitle': 'Same-Day Dispatch from Reuse Hub',
    'footer.shippingDesc': 'Stored in climate-controlled, sanitized domestic warehouses. Orders placed before 14:00 ship the same day via Yamato Transport.',
    'footer.companySummary': '"Give used products a second value." A circular reuse platform that purchases pre-owned items at fair prices, thoroughly inspects and revitalizes them, and delivers them to new owners.',
    'footer.license': 'Antique Dealer License: Tokyo Public Safety Commission No. 301000000000',
    'footer.companyName': 'Re:Market Co., Ltd. Reuse E-Commerce Division',
    'footer.terms': 'Terms of Service',
    'footer.privacy': 'Privacy Policy',
    'footer.law': 'Commercial Act Notice',
    'footer.copyright': '© 2026 Re:Market Co., Ltd. All rights reserved. "Give used products a second value."',
  },
};

const CATEGORY_MAP: Record<string, { ja: string; en: string }> = {
  'カメラ': { ja: 'カメラ', en: 'Cameras & Lenses' },
  'パソコン': { ja: 'パソコン', en: 'Computers & Laptops' },
  'スマートフォン': { ja: 'スマートフォン', en: 'Smartphones & Tablets' },
  'ゲーム': { ja: 'ゲーム', en: 'Gaming & Consoles' },
  'オーディオ': { ja: 'オーディオ', en: 'Audio & Headphones' },
  '腕時計': { ja: '腕時計', en: 'Watches & Wearables' },
  '家電': { ja: '家電', en: 'Home Appliances' },
  '工具': { ja: '工具', en: 'Power Tools' },
  'アウトドア': { ja: 'アウトドア', en: 'Outdoor & Camping' },
  'カー用品': { ja: 'カー用品', en: 'Auto Accessories' },
};

const CONDITION_MAP: Record<ConditionRank, { ja: { label: string; sub: string; desc: string }; en: { label: string; sub: string; desc: string } }> = {
  S: {
    ja: {
      label: '新品同様',
      sub: 'Like New',
      desc: '使用感がほとんどなく、極めて綺麗な状態。傷や汚れは見当たりません。',
    },
    en: {
      label: 'Like New',
      sub: 'Mint Condition',
      desc: 'Virtually no signs of use, pristine condition without noticeable scratches or blemishes.',
    },
  },
  A: {
    ja: {
      label: '非常に良い',
      sub: 'Very Good',
      desc: 'わずかなスレ程度で、目立つ傷や汚れがなく非常に良好な状態です。',
    },
    en: {
      label: 'Very Good',
      sub: 'Minor Wear',
      desc: 'Very good condition with only minimal cosmetic wear, clean and fully functional.',
    },
  },
  B: {
    ja: {
      label: '良好',
      sub: 'Good',
      desc: '一般的な中古品。使用に伴う小傷やスレがありますが、動作は問題ありません。',
    },
    en: {
      label: 'Good',
      sub: 'Normal Use',
      desc: 'Standard pre-owned condition with slight scratches from regular use. 100% functional.',
    },
  },
  C: {
    ja: {
      label: '使用感あり',
      sub: 'Acceptable',
      desc: '全体的にキズや塗装剥げなど使用感が目立ちますが、通常使用に耐える状態です。',
    },
    en: {
      label: 'Acceptable',
      sub: 'Heavily Used',
      desc: 'Noticeable signs of wear, scratches, or paint wear, but fully tested and operable.',
    },
  },
  D: {
    ja: {
      label: '傷・不具合あり',
      sub: 'Fair / Minor Defect',
      desc: '大きなキズや一部機能に制限・不具合がある、または付属品多数欠品の訳あり品です。',
    },
    en: {
      label: 'Fair / As-Is',
      sub: 'Defect / Bargain',
      desc: 'Significant wear, missing accessories, or minor functional limitation as disclosed.',
    },
  },
};

const ORDER_STATUS_MAP: Record<string, { ja: string; en: string }> = {
  '注文受付': { ja: '注文受付', en: 'Order Received' },
  '支払確認': { ja: '支払確認', en: 'Payment Confirmed' },
  '発送準備中': { ja: '発送準備中', en: 'Preparing Shipment' },
  '発送済み': { ja: '発送済み', en: 'Shipped' },
  '配達完了': { ja: '配達完了', en: 'Delivered' },
  'キャンセル': { ja: 'キャンセル', en: 'Cancelled' },
};

const PAYMENT_MAP: Record<string, { ja: string; en: string }> = {
  'クレジットカード': { ja: 'クレジットカード', en: 'Credit Card (Visa/Master/JCB)' },
  'コンビニ決済': { ja: 'コンビニ決済', en: 'Convenience Store (Lawson/7-Eleven)' },
  '銀行振込': { ja: '銀行振込', en: 'Bank Transfer' },
  'PayPay': { ja: 'PayPay', en: 'PayPay' },
  'あと払い': { ja: 'あと払い (Paidy)', en: 'Buy Now Pay Later (Paidy)' },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('remarket_lang');
      if (saved === 'ja' || saved === 'en') return saved;
      return 'ja'; // Default to Japanese
    } catch {
      return 'ja';
    }
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('remarket_lang', lang);
    } catch {
      // ignore
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'ja' ? 'en' : 'ja');
  };

  const t = (key: string, defaultText?: string): string => {
    const langDict = translations[language] as Record<string, string>;
    if (langDict && langDict[key]) {
      return langDict[key];
    }
    const jaDict = translations.ja as Record<string, string>;
    if (jaDict && jaDict[key]) {
      return jaDict[key];
    }
    return defaultText || key;
  };

  const getCategoryName = (cat: ProductCategory | string): string => {
    if (CATEGORY_MAP[cat]) {
      return CATEGORY_MAP[cat][language];
    }
    return cat;
  };

  const getRankLabel = (rank: ConditionRank) => {
    if (CONDITION_MAP[rank]) {
      return CONDITION_MAP[rank][language];
    }
    return { label: `RANK ${rank}`, sub: '', desc: '' };
  };

  const getOrderStatusLabel = (status: string): string => {
    if (ORDER_STATUS_MAP[status]) {
      return ORDER_STATUS_MAP[status][language];
    }
    return status;
  };

  const getPaymentMethodLabel = (method: string): string => {
    if (PAYMENT_MAP[method]) {
      return PAYMENT_MAP[method][language];
    }
    return method;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        t,
        getCategoryName,
        getRankLabel,
        getOrderStatusLabel,
        getPaymentMethodLabel,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
