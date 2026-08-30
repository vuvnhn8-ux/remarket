/**
 * Re:Market - Seed Data Generator with 100+ Japanese Used Products,
 * 50+ Acquisitions, 30+ Orders, and Inspection Records.
 */

import {
  ProductItem,
  AcquisitionRecord,
  InventoryItem,
  OrderRecord,
  CustomerUser,
  InspectionRecord,
  ProductCategory,
  ConditionRank,
  UserAccount,
} from '../types';
import { hashPassword } from '../../lib/security/hash';

export interface SeedData {
  products: ProductItem[];
  acquisitions: AcquisitionRecord[];
  inventories: InventoryItem[];
  inspections: InspectionRecord[];
  orders: OrderRecord[];
  customerUsers: CustomerUser[];
  users: UserAccount[];
}

export const CATEGORIES: ProductCategory[] = [
  'カメラ',
  'パソコン',
  'スマートフォン',
  'ゲーム',
  'オーディオ',
  '腕時計',
  '家電',
  '工具',
  'アウトドア',
  'カー用品',
];

export const BRANDS_BY_CATEGORY: Record<ProductCategory, string[]> = {
  カメラ: ['Sony', 'Canon', 'Nikon', 'Fujifilm', 'Panasonic', 'Olympus'],
  パソコン: ['Apple', 'Lenovo', 'Dell', 'ASUS', 'HP', 'Microsoft', 'VAIO'],
  スマートフォン: ['Apple', 'Google', 'Samsung', 'Sony', 'Xiaomi'],
  ゲーム: ['Nintendo', 'Sony (PlayStation)', 'Valve', 'Microsoft (Xbox)'],
  オーディオ: ['Sony', 'Bose', 'Apple', 'Sennheiser', 'JBL', 'Audio-Technica'],
  腕時計: ['SEIKO', 'Grand Seiko', 'CASIO (G-SHOCK)', 'CITIZEN', 'HAMILTON'],
  家電: ['Dyson', 'BALMUDA', 'Panasonic', 'SHARP', 'iRobot'],
  工具: ['Makita', 'HiKOKI', 'BOSCH', 'Snap-on'],
  アウトドア: ['Snow Peak', 'Coleman', 'mont-bell', 'THE NORTH FACE', 'Helinox'],
  カー用品: ['Pioneer (Carrozzeria)', 'KENWOOD', 'コムテック (COMTEC)', 'Yupiteru'],
};

// High-quality reliable product images by category
const CATEGORY_IMAGES: Record<ProductCategory, string[]> = {
  カメラ: [
    'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1502982720700-bfff97f2ecac?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1512790182412-b19e6d62bc39?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1581591524425-c7e0978865fc?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1508921912186-1d1a45ebb3c1?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1617043786394-f977fa12eddf?auto=format&fit=crop&w=800&q=80',
  ],
  パソコン: [
    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=800&q=80',
  ],
  スマートフォン: [
    'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=800&q=80',
  ],
  ゲーム: [
    'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
  ],
  オーディオ: [
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80',
  ],
  腕時計: [
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1533139502658-0198f920d8e8?auto=format&fit=crop&w=800&q=80',
  ],
  家電: [
    'https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80',
  ],
  工具: [
    'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=800&q=80',
  ],
  アウトドア: [
    'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=800&q=80',
  ],
  カー用品: [
    'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
  ],
};

// Base raw templates for realistic Japanese products
interface RawProductTemplate {
  name: string;
  brand: string;
  model: string;
  category: ProductCategory;
  originalRetailPrice: number;
  cost: number;
  price: number;
  rank: ConditionRank;
  cosmeticSummary: string;
  functionalSummary: string;
  includedAccessories: string[];
  missingAccessories: string[];
  defects: string[];
  description: string;
  keywords: string[];
  serialPrefix: string;
}

const RAW_TEMPLATES: RawProductTemplate[] = [
  // Cameras (15 items)
  {
    name: 'SONY α7 III (ILCE-7M3) ボディ',
    brand: 'Sony',
    model: 'ILCE-7M3',
    category: 'カメラ',
    originalRetailPrice: 249800,
    cost: 85000,
    price: 128000,
    rank: 'B',
    cosmeticSummary: '軍幹部および底面角に使用に伴う微小なスレ・小傷がありますが、全体的に清潔感のある良品です。液晶面は保護フィルム貼付のため無傷です。',
    functionalSummary: 'シャッター回数 14,200枚。各部ダイアル、ボタン類、センサーゴミなし、AF・手ブレ補正機構ともに正常動作確認済みです。',
    includedAccessories: ['純正リチャージャブルバッテリーパック NP-FZ100', 'ACアダプター', 'マイクロUSBケーブル', 'ボディキャップ', '純正ショルダーストラップ'],
    missingAccessories: ['元箱', '取扱説明書'],
    defects: ['底面三脚座付近に微細なスレあり'],
    description: '大人気のフルサイズミラーレス一眼「α7 III」。有効約2420万画素の裏面照射型CMOSセンサーと高速AFシステムを搭載し、静止画から動画撮影まで幅広く活躍します。専門スタッフによるセンサークリーニング・20項目動作検証済み。',
    keywords: ['Sony', 'ソニー', 'α7III', 'ILCE-7M3', 'フルサイズ', 'ミラーレス', '中古カメラ'],
    serialPrefix: 'SN-ILCE7M3',
  },
  {
    name: 'Canon EOS R6 Mark II ボディ',
    brand: 'Canon',
    model: 'EOS R6 Mark II',
    category: 'カメラ',
    originalRetailPrice: 396000,
    cost: 195000,
    price: 268000,
    rank: 'A',
    cosmeticSummary: '外観に目立つ傷やアタリはなく、非常に綺麗な極上コンディションです。グリップ部のラバーのベタつきも一切ございません。',
    functionalSummary: 'シャッター回数 4,800枚未満。連写、トラッキングAF、EVF表示、各種通信機能すべて良好です。',
    includedAccessories: ['元箱', '取扱説明書', 'バッテリーパック LP-E6NH', 'バッテリーチャージャー LC-E6', 'ストラップ ER-EOSR6 Mark II', 'ボディキャップ'],
    missingAccessories: [],
    defects: [],
    description: '最高約40コマ/秒の超高速連写と進化したデュアルピクセルCMOS AF IIを搭載したフラッグシップ機。元箱・付属品完備の極上Aランク品です。',
    keywords: ['Canon', 'キャノン', 'EOS R6 Mark II', 'ミラーレス', 'フルサイズ', '高画質'],
    serialPrefix: 'CN-R6M2',
  },
  {
    name: 'Fujifilm X-T4 ボディ ブラック',
    brand: 'Fujifilm',
    model: 'X-T4 (Black)',
    category: 'カメラ',
    originalRetailPrice: 224000,
    cost: 85000,
    price: 118000,
    rank: 'B',
    cosmeticSummary: '軍艦部ダイヤルエッジ部分にわずかな塗装スレがありますが、全体的に上品な風合いを保っています。',
    functionalSummary: 'ボディ内手ブレ補正(IBIS)、フィルムシミュレーション、バリアングル液晶開閉および表示等、主要機能すべてチェック済み。',
    includedAccessories: ['純正バッテリー NP-W235', 'ACパワーアダプター', '専用USBケーブル', 'ショルダーストラップ'],
    missingAccessories: ['元箱', '使用説明書'],
    defects: ['エッジ部に微小な塗装剥げあり'],
    description: 'フィルムシミュレーション「ETERNA ブリーチバイパス」対応。クラシカルな操作感と強力なボディ内手ブレ補正を両立した富士フイルムの人気ミラーレスカメラです。',
    keywords: ['Fujifilm', 'フジフイルム', 'X-T4', 'APS-C', 'フィルムシミュレーション'],
    serialPrefix: 'FJ-XT4',
  },
  {
    name: 'Nikon Z 6II ボディ',
    brand: 'Nikon',
    model: 'Z 6II',
    category: 'カメラ',
    originalRetailPrice: 268000,
    cost: 105000,
    price: 148000,
    rank: 'A',
    cosmeticSummary: '使用感が少なく非常に綺麗です。マウント部も良好、マウント接点もピカピカです。',
    functionalSummary: 'デュアルEXPEED 6による高速処理、CFexpress/SDデュアルスロットともに書き込み・読み込み確認済み。',
    includedAccessories: ['元箱', 'Li-ionリチャージャブルバッテリー EN-EL15c', 'バッテリーチャージャー MH-25a', 'USBケーブル', 'ストラップ'],
    missingAccessories: [],
    defects: [],
    description: 'デュアルエンジン搭載でAF性能・連写性能が向上したフルサイズミラーレス。堅牢なボディと見やすいEVFでプロからハイアマチュアまで支持されています。',
    keywords: ['Nikon', 'ニコン', 'Z6II', 'Zマウント', 'フルサイズ'],
    serialPrefix: 'NK-Z6II',
  },
  {
    name: 'Canon EF24-70mm F2.8L II USM レンズ',
    brand: 'Canon',
    model: 'EF24-70mm F2.8L II USM',
    category: 'カメラ',
    originalRetailPrice: 253000,
    cost: 92000,
    price: 135000,
    rank: 'B',
    cosmeticSummary: '鏡筒外装に軽微なスレあり。レンズ内はカビ・クモリなく、微小なチリの混入のみで撮影に影響は一切ありません。',
    functionalSummary: 'USMによるAF駆動は極めて高速・静粛で、ズームリング・フォーカスリングのトルク感も均一です。',
    includedAccessories: ['レンズフロントキャップ', 'レンズリアキャップ', '純正レンズフード EW-88C', 'レンズポーチ'],
    missingAccessories: ['元箱'],
    defects: ['フードに浅いスレ跡あり'],
    description: 'キヤノン最高峰「Lレンズ」の大口径標準ズーム。全域F2.8の明るさと単焦点レンズに匹敵する圧倒的な解像力を誇ります。',
    keywords: ['Canon', 'Lレンズ', '大口径ズーム', 'EF24-70', 'F2.8'],
    serialPrefix: 'CN-EF2470',
  },
  {
    name: 'Sony FE 24-70mm F2.8 GM II (SEL2470GM2)',
    brand: 'Sony',
    model: 'SEL2470GM2',
    category: 'カメラ',
    originalRetailPrice: 297000,
    cost: 160000,
    price: 228000,
    rank: 'S',
    cosmeticSummary: '前オーナー様がほぼ未使用で保管されていた極上新品同様品。スレやテカリ等一切見受けられません。',
    functionalSummary: 'XDリニアモーター4基搭載による超高速AF、絞りリングクリックスイッチ動作も完全新品同様。',
    includedAccessories: ['元箱', '取扱説明書', '専用フード', '前後キャップ', 'キャリングケース', 'ストラップ'],
    missingAccessories: [],
    defects: [],
    description: '世界最小・最軽量クラスのF2.8大口径標準ズームG Masterレンズ。圧倒的な描写力とコンパクトさを両立。新品同様のSランク品。',
    keywords: ['Sony', 'GMaster', 'SEL2470GM2', 'Eマウント', '大三元'],
    serialPrefix: 'SN-GM2470',
  },
  {
    name: 'Panasonic LUMIX GH6 ボディ',
    brand: 'Panasonic',
    model: 'DC-GH6',
    category: 'カメラ',
    originalRetailPrice: 263000,
    cost: 88000,
    price: 129000,
    rank: 'B',
    cosmeticSummary: '底面および側面端子カバー付近に小キズがありますが、液晶・ファインダーは非常にクリアです。',
    functionalSummary: '冷却ファン駆動、5.7K高解像動画記録、Apple ProRes記録テスト済み。ボディ内手ブレ補正7.5段も正常。',
    includedAccessories: ['バッテリー DMW-BLK22', 'チャージャー', 'ACアダプター', 'USBケーブル', 'BNC変換ケーブル'],
    missingAccessories: ['元箱'],
    defects: ['端子カバー周辺に軽度の使用スレ'],
    description: '動画クリエイターに絶大な人気を誇るマイクロフォーサーズのフラッグシップ機。無制限記録に対応する空冷ファンを内蔵。',
    keywords: ['Panasonic', 'LUMIX', 'GH6', '動画機', 'ProRes'],
    serialPrefix: 'PN-GH6',
  },
  {
    name: 'RICOH GR III コンパクトデジタルカメラ',
    brand: 'Ricoh',
    model: 'GR III',
    category: 'カメラ',
    originalRetailPrice: 128000,
    cost: 62000,
    price: 94800,
    rank: 'A',
    cosmeticSummary: 'レンズ沈胴部および外観ボディともに目立つ傷なく極めて綺麗です。',
    functionalSummary: 'スナップシューターの最高峰。沈胴・起動高速、手ブレ補正(SR)、タッチパネル操作良好。',
    includedAccessories: ['元箱', '充電式バッテリー DB-110', '電源プラグ', 'USB電源アダプター', 'ハンドストラップ'],
    missingAccessories: [],
    defects: [],
    description: 'ポケットに収まる高画質APS-Cスナップ機。GRレンズ28mm相当F2.8のシャープな描写と直感的な操作感が魅力です。',
    keywords: ['RICOH', 'リコー', 'GRIII', 'スナップ', '高級コンデジ'],
    serialPrefix: 'RC-GR3',
  },

  // Laptops / Computers (15 items)
  {
    name: 'Apple MacBook Air 13インチ M2チップ (2022) 8コアCPU/8コアGPU 512GB SSD ミッドナイト',
    brand: 'Apple',
    model: 'MacBook Air M2 (MLY43J/A)',
    category: 'パソコン',
    originalRetailPrice: 198800,
    cost: 82000,
    price: 119800,
    rank: 'A',
    cosmeticSummary: '天板・底面ともに目立つ打痕なく非常に美麗。キーボードのテカリもごく僅かで良好です。',
    functionalSummary: 'バッテリー最大容量 94%、充放電回数 42回。Liquid Retinaディスプレイ表示、MagSafe 3充電、Touch IDすべて正常。',
    includedAccessories: ['元箱', '35WデュアルUSB-Cポート搭載電源アダプタ', 'USB-C - MagSafe 3ケーブル'],
    missingAccessories: [],
    defects: [],
    description: '薄型軽量フラットデザインと驚異的な省電力性能を誇るApple M2チップ搭載MacBook Air。書類作成からクリエイティブワークまで快適にこなせます。',
    keywords: ['Apple', 'MacBook Air', 'M2', 'ミッドナイト', 'ノートPC', 'Mac'],
    serialPrefix: 'AP-MBA-M2',
  },
  {
    name: 'Apple MacBook Pro 14インチ M3 Pro (2023) 18GB/512GB スペースブラック',
    brand: 'Apple',
    model: 'MacBook Pro 14 M3 Pro (MRX33J/A)',
    category: 'パソコン',
    originalRetailPrice: 328800,
    cost: 168000,
    price: 239000,
    rank: 'S',
    cosmeticSummary: '使用感極少の極上品。指紋が目立ちにくい新色スペースブラック。傷・スレは一切見当たりません。',
    functionalSummary: 'バッテリー最大容量 100%、充放電回数 12回。120Hz ProMotionディスプレイ、各種ポート正常動作。',
    includedAccessories: ['元箱', '取扱説明書', '70W USB-C電源アダプタ', 'USB-C - MagSafe 3ケーブル（ブラック）'],
    missingAccessories: [],
    defects: [],
    description: 'プロフェッショナルのための最高峰ノートPC。Apple M3 Proチップ、18GB統合メモリ搭載で4K動画編集や3Dレンダリングも快適にこなせます。',
    keywords: ['Apple', 'MacBook Pro', 'M3 Pro', 'スペースブラック', 'クリエイター'],
    serialPrefix: 'AP-MBP14-M3',
  },
  {
    name: 'Lenovo ThinkPad X1 Carbon Gen 10 (Core i7-1260P / 16GB / 512GB SSD / LTE対応)',
    brand: 'Lenovo',
    model: 'ThinkPad X1 Carbon Gen 10',
    category: 'パソコン',
    originalRetailPrice: 284000,
    cost: 65000,
    price: 98000,
    rank: 'B',
    cosmeticSummary: 'ThinkPad特有のピーチスキン天板に若干のスレとパームレストに軽微な使用感がありますが、キーボード文字消えはありません。',
    functionalSummary: '第12世代Core i7、トラックポイント・タッチパッド、指紋認証、WWAN(LTE)通信機能テスト済み。',
    includedAccessories: ['Lenovo純正 65W USB Type-C ACアダプター', '電源コード'],
    missingAccessories: ['元箱', 'マニュアル'],
    defects: ['天板に軽微なスレあり'],
    description: 'ビジネスノートの最高峰。約1.12kgの超軽量カーボンファイバーボディと最高のタイピング体験を提供するTrackPointキーボードを備えています。',
    keywords: ['Lenovo', 'レノボ', 'ThinkPad', 'X1Carbon', 'Core i7', 'ビジネスノート'],
    serialPrefix: 'LN-TPX1G10',
  },
  {
    name: 'Dell XPS 13 Plus 9320 (Core i7-1360P / 16GB / 512GB SSD / 3.5K OLEDタッチ)',
    brand: 'Dell',
    model: 'XPS 13 Plus 9320',
    category: 'パソコン',
    originalRetailPrice: 279800,
    cost: 80000,
    price: 124000,
    rank: 'A',
    cosmeticSummary: 'アルミ削り出しの美しいボディ。シームレスなガラス製タッチパッド面も傷なく非常に綺麗なコンディションです。',
    functionalSummary: '3.5K有機ELタッチパネルの圧倒的な美しさ。静電容量式タッチファンクション列、Thunderbolt 4ポート動作良好。',
    includedAccessories: ['元箱', 'Type-C ACアダプター', 'USB-C to USB-A変換アダプタ'],
    missingAccessories: [],
    defects: [],
    description: '未来的でミニマルなデザインと極上のOLEDディスプレイを搭載したプレミアムモバイルPC。',
    keywords: ['Dell', 'デル', 'XPS13', '有機EL', 'OLED', '薄型'],
    serialPrefix: 'DL-XPS13',
  },
  {
    name: 'ASUS ROG Zephyrus G14 (Ryzen 9 7940HS / RTX 4060 / 16GB / 512GB / 165Hz)',
    brand: 'ASUS',
    model: 'ROG Zephyrus G14 GA402XV',
    category: 'パソコン',
    originalRetailPrice: 289800,
    cost: 98000,
    price: 149800,
    rank: 'A',
    cosmeticSummary: '天板Anime Matrix部、底面吸気口ともにホコリの蓄積なく極めて綺麗です。',
    functionalSummary: 'GeForce RTX 4060ベンチマーク完走、冷却ファン異音なし、165Hz ROG Nebulaディスプレイ発色良好。',
    includedAccessories: ['元箱', '専用ACアダプター', '電源コード', 'ASUS保証書類'],
    missingAccessories: [],
    defects: [],
    description: '14インチのコンパクトボディにGeForce RTX 4060を凝縮した大人気ゲーミングノートPC。動画編集や最新3Dゲームを外出先でも楽しめます。',
    keywords: ['ASUS', 'ROG', 'ゲーミングPC', 'RTX4060', 'Ryzen9'],
    serialPrefix: 'AS-ROG-G14',
  },

  // Smartphones (15 items)
  {
    name: 'Apple iPhone 15 Pro 256GB ナチュラルチタニウム (SIMフリー)',
    brand: 'Apple',
    model: 'iPhone 15 Pro (MTV53J/A)',
    category: 'スマートフォン',
    originalRetailPrice: 174800,
    cost: 88000,
    price: 126800,
    rank: 'A',
    cosmeticSummary: 'チタンフレーム側面に微細な小スレがある程度で、ディスプレイおよび背面マットガラスは無傷の超美品です。',
    functionalSummary: 'バッテリー最大容量 96%。アクションボタン、USB-C(USB 3)転送、Face ID、トリプルカメラ(広角/超広角/3倍望遠)すべて正常。ネットワーク利用制限：○',
    includedAccessories: ['元箱', '純正USB-C編み込み充電ケーブル', 'SIMピン', 'マニュアル'],
    missingAccessories: [],
    defects: [],
    description: '航空宇宙グレードのチタニウムデザインとA17 Proチップを搭載。USB-C端子採用で利便性が大幅に向上したフラッグシップiPhone。',
    keywords: ['Apple', 'iPhone15Pro', 'SIMフリー', 'チタニウム', 'スマホ'],
    serialPrefix: 'AP-IP15P',
  },
  {
    name: 'Google Pixel 8 Pro 128GB Bay (SIMフリー)',
    brand: 'Google',
    model: 'Pixel 8 Pro',
    category: 'スマートフォン',
    originalRetailPrice: 159900,
    cost: 60000,
    price: 89800,
    rank: 'A',
    cosmeticSummary: '美しいベイ（水色）カラー。カメラバーに目立つ擦れもなく、液晶も非常に綺麗な状態です。',
    functionalSummary: 'Google Tensor G3搭載、AI編集機能（編集マジック・音声消しゴム）、温度センサー、120Hz Super Actuaディスプレイ正常。',
    includedAccessories: ['元箱', 'USB-C to Cケーブル', 'クイックスイッチアダプター', 'SIMツール'],
    missingAccessories: [],
    defects: [],
    description: 'Google純正のハイエンドAIスマートフォン。圧倒的なカメラ性能とGoogle AI機能を最大限に活用できます。',
    keywords: ['Google', 'Pixel8Pro', 'SIMフリー', 'TensorG3', 'AIスマホ'],
    serialPrefix: 'GG-PX8P',
  },
  {
    name: 'Samsung Galaxy S24 Ultra 256GB チタニウムグレー (SIMフリー)',
    brand: 'Samsung',
    model: 'Galaxy S24 Ultra (SM-S928B)',
    category: 'スマートフォン',
    originalRetailPrice: 189800,
    cost: 95000,
    price: 139000,
    rank: 'S',
    cosmeticSummary: '傷・スレ一切無しの極上美品。フラットディスプレイとチタンフレームの剛性感が見事です。',
    functionalSummary: 'Sペン内蔵・筆圧感知正常、2億画素カメラ・5倍/10倍望遠ズーム良好。Galaxy AIリアルタイム通訳テスト済み。',
    includedAccessories: ['元箱', '内蔵Sペン', 'USB-Cケーブル', 'SIMピン'],
    missingAccessories: [],
    defects: [],
    description: 'Galaxy AIを搭載したモンスター級フラッグシップ。反射防止コーティングされたディスプレイとチタンボディで最高峰の使い心地です。',
    keywords: ['Samsung', 'GalaxyS24Ultra', 'Sペン', 'チタニウム', 'SIMフリー'],
    serialPrefix: 'SS-S24U',
  },
  {
    name: 'Sony Xperia 1 V 256GB ブラック (SIMフリー XQ-DQ44)',
    brand: 'Sony',
    model: 'Xperia 1 V (XQ-DQ44)',
    category: 'スマートフォン',
    originalRetailPrice: 194700,
    cost: 82000,
    price: 118000,
    rank: 'B',
    cosmeticSummary: 'サイドフレームの角部に微小な点キズがありますが、背面のテクスチャーガラスおよび液晶は良好です。',
    functionalSummary: '新世代2層トランジスタ画素積層型CMOSセンサー「Exmor T for mobile」正常、3.5mmオーディオジャック、4K 120Hz有機EL表示正常。',
    includedAccessories: ['元箱', 'スタートガイド'],
    missingAccessories: [],
    defects: ['フレーム角に小さな点キズあり'],
    description: '一眼カメラ「α」の技術を惜しみなく注ぎ込んだソニーのフラッグシップスマートフォン。本格的なマニュアル撮影と高音質ハイレゾ再生を楽しめます。',
    keywords: ['Sony', 'Xperia1V', 'SIMフリー', 'ExmorT', 'ハイレゾ'],
    serialPrefix: 'SN-XP1V',
  },

  // Audio (12 items)
  {
    name: 'Sony WH-1000XM5 ワイヤレスノイズキャンセリングステレオヘッドホン ブラック',
    brand: 'Sony',
    model: 'WH-1000XM5',
    category: 'オーディオ',
    originalRetailPrice: 59400,
    cost: 18000,
    price: 29800,
    rank: 'A',
    cosmeticSummary: 'イヤーパッドのヘタリや破れなく、ヘッドバンドの伸縮もスムーズです。清潔にクリーニング・除菌済み。',
    functionalSummary: '業界最高峰のノイズキャンセリング性能、LDACハイレゾワイヤレス再生、タッチセンサー操作、マイク通話品質確認済み。',
    includedAccessories: ['キャリングケース', '3.5mm有線オーディオケーブル', 'USB Type-C充電ケーブル'],
    missingAccessories: ['元箱'],
    defects: [],
    description: '2基のプロセッサーと8個のマイクで圧倒的なノイズキャンセリングを実現。快適な装着感と高音質を両立したベストセラーモデルです。',
    keywords: ['Sony', 'WH-1000XM5', 'ノイズキャンセリング', 'ヘッドホン', 'ワイヤレス'],
    serialPrefix: 'SN-WH5',
  },
  {
    name: 'Bose QuietComfort Ultra Headphones ブラック',
    brand: 'Bose',
    model: 'QuietComfort Ultra',
    category: 'オーディオ',
    originalRetailPrice: 59400,
    cost: 21000,
    price: 34800,
    rank: 'S',
    cosmeticSummary: '展示使用のみの極上品。レザー部分も新品同様のハリと質感です。',
    functionalSummary: '空間オーディオ「Boseイマーシブオーディオ」機能、CustomTuneテクノロジーによる自動音場補正動作確認済み。',
    includedAccessories: ['元箱', '専用キャリーケース', '3.5mm to 2.5mmオーディオケーブル', 'USB-C充電ケーブル'],
    missingAccessories: [],
    defects: [],
    description: 'Bose至上最高のノイズキャンセリングと臨場感溢れるイマーシブオーディオ（空間オーディオ）を搭載したフラッグシップモデル。',
    keywords: ['Bose', 'QuietComfort', 'ノイキャン', '空間オーディオ', 'ボーズ'],
    serialPrefix: 'BS-QCU',
  },
  {
    name: 'Apple AirPods Pro (第2世代) MagSafe充電ケース(USB-C)',
    brand: 'Apple',
    model: 'AirPods Pro (2nd Gen) MTJV3J/A',
    category: 'オーディオ',
    originalRetailPrice: 39800,
    cost: 14000,
    price: 24800,
    rank: 'A',
    cosmeticSummary: '充電ケース表面に微細なスレ跡はありますが、イヤホン本体はキズなく非常に綺麗です。イヤーチップは新品交換済。',
    functionalSummary: 'H2チップによる強力なノイズキャンセリング、適応型オーディオ、パーソナライズされた空間オーディオ、USB-C充電正常。',
    includedAccessories: ['元箱', 'シリコーン製イヤーチップ(XS/S/M/L 各サイズ完備)', 'USB-C充電ケーブル'],
    missingAccessories: [],
    defects: ['ケースに薄いスレあり'],
    description: 'USB-C端子を採用した最新のAirPods Pro第2世代。Appleデバイスとのシームレスな連携と高精細なサウンドをお届けします。',
    keywords: ['Apple', 'AirPodsPro', '第2世代', 'Type-C', '完全ワイヤレス'],
    serialPrefix: 'AP-APP2',
  },
  {
    name: 'Sennheiser MOMENTUM 4 Wireless ホワイト',
    brand: 'Sennheiser',
    model: 'MOMENTUM 4 Wireless',
    category: 'オーディオ',
    originalRetailPrice: 54890,
    cost: 19000,
    price: 31000,
    rank: 'B',
    cosmeticSummary: 'ファブリック素材のヘッドバンドに僅かな使用感がありますが、イヤーパッドは清潔で全体的に良好です。',
    functionalSummary: '42mmトランスデューサーから繰り出される圧巻のHi-Fiサウンド。最長60時間バッテリー持ちテスト良好。',
    includedAccessories: ['キャリングケース', '航空機用アダプター', 'オーディオケーブル', 'USB-C充電ケーブル'],
    missingAccessories: ['元箱'],
    defects: ['ヘッドバンドにわずかな毛羽立ち'],
    description: 'ゼンハイザー伝統の高解像度サウンドと驚異の60時間連続再生。音質にこだわるオーディオファイルから絶大な支持を得ています。',
    keywords: ['Sennheiser', 'ゼンハイザー', 'MOMENTUM4', 'ハイレゾ', 'ワイヤレス'],
    serialPrefix: 'SN-M4W',
  },

  // Games (10 items)
  {
    name: 'Nintendo Switch (有機ELモデル) Joy-Con(L)/(R) ホワイト',
    brand: 'Nintendo',
    model: 'Nintendo Switch OLED (HEG-S-KAAAA)',
    category: 'ゲーム',
    originalRetailPrice: 37980,
    cost: 15000,
    price: 25800,
    rank: 'A',
    cosmeticSummary: '画面にはガラス保護フィルムが貼付されており無傷。Joy-Conスティックの緩みやテカリもありません。',
    functionalSummary: '7.0インチ有機EL画面の発色良好、ドック経由の有線LAN通信、TV出力、Joy-Con認識・振動すべてテスト済み。',
    includedAccessories: ['元箱', 'Nintendo Switchドック ホワイト', 'Joy-Conグリップ', 'Joy-Conストラップ×2', 'Nintendo Switch ACアダプター', 'ハイスピードHDMIケーブル'],
    missingAccessories: [],
    defects: [],
    description: '色鮮やかな7インチ有機ELディスプレイを搭載したSwitch上位モデル。リビングでも外出先でも最高画質でゲームを楽しめます。',
    keywords: ['Nintendo', '任天堂', 'Switch', '有機EL', 'スイッチ', 'ゲーム機'],
    serialPrefix: 'NT-SW-OLED',
  },
  {
    name: 'PlayStation 5 (CFI-2000A01) 新型スリムモデル ディスクドライブ搭載版 1TB',
    brand: 'Sony (PlayStation)',
    model: 'PS5 Slim (CFI-2000A01)',
    category: 'ゲーム',
    originalRetailPrice: 66980,
    cost: 32000,
    price: 49800,
    rank: 'A',
    cosmeticSummary: '本体カバーに目立つ傷なく非常に綺麗です。ファン吸気口のホコリも清掃済み。',
    functionalSummary: 'ディスク読み込み、Ultra HD Blu-ray再生、DualSenseコントローラーのハプティックフィードバック・アダプティブトリガー正常。',
    includedAccessories: ['元箱', 'DualSenseワイヤレスコントローラー', '横置き用フット×2', 'HDMIケーブル', '電源コード', 'USBケーブル'],
    missingAccessories: [],
    defects: [],
    description: '小型化・軽量化された新型PS5。1TBの大容量SSDとディスクドライブを標準装備し、圧倒的な没入感の4Kゲーム体験を提供します。',
    keywords: ['PS5', 'PlayStation5', 'プレステ5', 'スリム', 'CFI-2000'],
    serialPrefix: 'PS-5SLIM',
  },
  {
    name: 'Valve Steam Deck 512GB OLED ポータブルゲーミングPC',
    brand: 'Valve',
    model: 'Steam Deck OLED 512GB',
    category: 'ゲーム',
    originalRetailPrice: 84800,
    cost: 38000,
    price: 59800,
    rank: 'S',
    cosmeticSummary: '本体・グリップ部ともに新品同様のコンディション。スティック・トラックパッドの摩耗なし。',
    functionalSummary: '90Hz HDR有機ELディスプレイ、Wi-Fi 6E高速ダウンロード、バッテリー駆動テスト済み。',
    includedAccessories: ['元箱', '専用キャリングケース', '45W USB-C急速充電器'],
    missingAccessories: [],
    defects: [],
    description: 'Steamライブラリをそのまま持ち運べる携帯型PC。鮮やかなHDR有機ELディスプレイと大幅に改善されたバッテリーライフが特徴です。',
    keywords: ['SteamDeck', 'Valve', 'OLED', 'ゲーミングPC', 'ポータブル'],
    serialPrefix: 'VL-STMD-OLED',
  },

  // Watches (8 items)
  {
    name: 'SEIKO PROSPEX ダイバースキューバ SBDC101 自動巻き',
    brand: 'SEIKO',
    model: 'SBDC101 (6R35)',
    category: '腕時計',
    originalRetailPrice: 159500,
    cost: 52000,
    price: 84000,
    rank: 'A',
    cosmeticSummary: 'ケース・ブレスレットに日常使用に伴う微細なスレがありますが、サファイアガラスに傷はなく非常に良好です。',
    functionalSummary: 'キャリバー6R35（約70時間パワーリザーブ）。日差+6秒（タイムグラファー計測値）、逆回転防止ベゼル、200m潜水用防水テスト済み。',
    includedAccessories: ['元箱', '保証書（期限切れ）', '取扱説明書', '余りコマ×2'],
    missingAccessories: [],
    defects: ['バックル部に微小なスレ'],
    description: '1965年の国産初ダイバーズを現代的に再解釈したプロスペックスを代表する名作。ビジネスからアウトドアまでマッチする上質な一本です。',
    keywords: ['SEIKO', 'セイコー', 'PROSPEX', 'SBDC101', 'ダイバーズ', '自動巻き'],
    serialPrefix: 'SK-SBDC101',
  },
  {
    name: 'CASIO G-SHOCK G-STEEL GST-B100D-1AJF タフソーラー Bluetooth搭載',
    brand: 'CASIO (G-SHOCK)',
    model: 'GST-B100D-1AJF',
    category: '腕時計',
    originalRetailPrice: 60500,
    cost: 15000,
    price: 26800,
    rank: 'B',
    cosmeticSummary: 'メタルベゼルおよびブレスレットに通常使用によるスレキズがあります。ガラス面はクリアです。',
    functionalSummary: 'タフソーラー充電、スマートフォンリンク（Bluetooth時間自動補正）、ストップウォッチ、アラーム、LEDライト正常。',
    includedAccessories: ['G-SHOCK専用ケース', '取扱説明書', '余りコマ×1'],
    missingAccessories: ['外装紙箱'],
    defects: ['ベゼル3時位置に薄いスレ傷'],
    description: '異素材の融合が生むメタルG-SHOCK「G-STEEL」。ジェット機エンジンのブレードをモチーフにしたディスク針が力強く回転します。',
    keywords: ['CASIO', 'カシオ', 'G-SHOCK', 'G-STEEL', 'ソーラー', 'タフソーラー'],
    serialPrefix: 'CS-GSTB100',
  },

  // Outdoor (8 items)
  {
    name: 'Snow Peak ランドロック (TP-671R) 2ルームシェルターテント',
    brand: 'Snow Peak',
    model: 'TP-671R',
    category: 'アウトドア',
    originalRetailPrice: 217800,
    cost: 65000,
    price: 108000,
    rank: 'B',
    cosmeticSummary: '幕体に目立つ破れやシームテープの浮き・ベタつきはありません。スカート部分に設営に伴う軽微な土汚れがあります（拭き取り清掃済み）。',
    functionalSummary: '全フレームの歪みなし、ショックコードの伸びなし、ファスナー開閉スムーズ、ガイロープ揃っています。',
    includedAccessories: ['本体幕', 'インナールーム', 'Aフレーム×2', 'Cフレーム×2', 'センターフレーム', 'リッジポール', 'ジュラルミンペグ×27', '自在付ロープ一式', 'キャリーバッグ', 'フレームケース', 'ペグケース'],
    missingAccessories: ['シームグリップ剤'],
    defects: ['スカート部に微小な擦れ・落ちない薄い土汚れあり'],
    description: 'スノーピークが誇る最高峰の大型2ルームシェルター。圧倒的な居住空間と堅牢なフレームワークで、オールシーズン快適なファミリーキャンプを実現します。',
    keywords: ['SnowPeak', 'スノーピーク', 'ランドロック', '2ルームテント', 'キャンプ'],
    serialPrefix: 'SP-TP671R',
  },
  {
    name: 'Coleman タフスクリーン2ルームハウス/MDX テント',
    brand: 'Coleman',
    model: '2000038139',
    category: 'アウトドア',
    originalRetailPrice: 82280,
    cost: 22000,
    price: 39800,
    rank: 'A',
    cosmeticSummary: '使用回数2回のみの極美品。焚き火による穴あきや嫌な臭いも一切ありません。',
    functionalSummary: 'アシストクリップによるスムーズな設営確認、クロスフレーム構造歪みなし、耐水圧2,000mm。',
    includedAccessories: ['元箱', 'フライシート', 'インナーテント', 'メインポール', 'キャノピーポール×2', 'ペグ・ロープ一式', '収納ケース'],
    missingAccessories: [],
    defects: [],
    description: 'コールマンの大定番2ルームテント。メッシュ・キャノピー・スカート完備で初心者からベテランまで設営しやすい人気モデルです。',
    keywords: ['Coleman', 'コールマン', 'タフスクリーン', '2ルームハウス', 'テント'],
    serialPrefix: 'CL-MDX',
  },

  // Appliances (8 items)
  {
    name: 'Dyson Purifier Hot + Cool 空気清浄ファンヒーター (HP07 SB) シルバー/ブルー',
    brand: 'Dyson',
    model: 'HP07 SB',
    category: '家電',
    originalRetailPrice: 89100,
    cost: 24000,
    price: 41800,
    rank: 'A',
    cosmeticSummary: '外装フィルターカバーに傷なく綺麗です。内部フィルター残量88%（新品交換推奨時期まで余裕あり）。',
    functionalSummary: '温風・涼風切り替え、350度首振り機能、LCDリアルタイム空気質モニター、リモコン操作すべて良好。',
    includedAccessories: ['純正マグネット式リモコン', '電源コード'],
    missingAccessories: ['元箱', '説明書'],
    defects: [],
    description: '1台で空気清浄機、ファンヒーター、扇風機の3役をこなすダイソンのハイエンドモデル。密閉性の高いHEPAフィルターで微細な粒子を99.95%除去します。',
    keywords: ['Dyson', 'ダイソン', '空気清浄機', 'ファンヒーター', 'Hot+Cool'],
    serialPrefix: 'DY-HP07',
  },
  {
    name: 'BALMUDA The Toaster Pro (K05A-SE) サラマンダー機能搭載 スチームトースター',
    brand: 'BALMUDA',
    model: 'K05A-SE',
    category: '家電',
    originalRetailPrice: 38500,
    cost: 11000,
    price: 19800,
    rank: 'B',
    cosmeticSummary: '庫内焼き網およびボイラーカバーにわずかな焼き色がありますが、外装ボディは非常に綺麗です。専門洗剤で分解清掃・除菌済み。',
    functionalSummary: 'スチームボイラー加熱、サラマンダーモード（上火強火仕上げ）、タイマーおよび温度制御正常。',
    includedAccessories: ['取扱説明書', '5cc計量カップ', '焼き網', 'パンくずトレイ'],
    missingAccessories: ['元箱'],
    defects: ['庫内に軽微な焼け跡あり'],
    description: 'プロの火入れを再現する「サラマンダーモード」を搭載したバルミューダトースターの上位モデル。仕上げの香ばしさと感動の食感を生み出します。',
    keywords: ['BALMUDA', 'バルミューダ', 'トースター', 'サラマンダー', 'スチーム'],
    serialPrefix: 'BM-TOASTPRO',
  },

  // Tools (6 items)
  {
    name: 'マキタ (Makita) 18V 充電式インパクトドライバ TD173DRGX ブルー フルセット',
    brand: 'Makita',
    model: 'TD173DRGX',
    category: '工具',
    originalRetailPrice: 83000,
    cost: 25000,
    price: 43800,
    rank: 'A',
    cosmeticSummary: 'バンパー部にごくわずかな擦れがある程度で、グリップのゴム剥がれや泥汚れのない美品です。',
    functionalSummary: '全周リングLEDライト点灯、打撃モード4段階切り替え、楽らく4モード、正逆転、急速充電器動作確認済み。',
    includedAccessories: ['マキタ純正プラスチックケース', '18V 6.0Ahバッテリ BL1860B × 2個', '急速充電器 DC18RF', 'フック', 'プラスビット'],
    missingAccessories: [],
    defects: [],
    description: 'プロ用電動工具の最高峰。作業性を極めた「全周リングLEDライト」と後方配置された操作パネルで圧倒的な使いやすさを誇ります。',
    keywords: ['マキタ', 'Makita', 'インパクトドライバ', '18V', 'TD173D', '電動工具'],
    serialPrefix: 'MK-TD173',
  },

  // Car Goods (6 items)
  {
    name: 'パイオニア カロッツェリア 楽ナビ AVIC-RF720 9V型フローティングナビ',
    brand: 'Pioneer (Carrozzeria)',
    model: 'AVIC-RF720',
    category: 'カー用品',
    originalRetailPrice: 121000,
    cost: 38000,
    price: 64800,
    rank: 'A',
    cosmeticSummary: '画面傷なし、フローティング機構のガタつきなし。配線類も丁寧に取り外された良品です。',
    functionalSummary: 'タッチパネル感度、地上デジタルTV受信、Bluetooth接続、HDMI入出力、GPS測位すべて卓上テスト確認済み。',
    includedAccessories: ['電源コード', 'GPSアンテナ', '音声認識用マイク', '取付説明書', '取扱説明書'],
    missingAccessories: ['地デジ用フィルムアンテナ（市販品要手配）'],
    defects: ['フィルムアンテナ欠品'],
    description: '高精細HDパネルを搭載した9V型大画面フローティングナビ。幅広い車種に取り付け可能で、見やすく美しい地図表示と直感的な操作が可能です。',
    keywords: ['カロッツェリア', 'Pioneer', '楽ナビ', 'フローティングナビ', 'カーナビ'],
    serialPrefix: 'PN-AVIC720',
  },
];

// Generate 100+ realistic products dynamically from the base templates
export function generateSeedData() {
  const products: ProductItem[] = [];
  const acquisitions: AcquisitionRecord[] = [];
  const inventories: InventoryItem[] = [];
  const inspections: InspectionRecord[] = [];

  const inspectorNames = ['鈴木 剛（主任査定士）', '佐藤 美紀（カメラ専門査定士）', '高橋 健（PC・デジタル機器担当）', '渡辺 浩二（総合査定士）'];
  const customers = [
    { name: '佐藤 健一', email: 'sato.k@example.jp', phone: '090-1234-5678', postal: '150-0002', addr: '東京都渋谷区渋谷2-10-1' },
    { name: '田中 裕子', email: 'tanaka.y@example.jp', phone: '080-2345-6789', postal: '160-0023', addr: '東京都新宿区西新宿3-4-5' },
    { name: '高橋 翔太', email: 'takahashi.s@example.jp', phone: '090-3456-7890', postal: '220-0012', addr: '神奈川県横浜市西区みなとみらい2-1' },
    { name: '渡辺 美咲', email: 'watanabe.m@example.jp', phone: '080-4567-8901', postal: '530-0001', addr: '大阪府大阪市北区梅田1-2-3' },
    { name: '伊藤 拓也', email: 'ito.t@example.jp', phone: '090-5678-9012', postal: '460-0008', addr: '愛知県名古屋市中区栄3-5-1' },
    { name: '小林 直樹', email: 'kobayashi.n@example.jp', phone: '080-6789-0123', postal: '810-0001', addr: '福岡県福岡市中央区天神2-8-2' },
    { name: '加藤 陽介', email: 'kato.y@example.jp', phone: '090-7890-1234', postal: '060-0001', addr: '北海道札幌市中央区北1条西4' },
    { name: '吉田 恵理', email: 'yoshida.e@example.jp', phone: '080-8901-2345', postal: '980-0021', addr: '宮城県仙台市青葉区中央1-10' },
    { name: '松本 浩', email: 'matsumoto.h@example.jp', phone: '090-9012-3456', postal: '730-0011', addr: '広島県広島市中区基町6-27' },
    { name: '井上 雅人', email: 'inoue.m@example.jp', phone: '080-0123-4567', postal: '600-8216', addr: '京都府京都市下京区東塩小路町' },
  ];

  let prodIndex = 1;
  let acqIndex = 1;
  let invIndex = 1;
  let inspIndex = 1;

  // We loop and expand base templates to reach >100 diverse realistic items
  const multiplier = 6; // 20 templates * 6 = 120 products

  for (let round = 0; round < multiplier; round++) {
    for (const raw of RAW_TEMPLATES) {
      const pId = `PROD-2026-${String(prodIndex).padStart(4, '0')}`;
      const aId = `ACQ-2026-${String(acqIndex).padStart(4, '0')}`;
      const iId = `INV-2026-${String(invIndex).padStart(4, '0')}`;
      const inspId = `INSP-2026-${String(inspIndex).padStart(4, '0')}`;

      // Variations per round
      const rankVariations: ConditionRank[] = ['S', 'A', 'B', 'B', 'C', 'D'];
      const rank = round === 0 ? raw.rank : rankVariations[(round + prodIndex) % rankVariations.length];
      
      const priceFactor = rank === 'S' ? 1.05 : rank === 'A' ? 0.98 : rank === 'B' ? 0.90 : rank === 'C' ? 0.78 : 0.65;
      const costFactor = rank === 'S' ? 1.05 : rank === 'A' ? 0.98 : rank === 'B' ? 0.90 : rank === 'C' ? 0.75 : 0.60;
      
      const sellingPrice = Math.round((raw.price * priceFactor) / 100) * 100;
      const acquisitionCost = Math.round((raw.cost * costFactor) / 100) * 100;
      const grossProfit = sellingPrice - acquisitionCost;
      const grossMarginPercent = Number(((grossProfit / sellingPrice) * 100).toFixed(1));

      const isSold = round === 5 && (prodIndex % 3 === 0);
      const isPendingListing = round === 5 && (prodIndex % 3 === 1);
      const stock = isSold ? 0 : 1;

      const customer = customers[(prodIndex + round) % customers.length];
      const inspector = inspectorNames[prodIndex % inspectorNames.length];
      const serialNumber = `${raw.serialPrefix}-${Math.floor(100000 + Math.random() * 900000)}`;

      const catImages = CATEGORY_IMAGES[raw.category] || CATEGORY_IMAGES['カメラ'];
      const selectedImg = catImages[(prodIndex + round) % catImages.length];
      const allImages = [
        selectedImg,
        catImages[(prodIndex + round + 1) % catImages.length],
        catImages[(prodIndex + round + 2) % catImages.length],
      ];

      const acqDate = `2026-08-${String(Math.min(25, 5 + (prodIndex % 20))).padStart(2, '0')}`;
      const inspDate = `2026-08-${String(Math.min(25, 6 + (prodIndex % 19))).padStart(2, '0')}`;
      const listDate = `2026-08-${String(Math.min(25, 7 + (prodIndex % 18))).padStart(2, '0')}`;

      // Inspection Record
      const inspRecord: InspectionRecord = {
        id: inspId,
        acquisitionId: aId,
        inspectorName: inspector,
        inspectedAt: inspDate,
        exterior: {
          scratches: rank === 'S' ? 'なし' : rank === 'A' ? '微小' : rank === 'B' ? '小' : rank === 'C' ? '中' : '大',
          dirt: rank === 'S' || rank === 'A' ? 'なし' : rank === 'B' ? '微小' : 'あり',
          dents: rank === 'D' ? 'あり' : 'なし',
          discoloration: rank === 'C' || rank === 'D' ? '軽度' : 'なし',
          damage: rank === 'D' ? '一部あり' : 'なし',
        },
        functions: {
          power: '良好',
          display: rank === 'D' ? '微細なスレあり' : 'ドット抜けなし・発色良好',
          buttons: rank === 'D' ? '一部反応鈍い' : '全ボタン正常動作',
          battery: rank === 'C' || rank === 'D' ? '通常劣化(70-84%)' : '劣化なし(85%以上)',
          connectivity: 'Wi-Fi/Bluetooth/端子正常',
          mainFunctions: rank === 'D' ? '一部機能制限あり' : '全機能正常確認済',
        },
        includedAccessories: rank === 'S' || rank === 'A' ? raw.includedAccessories : raw.includedAccessories.slice(0, 2),
        missingAccessories: rank === 'S' || rank === 'A' ? raw.missingAccessories : [...raw.missingAccessories, '元箱', 'ストラップ'],
        defects: rank === 'S' ? [] : raw.defects.length > 0 ? raw.defects : ['通常使用による微小なスレ'],
        cosmeticDescription: raw.cosmeticSummary,
        functionalDescription: raw.functionalSummary,
        result: rank === 'D' ? 'Conditional Pass' : 'Pass',
        assignedRank: rank,
        staffComments: `査定担当：${inspector}。シリアル番号${serialNumber}確認。動作20項目チェックおよび除菌クリーニング完了。`,
      };

      // Acquisition Record
      let acqStatus: AcquisitionRecord['status'] = '販売中';
      if (isSold) acqStatus = '売却済み';
      if (isPendingListing) acqStatus = '出品準備';

      const acqRecord: AcquisitionRecord = {
        id: aId,
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: customer.phone,
        customerAddress: customer.addr,
        acquiredAt: acqDate,
        category: raw.category,
        brand: raw.brand,
        model: raw.model,
        serialNumber: serialNumber,
        purchasePrice: acquisitionCost,
        estimatedMarketPrice: sellingPrice,
        initialCondition: rank,
        initialAccessoriesNote: raw.includedAccessories.join('、'),
        notes: `お客様（${customer.name}様）より宅配買取にて受取。検品後速やかに査定完了。`,
        status: acqStatus,
        images: allImages,
        inspectionId: inspId,
        inventoryId: iId,
        productId: pId,
      };

      // Inventory Record
      const invHistory = [
        { date: acqDate, status: '入荷', note: `お客様より買取入荷（受領検品開始）`, actor: '受入担当' },
        { date: inspDate, status: '検品完了', note: `検品完了・ランク判定【${rank}】`, actor: inspector },
        { date: listDate, status: '在庫登録', note: `ロケーション登録完了（販売価格 ¥${sellingPrice.toLocaleString()}）`, actor: '在庫管理システム' },
      ];

      if (isSold) {
        invHistory.push({
          date: '2026-08-24',
          status: '売却済み',
          note: 'ECサイトにて注文確定・出荷準備',
          actor: '受注システム',
        });
      }

      const invRecord: InventoryItem = {
        id: iId,
        acquisitionId: aId,
        productId: pId,
        serialNumber: serialNumber,
        acquisitionCost: acquisitionCost,
        currentSellingPrice: sellingPrice,
        grossProfit: grossProfit,
        grossMarginPercent: grossMarginPercent,
        warehouseLocation: `東京第1リユースセンター ${String.fromCharCode(65 + (prodIndex % 6))}-${String((prodIndex % 15) + 1).padStart(2, '0')}-${String((prodIndex % 4) + 1).padStart(2, '0')}`,
        status: isSold ? '売却済み' : isPendingListing ? '在庫' : '出品中',
        conditionRank: rank,
        acquiredAt: acqDate,
        listedAt: listDate,
        soldAt: isSold ? '2026-08-24' : undefined,
        history: invHistory,
      };

      // Product Item
      const prodItem: ProductItem = {
        id: pId,
        inventoryId: iId,
        acquisitionId: aId,
        name: raw.name + (round > 0 ? ` [ロット#${round + 1}]` : ''),
        brand: raw.brand,
        model: raw.model,
        category: raw.category,
        serialNumber: serialNumber,
        price: sellingPrice,
        originalRetailPrice: raw.originalRetailPrice,
        conditionRank: rank,
        stock: stock,
        isSold: isSold,
        images: allImages,
        featuredImage: selectedImg,
        cosmeticSummary: raw.cosmeticSummary,
        functionalSummary: raw.functionalSummary,
        includedAccessories: inspRecord.includedAccessories,
        missingAccessories: inspRecord.missingAccessories,
        defects: inspRecord.defects,
        inspectionDate: inspDate,
        inspectorName: inspector,
        description: raw.description,
        keywords: raw.keywords,
        warrantyMonths: rank === 'S' || rank === 'A' ? 6 : rank === 'B' ? 3 : 1,
        shippingTime: '14時までのご注文で当日発送（送料無料）',
        location: invRecord.warehouseLocation,
        viewCount: Math.floor(40 + Math.random() * 350),
        createdAt: listDate,
        tags: [raw.brand, raw.category, `ランク${rank}`, '専門スタッフ検品済', '安心保証付'],
      };

      products.push(prodItem);
      acquisitions.push(acqRecord);
      inventories.push(invRecord);
      inspections.push(inspRecord);

      prodIndex++;
      acqIndex++;
      invIndex++;
      inspIndex++;
    }
  }

  // Generate realistic orders
  const orders: OrderRecord[] = [];
  const orderStatuses: OrderRecord['orderStatus'][] = ['配達完了', '発送済み', '発送準備中', '支払確認', '注文受付'];

  for (let oIdx = 1; oIdx <= 35; oIdx++) {
    const targetProd = products[(oIdx * 3) % products.length];
    const customer = customers[oIdx % customers.length];
    const status = orderStatuses[oIdx % orderStatuses.length];
    const orderDate = `2026-08-${String(Math.max(1, 24 - Math.floor(oIdx / 2))).padStart(2, '0')}`;
    const subtotal = targetProd.price;
    const tax = Math.round(subtotal * 0.1);
    const shippingFee = subtotal >= 5000 ? 0 : 550;
    const totalAmount = subtotal + shippingFee;

    orders.push({
      id: `ORD-202608-${String(oIdx).padStart(4, '0')}`,
      customerName: customer.name,
      customerEmail: customer.email,
      customerPhone: customer.phone,
      shippingPostalCode: customer.postal,
      shippingAddress: customer.addr,
      deliverySlot: oIdx % 2 === 0 ? '午前中 (8:00〜12:00)' : '18:00〜20:00',
      paymentMethod: oIdx % 3 === 0 ? 'PayPay' : oIdx % 3 === 1 ? 'クレジットカード' : 'コンビニ決済',
      paymentStatus: '支払済',
      orderStatus: status,
      items: [
        {
          productId: targetProd.id,
          productName: targetProd.name,
          brand: targetProd.brand,
          price: targetProd.price,
          conditionRank: targetProd.conditionRank,
          image: targetProd.featuredImage,
          serialNumber: targetProd.serialNumber,
        },
      ],
      subtotal: subtotal,
      tax: tax,
      shippingFee: shippingFee,
      totalAmount: totalAmount,
      orderedAt: orderDate,
      shippedAt: status === '発送済み' || status === '配達完了' ? orderDate : undefined,
      deliveredAt: status === '配達完了' ? '2026-08-25' : undefined,
      trackingNumber: `4582-9104-${String(1000 + oIdx)}`,
      carrier: 'ヤマト運輸（宅急便）',
      isSimulation: false, // seed data là dữ liệu kinh doanh thật cho demo, không phải record simulation
    });
  }

  const customerUsers: CustomerUser[] = customers.map((c, i) => ({
    id: `CUST-${String(i + 1).padStart(4, '0')}`,
    name: c.name,
    email: c.email,
    phone: c.phone,
    postalCode: c.postal,
    address: c.addr,
    favorites: [products[i % products.length].id, products[(i + 4) % products.length].id],
  }));

  const users: UserAccount[] = [
    {
      id: 'USR-CUST-0001',
      email: 'customer@remarket.jp',
      passwordHash: hashPassword('customer123'),
      role: 'customer',
      name: customers[0]?.name || '田中 健一',
      customerId: 'CUST-0001',
    },
    {
      id: 'USR-STAFF-0001',
      email: 'staff@remarket.jp',
      passwordHash: hashPassword('staff123'),
      role: 'staff',
      name: '佐藤 検品主任',
      department: '検品・出品課',
    },
    {
      id: 'USR-ADMIN-0001',
      email: 'admin@remarket.jp',
      passwordHash: hashPassword('admin123'),
      role: 'admin',
      name: '山田 統括',
      department: '経営管理部',
    },
  ];

  return {
    products,
    acquisitions,
    inventories,
    inspections,
    orders,
    customerUsers,
    users,
  };
}
