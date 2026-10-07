import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Camera, CheckCircle2, ImagePlus, LoaderCircle, RotateCcw, ScanLine, Sparkles, Upload, X } from 'lucide-react';
import { analyzeFoodImage } from '../../api/aiApi';
import { apiErrorMessage } from '../../api/axiosClient';
import { format } from './HomePage';

export default function ScanFoodPage() {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  const chooseFile = (nextFile) => {
    if (!nextFile) return;
    if (!nextFile.type.startsWith('image/')) { setError('Vui lòng chọn một tệp hình ảnh.'); return; }
    if (nextFile.size > 5 * 1024 * 1024) { setError('Ảnh cần có dung lượng nhỏ hơn 5 MB.'); return; }
    setFile(nextFile); setPreview(URL.createObjectURL(nextFile)); setResult(null); setError('');
  };
  const submit = async () => {
    if (!file) return;
    setBusy(true); setError('');
    try { setResult(await analyzeFoodImage(file)); }
    catch (requestError) { setError(apiErrorMessage(requestError)); }
    finally { setBusy(false); }
  };
  const reset = () => {
    setFile(null); setPreview(''); setResult(null); setError('');
    if (inputRef.current) inputRef.current.value = '';
  };

  return <div className="scan-page">
    <section className="page-heading-row"><div><div className="page-eyebrow"><span className="status-dot" /> NHẬN DIỆN THÔNG MINH</div><h1>Quét món ăn</h1><p>Chụp ảnh món ăn để ước tính thành phần và dinh dưỡng.</p></div><div className="ai-powered"><Sparkles size={16} /> Phân tích bằng AI</div></section>
    {error && <div className="inline-alert">{error}</div>}
    <section className={`scan-workspace ${result ? 'has-result' : ''}`}>
      <div className="card upload-card">
        <div className="card-heading"><div><span className="section-kicker">BƯỚC 1</span><h2>Tải ảnh món ăn lên</h2></div><span className="round-icon lilac"><Camera size={19} /></span></div>
        {!preview ? <button className="upload-dropzone" onClick={() => inputRef.current?.click()} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); chooseFile(e.dataTransfer.files[0]); }}><span className="upload-symbol"><ImagePlus size={24} /></span><b>Kéo thả ảnh vào đây</b><span>hoặc nhấn để chọn từ thiết bị</span><small>JPG, PNG hoặc WEBP · Tối đa 5 MB</small><span className="btn btn-secondary"><Upload size={16} /> Chọn ảnh</span></button> : <div className="preview-wrap"><img src={preview} alt="Ảnh món ăn đã chọn" /><button className="preview-remove" onClick={reset} aria-label="Xóa ảnh"><X size={16} /></button><div className="preview-file"><CheckCircle2 size={16} />{file?.name}</div></div>}
        <input ref={inputRef} type="file" accept="image/*" className="visually-hidden" onChange={(e) => chooseFile(e.target.files?.[0])} />
        <div className="scan-tip"><span>✦</span><p>Ảnh rõ nét, đủ sáng sẽ giúp AI nhận diện chính xác hơn.</p></div>
        {preview && !result && <button className="btn btn-primary btn-full analyze-btn" onClick={submit} disabled={busy}>{busy ? <><LoaderCircle className="spin" size={17} /> Đang phân tích...</> : <><ScanLine size={17} /> Phân tích món ăn <ArrowRight size={16} /></>}</button>}
      </div>
      <div className="card scan-result-card">
        {!result ? <div className="result-placeholder"><div className="result-orbit"><ScanLine size={28} /></div><span className="section-kicker">{preview ? 'SẴN SÀNG PHÂN TÍCH' : 'BƯỚC 2'}</span><h2>{preview ? 'Cùng xem có gì trong đĩa nhé' : 'Kết quả sẽ xuất hiện ở đây'}</h2><p>AI sẽ nhận diện món ăn và ước tính năng lượng cùng các chất dinh dưỡng.</p><div className="result-chips"><span>◉ Calo</span><span>◉ Protein</span><span>◉ Tinh bột</span><span>◉ Chất béo</span></div></div> : <div className="scan-result-content"><div className="result-title-row"><div><span className="section-kicker">KẾT QUẢ PHÂN TÍCH</span><h2>{result.is_food ? 'Món ăn được nhận diện' : 'Chưa nhận diện được món ăn'}</h2></div><button className="icon-button" onClick={reset} aria-label="Quét lại"><RotateCcw size={17} /></button></div>{result.note && <p className="result-note">{result.note}</p>}{result.is_food && <><div className="scan-total"><span>Tổng năng lượng ước tính</span><b>{format(result.total_calories)} <small>kcal</small></b></div><div className="scan-macros"><MacroStat label="Protein" amount={result.total_protein} color="green" /><MacroStat label="Tinh bột" amount={result.total_carbs} color="orange" /><MacroStat label="Chất béo" amount={result.total_fat} color="purple" /></div><div className="recognized-list">{result.items?.map((item, i) => <div className="recognized-item" key={`${item.food_name}-${i}`}><div><b>{item.food_name}</b><small>{Math.round(item.amount_gram)} g · Độ tin cậy {Math.round(item.confidence * 100)}%</small></div><span>{format(item.calories)} kcal</span></div>)}</div></> }</div>}
      </div>
    </section>
    <p className="disclaimer">Kết quả từ AI chỉ mang tính tham khảo và có thể không hoàn toàn chính xác.</p>
  </div>;
}

function MacroStat({ label, amount, color }) {
  return <div className="scan-macro-stat"><span className={`macro-dot ${color}`} /> <span>{label}</span><b>{Math.round(Number(amount) || 0)} g</b></div>;
}