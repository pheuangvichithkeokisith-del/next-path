# Next-path Version Archive

This directory separates the legacy runtime contract from the versioned v4.0 contract. Keeping them separate prevents accidental changes to questions, option codes, or algorithms used by existing sessions.

## Main documents

- [Legacy v0.9.1 questionnaire and algorithm](./PATHAI_v0.9.1_legacy_questionnaire_and_algorithm.md)
- [v4.0 career assessment instrument](./PATHAI_Career_Assessment_Instrument_v4.0_Lao_proposal.md)

## Version policy

1. The public website currently creates sessions with `form_version: v4.0.0`.
2. The v0.9.1 form remains available as a legacy/API fallback for older sessions.
3. v4 scoring and its report adapter are separate from the legacy Signal Engine.
4. Never reuse option codes or formulas across versions without an explicit migration plan.
5. Every algorithm change must add a version, snapshot, tests, and release notes.
6. If documentation conflicts with executable source code and passing tests, the released source and tests are authoritative. Update the documentation in the same commit.
