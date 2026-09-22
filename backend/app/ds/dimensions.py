from typing import Dict, List, NamedTuple, Set


class ClusterDefinition(NamedTuple):
    group_id: str
    label_lao: str
    description_lao: str
    interest_option_codes: Set[str]
    skill_option_codes: Set[str]
    learning_option_codes: Set[str]


# Canonical 7 Career Clusters (Exploration paths only, no ranking, no prediction)
CANONICAL_CLUSTERS: Dict[str, ClusterDefinition] = {
    "C1": ClusterDefinition(
        group_id="C1",
        label_lao="ສາຍວິເຄາະຂໍ້ມູນ ແລະ ແກ້ໄຂບັນຫາ",
        description_lao="ທິດທາງກ່ຽວກັບການຄິດວິເຄາະ, ການແກ້ໄຂບັນຫາຢ່າງມີລະບົບ ແລະ ວິທະຍາສາດຂໍ້ມູນ",
        interest_option_codes={"Q1-O3", "Q2-O2", "Q3-O1", "Q4-O2"},
        skill_option_codes={"Q5-O1", "Q6-O1"},
        learning_option_codes={"Q14-O1", "Q14-O2", "Q16-O1"},
    ),
    "C2": ClusterDefinition(
        group_id="C2",
        label_lao="ສາຍເທັກໂນໂລຊີ ແລະ ພັດທະນາຊັອບແວ",
        description_lao="ທິດທາງກ່ຽວກັບການພັດທະນາຊັອບແວ, ເທັກໂນໂລຊີດິຈິຕອນ ແລະ ລະບົບຄອມພິວເຕີ",
        interest_option_codes={"Q1-O2", "Q2-O1", "Q3-O3", "Q4-O1"},
        skill_option_codes={"Q5-O2", "Q6-O2", "Q7-O7"},
        learning_option_codes={"Q14-O3", "Q16-O2", "Q20-O5"},
    ),
    "C3": ClusterDefinition(
        group_id="C3",
        label_lao="ສາຍອອກແບບ ແລະ ສ້າງສັນນະວັດຕະກຳ",
        description_lao="ທິດທາງກ່ຽວກັບສິລະປະ, ການອອກແບບ, ສື່ສ້າງສັນ ແລະ ການສ້າງນະວັດຕະກຳໃໝ່",
        interest_option_codes={"Q1-O1", "Q1-O9", "Q2-O4", "Q3-O2", "Q4-O4"},
        skill_option_codes={"Q5-O4", "Q6-O5", "Q7-O2"},
        learning_option_codes={"Q14-O7", "Q14-O8", "Q16-O5", "Q20-O7"},
    ),
    "C4": ClusterDefinition(
        group_id="C4",
        label_lao="ສາຍສື່ສານ, ສັງຄົມ ແລະ ການພັດທະນາຄົນ",
        description_lao="ທິດທາງກ່ຽວກັບການສື່ສານ, ການເຮັດວຽກກັບຄົນ, ການສຶກສາ ແລະ ວຽກງານຊຸມຊົນ",
        interest_option_codes={"Q1-O5", "Q1-O6", "Q2-O3", "Q2-O6", "Q2-O9", "Q3-O5", "Q3-O6", "Q4-O5"},
        skill_option_codes={"Q5-O3", "Q5-O5", "Q6-O3", "Q6-O4", "Q6-O6", "Q7-O4"},
        learning_option_codes={"Q14-O4", "Q14-O5", "Q16-O4", "Q20-O1", "Q20-O4"},
    ),
    "C5": ClusterDefinition(
        group_id="C5",
        label_lao="ສາຍສຸຂະພາບ, ການແພດ ແລະ ການເບິ່ງແຍງ",
        description_lao="ທິດທາງກ່ຽວກັບວິທະຍາສາດສຸຂະພາບ, ການແພດ, ການພະຍາບານ ແລະ ການດູແລ",
        interest_option_codes={"Q1-O6", "Q2-O8", "Q4-O5"},
        skill_option_codes={"Q5-O5"},
        learning_option_codes={"Q14-O9", "Q16-O1", "Q20-O3"},
    ),
    "C6": ClusterDefinition(
        group_id="C6",
        label_lao="ສາຍການຈັດການ ແລະ ທຸລະກິດເທັກໂນໂລຊີ",
        description_lao="ທິດທາງກ່ຽວກັບການບໍລິຫານຈັດການ, ການວາງແຜນ, ການຕະຫຼາດ ແລະ ການສ້າງທຸລະກິດ",
        interest_option_codes={"Q1-O10", "Q2-O5", "Q3-O9", "Q4-O3"},
        skill_option_codes={"Q5-O6", "Q6-O7", "Q7-O3", "Q7-O5"},
        learning_option_codes={"Q14-O6", "Q16-O3", "Q19-O3", "Q20-O6"},
    ),
    "C7": ClusterDefinition(
        group_id="C7",
        label_lao="ສາຍງານປະຕິບັດ, ງານຊ່າງ ແລະ ທຳມະຊາດ",
        description_lao="ທິດທາງກ່ຽວກັບງານຊ່າງເຕັກນິກ, ກະສິກຳ, ທຳມະຊາດ ແລະ ວຽກທີ່ລົງມືປະຕິບັດຈິງ",
        interest_option_codes={"Q1-O7", "Q1-O8", "Q2-O7", "Q3-O7", "Q4-O6"},
        skill_option_codes={"Q5-O7", "Q6-O8", "Q7-O3"},
        learning_option_codes={"Q14-O10", "Q14-O11", "Q16-O6", "Q18-O1", "Q20-O2"},
    ),
}

# Questions mapping for Unknowns labels
QUESTION_DESCRIPTIONS_LAO: Dict[str, str] = {
    "D1": "ຊ່ວງອາຍຸ",
    "D2": "ລະດັບການສຶກສາ",
    "D3": "ແຂວງທີ່ຢູ່ອາໄສ",
    "Q1": "ກິດຈະກຳຍາມວ່າງທີ່ຢາກເຮັດ",
    "Q2": "ທັກສະໃໝ່ທີ່ຢາກຮຽນ",
    "Q3": "ສິ່ງທີ່ເຮັດແລ້ວລືມເວລາ",
    "Q4": "ເນື້ອຫາ ຫຼື ຄລິບທີ່ມັກເບິ່ງ",
    "Q5": "ສິ່ງທີ່ຄົນອື່ນເຄີຍຊົມເຊີຍ",
    "Q6": "ທັກສະທີ່ຄິດວ່າຕົນເອງເຮັດໄດ້ດີ",
    "Q7": "ຜົນງານທີ່ພູມໃຈທີ່ສຸດ",
    "Q8": "ສິ່ງທີ່ສຳຄັນໃນການເຮັດວຽກ",
    "Q9": "ສິ່ງທີ່ຢາກໃຫ້ຄົນອື່ນຈື່ຈຳ",
    "Q10": "ຮູບແບບການເຮັດວຽກທີ່ເໝາະສົມ",
    "Q11": "ວິທີຮັບມືກັບບັນຫາໃໝ່",
    "Q12": "ວິທີຕັດສິນໃຈເລື່ອງສຳຄັນ",
    "Q13": "ສະພາບແວດລ້ອມການເຮັດວຽກທີ່ດີທີ່ສຸດ",
    "Q14": "ດ້ານທີ່ສົນໃຈຢາກຮຽນຮູ້ເພີ່ມ",
    "Q15": "ດ້ານທີ່ຮູ້ສຶກຍາກ ຫຼື ບໍ່ຄ່ອຍສົນໃຈ",
    "Q16": "ທິດທາງການຮຽນ/ພັດທະນາຕົນເອງທີ່ສົນໃຈທີ່ສຸດ",
    "Q17": "ວິທີຮັບມືເມື່ອເຈີສິ່ງທີ່ຍາກ",
    "Q18": "ວິທີຮຽນຮູ້ທີ່ເຂົ້າໃຈດີທີ່ສຸດ",
    "Q19": "ເປົ້າໝາຍໃນອີກ 5 ປີຂ້າງໜ້າ",
    "Q20": "ດ້ານທີ່ຢາກສ້າງຜົນດີໃຫ້ສັງຄົມ",
    "Q21": "ຮູບແບບສະຖານທີ່ເຮັດວຽກໃນອະນາຄົດ",
    "Q22": "ຂໍ້ຈຳກັດຕົວຈິງໃນປັດຈຸບັນ",
    "Q23": "ຄວາມພ້ອມໃນການຍ້າຍຕ່າງແຂວງ",
    "Q24": "ການຈັດການເມື່ອບໍ່ເປັນໄປຕາມແຜນ",
    "Q25": "ຮູບແບບການຮຽນສິ່ງໃໝ່",
    "Q26": "ຄວາມພ້ອມໃນການລົງແຮງໄລຍະຍາວ",
    "Q27": "ເກນການຕັດສິນໃຈເມື່ອມີຫຼາຍທາງເລືອກ",
    "Q28": "ຮູບແບບການຊ່ວຍເຫຼືອທີ່ຕ້ອງການຈາກລະບົບ",
}

# Domain mapping for Subject Match / Tension detection between Q14 and Q15
SUBJECT_DOMAINS: Dict[str, Dict[str, str]] = {
    "math": {"q14": "Q14-O1", "q15": "Q15-O1", "label": "ຄະນິດສາດ/ການຄຳນວນ"},
    "science": {"q14": "Q14-O2", "q15": "Q15-O2", "label": "ວິທະຍາສາດ"},
    "tech": {"q14": "Q14-O3", "q15": "Q15-O3", "label": "ເທັກໂນໂລຊີ/ຄອມພິວເຕີ"},
    "languages": {"q14": "Q14-O4", "q15": "Q15-O4", "label": "ພາສາ/ການສື່ສານ"},
    "humanities": {"q14": "Q14-O5", "q15": "Q15-O5", "label": "ສັງຄົມ/ມະນຸດສາດ"},
    "business": {"q14": "Q14-O6", "q15": "Q15-O6", "label": "ທຸລະກິດ/ເສດຖະສາດ"},
    "art": {"q14": "Q14-O7", "q15": "Q15-O7", "label": "ສິລະປະ/ການອອກແບບ"},
    "music": {"q14": "Q14-O8", "q15": "Q15-O8", "label": "ດົນຕີ/ການສະແດງ"},
    "health": {"q14": "Q14-O9", "q15": "Q15-O9", "label": "ສຸຂະພາບ/ການແພດ"},
    "sports": {"q14": "Q14-O10", "q15": "Q15-O10", "label": "ກິລາ/ການອອກກຳລັງກາຍ"},
    "craft": {"q14": "Q14-O11", "q15": "Q15-O11", "label": "ງານຊ່າງ/ວຽກລົງມືເຮັດ"},
}
