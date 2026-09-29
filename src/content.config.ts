import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const routeClassificationSchema = z.enum(['DEPORTIVA']);

const routeStatusSchema = z.enum([
  'Completa',
  'Inconclusa',
  'Proyecto'
]);

const topoTypeSchema = z.enum([
  'vias',
  'ubicacion',
  'acceso',
  'descenso',
  'panoramica'
]);

const sectors = defineCollection({
  loader: glob({
    pattern: '**/*.{md,mdx}',
    base: './src/data/sectores'
  }),
  schema: z.object({
    name: z.string(),
    aliases: z.array(z.string()).default([]),
    description: z.string().optional(),
    elevation: z.number().optional(),
    orientation: z.string().optional(),
    routes: z.number().optional(),
    grades: z.string().optional(),
    approach: z.string().optional(),
    declaredRoutes: z.number().optional(),
    restriction: z.string().optional(),
    warning: z.string().optional(),
    countNote: z.string().optional(),
    source: z.url().optional(),
    number: z.number(),
    order: z.number(),
    featured: z.boolean().default(false)
  })
});

const routes = defineCollection({
  loader: glob({
    pattern: '**/*.{md,mdx}',
    base: './src/data/vias'
  }),
  schema: z.object({
    name: z.string(),
    sector: z.string(),
    order: z.number().optional(),
    grade: z.string().optional(),
    gradeValue: z.number().optional(),
    gradeUncertain: z.boolean().default(false),
    classification: routeClassificationSchema,
    pitches: z.number().optional(),
    pitchesApproximate: z.boolean().default(false),
    length: z.number().optional(),
    lengthApproximate: z.boolean().default(false),
    description: z.string(),
    sourceText: z.string(),
    protection: z.string().optional(),
    bolts: z.number().optional(),
    anchorPoints: z.number().optional(),
    sourceOrder: z.number().optional(),
    source: z.url().optional(),
    restriction: z.string().optional(),
    warning: z.string().optional(),
    equipment: z.array(z.string()).default([]),
    firstAscent: z.string().optional(),
    history: z.string().optional(),
    status: routeStatusSchema.optional(),
    featured: z.boolean().default(false),
    verified: z.boolean().default(false)
  })
});

const classifications = defineCollection({
  loader: glob({
    pattern: '**/*.md',
    base: './src/data/clasificaciones'
  }),
  schema: z.object({
    name: routeClassificationSchema,
    order: z.number(),
    sourceText: z.string()
  })
});

const topos = defineCollection({
  loader: glob({
    pattern: '**/*.{md,mdx}',
    base: './src/data/croquis'
  }),
  schema: z.object({
    name: z.string(),
    sector: z.string().optional(),
    sectors: z.array(z.string()).default([]),
    type: topoTypeSchema,
    image: z.string().startsWith('/'),
    alt: z.string(),
    caption: z.string().optional(),
    routes: z.array(z.string()).default([]),
    routeCard: z.boolean().default(false),
    order: z.number().default(999),
    updated: z.coerce.date(),
    author: z.string().optional(),
    source: z.string().optional(),
    verified: z.boolean().default(false),
    offline: z.boolean().default(true)
  })
});

export const collections = {
  sectors,
  routes,
  classifications,
  topos
};
