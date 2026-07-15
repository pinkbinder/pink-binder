import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const appDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const monorepoRoot = path.resolve(appDir, '../..')
const blogsDir = path.join(monorepoRoot, 'packages/data/cache/normalized/blogs')
const indexPath = path.join(blogsDir, 'index.json')
const tracePath = path.join(appDir, '.next/server/app/posts/[...slug]/page.js.nft.json')
const galleryTracePath = path.join(appDir, '.next/server/app/api/card-gallery/route.js.nft.json')

function fail(message) {
  console.error(`Blog route trace validation failed: ${message}`)
  process.exit(1)
}

if (!fs.existsSync(tracePath)) fail(`missing ${path.relative(monorepoRoot, tracePath)}`)

const index = JSON.parse(fs.readFileSync(indexPath, 'utf8'))
const trace = JSON.parse(fs.readFileSync(tracePath, 'utf8'))
const traceDir = path.dirname(tracePath)
const entries = Object.values(index.bySlug ?? {})
const tracedFiles = new Set(trace.files.map((file) => path.resolve(traceDir, file)))
let tracedBytes = 0

for (const entry of entries) {
  if (
    !entry ||
    typeof entry.slug !== 'string' ||
    typeof entry.file !== 'string' ||
    !/^(?:pokemon|roundups|illustrators|expansions|generations)\/[a-z0-9][a-z0-9/-]*\.json$/.test(
      entry.file
    )
  ) {
    fail(`invalid blog index entry: ${JSON.stringify(entry)}`)
  }

  const artifactPath = path.join(blogsDir, entry.file)
  if (!fs.existsSync(artifactPath)) {
    fail(`${entry.slug}: source artifact is missing (${entry.file})`)
  }
  if (!tracedFiles.has(artifactPath)) {
    fail(`${entry.slug}: deployment trace is missing ${entry.file}`)
  }
  tracedBytes += fs.statSync(artifactPath).size
}

console.log(
  `Verified ${entries.length} indexed blog routes in the deployment trace (${(
    tracedBytes /
    1024 /
    1024
  ).toFixed(2)} MiB).`
)

if (!fs.existsSync(galleryTracePath)) {
  fail(`missing ${path.relative(monorepoRoot, galleryTracePath)}`)
}
const galleryTrace = JSON.parse(fs.readFileSync(galleryTracePath, 'utf8'))
const galleryTraceDir = path.dirname(galleryTracePath)
const galleryFiles = galleryTrace.files.map((file) => path.resolve(galleryTraceDir, file))
const forbiddenGalleryData = galleryFiles.filter(
  (file) =>
    file.includes('/packages/data/cache/normalized/pokemon/') ||
    file.includes('/packages/data/cache/normalized/meta/cards/illustrators/')
)
if (forbiddenGalleryData.length > 0) {
  fail(`gallery API still traces ${forbiddenGalleryData.length} species/illustrator data files`)
}
const galleryTraceBytes = galleryFiles.reduce(
  (total, file) => total + (fs.existsSync(file) ? fs.statSync(file).size : 0),
  0
)
console.log(
  `Verified gallery API trace excludes species/illustrator data (${(
    galleryTraceBytes /
    1024 /
    1024
  ).toFixed(2)} MiB total trace).`
)
