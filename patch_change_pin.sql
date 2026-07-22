-- นำโค้ดชุดนี้ไปวางในเมนู SQL Editor แล้วกด "Run" เพื่ออัปเดตฟังก์ชันเปลี่ยนรหัสผ่านครับ
CREATE OR REPLACE FUNCTION admin_change_pin(p_old_pin text, p_new_pin text) 
RETURNS void AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM admin_settings WHERE pin_hash = crypt(p_old_pin, pin_hash)) THEN
    -- แพลตฟอร์ม Supabase บังคับให้ต้องมี WHERE เสมอเพื่อความปลอดภัย (Safe Update)
    UPDATE admin_settings 
    SET pin_hash = crypt(p_new_pin, gen_salt('bf')) 
    WHERE pin_hash = crypt(p_old_pin, pin_hash);
  ELSE
    RAISE EXCEPTION 'รหัสผ่านไม่ถูกต้อง';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
