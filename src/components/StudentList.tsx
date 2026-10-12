import { useEffect, useRef, useState } from 'react';
import type { Student } from '../types';
import StudentRow from './StudentRow';

const PAGE_SIZE = 12;

interface Props {
  students: Student[];       // already filtered, comes from App state
  resetKey: string;          // changes when the filters change
  lastAddedId: string | null;
  onDelete: (student: Student) => void;
}

// Renders the list from props. The only local state is how many cards are
// shown (a UI detail for infinite scroll), never the students themselves.
export default function StudentList({ students, resetKey, lastAddedId, onDelete }: Props) {
  const [visible, setVisible] = useState(PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const total = students.length;

  // New filters: start again from the first 12 cards.
  useEffect(() => setVisible(PAGE_SIZE), [resetKey]);

  // Infinite roster: show 12 more cards when the sentinel comes near the screen.
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || visible >= total) return;
    const obs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) setVisible((v) => v + PAGE_SIZE);
    }, { rootMargin: '600px' });
    obs.observe(el);
    return () => obs.disconnect();
  }, [visible, total]);

  if (total === 0) {
    return (
      <div className="empty pixel-box">
        <h2>No students found</h2>
        <p>Try relaxing the filters, or add a new student with the form.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid" id="roster-grid">
        {students.slice(0, visible).map((s) => (
          // key = student id, so React keeps old cards and only creates the new one
          <StudentRow key={s.id} student={s} isNew={s.id === lastAddedId} onDelete={onDelete} />
        ))}
      </div>
      <div className="sentinel" ref={sentinelRef} role="status">
        {visible < total ? 'Loading more students…' : total > PAGE_SIZE ? 'End of roster' : null}
      </div>
    </>
  );
}
