import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import {
  readStudents,
  writeStudents,
  filterStudents,
  calculateStats,
  getRawJson,
  resetDemoData,
  QueryFilter
} from './src/storage.ts';
import type { Student } from './src/types.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// `npm start` passes --prod: serve the built bundle from dist/.
// `npm run dev` has no flag: Vite compiles the React code on the fly.
const IS_PROD = process.argv.includes('--prod');

// Body parser (the client sends JSON with fetch)
app.use(express.json());

// ==========================================
// REST API ROUTES (the React client only talks to these)
// ==========================================

// Get all students with query filters
app.get('/api/students', async (req, res) => {
  try {
    const students = await readStudents();
    const query: QueryFilter = {
      q: req.query.q as string,
      major: req.query.major as string,
      status: req.query.status as string,
      year: req.query.year as string,
      minGpa: req.query.minGpa as string,
      maxGpa: req.query.maxGpa as string,
      sortBy: (req.query.sortBy as any) || 'id',
      sortOrder: (req.query.sortOrder as any) || 'asc',
    };
    const filtered = filterStudents(students, query);
    res.json(filtered);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get single student
app.get('/api/students/:id', async (req, res) => {
  try {
    const students = await readStudents();
    const student = students.find(s => s.id.toLowerCase() === req.params.id.toLowerCase());
    if (!student) {
      return res.status(404).json({ error: 'Student record not found' });
    }
    res.json(student);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Add student
app.post('/api/students', async (req, res) => {
  try {
    const {
      id,
      fullName,
      email,
      phone,
      major,
      department,
      year,
      enrollmentYear,
      gpa,
      status,
      credits,
      advisor,
      address,
    } = req.body;

    if (!id || !fullName || !email || !major) {
      return res.status(400).json({ error: 'Missing required student fields (id, fullName, email, major).' });
    }

    const students = await readStudents();
    if (students.some(s => s.id.toLowerCase() === id.trim().toLowerCase())) {
      return res.status(409).json({ error: `Student with ID "${id}" already exists.` });
    }

    const newStudent: Student = {
      id: id.trim(),
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone ? phone.trim() : '',
      major: major.trim(),
      department: department ? department.trim() : 'General Studies',
      year: year || 'Freshman',
      enrollmentYear: parseInt(enrollmentYear, 10) || new Date().getFullYear(),
      gpa: parseFloat(gpa) || 0.0,
      status: status || 'Active',
      credits: parseInt(credits, 10) || 0,
      advisor: advisor ? advisor.trim() : '',
      address: address ? address.trim() : '',
    };

    students.unshift(newStudent);
    await writeStudents(students);
    res.status(201).json(newStudent);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Modifier / Update student
app.put('/api/students/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const students = await readStudents();
    const index = students.findIndex(s => s.id.toLowerCase() === id.toLowerCase());

    if (index === -1) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const payload = req.body;
    students[index] = {
      ...students[index],
      ...payload,
      id: students[index].id, // Keep ID immutable
      gpa: payload.gpa !== undefined ? parseFloat(payload.gpa) : students[index].gpa,
      credits: payload.credits !== undefined ? parseInt(payload.credits, 10) : students[index].credits,
      enrollmentYear: payload.enrollmentYear !== undefined ? parseInt(payload.enrollmentYear, 10) : students[index].enrollmentYear,
    };

    await writeStudents(students);
    res.json(students[index]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Delete student
app.delete('/api/students/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const students = await readStudents();
    const existing = students.find(s => s.id.toLowerCase() === id.toLowerCase());

    if (!existing) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const updated = students.filter(s => s.id.toLowerCase() !== id.toLowerCase());
    await writeStudents(updated);
    res.json({ success: true, message: `Student ${existing.fullName} (${id}) deleted successfully.` });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Stats summary
app.get('/api/stats', async (_req, res) => {
  try {
    const students = await readStudents();
    const stats = calculateStats(students);
    res.json(stats);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Distinct options (Majors, Departments, Years)
app.get('/api/options', async (_req, res) => {
  try {
    const students = await readStudents();
    const majors = Array.from(new Set(students.map(s => s.major))).filter(Boolean).sort();
    const departments = Array.from(new Set(students.map(s => s.department))).filter(Boolean).sort();
    const years = Array.from(new Set(students.map(s => s.enrollmentYear))).filter(Boolean).sort((a, b) => b - a);
    res.json({ majors, departments, years });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Raw JSON inspection
app.get('/api/raw-json', async (_req, res) => {
  try {
    const jsonStr = await getRawJson();
    res.setHeader('Content-Type', 'application/json');
    res.send(jsonStr);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Reset demo data
app.post('/api/reset-demo', async (_req, res) => {
  try {
    const reset = await resetDemoData();
    res.json({ success: true, count: reset.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// CLIENT-SIDE RENDERING
// The server never builds HTML for a page. It only sends an almost empty
// index.html plus the JavaScript bundle. React then fetches /api/... and
// renders every screen inside the browser.
// ==========================================

async function start() {
  if (IS_PROD) {
    const distDir = path.resolve(__dirname, 'dist');
    if (!fs.existsSync(path.join(distDir, 'index.html'))) {
      console.error('dist/ not found. Run "npm run build" first.');
      process.exit(1);
    }
    app.use(express.static(distDir));
    // Any non-API URL gets the same index.html; the hash router picks the screen.
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  } else {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`UniPortal (React CSR, ${IS_PROD ? 'production' : 'dev'}) running on http://localhost:${PORT}`);
    console.log(`- React app:  http://localhost:${PORT}/#/students`);
    console.log(`- REST API:   http://localhost:${PORT}/api/students`);
    console.log(`- JSON persistence: /data/students.json`);
  });
}

start();
