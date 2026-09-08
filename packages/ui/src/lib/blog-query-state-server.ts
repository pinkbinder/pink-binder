import { createLoader } from 'nuqs/server'
import { blogFilterParsers } from './blog-query-state'

export const loadBlogFilterSearchParams = createLoader(blogFilterParsers)
