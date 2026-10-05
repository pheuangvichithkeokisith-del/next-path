# Phase 3 — Database Sector (ข้อมูลจากเว็บ Next-path)

เอกสารนี้กำหนดโครงสร้างข้อมูลสำหรับการวิเคราะห์คำตอบที่เก็บจากเว็บ Next-path เท่านั้น Dashboard จะพัฒนาใน repo แยก ส่วนฐานข้อมูลยังเป็นแหล่งข้อมูลหลักชุดเดิม

## เป้าหมายและขอบเขต

- วิเคราะห์ภาพรวมระดับประเทศและรายแขวงจากแบบประเมินของเว็บ
- รองรับแนวโน้มรายปี/เดือน และอันดับเส้นทางที่ระบบคำนวณให้ผู้ตอบ
- เก็บคำตอบดิบเป็นแหล่งข้อมูลต้นทาง และเก็บผลคำนวณแยกจากคำตอบ
- ไม่รวมการนำเข้าข้อมูลจากเว็บไซต์ภายนอกหรือสถิติแรงงานภายนอกใน Phase นี้
- ไม่เพิ่ม Dashboard เข้าในเว็บแบบประเมิน และไม่เปลี่ยน flow การตอบ

## ตารางปัจจุบัน

| ตาราง | หน้าที่ | ข้อสังเกต |
|---|---|---|
| `sessions` | session, form version, สถานะ และเวลาสร้าง/ตอบเสร็จ | ใช้ `completed_at` เป็นเวลาหลักของการส่งคำตอบ |
| `answers` | คำตอบดิบหนึ่งแถวต่อคำถามต่อ session | มี unique key ที่ `(session_id, question_id)` |
| `reports` | ผลคำนวณและข้อความสำหรับแสดงรายงาน | JSON เป็น snapshot สำหรับอ่านรายงาน ไม่ใช่รูปหลักสำหรับ aggregate |
| `feedbacks` | ความเห็นหลังอ่านรายงาน | ผูกกับ session |

ตารางเหล่านี้เป็นโครงสร้างที่ใช้อยู่จริงใน Backend ปัจจุบัน การเปลี่ยนแปลงใน Phase 3 ต้องต่อยอดแบบ migration และรักษาการอ่านข้อมูลเดิมได้

หลัง migration รอบเตรียมข้อมูล ตาราง `sessions` จะมี `response_code`, `province_code` และ `age_years` เพิ่มเพื่อให้ข้อมูลหลักที่เว็บถามนำไปกรองและวิเคราะห์ได้โดยตรง โดย `answers` ยังคงเป็น raw source of truth

## หลักการเก็บคำตอบ

- เก็บคำตอบดิบและ form version ไว้ ไม่เขียนทับด้วยผลวิเคราะห์
- `answers` เก็บหนึ่งแถวต่อคำถาม โดย `option_codes` เป็น JSON array สำหรับตัวเลือก (รวมกรณี multi-select) และแยก `text_value`, `other_text`, `extra_text` ตามชนิดคำตอบ
- คง `option_codes` เป็น JSON array ในระยะแรกได้ ไม่ต้องแตกทุกตัวเลือกเป็นตารางเพิ่มทันที
- ตอนปิด session Backend คัดลอกอายุจาก `D1` เป็นจำนวนเต็มใน `sessions.age_years` และ map ตัวเลือก `D3` ไป `sessions.province_code`
- ความสัมพันธ์ `sessions.province_code` อ้างอิง `province_catalog`; เก็บรหัสแขวงภาษาอังกฤษและ label ภาษาลาวไว้ใน catalog ไม่พิมพ์ชื่อซ้ำใน session
- ค่าที่คัดลอกลง `sessions` เป็นข้อมูลที่ derive จากคำตอบเพื่อ query ได้ง่าย; คำตอบเดิมใน `answers` ยังคงเป็นหลักสำหรับตรวจสอบและคำนวณใหม่
- ปัจจุบันแบบประเมินไม่ได้เก็บอำเภอ จึงไม่สร้างข้อมูลอำเภอขึ้นเอง; เพิ่มได้เมื่อเว็บเริ่มถามและเก็บข้อมูลนั้น

## เวลาและรหัสผู้ตอบ

- ใช้ `sessions.completed_at` เป็นเวลาส่งคำตอบ แล้ว derive ปี/เดือน/วันใน view; ไม่เก็บคอลัมน์ปี เดือน วันซ้ำ
- คง UUID เป็น Primary Key ภายในระบบ
- เพิ่ม `response_code` ที่อ่านง่าย เช่น `2026-VTE-000001` สำหรับอ้างอิงผลตอบแบบไม่ใช้ชื่อผู้ตอบ
- ออก `response_code` หลังมีคำตอบแขวงและปิด session แล้ว รูปแบบต้องมี unique constraint และจัดลำดับแบบปลอดภัยเมื่อมีหลาย session พร้อมกัน
- ใช้ `response_counters` จัดลำดับแยกตามปีและรหัสแขวง; ถ้าไม่ตอบแขวงให้ใช้ `UNK`
- รหัสอาชีพ/เส้นทางและหมวดหมู่ห้ามนำไปใส่ใน `response_code`

## ผลคำนวณที่ใช้วิเคราะห์

`reports.possible_paths` คงไว้เป็น snapshot สำหรับให้เว็บแสดงรายงานได้ แต่การนับเส้นทางและอันดับให้ใช้ตารางเชิงสัมพันธ์เพิ่ม:

### `report_paths`

หนึ่งแถวต่อหนึ่งเส้นทางที่ระบบจัดอันดับในรายงาน:

- `id` — Primary Key
- `report_id` — Foreign Key ไป `reports.id`
- `rank` — ลำดับ 1, 2, หรือ 3
- `path_code` — รหัสเส้นทาง เช่น C1–C7 ใน scoring version ปัจจุบัน
- `label_lao` — ป้ายชื่อที่แสดงในรายงาน ณ เวลาคำนวณ
- `classification`
- `fit_score`, `feasibility_score`, `compatibility_score`
- `scoring_version`
- unique constraint ที่ `(report_id, rank)`

บันทึกแถวเหล่านี้พร้อมการสร้าง/ปรับรายงาน และให้ Backend อ่าน snapshot เดิมเพื่อแสดงผลต่อไปได้ การเก็บ JSON ใน `reports` จึงมีไว้เพื่อการแสดงผล ส่วน `report_paths` ใช้เป็นข้อมูลผลลัพธ์สำหรับ query/aggregate

ข้อมูลหมวดหมู่อาชีพและทักษะยังไม่ต้องกำหนดรหัสตายตัวในตอนเก็บคำตอบ เมื่อมี taxonomy ที่ตกลงแล้วจึงเพิ่ม catalog/mapping แยก โดยไม่แก้ raw answers

## View สำหรับวิเคราะห์ข้อมูลจากเว็บ

ใช้ read-only views เป็นชั้นจัดรูปข้อมูลจากตารางจริง ไม่เก็บยอดรวมซ้ำในตารางคำตอบ:

- `v_response_dataset` — หนึ่งแถวต่อ completed session พร้อม response code, วันส่ง, form/scoring version, อายุ และรหัสแขวง
- `v_response_answers` — คำตอบต่อข้อในรูปที่นำไป pivot หรือวิเคราะห์ต่อได้
- `v_path_outcomes` — หนึ่งแถวต่อ session ต่ออันดับเส้นทาง
- `v_national_path_trends`, `v_province_path_trends`, `v_yearly_path_trends` — สรุปจำนวนและสัดส่วนจากผู้ตอบเว็บ

ทุกสัดส่วนต้องมีจำนวนผู้ตอบที่ใช้เป็นตัวหาร และช่วงวันที่ข้อมูลล่าสุด ถ้ากลุ่มผู้ตอบในพื้นที่มีจำนวนน้อย ให้รวม/ซ่อนผลในชั้น API หรือ Dashboard

## Workflow

```text
สร้าง session
    ↓
เก็บคำตอบดิบใน answers
    ↓
ผู้ตอบทำแบบประเมินครบและปิด session
    ↓
บันทึก completed_at และ response_code
    ↓
คำนวณและบันทึก reports + report_paths
    ↓
views จัดรูปข้อมูลของเว็บเพื่อการวิเคราะห์
    ↓
Read-only Analytics API ส่งข้อมูลสรุปให้ Dashboard repo แยก
```

## ข้อกำหนดการเปลี่ยน schema

1. ทำผ่าน Alembic migration แบบ additive และรองรับข้อมูลเก่าที่ไม่มี `response_code` หรือ `report_paths`
2. รักษาตารางเดิมและข้อมูล raw answers; ห้ามลบหรือเขียนทับคำตอบเดิม
3. เพิ่ม catalog เฉพาะข้อมูลที่เว็บเก็บจริง เช่น รหัสแขวง; ยังไม่สร้างอำเภอหรือข้อมูลสถิติจากภายนอก
4. ตรวจ unique/FK และทดสอบ migration กับฐานข้อมูลสำรองก่อน deploy
5. ไม่ apply migration กับ production จนกว่าจะตรวจ migration และแผน backfill เสร็จ

## สถานะ

- เว็บ production และการบันทึก session/answers/reports/feedbacks: ใช้งานแล้ว
- ข้อกำหนด Database Sector สำหรับข้อมูลจากเว็บ: บันทึกในเอกสารนี้
- `report_paths`, `response_code`, typed age/province fields และ province mapping: เพิ่มใน Backend และ Alembic migration แล้ว; production จะรับ migration ตอน Railway deploy
- Analytics views: ยังไม่ implement
- ข้อมูลจากเว็บไซต์ภายนอก: อยู่นอกขอบเขตงานนี้
- Dashboard และ Analytics API: Phase 3, Dashboard อยู่ repo แยก
