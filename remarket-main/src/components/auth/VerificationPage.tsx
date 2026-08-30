/**
 * Re:Market — VerificationPage (SPA route `/verify?token=...`)
 * User bấm magic link trong email → trang này. Tự xác thực + tự đăng nhập
 * (AuthContext.verifyLink), rồi chuyển về trang chủ.
 */

import React, { useEffect, useState } from 'react';
import { Check, XCircle, Loader2, ShieldCheck, MailCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

type Status = 'loading' | 'success' | 'error';

export const VerificationPage: React.FC = () => {
  const { verifyLink } = useAuth();
  const [status, setStatus] = useState<Status>('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token') || '';
    if (!token) {
      setStatus('error');
      setError('認証リンクが不正です。');
      return;
    }
    verifyLink(token)
      .then((user) => {
        if (!user) {
          setStatus('error');
          setError('認証に失敗しました。リンクが無効か期限切れです。');
          return;
        }
        setStatus('success');
        // Chuyển về trang chủ sau khi thành công.
        setTimeout(() => {
          window.location.href = '/';
        }, 1800);
      })
      .catch(() => {
        setStatus('error');
        setError('認証処理中にエラーが発生しました。もう一度お試しください。');
      });
  }, [verifyLink]);

  const goHome = () => {
    // Xoá query `?token=...` khỏi URL khi quay lại trang chủ.
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen ambient-app-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="bg-slate-900 px-6 py-6 flex items-center justify-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center font-bold text-white text-sm">
            Re:
          </div>
          <span className="text-white font-bold text-lg">Re:Market</span>
        </div>

        <div className="p-8 text-center space-y-4">
          {status === 'loading' && (
            <>
              <div className="w-14 h-14 mx-auto rounded-full bg-sky-100 flex items-center justify-center">
                <Loader2 className="w-7 h-7 text-sky-600 animate-spin" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-lg">認証中...</h4>
                <p className="text-xs text-slate-500 mt-1">メールアドレスを認証しています。</p>
              </div>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 flex items-center justify-center">
                <Check className="w-7 h-7 text-emerald-600" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-lg">認証が完了しました</h4>
                <p className="text-xs text-slate-500 mt-1">ログインしました。ホームへ移動します...</p>
              </div>
              <button
                type="button"
                onClick={goHome}
                className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 text-sm transition cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                ホームへ移動
              </button>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-14 h-14 mx-auto rounded-full bg-rose-100 flex items-center justify-center">
                <XCircle className="w-7 h-7 text-rose-600" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-lg">認証に失敗しました</h4>
                <p className="text-xs text-slate-500 mt-1">{error}</p>
              </div>
              <button
                type="button"
                onClick={goHome}
                className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl flex items-center justify-center gap-2 text-sm transition cursor-pointer"
              >
                <MailCheck className="w-4 h-4" />
                ホームに戻る
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
