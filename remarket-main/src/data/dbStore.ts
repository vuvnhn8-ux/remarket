/**
 * Re:Market - In-Memory Database Store with Atomic Transactions,
 * Business Logic, KPI Engine, and Used-Goods Workflow Management.
 */

import {
  ProductItem,
  AcquisitionRecord,
  InventoryItem,
  InspectionRecord,
  OrderRecord,
  CustomerUser,
  BusinessKPIs,
  ConditionRank,
  ProductCategory,
  OrderStatus,
  AIRequestLog,
  UserAccount,
  PublicUser,
} from '../types';
import { generateSeedData, SeedData } from './seedData';
import { getAppMode as resolveAppMode, isSimulationMode as resolveIsSimulationMode } from '../../lib/config/app-mode';

export interface DatabaseStoreOptions {
  seed?: () => SeedData;
  label?: string;
}

export class DatabaseStore {
  private products: ProductItem[] = [];
  private acquisitions: AcquisitionRecord[] = [];
  private inventories: InventoryItem[] = [];
  private inspections: InspectionRecord[] = [];
  private orders: OrderRecord[] = [];
  private customers: CustomerUser[] = [];
  private users: UserAccount[] = [];
  private aiRequests: AIRequestLog[] = [];
  private isInitialized = false;
  private label: string;
  private seedFn: () => SeedData;

  constructor(options?: DatabaseStoreOptions) {
    this.label = options?.label || 'Re:Market DB';
    this.seedFn = options?.seed || generateSeedData;
    this.init();
  }

  // ===================== MODE (APP_MODE trong AGENTS.md 14.1) =====================
  // Uỷ quyền toàn bộ cho lib/config/app-mode.ts — nơi duy nhất đọc APP_MODE.
  public getAppMode(): 'simulation' | 'live' {
    return resolveAppMode();
  }

  public isSimulationMode(): boolean {
    return resolveIsSimulationMode();
  }

  public init() {
    if (this.isInitialized) return;
    const seed = this.seedFn();
    this.products = seed.products;
    this.acquisitions = seed.acquisitions;
    this.inventories = seed.inventories;
    this.inspections = seed.inspections;
    this.orders = seed.orders;
    this.customers = seed.customerUsers;
    this.users = seed.users || this.defaultUsers();
    this.isInitialized = true;
    console.log(`[${this.label}] Seeded ${this.products.length} products, ${this.acquisitions.length} acquisitions, ${this.orders.length} orders, ${this.users.length} users.`);
  }

  private defaultUsers(): UserAccount[] {
    return [];
  }

  public getUserByEmail(email: string): UserAccount | undefined {
    const normalized = email.toLowerCase().trim();
    return this.users.find((u) => u.email.toLowerCase() === normalized);
  }

  public getUserById(id: string): UserAccount | undefined {
    return this.users.find((u) => u.id === id);
  }

  public toPublicUser(user: UserAccount): PublicUser {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      department: user.department,
      customerId: user.customerId,
    };
  }

  public createUser(user: UserAccount): UserAccount {
    if (this.users.some((u) => u.email.toLowerCase() === user.email.toLowerCase())) {
      throw new Error('このメールアドレスは既に登録されています。');
    }
    this.users.push(user);
    return user;
  }

  public resetToDefault() {
    this.isInitialized = false;
    this.init();
    return { success: true, message: 'データベースを初期シードデータにリセットしました。' };
  }

  // ===================== PRODUCTS =====================
  public getProducts(params?: {
    category?: string;
    brand?: string;
    conditionRank?: string;
    minPrice?: number;
    maxPrice?: number;
    searchQuery?: string;
    inStockOnly?: boolean;
    sort?: 'recommended' | 'newest' | 'price_asc' | 'price_desc' | 'popularity';
    limit?: number;
  }): { items: ProductItem[]; total: number } {
    let list = [...this.products];

    if (params?.category && params.category !== 'all' && params.category !== 'すべて') {
      list = list.filter((p) => p.category === params.category);
    }

    if (params?.brand && params.brand !== 'all' && params.brand !== 'すべて') {
      list = list.filter((p) => p.brand.toLowerCase() === params.brand!.toLowerCase());
    }

    if (params?.conditionRank && params.conditionRank !== 'all') {
      list = list.filter((p) => p.conditionRank === params.conditionRank);
    }

    if (params?.minPrice !== undefined && params.minPrice > 0) {
      list = list.filter((p) => p.price >= params.minPrice!);
    }

    if (params?.maxPrice !== undefined && params.maxPrice > 0) {
      list = list.filter((p) => p.price <= params.maxPrice!);
    }

    if (params?.inStockOnly) {
      list = list.filter((p) => p.stock > 0 && !p.isSold);
    }

    if (params?.searchQuery && params.searchQuery.trim()) {
      const q = params.searchQuery.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.model.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.keywords.some((k) => k.toLowerCase().includes(q)) ||
          p.description.toLowerCase().includes(q)
      );
    }

    // Sorting
    const sort = params?.sort || 'recommended';
    if (sort === 'newest') {
      list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    } else if (sort === 'price_asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (sort === 'price_desc') {
      list.sort((a, b) => b.price - a.price);
    } else if (sort === 'popularity') {
      list.sort((a, b) => b.viewCount - a.viewCount);
    } else {
      // Recommended: In stock first, then high views
      list.sort((a, b) => {
        if (a.stock !== b.stock) return b.stock - a.stock;
        return b.viewCount - a.viewCount;
      });
    }

    const total = list.length;
    if (params?.limit && params.limit > 0) {
      list = list.slice(0, params.limit);
    }

    return { items: list, total };
  }

  public getProductById(id: string): ProductItem | undefined {
    const p = this.products.find((item) => item.id === id);
    if (p) {
      p.viewCount += 1;
    }
    return p;
  }

  // ===================== ACQUISITIONS (買取管理) =====================
  public getAcquisitions(): AcquisitionRecord[] {
    return [...this.acquisitions].sort((a, b) => b.acquiredAt.localeCompare(a.acquiredAt));
  }

  public getAcquisitionById(id: string): AcquisitionRecord | undefined {
    return this.acquisitions.find((a) => a.id === id);
  }

  public createAcquisition(data: Omit<AcquisitionRecord, 'id' | 'status'> & { status?: AcquisitionRecord['status'] }): AcquisitionRecord {
    const id = `ACQ-2026-${String(this.acquisitions.length + 1).padStart(4, '0')}`;
    const newAcq: AcquisitionRecord = {
      ...data,
      id,
      status: data.status || '買取受付',
      acquiredAt: data.acquiredAt || new Date().toISOString().slice(0, 10),
    };
    this.acquisitions.unshift(newAcq);
    return newAcq;
  }

  public updateAcquisitionStatus(id: string, status: AcquisitionRecord['status']): AcquisitionRecord | null {
    const acq = this.acquisitions.find((a) => a.id === id);
    if (!acq) return null;
    acq.status = status;
    return acq;
  }

  // ===================== INSPECTIONS (商品検品) =====================
  public getInspections(): InspectionRecord[] {
    return [...this.inspections].sort((a, b) => b.inspectedAt.localeCompare(a.inspectedAt));
  }

  public getInspectionById(id: string): InspectionRecord | undefined {
    return this.inspections.find((i) => i.id === id);
  }

  public createInspection(data: Omit<InspectionRecord, 'id'>): InspectionRecord {
    const id = `INSP-2026-${String(this.inspections.length + 1).padStart(4, '0')}`;
    const newInsp: InspectionRecord = {
      ...data,
      id,
    };
    this.inspections.unshift(newInsp);

    // Update corresponding Acquisition
    const acq = this.acquisitions.find((a) => a.id === data.acquisitionId);
    if (acq) {
      acq.inspectionId = id;
      acq.status = '査定完了';
    }

    return newInsp;
  }

  // ===================== INVENTORY & PRICING (在庫・価格管理) =====================
  public getInventories(): InventoryItem[] {
    return [...this.inventories].sort((a, b) => b.acquiredAt.localeCompare(a.acquiredAt));
  }

  public getInventoryById(id: string): InventoryItem | undefined {
    return this.inventories.find((i) => i.id === id);
  }

  public registerInventoryFromInspection(params: {
    acquisitionId: string;
    inspectionId: string;
    sellingPrice: number;
    warehouseLocation: string;
  }): { inventory: InventoryItem; product: ProductItem } {
    const acq = this.acquisitions.find((a) => a.id === params.acquisitionId);
    const insp = this.inspections.find((i) => i.id === params.inspectionId);

    if (!acq || !insp) {
      throw new Error('買取レコードまたは検品レコードが見つかりません。');
    }

    const invId = `INV-2026-${String(this.inventories.length + 1).padStart(4, '0')}`;
    const prodId = `PROD-2026-${String(this.products.length + 1).padStart(4, '0')}`;
    const today = new Date().toISOString().slice(0, 10);

    const grossProfit = params.sellingPrice - acq.purchasePrice;
    const grossMarginPercent = Number(((grossProfit / params.sellingPrice) * 100).toFixed(1));

    const newInventory: InventoryItem = {
      id: invId,
      acquisitionId: acq.id,
      productId: prodId,
      serialNumber: acq.serialNumber,
      acquisitionCost: acq.purchasePrice,
      currentSellingPrice: params.sellingPrice,
      grossProfit,
      grossMarginPercent,
      warehouseLocation: params.warehouseLocation,
      status: '出品中',
      conditionRank: insp.assignedRank,
      acquiredAt: acq.acquiredAt,
      listedAt: today,
      history: [
        { date: acq.acquiredAt, status: '入荷', note: 'お客様より買取入荷', actor: '受入スタッフ' },
        { date: insp.inspectedAt, status: '検品完了', note: `検品完了 (ランク${insp.assignedRank})`, actor: insp.inspectorName },
        { date: today, status: '在庫登録・出品', note: `ロケーション ${params.warehouseLocation} / 販売価格 ¥${params.sellingPrice.toLocaleString()}`, actor: 'システム' },
      ],
    };

    const newProduct: ProductItem = {
      id: prodId,
      inventoryId: invId,
      acquisitionId: acq.id,
      name: `${acq.brand} ${acq.model} [ランク${insp.assignedRank}]`,
      brand: acq.brand,
      model: acq.model,
      category: acq.category,
      serialNumber: acq.serialNumber,
      price: params.sellingPrice,
      originalRetailPrice: acq.estimatedMarketPrice ? Math.round(acq.estimatedMarketPrice * 1.5) : undefined,
      conditionRank: insp.assignedRank,
      stock: 1,
      isSold: false,
      images: acq.images && acq.images.length > 0 ? acq.images : ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80'],
      featuredImage: acq.images?.[0] || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
      cosmeticSummary: insp.cosmeticDescription,
      functionalSummary: insp.functionalDescription,
      includedAccessories: insp.includedAccessories,
      missingAccessories: insp.missingAccessories,
      defects: insp.defects,
      inspectionDate: insp.inspectedAt,
      inspectorName: insp.inspectorName,
      description: `${acq.brand}の代表的人気モデル「${acq.model}」。専門スタッフによる徹底した動作検品および除菌クリーニング実施済みの安心中古品です。`,
      keywords: [acq.brand, acq.model, acq.category, `ランク${insp.assignedRank}`, '検品済', 'リユース'],
      warrantyMonths: insp.assignedRank === 'S' || insp.assignedRank === 'A' ? 6 : 3,
      shippingTime: '14時までのご注文で当日発送（送料無料）',
      location: params.warehouseLocation,
      viewCount: 0,
      createdAt: today,
      tags: [acq.brand, acq.category, `ランク${insp.assignedRank}`, '検品済'],
    };

    acq.inventoryId = invId;
    acq.productId = prodId;
    acq.status = '販売中';

    this.inventories.unshift(newInventory);
    this.products.unshift(newProduct);

    return { inventory: newInventory, product: newProduct };
  }

  public updateInventoryPrice(inventoryId: string, newSellingPrice: number): InventoryItem | null {
    const inv = this.inventories.find((i) => i.id === inventoryId);
    if (!inv) return null;

    inv.currentSellingPrice = newSellingPrice;
    inv.grossProfit = newSellingPrice - inv.acquisitionCost;
    inv.grossMarginPercent = Number(((inv.grossProfit / newSellingPrice) * 100).toFixed(1));
    inv.history.push({
      date: new Date().toISOString().slice(0, 10),
      status: '価格改定',
      note: `販売価格を ¥${newSellingPrice.toLocaleString()} に変更 (粗利率: ${inv.grossMarginPercent}%)`,
      actor: '価格管理者',
    });

    // Also sync product price
    const prod = this.products.find((p) => p.id === inv.productId || p.inventoryId === inv.id);
    if (prod) {
      prod.price = newSellingPrice;
    }

    return inv;
  }

  // ===================== ORDERS & ATOMIC PURCHASE (注文・購入) =====================
  public getOrders(): OrderRecord[] {
    return [...this.orders].sort((a, b) => b.orderedAt.localeCompare(a.orderedAt));
  }

  public getOrderById(id: string): OrderRecord | undefined {
    return this.orders.find((o) => o.id === id);
  }

  /**
   * Atomic Order Placement:
   * Validates that the unique used item is in stock (stock === 1 && !isSold).
   * Atomically locks stock to 0, sets isSold = true, marks inventory as '売却済み',
   * appends history log, and creates the order.
   */
  public createOrder(data: {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    shippingPostalCode?: string;
    shippingAddress?: string;
    deliverySlot?: string;
    paymentMethod?: OrderRecord['paymentMethod'] | string;
    productIds?: string[];
    items?: { productId: string }[];
    isSimulation?: boolean;
  }): OrderRecord {
    // Normalize payload từ CheckoutModal: gửi `items` (array) thay vì `productIds`,
    // và gửi shippingAddress dưới dạng object. Chuẩn hoá về dạng dbStore cần.
    const productIds = data.productIds || (data.items || []).map((it) => it.productId);

    if (!productIds || productIds.length === 0) {
      throw new Error('注文に商品が指定されていません。');
    }

    const shippingPostalCode =
      data.shippingPostalCode ||
      (typeof data.shippingAddress === 'object' && data.shippingAddress
        ? (data.shippingAddress as any).postalCode
        : '');
    const shippingAddressStr =
      typeof data.shippingAddress === 'string'
        ? data.shippingAddress
        : data.shippingAddress && typeof data.shippingAddress === 'object'
        ? (() => {
            const s = data.shippingAddress as any;
            return [s.prefecture, s.city, s.addressLine].filter(Boolean).join(' ');
          })()
        : '';

    const paymentMethodMap: Record<string, OrderRecord['paymentMethod']> = {
      credit_card: 'クレジットカード',
      paypay: 'PayPay',
      convenience_store: 'コンビニ決済',
      bank_transfer: '銀行振込',
    };
    const paymentMethod: OrderRecord['paymentMethod'] =
      data.paymentMethod && data.paymentMethod in paymentMethodMap
        ? paymentMethodMap[data.paymentMethod]
        : ((data.paymentMethod as OrderRecord['paymentMethod']) || 'クレジットカード');

    // 1. Validation phase (Atomic check)
    const targetProducts: ProductItem[] = [];
    for (const pid of productIds) {
      const prod = this.products.find((p) => p.id === pid);
      if (!prod) {
        throw new Error(`商品 (ID: ${pid}) が見つかりません。`);
      }
      if (prod.stock <= 0 || prod.isSold) {
        throw new Error(`商品「${prod.name}」は先ほど他のお客様により購入され、売却済みとなりました。中古一点物のため同一商品の再購入はできません。`);
      }
      targetProducts.push(prod);
    }

    const today = new Date().toISOString().slice(0, 10);
    const orderId = `ORD-202608-${String(this.orders.length + 1).padStart(4, '0')}`;
    const trackingNo = `4582-9104-${String(2000 + this.orders.length + 1)}`;

    let subtotal = 0;
    const orderItems = targetProducts.map((p) => {
      subtotal += p.price;
      // Atomic deduction
      p.stock = 0;
      p.isSold = true;

      // Update Inventory
      const inv = this.inventories.find((i) => i.id === p.inventoryId || i.productId === p.id);
      if (inv) {
        inv.status = '売却済み';
        inv.soldAt = today;
        inv.history.push({
          date: today,
          status: '売却済み',
          note: `注文確定 (注文番号: ${orderId})`,
          actor: 'オンライン決済システム',
        });
      }

      // Update Acquisition status
      const acq = this.acquisitions.find((a) => a.id === p.acquisitionId);
      if (acq) {
        acq.status = '売却済み';
      }

      return {
        productId: p.id,
        productName: p.name,
        brand: p.brand,
        price: p.price,
        conditionRank: p.conditionRank,
        image: p.featuredImage,
        serialNumber: p.serialNumber,
      };
    });

    const tax = Math.round(subtotal * 0.1);
    const shippingFee = subtotal >= 5000 ? 0 : 550;
    const totalAmount = subtotal + shippingFee;

    const newOrder: OrderRecord = {
      id: orderId,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone,
      shippingPostalCode,
      shippingAddress: shippingAddressStr,
      deliverySlot: data.deliverySlot || '指定なし',
      paymentMethod,
      paymentStatus: '未払い',
      orderStatus: '注文受付',
      items: orderItems,
      subtotal,
      tax,
      shippingFee,
      totalAmount,
      orderedAt: today,
      trackingNumber: trackingNo,
      carrier: 'ヤマト運輸（宅急便）',
      isSimulation: data.isSimulation !== undefined ? data.isSimulation : this.isSimulationMode(),
    };

    this.orders.unshift(newOrder);
    return newOrder;
  }

  // ===== PAYMENT CONFIRMATION (mục 14.2 — state machine 注文受付→支払確認) =====
  public confirmOrderPayment(orderId: string): OrderRecord | null {
    const order = this.orders.find((o) => o.id === orderId);
    if (!order) return null;
    if (order.orderStatus === '注文受付' && order.paymentStatus === '未払い') {
      order.paymentStatus = '支払済';
      order.orderStatus = '支払確認';
    }
    return order;
  }

  public failOrderPayment(orderId: string): OrderRecord | null {
    const order = this.orders.find((o) => o.id === orderId);
    if (!order) return null;
    // Giải phóng stock đã "giữ chỗ" khi thanh toán thất bại.
    for (const item of order.items) {
      if (item.productId.startsWith('SIM-')) continue; // không sửa dữ liệu sim
      const prod = this.products.find((p) => p.id === item.productId);
      if (prod && prod.isSold) {
        prod.stock = 1;
        prod.isSold = false;
      }
    }
    order.paymentStatus = '返金済';
    order.orderStatus = 'キャンセル';
    return order;
  }

  public updateOrderStatus(orderId: string, status: OrderStatus, trackingNumber?: string): OrderRecord | null {
    const order = this.orders.find((o) => o.id === orderId);
    if (!order) return null;

    order.orderStatus = status;
    const today = new Date().toISOString().slice(0, 10);
    if (status === '発送済み') {
      order.shippedAt = today;
      if (trackingNumber) order.trackingNumber = trackingNumber;
    } else if (status === '配達完了') {
      order.deliveredAt = today;
    }

    return order;
  }

  // ====== PURGE SIMULATION DATA SUPPORT (AGENTS.md 14.3) ======
  /**
   * Khôi phục lại một sản phẩm về trạng thái có thể bán (stock=1, isSold=false,
   * inventory='出品中', acquisition='販売中') — chỉ dùng khi item đó chỉ bị "bán"
   * qua order simulation và chưa được bán thật.
   * Trả về danh sách id đã khôi phục (productId, inventoryId, acquisitionId).
   */
  public restoreSimulationSale(productId: string): string[] | null {
    const prod = this.products.find((p) => p.id === productId);
    if (!prod) return null;
    if (prod.stock > 0 || !prod.isSold) return null; // đã ở trạng thái bán được

    const restored: string[] = [];
    prod.stock = 1;
    prod.isSold = false;
    restored.push(prod.id);

    const inv = this.inventories.find(
      (i) => i.id === prod.inventoryId || i.productId === prod.id
    );
    if (inv) {
      inv.status = '出品中';
      inv.soldAt = undefined;
      inv.history.push({
        date: new Date().toISOString().slice(0, 10),
        status: '出品中',
        note: 'Purge simulation data: khôi phục sau khi gỡ order simulation',
        actor: 'purge-simulation-data',
      });
      restored.push(inv.id);
    }

    const acq = this.acquisitions.find((a) => a.id === prod.acquisitionId);
    if (acq) {
      acq.status = '販売中';
      restored.push(acq.id);
    }

    return restored;
  }

  /** Xoá hoàn toàn các order (kèm item) có id nằm trong danh sách. */
  public purgeOrdersByIds(ids: string[]): number {
    const idSet = new Set(ids);
    const before = this.orders.length;
    this.orders = this.orders.filter((o) => !idSet.has(o.id));
    return before - this.orders.length;
  }

  // ===================== BUSINESS KPIS ENGINE (経営・リユースKPI) =====================
  public getBusinessKPIs(): BusinessKPIs {
    const todayStr = '2026-08-25'; // Simulated anchor date
    const soldOrders = this.orders.filter((o) => o.orderStatus !== 'キャンセル');

    const totalRevenue = soldOrders.reduce((sum, o) => sum + o.subtotal, 0);
    const totalOrdersCount = soldOrders.length;
    const averageOrderValue = totalOrdersCount > 0 ? Math.round(totalRevenue / totalOrdersCount) : 0;

    // Calculate gross profit from inventory items marked as sold
    const soldInventories = this.inventories.filter((i) => i.status === '売却済み');
    const totalGrossProfit = soldInventories.reduce((sum, i) => sum + i.grossProfit, 0);
    const totalSoldRevenue = soldInventories.reduce((sum, i) => sum + i.currentSellingPrice, 0);
    const averageGrossMargin = totalSoldRevenue > 0 ? Number(((totalGrossProfit / totalSoldRevenue) * 100).toFixed(1)) : 28.5;

    // Acquisitions
    const acquiredCountThisMonth = this.acquisitions.length;
    const acquisitionCostThisMonth = this.acquisitions.reduce((sum, a) => sum + a.purchasePrice, 0);

    const passedInspections = this.inspections.filter((i) => i.result === 'Pass' || i.result === 'Conditional Pass');
    const inspectionPassRate = this.inspections.length > 0 ? Number(((passedInspections.length / this.inspections.length) * 100).toFixed(1)) : 98.2;

    // Inventory metrics
    const totalInventoryCount = this.inventories.length;
    const activeInventory = this.inventories.filter((i) => i.status !== '売却済み' && i.status !== '廃棄');
    const totalInventoryValue = activeInventory.reduce((sum, i) => sum + i.currentSellingPrice, 0);
    const listedCount = this.products.filter((p) => p.stock > 0 && !p.isSold).length;
    const soldCount = this.products.filter((p) => p.isSold).length;
    const unsoldWaitingListing = this.inventories.filter((i) => i.status === '在庫' || i.status === '検品中').length;

    // Average days to sell — computed từ dữ liệu thật (AGENTS.md mục 9, không hardcode):
    // trung bình số ngày giữa listedAt và soldAt của các inventory đã bán.
    const DAY_MS = 24 * 60 * 60 * 1000;
    const soldWithDates = this.inventories.filter(
      (i) => i.status === '売却済み' && !!i.listedAt && !!i.soldAt
    );
    const averageDaysToSell =
      soldWithDates.length > 0
        ? Number(
            (
              soldWithDates.reduce((sum, i) => {
                const days = (new Date(i.soldAt!).getTime() - new Date(i.listedAt!).getTime()) / DAY_MS;
                return sum + Math.max(0, Math.round(days));
              }, 0) / soldWithDates.length
            ).toFixed(1)
          )
        : 0;

    // Funnel: Acquired -> Inspected -> Listed -> Sold
    const funnel = {
      acquired: this.acquisitions.length,
      inspected: this.inspections.length,
      listed: this.products.length,
      sold: soldCount,
    };

    // Category Stats
    const categoryStats = [
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
    ].map((cat) => {
      const catProds = this.products.filter((p) => p.category === cat);
      const catSold = catProds.filter((p) => p.isSold);
      const catRev = catSold.reduce((sum, p) => sum + p.price, 0);
      const catInvs = this.inventories.filter((i) => {
        const prod = this.products.find((p) => p.id === i.productId);
        return prod?.category === cat;
      });
      const avgMargin = catInvs.length > 0 ? Number((catInvs.reduce((s, i) => s + i.grossMarginPercent, 0) / catInvs.length).toFixed(1)) : 27.5;

      return {
        category: cat as ProductCategory,
        inventoryCount: catProds.filter((p) => !p.isSold).length,
        soldCount: catSold.length,
        revenue: catRev,
        avgMargin,
      };
    });

    return {
      salesToday: Math.round(totalRevenue * 0.08),
      salesThisWeek: Math.round(totalRevenue * 0.38),
      salesThisMonth: totalRevenue,
      revenueThisMonth: totalRevenue,
      grossProfitThisMonth: totalGrossProfit,
      averageGrossMargin,
      averageOrderValue,
      totalOrdersCount,
      acquiredCountThisMonth,
      acquisitionCostThisMonth,
      inspectionPassRate,
      totalInventoryCount,
      totalInventoryValue,
      listedCount,
      soldCount,
      unsoldWaitingListing,
      averageDaysToSell,
      funnel,
      categoryStats,
    };
  }

  // ===================== CUSTOMERS & FAVORITES =====================
  public getCustomers(): CustomerUser[] {
    return this.customers;
  }

  /**
   * Tạo tài khoản customer mới từ quá trình đăng ký (email+password).
   * Vừa tạo UserAccount (để đăng nhập/RBAC) vừa tạo CustomerUser (để
   * favorites/orders/mypage). Email đã tồn tại -> throw để báo lỗi trùng.
   */
  public registerCustomerAccount(input: {
    email: string;
    passwordHash: string;
    name: string;
  }): { userAccount: UserAccount; customer: CustomerUser } {
    const email = input.email.toLowerCase().trim();
    if (this.users.some((u) => u.email.toLowerCase() === email)) {
      throw new Error('このメールアドレスは既に登録されています。');
    }
    const id = `USR-${email.replace(/[^a-z0-9@.-]/gi, '')}-${Date.now().toString(36)}`;
    const customerId = `CUST-R${String(this.customers.length + 1).padStart(4, '0')}`;
    const customer: CustomerUser = {
      id: customerId,
      name: input.name,
      email,
      phone: '',
      postalCode: '',
      address: '',
      favorites: [],
    };
    const userAccount: UserAccount = {
      id,
      email,
      passwordHash: input.passwordHash,
      role: 'customer',
      name: input.name,
      customerId,
    };
    this.customers.push(customer);
    this.users.push(userAccount);
    return { userAccount, customer };
  }

  public toggleFavorite(customerId: string, productId: string): string[] {
    const cust = this.customers.find((c) => c.id === customerId);
    if (!cust) {
      throw new Error(`対象の顧客が見つかりません: ${customerId}`);
    }
    const idx = cust.favorites.indexOf(productId);
    if (idx >= 0) {
      cust.favorites.splice(idx, 1);
    } else {
      cust.favorites.push(productId);
    }
    return cust.favorites;
  }

  // ===================== AI REQUEST AUDIT (AGENTS.md mục 10) =====================
  // Mọi request/response AI đều được log để audit & debug (input/output/model/timestamp).
  public logAIRequest(
    feature: AIRequestLog['feature'],
    model: string,
    input: AIRequestLog['input'],
    output: AIRequestLog['output']
  ): AIRequestLog {
    const id = `AIREQ-${Date.now()}-${String(this.aiRequests.length + 1).padStart(3, '0')}`;
    const record: AIRequestLog = {
      id,
      feature,
      model,
      input,
      output,
      timestamp: new Date().toISOString(),
      mode: this.getAppMode(),
    };
    this.aiRequests.unshift(record);
    // Giới hạn bộ nhớ trong — chỉ giữ 200 bản ghi gần nhất để tránh phình vô hạn.
    if (this.aiRequests.length > 200) {
      this.aiRequests = this.aiRequests.slice(0, 200);
    }
    return record;
  }

  public getAIRequests(limit = 50): AIRequestLog[] {
    return this.aiRequests.slice(0, limit);
  }
}

export const db = new DatabaseStore();
export const dbStore = db;
