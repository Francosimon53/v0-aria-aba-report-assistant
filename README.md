# ARIA — ABA Report & Intervention Assistant

**Public prototype for AI-assisted ABA assessment writing, structured clinical-document workflows, prompt evaluation, and human review.**

ARIA explores how generative AI can assist behavior analysts with structured assessment documentation while keeping deterministic validation and professional review around model-generated content. The repository combines TypeScript/Next.js application engineering with domain-specific prompts, form validation, document generation, testing, and production integrations.

> **Portfolio scope:** ARIA is a software prototype and technical case study. It is not a substitute for clinical judgment, payer policy review, legal advice, or independent compliance validation. Payer-specific rules in the prototype are implementation data that must be verified against current source policies before real-world use.

## Why this project is relevant to AI evaluation

Clinical and healthcare-adjacent writing is a useful stress test for generative AI because fluent text is not enough. Outputs must also be checked for factual grounding, internal consistency, scope, missing data, unsupported recommendations, and alignment with explicit requirements.

ARIA demonstrates work on:

- **Domain-specific prompting** for ABA assessment and treatment-plan content.
- **Structured inputs before generation** so model outputs are conditioned on explicit client and assessment data.
- **Prompt constraints and negative rules** that tell the model what it should and should not infer.
- **SMART-goal generation and validation** with measurable criteria rather than free-form prose alone.
- **Medical-necessity and hours-justification workflows** driven by structured inputs.
- **Human review boundaries** around generated clinical text.
- **Document generation/export** using DOCX/PDF-related tooling.
- **Rate controls, validation, monitoring, and application-level safeguards** around AI-facing routes.

## Example: prompt engineering as an evaluation problem

The prompt system does more than ask a model to “write a report.” It defines explicit criteria for generated content, including:

- measurable baselines,
- observable target behaviors,
- numerical mastery criteria,
- functional relevance,
- parent/caregiver training,
- discharge criteria,
- restrictions on unsupported claims,
- scope-of-practice constraints.

Those constraints create an evaluation rubric: a response can be scored against specific requirements instead of being judged only by tone or fluency.

## Technical architecture

```text
Structured assessment data
        ↓
Domain / workflow selection
        ↓
Prompt template + explicit constraints
        ↓
LLM generation
        ↓
Validation / review workflow
        ↓
Editable clinical document
        ↓
Export / downstream workflow
```

The repository includes separate API and prompt layers for conversational assistance and ABA-specific generation, keeping domain instructions outside UI components.

## Stack

- **Framework:** Next.js 16
- **Language:** TypeScript
- **UI:** React 19, Radix UI, Tailwind CSS
- **AI:** Anthropic SDK, Vercel AI SDK, OpenAI SDK
- **Validation:** Zod, React Hook Form
- **Data/Auth:** Supabase
- **Editor:** Tiptap
- **Documents:** DOCX, jsPDF, PDF parsing
- **Monitoring:** Sentry, Vercel Analytics
- **Payments/Email:** Stripe, Resend
- **Testing:** Jest + Testing Library

## AI quality considerations

For an AI model evaluator, ARIA provides concrete failure modes to inspect:

1. **Unsupported inference** — does the model invent baseline values or clinical facts that were not supplied?
2. **Constraint failure** — does a proposed goal omit measurement criteria or a time bound?
3. **Internal inconsistency** — do recommended hours conflict with the rationale or other generated sections?
4. **Overconfidence** — does the response present prototype payer guidance as authoritative current policy?
5. **Scope errors** — does generated content move beyond ABA scope or the information available?
6. **Missing-data behavior** — does the model ask for necessary information or silently fabricate it?
7. **Formatting vs. substance** — is a polished response actually complete and technically defensible?

These are the same classes of problems encountered in general AI-response evaluation: hallucination, reasoning gaps, incompleteness, instruction-following errors, and unsupported certainty.

## Repository relationship to ARIABA

ARIA is an earlier **public** exploration of AI-assisted ABA documentation. The newer ARIABA work extends the problem into a more rigorous clinical-policy, provenance, security, and verification architecture. ARIA remains useful publicly because it shows the generative-AI and prompt-design side of that progression without exposing the private ARIABA codebase.

## Local development

```bash
npm install
npm run dev
```

Quality commands available in the project:

```bash
npm run lint
npm test
npm run build
```

## Portfolio focus

This repository is presented primarily as evidence of:

- generative-AI integration,
- prompt and rubric design,
- domain-specific output evaluation,
- TypeScript application engineering,
- human-in-the-loop clinical workflows,
- validation and testing around model output.

The goal is not to claim that an LLM can independently produce clinically valid documentation; the engineering problem is to make generated output **constrained, reviewable, testable, and easier to verify**.

## License

MIT
