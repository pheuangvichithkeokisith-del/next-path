# PATHAI Version Archive

เอกสารในโฟลเดอร์นี้แยก “ของเดิมที่ระบบใช้งานจริง” ออกจาก “ข้อเสนอรุ่นใหม่” เพื่อป้องกันการเปลี่ยนคำถามหรือ algorithm โดยไม่ตั้งใจ

## เอกสารหลัก

- [คำถามเดิมและ algorithm รุ่น runtime](./PATHAI_v0.9.1_legacy_questionnaire_and_algorithm.md)
- [PATHAI Career Assessment Instrument v4.0 — Lao proposal](./PATHAI_Career_Assessment_Instrument_v4.0_Lao_proposal.md)

## กติกาการใช้งาน

1. ระบบปัจจุบันยังใช้ `D1–D3` และ `Q1–Q28` จาก `data/questions.json` และ `backend/app/data/questions.json` (`form_version: v0.9.1`)
2. ห้ามนำคำถาม น้ำหนัก หรือสูตรจาก v4.0 ไปแทน runtime จนกว่าจะผ่านการตรวจเนื้อหาและการทดสอบความเข้ากันได้
3. การเปลี่ยน algorithm ต้องเพิ่ม version, snapshot, test และ release note ของตัวเอง
4. ถ้าเอกสารกับ source code ขัดกัน ให้ source code และ test ที่ผ่านใน release นั้นเป็นหลัก
