# ExamServer Agent Instructions

## Working Principle

- This repository is a user-led server improvement workspace.
- AI should support investigation, explanation, review, test ideas, and narrowly scoped implementation help.
- Do not run this project in Autopilot mode.
- Do not implement behavior, architecture, or code that the user has not understood yet.
- Before implementing nontrivial changes, make the user's understanding explicit: goal, affected files, data flow, tradeoffs, and verification method.
- If the user has not understood the proposed change, stop at explanation, options, review comments, or a small scaffold.
- AI agents should be used mainly for asking questions and review. Avoid agent-led implementation or broad automatic rewrites unless explicitly requested.

## Communication Guidelines

- Use Japanese by default for explanations, issue comments, PR descriptions, review comments, and implementation notes.
- Write in clear language suitable for ordinary Japanese software development teams.
- Prefer practical, reviewable explanations over vague encouragement.
- Keep comments concise and actionable.
- When technical terms are commonly used in English in Japanese workplaces, keep the English term and explain it briefly when useful.
- Avoid vague durable notes such as "いい感じに", "適当に", "なんとなく", or "たぶん大丈夫".

## Japanese Development Workflow Style

- For issues, make the purpose, current problem, expected behavior, and completion condition clear.
- For PRs, include summary, scope, verification result, and known risks when relevant.
- For review comments, state the problem, why it matters, and a concrete suggested direction.
- Keep one issue or PR focused on one purpose as much as practical.
- Separate unrelated changes into separate commits or PRs.
- Prefer small, reviewable diffs over broad rewrites.
- Do not hide failed or skipped verification. Write it explicitly.

## Review Guidelines

- Focus on correctness, data integrity, security, maintainability, and user-visible regressions.
- Flag only issues that can affect behavior, reliability, security, reviewability, or future maintenance.
- Do not spend review attention on minor style preferences unless they create real maintenance cost.
- Check that category IDs in `data/categories.json` match directories under `data/exams`.
- Check that category ordering changes are intentional because the UI may render categories in JSON order.
- Check that exam metadata, question files, and validation rules stay consistent.
- Check that favicon and image assets use appropriate formats and sizes.
- Flag large binary assets when a smaller equivalent would work.
- For Next.js changes, check internal navigation, server/client component boundaries, API route behavior, and data-loading assumptions.
- For React changes, check state ownership, effects, dependency arrays, and unnecessary duplicated state.
- For admin features, check authentication, write paths, validation, and error handling.

## Practical Workflow

- Follow `docs/DEVELOPMENT_RULES.md` for Issue / PR scope, branch naming, PR descriptions, and verification notes.
- Prefer small issues and small diffs.
- For each change, keep the loop reviewable: current behavior -> intended behavior -> touched files -> verification.
- User owns final design and merge judgment.
- Codex may inspect, summarize, suggest, and review freely, but code edits should stay scoped to what the user has chosen and understood.
