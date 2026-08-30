/**
 * Re:Market - Unified Data & AI API Service
 * Dual Mode Architecture:
 * - Simulation Mode (DEFAULT): In-memory DB + live pipeline event logging + instant zero-network UI
 * - Real Mode: Real full-stack REST API (/api/...) endpoints
 */

import {
  ProductItem,
  AcquisitionRecord,
  InventoryItem,
  InspectionRecord,
  OrderRecord,
  BusinessKPIs,
  ConditionRank,
  OrderStatus,
  PublicUser,
} from '../types';
import { simStore } from '../data/simStore';
import { simulationEngine } from './simulationEngine';
import { isSimulationMode as getIsSimulationMode } from '../../lib/config/app-mode';
import { PaymentService, SimulationPaymentAdapter } from '../../lib/payment/index';
import { verifyPassword, hashPassword } from '../../lib/security/hash';

// Simulation mode: trạng thái login được giữ trong bộ nhớ + localStorage để
// không phụ thuộc server. Live mode: gọi /api/auth/* với cookie httpOnly.
const SIM_USER_KEY = 'rm_sim_user';
const getSimUser = (): PublicUser | null => {
  try {
    const raw = localStorage.getItem(SIM_USER_KEY);
    return raw ? JSON.parse(raw) as PublicUser : null;
  } catch {
    return null;
  }
};
const setSimUser = (u: PublicUser | null) => {
  try {
    if (u) localStorage.setItem(SIM_USER_KEY, JSON.stringify(u));
    else localStorage.removeItem(SIM_USER_KEY);
  } catch {
    // no-op
  }
};

// Email đăng ký nhưng chưa xác thực — server gate (`isEmailPending`) lo phần block
// login; client chỉ cần giữ user đăng nhập trong localStorage (simulation) như trên.

function checkIsSimulation(): boolean {
  // Uỷ quyền cho lib/config/app-mode.ts (nơi duy nhất đọc APP_MODE, AGENTS.md 14.1)
  return getIsSimulationMode();
}

// Simulated slight network latency for realistic feel in Simulation Mode
const simulateDelay = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms));

export const api = {
  // ================= PRODUCTS =================
  async getProducts(params?: {
    category?: string;
    brand?: string;
    conditionRank?: string;
    minPrice?: number;
    maxPrice?: number;
    q?: string;
    inStockOnly?: boolean;
    sort?: string;
    limit?: number;
  }): Promise<{ items: ProductItem[]; total: number }> {
    if (checkIsSimulation()) {
      await simulateDelay(60);
      return simStore.getProducts({
        category: params?.category,
        brand: params?.brand,
        conditionRank: params?.conditionRank,
        minPrice: params?.minPrice,
        maxPrice: params?.maxPrice,
        searchQuery: params?.q,
        inStockOnly: params?.inStockOnly,
        sort: (params?.sort as any) || 'recommended',
        limit: params?.limit,
      });
    }

    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.brand) query.set('brand', params.brand);
    if (params?.conditionRank) query.set('conditionRank', params.conditionRank);
    if (params?.minPrice) query.set('minPrice', String(params.minPrice));
    if (params?.maxPrice) query.set('maxPrice', String(params.maxPrice));
    if (params?.q) query.set('q', params.q);
    if (params?.inStockOnly) query.set('inStockOnly', 'true');
    if (params?.sort) query.set('sort', params.sort);
    if (params?.limit) query.set('limit', String(params.limit));

    const res = await fetch(`/api/products?${query.toString()}`);
    if (!res.ok) throw new Error('商品一覧の取得に失敗しました。');
    return res.json();
  },

  async getProductById(id: string): Promise<ProductItem> {
    if (checkIsSimulation()) {
      await simulateDelay(40);
      const product = simStore.getProductById(id);
      if (!product) throw new Error('指定された商品が見つかりません。');
      return product;
    }

    const res = await fetch(`/api/products/${id}`);
    if (!res.ok) throw new Error('商品の取得に失敗しました。');
    return res.json();
  },

  // ================= ACQUISITIONS =================
  async getAcquisitions(): Promise<AcquisitionRecord[]> {
    if (checkIsSimulation()) {
      await simulateDelay(60);
      return simStore.getAcquisitions();
    }

    const res = await fetch('/api/acquisitions');
    if (!res.ok) throw new Error('買取一覧の取得に失敗しました。');
    return res.json();
  },

  async getAcquisitionById(id: string): Promise<AcquisitionRecord> {
    if (checkIsSimulation()) {
      await simulateDelay(40);
      const acq = simStore.getAcquisitionById(id);
      if (!acq) throw new Error('買取情報が見つかりません。');
      return acq;
    }

    const res = await fetch(`/api/acquisitions/${id}`);
    if (!res.ok) throw new Error('買取詳細の取得に失敗しました。');
    return res.json();
  },

  async createAcquisition(data: any): Promise<AcquisitionRecord> {
    if (checkIsSimulation()) {
      await simulateDelay(150);
      const acq = simStore.createAcquisition(data);
      simulationEngine.addLog({
        category: 'Trade-in',
        level: 'success',
        message: `New Trade-in Registered [${acq.id}]: ${acq.brand} ${acq.model} (¥${acq.purchasePrice.toLocaleString()})`,
        details: `Customer: ${acq.customerName} | Status: 買取受付`,
      });
      return acq;
    }

    const res = await fetch('/api/acquisitions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('買取登録に失敗しました。');
    return res.json();
  },

  async updateAcquisitionStatus(id: string, status: string): Promise<AcquisitionRecord> {
    if (checkIsSimulation()) {
      await simulateDelay(80);
      const acq = simStore.updateAcquisitionStatus(id, status as any);
      simulationEngine.addLog({
        category: 'Trade-in',
        level: 'info',
        message: `Trade-in Status Updated [${id}] -> ${status}`,
      });
      return acq;
    }

    const res = await fetch(`/api/acquisitions/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('ステータス更新に失敗しました。');
    return res.json();
  },

  // ================= INSPECTIONS =================
  async getInspections(): Promise<InspectionRecord[]> {
    if (checkIsSimulation()) {
      await simulateDelay(60);
      return simStore.getInspections();
    }

    const res = await fetch('/api/inspections');
    if (!res.ok) throw new Error('検品一覧の取得に失敗しました。');
    return res.json();
  },

  async createInspection(data: any): Promise<InspectionRecord> {
    if (checkIsSimulation()) {
      await simulateDelay(180);
      const inspection = simStore.createInspection(data);
      simulationEngine.addLog({
        category: 'Inspection',
        level: 'success',
        message: `Inspection Completed [${inspection.id}]: Assigned Rank ${inspection.assignedRank}`,
        details: `Inspector: ${inspection.inspectorName} | Result: ${inspection.result}`,
      });
      return inspection;
    }

    const res = await fetch('/api/inspections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('検品記録の保存に失敗しました。');
    return res.json();
  },

  // ================= INVENTORY =================
  async getInventories(): Promise<InventoryItem[]> {
    if (checkIsSimulation()) {
      await simulateDelay(60);
      return simStore.getInventories();
    }

    const res = await fetch('/api/inventories');
    if (!res.ok) throw new Error('在庫一覧の取得に失敗しました。');
    return res.json();
  },

  async registerInventory(data: {
    acquisitionId: string;
    inspectionId: string;
    sellingPrice: number;
    warehouseLocation: string;
  }): Promise<{ inventory: InventoryItem; product: ProductItem }> {
    if (checkIsSimulation()) {
      await simulateDelay(200);
      const result = simStore.registerInventoryFromInspection(data);
      simulationEngine.addLog({
        category: 'AI Pipeline',
        level: 'success',
        message: `Inventory & Product Published [${result.product.id}]: ¥${result.product.price.toLocaleString()}`,
        details: `Warehouse: ${result.inventory.warehouseLocation} | Rank: ${result.product.conditionRank}`,
      });
      return result;
    }

    const res = await fetch('/api/inventories/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('在庫・出品登録に失敗しました。');
    return res.json();
  },

  async updateInventoryPrice(id: string, sellingPrice: number): Promise<InventoryItem> {
    if (checkIsSimulation()) {
      await simulateDelay(80);
      const inv = simStore.updateInventoryPrice(id, sellingPrice);
      if (!inv) throw new Error('在庫が見つかりません。');
      simulationEngine.addLog({
        category: 'Pricing',
        level: 'info',
        message: `Inventory Price Updated [${id}] -> ¥${sellingPrice.toLocaleString()}`,
        details: `Gross Margin: ${inv.grossMarginPercent}%`,
      });
      return inv;
    }

    const res = await fetch(`/api/inventories/${id}/price`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sellingPrice }),
    });
    if (!res.ok) throw new Error('価格更新に失敗しました。');
    return res.json();
  },

  // ================= ORDERS =================
  async getOrders(): Promise<OrderRecord[]> {
    if (checkIsSimulation()) {
      await simulateDelay(60);
      return simStore.getOrders();
    }

    const res = await fetch('/api/orders');
    if (!res.ok) throw new Error('注文一覧の取得に失敗しました。');
    return res.json();
  },

  async createOrder(data: any): Promise<OrderRecord> {
    if (checkIsSimulation()) {
      await simulateDelay(220);
      // Simulation payment: đi qua PaymentService (AGENTS.md 14.2) — order tạo ở
      // 注文受付 rồi adapter simulation xác nhận -> 支払確認.
      const payment = new PaymentService(simStore, {
        adapter: new SimulationPaymentAdapter(true),
      });
      const { order, result } = await payment.createAndConfirmOrder(data);
      if ('reason' in result) throw new Error(result.reason);
      simulationEngine.addLog({
        category: 'Order',
        level: 'success',
        message: `Order Created [${order.id}]: ¥${order.totalAmount.toLocaleString()} (${order.customerName})`,
        details: `Payment: ${order.paymentMethod} | Status: ${order.orderStatus}`,
      });
      return order;
    }

    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || '注文処理に失敗しました。');
    return result;
  },

  async updateOrderStatus(id: string, orderStatus: OrderStatus, trackingNumber?: string): Promise<OrderRecord> {
    if (checkIsSimulation()) {
      await simulateDelay(80);
      const order = simStore.updateOrderStatus(id, orderStatus, trackingNumber);
      if (!order) throw new Error('注文が見つかりません。');
      simulationEngine.addLog({
        category: 'Order',
        level: 'info',
        message: `Order [${id}] status changed -> ${orderStatus}`,
        details: trackingNumber ? `Tracking #: ${trackingNumber}` : undefined,
      });
      return order;
    }

    const res = await fetch(`/api/orders/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderStatus, trackingNumber }),
    });
    if (!res.ok) throw new Error('注文ステータス更新に失敗しました。');
    return res.json();
  },

  // ================= KPIS =================
  async getKPIs(): Promise<BusinessKPIs> {
    if (checkIsSimulation()) {
      await simulateDelay(60);
      return simStore.getBusinessKPIs();
    }

    const res = await fetch('/api/kpis');
    if (!res.ok) throw new Error('KPIデータの取得に失敗しました。');
    return res.json();
  },

  // ================= RESET =================
  async resetDatabase(): Promise<{ success: boolean; message: string }> {
    if (checkIsSimulation()) {
      const res = simStore.resetToDefault();
      simulationEngine.initDefaultState();
      return res;
    }

    const res = await fetch('/api/reset-db', { method: 'POST' });
    return res.json();
  },

  // ================= FAVORITES =================
  async toggleFavorite(customerId: string, productId: string): Promise<{ favorites: string[] }> {
    if (checkIsSimulation()) {
      const favorites = simStore.toggleFavorite(customerId, productId);
      return { favorites };
    }

    const res = await fetch('/api/customers/favorites/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customerId, productId }),
    });
    return res.json();
  },

  // ================= AI SERVICES =================
  async generateListing(params: {
    brand: string;
    model: string;
    category: string;
    rank: ConditionRank;
    defects?: string[];
    accessories?: string[];
    missingAccessories?: string[];
    inspectorNotes?: string;
  }): Promise<{
    title: string;
    description: string;
    cosmeticNote: string;
    functionalNote: string;
    keywords: string[];
  }> {
    if (checkIsSimulation()) {
      await simulateDelay(400);
      const title = `【ランク${params.rank}・動作保証付】${params.brand} ${params.model} 検品済リユース品`;
      const cosmeticNote = `【外観状態：ランク${params.rank}】専門スタッフによる入念なクリーニング及び外観検査済。${
        params.defects && params.defects.length > 0
          ? `特記事項: ${params.defects.join('、')}`
          : '目立つ大きな傷や凹みはなく、良好なコンディションを保っています。'
      }`;
      const functionalNote =
        '【動作状態】全機能20項目動作確認クリア済。各ボタン、端子、主要機能ともに極めて快適に動作します。初期不良3ヶ月安心保証付き。';
      const description = `ご覧いただきありがとうございます。Re:Market認定中古品です。\n\n【商品詳細】\nメーカー: ${params.brand}\n型番: ${params.model}\nカテゴリー: ${params.category}\n状態ランク: ${params.rank}\n\n【付属品】\n${
        params.accessories && params.accessories.length > 0
          ? params.accessories.join('、')
          : '写真に写っているものが全てとなります。'
      }\n\n【安心のお約束】\n・専門技術スタッフによる完全動作検品済\n・アルコール除菌＆精密清掃施工済\n・安心の3ヶ月返品返金保証\n・24時間以内スピード梱包発送`;

      simulationEngine.addLog({
        category: 'AI Pipeline',
        level: 'success',
        message: `Gemini 2.5 Pro generated high-conversion SEO listing copy for ${params.brand} ${params.model}`,
      });

      const output = {
        title,
        description,
        cosmeticNote,
        functionalNote,
        keywords: [params.brand, params.model, params.category, `ランク${params.rank}`, '中古保証', 'ReMarket'],
      };

      // AI Request Audit (AGENTS.md mục 10)
      simStore.logAIRequest('listing', 'gemini-2.5-flash', params, output);

      return output;
    }

    const res = await fetch('/api/ai/generate-listing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error('AI出品文生成に失敗しました。');
    return res.json();
  },

  async askShoppingAssistant(userMessage: string): Promise<{
    reply: string;
    recommendedProducts: ProductItem[];
  }> {
    if (checkIsSimulation()) {
      await simulateDelay(500);
      const msg = userMessage.toLowerCase();
      const allProds = simStore.getProducts({ inStockOnly: true }).items;

      let matched = allProds.slice(0, 3);
      let reply = 'こんにちは！Re:Market AIコンシェルジュです。専門スタッフによる全品検品済みの安心リユース商品から、ご予算とご要望にぴったりの商品をご案内いたします。';

      if (msg.includes('カメラ') || msg.includes('写真') || msg.includes('sony') || msg.includes('canon')) {
        matched = allProds.filter((p) => p.category === 'カメラ').slice(0, 3);
        reply = 'カメラをお探しですね！当店ではミラーレス一眼から交換レンズまで、センサー清掃・シャッター回数確認済みのランクS〜A良品を多数取り揃えております。おすすめの3点はこちらです：';
      } else if (msg.includes('pc') || msg.includes('パソコン') || msg.includes('mac') || msg.includes('macbook')) {
        matched = allProds.filter((p) => p.category === 'パソコン').slice(0, 3);
        reply = 'ノートPCをお探しですね！バッテリー健全度85%以上、キーボード・液晶発色を厳格に検査済みの高コストパフォーマンスモデルをご提案します：';
      } else if (msg.includes('安') || msg.includes('予算') || msg.includes('コスパ')) {
        matched = [...allProds].sort((a, b) => a.price - b.price).slice(0, 3);
        reply = 'ご予算重視でお探しですね！価格を抑えつつもしっかり3ヶ月保証がついた高コスパ厳選アイテムをご紹介します：';
      }

      simulationEngine.addLog({
        category: 'AI Pipeline',
        level: 'info',
        message: `AI Shopping Concierge answered customer inquiry (${matched.length} items suggested)`,
      });

      const shoppingOutput = {
        reply,
        recommendedProducts: matched,
      };

      // AI Request Audit (AGENTS.md mục 10)
      simStore.logAIRequest('shopping', 'gemini-2.5-flash', { userMessage }, {
        reply,
        recommendedProductIds: matched.map((p) => p.id),
      });

      return shoppingOutput;
    }

    const res = await fetch('/api/ai/shopping-assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userMessage }),
    });
    if (!res.ok) throw new Error('AIショッピングアシスタントの応答に失敗しました。');
    return res.json();
  },

  async askSalesInsights(question: string): Promise<{
    databaseFacts: string[];
    analysis: string;
    actionableRecommendations: string[];
  }> {
    if (checkIsSimulation()) {
      await simulateDelay(600);
      const kpis = simStore.getBusinessKPIs();
      const output = {
        databaseFacts: [
          `当月売上高: ¥${kpis.revenueThisMonth.toLocaleString()}`,
          `平均粗利率: ${kpis.averageGrossMargin}%`,
          `平均販売日数: ${kpis.averageDaysToSell}日`,
          `最高利益率カテゴリ: カメラ（粗利率 38.2%）`,
          `検品合格率: ${kpis.inspectionPassRate}%`,
        ],
        analysis: `現在Re:Marketの循環リユースモデルは極めて健全に推移しています。特に「カメラ」と「PC」部門において、専門検品ランク開示による購入者信頼度が高く、出品から平均12日以内の高速成約を実現しています。\n「買取 → 20項目検品 → AI出品」のリードタイムを短縮したことで、在庫回転率が前月比+14%向上しました。`,
        actionableRecommendations: [
          '【買取強化】需要が逼迫しているSony αシリーズ及びFujifilm Xシリーズの買取査定額+5%キャンペーンを実施し、在庫確保を図る。',
          '【価格適正化】滞留25日を超過したランクC商品について、AI自動レコメンドによる5〜8%の段階的ディスカウント適用。',
          '【クロスセル推進】カメラ購入者に対し、相性の良い純正レンズ・予備バッテリーのバンドル提案を自動表示。',
        ],
      };

      // AI Request Audit (AGENTS.md mục 10)
      simStore.logAIRequest('sales_insights', 'gemini-2.5-pro', { question }, output);

      return output;
    }

    const res = await fetch('/api/ai/sales-insights', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
    });
    if (!res.ok) throw new Error('AI経営分析の応答に失敗しました。');
    return res.json();
  },

  // ================= AUTH & RBAC (AGENTS.md mục 3) =================
  async login(email: string, password: string): Promise<PublicUser> {
    if (checkIsSimulation()) {
      await simulateDelay(300);
      const user = simStore.getUserByEmail(email);
      if (!user || !verifyPassword(password, user.passwordHash)) {
        throw new Error('メールアドレスまたはパスワードが正しくありません。');
      }
      const pub = simStore.toPublicUser(user);
      setSimUser(pub);
      return pub;
    }
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'ログインに失敗しました。');
    return data.user;
  },

  async logout(): Promise<void> {
    if (checkIsSimulation()) {
      await simulateDelay(60);
      setSimUser(null);
      return;
    }
    await fetch('/api/auth/logout', { method: 'POST' });
  },

  async getMe(): Promise<PublicUser | null> {
    if (checkIsSimulation()) {
      await simulateDelay(40);
      return getSimUser();
    }
    const res = await fetch('/api/auth/me');
    if (!res.ok) return null;
    const data = await res.json();
    return data.user || null;
  },

  // ================= REGISTER + EMAIL MAGIC LINK (AGENTS.md mục 8) =================
  // Luôn gọi server (/api/auth/*) vì trạng thái đăng ký + verify token nằm
  // server-side (Supabase + Edge Function → Resend), không phụ thuộc chế độ simulation.
  // Bắt buộc gửi EMAIL THẬT — không có fallback OTP/link hiển thị cho user.
  async register(input: {
    email: string;
    password: string;
    name: string;
  }): Promise<{
    ok: boolean;
    error?: string;
    email?: string;
    provider?: string;
    expiresInSeconds?: number;
    devVerifyLink?: string;
  }> {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, error: data.error || '登録に失敗しました。' };
    // Simulation mode: client dùng bản simStore riêng (khác server). Ghi thêm vào
    // simStore client để luồng đăng nhập simulation tìm được tài khoản vừa tạo sau
    // khi xác thực xong. Trạng thái "chưa verify" do server gate (login bị chặn).
    if (checkIsSimulation()) {
      try {
        simStore.registerCustomerAccount({
          email: input.email,
          passwordHash: hashPassword(input.password),
          name: input.name,
        });
      } catch {
        // đã tồn tại -> bỏ qua
      }
    }
    return { ok: true, ...data };
  },

  async verifyLink(token: string): Promise<{ ok: boolean; error?: string; user?: PublicUser }> {
    const res = await fetch('/api/auth/verify-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, error: data.error || '認証に失敗しました。' };
    // Magic link 1-click -> tự đăng nhập. Live: server đã set cookie httpOnly.
    // Simulation: ghi session local để AuthContext nhận biết.
    if (checkIsSimulation() && data.user) setSimUser(data.user);
    return { ok: true, user: data.user };
  },

  async resendLink(email: string): Promise<{
    ok: boolean;
    error?: string;
    retryAfterSeconds?: number;
    devVerifyLink?: string;
  }> {
    const res = await fetch('/api/auth/resend-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, error: data.error || '再送信に失敗しました。', retryAfterSeconds: data.retryAfterSeconds };
    return { ok: true, ...data };
  },
};
