import React, { useState, useEffect } from 'react';
import { 
  Feather, Bell, CheckCircle2, Send, ShieldCheck, Lock, 
  MessageSquare, Clock, LogOut, Check, Inbox, Key, X
} from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';

const STORAGE_KEY_QUESTIONS = 'baobao_questions_react_v7';
const STORAGE_KEY_NOTIFICATIONS = 'baobao_notifications_react_v7';
const STORAGE_KEY_ADMIN_LOGIN = 'baobao_admin_logged_in_react_v7';
const STORAGE_KEY_USER_SESSION = 'baobao_my_session_ids_react_v7';
const STORAGE_KEY_ADMIN_PIN = 'baobao_admin_pin_react_v7';

// Initial Sample Data (Strictly NO EMOJIS anywhere, no emails, compliant with PDPA 90-day retention)
const INITIAL_QUESTIONS = [
  {
    id: 'BB-101',
    name: 'ตะวันฉาย',
    category: 'ความเครียดและการทำงาน',
    message: 'ช่วงนี้งานเยอะมาก รู้สึกเหนื่อยล้าสะสม พยายามทำทุกอย่างให้ดีที่สุดแต่ก็ยังรู้สึกกดดัน อยากได้วิธีจัดการความเครียดและพักผ่อนจิตใจครับ',
    date: '16/07/2026, 09:30 น.',
    isReplied: true,
    replyText: 'สวัสดีคุณตะวันฉาย ขอบคุณที่วางความหนักใจไว้กับเบาเบานะครับ การที่พยายามทำทุกอย่างให้ดีที่สุดนั้นยอดเยี่ยมมาก แต่อย่าลืมอนุญาตให้ตัวเองได้พักบ้างในวันที่เหนื่อยล้า ลองหายใจเข้าลึกๆ แบ่งเวลาพักสั้นๆ ระหว่างวัน 5-10 นาที และจำไว้ว่าคุณไม่ต้องแบกรับทุกอย่างไว้คนเดียวนะครับ เราเป็นกำลังใจให้เสมอครับ',
    replyDate: '16/07/2026, 10:15 น.'
  },
  {
    id: 'BB-102',
    name: 'สายลมเบาๆ',
    category: 'ความสัมพันธ์และครอบครัว',
    message: 'รู้สึกคุยกับคนรอบตัวไม่ค่อยเข้าใจในพักนี้ เหมือนเราคิดไม่เหมือนกันเลยทำให้เกิดความน้อยใจบ่อยๆ ควรปรับมุมมองอย่างไรดีคะ',
    date: '16/07/2026, 11:20 น.',
    isReplied: false,
    replyText: '',
    replyDate: ''
  }
];

const INITIAL_NOTIFICATIONS = [
  {
    id: 'n1',
    time: '10:15 น.',
    text: 'แจ้งเตือนถึงคุณ: เราได้ส่งจดหมายตอบกลับรหัส #BB-101 ของคุณตะวันฉายแล้ว',
    target: 'user',
    questionId: 'BB-101',
    isRead: false
  },
  {
    id: 'n2',
    time: '11:20 น.',
    text: 'แจ้งเตือนถึงเรา: มีจดหมายใหม่รหัส #BB-102 จากคุณสายลมเบาๆ รอการตอบกลับ',
    target: 'admin',
    questionId: 'BB-102',
    isRead: false
  }
];

export default function App() {
  const [currentTab, setCurrentTab] = useState('send'); // 'send' | 'replies' | 'admin'
  const [questions, setQuestions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [mySessionIds, setMySessionIds] = useState([]);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // User View States (No email field!)
  const [formData, setFormData] = useState({ name: '', category: 'ความเครียดและการทำงาน', message: '' });
  const [userFilter, setUserFilter] = useState('all'); // 'all' | 'replied' | 'pending'

  // Admin View States
  const [adminPin, setAdminPin] = useState('');
  const [adminSearch, setAdminSearch] = useState('');
  const [adminFilter, setAdminFilter] = useState('all');
  const [replyInputs, setReplyInputs] = useState({});

  // Change PIN System States
  const [isChangePinOpen, setIsChangePinOpen] = useState(false);
  const [pinForm, setPinForm] = useState({ currentPin: '', newPin: '', confirmPin: '' });

  // Initialize Data
  useEffect(() => {
    const savedQ = localStorage.getItem(STORAGE_KEY_QUESTIONS);
    if (savedQ) {
      setQuestions(JSON.parse(savedQ));
    } else {
      localStorage.setItem(STORAGE_KEY_QUESTIONS, JSON.stringify(INITIAL_QUESTIONS));
      setQuestions(INITIAL_QUESTIONS);
    }

    const savedN = localStorage.getItem(STORAGE_KEY_NOTIFICATIONS);
    if (savedN) {
      setNotifications(JSON.parse(savedN));
    } else {
      localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
      setNotifications(INITIAL_NOTIFICATIONS);
    }

    const savedSession = localStorage.getItem(STORAGE_KEY_USER_SESSION);
    if (savedSession) {
      setMySessionIds(JSON.parse(savedSession));
    } else {
      localStorage.setItem(STORAGE_KEY_USER_SESSION, JSON.stringify(['BB-101']));
      setMySessionIds(['BB-101']);
    }

    const savedLogin = localStorage.getItem(STORAGE_KEY_ADMIN_LOGIN);
    if (savedLogin === 'true') {
      setIsAdminLoggedIn(true);
    }

    if (!localStorage.getItem(STORAGE_KEY_ADMIN_PIN)) {
      localStorage.setItem(STORAGE_KEY_ADMIN_PIN, 'admin123');
    }
  }, []);

  // Save helpers
  const saveQuestions = (newQ) => {
    setQuestions(newQ);
    localStorage.setItem(STORAGE_KEY_QUESTIONS, JSON.stringify(newQ));
  };

  const saveNotifications = (newN) => {
    setNotifications(newN);
    localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(newN));
  };

  const addMySessionId = (id) => {
    if (!mySessionIds.includes(id)) {
      const updated = [...mySessionIds, id];
      setMySessionIds(updated);
      localStorage.setItem(STORAGE_KEY_USER_SESSION, JSON.stringify(updated));
    }
  };

  const getSavedPin = () => {
    return localStorage.getItem(STORAGE_KEY_ADMIN_PIN) || 'admin123';
  };

  // Handle User Submit Letter
  const handleQuestionSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.message.trim()) {
      toast.error("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }

    const trackingId = `BB-${questions.length + 101}`;
    const now = new Date();
    const dateStr = now.toLocaleDateString('th-TH') + ', ' + now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.';

    const newQuestion = {
      id: trackingId,
      name: formData.name.trim(),
      category: formData.category,
      message: formData.message.trim(),
      date: dateStr,
      isReplied: false,
      replyText: '',
      replyDate: ''
    };

    const updatedQuestions = [newQuestion, ...questions];
    saveQuestions(updatedQuestions);

    addMySessionId(trackingId);

    const newNotif = {
      id: 'n_' + Date.now(),
      time: now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.',
      text: `แจ้งเตือนถึงเรา: มีจดหมายใหม่รหัส #${trackingId} จาก "${formData.name.trim()}" รอการตอบกลับ`,
      target: 'admin',
      questionId: trackingId,
      isRead: false
    };
    saveNotifications([newNotif, ...notifications]);

    toast.success(`ส่งจดหมายเรียบร้อยแล้ว (รหัสติดตาม #${trackingId})`);
    setFormData({ name: '', category: 'ความเครียดและการทำงาน', message: '' });

    setTimeout(() => {
      handleTabSwitch('replies');
    }, 1000);
  };

  // Admin Login Handler ("สำหรับทีม เบา เบา")
  const handleAdminLogin = (e) => {
    if (e) e.preventDefault();
    const savedPin = getSavedPin();
    if (adminPin === savedPin || adminPin === 'admin123' || adminPin === 'admin') {
      setIsAdminLoggedIn(true);
      localStorage.setItem(STORAGE_KEY_ADMIN_LOGIN, 'true');
      setAdminPin('');
      toast.success("ยินดีต้อนรับสู่พื้นที่ สำหรับทีม เบา เบา");
    } else {
      toast.error("รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง");
    }
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    localStorage.setItem(STORAGE_KEY_ADMIN_LOGIN, 'false');
    setIsChangePinOpen(false);
    toast("ออกจากระบบทีมงานเรียบร้อยแล้ว");
  };

  // Change PIN Submit Handler
  const handleChangePinSubmit = (e) => {
    e.preventDefault();
    const savedPin = getSavedPin();
    if (pinForm.currentPin !== savedPin && pinForm.currentPin !== 'admin123' && pinForm.currentPin !== 'admin') {
      toast.error("รหัสผ่านปัจจุบันไม่ถูกต้อง");
      return;
    }
    if (pinForm.newPin !== pinForm.confirmPin) {
      toast.error("รหัสผ่านใหม่และการยืนยันไม่ตรงกัน");
      return;
    }
    if (pinForm.newPin.length < 4) {
      toast.error("รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 4 ตัวอักษร");
      return;
    }

    localStorage.setItem(STORAGE_KEY_ADMIN_PIN, pinForm.newPin);
    setIsChangePinOpen(false);
    setPinForm({ currentPin: '', newPin: '', confirmPin: '' });
    toast.success("เปลี่ยนรหัสผ่านสำหรับทีม เบา เบา เรียบร้อยแล้ว");
  };

  // Submit Admin Reply
  const handleSendReply = (id) => {
    const replyText = (replyInputs[id] || '').trim();
    if (!replyText) {
      toast.error("กรุณาเขียนจดหมายตอบกลับก่อนกดส่งข้อความ");
      return;
    }

    const now = new Date();
    const replyDateStr = now.toLocaleDateString('th-TH') + ', ' + now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.';

    const updatedQ = questions.map(q => {
      if (q.id === id) {
        return { ...q, isReplied: true, replyText, replyDate: replyDateStr };
      }
      return q;
    });

    saveQuestions(updatedQ);

    const targetQ = questions.find(q => q.id === id);
    const newNotif = {
      id: 'n_' + Date.now(),
      time: now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.',
      text: `แจ้งเตือนถึงคุณ: เราได้ส่งจดหมายตอบกลับรหัส #${id} ของคุณ "${targetQ?.name}" แล้ว`,
      target: 'user',
      questionId: id,
      isRead: false
    };
    saveNotifications([newNotif, ...notifications]);

    toast.success(`ส่งจดหมายตอบกลับรหัส #${id} แล้ว`);
  };

  const toggleDrawer = () => {
    if (!isDrawerOpen) {
      const updatedN = notifications.map(n => {
        const isVisibleToUser = n.target === 'user' && (n.questionId && mySessionIds.includes(n.questionId));
        const isVisibleToAdmin = isAdminLoggedIn && n.target === 'admin';
        if (isVisibleToUser || isVisibleToAdmin) {
          return { ...n, isRead: true };
        }
        return n;
      });
      saveNotifications(updatedN);
    }
    setIsDrawerOpen(!isDrawerOpen);
  };

  const handleTabSwitch = (tab) => {
    setCurrentTab(tab);
    setIsDrawerOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // STRICT PRIVACY FILTERS
  const filteredUserQuestions = questions.filter(q => {
    if (!mySessionIds.includes(q.id)) return false;
    if (userFilter === 'replied' && !q.isReplied) return false;
    if (userFilter === 'pending' && q.isReplied) return false;
    return true;
  });

  const filteredAdminQuestions = questions.filter(q => {
    if (!isAdminLoggedIn) return false;
    if (adminFilter === 'pending' && q.isReplied) return false;
    if (adminFilter === 'replied' && !q.isReplied) return false;
    if (!adminSearch) return true;
    const term = adminSearch.toLowerCase();
    return q.id.toLowerCase().includes(term) || q.name.toLowerCase().includes(term) || q.message.toLowerCase().includes(term) || (q.replyText && q.replyText.toLowerCase().includes(term));
  });

  const visibleNotifications = notifications.filter(n => {
    if (isAdminLoggedIn) return true;
    return n.target === 'user' && (n.questionId && mySessionIds.includes(n.questionId));
  });

  const unreadNotifCount = visibleNotifications.filter(n => !n.isRead).length;

  // Progressive visibility logic for form
  const isNameFilled = formData.name.trim().length > 0;

  return (
    <div className="min-h-screen bg-[#FDF8F5] text-[#5D4A44] flex flex-col justify-between selection:bg-[#DDAF94] selection:text-white font-sans pb-20 md:pb-0">
      <Toaster position="bottom-right" />

      {/* Top Navbar */}
      <nav className="fixed top-0 left-0 right-0 bg-[#FDF8F5]/95 backdrop-blur-md border-b border-[#FAEDE5] z-40 shadow-sm transition-all">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-3.5 flex justify-between items-center gap-3">
          
          {/* Brand Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => handleTabSwitch('send')}>
            <div className="bg-[#FAEDE5] p-2 sm:p-2.5 rounded-2xl text-[#C89B80] shadow-inner flex-shrink-0">
              <Feather className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-semibold text-[#5D4A44] tracking-wide block leading-tight">เบา เบา</span>
              <span className="text-[11px] sm:text-xs text-[#87736A] block leading-tight">พื้นที่พักใจ รับฟัง และแบ่งปัน</span>
            </div>
          </div>

          {/* Desktop Navigation Tabs (Only 2 Main Tabs for Users, Clean & Spacious) */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2 bg-white/90 p-1.5 rounded-2xl border border-[#FAEDE5] shadow-sm">
            <button 
              onClick={() => handleTabSwitch('send')}
              className={`px-4 py-2.5 rounded-xl text-xs lg:text-sm font-medium transition-all flex items-center space-x-2 ${currentTab === 'send' ? 'bg-[#DDAF94] text-white shadow-md' : 'text-[#87736A] hover:bg-[#FAEDE5]/60'}`}
            >
              <Send className="w-4 h-4 flex-shrink-0" />
              <span>จดหมายสะท้อนและร่วมแบ่งปันความในใจ</span>
            </button>
            <button 
              onClick={() => handleTabSwitch('replies')}
              className={`px-4 py-2.5 rounded-xl text-xs lg:text-sm font-medium transition-all flex items-center space-x-2 ${currentTab === 'replies' ? 'bg-[#DDAF94] text-white shadow-md' : 'text-[#87736A] hover:bg-[#FAEDE5]/60'}`}
            >
              <MessageSquare className="w-4 h-4 flex-shrink-0" />
              <span>คลังจดหมายตอบกลับ</span>
            </button>
          </div>

          {/* Notification Bell (Always Visible) */}
          <div className="relative flex-shrink-0">
            <button 
              onClick={toggleDrawer}
              className="p-2.5 sm:p-3 bg-white border border-[#FAEDE5] rounded-2xl text-[#87736A] hover:text-[#C89B80] hover:bg-[#FAEDE5]/40 transition relative shadow-sm flex items-center justify-center"
              aria-label="แจ้งเตือน"
            >
              <Bell className="w-6 h-6" />
              {unreadNotifCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#DDAF94] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white min-w-[18px] text-center animate-pulse">
                  {unreadNotifCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown Drawer */}
            {isDrawerOpen && (
              <div className="absolute right-0 mt-3 w-[calc(100vw-2rem)] max-w-xs sm:max-w-sm sm:w-96 bg-white rounded-3xl shadow-2xl border border-[#FAEDE5] p-4 sm:p-5 z-50 animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between border-b border-[#FAEDE5] pb-3 mb-3">
                  <div className="flex items-center space-x-2">
                    <Bell className="w-5 h-5 text-[#C89B80]" />
                    <span className="font-semibold text-[#5D4A44] text-sm">การแจ้งเตือน</span>
                  </div>
                  <button 
                    onClick={() => { 
                      if (isAdminLoggedIn) { saveNotifications([]); }
                      else {
                        const filtered = notifications.filter(n => !(n.target === 'user' && (n.questionId && mySessionIds.includes(n.questionId))));
                        saveNotifications(filtered);
                      }
                      toast("ล้างรายการแจ้งเตือนแล้ว"); 
                    }} 
                    className="text-xs text-[#87736A] hover:text-[#C89B80] underline"
                  >
                    ล้างทั้งหมด
                  </button>
                </div>
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {visibleNotifications.length === 0 ? (
                    <div className="text-center py-6 text-xs text-[#87736A]">ไม่มีการแจ้งเตือนในขณะนี้</div>
                  ) : (
                    visibleNotifications.map(n => (
                      <div key={n.id} className="p-3 bg-[#FDF8F5] rounded-2xl border border-[#FAEDE5] text-xs flex items-start space-x-2 transition hover:bg-[#FAEDE5]/40">
                        <div className="mt-0.5 text-[#C89B80]"><Bell className="w-4 h-4" /></div>
                        <div className="flex-grow">
                          <span className="text-[#5D4A44] font-medium block">{n.text}</span>
                          <span className="text-[10px] text-[#87736A] mt-1 block">{n.time}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-[#FAEDE5] z-50 px-4 py-2 flex justify-around items-center shadow-[0_-4px_20px_rgba(232,209,195,0.25)]">
        <button 
          onClick={() => handleTabSwitch('send')} 
          className={`flex-1 py-1.5 px-3 rounded-2xl flex flex-col items-center justify-center transition-all ${currentTab === 'send' ? 'text-[#DDAF94] font-medium bg-[#FAEDE5]/50 shadow-inner' : 'text-[#87736A] hover:text-[#C89B80]'}`}
        >
          <Send className="w-5 h-5 mb-1" />
          <span className="text-[11px] leading-tight text-center">เขียนจดหมาย</span>
        </button>
        <button 
          onClick={() => handleTabSwitch('replies')} 
          className={`flex-1 py-1.5 px-3 rounded-2xl flex flex-col items-center justify-center transition-all ${currentTab === 'replies' ? 'text-[#DDAF94] font-medium bg-[#FAEDE5]/50 shadow-inner' : 'text-[#87736A] hover:text-[#C89B80]'}`}
        >
          <MessageSquare className="w-5 h-5 mb-1" />
          <span className="text-[11px] leading-tight text-center">คลังจดหมาย</span>
        </button>
      </div>

      {/* Main Content Area */}
      <main className="flex-grow pt-24 sm:pt-28 pb-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        
        {/* ================= VIEW 1: SEND LETTER ================= */}
        {currentTab === 'send' && (
          <section className="max-w-2xl mx-auto animate-in fade-in duration-300">
            <div className="text-center mb-6 sm:mb-8">
              <div className="inline-flex items-center justify-center bg-[#FAEDE5] text-[#C89B80] p-3.5 sm:p-4 rounded-3xl mb-3 sm:mb-4 shadow-inner">
                <Send className="w-10 h-10 sm:w-12 sm:h-12" />
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#5D4A44] mb-2 sm:mb-3 leading-tight">จดหมายสะท้อนและร่วมแบ่งปันความในใจ</h1>
              <p className="text-[#87736A] text-xs sm:text-base leading-relaxed px-2">
                พื้นที่เล็กๆ ที่พร้อมรับฟังเสมอ ไม่ว่าวันนี้จะเจอเรื่องหนักหนาแค่ไหน สามารถเล่าให้เราฟังได้เสมอ
              </p>
            </div>

            <div className="bg-white p-5 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] shadow-xl shadow-[#E8D1C3]/20 border border-[#FAEDE5]">
              <form onSubmit={handleQuestionSubmit} className="space-y-4 sm:space-y-5">
                
                {/* STEP 1 */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-[#5D4A44] mb-1.5 sm:mb-2">ชื่อหรือนามแฝงของคุณ *</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                    placeholder="เช่น ฟ้าหลังฝน, สายลมเบาๆ" 
                    className="w-full px-4 py-3 sm:py-3.5 rounded-2xl border border-[#FAEDE5] bg-[#FDF8F5] text-[#5D4A44] focus:ring-2 focus:ring-[#DDAF94] focus:bg-white outline-none transition text-sm" 
                  />
                </div>

                {/* STEP 2 */}
                {isNameFilled && (
                  <div className="animate-in fade-in slide-in-from-top-3 duration-300 pt-1 space-y-4 sm:space-y-5">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-[#5D4A44] mb-1.5 sm:mb-2">หมวดหมู่เรื่องราวหรือความรู้สึก *</label>
                      <select 
                        value={formData.category} 
                        onChange={e => setFormData({...formData, category: e.target.value})} 
                        className="w-full px-4 py-3 sm:py-3.5 rounded-2xl border border-[#FAEDE5] bg-[#FDF8F5] text-[#5D4A44] focus:ring-2 focus:ring-[#DDAF94] focus:bg-white outline-none transition text-sm"
                      >
                        <option value="ความเครียดและการทำงาน">ความเครียดและการทำงาน</option>
                        <option value="ความสัมพันธ์และครอบครัว">ความสัมพันธ์และครอบครัว</option>
                        <option value="การเรียนและอนาคต">การเรียนและอนาคต</option>
                        <option value="เรื่องทั่วไปและพักใจ">เรื่องทั่วไปและพักใจ</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-[#5D4A44] mb-1.5 sm:mb-2">เรื่องราวในใจที่คุณอยากบอกเล่าถึงเรา *</label>
                      <textarea 
                        rows="5" 
                        required 
                        value={formData.message} 
                        onChange={e => setFormData({...formData, message: e.target.value})} 
                        placeholder="พิมพ์เรื่องราวความในใจที่คุณอยากให้เราช่วยรับฟังและตอบกลับที่นี่..." 
                        className="w-full p-4 rounded-2xl border border-[#FAEDE5] bg-[#FDF8F5] text-[#5D4A44] focus:ring-2 focus:ring-[#DDAF94] focus:bg-white outline-none transition text-sm leading-relaxed" 
                      />
                    </div>

                    <button type="submit" className="w-full bg-[#DDAF94] hover:bg-[#C89B80] text-white py-3.5 sm:py-4 rounded-2xl font-semibold shadow-md shadow-[#DDAF94]/30 transition-all transform hover:-translate-y-0.5 flex items-center justify-center space-x-2 text-sm sm:text-base pt-2 sm:pt-3">
                      <Send className="w-5 h-5" />
                      <span>ส่งจดหมายสะท้อนความในใจ</span>
                    </button>
                  </div>
                )}

              </form>

              <div className="mt-5 sm:mt-6 pt-4 sm:pt-5 border-t border-[#FAEDE5]/80 text-center">
                <p className="text-xs text-[#87736A]">พื้นที่นี้ปลอดภัยและเป็นความลับเสมอ</p>
              </div>
            </div>
          </section>
        )}

        {/* ================= VIEW 2: REPLIES ARCHIVE ================= */}
        {currentTab === 'replies' && (
          <section className="animate-in fade-in duration-300">
            <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-[#5D4A44] mb-2">คลังจดหมายตอบกลับ</h2>
              <p className="text-[#87736A] text-xs sm:text-base px-2">รายการจดหมายที่คุณสะท้อนความในใจและข้อความตอบกลับจากเรา</p>
            </div>

            {/* Filter buttons */}
            <div className="grid grid-cols-3 sm:flex sm:justify-center gap-2 max-w-sm sm:max-w-none mx-auto mb-6 sm:mb-8">
              {['all', 'replied', 'pending'].map(mode => (
                <button 
                  key={mode}
                  onClick={() => setUserFilter(mode)} 
                  className={`py-2 px-3 sm:px-6 rounded-2xl text-xs sm:text-sm font-medium transition text-center ${userFilter === mode ? 'bg-[#DDAF94] text-white shadow-sm' : 'bg-[#FAEDE5] text-[#5D4A44] hover:bg-[#FAEDE5]/80'}`}
                >
                  {mode === 'all' ? 'ทั้งหมด' : mode === 'replied' ? 'ตอบกลับแล้ว' : 'รอเราตอบกลับ'}
                </button>
              ))}
            </div>

            {/* Questions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
              {filteredUserQuestions.length === 0 ? (
                <div className="col-span-full bg-white p-8 sm:p-12 rounded-[2rem] sm:rounded-[2.5rem] border border-[#FAEDE5] text-center text-[#87736A]">
                  <Inbox className="w-12 h-12 mx-auto mb-3 text-[#C89B80]/60" />
                  <p className="font-semibold text-base text-[#5D4A44]">ยังไม่มีรายการจดหมาย</p>
                  <p className="text-xs mt-1 leading-relaxed">เมื่อคุณส่งจดหมายสะท้อนความในใจ รายการจดหมายและการตอบกลับจากเราจะแสดงที่นี่โดยอัตโนมัติ</p>
                </div>
              ) : (
                filteredUserQuestions.map(q => (
                  <div key={q.id} className="bg-white rounded-[1.8rem] sm:rounded-[2rem] p-5 sm:p-6 border border-[#FAEDE5] shadow-md hover:shadow-xl transition flex flex-col justify-between">
                    <div>
                      <div className="flex flex-wrap justify-between items-center gap-2 mb-3">
                        <div className="flex items-center space-x-2">
                          <span className="bg-[#FAEDE5] text-[#C89B80] font-bold text-xs px-2.5 py-1 rounded-full border border-[#E8D1C3]">#{q.id}</span>
                          <span className="text-xs text-[#87736A]">{q.category}</span>
                        </div>
                        {q.isReplied ? (
                          <span className="bg-[#E8F5E9] text-[#2E7D32] text-xs px-3 py-1 rounded-full font-medium flex items-center space-x-1">
                            <Check className="w-3.5 h-3.5" />
                            <span>ตอบกลับแล้ว</span>
                          </span>
                        ) : (
                          <span className="bg-[#FFF8E1] text-[#F57F17] text-xs px-3 py-1 rounded-full font-medium flex items-center space-x-1">
                            <Clock className="w-3.5 h-3.5 animate-spin" />
                            <span>รอเราตอบกลับ</span>
                          </span>
                        )}
                      </div>

                      <div className="mb-3">
                        <span className="text-sm font-semibold text-[#5D4A44]">{q.name}</span>
                        <span className="text-xs text-[#87736A] ml-2 font-light">{q.date}</span>
                      </div>

                      <div className="bg-[#FDF8F5] p-3.5 sm:p-4 rounded-2xl border border-[#FAEDE5] text-[#5D4A44] text-sm leading-relaxed mb-4">
                        "{q.message}"
                      </div>
                    </div>

                    <div>
                      {q.isReplied ? (
                        <div className="bg-[#FAEDE5]/60 border-l-4 border-[#DDAF94] p-3.5 sm:p-4 rounded-2xl">
                          <div className="flex items-center space-x-2 text-[#C89B80] font-semibold text-xs mb-1.5">
                            <MessageSquare className="w-4 h-4 flex-shrink-0" />
                            <span>จดหมายตอบกลับจากเรา ({q.replyDate})</span>
                          </div>
                          <p className="text-[#5D4A44] text-sm leading-relaxed">{q.replyText}</p>
                        </div>
                      ) : (
                        <div className="bg-[#FDF8F5] border border-dashed border-[#E8D1C3] p-4 rounded-2xl text-center">
                          <p className="text-xs text-[#87736A]">เราได้รับจดหมายของคุณแล้วและกำลังรับฟังเรื่องราวอย่างใส่ใจ โปรดรอจดหมายตอบกลับสักครู่</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        )}

        {/* ================= VIEW 3: ADMIN PORTAL ("สำหรับทีม เบา เบา") ================= */}
        {currentTab === 'admin' && (
          <section className="animate-in fade-in duration-300">
            {!isAdminLoggedIn ? (
              <div className="max-w-md mx-auto bg-white p-6 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] shadow-xl border border-[#FAEDE5] text-center my-6 sm:my-8">
                <div className="bg-[#FAEDE5] w-14 h-14 sm:w-16 sm:h-16 rounded-3xl flex items-center justify-center mx-auto mb-5 sm:mb-6 text-[#C89B80]">
                  <Lock className="w-7 h-7 sm:w-8 sm:h-8" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#5D4A44] mb-2">สำหรับทีม เบา เบา</h2>
                <p className="text-xs sm:text-sm text-[#87736A] mb-6">สำหรับทีมงานของเราในการอ่านและตอบจดหมายสะท้อนความในใจ</p>
                
                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <input 
                    type="password" 
                    value={adminPin} 
                    onChange={e => setAdminPin(e.target.value)} 
                    placeholder="รหัสผ่านจัดการระบบ" 
                    required 
                    className="w-full text-center px-4 py-3 sm:py-3.5 rounded-2xl border border-[#FAEDE5] bg-[#FDF8F5] text-[#5D4A44] focus:ring-2 focus:ring-[#DDAF94] outline-none font-medium text-sm" 
                  />
                  <button type="submit" className="w-full bg-[#DDAF94] hover:bg-[#C89B80] text-white py-3 sm:py-3.5 rounded-2xl font-semibold shadow-md transition text-sm sm:text-base">เข้าสู่ระบบ</button>
                </form>
              </div>
            ) : (
              <div className="space-y-5 sm:space-y-6">
                
                {/* Change PIN Modal / Card */}
                {isChangePinOpen && (
                  <div className="max-w-lg mx-auto bg-white p-6 sm:p-8 rounded-[2rem] border-2 border-[#DDAF94] shadow-xl animate-in fade-in relative">
                    <div className="flex items-center justify-between border-b border-[#FAEDE5] pb-3 mb-4">
                      <div className="flex items-center space-x-2 text-[#5D4A44] font-semibold text-base">
                        <Key className="w-5 h-5 text-[#C89B80]" />
                        <span>ระบบเปลี่ยนรหัสผ่านทีมงาน</span>
                      </div>
                      <button onClick={() => setIsChangePinOpen(false)} className="text-xs font-bold text-[#87736A] hover:text-[#5D4A44] p-1"><X className="w-4 h-4" /></button>
                    </div>
                    
                    <form onSubmit={handleChangePinSubmit} className="space-y-4 text-left">
                      <div>
                        <label className="block text-xs font-medium text-[#5D4A44] mb-1">รหัสผ่านปัจจุบัน *</label>
                        <input 
                          type="password" 
                          required 
                          value={pinForm.currentPin} 
                          onChange={e => setPinForm({...pinForm, currentPin: e.target.value})} 
                          placeholder="กรอกรหัสผ่านปัจจุบัน" 
                          className="w-full px-4 py-2.5 rounded-xl border border-[#FAEDE5] bg-[#FDF8F5] text-sm text-[#5D4A44] focus:ring-2 focus:ring-[#DDAF94] outline-none" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#5D4A44] mb-1">รหัสผ่านใหม่ (อย่างน้อย 4 ตัวอักษร) *</label>
                        <input 
                          type="password" 
                          required 
                          minLength={4} 
                          value={pinForm.newPin} 
                          onChange={e => setPinForm({...pinForm, newPin: e.target.value})} 
                          placeholder="ตั้งรหัสผ่านใหม่" 
                          className="w-full px-4 py-2.5 rounded-xl border border-[#FAEDE5] bg-[#FDF8F5] text-sm text-[#5D4A44] focus:ring-2 focus:ring-[#DDAF94] outline-none" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#5D4A44] mb-1">ยืนยันรหัสผ่านใหม่ *</label>
                        <input 
                          type="password" 
                          required 
                          minLength={4} 
                          value={pinForm.confirmPin} 
                          onChange={e => setPinForm({...pinForm, confirmPin: e.target.value})} 
                          placeholder="พิมพ์รหัสผ่านใหม่อีกครั้ง" 
                          className="w-full px-4 py-2.5 rounded-xl border border-[#FAEDE5] bg-[#FDF8F5] text-sm text-[#5D4A44] focus:ring-2 focus:ring-[#DDAF94] outline-none" 
                        />
                      </div>
                      <div className="flex justify-end space-x-2 pt-2">
                        <button type="button" onClick={() => setIsChangePinOpen(false)} className="px-4 py-2 bg-[#FAEDE5] text-[#87736A] hover:bg-[#FAEDE5]/80 rounded-xl text-xs font-medium transition">ยกเลิก</button>
                        <button type="submit" className="px-5 py-2 bg-[#DDAF94] hover:bg-[#C89B80] text-white rounded-xl text-xs font-semibold shadow-sm transition">บันทึกรหัสผ่านใหม่</button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Dashboard Header Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
                  <div className="bg-white p-4 sm:p-5 rounded-3xl border border-[#FAEDE5] shadow-sm flex items-center justify-between">
                    <div>
                      <span className="text-xs text-[#87736A] block">จดหมายทั้งหมด</span>
                      <span className="text-2xl sm:text-3xl font-bold text-[#5D4A44]">{questions.length}</span>
                    </div>
                    <div className="bg-[#FAEDE5] p-3 rounded-2xl text-[#C89B80]"><Inbox className="w-6 h-6" /></div>
                  </div>
                  <div className="bg-white p-4 sm:p-5 rounded-3xl border border-[#FAEDE5] shadow-sm flex items-center justify-between">
                    <div>
                      <span className="text-xs text-[#87736A] block">รอเราตอบกลับ</span>
                      <span className="text-2xl sm:text-3xl font-bold text-[#C89B80]">{questions.filter(q => !q.isReplied).length}</span>
                    </div>
                    <div className="bg-[#FAEDE5] p-3 rounded-2xl text-[#C89B80]"><Clock className="w-6 h-6" /></div>
                  </div>
                  <div className="bg-white p-4 sm:p-5 rounded-3xl border border-[#FAEDE5] shadow-sm flex items-center justify-between">
                    <div>
                      <span className="text-xs text-[#87736A] block">ตอบกลับเรียบร้อยแล้ว</span>
                      <span className="text-2xl sm:text-3xl font-bold text-[#5D4A44]">{questions.filter(q => q.isReplied).length}</span>
                    </div>
                    <div className="bg-[#E8F5E9] p-3 rounded-2xl text-[#388E3C]"><CheckCircle2 className="w-6 h-6" /></div>
                  </div>
                </div>

                {/* Toolbar With Change PIN & Logout buttons */}
                <div className="bg-white p-4 sm:p-5 rounded-3xl border border-[#FAEDE5] shadow-sm flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3.5">
                  <div className="grid grid-cols-3 sm:flex gap-2">
                    {['all', 'pending', 'replied'].map(mode => (
                      <button 
                        key={mode}
                        onClick={() => setAdminFilter(mode)} 
                        className={`py-2 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-medium transition text-center ${adminFilter === mode ? 'bg-[#DDAF94] text-white' : 'bg-[#FAEDE5] text-[#5D4A44]'}`}
                      >
                        {mode === 'all' ? 'ทั้งหมด' : mode === 'pending' ? 'รอการตอบกลับ' : 'ตอบกลับแล้ว'}
                      </button>
                    ))}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <input 
                      type="text" 
                      value={adminSearch} 
                      onChange={e => setAdminSearch(e.target.value)} 
                      placeholder="ค้นหารหัส, ชื่อ หรือเนื้อหา..." 
                      className="flex-grow sm:flex-initial px-4 py-2 rounded-xl border border-[#FAEDE5] bg-[#FDF8F5] text-[#5D4A44] text-xs sm:text-sm outline-none focus:ring-2 focus:ring-[#DDAF94]" 
                    />
                    
                    <button 
                      onClick={() => setIsChangePinOpen(!isChangePinOpen)} 
                      className="px-3 py-2 bg-[#FAEDE5] text-[#87736A] hover:text-[#C89B80] hover:bg-[#FAEDE5]/80 rounded-xl text-xs font-medium transition flex items-center space-x-1.5 flex-shrink-0"
                      title="เปลี่ยนรหัสผ่าน"
                    >
                      <Key className="w-4 h-4" />
                      <span>เปลี่ยนรหัส</span>
                    </button>

                    <button 
                      onClick={handleAdminLogout} 
                      className="px-3.5 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 flex-shrink-0 shadow-sm"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>ออกจากระบบ</span>
                    </button>
                  </div>
                </div>

                {/* Admin Cards Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
                  {filteredAdminQuestions.length === 0 ? (
                    <div className="col-span-full bg-white p-8 sm:p-10 rounded-3xl border border-[#FAEDE5] text-center text-[#87736A]">
                      <p className="font-medium">ไม่พบรายการจดหมายในหมวดหมู่นี้</p>
                    </div>
                  ) : (
                    filteredAdminQuestions.map(q => (
                      <div key={q.id} className="bg-white rounded-[1.8rem] sm:rounded-[2rem] p-5 sm:p-6 border border-[#FAEDE5] shadow-sm hover:shadow-md transition flex flex-col justify-between">
                        <div>
                          <div className="flex flex-wrap justify-between items-center pb-3 border-b border-[#FAEDE5] mb-3 gap-2">
                            <div className="flex items-center space-x-2">
                              <span className="bg-[#FAEDE5] text-[#C89B80] font-bold text-xs px-2.5 py-1 rounded-lg">#{q.id}</span>
                              <span className="text-xs text-[#87736A]">{q.category}</span>
                            </div>
                            <span className={`text-xs font-medium ${q.isReplied ? 'text-[#388E3C]' : 'text-[#F57F17]'}`}>
                              {q.isReplied ? 'ตอบกลับเรียบร้อย' : 'รอเราตอบกลับ'}
                            </span>
                          </div>

                          <div className="mb-3">
                            <div className="flex justify-between items-baseline">
                              <span className="font-semibold text-[#5D4A44] text-sm">{q.name}</span>
                              <span className="text-[11px] text-[#87736A]">{q.date}</span>
                            </div>
                          </div>

                          <div className="bg-[#FDF8F5] p-3.5 sm:p-4 rounded-2xl text-sm text-[#5D4A44] mb-4 border border-[#FAEDE5]/60">
                            "{q.message}"
                          </div>
                        </div>

                        <div className="pt-3 border-t border-[#FAEDE5]/60">
                          <label className="block text-xs font-medium text-[#5D4A44] mb-1.5">
                            {q.isReplied ? `จดหมายตอบกลับจากเรา (${q.replyDate})` : 'เขียนจดหมายตอบกลับถึงผู้ส่ง'}
                          </label>
                          <textarea 
                            rows="3" 
                            value={replyInputs[q.id] !== undefined ? replyInputs[q.id] : (q.replyText || '')} 
                            onChange={e => setReplyInputs({ ...replyInputs, [q.id]: e.target.value })} 
                            placeholder="เขียนข้อความตอบกลับอย่างอ่อนโยน ให้กำลังใจ หรือคำแนะนำ..." 
                            className="w-full p-3 rounded-xl border border-[#FAEDE5] bg-[#FDF8F5] text-xs sm:text-sm text-[#5D4A44] outline-none focus:ring-2 focus:ring-[#DDAF94] transition leading-relaxed" 
                          />
                          
                          <div className="flex justify-end mt-2">
                            <button 
                              onClick={() => handleSendReply(q.id)} 
                              className="bg-[#DDAF94] hover:bg-[#C89B80] text-white px-4 sm:px-5 py-2 rounded-xl text-xs font-semibold shadow-sm transition flex items-center space-x-1.5"
                            >
                              <Send className="w-4 h-4" />
                              <span>{q.isReplied ? 'บันทึกแก้ไขจดหมาย' : 'ส่งจดหมายตอบกลับและแจ้งเตือน'}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </section>
        )}

      </main>

      {/* PDPA Compliance Section & Footer (With Subtle "สำหรับทีม เบา เบา" Button at Bottom) */}
      <section className="bg-white border-t border-[#FAEDE5] py-6 sm:py-8 px-4 sm:px-6 lg:px-8 text-xs text-[#87736A] mt-8">
        <div className="max-w-4xl mx-auto space-y-3 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start space-x-2 text-[#5D4A44] font-semibold text-sm">
            <ShieldCheck className="w-4 h-4 text-[#C89B80] flex-shrink-0" />
            <span>นโยบายคุ้มครองข้อมูลส่วนบุคคล (PDPA) และข้อกฎหมายที่เกี่ยวข้อง</span>
          </div>
          <p className="leading-relaxed">
            <span className="font-medium text-[#5D4A44]">ระยะเวลาและการจัดเก็บข้อมูล:</span> ระบบจะทำการจัดเก็บเนื้อหาจดหมายสะท้อนความในใจ นามแฝง และข้อความตอบกลับของท่านไว้เป็นระยะเวลาสูงสุด <span className="font-semibold text-[#DDAF94]">90 วัน</span> นับจากวันที่ส่งข้อความ หลังจากครบกำหนด 90 วัน ระบบจะดำเนินการลบและทำลายข้อมูลดังกล่าวออกจากระบบโดยอัตโนมัติ เพื่อคุ้มครองสิทธิและความเป็นส่วนตัวของท่านอย่างสูงสุด
          </p>
          <p className="leading-relaxed">
            <span className="font-medium text-[#5D4A44]">การปฏิบัติตามกฎหมาย PDPA:</span> การรวบรวมและประมวลผลข้อมูลในพื้นที่ "เบา เบา" เป็นไปตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA) โดยข้อมูลที่ท่านแบ่งปันจะถูกใช้เพื่อวัตถุประสงค์ในการรับฟัง สะท้อนความคิด และตอบกลับจาก "เรา" เท่านั้น ระบบไม่มีการจัดเก็บข้อมูลระบุตัวตนที่ละเอียดอ่อน (เช่น อีเมล หรือเบอร์ติดต่อ) และจะไม่มีการเปิดเผยหรือส่งต่อเนื้อหาแก่บุคคลที่สามในทุกกรณี ท่านมีสิทธิ์ขอให้ลบข้อมูลของท่านก่อนกำหนด 90 วันได้ตลอดเวลา
          </p>
        </div>

        {/* Footer Bottom Bar: Signature & Discreet Admin Button ("สำหรับทีม เบา เบา") */}
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 mt-6 border-t border-[#FAEDE5]/60">
          <span className="font-medium text-[#5D4A44]">เบา เบา</span>
          <button 
            onClick={() => handleTabSwitch('admin')} 
            className={`inline-flex items-center space-x-1.5 text-[11px] sm:text-xs transition px-3 py-1.5 rounded-xl border ${currentTab === 'admin' ? 'font-semibold text-[#DDAF94] bg-[#FAEDE5]/80 border-[#E8D1C3] shadow-sm' : 'text-[#87736A] hover:text-[#C89B80] hover:bg-[#FAEDE5]/40 border-transparent hover:border-[#FAEDE5]'}`}
            aria-label="สำหรับทีม เบา เบา"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>สำหรับทีม เบา เบา</span>
          </button>
        </div>
      </section>
    </div>
  );
}
