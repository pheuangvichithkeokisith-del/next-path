# Next-path — Phase 3 Dashboard Plan

เอกสารนี้เป็นแผนของ Phase 3 สำหรับ Dashboard/Analytics ซึ่งจะพัฒนาใน repo แยกจากเว็บหลัก

## 1. เว็บหลักที่มีอยู่แล้ว

ระบบหลักปัจจุบัน:

```text
Frontend แบบประเมิน
    ↓
Backend รับคำตอบ
    ↓
v4.0 Scoring
    ↓
Report
    ↓
Supabase
```

### ขอบเขตการแก้เว็บหลัก

- Frontend แก้เฉพาะ label และข้อความที่แสดงต่อผู้ใช้
- ไม่เปลี่ยน flow การตอบแบบประเมิน
- ไม่เปลี่ยนสูตร scoring
- ไม่เปลี่ยน API เดิม
- ไม่เปลี่ยนโครงสร้าง Database เดิม
- ไม่เพิ่ม Dashboard ในหน้าเว็บหลัก

## Phase 3: Dashboard/Analytics ใน repo แยก

Dashboard เป็นงานแยกจากเว็บหลัก แม้จะใช้ Backend และ Database ชุดเดียวกัน

```text
Dashboard Frontend
    ↓
Read-only Analytics API
    ↓
Supabase Database
```

ข้อมูลจะถูกบันทึกที่ Supabase เพียงแห่งเดียว Dashboard จะอ่านข้อมูลสรุปผ่าน API และไม่เชื่อมต่อ raw tables จาก Browser โดยตรง

## 3. ขอบเขต Dashboard ระยะเริ่มต้น

Dashboard จะดูข้อมูลภาพรวม ไม่ดึงคำตอบดิบรายบุคคล

ข้อมูลที่ต้องการ:

- ภาพรวมประเทศ
- ภาพรวมรายแขวง
- ภาพรวมรายอำเภอเมื่อมีข้อมูล
- แนวโน้มตามปี/เดือน
- จำนวนผู้ตอบ
- สัดส่วนของเส้นทาง
- อันดับเส้นทาง
- ช่วงเวลาของข้อมูล
- วันที่อัปเดตล่าสุด

Phase นี้ใช้เฉพาะข้อมูลที่เว็บ Next-path เก็บจากผู้ตอบ ไม่รวมหรือนำเข้าข้อมูลจากเว็บไซต์ภายนอก

## 4. งานที่ต้องทำใน Dashboard phase

### Database

- ใช้เวลาส่งคำตอบ `completed_at` แล้ว derive ปี/เดือน/วันใน view
- เก็บ `response_code`, `province_code` และ `age_years` เป็นฟิลด์ที่ query ได้บน session โดยยังเก็บคำตอบดิบใน `answers`
- เพิ่มตาราง `province_catalog` สำหรับ map ตัวเลือกแขวงของเว็บเป็นรหัสอังกฤษ
- เพิ่มตาราง `report_paths` แบบหนึ่งแถวต่อหนึ่งอันดับ เพื่อให้นับเส้นทางได้
- ทำ views สำหรับข้อมูลราย session, คำตอบ และแนวโน้มเส้นทางจากเว็บ
- ไม่เพิ่มตารางนำเข้าข้อมูลภายนอกในขอบเขตนี้

### Backend

- เพิ่ม Read-only Analytics API ใน Backend ปัจจุบันบน Railway
- API อ่านจาก Supabase เป็นหลัก
- API อ่านข้อมูลสรุปจาก views; ไม่ให้ Dashboard browser ต่อ raw database โดยตรง
- แยก endpoint สำหรับ current, trends, provinces และการเปรียบเทียบกลุ่มข้อมูลจากเว็บ
- ไม่สร้างข้อมูลซ้ำและไม่รบกวน API เว็บหลัก

### Dashboard Frontend

- สร้างหน้า Dashboard แยกจากหน้าแบบประเมินและหน้า Report
- แสดงตัวเลข ตาราง และกราฟจาก Analytics API
- ยังไม่กำหนดหน้าตาหรือ chart จนกว่า API contract จะชัดเจน

## 5. API ที่คาดว่าจะใช้

```text
GET /api/v1/analytics/current
GET /api/v1/analytics/trends
GET /api/v1/analytics/provinces
GET /api/v1/analytics/compare
```

API จะส่งข้อมูลสรุป เช่น จำนวนผู้ตอบ สัดส่วน อันดับเส้นทาง ช่วงเวลา และพื้นที่ เพื่อเปรียบเทียบกลุ่มข้อมูลจากเว็บ โดยไม่ส่งข้อมูลดิบรายบุคคลหรือข้อมูลระบุตัวตน

## 6. สิ่งที่ยังไม่อยู่ในขอบเขต

- ไม่เปลี่ยน scoring v4.0
- ไม่รวมสูตร v4.0 กับ v0.9.1
- ไม่เพิ่ม confidence fields
- ไม่ทำ calibration หรือ C5 rebalance
- ไม่เก็บหรือนำเข้าข้อมูลจากเว็บไซต์ภายนอกใน Phase นี้
- ไม่ทำ Dashboard ในเว็บหลัก
- ไม่ย้ายหรือทำสำเนาฐานข้อมูล

## 7. ลำดับการทำงานภายหลัง

```text
กำหนด Database contract
    ↓
กำหนด Analytics API contract
    ↓
สร้าง Analytics API แบบอ่านอย่างเดียว
    ↓
ทดสอบ Current Snapshot และ Historical Trend
    ↓
สร้าง Dashboard Frontend
    ↓
ส่งข้อมูลสรุปให้ Dashboard repo แยก
```

## สถานะปัจจุบัน

- เว็บหลัก: ใช้งานได้แล้ว
- Frontend เว็บหลัก: เปลี่ยนเฉพาะ label เมื่อเริ่มงาน
- Backend เว็บหลัก: ไม่เปลี่ยนในเฟสนี้
- Database production: ไม่เปลี่ยนในเฟสนี้
- Database schema/migration: เพิ่มใน Backend แล้ว; Railway จะ migrate schema ก่อนเปิด API เมื่อ deploy
- Analytics API: งาน Backend หลักที่เหลือ หลัง migration พร้อมใช้งาน
- Dashboard Frontend: อยู่ใน repo แยกและยังไม่เริ่ม implementation
- ขอบเขตข้อมูล Phase 3: เฉพาะข้อมูลที่เก็บจากเว็บ Next-path
