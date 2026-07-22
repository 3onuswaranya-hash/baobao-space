-- นำโค้ดชุดนี้ไปวางในเมนู SQL Editor แล้วกด "Run" เพื่ออัปเดตฟังก์ชันเปลี่ยนรหัสผ่านครับ
CREATE OR REPLACE FUNCTION admin_change_pin(p_old_pin text, p_new_pin text) 
RETURNS void AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM admin_settings WHERE pin_hash = crypt(p_old_pin, pin_hash)) THEN
    TRUNCATE admin_settings;
    INSERT INTO admin_settings VALUES (crypt(p_new_pin, gen_salt('bf')));
  ELSE
    RAISE EXCEPTION 'รหัสผ่านไม่ถูกต้อง';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
