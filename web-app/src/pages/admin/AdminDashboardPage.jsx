import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Apple, ShieldCheck, Users, Utensils, Activity, Flame, LockKeyhole, Footprints } from 'lucide-react';
import { Link } from 'react-router-dom';
import client, { apiData, apiErrorMessage } from '../../api/axiosClient';

export default function AdminDashboardPage() {
  const [report, setReport] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    client.get('/admin/reports/summary')
      .then((response) => setReport(apiData(response)))
      .catch((requestError) => setError(apiErrorMessage(requestError)))
      .finally(() => setLoading(false));
  }, []);
  const chart = useMemo(() => {
    const daily = new Map((report?.daily_calories_7d || []).map((item) => [item.date, item.calories]));
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - 6 + index);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      return { key, label: new Intl.DateTimeFormat('vi-VN', { day: 'numeric', month: 'short' }).format(date), calories: Number(daily.get(key) || 0) };
    });
  }, [report]);
  const maxCalories = Math.max(...chart.map((item) => item.calories), 1);
  return <div className="admin-dashboard">
    <div className="admin-page-heading"><div><span className="section-kicker">TỔNG QUAN HỆ THỐNG</span><h1>Xin chào, quản trị viên</h1><p>Quản lý dữ liệu và không gian NutriNote của bạn.</p></div><span className="admin-badge"><ShieldCheck size={16} /> ADMIN</span></div>
    {error && <div className="inline-alert">{error}</div>}
    <div className="admin-stats">
      <Stat title="Tổng người dùng" value={loading ? '—' : report?.users?.total ?? 0} icon={Users} color="green" />
      <Stat title="Đang hoạt động" value={loading ? '—' : report?.users?.active ?? 0} icon={Activity} color="purple" />
      <Stat title="Tài khoản bị khóa" value={loading ? '—' : report?.users?.blocked ?? 0} icon={LockKeyhole} color="orange" />
      <Stat title="Thực phẩm" value={loading ? '—' : report?.foods ?? 0} icon={Apple} color="orange" />
    </div>
    <section className="card admin-activity-card">
      <div className="admin-section-heading"><div><span className="section-kicker">BÁO CÁO 7 NGÀY</span><h2>Hoạt động ghi nhận bữa ăn</h2></div><span className="report-total"><Utensils size={15} /> {loading ? '—' : report?.meals_7d ?? 0} bữa</span></div>
      <div className="report-highlights">
        <div><span><Flame size={15} /> Năng lượng nạp vào</span><b>{loading ? '—' : Number(report?.calories_7d || 0).toLocaleString('vi-VN')} <small>kcal</small></b></div>
        <div><span><Footprints size={15} /> Năng lượng tiêu hao vận động</span><b>{loading ? '—' : Number(report?.calories_burned_7d || 0).toLocaleString('vi-VN')} <small>kcal</small></b></div>
        <p>Tổng hợp nhật ký ăn uống và vận động của toàn bộ người dùng.</p>
      </div>
      <div className="activity-chart" aria-label="Lượng calo được ghi nhận mỗi ngày trong 7 ngày gần đây">
        {chart.map((day) => <div className="activity-chart-day" key={day.key} title={`${day.label}: ${day.calories.toLocaleString('vi-VN')} kcal`}><div className="activity-chart-bar-wrap"><i style={{ height: `${day.calories ? Math.max(day.calories / maxCalories * 100, 4) : 0}%` }} /></div><span>{day.label}</span></div>)}
      </div>
    </section>
    <section className="card admin-runtime-card">
      <div className="admin-section-heading"><div><span className="section-kicker">SỨC KHỎE DỊCH VỤ</span><h2>Hiệu năng từ lúc khởi động</h2></div></div>
      <div className="runtime-metrics">
        <RuntimeMetric label="Thời gian hoạt động" value={formatUptime(report?.performance?.uptime_seconds)} loading={loading} />
        <RuntimeMetric label="Yêu cầu API" value={Number(report?.performance?.requests || 0).toLocaleString('vi-VN')} loading={loading} />
        <RuntimeMetric label="Phản hồi trung bình" value={`${report?.performance?.average_response_ms ?? 0} ms`} loading={loading} />
        <RuntimeMetric label="Lỗi máy chủ" value={Number(report?.performance?.server_errors || 0).toLocaleString('vi-VN')} loading={loading} />
        <RuntimeMetric label="Bộ nhớ tiến trình" value={`${report?.performance?.rss_megabytes ?? 0} MB`} loading={loading} />
      </div>
      <p className="runtime-footnote">Bộ đếm được lưu trong bộ nhớ backend và bắt đầu lại khi khởi động lại dịch vụ.</p>
    </section>
    <div className="admin-section-heading"><div><span className="section-kicker">TRUY CẬP NHANH</span><h2>Quản lý hệ thống</h2></div></div>
    <div className="admin-shortcuts">
      <Link to="/admin/users" className="admin-shortcut card"><span className="shortcut-icon green"><Users size={20} /></span><div><b>Quản lý người dùng</b><p>Tìm kiếm tài khoản và cập nhật vai trò.</p></div><ArrowRight size={18} /></Link>
      <Link to="/admin/foods" className="admin-shortcut card"><span className="shortcut-icon orange"><Utensils size={20} /></span><div><b>Danh mục thực phẩm</b><p>Chỉnh sửa dữ liệu dinh dưỡng trong kho món ăn.</p></div><ArrowRight size={18} /></Link>
    </div>
    <div className="admin-info card"><ShieldCheck size={19} /><div><b>Quyền truy cập được bảo vệ</b><p>Chỉ tài khoản quản trị viên mới truy cập được khu vực này. Bạn có thể quản lý vai trò và khóa/mở tài khoản người dùng tại trang quản lý tài khoản.</p></div></div>
  </div>;
}

function Stat({ title, value, icon: Icon, color }) {
  return <div className="admin-stat card"><span className={`stat-icon ${color}`}><Icon size={19} /></span><span>{title}</span><b>{value}</b></div>;
}

function RuntimeMetric({ label, value, loading }) {
  return <div className="runtime-metric"><span>{label}</span><b>{loading ? '—' : value}</b></div>;
}

function formatUptime(seconds) {
  const total = Number(seconds) || 0;
  const days = Math.floor(total / 86400);
  const hours = Math.floor(total % 86400 / 3600);
  const minutes = Math.floor(total % 3600 / 60);
  return days ? `${days} ngày ${hours} giờ` : hours ? `${hours} giờ ${minutes} phút` : `${minutes} phút`;
}