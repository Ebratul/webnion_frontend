import type { Project } from './types';

// The Portfolio page's filter. Each project falls under one kind, read from the words in its Category, so the admin
// decides it by how they name the category and no separate setting is needed.
export const PROJECT_TYPES = ['ecommerce', 'business', 'school', 'landing'] as const;
export type ProjectType = (typeof PROJECT_TYPES)[number];

// Checked in order: a shop for a school ("Educational E-commerce Website") is an online shop. Anything else is Business.
const RULES: [ProjectType, RegExp][] = [
  ['landing', /landing|ল্যান্ডিং/i],
  ['ecommerce', /commerce|shop|store|marketplace|ই-কমার্স|কমার্স|শপ|স্টোর/i],
  ['school', /school|learning|education|academy|college|university|madrasa|coaching|institute|স্কুল|লার্নিং|শিক্ষা|একাডেমি|কলেজ|বিশ্ববিদ্যালয়|মাদ্রাসা|কোচিং/i],
];

export const projectType = (project: Pick<Project, 'category'>): ProjectType =>
  RULES.find(([, pattern]) => pattern.test(project.category))?.[0] ?? 'business';

export const isProjectType = (value: string | undefined): value is ProjectType => PROJECT_TYPES.includes(value as ProjectType);
