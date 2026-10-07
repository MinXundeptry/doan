import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowRight, CalendarDays, Check, ChevronLeft, ChevronRight, CirclePlus, Minus, Pencil, Plus, Search, Trash2, Utensils, X } from 'lucide-react';
import { createMeal, deleteMealItem, getDailySummary, updateMealItem } from '../../api/mealApi';
import { getFoods } from '../../api/foodApi';
import { apiErrorMessage } from '../../api/axiosClient';
import { format, localDate, mealTitle } from './HomePage';

const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
const mealEmoji = { breakfast: '☀️', lunch: '🥙', dinner: '🌙', snack: '🍓' };

export default function FoodDiaryPage() {
  const [date, setDate] = useState(localDate);
  const [summary, setSummary] = useState(null);
  const [foods, setFoods] = useState([]);
  const [search, setSearch] = useState('');
  const [mealType, setMealType] = useState('breakfast');
  const [picked, setPicked] = useState([]);
  const [amount, setAmount] = useState(100);
  const [editingItem, setEditingItem] = useState(null);
  const [savingItemId, setSavingItemId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const load = useCallback(async () => {
    setError('');
    try { setSummary(await getDailySummary(date)); }
    catch (requestError) { setError(apiErrorMessage(requestError)); }
  }, [date]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    let active = true;
    const timer = setTimeout(() => {
      getFoods({ search: search.trim(), limit: 8 }).then((result) => {
        if (!active) return;
        setFoods(Array.isArray(result) ? result : result?.items || []);
      }).catch((requestError) => { if (active) setError(apiErrorMessage(requestError)); });
    }, 250);
    return () => { active = false; clearTimeout(timer); };
  }, [search]);

  const selectedIds = useMemo(() => new Set(picked.map((item) => item.food_id)), [picked]);
  const shiftDate = (days) => {
    const next = new Date(`${date}T12:00:00`);
    next.setDate(next.getDate() + days);
    setDate(localDate(next));
  };
  const addFood = (food) => {
    if (selectedIds.has(food.id)) return;
    setPicked((current) => [...current, { food_id: food.id, food, amount_gram: Number(amount) || 100 }]);
    setNotice('');
  };
  const updatePickedAmount = (foodId, value) => setPicked((current) => current.map((item) => item.food_id === foodId ? { ...item, amount_gram: value } : item));

  const saveMeal = async (event) => {
    event.preventDefault();
    if (!picked.length) { setError('Hãy chọn ít nhất một món ăn.'); return; }
    if (picked.some((item) => !Number.isFinite(Number(item.amount_gram)) || Number(item.amount_gram) <= 0 || Number(item.amount_gram) > 9999.99)) {
      setError('Khẩu phần mỗi món phải lớn hơn 0 và không quá 9.999,99 g.');
      return;
    }
    setBusy(true); setError(''); setNotice('');
    try {
      await createMeal({ meal_type: mealType, meal_date: date, items: picked.map(({ food_id, amount_gram }) => ({ food_id, amount_gram: Number(amount_gram) })) });
      setPicked([]); setSearch(''); setNotice('Đã ghi nhận bữa ăn của bạn.'); await load();
    } catch (requestError) { setError(apiErrorMessage(requestError)); }
    finally { setBusy(false); }
  };
  const removeItem = async (id) => {
    if (!window.confirm('Xóa món này khỏi nhật ký?')) return;
    setError('');
    try { await deleteMealItem(id); setNotice('Đã xóa món khỏi nhật ký.'); await load(); }
    catch (requestError) { setError(apiErrorMessage(requestError)); }
  };
  const saveItemAmount = async () => {
    if (!editingItem) return;
    const amountGram = Number(editingItem.amount);
    if (!Number.isFinite(amountGram) || amountGram <= 0 || amountGram > 9999.99) {
      setError('Khẩu phần phải lớn hơn 0 và không quá 9.999,99 g.');
      return;
    }
    setSavingItemId(editingItem.id);
    setError('');
    try {
      await updateMealItem(editingItem.id, amountGram);
      setEditingItem(null);
      setNotice('Đã cập nhật khẩu phần món ăn.');
      await load();
    } catch (requestError) {
      setError(apiErrorMessage(requestError));
    } finally {
      setSavingItemId(null);
    }
  };

  return <div className="diary-page">
    <section className="page-heading-row"><div><div className="page-eyebrow"><span className="status-dot" /> ĂN UỐNG CÓ Ý THỨC</div><h1>Nhật ký ăn uống</h1><p>Mỗi bữa ăn là một cách bạn chăm sóc chính mình.</p></div><div className="diary-date-controls"><button type="button" className="icon-button" aria-label="Ngày trước" onClick={() => shiftDate(-1)}><ChevronLeft size={17} /></button><label className="date-picker"><CalendarDays size={17} /><input aria-label="Chọn ngày" type="date" value={date} onChange={(e) => setDate(e.target.value)} /></label><button type="button" className="icon-button" aria-label="Ngày sau" onClick={() => shiftDate(1)} disabled={date >= localDate()}><ChevronRight size={17} /></button>{date !== localDate() && <button type="button" className="today-button" onClick={() => setDate(localDate())}>Hôm nay</button>}</div></section>
    {(error || notice) && <div className={error ? 'inline-alert' : 'inline-success'}>{error || notice}</div>}
    <section className="diary-grid">
      <div className="diary-column">
        <div className="section-title diary-section-title"><div><span className="section-kicker">NGÀY ĐANG XEM</span><h2>{new Intl.DateTimeFormat('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date(`${date}T12:00:00`))}</h2></div><span className="diary-calories">{format(summary?.totals?.calories)} <small>kcal</small></span></div>
        <div className="diary-meals">
          {mealTypes.map((type) => {
            const meals = summary?.meals_by_type?.[type] || [];
            return <article className="diary-meal card" key={type}><div className="diary-meal-head"><div className={`meal-icon ${type}`}>{mealEmoji[type]}</div><div><h3>{mealTitle(type)}</h3><span>{meals.length ? `${meals.reduce((count, meal) => count + (meal.items?.length || 0), 0)} món` : 'Chưa ghi nhận'}</span></div><b className="meal-calories">{format(meals.reduce((sum, meal) => sum + Number(meal.totals?.calories || 0), 0))}<small> kcal</small></b></div>
              {meals.map((meal) => <div className="meal-details" key={meal.id}>{meal.items?.map((item) => <div className={`meal-detail-row ${editingItem?.id === item.id ? 'is-editing' : ''}`} key={item.id}><span className="food-dot" /><span className="meal-detail-name">{item.food_name}{editingItem?.id === item.id ? <span className="inline-portion"><input aria-label={`Khẩu phần ${item.food_name}`} autoFocus type="number" min="1" max="9999.99" step="1" value={editingItem.amount} onChange={(event) => setEditingItem({ ...editingItem, amount: event.target.value })} /><span>g</span></span> : <small>{item.amount_gram} g</small>}</span><b>{format(item.calories)} kcal</b>{editingItem?.id === item.id ? <><button type="button" className="icon-button save-icon" onClick={saveItemAmount} disabled={savingItemId === item.id} aria-label="Lưu khẩu phần">{savingItemId === item.id ? <span className="loader" /> : <Check size={15} />}</button><button type="button" className="icon-button" onClick={() => setEditingItem(null)} aria-label="Hủy chỉnh sửa"><X size={15} /></button></> : <><button type="button" className="icon-button" onClick={() => { setNotice(''); setEditingItem({ id: item.id, amount: item.amount_gram }); }} aria-label={`Sửa khẩu phần ${item.food_name}`}><Pencil size={14} /></button><button type="button" className="icon-button danger-icon" onClick={() => removeItem(item.id)} aria-label={`Xóa ${item.food_name}`}><Trash2 size={15} /></button></>}</div>)}</div>)}
            </article>;
          })}
        </div>
      </div>
      <form className="card add-meal-card" onSubmit={saveMeal}>
        <div className="card-heading"><div><span className="section-kicker">GHI NHẬN BỮA ĂN</span><h2>Thêm món mới</h2></div><span className="round-icon mint"><CirclePlus size={20} /></span></div>
        <label className="field-label">Bữa ăn<select className="plain-input" value={mealType} onChange={(e) => setMealType(e.target.value)}>{mealTypes.map((type) => <option key={type} value={type}>{mealTitle(type)}</option>)}</select></label>
        <label className="field-label">Khẩu phần mặc định (g)<input className="plain-input" type="number" min="1" max="9999.99" step="1" value={amount} onChange={(e) => setAmount(e.target.value)} /></label>
        <label className="field-label">Tìm món ăn<div className="search-input"><Search size={17} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Ví dụ: cơm trắng..." /></div></label>
        <div className="food-search-results">{foods.length ? foods.map((food) => <button className="food-option" type="button" key={food.id} onClick={() => addFood(food)} disabled={selectedIds.has(food.id)}><span className="food-option-icon"><Utensils size={16} /></span><span><b>{food.name}</b><small>{format(food.calories)} kcal / 100g</small></span>{selectedIds.has(food.id) ? <Check size={16} className="text-green" /> : <Plus size={16} />}</button>) : <div className="search-empty">{search ? 'Không tìm thấy món phù hợp.' : 'Đang tải danh sách món...'}</div>}</div>
        {picked.length > 0 && <div className="picked-list"><div className="picked-label">MÓN ĐÃ CHỌN <span>{picked.length}</span></div>{picked.map((item) => <div className="picked-row" key={item.food_id}><div><b>{item.food.name}</b><small>{format(item.food.calories * Number(item.amount_gram || 0) / 100)} kcal</small></div><div className="amount-input"><input type="number" min="1" max="9999" value={item.amount_gram} onChange={(e) => updatePickedAmount(item.food_id, e.target.value)} /><span>g</span></div><button className="icon-button danger-icon" type="button" onClick={() => setPicked((current) => current.filter((selected) => selected.food_id !== item.food_id))} aria-label="Bỏ món"><Minus size={15} /></button></div>)}</div>}
        <button className="btn btn-primary btn-full add-meal-submit" disabled={busy || picked.length === 0}>{busy ? 'Đang lưu...' : <>Lưu bữa ăn <ArrowRight size={16} /></>}</button>
      </form>
    </section>
  </div>;
}