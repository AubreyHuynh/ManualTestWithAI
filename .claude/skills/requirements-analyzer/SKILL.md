---
name: requirements-analyzer
description: Skill for analyzing web pages/modules and generating standardized Requirements Documents and User Stories.
---

# Requirements Analyzer Skill

This skill provides detailed guidelines for AI to convert UI interfaces or DOM/HTML structures of a web page into clear, detailed Requirements Documents that directly serve QA, Testers, and Developers.

## 1. Core Objectives
- Build requirements documents that closely reflect the live system.
- Ensure consistency and full coverage of both Happy Paths and Edge Cases (exception/error scenarios).
- Output in a professional format (using Artifact structure).

## 2. Information Extraction Process
When asked to generate Requirements from a web page:
1. **Layout Analysis:** Identify Header, Footer, Sidebar, and Main Content sections.
2. **Form & Input Collection:**
   - Find all input fields (`input`, `select`, `textarea`).
   - Record `type` attributes (text, email, password, number), `required`, `maxlength`, `minlength`, `pattern`.
3. **Interactive Element Collection (Buttons/Links/Actions):**
   - Identify the function of each button (Save, Submit, Cancel, Delete, Edit).
   - Note alerts, notifications (Alerts, Toasts, Validation Messages) that appear on error interactions.
4. **Workflow Extraction:**
   - Dependencies between components (e.g., Submit button only enabled when "I agree" Checkbox is checked).

## 3. Output Requirements Document Structure
The document must be formatted as professional Markdown or saved as an Artifact (`requirements_spec.md`).

**Mandatory content:**

### 3.1. Overview
A brief description of the feature and purpose of the web page/module.

### 3.2. Functional Requirements
Broken down into **User Stories** or **Use Cases**:
- **Feature Name** (e.g., Login Feature)
- **Description:** "As a user, I want to... so that I can..."
- **Acceptance Criteria:** Clearly state the conditions that must be met.

### 3.3. Field Specifications
This is the core section for Automation Testers:
* Use a Markdown Table to list:
  - Field Name (Label)
  - Type (UI Type)
  - Validation Rules (Required / Default / Length limits)
  - Notes

### 3.4. Business Rules & Validations
List in detail the expected Validation Messages when a user enters incorrect data.

## 4. Strict Rules
- Always write in **English**.
- Do not infer complex business requirements without evidence from the UI. If logic is missing, list them under "Questions/Clarifications for PO-User".
- If Playwright MCP is available, prefer opening a real browser to screenshot/capture the interface when needed.
