import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Send,
  ShoppingBag,
  Bot,
  User,
  CheckCircle2,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { ProductItem } from '../../types';
import { api } from '../../services/api';
import { ConditionBadge } from '../common/ConditionBadge';

interface AiShoppingAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (product: ProductItem) => void;
  onAddToCart: (product: ProductItem) => void;
}

interface Message {
  sender: 'ai' | 'user';
  text: string;
  recommendedProducts?: ProductItem[];
}

export const AiShoppingAssistantModal: React.FC<AiShoppingAssistantModalProps> = ({
  isOpen,
  onClose,
  onSelectProduct,
  onAddToCart,
}) => {
  if (!isOpen) return null;

  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'ai',
      text: 'いらっしゃいませ！Re:MarketのAIショッピングコンシェルジュです。「予算10万円以下で初心者向けのミラーレスカメラ」や「プログラミングに最適なMacBook」など、お探しの条件やご要望を自由にお聞かせください。現在在庫のある実物商品から最適な中古品をご案内いたします。',
    },
  ]);

  const quickPrompts = [
    '10万円以下で初心者向けのミラーレスカメラ',
    '動画編集や仕事で使えるMacBook',
    '通勤で使えるノイズキャンセリングヘッドホン',
    'SランクまたはAランクの美品iPhone',
  ];

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || inputMessage;
    if (!query.trim() || loading) return;

    const userMsg: Message = { sender: 'user', text: query };
    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      const response = await api.askShoppingAssistant(query);
      const aiMsg: Message = {
        sender: 'ai',
        text: response.reply,
        recommendedProducts: response.recommendedProducts,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: '申し訳ありません。AI応答の取得中にエラーが発生しました。もう一度お試しください。',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full h-[85vh] max-h-[700px] flex flex-col overflow-hidden shadow-2xl border border-slate-200">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white p-4 flex items-center justify-between shadow-xs shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-purple-200">
              <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base text-white">
                  AIショッピングコンシェルジュ
                </h3>
                <span className="text-[10px] bg-purple-500/30 text-purple-200 px-2 py-0.5 rounded font-mono border border-purple-400/30">
                  Gemini Flash Grounded
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                実在する在庫データに基づき、安心の中古品を親身にご提案します
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Prompts Bar */}
        <div className="bg-purple-50/70 border-b border-purple-100 p-2.5 overflow-x-auto flex items-center gap-2 text-xs shrink-0">
          <span className="text-purple-800 font-semibold shrink-0 text-[11px] flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-purple-600" />
            質問例：
          </span>
          {quickPrompts.map((prompt, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSend(prompt)}
              className="px-2.5 py-1 bg-white hover:bg-purple-100 text-purple-900 rounded-md border border-purple-200 text-[11px] whitespace-nowrap transition shadow-2xs cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'ai' && (
                <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className={`max-w-[85%] space-y-3`}>
                <div
                  className={`p-3.5 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                    msg.sender === 'user'
                      ? 'bg-emerald-600 text-white font-medium rounded-tr-xs shadow-xs'
                      : 'bg-slate-100 text-slate-800 rounded-tl-xs border border-slate-200/80 shadow-2xs'
                  }`}
                >
                  {msg.text}
                </div>

                {/* Recommended Product Cards grounded in Live DB */}
                {msg.recommendedProducts && msg.recommendedProducts.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <span className="text-[11px] font-bold text-slate-700 block">
                      ▼ 提案された実物中古在庫（全品動作検品済・1点限り）
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {msg.recommendedProducts.map((product) => (
                        <div
                          key={product.id}
                          className="bg-white rounded-xl border border-slate-200 p-2.5 shadow-2xs hover:border-emerald-500 transition flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <ConditionBadge rank={product.conditionRank} size="sm" showLabel={true} />
                              <span className="text-[10px] text-slate-400 font-mono">{product.id}</span>
                            </div>

                            <div className="flex gap-2.5">
                              <div className="w-14 h-14 bg-slate-100 rounded-lg overflow-hidden shrink-0">
                                <img
                                  src={product.featuredImage}
                                  alt=""
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <span className="text-[10px] text-slate-500 font-semibold block truncate">
                                  {product.brand}
                                </span>
                                <h5 className="font-bold text-slate-900 text-xs line-clamp-2 leading-snug">
                                  {product.name}
                                </h5>
                              </div>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-slate-100 mt-2 flex items-center justify-between">
                            <span className="font-black text-slate-900 text-sm">
                              ¥{product.price.toLocaleString()}
                            </span>
                            <div className="flex gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  onClose();
                                  onSelectProduct(product);
                                }}
                                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded text-[11px] transition cursor-pointer"
                              >
                                詳細を見る
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  onAddToCart(product);
                                }}
                                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded text-[11px] transition cursor-pointer"
                              >
                                カートへ
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {msg.sender === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-slate-800 text-white flex items-center justify-center shrink-0">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 items-center text-slate-500 text-xs">
              <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-slate-100 p-3 rounded-2xl border border-slate-200 flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-purple-600 animate-spin" />
                <span>実物在庫データベースを検索・解析中...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="お探しの商品、予算、用途などを入力してください..."
              disabled={loading}
              className="flex-1 h-10 px-3 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
            />
            <button
              type="submit"
              disabled={loading || !inputMessage.trim()}
              className="h-10 px-4 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span>送信</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
