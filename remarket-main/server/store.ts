/**
 * Re:Market — Server-side store selection (AGENTS.md mục 3, 14)
 *
 * Server phải phục vụ ĐÚNG store theo APP_MODE:
 *   - APP_MODE=simulation → simStore (bộ dữ liệu DEMO nhỏ, prefix SIM-*)
 *   - APP_MODE=live        → db (dữ liệu thật, 192 sản phẩm)
 *
 * Toàn bộ route/API và auth phải đi qua getStore() thay vì dùng db cố định.
 *
 * Khi cấu hình Supabase (URL + service role) + APP_MODE=live, dùng SupabaseStore
 * làm DB thật. Ngược lại dùng AsyncInMemoryStore bọc DatabaseStore để mọi
 * route/`PaymentService`/auth gọi CHUNG một bề mặt **async** mà không đổi logic
 * nghiệp vụ (PGIN: business logic không biết store cụ thể nào — AGENTS.md 14.2).
 */

import { DatabaseStore, db } from '../src/data/dbStore';
import { simStore } from '../src/data/simStore';
import { isSimulationMode } from '../lib/config/app-mode';
import {
  AIRequestLog,
  AcquisitionRecord,
  BusinessKPIs,
  CustomerUser,
  InspectionRecord,
  InventoryItem,
  OrderRecord,
  OrderStatus,
  ProductItem,
  PublicUser,
  UserAccount,
} from '../src/types';
import { SupabaseStore, isSupabaseStoreEnabled } from '../src/data/supabaseStore';

/**
 * Bề mặt store SERVER-SIDE. Tất cả phương thức async (PostgREST / wrapper).
 * Return shape khớp DatabaseStore để client không đổi.
 */
export interface ServerStore {
  getAppMode(): 'simulation' | 'live';
  isSimulationMode(): boolean;
  getProducts(params?: {
    category?: string;
    brand?: string;
    conditionRank?: string;
    minPrice?: number;
    maxPrice?: number;
    searchQuery?: string;
    inStockOnly?: boolean;
    sort?: string;
    limit?: number;
  }): Promise<{ items: ProductItem[]; total: number }>;
  getProductById(id: string): Promise<ProductItem | undefined>;
  getAcquisitions(): Promise<AcquisitionRecord[]>;
  getAcquisitionById(id: string): Promise<AcquisitionRecord | undefined>;
  createAcquisition(data: any): Promise<AcquisitionRecord>;
  updateAcquisitionStatus(id: string, status: AcquisitionRecord['status']): Promise<AcquisitionRecord | null>;
  getInspections(): Promise<InspectionRecord[]>;
  getInspectionById(id: string): Promise<InspectionRecord | undefined>;
  createInspection(data: any): Promise<InspectionRecord>;
  getInventories(): Promise<InventoryItem[]>;
  registerInventoryFromInspection(params: {
    acquisitionId: string;
    inspectionId: string;
    sellingPrice: number;
    warehouseLocation: string;
  }): Promise<{ inventory: InventoryItem; product: ProductItem }>;
  updateInventoryPrice(inventoryId: string, newSellingPrice: number): Promise<InventoryItem | null>;
  getOrders(): Promise<OrderRecord[]>;
  getOrderById(id: string): Promise<OrderRecord | undefined>;
  updateOrderStatus(id: string, status: OrderStatus, trackingNumber?: string): Promise<OrderRecord | null>;
  createOrder(data: Record<string, unknown>): Promise<OrderRecord>;
  confirmOrderPayment(id: string): Promise<OrderRecord | null>;
  failOrderPayment(id: string): Promise<OrderRecord | null>;
  getCustomers(): Promise<CustomerUser[]>;
  toggleFavorite(customerId: string, productId: string): Promise<string[]>;
  logAIRequest(feature: AIRequestLog['feature'], model: string, input: AIRequestLog['input'], output: AIRequestLog['output']): Promise<void>;
  getAIRequests(limit?: number): Promise<AIRequestLog[]>;
  getBusinessKPIs(): Promise<BusinessKPIs>;
  getUserByEmail(email: string): Promise<UserAccount | undefined>;
  toPublicUser(user: UserAccount): Promise<PublicUser>;
  registerCustomerAccount(input: { email: string; passwordHash: string; name: string }): Promise<{ userAccount: UserAccount; customer: CustomerUser }>;
  resetToDefault(): Promise<{ success: boolean; message: string }>;
}

/**
 * Bọc một DatabaseStore (sync trong-memory) thành ServerStore async.
 * Mọi phương thức delegate xuống store và bọc trong Promise (auto-awaited).
 * Không thay đổi dữ liệu/return shape — giữ nguyên cho client.
 */
export class AsyncInMemoryStore implements ServerStore {
  constructor(private readonly inner: DatabaseStore) {}

  getAppMode(): 'simulation' | 'live' {
    return this.inner.getAppMode();
  }
  isSimulationMode(): boolean {
    return this.inner.isSimulationMode();
  }
  getProducts(params?: Parameters<ServerStore['getProducts']>[0]) {
    return Promise.resolve(this.inner.getProducts(params as any));
  }
  getProductById(id: string): Promise<ProductItem | undefined> {
    return Promise.resolve(this.inner.getProductById(id));
  }
  getAcquisitions(): Promise<AcquisitionRecord[]> {
    return Promise.resolve(this.inner.getAcquisitions());
  }
  getAcquisitionById(id: string): Promise<AcquisitionRecord | undefined> {
    return Promise.resolve(this.inner.getAcquisitionById(id));
  }
  createAcquisition(data: any): Promise<AcquisitionRecord> {
    return Promise.resolve(this.inner.createAcquisition(data));
  }
  updateAcquisitionStatus(id: string, status: AcquisitionRecord['status']): Promise<AcquisitionRecord | null> {
    return Promise.resolve(this.inner.updateAcquisitionStatus(id, status));
  }
  getInspections(): Promise<InspectionRecord[]> {
    return Promise.resolve(this.inner.getInspections());
  }
  getInspectionById(id: string): Promise<InspectionRecord | undefined> {
    return Promise.resolve(this.inner.getInspectionById(id));
  }
  createInspection(data: any): Promise<InspectionRecord> {
    return Promise.resolve(this.inner.createInspection(data));
  }
  getInventories(): Promise<InventoryItem[]> {
    return Promise.resolve(this.inner.getInventories());
  }
  registerInventoryFromInspection(params: {
    acquisitionId: string;
    inspectionId: string;
    sellingPrice: number;
    warehouseLocation: string;
  }): Promise<{ inventory: InventoryItem; product: ProductItem }> {
    return Promise.resolve(this.inner.registerInventoryFromInspection(params));
  }
  updateInventoryPrice(inventoryId: string, newSellingPrice: number): Promise<InventoryItem | null> {
    return Promise.resolve(this.inner.updateInventoryPrice(inventoryId, newSellingPrice));
  }
  getOrders(): Promise<OrderRecord[]> {
    return Promise.resolve(this.inner.getOrders());
  }
  getOrderById(id: string): Promise<OrderRecord | undefined> {
    return Promise.resolve(this.inner.getOrderById(id));
  }
  updateOrderStatus(id: string, status: OrderStatus, trackingNumber?: string): Promise<OrderRecord | null> {
    return Promise.resolve(this.inner.updateOrderStatus(id, status, trackingNumber));
  }
  createOrder(data: Record<string, unknown>): Promise<OrderRecord> {
    return Promise.resolve(this.inner.createOrder(data as any));
  }
  confirmOrderPayment(id: string): Promise<OrderRecord | null> {
    return Promise.resolve(this.inner.confirmOrderPayment(id));
  }
  failOrderPayment(id: string): Promise<OrderRecord | null> {
    return Promise.resolve(this.inner.failOrderPayment(id));
  }
  getCustomers(): Promise<CustomerUser[]> {
    return Promise.resolve(this.inner.getCustomers());
  }
  toggleFavorite(customerId: string, productId: string): Promise<string[]> {
    return Promise.resolve(this.inner.toggleFavorite(customerId, productId));
  }
  logAIRequest(feature: AIRequestLog['feature'], model: string, input: AIRequestLog['input'], output: AIRequestLog['output']): Promise<void> {
    this.inner.logAIRequest(feature, model, input, output);
    return Promise.resolve();
  }
  getAIRequests(limit = 50): Promise<AIRequestLog[]> {
    return Promise.resolve(this.inner.getAIRequests(limit));
  }
  getBusinessKPIs(): Promise<BusinessKPIs> {
    return Promise.resolve(this.inner.getBusinessKPIs());
  }
  getUserByEmail(email: string): Promise<UserAccount | undefined> {
    return Promise.resolve(this.inner.getUserByEmail(email));
  }
  toPublicUser(user: UserAccount): Promise<PublicUser> {
    return Promise.resolve(this.inner.toPublicUser(user));
  }
  registerCustomerAccount(input: { email: string; passwordHash: string; name: string }): Promise<{ userAccount: UserAccount; customer: CustomerUser }> {
    return Promise.resolve(this.inner.registerCustomerAccount(input));
  }
  resetToDefault(): Promise<{ success: boolean; message: string }> {
    return Promise.resolve(this.inner.resetToDefault());
  }
}

let cachedStore: ServerStore | undefined;

/**
 * Trả store cho server dựa trên APP_MODE + cấu hình Supabase.
 * Kết quả được memo hoá (không khởi tạo lại store mỗi request).
 */
export function getStore(): ServerStore {
  if (cachedStore) return cachedStore;

  const simulation = isSimulationMode();
  if (simulation) {
    cachedStore = new AsyncInMemoryStore(simStore);
    return cachedStore;
  }

  if (isSupabaseStoreEnabled()) {
    cachedStore = new SupabaseStore();
    return cachedStore;
  }

  cachedStore = new AsyncInMemoryStore(db);
  return cachedStore;
}

/** Reset cache (dùng khi thay đổi APP_MODE trong test). */
export function resetStoreCache(): void {
  cachedStore = undefined;
}
