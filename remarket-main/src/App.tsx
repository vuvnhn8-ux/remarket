import React, { useState, useEffect, useCallback } from 'react';
import {
  UserRole,
  ProductItem,
  AcquisitionRecord,
  InspectionRecord,
  InventoryItem,
  OrderRecord,
  BusinessKPIs,
  ProductCategory,
} from './types';
import { api } from './services/api';

// Components
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { SimulationStatusRibbon } from './components/common/SimulationStatusRibbon';
import { SimulationLiveMonitor } from './components/common/SimulationLiveMonitor';
import { useSimulation } from './context/SimulationContext';
import { HomePage } from './components/customer/HomePage';
import { ProductListingPage } from './components/customer/ProductListingPage';
import { ProductDetailPage } from './components/customer/ProductDetailPage';
import { CartDrawer } from './components/customer/CartDrawer';
import { CheckoutModal } from './components/customer/CheckoutModal';
import { MyPage } from './components/customer/MyPage';
import { AiShoppingAssistantModal } from './components/customer/AiShoppingAssistantModal';

// Staff Components
import { StaffAcquisitionManagement } from './components/staff/StaffAcquisitionManagement';
import { StaffInspectionWorkspace } from './components/staff/StaffInspectionWorkspace';
import { StaffListingCreator } from './components/staff/StaffListingCreator';

// Admin Components
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminInventoryManagement } from './components/admin/AdminInventoryManagement';
import { AdminOrderManagement } from './components/admin/AdminOrderManagement';
import { AdminAiInsights } from './components/admin/AdminAiInsights';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginModal } from './components/auth/LoginModal';
import { VerificationPage } from './components/auth/VerificationPage';
import { ErrorBoundary } from './components/common/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <RootRouter />
      </AuthProvider>
    </ErrorBoundary>
  );
}

// Route SPA `/verify?token=...` — magic link trong email trỏ về đây.
// Không dùng react-router; detect theo pathname và render trang xác thực riêng.
function RootRouter() {
  const isVerifyRoute =
    typeof window !== 'undefined' && window.location.pathname === '/verify';
  if (isVerifyRoute) return <VerificationPage />;
  return <AppRoot />;
}

function AppRoot() {
  const { isSimulationMode } = useSimulation();
  const { user, role, logout } = useAuth();

  // Global Role & View Navigation State
  const [activeView, setActiveView] = useState<string>('home');
  const [isLoginOpen, setIsLoginOpen] = useState<boolean>(false);
  const [loginInitialRole, setLoginInitialRole] = useState<UserRole>('customer');

  // Domain Data State
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [acquisitions, setAcquisitions] = useState<AcquisitionRecord[]>([]);
  const [inventories, setInventories] = useState<InventoryItem[]>([]);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [kpis, setKpis] = useState<BusinessKPIs | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filterParams, setFilterParams] = useState<any>({});

  // Selected Detail Item
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);

  // Staff Active Flow
  const [staffAcquisition, setStaffAcquisition] = useState<AcquisitionRecord | null>(null);
  const [staffInspection, setStaffInspection] = useState<InspectionRecord | null>(null);

  // Shopping Cart & Favorites
  const [cartItems, setCartItems] = useState<ProductItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [favorites, setFavorites] = useState<string[]>([]);

  // Modals
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState<boolean>(false);

  // Fetch all domain data from server
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [productsRes, acqRes, invRes, ordRes, kpiRes] = await Promise.all([
        api.getProducts(),
        api.getAcquisitions(),
        api.getInventories(),
        api.getOrders(),
        api.getKPIs(),
      ]);

      setProducts(productsRes.items);
      setAcquisitions(acqRes);
      setInventories(invRes);
      setOrders(ordRes);
      setKpis(kpiRes);
    } catch (err) {
      console.error('Failed to load store data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    document.title = 'ReMarket';
    loadData();
  }, [loadData, isSimulationMode]);

  // Role Switch Handler (role derived from auth; Header only requests customer view)
  const handleRoleChange = (role: UserRole) => {
    if (role === 'customer') {
      setActiveView('home');
    } else if (role === 'staff') {
      setActiveView('staff-acquisitions');
    } else if (role === 'admin') {
      setActiveView('admin-dashboard');
    }
  };

  // Navigate to the matching default view when role changes (login/logout)
  useEffect(() => {
    if (user?.role === 'staff') {
      setActiveView((v) => (v.startsWith('staff-') || v.startsWith('admin-') ? v : 'staff-acquisitions'));
    } else if (user?.role === 'admin') {
      setActiveView((v) => (v.startsWith('staff-') || v.startsWith('admin-') ? v : 'admin-dashboard'));
    } else {
      setActiveView((v) => (v.startsWith('staff-') || v.startsWith('admin-') ? 'home' : v));
    }
  }, [user?.role]);

  // Navigation Handler
  const handleNavigate = (view: string, param?: any) => {
    setActiveView(view);
    if (view === 'catalog') {
      if (param?.category) {
        setSelectedCategory(param.category);
      }
      setFilterParams(param || {});
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Search Submission
  const handleSearchSubmit = (q: string) => {
    setSearchQuery(q);
    setActiveView('catalog');
    setFilterParams({ q });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Product Selection
  const handleSelectProduct = (product: ProductItem) => {
    setSelectedProduct(product);
    setActiveView('product-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cart Management
  const handleAddToCart = (product: ProductItem) => {
    if (product.isSold) {
      alert('この商品はすでに売却済みです。');
      return;
    }
    setCartItems((prev) => {
      if (prev.some((item) => item.id === product.id)) return prev;
      return [...prev, product];
    });
  };

  const handleRemoveFromCart = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== productId));
  };

  const handleBuyNow = (product: ProductItem) => {
    handleAddToCart(product);
    setIsCheckoutOpen(true);
  };

  // Favorites Toggle (dùng customerId thật của khách đã đăng nhập)
  const handleToggleFavorite = async (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const customerId = user?.customerId;
    // Chưa đăng nhập khách → chỉ ghi nhận local, không gửi server (không fake CUST-0001)
    if (!customerId) {
      setFavorites((prev) =>
        prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
      );
      return;
    }
    try {
      const res = await api.toggleFavorite(customerId, productId);
      setFavorites(res.favorites);
    } catch {
      setFavorites((prev) =>
        prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
      );
    }
  };

  // Order Completed Event
  const handleOrderSuccess = (order: OrderRecord) => {
    // Clear purchased items from cart
    const purchasedIds = order.items.map((i) => i.productId);
    setCartItems((prev) => prev.filter((i) => !purchasedIds.includes(i.id)));
    // Refresh backend state to show new order & stock status
    loadData();
  };

  // Reset Database
  const handleResetDatabase = async () => {
    if (window.confirm('データベースを初期データにリセットしますか？')) {
      await api.resetDatabase();
      loadData();
      alert('データベースを初期状態にリセットしました。');
    }
  };

  // Demo Quick Scenario Runner
  const handleRunDemoScenario = (scenario: 'A' | 'B' | 'C') => {
    if (scenario === 'A') {
      // Scenario A: Staff acquisition -> inspection -> AI listing (requires staff login)
      if (user?.role === 'staff' || user?.role === 'admin') {
        setActiveView('staff-acquisitions');
      } else {
        setLoginInitialRole('staff');
        setIsLoginOpen(true);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (scenario === 'B') {
      // Scenario B: Customer search camera -> detail -> purchase
      setActiveView('catalog');
      setSelectedCategory('カメラ');
      setSearchQuery('SONY');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (scenario === 'C') {
      // Scenario C: Showcase AI features
      setIsAiAssistantOpen(true);
    }
  };

  return (
    <div className="min-h-screen ambient-app-bg text-[#0f172a] flex flex-col font-sans selection:bg-emerald-500 selection:text-white relative">
      {/* Universal Header (outside overflow container so sticky works) */}
      <Header
        currentRole={role}
        onRoleChange={handleRoleChange}
        user={user}
        onLoginClick={() => {
          setLoginInitialRole('customer');
          setIsLoginOpen(true);
        }}
        onLogout={logout}
        activeView={activeView}
        onNavigate={handleNavigate}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchSubmit={handleSearchSubmit}
        selectedCategory={selectedCategory}
        onCategorySelect={(cat) => {
          setSelectedCategory(cat);
          handleNavigate('catalog', { category: cat });
        }}
        cartCount={cartItems.length}
        onOpenCart={() => setIsCartOpen(true)}
        favoritesCount={favorites.length}
        onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
        onRunDemoScenario={handleRunDemoScenario}
        onResetDb={handleResetDatabase}
      />

      {/* Scroll-safe content wrapper (clips horizontal overflow without breaking sticky) */}
      <div className="relative overflow-x-hidden flex-1 flex flex-col">
        {/* Soft Ambient Background Elements (Pure CSS, pointer-events-none) */}
        <div className="fixed inset-0 bg-mesh-dots mask-radial-faded pointer-events-none opacity-30 z-0" />
        <div className="fixed -top-40 -left-40 w-96 h-96 bg-emerald-400/5 rounded-full blur-3xl pointer-events-none z-0" />
        <div className="fixed top-1/4 -right-40 w-96 h-96 bg-indigo-400/5 rounded-full blur-3xl pointer-events-none z-0" />
        <div className="fixed bottom-10 left-1/3 w-[500px] h-64 bg-slate-300/10 rounded-full blur-3xl pointer-events-none z-0" />

      {/* Live Automation & Simulation Status Ribbon */}
      <SimulationStatusRibbon />

      {/* Main View Router */}
      <main className="flex-1">
        {/* ================= CUSTOMER VIEWS (browse freely) ================= */}
        {(
          <>
            {activeView === 'home' && (
              <HomePage
                products={products}
                favorites={favorites}
                onToggleFavorite={handleToggleFavorite}
                onSelectProduct={handleSelectProduct}
                onNavigateCategory={(cat: ProductCategory) => {
                  setSelectedCategory(cat);
                  handleNavigate('catalog', { category: cat });
                }}
                onNavigateCatalog={(filter) => handleNavigate('catalog', filter)}
                onSearchSubmit={handleSearchSubmit}
                onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
              />
            )}

            {activeView === 'catalog' && (
              <ProductListingPage
                products={products}
                favorites={favorites}
                onToggleFavorite={handleToggleFavorite}
                onSelectProduct={handleSelectProduct}
                initialCategory={selectedCategory}
                initialQuery={searchQuery}
                initialRank={filterParams?.conditionRank || 'all'}
                initialSort={filterParams?.sort || 'recommended'}
                onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
              />
            )}

            {activeView === 'product-detail' && selectedProduct && (
              <ProductDetailPage
                product={selectedProduct}
                isFavorite={favorites.includes(selectedProduct.id)}
                onToggleFavorite={handleToggleFavorite}
                onAddToCart={handleAddToCart}
                onBuyNow={handleBuyNow}
                onBack={() => handleNavigate('catalog')}
                onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
              />
            )}

            {activeView === 'mypage' && (
              <MyPage
                orders={orders}
                products={products}
                favorites={favorites}
                acquisitions={acquisitions}
                onToggleFavorite={handleToggleFavorite}
                onSelectProduct={handleSelectProduct}
                initialTab={filterParams?.tab || 'orders'}
              />
            )}
          </>
        )}

        {/* ================= STAFF VIEWS (staff/admin only) ================= */}
        {(role === 'staff' || role === 'admin') && (
          <>
            {activeView === 'staff-acquisitions' && (
              <StaffAcquisitionManagement
                acquisitions={acquisitions}
                onRefresh={loadData}
                onStartInspection={(acq) => {
                  setStaffAcquisition(acq);
                  setActiveView('staff-inspections');
                }}
              />
            )}

            {activeView === 'staff-inspections' && (
              <StaffInspectionWorkspace
                selectedAcquisition={staffAcquisition}
                allAcquisitions={acquisitions}
                onSelectAcquisition={setStaffAcquisition}
                onInspectionComplete={(inspection, acquisition) => {
                  setStaffInspection(inspection);
                  setStaffAcquisition(acquisition);
                  setActiveView('staff-listing');
                }}
              />
            )}

            {activeView === 'staff-listing' && (
              <StaffListingCreator
                currentAcquisition={staffAcquisition}
                currentInspection={staffInspection}
                onListingPublished={(product) => {
                  loadData();
                  setSelectedProduct(product);
                  setActiveView('product-detail');
                }}
              />
            )}
          </>
        )}

        {/* ================= ADMIN VIEWS (admin only) ================= */}
        {role === 'admin' && (
          <>
            {activeView === 'admin-dashboard' && kpis && (
              <AdminDashboard
                kpis={kpis}
                onNavigateAiInsights={() => setActiveView('admin-ai-insights')}
                onNavigateInventory={() => setActiveView('admin-inventory')}
                onNavigateOrders={() => setActiveView('admin-orders')}
              />
            )}

            {activeView === 'admin-inventory' && (
              <AdminInventoryManagement
                inventories={inventories}
                onRefresh={loadData}
              />
            )}

            {activeView === 'admin-orders' && (
              <AdminOrderManagement
                orders={orders}
                onRefresh={loadData}
              />
            )}

            {activeView === 'admin-ai-insights' && kpis && (
              <AdminAiInsights kpis={kpis} />
            )}
          </>
        )}
      </main>
      </div>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onRemoveItem={handleRemoveFromCart}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cartItems}
        onOrderSuccess={handleOrderSuccess}
      />

      {/* AI Shopping Assistant Modal */}
      <AiShoppingAssistantModal
        isOpen={isAiAssistantOpen}
        onClose={() => setIsAiAssistantOpen(false)}
        onSelectProduct={handleSelectProduct}
        onAddToCart={handleAddToCart}
      />

      {/* Live Automation & Simulation Control Modal */}
      <SimulationLiveMonitor />

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        initialRole={loginInitialRole}
      />

      {/* Universal Footer */}
      <Footer />
    </div>
  );
}
