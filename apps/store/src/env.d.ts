/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    /** Medusa region id resolved from the `pb_region` cookie (middleware). */
    regionId: string | null
  }
}
