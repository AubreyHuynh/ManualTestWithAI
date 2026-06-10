# STEP 2: REQUIREMENTS ANALYSIS & Q&A (Analysis & QnA)

> **How to use:**
> 1. Send this prompt AFTER the AI has confirmed it understands the context in Step 1
> 2. Read through the questions the AI generates
> 3. Answer each question for the AI
> 4. Once all questions are answered → move to Step 3

---START---

Based on the requirements document and context provided in Step 1, analyze the requirements in detail.

## Your Tasks:

### 1. Identify Flows

List all flows exhaustively:
- **Happy Path:** The main business flow running smoothly end-to-end
- **Alternate Paths:** Valid branching flows (e.g., user selects a different payment method)
- **Exception Paths:** Error / exception flows (e.g., lost connection, timeout, invalid input format)

[Optional guidance (if needed): Pay special attention to analyzing flows involving:
- Mid-process connection interruption
- Invalid data format input
- File upload exceeding size limit
- Concurrent access / race conditions
- ...]

### 2. Ambiguity Detection

Identify and list:
- **Gaps:** Information not mentioned in the requirements document
- **Contradictions:** Conflicting requirements
- **Unclear items:** Requirements that can be interpreted in multiple ways

[Optional checklist (if needed): Has the document specified:
- Min/max length for each text input field
- API timeout values
- Behavior on connection loss
- Specific authorization/permission rules
- Input data formats (email, phone number, date)
- ...]

### 3. Q&A

Generate a **numbered list of questions** for me or the PO/BA to answer.
Each question must:
- Be clearly numbered (Q1, Q2, Q3...)
- State the context explaining why the question is needed
- Propose a default assumption if left unanswered

---

Present the analysis results in **well-structured Markdown**.
⏸️ **AFTER COMPLETING**, pause and wait for my answers to the questions before proceeding to Step 3.

---END---

---
> Mirrors: rbt-manual-testing SKILL.md — Step 2 (Analysis & Q&A)