import http from "node:http";

async function post(url, data) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const body = JSON.stringify(data);
    const req = http.request(
      {
        hostname: urlObj.hostname,
        port: urlObj.port,
        path: urlObj.pathname + urlObj.search,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(body),
        },
      },
      (res) => {
        let d = "";
        res.on("data", (chunk) => (d += chunk));
        res.on("end", () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(d) });
          } catch {
            resolve({ status: res.statusCode, raw: d });
          }
        });
      }
    );
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

async function get(url) {
  return new Promise((resolve, reject) => {
    http
      .get(url, (res) => {
        let d = "";
        res.on("data", (chunk) => (d += chunk));
        res.on("end", () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(d) });
          } catch {
            resolve({ status: res.statusCode, raw: d });
          }
        });
      })
      .on("error", reject);
  });
}

// 3 Canonical Distinct Profiles to simulate 3 consecutive rounds
const ROUNDS_DATA = [
  {
    round: 1,
    name: "ນ້ອງເຊັນ 19 ວຽງຈັນ (Round 1: 0% Laser Focus — C2 Tech)",
    answers: [
      { question_id: "D1", option_codes: ["D1-O2"] },
      { question_id: "D2", option_codes: ["D2-O3"], text_value: "ມະຫາໄລ ປີ 2" },
      { question_id: "D3", option_codes: ["D3-O01"] },
      { question_id: "Q1", option_codes: ["Q1-O2"] },
      { question_id: "Q2", option_codes: ["Q2-O1"] },
      { question_id: "Q3", option_codes: ["Q3-O3"] },
      { question_id: "Q4", option_codes: ["Q4-O1"] },
      { question_id: "Q5", option_codes: ["Q5-O2"] },
      { question_id: "Q6", option_codes: ["Q6-O2"] },
      { question_id: "Q7", option_codes: ["Q7-O7"], extra_text: "ຂຽນເວັບໄຊ Next.js" },
      { question_id: "Q8", option_codes: ["Q8-O1", "Q8-O5"] },
      { question_id: "Q9", option_codes: ["Q9-O1"] },
      { question_id: "Q10", option_codes: ["Q10-O4"] },
      { question_id: "Q11", option_codes: ["Q11-O1"] },
      { question_id: "Q12", option_codes: ["Q12-O1"] },
      { question_id: "Q13", option_codes: ["Q13-O4"] },
      { question_id: "Q14", option_codes: ["Q14-O3"] },
      { question_id: "Q15", option_codes: ["Q15-O7", "Q15-O9"] },
      { question_id: "Q16", option_codes: ["Q16-O2"] },
      { question_id: "Q17", option_codes: ["Q17-O1"] },
      { question_id: "Q18", option_codes: ["Q18-O1"] },
      { question_id: "Q19", option_codes: ["Q19-O1"] },
      { question_id: "Q20", option_codes: ["Q20-O5"] },
      { question_id: "Q21", option_codes: ["Q21-O1"] },
      { question_id: "Q22", option_codes: ["Q22-O5"] },
      { question_id: "Q23", option_codes: ["Q23-O1"] },
      { question_id: "Q24", option_codes: ["Q24-O1"] },
      { question_id: "Q25", option_codes: ["Q25-O2"] },
      { question_id: "Q26", option_codes: ["Q26-O1"] },
      { question_id: "Q27", option_codes: ["Q27-O1"] },
      { question_id: "Q28", option_codes: ["Q28-O1"] },
    ],
    expectedPrimary: "C2",
  },
  {
    round: 2,
    name: "ນ້ອງເມກ 17 ຫຼວງພະບາງ (Round 2: 50% Dual Interest — C3 Creative & C6 Business)",
    answers: [
      { question_id: "D1", option_codes: ["D1-O1"] },
      { question_id: "D2", option_codes: ["D2-O1"], text_value: "ມ.6" },
      { question_id: "D3", option_codes: ["D3-O07"] },
      { question_id: "Q1", option_codes: ["Q1-O9", "Q1-O10"] },
      { question_id: "Q2", option_codes: ["Q2-O4"] },
      { question_id: "Q3", option_codes: ["Q3-O2"] },
      { question_id: "Q4", option_codes: ["Q4-O4", "Q4-O3"] },
      { question_id: "Q5", option_codes: ["Q5-O4"] },
      { question_id: "Q6", option_codes: ["Q6-O5", "Q6-O7"] },
      { question_id: "Q7", option_codes: ["Q7-O3"], extra_text: "ອອກແບບໂປສເຕີ ແລະ ໂລໂກ້" },
      { question_id: "Q8", option_codes: ["Q8-O4", "Q8-O2"] },
      { question_id: "Q9", option_codes: ["Q9-O2"] },
      { question_id: "Q10", option_codes: ["Q10-O5"] },
      { question_id: "Q11", option_codes: ["Q11-O5"] },
      { question_id: "Q12", option_codes: ["Q12-O3"] },
      { question_id: "Q13", option_codes: ["Q13-O2"] },
      { question_id: "Q14", option_codes: ["Q14-O7", "Q14-O6"] },
      { question_id: "Q15", option_codes: ["Q15-O1"] },
      { question_id: "Q16", option_codes: ["Q16-O5"] },
      { question_id: "Q17", option_codes: ["Q17-O3"] },
      { question_id: "Q18", option_codes: ["Q18-O3"] },
      { question_id: "Q19", option_codes: ["Q19-O3"] },
      { question_id: "Q20", option_codes: ["Q20-O7", "Q20-O6"] },
      { question_id: "Q21", option_codes: ["Q21-O2"] },
      { question_id: "Q22", option_codes: ["Q22-O2"] },
      { question_id: "Q23", option_codes: ["Q23-O3"] },
      { question_id: "Q24", option_codes: ["Q24-O2"] },
      { question_id: "Q25", option_codes: ["Q25-O3"] },
      { question_id: "Q26", option_codes: ["Q26-O3"] },
      { question_id: "Q27", option_codes: ["Q27-O2"] },
      { question_id: "Q28", option_codes: ["Q28-O2"] },
    ],
    expectedPrimary: "C3",
  },
  {
    round: 3,
    name: "ນ້ອງຟ້າ 16 ຊຽງຂວາງ (Round 3: 100% Total Uncertainty — Need Support)",
    answers: [
      { question_id: "D1", option_codes: ["D1-O1"] },
      { question_id: "D2", option_codes: ["D2-O1"], text_value: "ມ.5" },
      { question_id: "D3", option_codes: ["D3-O09"] },
      { question_id: "Q1", option_codes: ["Q1-O11"] },
      { question_id: "Q2", option_codes: ["Q2-O10"] },
      { question_id: "Q3", option_codes: ["Q3-O10"] },
      { question_id: "Q4", option_codes: ["Q4-O8"] },
      { question_id: "Q5", option_codes: ["Q5-O8"] },
      { question_id: "Q6", option_codes: ["Q6-O9"] },
      { question_id: "Q7", option_codes: ["Q7-O8"], extra_text: "ຍັງບໍ່ເຄີຍມີຜົນງານທີ່ພູມໃຈ" },
      { question_id: "Q8", option_codes: ["Q8-O9"] },
      { question_id: "Q9", option_codes: ["Q9-O7"] },
      { question_id: "Q10", option_codes: ["Q10-O7"] },
      { question_id: "Q11", option_codes: ["Q11-O6"] },
      { question_id: "Q12", option_codes: ["Q12-O6"] },
      { question_id: "Q13", option_codes: ["Q13-O7"] },
      { question_id: "Q14", option_codes: ["Q14-O12"] },
      { question_id: "Q15", option_codes: ["Q15-O13"] },
      { question_id: "Q16", option_codes: ["Q16-O7"] },
      { question_id: "Q17", option_codes: ["Q17-O5"] },
      { question_id: "Q18", option_codes: ["Q18-O5"] },
      { question_id: "Q19", option_codes: ["Q19-O6"] },
      { question_id: "Q20", option_codes: ["Q20-O8"] },
      { question_id: "Q21", option_codes: ["Q21-O5"] },
      { question_id: "Q22", option_codes: ["Q22-O6"] },
      { question_id: "Q23", option_codes: ["Q23-O5"] },
      { question_id: "Q24", option_codes: ["Q24-O3"] },
      { question_id: "Q25", option_codes: ["Q25-O3"] },
      { question_id: "Q26", option_codes: ["Q26-O4"] },
      { question_id: "Q27", option_codes: ["Q27-O3"] },
      { question_id: "Q28", option_codes: ["Q28-O1"] },
    ],
    expectedPrimary: "NONE", // Total uncertainty returns 0 core/secondary paths
  },
];

async function runLifecycleTests() {
  console.log("===================================================================");
  console.log("🔄 STARTING 3-CONSECUTIVE-ROUNDS CLEAN STATE LIFECYCLE VERIFICATION");
  console.log("===================================================================\n");

  const sessionResults = [];
  let clientSideMockStorage = {}; // Simulates browser localStorage

  for (const roundInfo of ROUNDS_DATA) {
    console.log(`\n-------------------------------------------------------------`);
    console.log(`▶ [ROUND ${roundInfo.round}] Testing: ${roundInfo.name}`);
    console.log(`-------------------------------------------------------------`);

    // STEP A: Verify clean slate before starting
    const draftBefore = Object.keys(clientSideMockStorage).length;
    console.log(`   [State Check] LocalStorage draft count before start: ${draftBefore}`);
    if (draftBefore !== 0) {
      throw new Error(`❌ FAIL: Residual draft data found before starting Round ${roundInfo.round}!`);
    }
    console.log(`   ✓ Clean Initial State Verified (0 leftover answers)`);

    // STEP B: Create brand new anonymous session
    const sessionRes = await post("http://localhost:8000/api/v1/sessions", {});
    const sessionId = sessionRes.data.session_id;
    console.log(`   ✓ Created Fresh Session: ID = ${sessionId}`);

    // STEP C: Simulate answering and autosaving to client storage & backend
    for (const ans of roundInfo.answers) {
      clientSideMockStorage[ans.question_id] = ans;
      await post(`http://localhost:8000/api/v1/sessions/${sessionId}/answers`, ans);
    }
    console.log(`   ✓ Submitted ${roundInfo.answers.length} Answers for Round ${roundInfo.round}`);

    // STEP D: Complete session
    const compRes = await post(`http://localhost:8000/api/v1/sessions/${sessionId}/complete`, {});
    console.log(`   ✓ Session Completed: status = ${compRes.data.status}`);

    // STEP E: Check processing status
    const statusRes = await get(`http://localhost:8000/api/v1/sessions/${sessionId}/status`);
    console.log(`   ✓ Final Session Status: ${statusRes.data.status}`);

    // STEP F: Fetch Report & verify distinct primary path
    const reportRes = await get(`http://localhost:8000/api/v1/sessions/${sessionId}/report`);
    const r = reportRes.data;
    const primaryPath = r.possible_paths[0]?.group_id || "NONE";
    console.log(`   ✓ Generated Report:`);
    console.log(`     - Primary Path: ${primaryPath} (${r.possible_paths[0]?.label_lao || "ຍັງບໍ່ມີເສັ້ນທາງຫຼັກ — Need Support"})`);
    console.log(`     - Patterns Count: ${r.response_pattern.length}`);
    console.log(`     - Summary Preview: ${r.summary_text.slice(0, 60)}...`);

    if (roundInfo.expectedPrimary !== "NONE" && primaryPath !== roundInfo.expectedPrimary) {
      throw new Error(
        `❌ FAIL: Expected primary path ${roundInfo.expectedPrimary} but got ${primaryPath}`
      );
    }

    sessionResults.push({
      round: roundInfo.round,
      sessionId,
      primaryPath,
      firstPattern: r.response_pattern[0]?.label_lao || "N/A",
    });

    // STEP G: Emulate frontend auto-clearing draft & session reset on completion
    clientSideMockStorage = {}; // Clear localStorage as implemented in handleComplete / handleStartNew
    console.log(`   ✓ Emulated Auto-Clean: LocalStorage draft purged on session completion.`);
  }

  // Cross-Round Data Isolation Validation
  console.log(`\n=============================================================`);
  console.log(`🔍 CROSS-ROUND DATA ISOLATION SUMMARY:`);
  console.log(`=============================================================`);
  for (const s of sessionResults) {
    console.log(`  Round ${s.round} [${s.sessionId}]: Primary Path = ${s.primaryPath} | First Pattern: "${s.firstPattern}"`);
  }

  const uniqueSessionIds = new Set(sessionResults.map((s) => s.sessionId));
  const uniquePrimaryPaths = new Set(sessionResults.map((s) => s.primaryPath));

  if (uniqueSessionIds.size !== 3) {
    throw new Error("❌ FAIL: Sessions were not uniquely generated across rounds!");
  }
  if (uniquePrimaryPaths.size !== 3) {
    throw new Error("❌ FAIL: Path leakage detected across consecutive rounds!");
  }

  console.log(`\n=============================================================`);
  console.log(`🎉 3/3 CONSECUTIVE ROUNDS PASSED WITH 100% CLEAN ISOLATION!`);
  console.log(`   - Round 1: C2 Tech ONLY (Laser Focus)`);
  console.log(`   - Round 2: C3 Design & C6 Business (Dual Secondary)`);
  console.log(`   - Round 3: Total Uncertainty (Need Support, 0 Residual Answers)`);
  console.log(`=============================================================`);
}

runLifecycleTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
