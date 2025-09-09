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
lastUpdated: '2025-09-03T00:04:48.058806'
summaryScore: 3.0
title: Trading Strategy.Instructions
version: 1.0.0
---

# trading-strategy — AI Assistant Guidelines (Python library)

Purpose: Research and execute strategies with datasets, pipelines, and execution models while maintaining anti-leakage and auditability.

## Data contracts
- Use vendor datasets with schema checks; timezones and calendars enforced.
- Adjusted prices, realistic slippage/fee models; document assumptions.

## Strategy dev
- Separate signal generation from portfolio/exec; shift signals; cap turnover.
- Store experiment metadata (params, seeds, metrics) with hashes for reproducibility.

## Testing
- Golden backtest on small dataset; assert metrics; test edge cases (halts, missing data).

## AI Assistant rules
- Provide ready-to-run notebooks/scripts with configs; forbid live trading by default; add runbook.