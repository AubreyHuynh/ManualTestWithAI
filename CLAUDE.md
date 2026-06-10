# Manual Test with AI

QA toolkit for generating manual test cases using AI (Claude Code).
Built around the AI-RBT (Risk-Based Testing) framework from ISTQB CTFL v4.0.

## Workflows (Claude Code)

| Slash Command | Purpose |
|---|---|
| `/workflow 01_generate_manual_testcases_rbt` | Full 6-step AI-RBT test case generation |
| `/workflow 02_generate_requirements_from_website` | Analyze a live website module → Requirements doc |
| `/workflow 03_generate_testcases_from_requirements` | Quick test case generation from existing requirements |

## Manual Prompts

Copy-paste prompts from `.claude/plans/manual/01–06/prompt.md` for step-by-step use
without Claude Code. Each step maps to a phase of the AI-RBT process.

## Excel Conversion Script

Converts Markdown test case tables to `.xlsx` for Jira/TestRail/Excel import.

```bash
# First-time setup (run once):
cd .claude/scripts/convert_excel && npm install

# Usage:
cd .claude/scripts/convert_excel
node md_to_xlsx.js <input.md> [output.xlsx]
# Example: node md_to_xlsx.js ../../output/test_cases.md
```

## Key Directories

| Path | Purpose |
|---|---|
| `.claude/skills/` | Custom skill definitions (rbt-manual-testing, requirements-analyzer) |
| `.claude/workflows/` | Slash-command workflows |
| `.claude/plans/manual/` | Copy-paste prompts for manual (non-Claude-Code) use |
| `.claude/scripts/convert_excel/` | Node.js script to export test cases as Excel |
| `.claude/scripts/intergations/google_sheet/` | Google Sheets integration utilities |
| `.claude/rules/` | `manual_rules.md` — universal QA rules (single source of truth) |
| `docs/ISTQB_CTFL_Syllabus-v4.0.pdf` | Reference standard for test design techniques |
| `Manual Test with AI/` | Obsidian vault for notes and documentation |

## Google Sheets Integration

Reads/writes test data from Google Sheets. Requires one-time setup:

```bash
cd .claude/scripts/intergations/google_sheet
cp .env.example .env       # then fill in GOOGLE_SERVICE_ACCOUNT_KEY_PATH and GOOGLE_SPREADSHEET_ID
npm install
```

## Skills

- **rbt-manual-testing**: Master skill — say "QUICK" for fast generation, "FULL RBT" for the 6-step AI-RBT process
- **requirements-analyzer**: Analyzes web pages → standardized Requirements documents
