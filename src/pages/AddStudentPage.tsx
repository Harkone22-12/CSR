import { useEffect, useState } from 'react';
import { api, type StudentInput } from '../api';
import { navigate } from '../router';
import StudentForm from '../components/StudentForm';

const EMPTY: StudentInput = {
  id: '', fullName: '', email: '', phone: '', major: '', department: '',
  year: 'Freshman', enrollmentYear: '2026', gpa: '3.50', status: 'Active',
  credits: '30', advisor: '', address: '',
};

export default function AddStudentPage() {
  // The EJS server computed the suggested ID before sending HTML.
  // Here we fetch the list first and compute it in the browser.
  const [initial, setInitial] = useState<StudentInput | null>(null);

  useEffect(() => {
    document.title = 'Add New Student - UniPortal';
    let cancelled = false;
    api.listStudents({})
      .then((all) => all.length)
      .catch(() => 0)
      .then((count) => {
        if (cancelled) return;
        const defaultId = `STU-2026-${String(count + 101).padStart(3, '0')}`;
        setInitial({ ...EMPTY, id: defaultId });
      });
    return () => { cancelled = true; };
  }, []);

  if (!initial) {
    return (
      <div className="container narrow">
        <div className="empty pixel-box form" role="status"><h2>Loading form…</h2></div>
      </div>
    );
  }

  return (
    <StudentForm
      title="Add new student"
      lede="Create an enrollment profile and persist it to students.json."
      initial={initial}
      submitLabel="Save to JSON"
      onSubmit={async (values) => {
        const created = await api.createStudent(values);
        navigate('/students', `Student ${created.fullName} added successfully and saved to students.json!`);
      }}
    />
  );
}
