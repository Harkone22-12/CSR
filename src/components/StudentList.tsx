import type { Student } from '../types';
import StudentRow from './StudentRow';

interface Props {
  students: Student[]; // the ONE list state, owned by App
  lastAddedId: string | null; // which card to mark as "New"
}

// Renders the list from props: one StudentRow per student. No state of its own.
export default function StudentList({ students, lastAddedId }: Props) {
  if (students.length === 0) {
    return (
      <div className="empty pixel-box">
        <h2>No students yet</h2>
        <p>Add a new student with the form.</p>
      </div>
    );
  }

  return (
    <div className="grid" id="roster-grid">
      {students.map((student) => (
        // key = student id, so React keeps the old cards and only creates the new one
        <StudentRow key={student.id} student={student} isNew={student.id === lastAddedId} />
      ))}
    </div>
  );
}
