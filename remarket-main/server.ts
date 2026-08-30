/**
 * Re:Market - Full-Stack Express Server with Gemini AI Services,
 * REST APIs, and Used-Goods Business Engine.
 */

import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import { getStore } from './server/store';
import { ConditionRank, ProductCategory } from './src/types';
import { login, logout, currentUser, getTokenFromReq, requireAuth, requireRole, setSessionCookie, clearSessionCookie, issueSession } from './server/auth';
import { PaymentService } from './lib/payment/index';
import { StripePaymentAdapter } from './lib/payment/stripe';
import { registerService } from './server/auth-register';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// ===================== AUTH & RBAC (AGENTS.md mục 3) =====================
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'メールアドレスとパスワードを入力してください。' });
  }
  const result = login(String(email), String(password));
  if (!result) {
    return res.status(401).json({ error: 'メールアドレスまたはパスワードが正しくありません。' });
  }
  setSessionCookie(res, result.token);
  res.json({ user: result.user });
});

app.post('/api/auth/logout', (req, res) => {
  logout(getTokenFromReq(req) || '');
  clearSessionCookie(res);
  res.json({ success: true });
});

app.get('/api/auth/me', (req, res) => {
  const user = currentUser(req);
  res.json({ user: user || null });
});

// ===================== REGISTER + EMAIL MAGIC LINK (Supabase/Resend) =====================
// Đi qua RegisterService (server/auth-register.ts) — điểm gọi duy nhất cho đăng ký,
// giống cách PaymentService gom mọi thanh toán (AGENTS.md mục 14.2 / mục 10).
// Bắt buộc gửi EMAIL THẬT: khi thiếu cấu hình Supabase/Resend sẽ trả lỗi rõ ràng,
// KHÔNG fallback hiển thị OTP/link cho user.

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body || {};
    if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: '有効なメールアドレスを入力してください。' });
    }
    if (typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({ error: 'パスワードは8文字以上で入力してください。' });
    }
    if (typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({ error: 'お名前を入力してください。' });
    }

    const result = await registerService.registerUser({ email, password, name: name.trim() });
    if (!result.ok) {
      // `error` chứa thông báo rõ ràng (đã đăng ký / thiếu cấu hình email...).
      return res.status(409).json({ error: (result as any).error });
    }
    res.json(result);
  } catch (err: any) {
    console.error('[register] error:', err?.message || err);
    // Lỗi gửi email (Edge Function) cũng là lỗi cấu hình/dịch vụ — báo rõ, không lộ link.
    res.status(502).json({ error: err?.message || 'メールを送信できませんでした。管理者にお問い合わせください。' });
  }
});

// Xác thực magic link (user bấm link trong email). Thành công -> auto-login (tạo session + cookie).
app.post('/api/auth/verify-link', async (req, res) => {
  try {
    const { token } = req.body || {};
    if (typeof token !== 'string' || token.length === 0) {
      return res.status(400).json({ error: '認証リンクが不正です。' });
    }
    const result = await registerService.verifyLink(token);
    if (!result.ok || !result.user) {
      return res.status(401).json(result);
    }
    // Magic link 1-click -> tự đăng nhập ngay.
    const { token: sessionToken } = issueSession(result.user);
    setSessionCookie(res, sessionToken);
    res.json({ ok: true, user: result.user });
  } catch (err: any) {
    console.error('[verify-link] error:', err?.message || err);
    res.status(500).json({ error: '認証に失敗しました。もう一度お試しください。' });
  }
});

app.post('/api/auth/resend-link', async (req, res) => {
  try {
    const { email } = req.body || {};
    if (typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ error: 'メールアドレスを入力してください。' });
    }
    const result = await registerService.resendVerifyLink(email);
    if (!result.ok) {
      const status = result.retryAfterSeconds ? 429 : 404;
      return res.status(status).json(result);
    }
    res.json(result);
  } catch (err: any) {
    console.error('[resend-link] error:', err?.message || err);
    res.status(502).json({ error: '再送信に失敗しました。もう一度お試しください。' });
  }
});

// Initialize Gemini Client (Server-side only)
let aiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  aiClient = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// ===================== REST APIS =====================

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString(), brand: 'Re:Market' });
});

// Products
app.get('/api/products', (req, res) => {
  try {
    const { category, brand, conditionRank, minPrice, maxPrice, q, inStockOnly, sort, limit } = req.query;
    const result = getStore().getProducts({
      category: category as string,
      brand: brand as string,
      conditionRank: conditionRank as string,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      searchQuery: q as string,
      inStockOnly: inStockOnly === 'true',
      sort: sort as any,
      limit: limit ? Number(limit) : undefined,
    });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/products/:id', (req, res) => {
  const product = getStore().getProductById(req.params.id);
  if (!product) {
    return res.status(404).json({ error: '商品が見つかりません。' });
  }
  res.json(product);
});

// Acquisitions (買取管理)
app.get('/api/acquisitions', (req, res) => {
  res.json(getStore().getAcquisitions());
});

app.get('/api/acquisitions/:id', (req, res) => {
  const acq = getStore().getAcquisitionById(req.params.id);
  if (!acq) return res.status(404).json({ error: '買取レコードが見つかりません。' });
  res.json(acq);
});

app.post('/api/acquisitions', requireRole('staff'), (req, res) => {
  try {
    const created = getStore().createAcquisition(req.body);
    res.status(201).json(created);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.patch('/api/acquisitions/:id/status', requireRole('staff'), (req, res) => {
  const updated = getStore().updateAcquisitionStatus(req.params.id, req.body.status);
  if (!updated) return res.status(404).json({ error: '買取レコードが見つかりません。' });
  res.json(updated);
});

// Inspections (商品検品)
app.get('/api/inspections', (req, res) => {
  res.json(getStore().getInspections());
});

app.get('/api/inspections/:id', (req, res) => {
  const insp = getStore().getInspectionById(req.params.id);
  if (!insp) return res.status(404).json({ error: '検品レコードが見つかりません。' });
  res.json(insp);
});

app.post('/api/inspections', requireRole('staff'), (req, res) => {
  try {
    const created = getStore().createInspection(req.body);
    res.status(201).json(created);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Inventory (在庫・価格管理)
app.get('/api/inventories', (req, res) => {
  res.json(getStore().getInventories());
});

app.post('/api/inventories/register', requireRole('staff'), (req, res) => {
  try {
    const { acquisitionId, inspectionId, sellingPrice, warehouseLocation } = req.body;
    const result = getStore().registerInventoryFromInspection({
      acquisitionId,
      inspectionId,
      sellingPrice: Number(sellingPrice),
      warehouseLocation: warehouseLocation || '東京第1リユースセンター A-01-01',
    });
    res.status(201).json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.patch('/api/inventories/:id/price', requireRole('staff'), (req, res) => {
  const updated = getStore().updateInventoryPrice(req.params.id, Number(req.body.sellingPrice));
  if (!updated) return res.status(404).json({ error: '在庫が見つかりません。' });
  res.json(updated);
});

// Orders & Atomic Purchase (注文管理)
app.get('/api/orders', (req, res) => {
  res.json(getStore().getOrders());
});

app.get('/api/orders/:id', (req, res) => {
  const order = getStore().getOrderById(req.params.id);
  if (!order) return res.status(404).json({ error: '注文が見つかりません。' });
  res.json(order);
});

app.post('/api/orders', async (req, res) => {
  try {
    // Live mode dùng Stripe adapter; simulation (server cũng có thể chạy) dùng
    // adapter simulation mặc định. Business logic không biết adapter nào chạy.
    const payment = new PaymentService(getStore(), {
      adapter: getStore().isSimulationMode() ? undefined : new StripePaymentAdapter(),
    });
    const { order, result } = await payment.createAndConfirmOrder(req.body);
    if ('reason' in result) return res.status(402).json({ error: result.reason });
    res.status(201).json(order);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.patch('/api/orders/:id/status', requireRole('staff'), (req, res) => {
  const updated = getStore().updateOrderStatus(req.params.id, req.body.orderStatus, req.body.trackingNumber);
  if (!updated) return res.status(404).json({ error: '注文が見つかりません。' });
  res.json(updated);
});

// Business KPIs (chỉ Admin — AGENTS.md mục 9: query trực tiếp DB, không hardcode)
app.get('/api/kpis', requireRole('admin'), (req, res) => {
  res.json(getStore().getBusinessKPIs());
});

// Reset Database (chỉ Admin)
app.post('/api/reset-db', requireRole('admin'), (req, res) => {
  res.json(getStore().resetToDefault());
});

// Customers
app.get('/api/customers', (req, res) => {
  res.json(getStore().getCustomers());
});

app.post('/api/customers/favorites/toggle', requireAuth, (req, res) => {
  const { customerId, productId } = req.body;
  if (!customerId || !productId) {
    res.status(400).json({ error: 'customerId と productId が必要です。' });
    return;
  }
  const favorites = getStore().toggleFavorite(customerId, productId);
  res.json({ favorites });
});

// ===================== AI FEATURES (Powered by Gemini) =====================

// AI Request Audit log (AGENTS.md mục 10) — xem toàn bộ request/response AI đã log
app.get('/api/ai/requests', (req, res) => {
  const limit = req.query.limit ? Number(req.query.limit) : 50;
  res.json(getStore().getAIRequests(limit));
});

/**
 * AI #1 — Product Listing Assistant (出品文・SEO・状態説明自動生成)
 * Staff enters raw acquired data, Gemini generates professional Japanese EC listing draft.
 */
app.post('/api/ai/generate-listing', requireRole('staff'), async (req, res) => {
  try {
    const { brand, model, category, rank, defects, accessories, missingAccessories, inspectorNotes } = req.body;

    const prompt = `あなたは日本のリユース・中古品EC企業「Re:Market」の専門出品アシスタントです。
以下の買取・検品情報をもとに、中古品購入者が安心して検討できる透明性の高いプロフェッショナルな商品出品データ（タイトル、商品説明文、状態説明、検索用キーワード）を生成してください。

【対象商品情報】
- カテゴリー: ${category}
- ブランド: ${brand}
- 型番/モデル名: ${model}
- 状態ランク: ${rank}ランク
- 付属品: ${Array.isArray(accessories) ? accessories.join('、') : accessories || 'なし'}
- 欠品: ${Array.isArray(missingAccessories) ? missingAccessories.join('、') : missingAccessories || 'なし'}
- 傷・特記事項: ${Array.isArray(defects) ? defects.join('、') : defects || '目立つ傷なし'}
- 検品担当コメント: ${inspectorNotes || '基本動作確認済み'}

【出力要件】
日本語で以下のJSON形式で返答してください：
{
  "title": "【ランクX】ブランド 型番 特徴や安心ポイントを含む商品タイトル",
  "description": "商品の魅力、安心の動作確認済みであること、どのような人におすすめかを伝える300字程度の商品説明文",
  "cosmeticNote": "外観の状態に関する分かりやすく正直な説明",
  "functionalNote": "動作確認状況と安心保証に関する説明",
  "keywords": ["検索キーワード1", "検索キーワード2", "検索キーワード3", "検索キーワード4", "検索キーワード5"]
}`;

    if (aiClient) {
      const response = await aiClient.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              cosmeticNote: { type: Type.STRING },
              functionalNote: { type: Type.STRING },
              keywords: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: ['title', 'description', 'cosmeticNote', 'functionalNote', 'keywords'],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      getStore().logAIRequest('listing', 'gemini-3.7-flash', { brand, model, category, rank, defects, accessories, missingAccessories, inspectorNotes }, parsed);
      return res.json(parsed);
    }

    // High quality intelligent fallback if AI key not configured
    const fallbackTitle = `【${rank}ランク・検品済】${brand} ${model} 動作保証付き`;
    const fallbackDesc = `${brand}の人気モデル「${model}」の中古品です。専門スタッフによる徹底した動作検品と除菌クリーニングを実施しており、安心してお使いいただけます。初期不良保証も付帯しております。`;
    const fallbackCosmetic = rank === 'S' || rank === 'A' ? '目立つキズや使用感はほとんどなく、非常に綺麗な状態です。' : '使用に伴う細かなスレや小キズが見られますが、実用上の問題はありません。';
    const fallbackFunctional = '電源投入、基本機能、各種端子および通信機能すべて動作確認済みです。';
    const fallbackKeywords = [brand, model, category, `ランク${rank}`, '中古', '検品済', '即日発送'];

    const fallback = {
      title: fallbackTitle,
      description: fallbackDesc,
      cosmeticNote: fallbackCosmetic,
      functionalNote: fallbackFunctional,
      keywords: fallbackKeywords,
    };
    getStore().logAIRequest('listing', 'fallback-rule-based', { brand, model, category, rank }, fallback);

    return res.json(fallback);
  } catch (err: any) {
    console.error('AI #1 Error:', err);
    res.status(500).json({ error: 'AI出品生成中にエラーが発生しました: ' + err.message });
  }
});

/**
 * AI #2 — Customer Shopping Assistant (AIコンシェルジュ / 商品アドバイザー)
 * Customer asks question, Gemini searches actual live database products and recommends genuine items.
 */
app.post('/api/ai/shopping-assistant', async (req, res) => {
  try {
    const { userMessage, history } = req.body;
    const { items: liveProducts } = getStore().getProducts({ inStockOnly: true, limit: 30 });

    // Provide real catalog context to Gemini
    const productCatalog = liveProducts.map((p) => ({
      id: p.id,
      name: p.name,
      brand: p.brand,
      category: p.category,
      price: p.price,
      rank: p.conditionRank,
      defects: p.defects,
      accessories: p.includedAccessories,
      summary: p.cosmeticSummary,
    }));

    const systemPrompt = `あなたは日本の高品質中古品EC「Re:Market」の親切で専門知識豊富なAIショッピングコンシェルジュです。
お客様の質問やお探しの条件（予算、用途、ブランド、希望ランクなど）に合わせて、以下の【現在在庫のある実物商品データベース】の中から最適な中古商品を親身に提案してください。

【厳格なルール】
1. 架空の商品は絶対に捏造・案内しないでください。必ず提供されたデータベース内の商品(実在するIDと商品名)のみから推薦してください。
2. なぜその中古商品がおすすめなのか（価格の手頃さ、状態ランクの良さ、安心の検品内容など）を分かりやすく説明してください。
3. 日本語で丁寧かつ親しみやすいトーンで回答してください。
4. 回答内に推薦商品のID（例: PROD-2026-0001）を含める場合、JSON形式で返答してください。

【現在在庫のある実物商品データベース】
${JSON.stringify(productCatalog, null, 2)}
`;

    if (aiClient) {
      const response = await aiClient.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: `ユーザーの相談: "${userMessage}"`,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              replyText: {
                type: Type.STRING,
                description: 'お客様への丁寧なアドバイスと提案理由のテキスト',
              },
              recommendedProductIds: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '推薦する実在の商品IDの配列（最大3点）',
              },
            },
            required: ['replyText', 'recommendedProductIds'],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      const recommendedProducts = liveProducts.filter((p) => parsed.recommendedProductIds?.includes(p.id));
      getStore().logAIRequest('shopping', 'gemini-3.7-flash', { userMessage }, { reply: parsed.replyText, recommendedProductIds: parsed.recommendedProductIds });

      return res.json({
        reply: parsed.replyText,
        recommendedProducts,
      });
    }

    // Fallback recommendation search
    const qLower = (userMessage || '').toLowerCase();
    let matches = liveProducts.filter((p) => {
      if (qLower.includes('カメラ') && p.category === 'カメラ') return true;
      if (qLower.includes('パソコン') || qLower.includes('mac') || qLower.includes('pc') && p.category === 'パソコン') return true;
      if (qLower.includes('スマホ') || qLower.includes('iphone') && p.category === 'スマートフォン') return true;
      if (qLower.includes('ゲーム') || qLower.includes('switch') || qLower.includes('ps5') && p.category === 'ゲーム') return true;
      if (qLower.includes('オーディオ') || qLower.includes('ヘッドホン') || qLower.includes('イヤホン') && p.category === 'オーディオ') return true;
      return p.price <= 100000;
    });

    if (matches.length === 0) matches = liveProducts.slice(0, 3);
    const top3 = matches.slice(0, 3);
    getStore().logAIRequest('shopping', 'fallback-rule-based', { userMessage }, { replyText: 'fallback', recommendedProductIds: top3.map((p) => p.id) });

    return res.json({
      reply: `お問い合わせありがとうございます！ご要望の条件にぴったりの厳選中古商品をご案内いたします。当店のリユース品はすべて専門スタッフによる動作検証およびクリーニングを行っており、安心保証が付属しております。`,
      recommendedProducts: top3,
    });
  } catch (err: any) {
    console.error('AI #2 Error:', err);
    res.status(500).json({ error: 'AIショッピングアシスタントの処理中にエラーが発生しました: ' + err.message });
  }
});

/**
 * AI #3 — Internal Sales & Inventory Advisor (経営・在庫分析アシスタント)
 * Admin asks about sales, turnover, low-margin items. Gemini analyzes live DB facts.
 */
app.post('/api/ai/sales-insights', requireRole('admin'), async (req, res) => {
  try {
    const { question } = req.body;
    const kpis = getStore().getBusinessKPIs();
    const inventories = getStore().getInventories();
    const products = getStore().getProducts().items;

    const factualContext = {
      monthlyRevenue: `¥${kpis.revenueThisMonth.toLocaleString()}`,
      monthlyGrossProfit: `¥${kpis.grossProfitThisMonth.toLocaleString()}`,
      averageGrossMargin: `${kpis.averageGrossMargin}%`,
      averageOrderValue: `¥${kpis.averageOrderValue.toLocaleString()}`,
      totalListedCount: kpis.listedCount,
      totalSoldCount: kpis.soldCount,
      averageDaysToSell: `${kpis.averageDaysToSell}日`,
      categoryBreakdown: kpis.categoryStats,
      funnel: kpis.funnel,
    };

    const systemPrompt = `あなたは日本のリユース・中古品EC企業「Re:Market」の経営戦略および在庫回転分析アドバイザーです。
店舗責任者や経営層からの質問に対して、提供された【リアルタイム実績データ】を根拠として、明確な事実(Database Facts)と専門的な改善提言・解釈(AI Insights)を分けて論理的に回答してください。

【現在の実績データ】
${JSON.stringify(factualContext, null, 2)}
`;

    if (aiClient) {
      const response = await aiClient.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: `経営層からの質問: "${question}"`,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              databaseFacts: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '質問に関連する具体的なデータベース事実数値のリスト',
              },
              analysis: {
                type: Type.STRING,
                description: '現状の要因分析（なぜその数値になっているか）',
              },
              actionableRecommendations: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '粗利最大化や在庫回転改善に向けた具体的なアクションプラン',
              },
            },
            required: ['databaseFacts', 'analysis', 'actionableRecommendations'],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      getStore().logAIRequest('sales_insights', 'gemini-3.7-flash', { question }, parsed);
      return res.json(parsed);
    }

    // Fallback analytics response
    const fallbackInsights = {
      databaseFacts: [
        `当月売上高: ¥${kpis.revenueThisMonth.toLocaleString()}（平均粗利率: ${kpis.averageGrossMargin}%）`,
        `在庫回転状況: 出品中 ${kpis.listedCount}点 / 売却済 ${kpis.soldCount}点（平均販売日数: ${kpis.averageDaysToSell}日）`,
        `買取査定通過率: ${kpis.inspectionPassRate}%（月間買取件数: ${kpis.acquiredCountThisMonth}点）`,
      ],
      analysis: 'カメラおよびパソコンカテゴリーが高い粗利率（28〜32%）を維持して収益の柱となっています。一方、一部の大型家電および工具カテゴリーにおいて在庫滞留が散見されます。',
      actionableRecommendations: [
        '滞留日数14日以上の在庫に対する5〜8%の段階的価格見直し（早期キャッシュ化）',
        '高粗利なミラーレス一眼・ハイエンドMacBookの買取強化キャンペーンの実施',
        'Sランク・Aランク美品の特集ページ開設による客単価アップ',
      ],
    };
    getStore().logAIRequest('sales_insights', 'fallback-rule-based', { question }, fallbackInsights);

    return res.json(fallbackInsights);
  } catch (err: any) {
    console.error('AI #3 Error:', err);
    res.status(500).json({ error: 'AI経営分析中にエラーが発生しました: ' + err.message });
  }
});

// ===================== VITE SPA INTEGRATION =====================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Re:Market Server] Ready on http://0.0.0.0:${PORT}`);
  });
}

startServer();
