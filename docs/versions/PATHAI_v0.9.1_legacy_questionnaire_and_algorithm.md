# PATHAI รุ่นเดิม: คำถามและ algorithm แยกฉบับ

**สถานะ:** รุ่นเดิมที่ต้องรักษาความเข้ากันได้กับระบบปัจจุบัน  
**แบบคำถาม:** `v0.9.1`  
**ขอบเขต:** D1–D3 และ Q1–Q28  
**วันที่บันทึก:** 25 กันยายน 2026

## 1. แหล่งข้อมูลคำถามแบบ canonical

คำถามเดิมไม่ได้ถูกคัดลอกมาเขียนซ้ำในเอกสารนี้ เพราะการคัดลอกจะสร้างความเสี่ยงที่ข้อความหรือน้ำหนักไม่ตรงกัน แหล่งข้อมูลที่ใช้จริงคือ:

- [`data/questions.json`](../../data/questions.json) — frontend form และ dictionary
- [`backend/app/data/questions.json`](../../backend/app/data/questions.json) — backend validation/form source

โครงสร้างที่ต้องคงไว้:

- Demographics: `D1`, `D2`, `D3`
- Assessment: `Q1` ถึง `Q28`
- Option code: `Q{n}-O{m}`
- 8 modules: interests, skills, values, work style, learning, goals, feasibility, journey

## 2. Algorithm รุ่นเดิม/runtime

### 2.1 Signal engine

โค้ดหลักอยู่ที่ [`backend/app/ds/signal_engine.py`](../../backend/app/ds/signal_engine.py) และใช้คำตอบ option code จากแบบคำถามเดิมเป็น input การคำนวณ โดยคำถาม `Q17`, `Q18`, `Q21–Q28` เป็นกลุ่ม non-scoring ตามกติกาใน engine และใช้สำหรับ context/unknowns/strategy ไม่ควรถูกนำไปเพิ่มน้ำหนักเอง

ใน working tree ปัจจุบัน engine ประกาศ `ENGINE_ALGORITHM_VERSION = "1.2.0"` จากการเปลี่ยนแปลงที่มีอยู่เดิมของผู้พัฒนา ส่วน snapshot รุ่นก่อนหน้าถูกเก็บไว้ที่ [`snapshots/v1.1.2.json`](../../snapshots/v1.1.2.json) การเปลี่ยนแปลงสองส่วนนี้ไม่ควรถูกปะปนกับข้อเสนอ v4.0

### 2.2 DS compatibility layer

ชั้น compatibility อยู่ที่ [`backend/app/ds/engine.py`](../../backend/app/ds/engine.py) และรองรับ form version `v0.9.1`/`v0.9.0` ตาม source ปัจจุบัน การแก้คำถามหรือเพิ่ม version ใหม่ต้องเพิ่ม validation และ test คู่กัน ไม่ควรแก้ fallback ให้ยอมรับ schema ใหม่โดยอัตโนมัติ

### 2.3 Release evidence

- baseline snapshot: [`snapshots/v1.1.2.json`](../../snapshots/v1.1.2.json)
- snapshot schema/วิธีตรวจ: [`snapshots/README.md`](../../snapshots/README.md)
- test ของ scoring และ signal engine: [`backend/tests/`](../../backend/tests/)

## 3. สิ่งที่ v4.0 ยังห้ามทำกับรุ่นเดิม

- ห้ามเปลี่ยนจำนวนหรือความหมายของ Q1–Q28 ใน place
- ห้ามเปลี่ยน option code เดิมเพียงเพื่อให้ตรงกับ C1–C7
- ห้ามนำ Profile Correlation, Career Experiment Score หรือ Family Adjustment ไปคูณกับ runtime โดยไม่มี versioned migration
- ห้ามแก้ DS engine/API contract เพียงเพราะเอกสารข้อเสนอระบุสูตรใหม่

## 4. วิธีสร้างรุ่นใหม่อย่างปลอดภัย

ข้อกำหนดนี้ถูกดำเนินการแล้วสำหรับ v4.0.0 ผ่านไฟล์ versioned form, scoring contract, compatibility adapter และ regression checks ที่แยกจากชุดเดิม ผู้ใช้ที่เริ่มด้วย `v0.9.1` ต้องยังอ่านผลเดิมได้เหมือนเดิม และห้ามนำ option code หรือสูตรของ v4 มาปะปนกับ legacy runtime
