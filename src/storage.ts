import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { Student, StudentStats } from './types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');
const DATA_FILE = path.join(DATA_DIR, 'students.json');

const INITIAL_STUDENTS: Student[] = [
  {
    id: "STU-2024-101",
    fullName: "Elena Rostova",
    email: "e.rostova@university.edu",
    phone: "+1 (555) 234-8901",
    major: "Computer Science",
    department: "Engineering & Technology",
    year: "Junior",
    enrollmentYear: 2024,
    gpa: 3.88,
    status: "Active",
    credits: 76,
    advisor: "Dr. Alan Turing",
    address: "402 North Campus Hall, Dorm A"
  },
  {
    id: "STU-2023-042",
    fullName: "Marcus Chen",
    email: "m.chen@university.edu",
    phone: "+1 (555) 345-6712",
    major: "Electrical Engineering",
    department: "Engineering & Technology",
    year: "Senior",
    enrollmentYear: 2023,
    gpa: 3.75,
    status: "Active",
    credits: 108,
    advisor: "Prof. Shannon Bell",
    address: "15 University Ave, Apt 3B"
  },
  {
    id: "STU-2025-215",
    fullName: "Amara Okafor",
    email: "a.okafor@university.edu",
    phone: "+1 (555) 456-7890",
    major: "Biomedical Sciences",
    department: "Life & Health Sciences",
    year: "Sophomore",
    enrollmentYear: 2025,
    gpa: 3.92,
    status: "Active",
    credits: 48,
    advisor: "Dr. Rosalind Franklin",
    address: "218 West Quad Res Hall"
  },
  {
    id: "STU-2024-330",
    fullName: "Julian Vance",
    email: "j.vance@university.edu",
    phone: "+1 (555) 567-8901",
    major: "Business Administration",
    department: "School of Management",
    year: "Junior",
    enrollmentYear: 2024,
    gpa: 3.41,
    status: "Active",
    credits: 70,
    advisor: "Prof. Peter Drucker",
    address: "88 Elm Street, Apt 12"
  },
  {
    id: "STU-2022-019",
    fullName: "Sophia Al-Mansoor",
    email: "s.almansoor@university.edu",
    phone: "+1 (555) 678-9012",
    major: "Economics",
    department: "Social Sciences",
    year: "Senior",
    enrollmentYear: 2022,
    gpa: 3.65,
    status: "Graduated",
    credits: 124,
    advisor: "Dr. Milton Friedman",
    address: "104 Maple Grove Road"
  },
  {
    id: "STU-2025-088",
    fullName: "Liam O'Connor",
    email: "l.oconnor@university.edu",
    phone: "+1 (555) 789-0123",
    major: "Architecture",
    department: "Design & Environmental Studies",
    year: "Sophomore",
    enrollmentYear: 2025,
    gpa: 2.85,
    status: "Probation",
    credits: 42,
    advisor: "Prof. Frank Gehry",
    address: "South Tower 305"
  },
  {
    id: "STU-2026-004",
    fullName: "Chloe Moreau",
    email: "c.moreau@university.edu",
    phone: "+1 (555) 890-1234",
    major: "Computer Science",
    department: "Engineering & Technology",
    year: "Freshman",
    enrollmentYear: 2026,
    gpa: 3.95,
    status: "Active",
    credits: 18,
    advisor: "Dr. Alan Turing",
    address: "Founders Hall, Room 112"
  },
  {
    id: "STU-2023-112",
    fullName: "Devon Miller",
    email: "d.miller@university.edu",
    phone: "+1 (555) 901-2345",
    major: "Mechanical Engineering",
    department: "Engineering & Technology",
    year: "Senior",
    enrollmentYear: 2023,
    gpa: 3.22,
    status: "On Leave",
    credits: 92,
    advisor: "Dr. Nikola Tesla",
    address: "52 Riverwalk Promenade"
  }
];

export async function readStudents(): Promise<Student[]> {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      await fs.promises.mkdir(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      await fs.promises.writeFile(DATA_FILE, JSON.stringify(INITIAL_STUDENTS, null, 2), 'utf-8');
      return INITIAL_STUDENTS;
    }
    const content = await fs.promises.readFile(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return INITIAL_STUDENTS;
  } catch (err) {
    console.error('Error reading students.json:', err);
    return INITIAL_STUDENTS;
  }
}

export async function writeStudents(students: Student[]): Promise<void> {
  if (!fs.existsSync(DATA_DIR)) {
    await fs.promises.mkdir(DATA_DIR, { recursive: true });
  }
  await fs.promises.writeFile(DATA_FILE, JSON.stringify(students, null, 2), 'utf-8');
}

export async function resetDemoData(): Promise<Student[]> {
  await writeStudents(INITIAL_STUDENTS);
  return INITIAL_STUDENTS;
}

export async function getRawJson(): Promise<string> {
  if (fs.existsSync(DATA_FILE)) {
    return await fs.promises.readFile(DATA_FILE, 'utf-8');
  }
  return JSON.stringify(INITIAL_STUDENTS, null, 2);
}

export interface QueryFilter {
  q?: string;         // Feature 1: Keyword search
  major?: string;     // Feature 2: Academic filters
  status?: string;
  year?: string;
  minGpa?: string | number;
  maxGpa?: string | number;
  sortBy?: 'name' | 'gpa' | 'id' | 'year';
  sortOrder?: 'asc' | 'desc';
}

export function filterStudents(allStudents: Student[], filter: QueryFilter): Student[] {
  let result = [...allStudents];

  // Feature 1: Keyword Text Search (Name, Student ID, Email, Major)
  if (filter.q && filter.q.trim() !== '') {
    const term = filter.q.trim().toLowerCase();
    result = result.filter(s => 
      s.fullName.toLowerCase().includes(term) ||
      s.id.toLowerCase().includes(term) ||
      s.email.toLowerCase().includes(term) ||
      s.major.toLowerCase().includes(term) ||
      (s.department && s.department.toLowerCase().includes(term))
    );
  }

  // Feature 2: Structured Academic Multi-Parameter Filter
  if (filter.major && filter.major.trim() !== '') {
    result = result.filter(s => s.major.toLowerCase() === filter.major!.trim().toLowerCase());
  }

  if (filter.status && filter.status.trim() !== '') {
    result = result.filter(s => s.status.toLowerCase() === filter.status!.trim().toLowerCase());
  }

  if (filter.year && filter.year.trim() !== '') {
    result = result.filter(s => s.enrollmentYear.toString() === filter.year!.trim() || s.year === filter.year!.trim());
  }

  if (filter.minGpa !== undefined && filter.minGpa !== '') {
    const min = parseFloat(String(filter.minGpa));
    if (!isNaN(min)) {
      result = result.filter(s => s.gpa >= min);
    }
  }

  if (filter.maxGpa !== undefined && filter.maxGpa !== '') {
    const max = parseFloat(String(filter.maxGpa));
    if (!isNaN(max)) {
      result = result.filter(s => s.gpa <= max);
    }
  }

  // Sorting
  if (filter.sortBy) {
    const order = filter.sortOrder === 'desc' ? -1 : 1;
    result.sort((a, b) => {
      if (filter.sortBy === 'gpa') return (a.gpa - b.gpa) * order;
      if (filter.sortBy === 'name') return a.fullName.localeCompare(b.fullName) * order;
      if (filter.sortBy === 'year') return (a.enrollmentYear - b.enrollmentYear) * order;
      return a.id.localeCompare(b.id) * order;
    });
  }

  return result;
}

export function calculateStats(students: Student[]): StudentStats {
  const totalCount = students.length;
  const activeCount = students.filter(s => s.status === 'Active').length;
  const probationCount = students.filter(s => s.status === 'Probation').length;
  const graduatedCount = students.filter(s => s.status === 'Graduated').length;
  
  const gpaSum = students.reduce((acc, s) => acc + (Number(s.gpa) || 0), 0);
  const avgGpa = totalCount > 0 ? (gpaSum / totalCount).toFixed(2) : '0.00';

  const departments = new Set(students.map(s => s.department).filter(Boolean));
  const majors = new Set(students.map(s => s.major).filter(Boolean));

  return {
    totalCount,
    activeCount,
    avgGpa,
    probationCount,
    graduatedCount,
    departmentsCount: departments.size,
    majorsCount: majors.size,
  };
}
