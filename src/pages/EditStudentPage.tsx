import { useEffect, useState } from 'react';
import type { Student, StudentInput } from '../types';
import { toInput } from '../studentUtils';
import StudentForm from '../components/StudentForm';

interface Props {
  student: Student | undefined;   // found in App state by ID
  onUpdate: (id: string, input: StudentInput) => string | null;
}

export default function EditStudentPage({ student, onUpdate }: Props) {
  // State owner of the edit form (a copy of the student, as strings).
  const [values, setValues] = useState<StudentInput | null>(student ? toInput(student) : null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = student ? `Modifier Student - ${student.fullName}` : 'Student not found - UniPortal';
  }, [student]);

  if (!student || !values) {
    return (
      <div className="container narrow">
        <a className="back-link" href="#/students">&larr; Back to directory</a>
        <div className="empty pixel-box form" role="alert">
          <h2>Student not found</h2>
          <p>There is no student with this ID in the current state.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container narrow">
      <a className="back-link" href="#/students">&larr; Back to directory</a>
      <StudentForm
        title="Modifier record"
        lede={<>Editing <strong>{student.fullName}</strong> ({student.id}).</>}
        values={values}
        onChange={setValues}
        onSubmit={() => setError(onUpdate(student.id, values))}
        error={error}
        submitLabel="Update record"
        idReadOnly
        cancelHref="#/students"
      />
    </div>
  );
}
