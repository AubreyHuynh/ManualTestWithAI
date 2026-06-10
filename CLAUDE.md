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
cd .claude/scripts/convert_excel
node md_to_xlsx.js
```

## Key Directories

| Path | Purpose |
|---|---|
| `.claude/skills/` | Custom skill definitions (rbt-manual-testing, requirements-analyzer) |
| `.claude/workflows/` | Slash-command workflows |
| `.claude/plans/manual/` | Copy-paste prompts for manual (non-Claude-Code) use |
| `.claude/scripts/convert_excel/` | Node.js script to export test cases as Excel |
| `.claude/scripts/intergations/google_sheet/` | Google Sheets integration utilities |
| `docs/ISTQB_CTFL_Syllabus-v4.0.pdf` | Reference standard for test design techniques |
| `Manual Test with AI/` | Obsidian vault for notes and documentation |

## Skills

- **rbt-manual-testing**: Master skill — QUICK mode (fast) or FULL RBT mode (6-step)
- **requirements-analyzer**: Analyzes web pages → standardized Requirements documents
