---
description: Generate Requirements content from a provided website module
skills:
  - requirements_analyzer
---

# Workflow: Generate Requirements from Website Module

> **MANDATORY SKILL:** You MUST load and carefully read the **`requirements_analyzer`** skill to understand the standard Requirements document format before starting this task.

This workflow helps you analyze a provided module or web page and produce a detailed, accurate Requirements document for testing or development purposes.

## Steps

1. **Information Gathering**
   - Read the **`requirements_analyzer`** skill instructions to understand the expected output format.
   - Obtain the URL, module name, description, or screenshots provided by the user.
   - If needed, ask the user for login credentials or any special states to consider.

2. **Recon & Investigation**
   - Use browser tools/MCP or `read_url_content` to access the target web module.
   - Carefully inspect the HTML structure, DOM, input forms, interactive elements (buttons, links), and validation messages.
   - *Note: Do not guess field information that is not visible in the actual UI.*

3. **Analyze UI & Interactions**
   - Map out User Flows.
   - Identify static and dynamic data fields (e.g., TextBox, Dropdown, Checkbox).
   - Document visible Business Rules such as mandatory fields, valid formats (email, phone number), or character limits.

4. **Draft Requirements**
   - Based on gathered data, produce a document that includes:
     - **Overview:** Purpose of the module/page.
     - **Functional Requirements:** List of actions a user can perform (e.g., Login, Create, Delete).
     - **Field Specifications:** A detailed table for each UI element (Field Name, Type, Required/Optional, Data Constraints).
     - **Business/User Flows:** Step-by-step flows to complete each core function.
     - **Non-functional Requirements** *(if observable):* Compatibility, static performance observations.

5. **Review & Delivery**
   - Format the document in clean Markdown.
   - Present all content in clear, professional **English**.
   - Use an Artifact if the document is long, for easy saving or export.
