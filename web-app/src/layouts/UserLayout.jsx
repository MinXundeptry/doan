import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Apple, BarChart3, BookOpen, Camera, ChevronDown, CircleHelp, LayoutDashboard, LogOut, Menu, MessageCircle, Settings2, ShieldCheck, Utensils, X, Footprints, ChartNoAxesCombined } from 'lucide-react';
import { useState } from 'react';
import useAuth from '../hooks/useAuth';

const navItems = [
  { to: '/app', label: 'Tổng quan', icon: LayoutDashboard },
  { to: '/diary', label: 'Nhật ký ăn uống', icon: BookOpen },
  { to: '/activity', label: 'Nhật ký vận động', icon: Footprints },
  { to: '/reports', label: 'Báo cáo dinh dưỡng', icon: ChartNoAxesCombined },
  { to: '/foods', label: 'Tra cứu thực phẩm', icon: Utensils },
  { to: '/scan', label: 'Quét món ăn', icon: Camera },
  { to: '/assistant', label: 'Trợ lý AI', icon: MessageCircle },
];

export default function UserLayout() {
  const { user, profile, profileError, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const title = navItems.find((item) => item.to === location.pathname)?.label || 'Hồ sơ cá nhân';
  const exit = () => { logout(); navigate('/login'); };
  return (
    <div className="app-shell">
      {open && <button className="mobile-scrim" aria-label="Đóng menu" onClick={() => setOpen(false)} />}
      <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
        <div className="sidebar-top">
          <NavLink to="/app" className="brand"><span className="brand-mark"><Apple size={19} /></span><span>nutrinote<span className="brand-period">.</span></span></NavLink>
          <button className="icon-button mobile-close" onClick={() => setOpen(false)} aria-label="Đóng menu"><X size={19} /></button>
          <div className="workspace-switch"><div className="workspace-icon"><BarChart3 size={17} /></div><div><b>Không gian của bạn</b><small>Gói cá nhân</small></div><ChevronDown size={15} /></div>
        </div>
        <nav className="side-nav">
          <div className="nav-caption">MENU CHÍNH</div>
          {navItems.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} onClick={() => setOpen(false)} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}><Icon size={18} /><span>{label}</span>{to === '/assistant' && <span className="nav-new">AI</span>}</NavLink>)}
          <div className="nav-caption nav-caption-space">CÁ NHÂN</div>
          <NavLink to="/profile" onClick={() => setOpen(false)} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}><Settings2 size={18} /><span>Hồ sơ & mục tiêu</span></NavLink>
          {user?.role === 'admin' && <><div className="nav-caption nav-caption-space">QUẢN TRỊ</div><NavLink to="/admin" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}><ShieldCheck size={18} /><span>Quản trị hệ thống</span></NavLink></>}
        </nav>
        <div className="sidebar-bottom">
          <div className="help-card"><div className="help-icon"><CircleHelp size={17} /></div><b>Cần một chút trợ giúp?</b><p>Trợ lý AI luôn sẵn sàng đồng hành cùng bạn.</p><NavLink to="/assistant">Trò chuyện ngay <span>↗</span></NavLink></div>
          <button className="user-menu" onClick={exit}><span className="avatar">{(profile?.full_name || user?.email || 'N').slice(0, 1).toUpperCase()}</span><span className="user-meta"><b>{profile?.full_name || 'Bạn'}</b><small>{user?.email}</small></span><LogOut size={16} /></button>
        </div>
      </aside>
      <main className="main-area">
        <header className="topbar">
          <div className="topbar-left"><button className="icon-button mobile-menu" onClick={() => setOpen(true)} aria-label="Mở menu"><Menu size={20} /></button><span className="breadcrumb">Không gian của bạn <span>/</span> <b>{title}</b></span></div>
          <div className="topbar-right"><span className="today-chip">{new Intl.DateTimeFormat('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())}</span><span className="topbar-avatar">{(profile?.full_name || 'N').slice(0, 1).toUpperCase()}</span></div>
        </header>
        <div className="page-content">{profileError && <div className="inline-alert">{profileError}</div>}<Outlet /></div>
      </main>
    </div>
  );
}