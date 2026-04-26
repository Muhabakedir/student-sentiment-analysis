import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Users, ToggleLeft, ToggleRight, UserCheck } from "lucide-react";
import API from "../config";

export default function Students() {
  const { token, isSuperAdmin } = useAuth();
  const [students, setStudents] = useState([]);
  const [feedbackCount, setFeedbackCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  const fetchAll = async () => {
    try {
      const [studentsRes, statsRes] = await Promise.all([
        fetch(`${API}/api/admin/students`, { headers }),
        fetch(`${API}/api/stats`, { headers }),
      ]);
      if (studentsRes.ok) setStudents(await studentsRes.json());
      if (statsRes.ok) {
        const stats = await statsRes.json();
        setFeedbackCount(stats.students_with_feedback || 0);
      }
    } catch (e) {
      setError("Failed to load student data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleToggle = async (studentId) => {
    try {
      const r = await fetch(`${API}/api/admin/students/${studentId}/toggle`, {
        method: "PATCH",
        headers,
      });
      if (r.ok) {
        fetchAll();
      }
    } catch (e) {
      setError("Failed to toggle student status");
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-black mb-6">Students</h1>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-violet-100 dark:bg-gray-800 flex items-center justify-center">
              <Users className="text-violet-600 dark:text-gray-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-600">Registered Students</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-black">{students.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-gray-800 flex items-center justify-center">
              <UserCheck className="text-green-600 dark:text-gray-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-600">Students with Feedback</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-black">{feedbackCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Registered Students Table */}
      <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-black">Registered Students</h2>
        </div>
        {students.length === 0 ? (
          <div className="p-6 text-center text-gray-500 dark:text-gray-600">
            No students registered yet
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-600 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-600 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-600 uppercase tracking-wider">Student ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-600 uppercase tracking-wider">Status</th>
                  {isSuperAdmin && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-600 uppercase tracking-wider">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-black">{student.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-600">{student.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-600">{student.student_id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        student.is_active
                          ? "bg-green-100 text-green-800 dark:bg-gray-800 dark:text-gray-600"
                          : "bg-red-100 text-red-800 dark:bg-gray-800 dark:text-gray-600"
                      }`}>
                        {student.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    {isSuperAdmin && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggle(student.id)}
                          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                          title={student.is_active ? "Deactivate" : "Activate"}
                        >
                          {student.is_active ? (
                            <ToggleRight className="text-green-600 dark:text-gray-600" size={18} />
                          ) : (
                            <ToggleLeft className="text-red-600 dark:text-gray-600" size={18} />
                          )}
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
