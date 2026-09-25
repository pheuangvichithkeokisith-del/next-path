# PATHAI v4.0 — ບົດສະທ້ອນຕົນເອງ

> ຮ່າງລາຍງານສຳລັບການສຳຫຼວດ ບໍ່ແມ່ນການວິນິດໄສ ຫຼື ຄຳຕັດສິນອາຊີບຖາວອນ

## ພາບລວມ

- **Version:** `{{ version }}`
- **Archetype:** `{{ archetype }}`
- **ສາຍຫຼັກ:** `{{ top_cluster }}`
- **ຄວາມຊັດເຈນ:** `{{ r_max }}`

## ຄະແນນ C1–C7

| ສາຍ | ຄະແນນ |
|---|---:|
| C1 ວິເຄາະ/ວິໄຈ | `{{ scores.C1 }}` |
| C2 ເທັກໂນໂລຊີ | `{{ scores.C2 }}` |
| C3 ອອກແບບ/ສ້າງສັນ | `{{ scores.C3 }}` |
| C4 ພັດທະນາຄົນ | `{{ scores.C4 }}` |
| C5 ສຸຂະພາບ/ເບິ່ງແຍງ | `{{ scores.C5 }}` |
| C6 ທຸລະກິດ/ຈັດການ | `{{ scores.C6 }}` |
| C7 ປະຕິບັດ/ທຳມະຊາດ | `{{ scores.C7 }}` |

## ບໍລິບົດການວາງແຜນ

- **Risk willingness:** `{{ context.risk_willingness }}`
- **Safety readiness:** `{{ context.safety_readiness }}`
- **ຂໍ້ຈຳກັດ:** `{{ context.constraints }}`
- **ຄວາມຄ່ອງຕົວໃນການຍ້າຍ:** `{{ context.mobility }}`
- **ບໍລິບົດຄອບຄົວ:** `{{ context.family_context }}`

## ກ້າວຕໍ່ໄປ

1. ເລືອກ micro-experiment ທີ່ປອດໄພ 1 ຢ່າງ
2. ສັງເກດວ່າມີພະລັງງານ/ຄວາມສົນໃຈເພີ່ມຂຶ້ນຫຼືບໍ່
3. ຄຸຍກັບຄອບຄົວ ຫຼື ອາຈານໂດຍໃຊ້ຂໍ້ມູນບໍລິບົດເປັນຫຼັກ

## ຂໍ້ຈຳກັດຂອງຜົນ

Template, weights, thresholds ແລະ risk/safety heuristics ແມ່ນຮ່າງ v4.0 ທີ່ຕ້ອງຜ່ານ expert review ແລະ pilot validation ກ່ອນນຳໃຊ້ຈິງ.
