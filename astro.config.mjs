import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import { siteConfig } from './site.config.mjs';

export default defineConfig({
  site: siteConfig.siteUrl,
  integrations: [
    mdx(),
    sitemap()
  ],
  vite: { plugins: [tailwindcss(), VitePWA({
      registerType: 'prompt',
      includeAssets: ['icons/icon.svg', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png', 'icons/apple-touch-icon.png'],
      manifest: {
        name: siteConfig.fullName,
        short_name: siteConfig.shortName,
        description: siteConfig.description,
        theme_color: siteConfig.theme.color,
        background_color: siteConfig.theme.background,
        display: 'standalone',
        start_url: '/',
        lang: siteConfig.locale,
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{html,css,js,svg,png,jpg,jpeg,webp,avif,woff2}'],
        navigateFallback: '/offline/',
        runtimeCaching: [{
          urlPattern: ({ request }) => request.destination === 'image',
          handler: 'CacheFirst',
          options: { cacheName: 'colorados-images', expiration: { maxEntries: 120, maxAgeSeconds: 60 * 60 * 24 * 90 } }
        }]
      }
    })] }
});
