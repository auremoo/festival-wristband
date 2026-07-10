#!/usr/bin/env node
// Renders the source app icon (public/icon-source.png) into the PWA PNG icons
// and favicon. Run after replacing the source: `npm run icons`.

import sharp from 'sharp'
import { readFileSync } from 'fs'

const src = readFileSync('public/icon-source.png')

await sharp(src).resize(192, 192).png().toFile('public/icon-192.png')
await sharp(src).resize(512, 512).png().toFile('public/icon-512.png')
// Source is a square, edge-to-edge icon → doubles as the maskable icon.
await sharp(src).resize(512, 512).png().toFile('public/icon-maskable-512.png')
// Small favicon for browser tabs.
await sharp(src).resize(48, 48).png().toFile('public/favicon.png')

console.log('Generated icon-192.png, icon-512.png, icon-maskable-512.png, favicon.png')
