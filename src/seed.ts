// Seed data: the exact same records as Block 1 (the SSR version).
// Vite copies data/students.json into the JS bundle at build time,
// so the browser never sends a request for it and there is no API.
import seedJson from '../data/students.json';
import type { Student } from './types';

export const SEED_STUDENTS = seedJson as Student[];
