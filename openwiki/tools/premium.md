---
type: tool domain
title: Premium usage tools
description: Limits, monthly and billing-cycle usage, and premium action recording.
tags: [tools, premium, usage]
---

# Premium usage tools

`linksight_premium_limits`, `linksight_premium_usage`, and `linksight_premium_cycle_usage` are GET pass-throughs to `premium/limits`, `premium/usage`, and `premium/cycle-usage`. `linksight_premium_record_action` requires `action_type` in `profile_analysis`, `post_optimization`, or `batch_analysis`, optionally adds `metadata`, and POSTs `premium/actions`.

The no-input read schemas map directly to their GET handlers. The action schema requires the enum `action_type` and declares optional object `metadata`; the handler always forwards `action_type` and omits metadata only when falsy, with no local enum or object validation. The external backend owns limits, cycle boundaries, authorization, and counting. Handlers preserve common success/error envelopes. Validate schema enum exposure and upstream error mapping without recording a real action.
