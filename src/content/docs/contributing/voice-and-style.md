---
title: Voice and style
description: Write ShowMesh documentation with a calm operator voice and consistent editorial and safety conventions.
pageType: reference
---

ShowMesh documentation sounds like a calm, experienced technician helping another operator prepare for a show. It is direct without being abrupt, complete without narrating irrelevant internals, and precise about what is known, expected, or unverified.

Use the [Google Developer Documentation Style Guide](https://developers.google.com/style/) as the baseline for grammar, formatting, accessibility, and general technical-writing mechanics. This page takes precedence for ShowMesh-specific choices.

## Balance completeness and brevity

- Lead with what the reader will accomplish or understand.
- Put the common working path before background and unusual alternatives.
- Include detail when it changes an action, interpretation, safety decision, or recovery path.
- Remove implementation history, repeated explanations, and details that do not affect the reader.
- Use progressive disclosure: common path first, advanced or platform-specific material later.
- Keep one authoritative explanation and link to it instead of copying it.

Do not optimize for word count. A short page that omits recovery is incomplete; a long page that repeats implementation history is still unclear.

## Address the reader and name the actor

Use second person for the reader and imperative voice for instructions:

- Write “Run the readiness check,” not “The readiness check should be run.”
- Write “The coordinator records the outcome” when the software acts.
- Name the operator, coordinator, agent, broker, FPP, or Resolume when responsibility could be confused.

Prefer active voice, but use passive voice when the actor is irrelevant and the object or result is the important fact.

## Use precise claims

Distinguish required actions, recommendations, expected results, and possible results:

- Use an imperative or **must** for a requirement.
- Use **we recommend** for a genuine recommendation.
- Use **can** for an available option or capability.
- Use **might** for a possible outcome.
- State an expected result directly rather than saying it “should” happen.

Avoid “easy,” “simple,” “just,” and “quickly.” These words do not help a reader recover when their environment behaves differently.

## Format procedures and commands

- Use numbered lists for sequences and bullets for unordered choices.
- Put conditions before instructions: “If readiness returns `503`, inspect the reason.”
- Use sentence case for titles and headings.
- Give fenced code blocks a language identifier.
- Do not include shell prompt characters in copyable commands.
- Use angle brackets for reader-supplied placeholders, such as `<coordinator-host>` and `<node-id>`.
- Explain a placeholder before or immediately after the command when its value is not obvious.
- Separate expected output from commands and label abbreviated output.
- Mark optional steps explicitly.

Keep commands beside the explanation they support. Do not present a large command block and make the reader reverse-engineer its purpose afterward.

## Protect shows, data, and credentials

- Warn before destructive, irreversible, security-sensitive, or show-affecting actions.
- State the stop, backup, rollback, or recovery path when one exists.
- Preserve configuration and migration data until values are deliberately reconciled.
- Use least-privilege credentials in examples.
- Never place real secrets in commands, URLs, screenshots, or expected output.
- Explain when a secret can appear in shell history, process listings, logs, or generated files.
- Distinguish a successful request from a confirmed device effect.

Use caution callouts for risks readers must evaluate before proceeding. Do not use callouts merely to decorate ordinary information.

## Write accessible pages

- Use descriptive link text rather than “click here.”
- Give informative images and diagrams useful alt text.
- Do not use an image as the only source of instructions.
- Introduce tables and diagrams in prose and explain the conclusion readers should draw.
- Do not rely on color alone to communicate maturity, warnings, or results.
- Avoid directional references such as “above” when a section or control can be named.
- Use literal, culturally neutral language that works for readers using English as an additional language.

## Keep terminology consistent

Use the product terms defined by the UI, API, and public model. Explain a term on first use when the intended audience may not know it. Do not alternate among synonyms when they could imply different objects.

Use “ShowMesh” for the product, “coordinator” for the management service, “native agent” for the process running on a node, and “Operator UI” for the browser interface. Preserve official third-party names such as FPP and Resolume Arena.
