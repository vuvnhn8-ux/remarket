/**
 * Re:Market — Login & Register Modal (AGENTS.md mục 3, 8)
 * - Tab ログイン: đăng nhập demo 3 role + email/password thủ công.
 * - Tab 新規登録: đăng ký email+password, sau đó NHẮC user KIỂM TRA EMAIL và bấm
 *   link xác thực (Magic Link). Bắt buộc EMAIL THẬT — không fallback OTP/link
 *   hiển thị ngay trong UI (quyết định của người dùng).
 */

import React, { useEffect, useState } from 'react';
import { X, LogIn, ShieldCheck, User, Briefcase, MailCheck, UserPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { UserRole } from '../../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRole?: UserRole;
}

const DEMO_ACCOUNTS: { role: UserRole; label: string; email: string; password: string; icon: React.ReactNode }[] = [
  { role: 'customer', label: '顧客', email: 'customer@remarket.jp', password: 'customer123', icon: <User className="w-4 h-4" /> },
  { role: 'staff', label: 'スタッフ（検品・出品）', email: 'staff@remarket.jp', password: 'staff123', icon: <Briefcase className="w-4 h-4" /> },
  { role: 'admin', label: '管理者（経営・管理）', email: 'admin@remarket.jp', password: 'admin123', icon: <ShieldCheck className="w-4 h-4" /> },
];

type Mode = 'login' | 'register' | 'checkmail';

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, initialRole = 'customer' }) => {
  const { login } = useAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [selectedRole, setSelectedRole] = useState<UserRole>(initialRole);
  const [email, setEmail] = useState(DEMO_ACCOUNTS[0].email);
  const [password, setPassword] = useState(DEMO_ACCOUNTS[0].password);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Register state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPasswordConfirm, setRegPasswordConfirm] = useState('');
  const [checkmailAddress, setCheckmailAddress] = useState('');

  useEffect(() => {
    if (!isOpen) {
      // Reset trạng thái khi đóng modal
      setMode('login');
      setError('');
      setRegName('');
      setRegEmail('');
      setRegPassword('');
      setRegPasswordConfirm('');
      return;
    }
    setError('');
  }, [isOpen]);

  if (!isOpen) return null;

  const selectAccount = (role: UserRole) => {
    const acc = DEMO_ACCOUNTS.find((a) => a.role === role)!;
    setSelectedRole(role);
    setEmail(acc.email);
    setPassword(acc.password);
    setError('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      await login(email, password);
      onClose();
    } catch (err: any) {
      setError(err.message || 'ログインに失敗しました。');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (regPassword !== regPasswordConfirm) {
      setError('パスワードが一致しません。');
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await api.register({
        email: regEmail,
        password: regPassword,
        name: regName,
      });
      if (!result.ok) {
        setError(result.error || '登録に失敗しました。');
        setIsSubmitting(false);
        return;
      }
      setCheckmailAddress(regEmail);
      setMode('checkmail');
    } catch (err: any) {
      setError(err.message || '登録に失敗しました。');
    } finally {
      setIsSubmitting(false);
    }
  };

  const switchMode = (m: Mode) => {
    setMode(m);
    setError('');
  };

  const badgeSquare = (
    <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center font-bold text-white text-sm">
      Re:
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {badgeSquare}
            <div>
              <h3 className="font-bold text-sm">
                {mode === 'login' && 'ログイン'}
                {mode === 'register' && '新規登録'}
                {mode === 'checkmail' && 'メール認証'}
              </h3>
              <p className="text-[11px] text-slate-400">Re:Market 顧客・従業員ポータル</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-1 rounded text-slate-400 hover:text-white transition cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        {(mode === 'login' || mode === 'register') && (
          <div className="flex border-b border-slate-200">
            <button
              type="button"
              onClick={() => switchMode('login')}
              className={`flex-1 py-2.5 text-xs font-bold transition cursor-pointer ${
                mode === 'login' ? 'text-emerald-600 border-b-2 border-emerald-500' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              ログイン
            </button>
            <button
              type="button"
              onClick={() => switchMode('register')}
              className={`flex-1 py-2.5 text-xs font-bold transition cursor-pointer ${
                mode === 'register' ? 'text-emerald-600 border-b-2 border-emerald-500' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              新規登録
            </button>
          </div>
        )}

        {/* ==================== LOGIN ==================== */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="p-5 space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">デモアカウントを選択</label>
              <div className="grid grid-cols-3 gap-2">
                {DEMO_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.role}
                    type="button"
                    onClick={() => selectAccount(acc.role)}
                    className={`p-2 rounded-lg border text-center transition cursor-pointer ${
                      selectedRole === acc.role
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    <div className="flex justify-center text-emerald-600 mb-1">{acc.icon}</div>
                    <div className="text-[11px] font-semibold">{acc.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">メールアドレス</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">パスワード</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {error && <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs">{error}</div>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 text-sm transition cursor-pointer disabled:opacity-50"
            >
              <LogIn className="w-4 h-4" />
              {isSubmitting ? 'ログイン中...' : 'ログイン'}
            </button>
          </form>
        )}

        {/* ==================== REGISTER ==================== */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} className="p-5 space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">お名前</label>
              <input
                type="text"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                required
                placeholder="山田 太郎"
                className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">メールアドレス</label>
              <input
                type="email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                required
                placeholder="taro@example.com"
                className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">パスワード（8文字以上）</label>
              <input
                type="password"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                required
                minLength={8}
                className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">パスワード（確認）</label>
              <input
                type="password"
                value={regPasswordConfirm}
                onChange={(e) => setRegPasswordConfirm(e.target.value)}
                required
                minLength={8}
                className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              登録後、メールに記載された認証リンクをクリックして本人確認を完了してください。
            </p>

            {error && <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs">{error}</div>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 text-sm transition cursor-pointer disabled:opacity-50"
            >
              <UserPlus className="w-4 h-4" />
              {isSubmitting ? '登録中...' : '登録して認証リンクを送る'}
            </button>
          </form>
        )}

        {/* ==================== CHECK EMAIL (magic link) ==================== */}
        {mode === 'checkmail' && (
          <div className="p-5 space-y-4">
            <div className="flex items-start gap-2.5 p-3 bg-sky-50 border border-sky-200 rounded-xl">
              <MailCheck className="w-5 h-5 text-sky-600 mt-0.5" />
              <div className="text-xs text-sky-800 leading-relaxed">
                <span className="font-bold">メールをご確認ください。</span>
                <br />
                <span className="opacity-80">送信先: {checkmailAddress}</span>
                <br />
                <span className="opacity-80">メール内の認証リンクをクリックすると登録が完了します。（有効期限: 24時間・1回限り）</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              クリック後、認証が完了すると自動的にログインされます。届いていない場合は迷惑メール
              フォルダをご確認ください。
            </p>

            <button
              type="button"
              onClick={() => switchMode('register')}
              className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl flex items-center justify-center gap-2 text-sm transition cursor-pointer"
            >
              <MailCheck className="w-4 h-4" />
              認証リンクを再送信（メールを変更）
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
