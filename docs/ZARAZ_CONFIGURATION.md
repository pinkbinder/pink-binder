# Cloudflare Zaraz configuration

Pink Binder uses Cloudflare Zaraz for page views, third-party tools, and the
small set of application events emitted by the shared UI package. The
reviewable event and setting contract lives in [`config/zaraz.json`](../config/zaraz.json).
It intentionally contains no tool IDs, account credentials, secret variables,
or opaque Cloudflare trigger IDs, so it is safe to keep in Git.

## Required dashboard settings

Apply these settings to both `pinkbinder.shop` and `pinkbinder.blog`:

1. Keep Zaraz enabled and keep the existing tools/tags enabled.
2. Leave **Auto-inject script** enabled. Cloudflare injects the Zaraz
   initializer at the edge; the app must not add a second loader.
3. Leave **Automatic Pageview Tracking** enabled unless page views are handled
   by an explicitly configured equivalent action. This is what attributes
   inbound traffic: referrer and `utm_*` parameters ride along on
   `page_location`, so GA4 acquisition reporting works without extra events.
4. Leave **Data layer compatibility mode** disabled. The application no longer
   uses a legacy tag-manager data layer; application events use the Zaraz Web
   API directly.
5. Enable **E-commerce tracking**, and keep the E-commerce action enabled for
   each compatible tool that should receive marketplace listing views.
6. Keep the automatic **Events** action enabled for tools that should receive
   `zaraz.track()` calls. The dashboard's **All Tracks** system trigger is the
   correct broad trigger for these events; do not add one custom trigger per
   event when the automatic action is enabled.
7. Preserve the dashboard's consent requirements for every existing tool. Do
   not publish a marketing or advertising tool without its required consent
   purpose.

## Tool checklist (GA4, Meta/Facebook, Pinterest, Microsoft Clarity)

Each tool is configured in the Zaraz dashboard with its own credential; the
application only emits events, so adding or re-pointing a tool never requires
a code change:

- **GA4** – web measurement ID; keep the automatic pageview action and the
  automatic Events action enabled. `search` uses GA4's recommended name, so
  search terms feed the built-in Search-term report; `click` mirrors the
  enhanced-measurement outbound shape (`link_url`, `link_domain`,
  `outbound`). Zaraz replaces gtag.js, which is why enhanced measurement
  itself never runs client-side.
- **Meta (Facebook Pixel)** – pixel ID; the automatic Events action forwards
  `page_view` and the application events. Enable consent as required.
- **Pinterest Tag** – tag ID; same automatic Events action, so `page_view`,
  `search`, and `filter` reach Pinterest without custom triggers.
- **Microsoft Clarity** – project ID. Clarity records sessions natively; the
  application additionally mirrors `search`, `filter`, and `post_view` as
  Clarity custom events (`clarity('event', …)`), which appear as smart-event
  filters in the Clarity dashboard.

## Event mapping

The automatic **Events** action forwards the `zaraz.track()` events to the
enabled tools using the **All Tracks** system trigger. An individual tool
that does not support automatic Events must instead use a custom action with
a firing trigger whose **Event Name** equals the event name. Such action
fields can read the flat event properties as `{{ client.<property> }}`.

| Event            | Zaraz API           | Properties                                            | Source                                                    |
| ---------------- | ------------------- | ----------------------------------------------------- | --------------------------------------------------------- |
| `select_content` | `zaraz.track()`     | `content_type`, `item_id`                             | blog grid post-card clicks                                |
| `search`         | `zaraz.track()`     | `search_term`                                         | blog search field commits                                 |
| `filter`         | `zaraz.track()`     | `filter_group`, `filter_value`, `filter_action`       | blog grid filter changes (apply/clear)                    |
| `button_click`   | `zaraz.track()`     | `button_text`, `button_id`, `button_section`          | delegated tracker, every button click                     |
| `click`          | `zaraz.track()`     | `link_url`, `link_domain`, `link_text`, `outbound`    | delegated tracker, outbound link clicks                   |
| `post_view`      | `zaraz.track()`     | `post_id`, `post_title`                               | article page render                                       |
| `share`          | `zaraz.track()`     | `method`, `content_type`, `item_id`                   | share dialogs                                             |
| `Product Viewed` | `zaraz.ecommerce()` | `product_id`, `name`, `category`, `currency`          | outbound marketplace listing views                        |

Implementation notes:

- `filter_action` distinguishes `apply` from `clear`/`clear_all`; report
  "most popular filters" on `apply` actions grouped by `filter_value`.
- The delegated click tracker (`apps/blog/src/lib/analytics-client.ts`)
  captures clicks in the DOM capture phase. `data-analytics-id` and
  `data-analytics-section` attributes give buttons stable identities when
  their label text is not enough.
- Events fired before the asynchronously injected Zaraz loader is ready are
  queued for a few seconds and flushed on arrival, so early interactions are
  not lost; the queue is bounded and events are dropped silently when Zaraz
  is unavailable (e.g. ad blockers).

`Product Viewed` does not need a custom trigger when the tool's E-commerce
action is enabled; Zaraz maps the event to supported tool formats. The helper
is used for outbound marketplace links, not completed orders.

## Verify

After saving the dashboard configuration, check both production domains:

```bash
curl -fsS https://pinkbinder.shop >/dev/null
curl -fsS https://pinkbinder.blog >/dev/null
```

In a browser, inspect the page source/network panel and confirm:

- one Cloudflare-managed Zaraz initializer is present;
- there are no legacy tag-manager scripts, IDs, or data-layer references from
  the application;
- the Zaraz request appears when searching, applying a filter, clicking a
  button, or following an outbound link; and
- the published tools receive the event after their consent conditions are met.

Use Zaraz Preview/Debug mode for the final tool-level assertion. A public HTTP
check can prove that the initializer is reachable, but it cannot reveal private
tool credentials or whether a dashboard action accepted an event.

Reference: [Cloudflare Zaraz Web API](https://developers.cloudflare.com/zaraz/web-api/)
and [e-commerce events](https://developers.cloudflare.com/zaraz/web-api/ecommerce/).
