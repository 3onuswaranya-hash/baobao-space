import React, { useState } from 'react';
import { Heart, MessageCircle, Sun, ShieldCheck, Mail, Send, CheckCircle2, Feather } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast'; // นำเข้า Toast

export default function App() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch("https://formspree.io/f/xlgplonr", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setIsSubmitting(false);
        setIsSuccess(true);
        toast.success("ส่งความรู้สึกเรียบร้อยแล้วนะ"); // ใช้ Toast แทน Alert
        setFormData({ name: '', email: '', message: '' });
      } else {
        throw new Error();
      }
    } catch (error) {
      setIsSubmitting(false);
      toast.error("เกิดข้อผิดพลาด ลองใหม่อีกครั้งนะ"); // ใช้ Toast แทน Alert
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF8F5] text-[#5D4A44] font-sans">
      <Toaster position="bottom-center" /> {/* วางตัวแจ้งเตือนไว้ที่นี่ */}
      
      {/* Navbar */}
      <nav className="fixed w-full bg-[#FDF8F5]/80 backdrop-blur-md z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2 text-[#C89B80]">
            <Feather className="w-6 h-6" />
            <span className="text-xl font-bold text-[#5D4A44]">เบา เบา</span>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">ทิ้งความหนักใจไว้ตรงนี้<br/>ให้ความรู้สึกได้ <span className="text-[#DDAF94]">เบา เบา</span></h1>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-24 px-4">
        <div className="max-w-xl mx-auto bg-white p-10 rounded-[2.5rem] shadow-xl border border-[#FAEDE5]">
          {isSuccess ? (
            <div className="text-center space-y-4">
              <CheckCircle2 className="w-16 h-16 text-[#C89B80] mx-auto" />
              <h3 className="text-2xl font-bold">เราได้รับข้อความแล้วนะ</h3>
              <button onClick={() => setIsSuccess(false)} className="text-[#C89B80] underline">พิมพ์เพิ่มได้ที่นี่</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">ชื่อหรือนามแฝง</label>
                <input name="name" value={formData.name} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-[#FAEDE5]" placeholder="ใส่ชื่อของคุณ" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">อีเมลสำหรับตอบกลับ *</label>
                <input required name="email" type="email" value={formData.email} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-[#FAEDE5]" placeholder="your@email.com" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">เรื่องราวของคุณ *</label>
                <textarea required name="message" value={formData.message} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-[#FAEDE5]" rows="5" placeholder="พิมพ์ความรู้สึกของคุณที่นี่..."></textarea>
              </div>

              <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-[#DDAF94] text-white rounded-xl font-medium hover:bg-[#C89B80] transition-all">
                {isSubmitting ? "กำลังส่ง..." : "ส่งข้อความถึงเรา"}
              </button>

              {/* Disclaimer เพิ่มเติม */}
              <p className="text-[10px] text-[#A8806A]/70 text-center mt-4 px-2 leading-relaxed">
                *เบา เบา เป็นพื้นที่รับฟังด้วยใจ ไม่ใช่บริการปรึกษาทางจิตวิทยาหรือการรักษาทางการแพทย์ หากคุณกำลังเผชิญกับภาวะวิกฤต โปรดติดต่อสายด่วนสุขภาพจิต 1323 เพื่อความปลอดภัยของคุณเอง
              </p>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
