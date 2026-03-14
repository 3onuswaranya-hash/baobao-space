import React, { useState } from 'react';
import { Heart, MessageCircle, Sun, ShieldCheck, Mail, Send, CheckCircle2, Feather } from 'lucide-react';

export default function App() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // ลิงก์ Formspree ของคุณถูกใส่ไว้ตรงนี้แล้วครับ
      const response = await fetch("https://formspree.io/f/xlgplonr", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setIsSubmitting(false);
        setIsSuccess(true);
        setFormData({ name: '', email: '', message: '' });
        
        // ซ่อนข้อความสำเร็จหลังจาก 5 วินาที
        setTimeout(() => {
          setIsSuccess(false);
        }, 5000);
      } else {
        setIsSubmitting(false);
        alert("ขออภัยครับ เกิดข้อผิดพลาดในการส่งข้อความ ลองใหม่อีกครั้งนะครับ");
      }
    } catch (error) {
      setIsSubmitting(false);
      alert("ไม่สามารถเชื่อมต่อได้ในขณะนี้ กรุณาลองใหม่อีกครั้งนะครับ");
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF8F5] text-[#5D4A44] font-sans selection:bg-[#F0D5C6]">
      {/* Navbar */}
      <nav className="fixed w-full bg-[#FDF8F5]/80 backdrop-blur-md z-50 transition-all">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2 text-[#C89B80]">
            <Feather className="w-6 h-6" />
            <span className="text-xl font-bold text-[#5D4A44] tracking-wide">เบา เบา</span>
          </div>
          <div className="hidden md:flex space-x-8">
            <a href="#about" className="text-[#87736A] hover:text-[#C89B80] transition-colors">เกี่ยวกับเรา</a>
            <a href="#services" className="text-[#87736A] hover:text-[#C89B80] transition-colors">บริการ</a>
            <a href="#contact" className="text-[#87736A] hover:text-[#C89B80] transition-colors">พูดคุยกันนะ</a>
          </div>
          <a 
            href="#contact" 
            className="bg-[#DDAF94] hover:bg-[#C89B80] text-white px-5 py-2 rounded-full font-medium transition-all shadow-sm hover:shadow-md"
          >
            เริ่มต้นพูดคุย
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 bg-[#FAEDE5] text-[#A8806A] px-4 py-2 rounded-full mb-6 text-sm font-medium">
            <Sun className="w-4 h-4" />
            <span>พื้นที่เล็กๆ ที่พร้อมรับฟังเสมอ</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#5D4A44] leading-tight mb-6">
            ทิ้งความหนักใจไว้ตรงนี้<br/>ให้ความรู้สึกได้ <span className="text-[#DDAF94]">เบา เบา</span>
          </h1>
          <p className="text-lg md:text-xl text-[#87736A] mb-10 max-w-2xl mx-auto leading-relaxed">
            ไม่ว่าวันนี้จะเจอเรื่องหนักหนาแค่ไหน เราอยากให้ที่นี่เป็นเหมือนมุมโปรดที่คุณสามารถเอนหลัง พักใจ และระบายทุกอย่างออกมาได้อย่างปลอดภัย
          </p>
          <a 
            href="#contact" 
            className="inline-flex items-center space-x-2 bg-[#5D4A44] hover:bg-[#735D56] text-[#FDF8F5] px-8 py-4 rounded-full text-lg font-medium transition-all shadow-md hover:shadow-lg"
          >
            <MessageCircle className="w-5 h-5" />
            <span>เล่าเรื่องของคุณให้เราฟัง</span>
          </a>
        </div>
      </section>

      {/* Value/Features Section */}
      <section id="services" className="py-20 bg-[#FAEDE5]/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-[#FAEDE5] text-center hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-[#FAEDE5] text-[#C89B80] rounded-2xl flex items-center justify-center mx-auto mb-6 transform rotate-3">
                <Heart className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-[#5D4A44]">รับฟังด้วยความเข้าใจ</h3>
              <p className="text-[#87736A] leading-relaxed">
                เราตั้งใจฟังทุกความรู้สึกของคุณโดยไม่ตัดสิน พร้อมเป็นเพื่อนในวันที่คุณต้องการใครสักคน
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-[#FAEDE5] text-center hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-[#FAEDE5] text-[#C89B80] rounded-2xl flex items-center justify-center mx-auto mb-6 -transform rotate-3">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-[#5D4A44]">ปลอดภัยและเป็นความลับ</h3>
              <p className="text-[#87736A] leading-relaxed">
                ทุกตัวอักษรที่คุณพิมพ์มา จะถูกเก็บรักษาไว้อย่างดีที่สุด คุณสามารถเป็นตัวเองได้เต็มที่
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-[#FAEDE5] text-center hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-[#FAEDE5] text-[#C89B80] rounded-2xl flex items-center justify-center mx-auto mb-6 transform rotate-3">
                <Sun className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-[#5D4A44]">โอบกอดความรู้สึก</h3>
              <p className="text-[#87736A] leading-relaxed">
                ส่งมอบความอบอุ่นผ่านตัวอักษร เพื่อให้คุณมีแรงก้าวเดินต่อไปในวันพรุ่งนี้ด้วยใจที่เบาลง
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Direct Contact Form Section */}
      <section id="contact" className="py-24 px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-[2.5rem] shadow-xl shadow-[#E8D1C3]/30 overflow-hidden flex flex-col md:flex-row border border-[#FAEDE5]">
          
          {/* Form Info Side */}
          <div className="md:w-2/5 bg-[#FAEDE5] p-10 text-[#5D4A44] flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white rounded-full opacity-40 blur-2xl"></div>
            <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-[#DDAF94] rounded-full opacity-20 blur-2xl"></div>
            
            <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-4">ระบายมาได้เลยนะ</h2>
              <p className="text-[#87736A] leading-relaxed mb-8">
                พิมพ์สิ่งที่คุณเจอมาในวันนี้ หรือความรู้สึกที่ค้างคาใจอยู่ได้เลย ข้อความจะถูกส่งตรงถึงเราโดยตรง คุณสามารถใช้นามแฝงได้เพื่อความสบายใจ
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3 text-[#735D56]">
                  <Mail className="w-5 h-5 text-[#C89B80]" />
                  <span>care@baobao.space</span>
                </div>
                <div className="flex items-center space-x-3 text-[#735D56]">
                  <ShieldCheck className="w-5 h-5 text-[#C89B80]" />
                  <span>พื้นที่นี้ปลอดภัยสำหรับคุณเสมอ</span>
                </div>
              </div>
            </div>
          </div>

          {/* Form Input Side */}
          <div className="md:w-3/5 p-10 lg:p-12">
            {isSuccess ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in zoom-in duration-500">
                <div className="w-20 h-20 bg-[#FAEDE5] text-[#C89B80] rounded-full flex items-center justify-center mb-2">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-[#5D4A44]">เราได้รับข้อความแล้วนะ</h3>
                <p className="text-[#87736A] max-w-sm">
                  ขอบคุณที่กล้าหาญและแบ่งปันเรื่องราวให้เราฟังนะ เราจะรีบอ่านและตอบกลับคุณอย่างตั้งใจที่สุด
                </p>
                <button 
                  onClick={() => setIsSuccess(false)}
                  className="mt-6 text-[#C89B80] hover:text-[#A8806A] font-medium underline-offset-4 hover:underline"
                >
                  อยากพิมพ์อะไรเพิ่มอีกไหม?
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-[#735D56] mb-2">
                    ให้เราเรียกคุณว่าอะไรดี <span className="text-[#A8806A] font-normal">(นามแฝงก็ได้นะ)</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-[#FAEDE5] bg-[#FDF8F5] focus:bg-white focus:ring-2 focus:ring-[#DDAF94] focus:border-[#DDAF94] transition-colors outline-none text-[#5D4A44] placeholder-[#BCA89F]"
                    placeholder="ใส่ชื่อหรือนามแฝงของคุณ"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-[#735D56] mb-2">
                    อีเมลสำหรับให้เราตอบกลับ <span className="text-[#DDAF94]">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-[#FAEDE5] bg-[#FDF8F5] focus:bg-white focus:ring-2 focus:ring-[#DDAF94] focus:border-[#DDAF94] transition-colors outline-none text-[#5D4A44] placeholder-[#BCA89F]"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-[#735D56] mb-2">
                    เรื่องราวที่คุณอยากเล่า <span className="text-[#DDAF94]">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows="5"
                    value={formData.message}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl border border-[#FAEDE5] bg-[#FDF8F5] focus:bg-white focus:ring-2 focus:ring-[#DDAF94] focus:border-[#DDAF94] transition-colors outline-none text-[#5D4A44] placeholder-[#BCA89F] resize-none"
                    placeholder="พิมพ์เรื่องราว ความกังวล หรือความรู้สึกของคุณที่นี่..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-4 rounded-xl flex items-center justify-center space-x-2 text-white font-medium text-lg transition-all shadow-sm
                    ${isSubmitting 
                      ? 'bg-[#E8D1C3] cursor-not-allowed text-[#87736A]' 
                      : 'bg-[#DDAF94] hover:bg-[#C89B80] hover:shadow-md'
                    }`}
                >
                  {isSubmitting ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white/40 border-t-[#87736A] rounded-full animate-spin"></div>
                      <span className="text-[#87736A]">กำลังส่งความรู้สึก...</span>
                    </div>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>ส่งข้อความถึงเรา</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#EBDAD0] text-[#735D56] py-12 text-center mt-auto">
        <div className="max-w-6xl mx-auto px-4 flex flex-col items-center">
          <div className="flex items-center space-x-2 mb-6 text-[#5D4A44]">
            <Feather className="w-6 h-6 text-[#A8806A]" />
            <span className="text-xl font-bold">เบา เบา</span>
          </div>
          <p className="mb-6 max-w-md mx-auto text-[#87736A]">
            เพราะเราเชื่อว่าแค่มีคนรับฟัง ความหนักอึ้งในใจก็จะลดลง<br/> ให้ทุกวันของคุณเบาขึ้นกว่าเดิม
          </p>
          <div className="w-full max-w-xs border-t border-[#D2BBAE] mb-6"></div>
          <p className="text-sm text-[#A8806A]">
            © {new Date().getFullYear()} เบา เบา (Bao Bao). All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
