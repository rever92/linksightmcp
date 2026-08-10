---
type: tool domain
title: Products and Stripe tools
description: Subscription product discovery and billing-session URL projections.
tags: [tools, billing, stripe]
---

# Products and Stripe tools

`linksight_products_list` GETs `products` and adds a count. `linksight_stripe_checkout(price_id)` POSTs `stripe/checkout` and projects `data.session.url` plus `data.session.id`. `linksight_stripe_portal` POSTs `stripe/portal` and projects `data.url`.

All three schemas expose only `price_id` for checkout, with portal and product list taking no inputs. The handlers preserve that declared input surface, but perform no local price validation; checkout and portal selectively transform nested response fields. These projections assume the external response shape; missing nested fields become handler exceptions and therefore server-level 500 errors. The backend and Stripe own side effects. Validate with a stub response and never use a live checkout merely to test mapping.
