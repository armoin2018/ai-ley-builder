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
lastUpdated: '2025-09-02T23:59:04.747931'
summaryScore: 3.0
title: Pymc3.Instructions
version: 1.0.0
---

# PyMC (PyMC3/4) — AI Assistant Guidelines (Finance)

Purpose: Bayesian time-series and hierarchical models for alpha estimation and risk with rigorous priors and posterior checks.

## Data handling
- Time-aware splits; fit on train only; evaluate on holdout; no peeking.
- Scale/standardize within train folds; persist scalers; apply to val/test.

## Modeling
- Priors reflecting domain knowledge; hierarchical structures for assets/sectors.
- Inference: NUTS/VI with convergence diagnostics (R-hat, ESS). Fix seeds for determinism where possible.

## Evaluation
- Posterior predictive checks; out-of-sample predictive accuracy; calibration curves.
- Decision: transform posterior to signals with shift(+1); assess portfolio metrics.

## AI Assistant rules
- Provide model spec, data pipeline, and diagnostics; log artifacts; bound runtime.