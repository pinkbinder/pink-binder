import { describe, expect, test } from 'bun:test'
import {
  API_CATALOG_DOCUMENT,
  API_CATALOG_PROFILE,
  DISCOVERY_LINK_HEADER,
  OPENAPI_DOCUMENT,
} from './agent-discovery'

describe('agent discovery documents', () => {
  test('publishes every public API with description and documentation links', () => {
    expect(API_CATALOG_DOCUMENT.linkset).toHaveLength(2)
    expect(API_CATALOG_DOCUMENT.linkset.map((entry) => entry.anchor)).toEqual([
      'https://pinkbinder.blog/api/posts-grid',
      'https://pinkbinder.blog/api/card-gallery',
    ])

    for (const entry of API_CATALOG_DOCUMENT.linkset) {
      expect(entry['service-desc'][0]?.href).toBe(
        'https://pinkbinder.blog/.well-known/openapi.json'
      )
      expect(entry['service-doc'][0]?.href).toBe('https://pinkbinder.blog/.well-known/api-docs')
    }
  })

  test('uses the RFC 9727 profile and registered homepage relations', () => {
    expect(API_CATALOG_PROFILE).toBe('https://www.rfc-editor.org/info/rfc9727')
    expect(DISCOVERY_LINK_HEADER).toContain('rel="api-catalog"')
    expect(DISCOVERY_LINK_HEADER).toContain('rel="service-desc"')
    expect(DISCOVERY_LINK_HEADER).toContain('rel="service-doc"')
    expect(DISCOVERY_LINK_HEADER).toContain('rel="describedby"')
  })

  test('documents the same read-only endpoints in OpenAPI', () => {
    expect(Object.keys(OPENAPI_DOCUMENT.paths)).toEqual(['/api/posts-grid', '/api/card-gallery'])
    expect(OPENAPI_DOCUMENT.paths['/api/posts-grid']?.get?.operationId).toBe('listBlogPosts')
    expect(OPENAPI_DOCUMENT.paths['/api/card-gallery']?.get?.operationId).toBe('getCardGallery')
  })
})
