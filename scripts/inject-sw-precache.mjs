#!/usr/bin/env node
// Reads the Vite build manifest and injects the asset list into dist/sw.js
// so the service worker precaches all app chunks on install.

import { readFileSync, writeFileSync } from 'fs'

const manifest = JSON.parse(readFileSync('dist/.vite/manifest.json', 'utf8'))
const BASE = '/festival-wristband/'

const urls = new Set([BASE, BASE + 'manifest.json'])

for (const entry of Object.values(manifest)) {
  if (entry.file) urls.add(BASE + entry.file)
  for (const css of entry.css ?? []) urls.add(BASE + css)
}

const list = JSON.stringify([...urls], null, 2)

const sw = readFileSync('dist/sw.js', 'utf8')
const updated = sw.replace(
  /const PRECACHE_URLS = \[\]/,
  `const PRECACHE_URLS = ${list}`
)

if (updated === sw) {
  console.error('Could not find PRECACHE_URLS placeholder in dist/sw.js')
  process.exit(1)
}

writeFileSync('dist/sw.js', updated)
console.log(`Injected ${urls.size} URLs into service worker.`)
