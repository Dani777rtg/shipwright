# Intake interview checklist

Every section is covered in every mission. A question may be answered from the brief, the client material or the system analysis — then confirm it instead of asking open-ended. A section that truly does not apply is recorded as `No aplica: <reason>` and shown at the gate.

Each question maps to where its answer lands (→).

## 1. Problem and objective
- What problem exists today, and what happens if nothing is built? → requirements Contexto
- Who asked for this and why now? → mission Personas, Contexto
- What change should the user achieve? (Cuando <situación>, <actor> quiere <progreso> para <resultado>) → O-n

## 2. Users
- Who are the users and roles? Who is the primary one? → US roles, glossary
- What do they use today instead? What frustrates them? → Contexto, O-n
- How many users, how often, from where? → non-functional, QS later

## 3. Success
- How will we know it worked? Baseline → target, measured how? → KR-n
- What will the person who approves look at (demo, PR review, report)? → Definition of Done
- What would make this mission a failure? → risks, QG order

## 4. Quality priorities
- Order the top 3 quality goals (ISO 25010). Offer the defaults for the starting point and alternatives. → QG-1..3
- For each, a first idea of how to measure it. → seeds QS in Architect

## 5. Main flows and edge cases
- Walk through the main flow step by step. → US-nn, AC (event-driven)
- What can go wrong at each step (invalid input, timeouts, empty states, permissions)? → AC (unwanted behaviour: IF … THEN)
- What must happen while the system is in a given state (offline, loading, locked)? → AC (state-driven: WHILE)

## 6. Data
- Main entities and their relations; volume today and expected. → glossary, non-functional
- Where does the data come from and who owns it? → integrations, assumptions
- Personal or sensitive data? Retention and deletion? → security, compliance AC

## 7. Integrations
- External systems, APIs, AI models or services; who provides credentials? → requirements, assumptions
- Rate limits, cost limits, availability of those services; fallback if they fail. → AC, QS later

## 8. Security and authentication
- Who can do what (roles, permissions)? → AC
- Authentication method (existing SSO, OAuth, none for a demo). → AC, ADR later
- Threats that matter for this mission (data leak, abuse, injection, prompt injection for AI). → AC, QS later

## 9. Compliance
- Legal or company rules (GDPR/habeas data, accessibility law, sector rules, internal policies). → restrictions, AC

## 10. Performance, availability, scale
- Expected response times for key actions; peak load. → non-functional
- Required availability; acceptable downtime; where it runs. → non-functional

## 11. Platform and experience
- Platforms and devices (web, mobile, desktop, CLI, API only). → restrictions, US
- Accessibility level (WCAG 2.2 AA by default for UIs). → non-functional
- Languages and locales. → non-functional
- Existing design system or brand rules. → restrictions

## 12. Constraints
- Imposed technology, hosting, vendors. → restrictions
- Budget (including AI/API spend). → restrictions
- Deadline and fixed milestones (demo time, review date). → mission Plazo
- Team: who will maintain this after delivery, their skills. → mission Personas, QG

## 13. Delivery, operation and maintenance
- How is it delivered (deploy target, PR to which branch, demo format, report format)? → Definition of Done
- Who operates it after delivery; monitoring and support expectations. → non-functional
- Documentation the receiver needs (user guide, runbook, API docs). → Definition of Done

## 14. Risks
- Known risks, unknowns and dependencies on other people. → assumptions with owner
- What is explicitly out of scope? → Fuera de alcance

## 15. Existing system only (sobre lo existente)
- Confirm the conventions found in the analysis (naming, structure, tests, commits). → existing-system.md
- What must not change (public APIs, DB schema, flows)? → restrictions, QS
- How are changes released here (feature flags, review rules, CI)? → Definition of Done
