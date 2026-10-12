import { useEffect, useRef } from 'react';
import type { Student } from '../types';
import { paintSprite } from '../sprite';

const gpaClass = (g: number) => (g >= 3.5 ? 'honor' : g >= 3 ? 'good' : 'warn');
const statusClass = (s: string) =>
  s === 'Active' ? 'ok' : s === 'Graduated' ? 'info' : s === 'Probation' ? 'bad' : 'warn';

interface Props {
  student: Student;
  onDelete: (student: Student) => void;
}

// One roster card. React escapes every {value} for us, so names with
// quotes or "<" are safe without the manual esc() from campus.js.
export default function StudentCard({ student, onDelete }: Props) {
  const cardRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Draw the pixel character after the <canvas> exists in the DOM.
  useEffect(() => {
    if (canvasRef.current) paintSprite(canvasRef.current, student.id);
  }, [student.id]);

  // Reveal-on-scroll: add class "in" when the card enters the screen.
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const obs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        el.classList.add('in');
        obs.disconnect();
      }
    }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const gpa = Number(student.gpa) || 0;

  return (
    <article ref={cardRef} className="card pixel-box reveal">
      <canvas
        ref={canvasRef}
        className="sprite"
        width={18}
        height={23}
        role="img"
        aria-label={`Pixel character of ${student.fullName}`}
      />
      <h3>{student.fullName}</h3>
      <p className="card-id">{student.id}</p>
      <ul className="chips">
        <li className="chip">{student.major}</li>
        <li className="chip">{student.year} · {student.enrollmentYear}</li>
        <li className={`chip ${gpaClass(gpa)}`}>GPA {gpa.toFixed(2)}</li>
        <li className={`chip ${statusClass(student.status)}`}>{student.status}</li>
      </ul>
      <div className="actions">
        <a className="btn btn-small" href={`#/students/edit/${encodeURIComponent(student.id)}`}>Modifier</a>
        <button className="btn btn-small btn-danger" type="button" onClick={() => onDelete(student)}>
          Delete
        </button>
      </div>
    </article>
  );
}
