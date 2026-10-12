import { useEffect, useRef, useState, type MouseEvent } from 'react';
import type { Student, StudentInput } from './types';
import { SEED_STUDENTS } from './seed';
import { toStudent, validateStudent } from './studentUtils';
import { matchPath, navigate, useRoute } from './router';
import ThemeToggle from './components/ThemeToggle';
import StudentsPage from './pages/StudentsPage';
import EditStudentPage from './pages/EditStudentPage';

// App is the STATE OWNER of the student list.
// `students` below is the only place the list is stored. Every screen and
// component gets it through props, and every change goes through
// addStudent / updateStudent / deleteStudent, which call setStudents.
// There is no API and no database: reloading the page starts again from the seed.
export default function App() {
  const [students, setStudents] = useState<Student[]>(SEED_STUDENTS);
  const [lastAddedId, setLastAddedId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const route = useRoute();
  const mainRef = useRef<HTMLElement>(null);

  // ---------- state transitions (the only code that changes the list) ----------

  /** Called by AddStudentForm. Returns an error message, or null when the student was added. */
  const addStudent = (input: StudentInput): string | null => {
    const student = toStudent(input);
    const error = validateStudent(student, students);
    if (error) return error;
    setStudents((prev) => [student, ...prev]); // new array, new student first
    setLastAddedId(student.id);
    navigate('/students', `Student ${student.fullName} added. No request was sent and the page did not reload.`);
    return null;
  };

  const updateStudent = (id: string, input: StudentInput): string | null => {
    const student = toStudent({ ...input, id });
    const error = validateStudent(student, students.filter((s) => s.id !== id));
    if (error) return error;
    setStudents((prev) => prev.map((s) => (s.id === id ? student : s)));
    navigate('/students', `Student ${student.fullName} modified.`);
    return null;
  };

  const deleteStudent = (student: Student) => {
    if (!window.confirm(`Delete ${student.fullName}?`)) return;
    setStudents((prev) => prev.filter((s) => s.id !== student.id));
    navigate(route.path + (route.query.toString() ? `?${route.query}` : ''), `Student ${student.fullName} (${student.id}) deleted.`);
  };

  // ---------- small UI effects ----------

  // Show the message passed with navigate() for a few seconds.
  useEffect(() => {
    setToast(route.flash);
    if (!route.flash) return;
    const t = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(t);
  }, [route]);

  // Going between the list and the edit screen starts at the top, like a new page.
  const screen = route.path.startsWith('/students/edit/') ? 'edit' : 'list';
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [screen]);

  // "#main" would clash with the hash router, so the skip link focuses <main> by hand.
  const skipToMain = (e: MouseEvent) => {
    e.preventDefault();
    mainRef.current?.focus();
  };

  // ---------- pick the screen for the current #hash ----------

  let content;
  const edit = matchPath('/students/edit/:id', route.path);
  if (route.path === '/students' || route.path === '/students/new') {
    content = (
      <StudentsPage
        route={route}
        students={students}
        lastAddedId={lastAddedId}
        onAdd={addStudent}
        onDelete={deleteStudent}
      />
    );
  } else if (edit) {
    content = (
      <EditStudentPage
        key={edit.id}
        student={students.find((s) => s.id === edit.id)}
        onUpdate={updateStudent}
      />
    );
  } else {
    content = (
      <div className="container narrow">
        <div className="empty pixel-box form">
          <h2>Page not found</h2>
          <p><a href="#/students">Back to the directory →</a></p>
        </div>
      </div>
    );
  }

  return (
    <>
      <a className="skip-link" href="#main" onClick={skipToMain}>Skip to content</a>
      <header className="nav">
        <div className="container nav-inner">
          <a className="brand" href="#/students"><span className="brand-mark">UP</span><span>UniPortal</span></a>
          <nav aria-label="Main">
            <ul className="nav-links">
              <li><a href="#/students">Directory</a></li>
              <li><a href="#/students/new">Add Student</a></li>
            </ul>
          </nav>
          <div className="nav-actions">
            <ThemeToggle />
            <a className="btn btn-primary" href="#/students/new">+ Add</a>
          </div>
        </div>
      </header>

      {toast && (
        <p className="flash toast" role="status"><i className="ph ph-check-circle" aria-hidden="true" />{toast}</p>
      )}

      <main id="main" ref={mainRef} tabIndex={-1}>
        {content}
      </main>

      <footer className="footer">
        <div className="container footer-inner">
          <span>UniPortal · React + Vite (client-side rendering) · data kept in React state</span>
          <span>{students.length} student(s) in state · <a href="#/students">All records</a></span>
        </div>
      </footer>
    </>
  );
}
