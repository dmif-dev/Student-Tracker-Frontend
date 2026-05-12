// packages/web/components/mentor/SessionNotesModal.tsx

'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Clock, Calendar, BookOpen, MessageSquare, CheckCircle } from 'lucide-react';
import { Session, SessionNote } from '@student-tracker/shared/models/Session';


interface SessionNotesModalProps {
  session: Session;
  existingNotes?: SessionNote[];
  onClose: () => void;
  onSave: (sessionId: string, noteData: any) => void;
}

export default function SessionNotesModal({ 
  session, 
  existingNotes = [], 
  onClose, 
  onSave 
}: SessionNotesModalProps) {
  const [noteContent, setNoteContent] = useState('');
  const [topics, setTopics] = useState<string[]>([]);
  const [newTopic, setNewTopic] = useState('');
  const [duration, setDuration] = useState<number>(60);
  const [feedback, setFeedback] = useState('');
  const [nextSteps, setNextSteps] = useState('');
  const [resources, setResources] = useState<string[]>([]);
  const [newResource, setNewResource] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [viewMode, setViewMode] = useState<'add' | 'view'>(
    session.status === 'completed' ? 'view' : 'add'
  );

  // Load existing notes if any
  useEffect(() => {
    if (existingNotes.length > 0 && viewMode === 'view') {
      const latestNote = existingNotes[existingNotes.length - 1];
      setNoteContent(latestNote.content || '');
      setTopics(latestNote.topics || []);
      setDuration(latestNote.duration || 60);
      setFeedback(latestNote.feedback || '');
      setNextSteps(latestNote.nextSteps || '');
      setResources(latestNote.resources || []);
    }
  }, [existingNotes, viewMode]);

  const handleAddTopic = () => {
    if (newTopic.trim() && !topics.includes(newTopic.trim())) {
      setTopics([...topics, newTopic.trim()]);
      setNewTopic('');
    }
  };

  const handleRemoveTopic = (topicToRemove: string) => {
    setTopics(topics.filter(t => t !== topicToRemove));
  };

  const handleAddResource = () => {
    if (newResource.trim() && !resources.includes(newResource.trim())) {
      setResources([...resources, newResource.trim()]);
      setNewResource('');
    }
  };

  const handleRemoveResource = (resourceToRemove: string) => {
    setResources(resources.filter(r => r !== resourceToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const noteData = {
      content: noteContent,
      topics,
      duration,
      feedback,
      nextSteps,
      resources,
    };

    onSave(session.id, noteData);
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {viewMode === 'add' ? 'Add Session Notes' : 'Session Notes'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {session.studentName} • {session.studentProgram} - {session.studentTrack}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {/* Session Info Bar */}
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center space-x-4 text-sm">
            <span className="flex items-center text-gray-600">
              <Calendar size={16} className="mr-1" />
              {new Date(session.date).toLocaleDateString()}
            </span>
            <span className="flex items-center text-gray-600">
              <Clock size={16} className="mr-1" />
              {formatTime(session.startTime)} - {formatTime(session.endTime)}
            </span>
            <span className="flex items-center text-gray-600">
              <BookOpen size={16} className="mr-1" />
              {session.topic}
            </span>
            {session.status === 'completed' && (
              <span className="flex items-center text-green-600">
                <CheckCircle size={16} className="mr-1" />
                Completed
              </span>
            )}
          </div>
        </div>

        {/* Notes Form/View */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          {viewMode === 'add' ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Session Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Session Notes *
                </label>
                <textarea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="What was covered in this session? Key discussions, progress, etc."
                  required
                />
              </div>

              {/* Topics Covered */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Topics Covered
                </label>
                <div className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    value={newTopic}
                    onChange={(e) => setNewTopic(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTopic())}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Add a topic..."
                  />
                  <button
                    type="button"
                    onClick={handleAddTopic}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                  >
                    <Plus size={18} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {topics.map((topic) => (
                    <span
                      key={topic}
                      className="inline-flex items-center px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-sm"
                    >
                      {topic}
                      <button
                        type="button"
                        onClick={() => handleRemoveTopic(topic)}
                        className="ml-2 text-orange-500 hover:text-orange-700"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Session Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Actual Duration (minutes)
                </label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value))}
                  min="15"
                  max="180"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Feedback */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Feedback for Student
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Any feedback for the student? Strengths, areas to improve, etc."
                />
              </div>

              {/* Next Steps */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Next Steps / Action Items
                </label>
                <textarea
                  value={nextSteps}
                  onChange={(e) => setNextSteps(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="What should the student work on before the next session?"
                />
              </div>

              {/* Resources Shared */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resources Shared
                </label>
                <div className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    value={newResource}
                    onChange={(e) => setNewResource(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddResource())}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Add a resource link or name..."
                  />
                  <button
                    type="button"
                    onClick={handleAddResource}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                  >
                    <Plus size={18} />
                  </button>
                </div>
                <div className="space-y-2">
                  {resources.map((resource) => (
                    <div key={resource} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-700">{resource}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveResource(resource)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </form>
          ) : (
            // View Mode
            <div className="space-y-6">
              {existingNotes.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare size={48} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500">No notes available for this session</p>
                </div>
              ) : (
                existingNotes.map((note, index) => (
                  <div key={note.id || index} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-gray-500">
                        Added on {new Date(note.createdAt).toLocaleString()}
                      </span>
                      <button
                        onClick={() => setIsEditing(true)}
                        className="text-orange-600 hover:text-orange-700 text-sm"
                      >
                        Edit
                      </button>
                    </div>

                    {/* Note Content */}
                    <div className="space-y-4">
                      {note.content && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-1">Notes</h4>
                          <p className="text-sm text-gray-600">{note.content}</p>
                        </div>
                      )}

                      {note.topics && note.topics.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Topics Covered</h4>
                          <div className="flex flex-wrap gap-2">
                            {note.topics.map((topic: string) => (
                              <span key={topic} className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs">
                                {topic}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {note.duration && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-1">Duration</h4>
                          <p className="text-sm text-gray-600">{note.duration} minutes</p>
                        </div>
                      )}

                      {note.feedback && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-1">Feedback</h4>
                          <p className="text-sm text-gray-600">{note.feedback}</p>
                        </div>
                      )}

                      {note.nextSteps && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-1">Next Steps</h4>
                          <p className="text-sm text-gray-600">{note.nextSteps}</p>
                        </div>
                      )}

                      {note.resources && note.resources.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Resources Shared</h4>
                          <ul className="list-disc list-inside space-y-1">
                            {note.resources.map((resource: string) => (
                              <li key={resource} className="text-sm text-orange-600 hover:text-orange-700">
                                <a href={resource.startsWith('http') ? resource : '#'} target="_blank" rel="noopener noreferrer">
                                  {resource}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          {viewMode === 'add' ? (
            <>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
              >
                Save Notes & Mark Complete
              </button>
            </>
          ) : (
            <>
              {isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                  >
                    Update Notes
                  </button>
                </>
              ) : (
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                >
                  Close
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}