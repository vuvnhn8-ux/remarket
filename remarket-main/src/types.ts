/**
 * Re:Market - Japanese Used-Goods E-commerce Platform Types
 * "Consumer → Used-goods Company → Consumer"
 */

export type ConditionRank = 'S' | 'A' | 'B' | 'C' | 'D';

export interface ConditionInfo {
  rank: ConditionRank;
  label: string;
  subLabel: string;
  description: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
}

export const CONDITION_DETAILS: Record<ConditionRank, ConditionInfo> = {
  S: {
    rank: 'S',
    label: '新品同様',
    subLabel: 'Like New',
    description: '使用感がほとんどなく、極めて綺麗な状態。傷や汚れは見当たりません。',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-700',
    badgeBorder: 'border-emerald-200',
  },
  A: {
    rank: 'A',
    label: '非常に良い',
    subLabel: 'Very Good',
    description: 'わずかなスレ程度で、目立つ傷や汚れがなく非常に良好な状態です。',
    badgeBg: 'bg-blue-50',
    badgeText: 'text-blue-700',
    badgeBorder: 'border-blue-200',
  },
  B: {
    rank: 'B',
    label: '良好',
    subLabel: 'Good',
    description: '一般的な中古品。使用に伴う小傷やスレがありますが、動作は問題ありません。',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-700',
    badgeBorder: 'border-amber-200',
  },
  C: {
    rank: 'C',
    label: '使用感あり',
    subLabel: 'Acceptable',
    description: '全体的にキズや塗装剥げなど使用感が目立ちますが、通常使用に耐える状態です。',
    badgeBg: 'bg-orange-50',
    badgeText: 'text-orange-700',
    badgeBorder: 'border-orange-200',
  },
  D: {
    rank: 'D',
    label: '傷・不具合あり',
    subLabel: 'Fair / Minor Defect',
    description: '大きなキズや一部機能に制限・不具合がある、または付属品多数欠品の訳あり品です。',
    badgeBg: 'bg-rose-50',
    badgeText: 'text-rose-700',
    badgeBorder: 'border-rose-200',
  },
};

export type ProductCategory =
  | 'カメラ'
  | 'パソコン'
  | 'スマートフォン'
  | 'ゲーム'
  | 'オーディオ'
  | '腕時計'
  | '家電'
  | '工具'
  | 'アウトドア'
  | 'カー用品';

export type AcquisitionStatus =
  | '買取受付'
  | '商品到着'
  | '検品中'
  | '査定完了'
  | '在庫登録'
  | '出品準備'
  | '販売中'
  | '売却済み'
  | 'キャンセル'
  | '廃棄';

export type InventoryStatus =
  | '入荷'
  | '検品中'
  | '在庫'
  | '出品中'
  | '取り置き'
  | '売却済み'
  | '返品'
  | '廃棄';

export type OrderStatus =
  | '注文受付'
  | '支払確認'
  | '発送準備中'
  | '発送済み'
  | '配達完了'
  | 'キャンセル';

export type InspectionResult = 'Pass' | 'Conditional Pass' | 'Fail';

export interface InspectionExterior {
  scratches: 'なし' | '微小' | '小' | '中' | '大';
  scratchesNotes?: string;
  dirt: 'なし' | '微小' | 'あり';
  dents: 'なし' | '小' | 'あり';
  discoloration: 'なし' | '軽度' | 'あり';
  damage: 'なし' | '一部あり' | '破損あり';
}

export interface InspectionFunction {
  power: '良好' | '不安定' | '不動';
  display: 'ドット抜けなし・発色良好' | '微細なスレあり' | '黄ばみ・ムラあり' | '表示不良' | '対象外';
  buttons: '全ボタン正常動作' | '一部反応鈍い' | '不動' | '対象外';
  battery: '劣化なし(85%以上)' | '通常劣化(70-84%)' | '要交換(70%未満)' | '対象外';
  connectivity: 'Wi-Fi/Bluetooth/端子正常' | '一部端子不調' | '通信不可' | '対象外';
  mainFunctions: '全機能正常確認済' | '一部機能制限あり' | '主要機能不良';
}

export interface InspectionRecord {
  id: string;
  acquisitionId: string;
  inspectorName: string;
  inspectedAt: string; // ISO or YYYY-MM-DD
  exterior: InspectionExterior;
  functions: InspectionFunction;
  includedAccessories: string[];
  missingAccessories: string[];
  defects: string[];
  cosmeticDescription: string;
  functionalDescription: string;
  result: InspectionResult;
  assignedRank: ConditionRank;
  staffComments: string;
}

export interface AcquisitionRecord {
  id: string; // e.g. ACQ-2026-0812
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  customerAddress?: string;
  acquiredAt: string;
  category: ProductCategory;
  brand: string;
  model: string;
  serialNumber: string;
  purchasePrice: number; // 買取価格 (JPY)
  estimatedMarketPrice?: number;
  initialCondition: ConditionRank;
  initialAccessoriesNote?: string;
  notes?: string;
  status: AcquisitionStatus;
  images: string[];
  inspectionId?: string;
  inventoryId?: string;
  productId?: string;
}

export interface InventoryHistoryEntry {
  date: string;
  time?: string;
  status: InventoryStatus | string;
  note: string;
  actor: string;
}

export interface InventoryItem {
  id: string; // e.g. INV-2026-0042
  acquisitionId: string;
  productId: string;
  inspectionId?: string;
  productName?: string;
  brand?: string;
  category?: ProductCategory;
  serialNumber: string;
  acquisitionCost: number; // 買取原価
  currentSellingPrice: number; // 販売価格
  sellingPrice?: number;
  grossProfit: number; // 粗利
  grossMarginPercent: number; // 粗利率 %
  warehouseLocation: string; // e.g. 東京リユース第1センター A-12-03
  status: InventoryStatus;
  conditionRank: ConditionRank;
  acquiredAt: string;
  listedAt?: string;
  soldAt?: string;
  history: InventoryHistoryEntry[];
}

export type PaymentMethod = 'クレジットカード' | 'コンビニ決済' | '銀行振込' | 'PayPay' | 'あと払い';

export interface ProductItem {
  id: string; // e.g. PROD-2026-0089
  inventoryId: string;
  acquisitionId: string;
  name: string; // 日本語商品名
  brand: string;
  model: string;
  category: ProductCategory;
  serialNumber: string;
  price: number; // 税込価格 (JPY)
  originalRetailPrice?: number; // 参考定価
  conditionRank: ConditionRank;
  stock: number; // 1 = 在庫あり, 0 = 売却済み
  isSold: boolean;
  images: string[];
  featuredImage: string;
  
  // Transparency & Inspection Details
  cosmeticSummary: string; // 外観詳細
  functionalSummary: string; // 動作詳細
  includedAccessories: string[]; // 付属品
  missingAccessories: string[]; // 欠品
  defects: string[]; // 特記事項・小キズ
  inspectionDate: string; // 検品日
  inspectorName: string; // 検品担当者
  
  // Commercial Attributes
  description: string;
  keywords: string[];
  warrantyMonths: number; // 保証期間（例: 3ヶ月）
  shippingTime: string; // 発送目安（例: 24時間以内発送）
  location: string;
  viewCount: number;
  createdAt: string;
  tags?: string[];
}

export interface OrderItem {
  productId: string;
  productName: string;
  brand: string;
  price: number;
  conditionRank: ConditionRank;
  image: string;
  serialNumber: string;
}

export interface OrderRecord {
  id: string; // e.g. ORD-20260824-0012
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingPostalCode: string;
  shippingAddress: string;
  deliverySlot?: string;
  paymentMethod: 'クレジットカード' | 'コンビニ決済' | '銀行振込' | 'PayPay' | 'あと払い';
  paymentStatus: '支払済' | '未払い' | '返金済';
  orderStatus: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shippingFee: number;
  totalAmount: number;
  orderedAt: string;
  shippedAt?: string;
  deliveredAt?: string;
  trackingNumber?: string;
  carrier?: string; // ヤマト運輸, 佐川急便, 日本郵便
  // Mục 14.3: đánh dấu record simulation để dọn dẹp khi go-live.
  isSimulation?: boolean; // true = tạo trong APP_MODE=simulation, bị purge khi go-live
}

export interface AIRequestLog {
  id: string;
  feature: 'listing' | 'shopping' | 'sales_insights';
  model: string;
  input: Record<string, unknown> | string;
  output: Record<string, unknown> | string | null;
  timestamp: string; // ISO
  mode: 'simulation' | 'live';
}

export interface CustomerUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  postalCode: string;
  address: string;
  favorites: string[]; // Product IDs
}

export interface StaffUser {
  id: string;
  name: string;
  role: 'inspector' | 'listing_specialist' | 'store_manager' | 'admin';
  department: string;
}

export type UserRole = 'customer' | 'staff' | 'admin';

export interface UserAccount {
  id: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  name: string;
  department?: string; // cho staff/admin
  customerId?: string; // cho customer
}

export interface PublicUser {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  department?: string;
  customerId?: string;
}

export interface AuthSession {
  token: string;
  user: PublicUser;
  createdAt: string;
}

export interface BusinessKPIs {
  // Sales
  salesToday: number;
  salesThisWeek: number;
  salesThisMonth: number;
  revenueThisMonth: number;
  grossProfitThisMonth: number;
  averageGrossMargin: number;
  averageOrderValue: number;
  totalOrdersCount: number;
  
  // Acquisition
  acquiredCountThisMonth: number;
  acquisitionCostThisMonth: number;
  inspectionPassRate: number;
  
  // Inventory
  totalInventoryCount: number;
  totalInventoryValue: number;
  listedCount: number;
  soldCount: number;
  unsoldWaitingListing: number;
  averageDaysToSell: number;
  
  // Funnel
  funnel: {
    acquired: number;
    inspected: number;
    listed: number;
    sold: number;
  };
  
  // Category Breakdown
  categoryStats: {
    category: ProductCategory;
    inventoryCount: number;
    soldCount: number;
    revenue: number;
    avgMargin: number;
  }[];
}
