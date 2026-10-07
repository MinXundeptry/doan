import { NavLink, Outlet } from 'react-router-dom';
import { ArrowLeft, Apple, LayoutDashboard, Users, Utensils } from 'lucide-react';

export default function AdminLayout() {
  return <div className="admin-shell">
    <aside className="admin-sidebar">
      <NavLink to="/app" className="brand"><span className="brand-mark"><Apple size={19} /></span><span>nutrinote<span className="brand-period">.</span></span></NavLink>
      <div className="admin-label">QUẢN TRỊ HỆ THỐNG</div>
      <nav>
        <NavLink end to="/admin" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}><LayoutDashboard size={18} />Tổng quan</NavLink>
        <NavLink to="/admin/users" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}><Users size={18} />Người dùng</NavLink>
        <NavLink to="/admin/foods" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}><Utensils size={18} />Thực phẩm</NavLink>
      </nav>
      <NavLink className="back-link" to="/app"><ArrowLeft size={16} /> Quay lại ứng dụng</NavLink>
    </aside>
    <main className="admin-main"><Outlet /></main>
  </div>;
}