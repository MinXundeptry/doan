import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from 'lucide-react';
import * as authApi from '../../api/authApi';
import { apiErrorMessage } from '../../api/axiosClient';
import useAuth from '../../hooks/useAuth';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const submit = async (event) => {
    event.preventDefault(); setError(''); setBusy(true);
    try {
      const session = await authApi.login(form);
      login(session);
      navigate(session.user?.role === 'admin' ? '/admin' : '/app');
    } catch (requestError) { setError(apiErrorMessage(requestError)); }
    finally { setBusy(false); }
  };
  return <div className="auth-form-wrap">
    <div className="mobile-brand brand"><span className="brand-mark">🍃</span><span>nutrinote<span className="brand-period">.</span></span></div>
    <div className="auth-heading"><span className="auth-kicker">CHÀO MỪNG BẠN TRỞ LẠI</span><h2>Đăng nhập</h2><p>Tiếp tục hành trình chăm sóc sức khỏe của bạn.</p></div>
    <form className="form-stack" onSubmit={submit}>
      {error && <div className="form-alert">{error}</div>}
      <label className="field-label">Email<div className="input-wrap"><Mail size={17} /><input type="email" placeholder="ten@email.com" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div></label>
      <label className="field-label">Mật khẩu<div className="input-wrap"><LockKeyhole size={17} /><input type={visible ? 'text' : 'password'} placeholder="Nhập mật khẩu" autoComplete="current-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required /><button type="button" className="field-action" onClick={() => setVisible(!visible)} aria-label="Hiện hoặc ẩn mật khẩu">{visible ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></label>
      <button className="btn btn-primary btn-full auth-submit" disabled={busy}>{busy ? 'Đang đăng nhập...' : <>Đăng nhập <ArrowRight size={17} /></>}</button>
    </form>
    <p className="auth-switch">Chưa có tài khoản? <Link to="/register">Tạo tài khoản mới <span>↗</span></Link></p>
    <div className="auth-privacy">Thông tin của bạn luôn được bảo mật và an toàn.</div>
  </div>;
}
