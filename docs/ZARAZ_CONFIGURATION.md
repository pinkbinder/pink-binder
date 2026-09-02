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
   by an explicitly configured equivalent action.
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

## Event mapping

The automatic **Events** action forwards the three `zaraz.track()` events to
the enabled tools using the **All Tracks** system trigger. An individual tool
that does not support automatic Events must instead use a custom action with a
firing trigger whose **Event Name** equals the event name. Such action fields
can read the flat event properties as `{{ client.<property> }}`.

| Event            | Zaraz API           | Properties                                   |
| ---------------- | ------------------- | -------------------------------------------- |
| `select_content` | `zaraz.track()`     | `content_type`, `item_id`                    |
| `search`         | `zaraz.track()`     | `search_term`                                |
| `share`          | `zaraz.track()`     | `method`, `content_type`, `item_id`          |
| `Product Viewed` | `zaraz.ecommerce()` | `product_id`, `name`, `category`, `currency` |

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
- the Zaraz request appears when searching, sharing, or selecting an outbound
  marketplace listing; and
- the published tools receive the event after their consent conditions are met.

Use Zaraz Preview/Debug mode for the final tool-level assertion. A public HTTP
check can prove that the initializer is reachable, but it cannot reveal private
tool credentials or whether a dashboard action accepted an event.

Reference: [Cloudflare Zaraz Web API](https://developers.cloudflare.com/zaraz/web-api/)
and [e-commerce events](https://developers.cloudflare.com/zaraz/web-api/ecommerce/).
