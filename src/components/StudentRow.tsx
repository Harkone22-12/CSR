import { useEffect, useRef } from 'react';
import type { Student } from '../types';

const gpaClass = (g: number) => (g >= 3.5 ? 'honor' : g >= 3 ? 'good' : 'warn');
const statusClass = (s: string) =>
  s === 'Active' ? 'ok' : s === 'Graduated' ? 'info' : s === 'Probation' ? 'bad' : 'warn';

interface Props {
  student: Student;
  isNew: boolean;
}

// One student in the list (drawn as a card). It only reads props: no state.
// React escapes every {value}, so names with quotes or "<" are shown as text.
export default function StudentRow({ student, isNew }: Props) {
  const cardRef = useRef<HTMLElement>(null);
  const gpa = Number(student.gpa) || 0;

  // When the new card appears, scroll it into view so the user always sees it,
  // even if they had scrolled down the list or are on a phone (form above list).
  useEffect(() => {
    if (isNew) cardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [isNew]);

  return (
    <article ref={cardRef} className={`card pixel-box${isNew ? ' is-new' : ''}`} data-id={student.id}>
      {isNew && <p className="new-tag">New</p>}
      <h3>{student.fullName}</h3>
      <p className="card-id">{student.id}</p>
      <p className="card-email">{student.email}</p>
      <ul className="chips">
        <li className="chip">{student.major}</li>
        <li className="chip">{student.year} · {student.enrollmentYear}</li>
        <li className={`chip ${gpaClass(gpa)}`}>GPA {gpa.toFixed(2)}</li>
        <li className={`chip ${statusClass(student.status)}`}>{student.status}</li>
      </ul>
    </article>
  );
}
