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
lastUpdated: '2025-09-03T00:04:48.061535'
summaryScore: 3.0
title: Tradier.Instructions
version: 1.0.0
---

# Tradier — AI Assistant Guidelines (Broker API)

Purpose: Integrate with Tradier brokerage for account data and order routing with safety, compliance, and observability.

## When to use
- Equities/options trading via REST/streaming with paper/live modes.

## Safety and compliance
- Use read-only keys in dev; segregate paper vs. live; permission scopes minimal.
- Validate orders; add price/size sanity checks; throttle requests; handle rate limits.

## Testing
- Mock API responses; deterministic order simulations; reconcile fills.

## AI Assistant rules
- Never embed API keys; provide env var templates; include a rollback plan and alerts.