import React, { useState, useEffect } from 'react';
import { storageService } from '../../services/storageService';
import { Schedule, ExecutionRecord, WorkflowDefinition } from '../../types';
import { Clock, Save, Trash2, Plus, ChevronRight, Play, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

interface SchedulesTabProps {
  workflows: WorkflowDefinition[];
  onLoadData: () => void;
  onAddLog: (agent: string, message: string, type: 'info' | 'success' | 'warning' | 'error') => void;
}

export const SchedulesTab: React.FC<SchedulesTabProps> = ({ workflows, onLoadData, onAddLog }) => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [editingSchedule, setEditingSchedule] = useState<Partial<Schedule> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSchedules();
  }, []);

  const loadSchedules = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const loaded = await storageService.getSchedules();
      setSchedules(Array.isArray(loaded) ? loaded : []);
      onAddLog('System', `Loaded ${loaded.length} schedules`, 'success');
    } catch (err: any) {
      setError(err.message);
      onAddLog('System', `Failed to load schedules: ${err.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewSchedule = () => {
    setEditingSchedule({
      name: 'New Schedule',
      description: '',
      cronExpression: '0 6 * * *',
      timezone: 'UTC',
      isActive: true,
    });
    setSelectedSchedule(null);
  };

  const handleSaveSchedule = async () => {
    if (!editingSchedule) return;
    if (!editingSchedule.workflowId) {
      onAddLog('System', 'Please select a workflow', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const toSave = {
        ...editingSchedule,
        id: editingSchedule.id || `schedule-${Date.now()}`,
        createdAt: editingSchedule.createdAt || new Date().toISOString(),
      };
      const saved = await storageService.saveSchedule(toSave as any);
      setSchedules(prev => editingSchedule.id ? prev.map(s => s.id === saved.id ? saved : s) : [...prev, saved]);
      setSelectedSchedule(saved);
      setEditingSchedule(null);
      onAddLog('System', 'Schedule saved', 'success');
    } catch (err: any) {
      onAddLog('System', `Failed to save: ${err.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    if (!window.confirm('Delete this schedule?')) return;
    setIsLoading(true);
    try {
      await storageService.deleteSchedule(id);
      setSchedules(prev => prev.filter(s => s.id !== id));
      setSelectedSchedule(null);
      onAddLog('System', 'Schedule deleted', 'success');
    } catch (err: any) {
      onAddLog('System', `Failed to delete: ${err.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleActive = async (schedule: Schedule) => {
    setIsLoading(true);
    try {
      const updated = await storageService.saveSchedule({
        ...schedule,
        isActive: !schedule.isActive,
      });
      setSchedules(prev => prev.map(s => s.id === updated.id ? updated : s));
      setSelectedSchedule(updated);
      onAddLog('System', `Schedule ${updated.isActive ? 'enabled' : 'disabled'}`, 'success');
    } catch (err: any) {
      onAddLog('System', `Failed to update: ${err.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="md:col-span-12 h-full flex flex-col gap-4">
      {error && (
        <div className="bg-red-50 border-2 border-red-200 p-4 rounded flex items-start gap-3">
          <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-grow">
            <h3 className="font-black uppercase text-sm text-red-900">Error</h3>
            <p className="text-sm text-red-700">{error}</p>
            <button onClick={loadSchedules} className="mt-2 px-3 py-1 bg-red-600 text-white text-xs font-bold rounded">
              Retry
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1 min-h-0">
        {/* LEFT: Schedule List */}
        <div className="bg-white border-2 border-slate-900 p-4 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-black uppercase text-sm flex items-center gap-2">
              <Clock size={16} className="text-brand-600" /> Schedules
            </h3>
            <button
              onClick={handleNewSchedule}
              className="bg-slate-900 text-white px-3 py-2 hover:bg-brand-600 font-black uppercase text-xs flex items-center gap-1 border-2 border-slate-900"
            >
              <Plus size={18} /> New
            </button>
          </div>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {schedules.map(schedule => (
              <button
                key={schedule.id}
                onClick={() => setSelectedSchedule(schedule)}
                className={`w-full text-left p-3 border-2 transition-all ${
                  selectedSchedule?.id === schedule.id
                    ? 'border-brand-600 bg-brand-50'
                    : 'border-slate-100 hover:border-slate-300'
                }`}
              >
                <div className="font-bold text-xs truncate">{schedule.name}</div>
                <div className="text-[10px] text-slate-400 uppercase">{schedule.cronExpression}</div>
                <div className={`text-xs mt-1 ${schedule.isActive ? 'text-green-600' : 'text-slate-400'}`}>
                  {schedule.isActive ? '🟢 Active' : '⚪ Inactive'}
                </div>
              </button>
            ))}
            {schedules.length === 0 && (
              <div className="text-xs text-slate-400 italic text-center py-4">No schedules. Create one!</div>
            )}
          </div>
        </div>

        {/* CENTER: Editor */}
        <div className="bg-white border-2 border-slate-900 p-6 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
          {editingSchedule ? (
            <div className="space-y-4">
              <h3 className="font-black uppercase text-sm">New Schedule</h3>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Name</label>
                <input
                  value={editingSchedule.name || ''}
                  onChange={e => setEditingSchedule({ ...editingSchedule, name: e.target.value })}
                  className="w-full bg-slate-50 border-2 border-slate-200 p-2 text-sm font-bold focus:border-brand-600 outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Workflow</label>
                <select
                  value={editingSchedule.workflowId || ''}
                  onChange={e => setEditingSchedule({ ...editingSchedule, workflowId: e.target.value })}
                  className="w-full bg-slate-50 border-2 border-slate-200 p-2 text-sm font-bold focus:border-brand-600 outline-none"
                >
                  <option value="">-- Select --</option>
                  {workflows.map(w => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Cron</label>
                <input
                  value={editingSchedule.cronExpression || ''}
                  onChange={e => setEditingSchedule({ ...editingSchedule, cronExpression: e.target.value })}
                  placeholder="0 6 * * *"
                  className="w-full bg-slate-50 border-2 border-slate-200 p-2 text-xs font-mono focus:border-brand-600 outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Timezone</label>
                <select
                  value={editingSchedule.timezone || 'UTC'}
                  onChange={e => setEditingSchedule({ ...editingSchedule, timezone: e.target.value })}
                  className="w-full bg-slate-50 border-2 border-slate-200 p-2 text-xs focus:border-brand-600 outline-none"
                >
                  {['UTC', 'America/New_York', 'America/Chicago', 'America/Los_Angeles'].map(tz => (
                    <option key={tz} value={tz}>
                      {tz}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 pt-4 border-t border-slate-100">
                <button
                  onClick={handleSaveSchedule}
                  disabled={isLoading}
                  className="flex-grow bg-slate-900 text-white px-4 py-2 font-black uppercase text-xs hover:bg-brand-600 disabled:opacity-50"
                >
                  {isLoading ? <Loader2 size={14} className="animate-spin inline" /> : <Save size={14} className="inline" />} Save
                </button>
                <button
                  onClick={() => setEditingSchedule(null)}
                  className="flex-grow bg-slate-100 text-slate-900 px-4 py-2 font-black uppercase text-xs"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : selectedSchedule ? (
            <div className="space-y-4">
              <h3 className="font-black uppercase text-sm">{selectedSchedule.name}</h3>
              <div className="bg-slate-50 p-3 border border-slate-200 rounded text-xs">
                <div className="font-bold">Workflow:</div>
                <div>{workflows.find(w => w.id === selectedSchedule.workflowId)?.name}</div>
              </div>
              <div className="bg-slate-50 p-3 border border-slate-200 rounded text-xs">
                <div className="font-bold">Cron:</div>
                <div className="font-mono">{selectedSchedule.cronExpression}</div>
              </div>
              <div className="flex gap-2 pt-4 border-t border-slate-100">
                <button
                  onClick={() => setEditingSchedule(selectedSchedule)}
                  className="flex-grow bg-slate-900 text-white px-4 py-2 font-black uppercase text-xs hover:bg-brand-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleToggleActive(selectedSchedule)}
                  className={`flex-grow px-4 py-2 font-black uppercase text-xs ${
                    selectedSchedule.isActive
                      ? 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                      : 'bg-green-100 text-green-900 hover:bg-green-200'
                  }`}
                >
                  {selectedSchedule.isActive ? 'Disable' : 'Enable'}
                </button>
                <button
                  onClick={() => handleDeleteSchedule(selectedSchedule.id)}
                  className="px-4 py-2 bg-red-100 text-red-900 font-black uppercase text-xs hover:bg-red-200"
                >
                  <Trash2 size={14} className="inline" />
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <Clock size={32} className="mb-2" />
              <div className="text-xs uppercase font-black">Create or select a schedule</div>
            </div>
          )}
        </div>

        {/* RIGHT: Info */}
        <div className="bg-white border-2 border-slate-900 p-6 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
          <h3 className="font-black uppercase text-sm mb-4">Info</h3>
          <div className="text-xs space-y-3 text-slate-700">
            <div>
              <strong>Schedules:</strong> {schedules.length}
            </div>
            <div>
              <strong>Workflows:</strong> {workflows.length}
            </div>
            <div className="border-t border-slate-200 pt-3 mt-3">
              <strong>Cron Format:</strong>
              <div className="text-[10px] font-mono mt-1">minute hour day month dow</div>
            </div>
            <div className="bg-blue-50 border border-blue-200 p-2 rounded text-[10px]">
              Create schedules to automate workflows at specific times.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
