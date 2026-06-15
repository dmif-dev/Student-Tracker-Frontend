import re

with open(r'd:\projects\5\Student-Tracker\Student-Tracker-Frontend\packages\web\app\admin\reports\page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add state
content = content.replace(
    'const [showEditModal, setShowEditModal] = useState(false);',
    'const [showEditModal, setShowEditModal] = useState(false);\n  const [deletingScheduleId, setDeletingScheduleId] = useState<string | null>(null);'
)

# 2. Modify handleDeleteSchedule
old_delete = """  const handleDeleteSchedule = async (scheduleId: string) => {
    if (confirm('Are you sure you want to delete this scheduled report?')) {
      const originalSchedules = [...scheduledReports];
      // Optimistic update
      setScheduledReports(prev => prev.filter(s => s.id !== scheduleId));

      try {
        await ApiService.deleteScheduledReport(scheduleId);
      } catch (error) {
        console.error('Failed to delete scheduled report:', error);
        setScheduledReports(originalSchedules);
        toast.error('Failed to delete scheduled report. Please try again.');
      }
    }
  };"""

new_delete = """  const confirmDelete = (scheduleId: string) => {
    setDeletingScheduleId(scheduleId);
  };

  const handleDeleteSchedule = async () => {
    if (!deletingScheduleId) return;
    const scheduleId = deletingScheduleId;
    setDeletingScheduleId(null);
    
    const originalSchedules = [...scheduledReports];
    // Optimistic update
    setScheduledReports(prev => prev.filter(s => s.id !== scheduleId));

    try {
      await ApiService.deleteScheduledReport(scheduleId);
      toast.success('Scheduled report deleted successfully.');
    } catch (error) {
      console.error('Failed to delete scheduled report:', error);
      setScheduledReports(originalSchedules);
      toast.error('Failed to delete scheduled report. Please try again.');
    }
  };"""

content = content.replace(old_delete, new_delete)

# 3. Modify onClick
content = content.replace(
    'onClick={() => handleDeleteSchedule(schedule.id)}',
    'onClick={() => confirmDelete(schedule.id)}'
)

# 4. Add Modal
modal_html = """      {/* Edit Schedule Modal */}
      {showEditModal && editingSchedule && (
        <EditScheduleModal
          schedule={editingSchedule}
          programsList={programsList}
          onClose={() => {
            setShowEditModal(false);
            setEditingSchedule(null);
          }}
          onSave={handleSaveSchedule}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingScheduleId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl">
            <div className="flex items-center text-red-600 mb-4">
              <AlertCircle size={24} className="mr-2" />
              <h3 className="text-lg font-bold text-gray-900">Delete Schedule</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this scheduled report? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeletingScheduleId(null)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSchedule}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>"""

content = content.replace(
    '''      {/* Edit Schedule Modal */}
      {showEditModal && editingSchedule && (
        <EditScheduleModal
          schedule={editingSchedule}
          programsList={programsList}
          onClose={() => {
            setShowEditModal(false);
            setEditingSchedule(null);
          }}
          onSave={handleSaveSchedule}
        />
      )}
    </div>''',
    modal_html
)

with open(r'd:\projects\5\Student-Tracker\Student-Tracker-Frontend\packages\web\app\admin\reports\page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
