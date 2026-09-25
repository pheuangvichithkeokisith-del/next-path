import json
import sys
from pathlib import Path

def diff(before_path: str, after_path: str):
    before = json.loads(Path(before_path).read_text(encoding="utf-8"))
    after = json.loads(Path(after_path).read_text(encoding="utf-8"))
    
    total = len(before)
    arch_changed = 0
    core_changed = 0
    
    print(f"Comparing Snapshots:\n  Before: {before_path}\n  After:  {after_path}\n")
    print("=" * 60)
    
    for pid in before:
        b = before[pid]
        a = after.get(pid, {})
        
        b_arch = b.get("archetype")
        a_arch = a.get("archetype")
        
        b_core = set(b.get("core", []))
        a_core = set(a.get("core", []))
        
        if b_arch != a_arch:
            arch_changed += 1
            print(f"[{pid}] Archetype Shift: {b_arch} (Er={b['entropy_ratio']:.2f}) -> {a_arch} (Er={a.get('entropy_ratio',0):.2f})")
            
        if b_core != a_core:
            core_changed += 1

    pct_arch = (arch_changed / total) * 100.0
    pct_core = (core_changed / total) * 100.0
    print("=" * 60)
    print(f"Total Profiles Evaluated: {total}")
    print(f"Archetype Shift: {arch_changed}/{total} ({pct_arch:.1f}%)")
    print(f"Core Path Shift: {core_changed}/{total} ({pct_core:.1f}%)")
    
    if pct_arch > 20.0:
        print("\n⚠️ WARNING: Archetype regression exceeds 20% threshold.")
        return 1
    else:
        print("\n✅ Regression Safety Passed: Delta < 20% threshold.")
        return 0

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python diff_snapshots.py <before.json> <after.json>")
        sys.exit(1)
    ret = diff(sys.argv[1], sys.argv[2])
    sys.exit(ret)
