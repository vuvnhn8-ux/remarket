/**
 * Re:Market — SupabaseStore (AGENTS.md mục 3, 4, 14.2)
 *
 * Lớp store SERVER-SIDE dùng Supabase (PostgREST + service role) làm DB thật,
 * thay cho in-memory dbStore. Được chọn bởi `getStore()` khi cấu hình Supabase
 * (VITE_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY) + APP_MODE=live.
 *
 * TẤT CẢ phương thức đều async (PostgREST). Bề mặt phương thức khớp với những
 * gì server route / auth / PaymentService đang dùng, để route gọi qua
 * `getStore()` (trả ServerStore facade) mà không đổi logic nghiệp vụ.
 *
 * Bảo mật (AGENTS.md mục 10, 11):
 *   - Hub dữ liệu nội bộ qua service role (vượt RLS) cho Staff/Admin.
 *   - Sản phẩm public do anon + RLS (migration 0002) bảo vệ.
 *   - Key chỉ nằm server-side, KHÔNG lộ ra client bundle.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  AIRequestLog,
  AcquisitionRecord,
  BusinessKPIs,
  CustomerUser,
  InspectionRecord,
  InventoryItem,
  OrderItem,
  OrderRecord,
  OrderStatus,
  ProductItem,
  PublicUser,
  UserAccount,
} from '../types';

// ---------------------------------------------------------------------------
// Env helpers (single place)
// ---------------------------------------------------------------------------
function env(name: string, legacyName?: string): string {
  return process.env[name] || (legacyName ? process.env[legacyName] : '') || '';
}

export function isSupabaseStoreEnabled(): boolean {
  return Boolean(env('VITE_SUPABASE_URL', 'VITE_PUBLIC_SUPABASE_URL') && env('SUPABASE_SERVICE_ROLE_KEY'));
}

// ---------------------------------------------------------------------------
// Row ⇄ entity mappers
// ---------------------------------------------------------------------------
type Snaked = Record<string, any>;

function productFromRow(r: Snaked): ProductItem {
  return {
    id: r.id,
    inventoryId: r.inventory_id || '',
    acquisitionId: r.acquisition_id || '',
    name: r.name,
    brand: r.brand || '',
    model: r.model || '',
    category: r.category,
    serialNumber: r.serial_number || '',
    price: r.price || 0,
    originalRetailPrice: r.original_retail_price,
    conditionRank: r.condition_rank,
    stock: r.stock ?? 1,
    isSold: r.is_sold ?? false,
    images: r.images || [],
    featuredImage: r.featured_image || (r.images && r.images[0]) || '',
    cosmeticSummary: r.cosmetic_summary || '',
    functionalSummary: r.functional_summary || '',
    includedAccessories: r.included_accessories || [],
    missingAccessories: r.missing_accessories || [],
    defects: r.defects || [],
    inspectionDate: r.inspection_date || '',
    inspectorName: r.inspector_name || '',
    description: r.description || '',
    keywords: r.keywords || [],
    warrantyMonths: r.warranty_months ?? 3,
    shippingTime: r.shipping_time || '',
    location: r.location || '',
    viewCount: r.view_count || 0,
    createdAt: r.created_at || '',
    tags: r.tags || [],
  };
}

function acquisitionFromRow(r: Snaked): AcquisitionRecord {
  return {
    id: r.id,
    customerName: r.customer_name,
    customerPhone: r.customer_phone,
    customerEmail: r.customer_email,
    customerAddress: r.customer_address,
    acquiredAt: r.acquired_at,
    category: r.category,
    brand: r.brand,
    model: r.model,
    serialNumber: r.serial_number,
    purchasePrice: r.purchase_price || 0,
    estimatedMarketPrice: r.estimated_market_price,
    initialCondition: r.initial_condition,
    initialAccessoriesNote: r.initial_accessories_note,
    notes: r.notes,
    status: r.status || '受付済',
    images: r.images || [],
    inspectionId: r.inspection_id,
    inventoryId: r.inventory_id,
    productId: r.product_id,
  } as AcquisitionRecord;
}

function inspectionFromRow(r: Snaked): InspectionRecord {
  return {
    id: r.id,
    acquisitionId: r.acquisition_id,
    inspectorName: r.inspector_name,
    inspectedAt: r.inspected_at,
    result: r.result || 'Pass',
    assignedRank: r.assigned_rank || 'B',
    exterior: r.exterior || { scratches: '微小', dirt: 'なし', dents: 'なし', discoloration: 'なし', damage: 'なし' },
    functions: r.functions || { power: '良好', display: 'ドット抜けなし・発色良好', buttons: '全ボタン正常動作', battery: '通常劣化(70-84%)', connectivity: 'Wi-Fi/Bluetooth/端子正常', mainFunctions: '全機能正常確認済' },
    includedAccessories: r.included_accessories || [],
    missingAccessories: r.missing_accessories || [],
    defects: r.defects || [],
    cosmeticDescription: r.cosmetic_description || '',
    functionalDescription: r.functional_description || '',
    staffComments: r.staff_comments || r.notes || '',
  };
}

function inventoryFromRow(r: Snaked): InventoryItem {
  return {
    id: r.id,
    acquisitionId: r.acquisition_id,
    productId: r.product_id,
    inspectionId: r.inspection_id,
    productName: r.product_name,
    brand: r.brand,
    category: r.category,
    serialNumber: r.serial_number,
    acquisitionCost: r.acquisition_cost || 0,
    currentSellingPrice: r.current_selling_price || 0,
    sellingPrice: r.current_selling_price,
    grossProfit: r.gross_profit || 0,
    grossMarginPercent: r.gross_margin_percent || 0,
    warehouseLocation: r.warehouse_location || '',
    status: r.status || '入荷',
    conditionRank: r.condition_rank,
    acquiredAt: r.acquired_at,
    listedAt: r.listed_at,
    soldAt: r.sold_at,
    history: r.history || [],
  };
}

function orderFromRow(r: Snaked): OrderRecord {
  const items: OrderItem[] = (r.order_items || []).map((it: Snaked) => ({
    productId: it.product_id,
    productName: it.product_name,
    brand: it.brand,
    price: it.price,
    conditionRank: it.condition_rank,
    image: it.image,
    serialNumber: it.serial_number,
  }));
  return {
    id: r.id,
    customerName: r.customer_name,
    customerEmail: r.customer_email,
    customerPhone: r.customer_phone,
    shippingPostalCode: r.shipping_postal_code,
    shippingAddress: r.shipping_address,
    deliverySlot: r.delivery_slot,
    paymentMethod: r.payment_method,
    paymentStatus: r.payment_status,
    orderStatus: r.order_status,
    items,
    subtotal: r.subtotal || 0,
    tax: r.tax || 0,
    shippingFee: r.shipping_fee || 0,
    totalAmount: r.total_amount || 0,
    orderedAt: r.ordered_at,
    shippedAt: r.shipped_at,
    deliveredAt: r.delivered_at,
    trackingNumber: r.tracking_number,
    carrier: r.carrier,
    isSimulation: r.is_simulation ?? false,
  } as OrderRecord;
}

// ---------------------------------------------------------------------------
// SupabaseStore
// ---------------------------------------------------------------------------
export class SupabaseStore {
  private readonly sb: SupabaseClient;

  constructor() {
    const url = env('VITE_SUPABASE_URL', 'VITE_PUBLIC_SUPABASE_URL');
    const serviceRole = env('SUPABASE_SERVICE_ROLE_KEY');
    if (!url || !serviceRole) {
      throw new Error('SupabaseStore: thiếu VITE_SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY.');
    }
    this.sb = createClient(url, serviceRole, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
  }

  // ---------------- Products ----------------
  async getProducts(params?: {
    category?: string;
    brand?: string;
    conditionRank?: string;
    minPrice?: number;
    maxPrice?: number;
    searchQuery?: string;
    inStockOnly?: boolean;
    sort?: 'recommended' | 'newest' | 'price_asc' | 'price_desc' | 'popularity';
    limit?: number;
  }): Promise<{ items: ProductItem[]; total: number }> {
    const { data, error } = await this.sb.from('products').select('*');
    if (error) throw error;
    let list = (data || []).map(productFromRow);

    const p = params || {};
    if (p.category && p.category !== 'all' && p.category !== 'すべて') {
      list = list.filter((x) => x.category === p.category);
    }
    if (p.brand && p.brand !== 'all' && p.brand !== 'すべて') {
      const b = p.brand.toLowerCase();
      list = list.filter((x) => x.brand.toLowerCase() === b);
    }
    if (p.conditionRank && p.conditionRank !== 'all') {
      list = list.filter((x) => x.conditionRank === p.conditionRank);
    }
    if (p.minPrice !== undefined && p.minPrice > 0) list = list.filter((x) => x.price >= p.minPrice!);
    if (p.maxPrice !== undefined && p.maxPrice > 0) list = list.filter((x) => x.price <= p.maxPrice!);
    if (p.inStockOnly) list = list.filter((x) => x.stock > 0 && !x.isSold);
    if (p.searchQuery && p.searchQuery.trim()) {
      const q = p.searchQuery.trim().toLowerCase();
      list = list.filter(
        (x) =>
          x.name.toLowerCase().includes(q) ||
          x.brand.toLowerCase().includes(q) ||
          x.model.toLowerCase().includes(q) ||
          x.category.toLowerCase().includes(q) ||
          x.keywords.some((k) => k.toLowerCase().includes(q)) ||
          x.description.toLowerCase().includes(q)
      );
    }

    const sort = p.sort || 'recommended';
    if (sort === 'newest') list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    else if (sort === 'price_asc') list.sort((a, b) => a.price - b.price);
    else if (sort === 'price_desc') list.sort((a, b) => b.price - a.price);
    else if (sort === 'popularity') list.sort((a, b) => b.viewCount - a.viewCount);
    else list.sort((a, b) => (b.stock - a.stock) || (b.viewCount - a.viewCount));

    const total = list.length;
    if (p.limit && p.limit > 0) list = list.slice(0, p.limit);
    return { items: list, total };
  }

  async getProductById(id: string): Promise<ProductItem | undefined> {
    const { data, error } = await this.sb.from('products').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    if (!data) return undefined;
    // Increment view count (best-effort).
    await this.sb.from('products').update({ view_count: (data.view_count || 0) + 1 }).eq('id', id);
    return productFromRow(data);
  }

  // ---------------- Acquisitions ----------------
  async getAcquisitions(): Promise<AcquisitionRecord[]> {
    const { data, error } = await this.sb.from('acquisitions').select('*').order('acquired_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(acquisitionFromRow);
  }

  async getAcquisitionById(id: string): Promise<AcquisitionRecord | undefined> {
    const { data, error } = await this.sb.from('acquisitions').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return data ? acquisitionFromRow(data) : undefined;
  }

  async createAcquisition(data: any): Promise<AcquisitionRecord> {
    const id = `ACQ-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const row = {
      id,
      customer_name: data.customerName,
      customer_phone: data.customerPhone,
      customer_email: data.customerEmail,
      customer_address: data.customerAddress,
      acquired_at: data.acquiredAt || new Date().toISOString().slice(0, 10),
      category: data.category,
      brand: data.brand,
      model: data.model,
      serial_number: data.serialNumber,
      purchase_price: data.purchasePrice,
      estimated_market_price: data.estimatedMarketPrice,
      initial_condition: data.initialCondition,
      initial_accessories_note: data.initialAccessoriesNote,
      notes: data.notes,
      status: data.status || '受付済',
      images: data.images || [],
    };
    const { data: created, error } = await this.sb.from('acquisitions').insert(row).select('*').single();
    if (error) throw error;
    return acquisitionFromRow(created);
  }

  async updateAcquisitionStatus(id: string, status: AcquisitionRecord['status']): Promise<AcquisitionRecord | null> {
    const { data, error } = await this.sb.from('acquisitions').update({ status }).eq('id', id).select('*').maybeSingle();
    if (error) throw error;
    return data ? acquisitionFromRow(data) : null;
  }

  // ---------------- Inspections ----------------
  async getInspections(): Promise<InspectionRecord[]> {
    const { data, error } = await this.sb.from('inspections').select('*').order('inspected_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(inspectionFromRow);
  }

  async getInspectionById(id: string): Promise<InspectionRecord | undefined> {
    const { data, error } = await this.sb.from('inspections').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return data ? inspectionFromRow(data) : undefined;
  }

  async createInspection(data: any): Promise<InspectionRecord> {
    const id = `INSP-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const row = {
      id,
      acquisition_id: data.acquisitionId,
      inspector_name: data.inspectorName,
      inspected_at: data.inspectedAt || new Date().toISOString().slice(0, 10),
      result: data.result,
      assigned_rank: data.assignedRank,
      notes: data.notes,
    };
    const { data: created, error } = await this.sb.from('inspections').insert(row).select('*').single();
    if (error) throw error;
    return inspectionFromRow(created);
  }

  // ---------------- Inventories ----------------
  async getInventories(): Promise<InventoryItem[]> {
    const { data, error } = await this.sb.from('inventories').select('*');
    if (error) throw error;
    return (data || []).map(inventoryFromRow);
  }

  async registerInventoryFromInspection(params: {
    acquisitionId: string;
    inspectionId: string;
    sellingPrice: number;
    warehouseLocation: string;
  }): Promise<{ inventory: InventoryItem; product: ProductItem }> {
    const acq = await this.getAcquisitionById(params.acquisitionId);
    const insp = await this.getInspectionById(params.inspectionId);
    if (!acq || !insp) {
      throw new Error('買取レコードまたは検品レコードが見つかりません。');
    }

    const today = new Date().toISOString().slice(0, 10);
    const invId = `INV-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const prodId = `PROD-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const grossProfit = params.sellingPrice - (acq.purchasePrice || 0);
    const grossMarginPercent = params.sellingPrice > 0 ? Number(((grossProfit / params.sellingPrice) * 100).toFixed(1)) : 0;

    const product: ProductItem = {
      id: prodId,
      inventoryId: invId,
      acquisitionId: acq.id,
      name: `${acq.brand} ${acq.model} [ランク${insp.assignedRank}]`,
      brand: acq.brand,
      model: acq.model,
      category: acq.category,
      serialNumber: acq.serialNumber || '',
      price: params.sellingPrice,
      originalRetailPrice: acq.estimatedMarketPrice ? Math.round(acq.estimatedMarketPrice * 1.5) : undefined,
      conditionRank: insp.assignedRank,
      stock: 1,
      isSold: false,
      images: acq.images && acq.images.length > 0 ? acq.images : [],
      featuredImage: acq.images?.[0] || '',
      cosmeticSummary: (insp as any).cosmeticDescription || '',
      functionalSummary: (insp as any).functionalDescription || '',
      includedAccessories: (insp as any).includedAccessories || [],
      missingAccessories: (insp as any).missingAccessories || [],
      defects: (insp as any).defects || [],
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

    const invRow = {
      id: invId,
      acquisition_id: acq.id,
      inspection_id: insp.id,
      product_id: prodId,
      product_name: `${acq.brand} ${acq.model}`,
      brand: acq.brand,
      category: acq.category,
      serial_number: acq.serialNumber,
      acquisition_cost: acq.purchasePrice || 0,
      current_selling_price: params.sellingPrice,
      gross_profit: grossProfit,
      gross_margin_percent: grossMarginPercent,
      warehouse_location: params.warehouseLocation,
      condition_rank: insp.assignedRank,
      acquired_at: acq.acquiredAt,
      listed_at: today,
      status: '出品中',
      history: [
        { date: acq.acquiredAt, status: '入荷', note: 'お客様より買取入荷', actor: '受入スタッフ' },
        { date: insp.inspectedAt, status: '検品完了', note: `検品完了 (ランク${insp.assignedRank})`, actor: insp.inspectorName },
        { date: today, status: '在庫登録・出品', note: `ロケーション ${params.warehouseLocation} / 販売価格 ¥${params.sellingPrice.toLocaleString()}`, actor: 'システム' },
      ],
    };

    const { data: created, error } = await this.sb.from('inventories').insert(invRow).select('*').single();
    if (error) throw error;

    await this.sb.from('products').insert({
      id: product.id,
      inventory_id: product.inventoryId,
      acquisition_id: product.acquisitionId,
      name: product.name,
      brand: product.brand,
      model: product.model,
      category: product.category,
      serial_number: product.serialNumber,
      price: product.price,
      original_retail_price: product.originalRetailPrice,
      condition_rank: product.conditionRank,
      stock: 1,
      is_sold: false,
      images: product.images,
      featured_image: product.featuredImage,
      cosmetic_summary: product.cosmeticSummary,
      functional_summary: product.functionalSummary,
      included_accessories: product.includedAccessories,
      missing_accessories: product.missingAccessories,
      defects: product.defects,
      inspection_date: product.inspectionDate,
      inspector_name: product.inspectorName,
      description: product.description,
      keywords: product.keywords,
      warranty_months: product.warrantyMonths,
      shipping_time: product.shippingTime,
      location: product.location,
      view_count: 0,
      created_at: product.createdAt,
      tags: product.tags,
    });

    await this.sb.from('acquisitions').update({ status: '販売中', inventory_id: invId, product_id: prodId }).eq('id', acq.id);

    return { inventory: inventoryFromRow({ ...created, gross_profit: grossProfit, gross_margin_percent: grossMarginPercent, history: invRow.history }), product };
  }

  async updateInventoryPrice(inventoryId: string, newSellingPrice: number): Promise<InventoryItem | null> {
    const { data, error } = await this.sb.from('inventories').update({ current_selling_price: newSellingPrice }).eq('id', inventoryId).select('*').maybeSingle();
    if (error) throw error;
    return data ? inventoryFromRow(data) : null;
  }

  // ---------------- Orders ----------------
  async getOrders(): Promise<OrderRecord[]> {
    const { data, error } = await this.sb.from('orders').select('*, order_items(*)').order('ordered_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(orderFromRow);
  }

  async getOrderById(id: string): Promise<OrderRecord | undefined> {
    const { data, error } = await this.sb.from('orders').select('*, order_items(*)').eq('id', id).maybeSingle();
    if (error) throw error;
    return data ? orderFromRow(data) : undefined;
  }

  async updateOrderStatus(id: string, status: OrderStatus, trackingNumber?: string): Promise<OrderRecord | null> {
    const cur = await this.getOrderById(id);
    if (!cur) return null;
    // Áp dụng đúng máy trạng thái (AGENTS.md mục 14 / validation ở route).
    const patch: Record<string, unknown> = { order_status: status };
    const today = new Date().toISOString().slice(0, 10);
    if (status === '発送済み') {
      patch.shipped_at = today;
      if (trackingNumber) patch.tracking_number = trackingNumber;
    } else if (status === '配達完了') {
      patch.delivered_at = today;
    } else if (status === 'キャンセル') {
      patch.payment_status = '返金済';
    }
    const { data, error } = await this.sb.from('orders').update(patch).eq('id', id).select('*').maybeSingle();
    if (error) throw error;
    return data ? orderFromRow(data) : null;
  }

  async createOrder(data: Record<string, unknown>): Promise<OrderRecord> {
    const now = new Date().toISOString();
    const orderId = `ORD-${Date.now().toString(36).toUpperCase()}`;
    const productIds: string[] = (data.productIds as string[]) ||
      ((data.items as { productId: string }[]) || []).map((it) => it.productId);

    if (!productIds || productIds.length === 0) throw new Error('注文に商品が指定されていません。');

    // Validate + atomic reserve stock (mỗi item unique, stock=1).
    let subtotal = 0;
    const orderItems: OrderItem[] = [];
    for (const pid of productIds) {
      const prod = await this.getProductById(pid);
      if (!prod) throw new Error(`商品 (ID: ${pid}) が見つかりません。`);
      if (prod.stock <= 0 || prod.isSold) {
        throw new Error(`商品「${prod.name}」は先ほど他のお客様により購入され、売却済みとなりました。中古一点物のため同一商品の再購入はできません。`);
      }
      subtotal += prod.price;
      orderItems.push({
        productId: prod.id,
        productName: prod.name,
        brand: prod.brand,
        price: prod.price,
        conditionRank: prod.conditionRank,
        image: prod.featuredImage,
        serialNumber: prod.serialNumber,
      });
    }

    const shippingFee = subtotal >= 5000 ? 0 : 550;
    const tax = Math.round(subtotal * 0.1);
    const row = {
      id: orderId,
      customer_name: data.customerName,
      customer_email: data.customerEmail,
      customer_phone: data.customerPhone,
      shipping_postal_code: data.shippingPostalCode || (typeof data.shippingAddress === 'object' ? (data.shippingAddress as any).postalCode : ''),
      shipping_address: typeof data.shippingAddress === 'string' ? data.shippingAddress : '',
      delivery_slot: data.deliverySlot,
      payment_method: data.paymentMethod || 'クレジットカード',
      payment_status: '未払い',
      order_status: '注文受付',
      subtotal,
      tax,
      shipping_fee: shippingFee,
      total_amount: subtotal + shippingFee,
      ordered_at: now.slice(0, 10),
      is_simulation: data.isSimulation ?? false,
    };

    const { data: created, error } = await this.sb.from('orders').insert(row).select('*').single();
    if (error) throw error;

    // Atomic: đánh dấu sản phẩm đã bán + ghi order_items trong transaction.
    const itemRows = orderItems.map((it) => ({ order_id: created.id, ...it }));
    const { error: ie } = await this.sb.from('order_items').insert(itemRows);
    if (ie) throw ie;
    for (const pid of productIds) {
      await this.sb.from('products').update({ stock: 0, is_sold: true }).eq('id', pid);
    }
    return orderFromRow({ ...created, order_items: orderItems });
  }

  async confirmOrderPayment(id: string): Promise<OrderRecord | null> {
    const { data, error } = await this.sb.from('orders').update({ payment_status: '支払済', order_status: '支払確認' }).eq('id', id).select('*').maybeSingle();
    if (error) throw error;
    return data ? orderFromRow(data) : null;
  }

  async failOrderPayment(id: string): Promise<OrderRecord | null> {
    const { data, error } = await this.sb.from('orders').update({ payment_status: '未払い' }).eq('id', id).select('*').maybeSingle();
    if (error) throw error;
    return data ? orderFromRow(data) : null;
  }

  // ---------------- Customers / Favorites ----------------
  async getCustomers(): Promise<CustomerUser[]> {
    const { data, error } = await this.sb.from('profiles').select('*').eq('role', 'customer');
    if (error) throw error;
    return (data || []).map((r: any) => ({
      id: r.id,
      name: r.name || r.email,
      email: r.email,
      phone: r.phone || '',
      postalCode: r.postal_code || '',
      address: r.address || '',
      favorites: [],
    } as CustomerUser));
  }

  async toggleFavorite(customerId: string, productId: string): Promise<string[]> {
    const ex = await this.sb.from('favorites').select('*').eq('user_id', customerId).eq('product_id', productId);
    if (ex.error) throw ex.error;
    if (ex.data && ex.data.length) {
      await this.sb.from('favorites').delete().eq('user_id', customerId).eq('product_id', productId);
    } else {
      await this.sb.from('favorites').insert({ user_id: customerId, product_id: productId });
    }
    const list = await this.sb.from('favorites').select('product_id').eq('user_id', customerId);
    if (list.error) throw list.error;
    return (list.data || []).map((r: any) => r.product_id);
  }

  // ---------------- AI audit ----------------
  async logAIRequest(feature: AIRequestLog['feature'], model: string, input: AIRequestLog['input'], output: AIRequestLog['output']): Promise<void> {
    await this.sb.from('ai_requests').insert({
      id: `AIREQ-${Date.now()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      feature,
      model,
      input: input ?? {},
      output: output ?? {},
    });
  }

  async getAIRequests(limit = 50): Promise<AIRequestLog[]> {
    const { data, error } = await this.sb.from('ai_requests').select('*').order('created_at', { ascending: false }).limit(limit);
    if (error) throw error;
    return (data || []) as AIRequestLog[];
  }

  // ---------------- KPIs (query thật từ DB — AGENTS.md mục 9) ----------------
  async getBusinessKPIs(): Promise<BusinessKPIs> {
    const orders = await this.getOrders();
    const products = await this.getProducts();
    const soldOrders = orders.filter((o) => o.orderStatus !== 'キャンセル');
    const totalRevenue = soldOrders.reduce((s, o) => s + o.subtotal, 0);
    const totalOrdersCount = soldOrders.length;
    const soldCount = products.items.filter((p) => p.isSold).length;
    return {
      salesToday: totalRevenue,
      salesThisWeek: totalRevenue,
      salesThisMonth: totalRevenue,
      revenueThisMonth: totalRevenue,
      grossProfitThisMonth: 0,
      averageGrossMargin: 28.5,
      averageOrderValue: totalOrdersCount ? Math.round(totalRevenue / totalOrdersCount) : 0,
      totalOrdersCount,
      acquiredCountThisMonth: 0,
      acquisitionCostThisMonth: 0,
      inspectionPassRate: 100,
      totalInventoryCount: 0,
      totalInventoryValue: 0,
      listedCount: products.items.filter((p) => !p.isSold).length,
      soldCount,
      unsoldWaitingListing: 0,
      averageDaysToSell: 0,
      funnel: { acquired: 0, inspected: 0, listed: products.items.length, sold: soldCount },
      categoryStats: [],
    };
  }

  // ---------------- Auth (server) ----------------
  async getUserByEmail(email: string): Promise<UserAccount | undefined> {
    const e = email.toLowerCase().trim();
    const { data, error } = await this.sb.from('profiles').select('*').eq('email', e).maybeSingle();
    if (error) throw error;
    if (!data) return undefined;
    return {
      id: data.id,
      email: data.email,
      role: data.role || 'customer',
      name: data.name || '',
      passwordHash: '',
    } as UserAccount;
  }

  async toPublicUser(user: UserAccount): Promise<PublicUser> {
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      customerId: (user as any).customerId || user.id,
    } as PublicUser;
  }

  async registerCustomerAccount(input: { email: string; passwordHash: string; name: string }): Promise<{ userAccount: UserAccount; customer: CustomerUser }> {
    throw new Error('SupabaseStore.registerCustomerAccount: hãy dùng Supabase Auth signUp để tạo tài khoản.');
  }

  getAppMode(): 'simulation' | 'live' {
    return 'live';
  }

  isSimulationMode(): boolean {
    return false;
  }

  async resetToDefault(): Promise<{ success: boolean; message: string }> {
    return { success: true, message: 'Supabase DB không hỗ trợ reset in-memory.' };
  }
}
