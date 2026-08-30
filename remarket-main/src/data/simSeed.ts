/**
 * Re:Market — Simulation Seed Data (riêng biệt với dữ liệu thật)
 *
 * Dùng cho APP_MODE=simulation: bộ dữ liệu giả, nhỏ gọn, rõ ràng là "DEMO",
 * KHÔNG trộn chung với dbStore thật. Khi chuyển live chạy dữ liệu thật (dbStore),
 * và toàn bộ thao tác trong simulation có thể purge mà không đụng dữ liệu thật.
 */

import { SeedData } from './seedData';
import {
  ProductItem,
  AcquisitionRecord,
  InventoryItem,
  InspectionRecord,
  OrderRecord,
  CustomerUser,
  ConditionRank,
  ProductCategory,
  UserAccount,
} from '../types';
import { hashPassword } from '../../lib/security/hash';

const DEMO_CATEGORIES: ProductCategory[] = ['カメラ', 'パソコン', 'ゲーム'];

const DEMO_ITEMS: {
  brand: string;
  model: string;
  category: ProductCategory;
  price: number;
  cost: number;
  rank: ConditionRank;
}[] = [
  { brand: 'SIM Canon', model: 'EOS R6 (DEMO)', category: 'カメラ', price: 168000, cost: 118000, rank: 'A' },
  { brand: 'SIM Sony', model: 'α7 III (DEMO)', category: 'カメラ', price: 148000, cost: 103000, rank: 'B' },
  { brand: 'SIM Nikon', model: 'Z6 II (DEMO)', category: 'カメラ', price: 122000, cost: 84000, rank: 'B' },
  { brand: 'SIM Apple', model: 'MacBook Air M2 (DEMO)', category: 'パソコン', price: 98000, cost: 66000, rank: 'A' },
  { brand: 'SIM Dell', model: 'XPS 15 (DEMO)', category: 'パソコン', price: 88000, cost: 59000, rank: 'C' },
  { brand: 'SIM Lenovo', model: 'ThinkPad X1 (DEMO)', category: 'パソコン', price: 72000, cost: 48000, rank: 'B' },
  { brand: 'SIM Nintendo', model: 'Switch OLED (DEMO)', category: 'ゲーム', price: 26000, cost: 18000, rank: 'A' },
  { brand: 'SIM Sony PS', model: 'PS5 (DEMO)', category: 'ゲーム', price: 44000, cost: 31000, rank: 'B' },
  { brand: 'SIM Steam', model: 'Deck 512GB (DEMO)', category: 'ゲーム', price: 39000, cost: 27000, rank: 'C' },
];

export function generateSimulationSeed(): SeedData {
  const today = '2026-08-30';
  const products: ProductItem[] = [];
  const acquisitions: AcquisitionRecord[] = [];
  const inventories: InventoryItem[] = [];
  const inspections: InspectionRecord[] = [];
  const orders: OrderRecord[] = [];

  DEMO_ITEMS.forEach((item, i) => {
    const idx = String(i + 1).padStart(4, '0');
    const acq: AcquisitionRecord = {
      id: `SIM-ACQ-${idx}`,
      customerName: `デモ顧客 ${i + 1}`,
      customerPhone: '03-0000-0000',
      customerEmail: `demo${i + 1}@example.com`,
      acquiredAt: today,
      category: item.category,
      brand: item.brand,
      model: item.model,
      serialNumber: `SIM-SN-${1000 + i}`,
      purchasePrice: item.cost,
      estimatedMarketPrice: Math.round(item.price * 1.3),
      initialCondition: item.rank,
      status: '販売中',
      images: [],
    };
    const insp: InspectionRecord = {
      id: `SIM-INSP-${idx}`,
      acquisitionId: acq.id,
      inspectorName: 'デモ検品担当',
      inspectedAt: today,
      exterior: { scratches: '微小', dirt: 'なし', dents: 'なし', discoloration: 'なし', damage: 'なし' },
      functions: {
        power: '良好',
        display: 'ドット抜けなし・発色良好',
        buttons: '全ボタン正常動作',
        battery: '通常劣化(70-84%)',
        connectivity: 'Wi-Fi/Bluetooth/端子正常',
        mainFunctions: '全機能正常確認済',
      },
      includedAccessories: ['付属品一式（デモ）'],
      missingAccessories: [],
      defects: ['シミュレーションデータのみ'],
      cosmeticDescription: `【デモ】${item.rank}ランクのシナリオデータです。`,
      functionalDescription: '【デモ】全機能確認済みのシナリオデータです。',
      result: 'Pass',
      assignedRank: item.rank,
      staffComments: 'SIMULATION MODE のみに存在するデータ',
    };
    const inv: InventoryItem = {
      id: `SIM-INV-${idx}`,
      acquisitionId: acq.id,
      productId: `SIM-PROD-${idx}`,
      serialNumber: acq.serialNumber,
      acquisitionCost: item.cost,
      currentSellingPrice: item.price,
      grossProfit: item.price - item.cost,
      grossMarginPercent: Number((((item.price - item.cost) / item.price) * 100).toFixed(1)),
      warehouseLocation: 'SIM-センタ 00-00',
      status: '出品中',
      conditionRank: item.rank,
      acquiredAt: today,
      listedAt: today,
      history: [{ date: today, status: '出品中', note: '【デモ】シミュレーション登録', actor: 'システム' }],
    };
    const prod: ProductItem = {
      id: `SIM-PROD-${idx}`,
      inventoryId: inv.id,
      acquisitionId: acq.id,
      name: `${item.brand} ${item.model}`,
      brand: item.brand,
      model: item.model,
      category: item.category,
      serialNumber: acq.serialNumber,
      price: item.price,
      originalRetailPrice: item.price * 2,
      conditionRank: item.rank,
      stock: i % 4 === 0 ? 0 : 1,
      isSold: i % 4 === 0,
      images: [],
      featuredImage: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
      cosmeticSummary: `【デモ】${item.rank}ランクシナリオ`,
      functionalSummary: '【デモ】全機能正常',
      includedAccessories: ['付属品一式（デモ）'],
      missingAccessories: [],
      defects: ['シミュレーション'],
      inspectionDate: today,
      inspectorName: 'デモ検品担当',
      description: '【SIMULATION DEMO】これはシミュレーションモード専用のデモ商品データです。ライブモードでは表示されません。',
      keywords: [item.brand, item.model, item.category, 'デモ'],
      warrantyMonths: 3,
      shippingTime: '即日発送',
      location: 'SIM-センタ 00-00',
      viewCount: 5,
      createdAt: today,
      tags: ['デモ', 'SIM'],
    };

    products.push(prod);
    acquisitions.push(acq);
    inventories.push(inv);
    inspections.push(insp);

    // Một vài order đã "bán" cho thấy funell
    if (i === 0) {
      orders.push({
        id: `SIM-ORD-${idx}`,
        customerName: 'デモ顧客 A',
        customerEmail: 'a@example.com',
        customerPhone: '090',
        shippingPostalCode: '100-0001',
        shippingAddress: '東京都 千代田区 デモ 1-1',
        deliverySlot: '午前中',
        paymentMethod: 'クレジットカード',
        paymentStatus: '支払済',
        orderStatus: '配達完了',
        items: [
          {
            productId: prod.id,
            productName: prod.name,
            brand: prod.brand,
            price: prod.price,
            conditionRank: prod.conditionRank,
            image: prod.featuredImage,
            serialNumber: prod.serialNumber,
          },
        ],
        subtotal: prod.price,
        tax: Math.round(prod.price * 0.1),
        shippingFee: 0,
        totalAmount: prod.price + Math.round(prod.price * 0.1),
        orderedAt: today,
        trackingNumber: 'DEMO-TRK-0001',
        isSimulation: true,
      });
    }
  });

  const customerUsers: CustomerUser[] = [
    {
      id: 'CUST-0001',
      name: '田中 デモ',
      email: 'customer@remarket.jp',
      phone: '090-0000-0000',
      postalCode: '150-0001',
      address: '東京都渋谷区',
      favorites: [products[0].id, products[1].id],
    },
  ];

  const users: UserAccount[] = [
    {
      id: 'USR-CUST-0001',
      email: 'customer@remarket.jp',
      passwordHash: hashPassword('customer123'),
      role: 'customer',
      name: '田中 デモ',
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
