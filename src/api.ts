// All data comes from the Express REST API. In the EJS version the server
// read students.json and put the data straight into HTML. Now the browser
// asks for JSON with fetch() and React builds the HTML.
import type { Student, StudentStats } from './types';

export interface Options {
  majors: string[];
  departments: string[];
  years: number[];
}

/** Form values are strings; the server converts gpa/credits/year to numbers. */
export type StudentInput = Record<keyof Student, string>;

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data && data.error) || `Request failed (${res.status})`);
  }
  return data as T;
}

const enc = encodeURIComponent;

export const api = {
  listStudents(filters: Record<string, string>) {
    const qs = new URLSearchParams(filters).toString();
    return request<Student[]>(`/api/students?${qs}`);
  },
  getStudent(id: string) {
    return request<Student>(`/api/students/${enc(id)}`);
  },
  createStudent(input: StudentInput) {
    return request<Student>('/api/students', { method: 'POST', body: JSON.stringify(input) });
  },
  updateStudent(id: string, input: Partial<StudentInput>) {
    return request<Student>(`/api/students/${enc(id)}`, { method: 'PUT', body: JSON.stringify(input) });
  },
  deleteStudent(id: string) {
    return request<{ success: boolean; message: string }>(`/api/students/${enc(id)}`, { method: 'DELETE' });
  },
  stats() {
    return request<StudentStats>('/api/stats');
  },
  options() {
    return request<Options>('/api/options');
  },
};
