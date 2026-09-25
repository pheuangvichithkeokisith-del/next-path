# PATHAI Version Archive

เอกสารในโฟลเดอร์นี้แยก “ของเดิมที่ระบบใช้งานจริง” ออกจาก “รุ่น v4.0 ที่เปิดใช้งานแบบ versioned” เพื่อป้องกันการเปลี่ยนคำถามหรือ algorithm โดยไม่ตั้งใจ

## เอกสารหลัก

- [คำถามเดิมและ algorithm รุ่น runtime](./PATHAI_v0.9.1_legacy_questionnaire_and_algorithm.md)
- [PATHAI Career Assessment Instrument v4.0 — Lao proposal](./PATHAI_Career_Assessment_Instrument_v4.0_Lao_proposal.md)

## กติกาการใช้งาน

1. เว็บหลักสร้าง session ด้วย `form_version: v4.0.0` และโหลด `v4.0/questions_full.json` ผ่าน backend version loader
2. `v0.9.1` ยังเก็บไว้เป็น legacy/default API fallback เพื่อรองรับ session และข้อมูลเดิม
3. v4 มี scoring และ report adapter แยกจาก legacy DS engine; ห้ามนำ option codes หรือสูตรข้ามเวอร์ชันโดยตรง
4. การเปลี่ยน algorithm ต้องเพิ่ม version, snapshot, test และ release note ของตัวเอง
5. ถ้าเอกสารกับ source code ขัดกัน ให้ source code และ test ที่ผ่านใน release นั้นเป็นหลัก แล้วแก้เอกสารให้ตรงใน commit เดียวกัน
