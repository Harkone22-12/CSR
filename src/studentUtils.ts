// Pure helper functions. They never change state themselves: they take
// data in and return new data out. The state owner (App) calls them.
import type { Student, StudentInput, StudentStats } from './types';

export interface Filters {
  q: string;
  major: string;
  status: string;
  year: string;
  minGpa: string;
}

/** Search + filters. The result is derived from state, it is not stored as state. */
export function filterStudents(all: Student[], f: Filters): Student[] {
  const term = f.q.trim().toLowerCase();
  return all.filter((s) => {
    if (term && ![s.fullName, s.id, s.email, s.major, s.department]
      .some((v) => (v || '').toLowerCase().includes(term))) return false;
    if (f.major && s.major !== f.major) return false;
    if (f.status && s.status !== f.status) return false;
    if (f.year && String(s.enrollmentYear) !== f.year) return false;
    if (f.minGpa && s.gpa < parseFloat(f.minGpa)) return false;
    return true;
  });
}

export function calculateStats(students: Student[]): StudentStats {
  const total = students.length;
  const gpaSum = students.reduce((acc, s) => acc + (Number(s.gpa) || 0), 0);
  return {
    totalCount: total,
    activeCount: students.filter((s) => s.status === 'Active').length,
    avgGpa: total > 0 ? (gpaSum / total).toFixed(2) : '0.00',
  };
}

/** Suggest the next free ID like STU-2026-111 (one more than the biggest STU-2026-xxx). */
export function nextStudentId(students: Student[]): string {
  const year = new Date().getFullYear();
  const prefix = `STU-${year}-`;
  const max = students
    .filter((s) => s.id.startsWith(prefix))
    .map((s) => parseInt(s.id.slice(prefix.length), 10))
    .filter((n) => !isNaN(n))
    .reduce((a, b) => Math.max(a, b), 100);
  return prefix + String(max + 1).padStart(3, '0');
}

export function emptyInput(id: string): StudentInput {
  return {
    id, fullName: '', email: '', phone: '', major: '', department: '',
    year: 'Freshman', enrollmentYear: String(new Date().getFullYear()), gpa: '3.50',
    status: 'Active', credits: '30', advisor: '', address: '',
  };
}

export function toInput(s: Student): StudentInput {
  return {
    id: s.id, fullName: s.fullName, email: s.email, phone: s.phone || '',
    major: s.major, department: s.department || '', year: s.year,
    enrollmentYear: String(s.enrollmentYear), gpa: String(s.gpa), status: s.status,
    credits: String(s.credits ?? 0), advisor: s.advisor || '', address: s.address || '',
  };
}

/** Turn form strings into a real Student (trim text, convert numbers, fill defaults). */
export function toStudent(input: StudentInput): Student {
  const t = (v: string) => (v || '').trim();
  return {
    id: t(input.id),
    fullName: t(input.fullName),
    email: t(input.email),
    phone: t(input.phone),
    major: t(input.major),
    department: t(input.department) || 'General Studies',
    year: (input.year || 'Freshman') as Student['year'],
    enrollmentYear: parseInt(input.enrollmentYear, 10) || new Date().getFullYear(),
    gpa: parseFloat(input.gpa) || 0,
    status: (input.status || 'Active') as Student['status'],
    credits: parseInt(input.credits, 10) || 0,
    advisor: t(input.advisor),
    address: t(input.address),
  };
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Check a student before it goes into state. Returns an error message, or null if OK.
 * `others` is the list to check the unique ID against.
 */
export function validateStudent(s: Student, others: Student[]): string | null {
  if (!s.id || !s.fullName || !s.email || !s.major) {
    return 'Please fill in all required fields (ID, Full Name, Email, Major, GPA).';
  }
  if (!EMAIL_RE.test(s.email)) return 'Please enter a valid email address.';
  if (s.gpa < 0 || s.gpa > 4) return 'GPA must be between 0 and 4.';
  if (others.some((o) => o.id.toLowerCase() === s.id.toLowerCase())) {
    return `Student with ID "${s.id}" already exists. Please choose a unique ID.`;
  }
  return null;
}
