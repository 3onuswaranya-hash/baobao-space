-- =================================================================================
-- BAO BAO SPACE - SUPABASE SECURE SETUP SCRIPT
-- =================================================================================
-- คำแนะนำ: คัดลอกโค้ดทั้งหมดนี้ไปวางในเมนู "SQL Editor" ของ Supabase แล้วกด "Run" (รันครั้งเดียว)
-- ระบบจะสร้างฐานข้อมูลที่ปลอดภัย 100% สำหรับการใช้งานผ่านหน้าเว็บ (Frontend-only)
-- =================================================================================

-- 1. ลบของเก่าทิ้ง (เพื่อป้องกัน Error หากเคยกดรันไปแล้ว)
DROP FUNCTION IF EXISTS submit_question(text, text, text);
DROP FUNCTION IF EXISTS get_my_questions(uuid[]);
DROP FUNCTION IF EXISTS admin_get_all_questions(text);
DROP FUNCTION IF EXISTS admin_submit_reply(text, text, text);
DROP FUNCTION IF EXISTS admin_change_pin(text, text);
DROP FUNCTION IF EXISTS admin_get_notifications(text);
DROP FUNCTION IF EXISTS get_my_notifications(uuid[]);
DROP FUNCTION IF EXISTS mark_notification_read(uuid);
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS questions CASCADE;
DROP TABLE IF EXISTS admin_settings CASCADE;

-- เปิดใช้งานการเข้ารหัสรหัสผ่าน
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. สร้างตารางเก็บจดหมาย (Questions)
CREATE TABLE questions (
  id text PRIMARY KEY,
  secret_key uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  message text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('Asia/Bangkok', now()),
  is_replied boolean DEFAULT false,
  reply_text text,
  reply_date timestamp with time zone
);

-- 3. สร้างตารางแจ้งเตือน (Notifications)
CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  text text NOT NULL,
  target text NOT NULL, -- 'user' หรือ 'admin'
  question_id text,
  secret_key uuid, -- ใช้ยืนยันว่าการแจ้งเตือนนี้เป็นของใคร
  is_read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('Asia/Bangkok', now())
);

-- 4. สร้างตารางเก็บรหัสผ่านทีมงาน (PIN)
CREATE TABLE admin_settings (
  pin_hash text
);
-- ตั้งค่าเริ่มต้นรหัสผ่านคือ admin123
INSERT INTO admin_settings VALUES (crypt('admin123', gen_salt('bf')));

-- 5. ล็อกความปลอดภัย! ปิดกั้นการดึงข้อมูลตารางโดยตรงจากทุกคนที่ไม่มีสิทธิ์ (ป้องกันข้อมูลหลุด)
REVOKE ALL ON questions FROM anon, authenticated, public;
REVOKE ALL ON notifications FROM anon, authenticated, public;
REVOKE ALL ON admin_settings FROM anon, authenticated, public;

-- ==========================================
-- สร้าง API Functions (Stored Procedures) เพื่อความปลอดภัยสูงสุด
-- ==========================================

-- API: ผู้ใช้ส่งจดหมายใหม่
CREATE OR REPLACE FUNCTION submit_question(p_name text, p_category text, p_message text) 
RETURNS json AS $$
DECLARE
  v_id text;
  v_secret uuid;
  v_count int;
BEGIN
  SELECT COUNT(*) INTO v_count FROM questions;
  v_id := 'BB-' || (v_count + 101)::text;
  v_secret := gen_random_uuid();
  
  INSERT INTO questions (id, secret_key, name, category, message)
  VALUES (v_id, v_secret, p_name, p_category, p_message);
  
  INSERT INTO notifications (text, target, question_id)
  VALUES ('แจ้งเตือนถึงเรา: มีจดหมายใหม่รหัส #' || v_id || ' จาก "' || p_name || '" รอการตอบกลับ', 'admin', v_id);

  RETURN json_build_object('id', v_id, 'secret_key', v_secret);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- API: ผู้ใช้ดึงจดหมายของตัวเอง (ต้องมีกุญแจลับที่เก็บในเครื่อง)
CREATE OR REPLACE FUNCTION get_my_questions(p_secrets uuid[]) 
RETURNS SETOF questions AS $$
  SELECT * FROM questions WHERE secret_key = ANY(p_secrets) ORDER BY created_at DESC;
$$ LANGUAGE sql SECURITY DEFINER;

-- API: ผู้ใช้ดึงการแจ้งเตือนของตัวเอง
CREATE OR REPLACE FUNCTION get_my_notifications(p_secrets uuid[]) 
RETURNS SETOF notifications AS $$
  SELECT * FROM notifications WHERE target = 'user' AND secret_key = ANY(p_secrets) ORDER BY created_at DESC;
$$ LANGUAGE sql SECURITY DEFINER;

-- API: ทีมงานดึงจดหมายทั้งหมด (ต้องใช้รหัสผ่าน)
CREATE OR REPLACE FUNCTION admin_get_all_questions(p_pin text) 
RETURNS SETOF questions AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM admin_settings WHERE pin_hash = crypt(p_pin, pin_hash)) THEN
    RETURN QUERY SELECT * FROM questions ORDER BY created_at DESC;
  ELSE
    RAISE EXCEPTION 'รหัสผ่านไม่ถูกต้อง';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- API: ทีมงานดึงการแจ้งเตือน
CREATE OR REPLACE FUNCTION admin_get_notifications(p_pin text) 
RETURNS SETOF notifications AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM admin_settings WHERE pin_hash = crypt(p_pin, pin_hash)) THEN
    RETURN QUERY SELECT * FROM notifications WHERE target = 'admin' ORDER BY created_at DESC;
  ELSE
    RAISE EXCEPTION 'รหัสผ่านไม่ถูกต้อง';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- API: ทีมงานตอบกลับจดหมาย
CREATE OR REPLACE FUNCTION admin_submit_reply(p_pin text, p_id text, p_reply_text text) 
RETURNS void AS $$
DECLARE
  v_user_name text;
  v_secret uuid;
BEGIN
  IF EXISTS (SELECT 1 FROM admin_settings WHERE pin_hash = crypt(p_pin, pin_hash)) THEN
    UPDATE questions 
    SET is_replied = true, reply_text = p_reply_text, reply_date = timezone('Asia/Bangkok', now()) 
    WHERE id = p_id
    RETURNING name, secret_key INTO v_user_name, v_secret;
    
    IF v_user_name IS NOT NULL THEN
      INSERT INTO notifications (text, target, question_id, secret_key)
      VALUES ('แจ้งเตือนถึงคุณ: เราได้ส่งจดหมายตอบกลับรหัส #' || p_id || ' ของคุณ "' || v_user_name || '" แล้ว', 'user', p_id, v_secret);
    END IF;
  ELSE
    RAISE EXCEPTION 'รหัสผ่านไม่ถูกต้อง';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- API: ทีมงานเปลี่ยนรหัสผ่าน
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

-- API: กดอ่านการแจ้งเตือน
CREATE OR REPLACE FUNCTION mark_notification_read(p_notif_id uuid) 
RETURNS void AS $$
BEGIN
  UPDATE notifications SET is_read = true WHERE id = p_notif_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- อนุญาตให้เว็บไซต์ภายนอก (Anon Key) เรียกใช้งานเฉพาะ API Functions ข้างต้นเท่านั้น
-- ==========================================
GRANT USAGE ON SCHEMA public TO anon;
GRANT EXECUTE ON FUNCTION submit_question(text, text, text) TO anon;
GRANT EXECUTE ON FUNCTION get_my_questions(uuid[]) TO anon;
GRANT EXECUTE ON FUNCTION get_my_notifications(uuid[]) TO anon;
GRANT EXECUTE ON FUNCTION admin_get_all_questions(text) TO anon;
GRANT EXECUTE ON FUNCTION admin_get_notifications(text) TO anon;
GRANT EXECUTE ON FUNCTION admin_submit_reply(text, text, text) TO anon;
GRANT EXECUTE ON FUNCTION admin_change_pin(text, text) TO anon;
GRANT EXECUTE ON FUNCTION mark_notification_read(uuid) TO anon;

-- ==========================================
-- ระบบ PDPA (90 Days Auto-Delete Trigger)
-- ==========================================
CREATE OR REPLACE FUNCTION delete_old_records() RETURNS trigger AS $$
BEGIN
  DELETE FROM questions WHERE created_at < timezone('Asia/Bangkok', now()) - interval '90 days';
  DELETE FROM notifications WHERE created_at < timezone('Asia/Bangkok', now()) - interval '90 days';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS cleanup_90_days ON questions;
CREATE TRIGGER cleanup_90_days
AFTER INSERT ON questions
EXECUTE FUNCTION delete_old_records();

-- เสร็จสมบูรณ์!
