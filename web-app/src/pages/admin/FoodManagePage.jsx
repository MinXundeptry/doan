import { useCallback, useEffect, useRef, useState } from 'react';
import { Apple, ChevronLeft, ChevronRight, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import { createFood, deleteFood, getFoods, updateFood } from '../../api/foodApi';
import { apiErrorMessage } from '../../api/axiosClient';
import { format } from '../user/HomePage';
import useAuth from '../../hooks/useAuth';

const emptyFood = { name: '', calories: '', protein: '', carbs: '', fat: '', serving_unit: '100g' };
const pageSize = 20;

export default function FoodManagePage() {
  const { user } = useAuth();
  const canManageFoods = user?.role === 'admin';
  const [foods, setFoods] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [form, setForm] = useState(emptyFood);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const latestRequest = useRef(0);
  const load = useCallback(async () => {
    const requestId = ++latestRequest.current;
    setLoading(true);
    setError('');
    try {
      const result = await getFoods({ search: search.trim(), page, limit: pageSize });
      if (requestId === latestRequest.current) setFoods(Array.isArray(result) ? result : result.items || []);
    } catch (requestError) {
      if (requestId === latestRequest.current) setError(apiErrorMessage(requestError));
    } finally {
      if (requestId === latestRequest.current) setLoading(false);
    }
  }, [page, search]);
  useEffect(() => { const timer = setTimeout(load, 200); return () => clearTimeout(timer); }, [load]);
  const resetForm = () => { setForm(emptyFood); setEditingId(null); setShowForm(false); };
  const editFood = (food) => { setForm({ name: food.name, calories: food.calories, protein: food.protein, carbs: food.carbs, fat: food.fat, serving_unit: food.serving_unit || '100g' }); setEditingId(food.id); setShowForm(true); };
  const save = async (event) => {
    event.preventDefault(); setBusy(true); setError(''); setNotice('');
    const wasEditing = editingId !== null;
    const payload = { ...form, calories: Number(form.calories), protein: Number(form.protein), carbs: Number(form.carbs), fat: Number(form.fat) };
    try {
      if (wasEditing) await updateFood(editingId, payload);
      else await createFood(payload);
      resetForm(); setNotice(wasEditing ? 'Đã cập nhật thực phẩm.' : 'Đã thêm thực phẩm mới.'); await load();
    } catch (requestError) { setError(apiErrorMessage(requestError)); }
    finally { setBusy(false); }
  };
  const remove = async (food) => {
    if (!window.confirm(`Xóa "${food.name}" khỏi danh mục thực phẩm?`)) return;
    setError(''); setNotice('');
    try { await deleteFood(food.id); setNotice('Đã xóa thực phẩm.'); await load(); }
    catch (requestError) { setError(apiErrorMessage(requestError)); }
  };
  return <div className="admin-foods-page">
    <div className="admin-page-heading"><div><span className="section-kicker">DỮ LIỆU DINH DƯỠNG</span><h1>{canManageFoods ? 'Quản lý thực phẩm' : 'Tra cứu thực phẩm'}</h1><p>{canManageFoods ? 'Thêm món mới hoặc sửa, xóa thông tin dinh dưỡng trong danh mục.' : 'Tra cứu thành phần dinh dưỡng chuẩn để ghi nhật ký ăn uống.'}</p></div>{canManageFoods && <button className="btn btn-primary" onClick={() => { setForm(emptyFood); setEditingId(null); setShowForm(true); }}><Plus size={17} /> Thêm thực phẩm</button>}</div>
    {error && <div className="inline-alert">{error}</div>}{notice && <div className="inline-success">{notice}</div>}
    {canManageFoods && showForm && <form className="card food-form-card" onSubmit={save}><div className="form-card-heading"><div><span className="section-kicker">{editingId ? 'CHỈNH SỬA' : 'THỰC PHẨM MỚI'}</span><h2>{editingId ? 'Cập nhật món ăn' : 'Thêm vào danh mục'}</h2></div><button type="button" className="icon-button" onClick={resetForm} aria-label="Đóng"><X size={18} /></button></div><label className="field-label">Tên món ăn<input className="plain-input" maxLength="150" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ví dụ: Yến mạch" /></label><div className="food-nutrition-fields">{[['calories', 'Năng lượng (kcal)', 99999.99], ['protein', 'Protein (g)', 9999.99], ['carbs', 'Tinh bột (g)', 9999.99], ['fat', 'Chất béo (g)', 9999.99]].map(([field, label, max]) => <label className="field-label" key={field}>{label}<input className="plain-input" type="number" min="0" max={max} step="0.01" required value={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value })} /></label>)}</div><label className="field-label serving-label">Định lượng chuẩn<input className="plain-input" maxLength="50" required value={form.serving_unit} onChange={(e) => setForm({ ...form, serving_unit: e.target.value })} /></label><div className="form-card-actions"><button type="button" className="btn btn-secondary" onClick={resetForm}>Hủy</button><button className="btn btn-primary" disabled={busy}>{busy ? 'Đang lưu...' : 'Lưu thực phẩm'}</button></div></form>}
    <section className="card admin-table-card">
      <div className="table-toolbar"><div><h2>Danh mục món ăn</h2><span>{foods.length} món trên trang này</span></div><label className="table-search"><Search size={16} /><input placeholder="Tìm tên món ăn" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} /></label></div>
      <div className="table-scroll"><table><thead><tr><th>TÊN THỰC PHẨM</th><th>NĂNG LƯỢNG</th><th>PROTEIN</th><th>TINH BỘT</th><th>CHẤT BÉO</th>{canManageFoods && <th>THAO TÁC</th>}</tr></thead><tbody>{foods.map((food) => <tr key={food.id}><td><div className="table-food"><span><Apple size={16} /></span><b>{food.name}</b></div></td><td>{format(food.calories)} kcal</td><td>{food.protein} g</td><td>{food.carbs} g</td><td>{food.fat} g</td>{canManageFoods && <td><div className="table-actions"><button className="icon-button" onClick={() => editFood(food)} aria-label={`Sửa ${food.name}`} title="Sửa món ăn"><Pencil size={15} /></button><button className="icon-button danger-icon" onClick={() => remove(food)} aria-label={`Xóa ${food.name}`} title="Xóa món ăn"><Trash2 size={15} /></button></div></td>}</tr>)}{!loading && !foods.length && <tr><td colSpan={canManageFoods ? 6 : 5} className="table-empty">Không tìm thấy thực phẩm.</td></tr>}</tbody></table></div>
      {loading && <div className="table-loading">Đang tải danh sách món ăn...</div>}
      <div className="table-pagination"><span>Trang {page}</span><div><button className="icon-button" disabled={page <= 1 || loading} onClick={() => setPage((current) => current - 1)} aria-label="Trang trước"><ChevronLeft size={17} /></button><button className="icon-button" disabled={foods.length < pageSize || loading} onClick={() => setPage((current) => current + 1)} aria-label="Trang sau"><ChevronRight size={17} /></button></div></div>
    </section>
  </div>;
}