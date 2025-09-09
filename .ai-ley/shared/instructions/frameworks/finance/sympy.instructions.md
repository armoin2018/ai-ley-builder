---
agentMode: general
applyTo: general
author: AI-LEY
description: Awaiting summary.
extensions:
- .md
guidelines: N/A
instructionType: general
keywords: []
lastUpdated: '2025-09-02T23:59:04.746880'
summaryScore: 3.0
title: Sympy.Instructions
version: 1.0.0
---

# SymPy (Finance) — AI Assistant Guidelines

Purpose: Use symbolic math to prototype closed-form factor definitions, constraints, and risk models with verifiable transformations.

## Use cases
- Express factor formulas symbolically, derive gradients, or simplify algebra.
- Validate equivalence between implementations (symbolic → numeric pipeline).

## Data bridge
- Define symbols for inputs (prices, volumes, fundamentals). Bind arrays via lambdify with numpy backend.
- Keep timezone/calendar logic outside symbolic stage; pass aligned series.

## Testing
- Identity tests: prove algebraic equivalence of refactored factors.
- Numerical cross-checks: random inputs → symbolic vs. numeric implementations within tolerance.

## AI Assistant rules
- Emit both the SymPy expression and a compiled function; pin dtype and shift rules to avoid leakage.
- Document domain assumptions (non-negativity, bounds) and handle piecewise logic explicitly.