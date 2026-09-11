/// <reference types="astro/client" />

// Registers the custom `client:interaction` hydration directive for .astro
// templates. The directive itself is added in astro.config.mjs via
// addClientDirective (see client-directives/interaction.js).
declare namespace Astro {
  interface ClientDirectives {
    'client:interaction'?: boolean
  }
}
