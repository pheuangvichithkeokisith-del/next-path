import json
import math
import sys
from collections import defaultdict
from app.ds.signal_engine import (
    CLUSTERS,
    POSITIVE_SIGNALS,
    NEGATIVE_SIGNALS,
    SECTION_WEIGHTS,
    SECTION_QUESTIONS,
    NON_SCORING_QUESTIONS,
    QUESTION_TYPE,
    UNCERTAIN_OPTION_CODES,
    PREFER_NOT_OPTION_CODES,
    NO_SIGNAL_CODES,
    FEASIBILITY_PENALTIES,
    LOCATION_SENSITIVITY,
    TIME_SENSITIVITY,
    PHYSICAL_SENSITIVITY,
    compute_shannon_entropy_ratio,
    evaluate_signals
)
from app.ds.dimensions import (
    CANONICAL_CLUSTERS,
    QUESTION_DESCRIPTIONS_LAO,
    SUBJECT_DOMAINS
)

# Load questions.json for option text & full questions
with open("data/questions.json", "r", encoding="utf-8") as f:
    q_data = json.load(f)

# Build question & option lookup maps
questions_list = q_data.get("questions", [])
demographics_list = q_data.get("demographics", [])

q_map = {q["id"]: q for q in questions_list}
opt_text_map = {}
for q in questions_list:
    for opt in q.get("options", []):
        opt_text_map[opt["code"]] = opt.get("text", "")

# Also add demographic options if any
for d in demographics_list:
    for opt in d.get("options", []):
        opt_text_map[opt["code"]] = opt.get("text", "")

print("=== DELIVERABLE 1: QUESTION INVENTORY ===")
# Questions Q1 to Q28
inv_rows = []
for q_num in range(1, 29):
    qid = f"Q{q_num}"
    q_obj = q_map.get(qid)
    # Section determination
    sec = None
    for s_name, s_qids in SECTION_QUESTIONS.items():
        if qid in s_qids:
            sec = s_name
            break
    if not sec:
        if qid == "Q15":
            sec = "negative_signals"
        elif q_num in [17, 18]:
            sec = "learning_style"
        elif q_num == 21:
            sec = "workplace_environment"
        elif q_num in [22, 23]:
            sec = "constraints_feasibility"
        elif q_num in range(24, 28):
            sec = "journey_orientation"
        elif q_num == 28:
            sec = "system_support"
        else:
            sec = "general"

    text_lao = q_obj.get("stem", "[MISSING]") if q_obj else QUESTION_DESCRIPTIONS_LAO.get(qid, "[MISSING]")
    q_type = QUESTION_TYPE.get(qid, q_obj.get("type", "single") if q_obj else "single")
    max_sel = q_obj.get("max_select", 1) if q_obj else (3 if q_type == "multi" else 1)
    if q_type == "single":
        max_sel = 1
    num_opts = len(q_obj.get("options", [])) if q_obj else len(POSITIVE_SIGNALS.get(qid, {}))
    inv_rows.append((qid, sec, text_lao, q_type, max_sel, num_opts))

print(f"Total inventory questions: {len(inv_rows)}")

print("\n=== DELIVERABLE 2: OPTION X CLUSTER MATRIX ===")
matrix_rows = []
total_options_count = 0
for q_num in range(1, 29):
    qid = f"Q{q_num}"
    q_obj = q_map.get(qid)
    opts = q_obj.get("options", []) if q_obj else []
    if not opts and qid in POSITIVE_SIGNALS:
        opts = [{"code": o, "text": opt_text_map.get(o, "[MISSING]")} for o in POSITIVE_SIGNALS[qid].keys()]
    elif not opts and qid in NEGATIVE_SIGNALS:
        opts = [{"code": o, "text": opt_text_map.get(o, "[MISSING]")} for o in NEGATIVE_SIGNALS.keys() if o.startswith(qid)]

    for opt_obj in opts:
        ocode = opt_obj["code"]
        otext = opt_obj.get("text", "[MISSING]")
        total_options_count += 1
        
        # Get signals
        pos_sigs = POSITIVE_SIGNALS.get(qid, {}).get(ocode, {})
        neg_sigs = NEGATIVE_SIGNALS.get(ocode, {}) if qid == "Q15" else {}
        
        # Determine flag
        flag = ""
        if ocode in UNCERTAIN_OPTION_CODES:
            flag = "uncertain"
        elif ocode in PREFER_NOT_OPTION_CODES:
            flag = "prefer_not"
        elif ocode in NO_SIGNAL_CODES:
            flag = "no_signal"
        elif not pos_sigs and not neg_sigs and qid in POSITIVE_SIGNALS:
            flag = "no_signal"

        # Check max score for bolding
        cluster_scores = {}
        target_sigs = neg_sigs if qid == "Q15" else pos_sigs
        max_s = max(target_sigs.values()) if target_sigs else 0

        scores_formatted = {}
        for c in ["C1", "C2", "C3", "C4", "C5", "C6", "C7"]:
            val = target_sigs.get(c, 0)
            if val == 0:
                scores_formatted[c] = "—"
            elif val == max_s and max_s > 0:
                scores_formatted[c] = f"**{val}**"
            else:
                scores_formatted[c] = str(val)
        
        matrix_rows.append((qid, ocode, otext, scores_formatted, flag))

print(f"Total matrix options: {len(matrix_rows)}")

print("\n=== DELIVERABLE 3: COVERAGE MATRIX ===")
sections_order = ["interests", "skills", "learning", "goals", "values", "work_style"]
coverage = {c: {s: 0 for s in sections_order} for c in CLUSTERS}

for c in CLUSTERS:
    for s in sections_order:
        cnt = 0
        for q in SECTION_QUESTIONS[s]:
            for opt, sigs in POSITIVE_SIGNALS.get(q, {}).items():
                if sigs.get(c, 0) >= 1:
                    cnt += 1
        coverage[c][s] = cnt

print("Coverage Matrix:")
for c in CLUSTERS:
    tot = sum(coverage[c][s] for s in sections_order)
    print(c, [coverage[c][s] for s in sections_order], "Total:", tot)

print("\n=== DELIVERABLE 4: CO-SIGNAL ANALYSIS ===")
co_signals = []
for qid, options in POSITIVE_SIGNALS.items():
    for oid, signals in options.items():
        if len(signals) >= 2:
            sorted_signals = sorted(signals.items(), key=lambda x: -x[1])
            primary_c, primary_s = sorted_signals[0]
            secondary_c, secondary_s = sorted_signals[1]
            ratio = (secondary_s / primary_s) * 100.0
            flag_issue = "⚠️ Yes" if ratio > 50.0 else "No"
            co_signals.append({
                "option": oid,
                "primary": primary_c,
                "secondary": secondary_c,
                "primary_score": primary_s,
                "secondary_score": secondary_s,
                "ratio": ratio,
                "should_fix": flag_issue
            })

print(f"Total co-signal options: {len(co_signals)}")
issues_count = sum(1 for cs in co_signals if "Yes" in cs["should_fix"])
print(f"Issues (ratio > 50%): {issues_count}")
for cs in co_signals:
    if "Yes" in cs["should_fix"]:
        print(f"  {cs['option']}: Primary={cs['primary']}({cs['primary_score']}), Sec={cs['secondary']}({cs['secondary_score']}), Ratio={cs['ratio']:.1f}%")

print("\n=== DELIVERABLE 5: PURE CLUSTER BENCHMARK ===")
def run_pure_benchmark(target_cluster):
    answers = {}
    for qid in SECTION_QUESTIONS["interests"] + SECTION_QUESTIONS["skills"] + SECTION_QUESTIONS["values"] + SECTION_QUESTIONS["work_style"] + SECTION_QUESTIONS["learning"] + SECTION_QUESTIONS["goals"]:
        opts_for_q = POSITIVE_SIGNALS.get(qid, {})
        # Find option(s) with maximum points for target_cluster
        best_opts = []
        for oid, sigs in opts_for_q.items():
            if sigs.get(target_cluster, 0) > 0:
                best_opts.append((oid, sigs.get(target_cluster, 0)))
        if best_opts:
            best_opts.sort(key=lambda x: -x[1])
            # If multi-select, pick up to max_select or top options
            q_type = QUESTION_TYPE.get(qid, "single")
            max_sel = 3 if q_type == "multi" else 1
            if qid == "Q4": max_sel = 2
            
            chosen = [b[0] for b in best_opts[:max_sel]]
            answers[qid] = chosen
        else:
            # If cluster has no option for this question, leave empty or pick neutral
            pass
            
    # Add non-scoring defaults (no constraints, ready to learn, etc.)
    answers["Q15"] = ["Q15-O12"] # None
    answers["Q22"] = ["Q22-O5"] # No constraints
    answers["Q23"] = ["Q23-O1"] # Willing to relocate
    
    eval_res = evaluate_signals(answers, {"province_code": "VTE"})
    
    # Sort cluster scores
    evals = eval_res.cluster_evaluations
    sorted_evals = sorted(evals.values(), key=lambda x: -x.adjusted_fit)
    top1 = sorted_evals[0]
    top2 = sorted_evals[1]
    
    # Compute archetype
    er = eval_res.entropy_ratio
    if er < 0.15:
        archetype = "Laser Focus"
    elif er < 0.40:
        archetype = "Clear Direction"
    elif er < 0.65:
        archetype = "Dual Interest"
    elif er < 0.85:
        archetype = "Multi-Scattered"
    else:
        archetype = "Total Uncertainty"
        
    is_correct = "✅ ຖືກ" if (archetype in ["Laser Focus", "Clear Direction"] and top1.cluster_id == target_cluster) else "⚠️ ຕ້ອງປັບ"
    return {
        "cluster": target_cluster,
        "raw_fit": top1.raw_fit if top1.cluster_id == target_cluster else evals[target_cluster].raw_fit,
        "adj_fit": top1.adjusted_fit if top1.cluster_id == target_cluster else evals[target_cluster].adjusted_fit,
        "second_cluster": top2.cluster_id,
        "second_score": top2.adjusted_fit,
        "n_eff": round(2.0 ** (-sum((e.adjusted_fit/sum(x.adjusted_fit for x in sorted_evals if x.adjusted_fit > 0))*math.log2(e.adjusted_fit/sum(x.adjusted_fit for x in sorted_evals if x.adjusted_fit > 0)) for e in sorted_evals if e.adjusted_fit > 0)), 2) if sum(x.adjusted_fit for x in sorted_evals) > 0 else 0,
        "e_r": er,
        "archetype": archetype,
        "is_correct": is_correct,
        "top1_id": top1.cluster_id
    }

benchmarks = []
for c in ["C1", "C2", "C3", "C4", "C5", "C6", "C7"]:
    res = run_pure_benchmark(c)
    benchmarks.append(res)
    print(f"{c}: PureFit={res['adj_fit']}, 2nd={res['second_cluster']}({res['second_score']}), Neff={res['n_eff']}, Er={res['e_r']}, Arch={res['archetype']}, Valid={res['is_correct']}")
