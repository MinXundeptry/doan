import { useEffect, useRef, useState } from 'react';
import { ArrowUp, Bot, Check, ChevronDown, CircleHelp, Leaf, MessageCircle, RotateCcw, Sparkles, UserRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { sendChatMessage } from '../../api/aiApi';
import { apiErrorMessage } from '../../api/axiosClient';
import useAuth from '../../hooks/useAuth';

const startersByMode = {
  advice: ['Làm sao để ăn đủ protein?', 'Ăn khuya có ảnh hưởng sức khỏe không?', 'Cách uống nước hợp lý trong ngày?'],
  menu: ['Gợi ý thực đơn lành mạnh hôm nay', 'Gợi ý bữa trưa giàu protein', 'Thực đơn chay đủ chất trong một ngày'],
  analyze: ['Phân tích khẩu phần hôm nay', 'Hôm nay mình còn thiếu chất gì?', 'Bữa ăn nào của mình nhiều calo nhất?'],
};
const welcome = { role: 'assistant', content: 'Chào bạn! Mình là trợ lý dinh dưỡng NutriNote. Hôm nay mình có thể giúp bạn điều gì?' };
const modes = [['advice', 'Tư vấn'], ['menu', 'Gợi ý thực đơn'], ['analyze', 'Phân tích']];
const getLocalDate = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

export default function AIChatPage() {
  const { profile } = useAuth();
  const [messages, setMessages] = useState([welcome]);
  const [mode, setMode] = useState('advice');
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const endRef = useRef(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, busy]);
  const starters = startersByMode[mode];

  const send = async (message = text) => {
    const trimmed = message.trim();
    if (!trimmed || busy) return;
    const userMessage = { role: 'user', content: trimmed };
    const next = [...messages, userMessage];
    setMessages(next); setText(''); setError(''); setBusy(true);
    try {
      const response = await sendChatMessage({
        message: trimmed,
        mode,
        history: messages.slice(1).slice(-10),
        goal: profile?.goal,
        target_calories: profile?.target_calories,
        date: getLocalDate(),
      });
      setMessages((current) => [...current, { role: 'assistant', content: response.reply || 'Mình chưa có câu trả lời cho câu hỏi này.' }]);
    } catch (requestError) {
      setError(apiErrorMessage(requestError));
      setMessages((current) => current.filter((item) => item !== userMessage));
      setText(trimmed);
    } finally { setBusy(false); }
  };
  const reset = () => {
    if (busy) return;
    setMessages([welcome]);
    setError('');
    setText('');
  };
  return <div className="chat-page">
    <section className="page-heading-row chat-heading"><div><div className="page-eyebrow"><span className="status-dot" /> ĐỒNG HÀNH CÙNG BẠN</div><h1>Trợ lý dinh dưỡng <span className="ai-title-badge"><Sparkles size={15} /> AI</span></h1><p>Hỏi bất cứ điều gì về dinh dưỡng, thói quen ăn uống và sức khỏe.</p></div><button className="btn btn-secondary" onClick={reset} disabled={busy}><RotateCcw size={15} /> Cuộc trò chuyện mới</button></section>
    <section className="chat-layout">
      <div className="card chat-card">
        <div className="chat-topline"><div className="assistant-avatar"><Bot size={20} /></div><div><b>NutriNote AI</b><span><i /> Đang sẵn sàng hỗ trợ</span></div><button className="chat-help" title="Câu trả lời chỉ mang tính tham khảo" aria-label="Lưu ý"><CircleHelp size={18} /></button></div>
        <div className="chat-messages">
          {messages.map((item, index) => <div className={`chat-message ${item.role}`} key={`${item.role}-${index}`}><span className={`message-avatar ${item.role}`}>{item.role === 'assistant' ? <Leaf size={16} /> : <UserRound size={16} />}</span><div className="message-content"><span className="message-author">{item.role === 'assistant' ? 'NutriNote AI' : 'Bạn'} <small>{item.role === 'assistant' ? '· Trợ lý dinh dưỡng' : ''}</small></span><div className="message-bubble">{item.content.split('\n').map((line, i) => <p key={i}>{line || '\u00a0'}</p>)}</div></div></div>)}
          {busy && <div className="chat-message assistant"><span className="message-avatar assistant"><Leaf size={16} /></span><div className="message-content"><span className="message-author">NutriNote AI</span><div className="message-bubble typing-dots"><i /><i /><i /></div></div></div>}
          <div ref={endRef} />
        </div>
        {messages.length === 1 && <div className="starter-prompts">{starters.map((prompt) => <button key={prompt} disabled={busy} onClick={() => send(prompt)}>{prompt}<ArrowUp size={14} /></button>)}</div>}
        {error && <div className="chat-error">{error}</div>}
        <div className="chat-composer"><div className="mode-select"><Sparkles size={14} /><select value={mode} onChange={(e) => setMode(e.target.value)} aria-label="Chế độ trợ lý" disabled={busy}>{modes.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select><ChevronDown size={13} /></div><form onSubmit={(e) => { e.preventDefault(); send(); }}><textarea value={text} maxLength={1000} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }} placeholder="Nhập câu hỏi của bạn..." rows="1" /><span className="composer-count">{text.length}/1000</span><button className="send-button" disabled={!text.trim() || busy} aria-label="Gửi câu hỏi"><ArrowUp size={18} /></button></form><div className="composer-foot"><span>Enter để gửi · Shift + Enter để xuống dòng</span><span>Câu trả lời AI có thể chưa hoàn toàn chính xác.</span></div></div>
      </div>
      <aside className="chat-side">
        <div className="card chat-profile-card"><div className="chat-side-title"><span className="round-icon mint"><Leaf size={18} /></span><b>Được cá nhân hóa</b></div><p>AI tham khảo một số thông tin hồ sơ và nhật ký hôm nay để đưa ra gợi ý phù hợp hơn.</p><div className="profile-fact"><span>Độ tuổi</span><b>{profile?.age ? `${profile.age} tuổi` : 'Chưa cập nhật'}</b></div><div className="profile-fact"><span>Mục tiêu</span><b>{{ lose: 'Giảm cân', maintain: 'Duy trì', gain: 'Tăng cân' }[profile?.goal] || 'Chưa chọn'}</b></div><div className="profile-fact"><span>Mục tiêu năng lượng</span><b>{profile?.target_calories ? `${Math.round(profile.target_calories)} kcal` : 'Chưa có dữ liệu'}</b></div><Link to="/profile">Cập nhật hồ sơ <ArrowUp size={14} /></Link></div>
        <div className="ai-note-card"><MessageCircle size={18} /><b>Một lưu ý nhỏ</b><p>Gợi ý từ AI không thay thế tư vấn chuyên môn từ bác sĩ hoặc chuyên gia dinh dưỡng.</p><span><Check size={14} /> Hãy chọn điều phù hợp với bạn</span></div>
      </aside>
    </section>
  </div>;
}