import { Outlet, Link } from 'react-router-dom';
import { Activity, Apple, Sparkles } from 'lucide-react';

export default function AuthLayout() {
  return (
    <main className="auth-shell">
      <section className="auth-showcase">
        <Link to="/login" className="brand brand-light">
          <span className="brand-mark"><Apple size={20} /></span>
          <span>nutrinote<span className="brand-period">.</span></span>
        </Link>
        <div className="showcase-copy">
          <div className="eyebrow"><Sparkles size={15} /> BẮT ĐẦU TỪ NHỮNG ĐIỀU NHỎ</div>
          <h1>Ăn lành mạnh,<br /><em>sống nhẹ nhàng.</em></h1>
          <p>Hiểu cơ thể mình hơn qua từng bữa ăn. Từng bước nhỏ tạo nên thay đổi lớn.</p>
          <div className="showcase-note"><Activity size={18} /><span>Theo dõi dinh dưỡng của bạn, mỗi ngày.</span></div>
        </div>
        <div className="showcase-art" aria-hidden="true">
          <div className="art-orbit orbit-one" /><div className="art-orbit orbit-two" />
          <span className="art-fruit fruit-one">🥑</span><span className="art-fruit fruit-two">🍊</span>
          <span className="art-fruit fruit-three">🥬</span><span className="art-fruit fruit-four">🍋</span>
          <div className="art-card"><span>Hôm nay</span><strong>Ăn đủ chất, vui cả ngày</strong><div className="art-bars"><i /><i /><i /><i /><i /><i /><i /></div></div>
        </div>
        <span className="auth-footer">Một chút quan tâm, mỗi ngày.</span>
      </section>
      <section className="auth-content"><Outlet /></section>
    </main>
  );
}