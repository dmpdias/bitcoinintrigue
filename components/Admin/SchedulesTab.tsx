import React, { useState, useEffect } from 'react';
import { storageService } from '../../services/storageService';
import { agentService } from '../../services/agentService';
import {
  Schedule,
  ExecutionRecord,
  WorkflowDefinition
} from '../../types';
import {
  Clock, Save, Trash2, Plus, ChevronRight, Play,
  AlertCircle, CheckCircle2, Loader2, Copy
} from 'lucide-react';

interface SchedulesTabProps {
  workflows: WorkflowDefinition[];
  onLoadData: () => void;
  onAddLog: (agent: string, message: string, type: 'info' | 'success' | 'warning' | 'error') => void;
}

export const SchedulesTab: React.FC<SchedulesTabProps> = ({ workflows, onLoadData, onAddLog }) => {
  // State
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [executionHistory, setExecutionHistory] = useState<ExecutionRecord[]>([]);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [editingSchedule, setEditingSchedule] = useState<Partial<Schedule> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedHistoryId, setExpandedHistoryId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Cron Presets
  const cronPresets = [
    { label: 'Every Hour', value: '0 * * * *' },
    { label: 'Daily 6 AM UTC', value: '0 6 * * *' },
    { label: 'Daily 9 AM UTC', value: '0 9 * * *' },
    { label: 'Mon-Fri 8 AM UTC', value: '0 8 * * 1-5' },
    { label: 'Every Monday 6 AM', value: '0 6 * * 1' },
    { label: 'Custom', value: '' },
  ];

  // Timezone presets
  const timezones = ['UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles', 'Europe/London', 'Europe/Paris', 'Asia/Tokyo'];

  useEffect(() => {
    loadSchedules();
  }, []);

  const loadSchedules = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('[SchedulesTab] Loading schedules...');
      const loaded = await storageService.getSchedules();
      console.log('[SchedulesTab] Loaded schedules:', loaded);
      console.log('[SchedulesTab] Schedule count:', loaded.length);

      if (!Array.isArray(loaded)) {
        throw new Error(`Expected array, got ${typeof loaded}`);
      }

      setSchedules(loaded);
      if (loaded.length > 0) {
        onAddLog('System', `Loaded ${loaded.length} schedules`, 'success');
      } else {
        onAddLog('System', 'No schedules found in database', 'info');
      }
    } catch (err: any) {
      console.error('[SchedulesTab] Error loading schedules:', err);
      const errorMsg = err.message || 'Unknown error';
      setError(errorMsg);
      onAddLog('System', `Failed to load schedules: ${errorMsg}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const loadExecutionHistory = async (scheduleId: string) => {
    setIsLoading(true);
    try {
      const history = await storageService.getExecutionHistory(scheduleId, 20);
      setExecutionHistory(history);
    } catch (err: any) {
      onAddLog('System', `Failed to load execution history: ${err.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSchedule = async (schedule: Schedule) => {
    setSelectedSchedule(schedule);
    setEditingSchedule(null);
    await loadExecutionHistory(schedule.id);
  };

  const handleNewSchedule = () => {
    const newSchedule: Partial<Schedule> = {
      name: 'New Schedule',
      description: '',
      cronExpression: '0 6 * * *', // Default: daily 6 AM
      timezone: 'UTC',
      isActive: true,
    };
    setEditingSchedule(newSchedule);
    setSelectedSchedule(null);
  };

  const handleSaveSchedule = async () => {
    if (!editingSchedule) return;
    if (!editingSchedule.workflowId) {
      onAddLog('System', 'Please select a workflow', 'error');
      return;
    }
    if (!editingSchedule.name) {
      onAddLog('System', 'Schedule name is required', 'error');
      return;
    }

    setIsLoading(true);
    try {
      // Prepare schedule for saving - add ID and timestamps if new
      const scheduleToSave = {
        ...editingSchedule,
        id: editingSchedule.id || `schedule-${Date.now()}`,
        createdAt: editingSchedule.createdAt || new Date().toISOString()
      };

      const saved = await storageService.saveSchedule(scheduleToSave as any);
      setSchedules(prev =>
        editingSchedule.id
          ? prev.map(s => s.id === editingSchedule.id ? saved : s)
          : [...prev, saved]
      );
      setSelectedSchedule(saved);
      setEditingSchedule(null);
      onAddLog('System', `Schedule "${saved.name}" saved successfully`, 'success');
    } catch (err: any) {
      onAddLog('System', `Failed to save schedule: ${err.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this schedule?')) return;

    setIsLoading(true);
    try {
      await storageService.deleteSchedule(id);
      setSchedules(prev => prev.filter(s => s.id !== id));
      setSelectedSchedule(null);
      setEditingSchedule(null);
      onAddLog('System', 'Schedule deleted', 'success');
    } catch (err: any) {
      onAddLog('System', `Failed to delete schedule: ${err.message}`, 'error');
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
      onAddLog('System', `Failed to update schedule: ${err.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunNow = async (scheduleId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/cron/run-schedule?scheduleId=${scheduleId}`, { method: 'GET' });
      const result = await response.json();
      onAddLog('System', `Schedule executed: ${result.processed} processed, ${result.succeeded} succeeded`, result.succeeded > 0 ? 'success' : 'warning');
      await loadSchedules();
      if (selectedSchedule) await loadExecutionHistory(selectedSchedule.id);
    } catch (err: any) {
      onAddLog('System', `Failed to execute schedule: ${err.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border-2 border-red-200 p-4 rounded">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-grow">
              <h3 className="font-black uppercase text-sm text-red-900">Error Loading Schedules</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              <button
                onClick={loadSchedules}
                className="mt-2 px-3 py-1 bg-red-600 text-white text-xs font-bold rounded hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Debug Info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-blue-50 border border-blue-200 p-2 rounded text-[10px] font-mono text-blue-700">
          <div>Schedules Count: {schedules.length}</div>
          <div>Is Loading: {isLoading ? 'true' : 'false'}</div>
          <div>Workflows Available: {workflows.length}</div>
        </div>
      )}

    <div className="grid md:grid-cols-12 gap-6 h-[600px]">
      {/* Left: Schedule List */}
      <div className="md:col-span-3 bg-white border-2 border-slate-900 p-4 flex flex-col h-full shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-black uppercase text-sm flex items-center gap-2">
            <Clock size={16} className="text-brand-600" /> Schedules
          </h3>
          <button
            onClick={handleNewSchedule}
            className="bg-slate-900 text-white px-3 py-2 hover:bg-brand-600 font-black uppercase text-xs flex items-center gap-1 border-2 border-slate-900"
            title="Create new schedule"
          >
            <Plus size={18} />
            New
          </button>
        </div>
        <div className="overflow-y-auto flex-grow space-y-2 pr-2 custom-scrollbar">
          {schedules.map(schedule => (
            <button
              key={schedule.id}
              onClick={() => handleSelectSchedule(schedule)}
              className={`w-full text-left p-3 border-2 transition-all flex justify-between items-start group ${
                selectedSchedule?.id === schedule.id
                  ? 'border-brand-600 bg-brand-50'
                  : 'border-slate-100 hover:border-slate-300'
              }`}
            >
              <div className="flex-grow min-w-0">
                <div className="font-bold text-xs truncate">{schedule.name}</div>
                <div className="text-[10px] text-slate-400 uppercase">{schedule.cronExpression}</div>
              </div>
              <div className={`flex-shrink-0 ml-2 w-2 h-2 rounded-full ${schedule.isActive ? 'bg-green-500' : 'bg-slate-300'}`} />
            </button>
          ))}
          {schedules.length === 0 && (
            <div className="text-xs text-slate-400 italic text-center py-4">No schedules yet</div>
          )}
        </div>
      </div>

      {/* Center: Schedule Editor */}
      <div className="md:col-span-5 bg-white border-2 border-slate-900 p-6 flex flex-col h-full shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
        {editingSchedule ? (
          <div className="flex flex-col h-full space-y-4">
            <h3 className="font-black uppercase text-sm flex items-center gap-2">
              <Clock size={16} className="text-brand-600" /> {editingSchedule.id ? 'Edit Schedule' : 'New Schedule'}
            </h3>

            {/* Name */}
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Name</label>
              <input
                value={editingSchedule.name || ''}
                onChange={e => setEditingSchedule({ ...editingSchedule, name: e.target.value })}
                className="w-full bg-slate-50 border-2 border-slate-200 p-2 text-sm font-bold focus:border-brand-600 outline-none"
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Description</label>
              <input
                value={editingSchedule.description || ''}
                onChange={e => setEditingSchedule({ ...editingSchedule, description: e.target.value })}
                className="w-full bg-slate-50 border-2 border-slate-200 p-2 text-xs focus:border-brand-600 outline-none"
              />
            </div>

            {/* Workflow Selection */}
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Workflow</label>
              <select
                value={editingSchedule.workflowId || ''}
                onChange={e => setEditingSchedule({ ...editingSchedule, workflowId: e.target.value })}
                className="w-full bg-slate-50 border-2 border-slate-200 p-2 text-sm font-bold focus:border-brand-600 outline-none"
              >
                <option value="">-- Select Workflow --</option>
                {workflows.map(wf => (
                  <option key={wf.id} value={wf.id}>{wf.name}</option>
                ))}
              </select>
            </div>

            {/* Cron Expression */}
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Cron Expression</label>
              <select
                value={editingSchedule.cronExpression || ''}
                onChange={e => {
                  if (e.target.value) {
                    setEditingSchedule({ ...editingSchedule, cronExpression: e.target.value });
                  }
                }}
                className="w-full bg-slate-50 border-2 border-slate-200 p-2 text-xs font-mono focus:border-brand-600 outline-none mb-2"
              >
                <option value="">-- Select Preset --</option>
                {cronPresets.map(preset => (
                  <option key={preset.value} value={preset.value}>{preset.label}</option>
                ))}
              </select>
              <input
                value={editingSchedule.cronExpression || ''}
                onChange={e => setEditingSchedule({ ...editingSchedule, cronExpression: e.target.value })}
                placeholder="0 6 * * *"
                className="w-full bg-slate-50 border-2 border-slate-200 p-2 text-xs font-mono focus:border-brand-600 outline-none"
              />
              <p className="text-[10px] text-slate-400 mt-1">Format: minute hour day month dayOfWeek (0=Sunday)</p>
            </div>

            {/* Timezone */}
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Timezone</label>
              <select
                value={editingSchedule.timezone || 'UTC'}
                onChange={e => setEditingSchedule({ ...editingSchedule, timezone: e.target.value })}
                className="w-full bg-slate-50 border-2 border-slate-200 p-2 text-xs focus:border-brand-600 outline-none"
              >
                {timezones.map(tz => (
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </select>
            </div>

            <div className="flex-grow" />

            {/* Save Button */}
            <div className="flex gap-2 pt-4 border-t border-slate-100">
              <button
                onClick={handleSaveSchedule}
                disabled={isLoading}
                className="flex-grow bg-slate-900 text-white px-4 py-2 font-black uppercase text-xs flex items-center justify-center gap-2 hover:bg-brand-600 disabled:opacity-50"
              >
                {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                Save Schedule
              </button>
              <button
                onClick={() => setEditingSchedule(null)}
                className="px-4 py-2 bg-slate-100 text-slate-900 font-black uppercase text-xs hover:bg-slate-200"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : selectedSchedule ? (
          <div className="flex flex-col h-full space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-black uppercase text-sm">{selectedSchedule.name}</h3>
                <p className="text-xs text-slate-500">{selectedSchedule.description}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingSchedule(selectedSchedule)}
                  className="px-3 py-1 bg-slate-50 border border-slate-200 text-xs font-bold hover:bg-slate-100"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteSchedule(selectedSchedule.id)}
                  className="p-1 text-slate-400 hover:text-red-600"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-50 p-3 border border-slate-200">
                <div className="text-[10px] font-black uppercase text-slate-400">Workflow</div>
                <div className="font-bold">{workflows.find(w => w.id === selectedSchedule.workflowId)?.name || 'Unknown'}</div>
              </div>
              <div className="bg-slate-50 p-3 border border-slate-200">
                <div className="text-[10px] font-black uppercase text-slate-400">Cron</div>
                <div className="font-mono text-[11px]">{selectedSchedule.cronExpression}</div>
              </div>
              <div className="bg-slate-50 p-3 border border-slate-200">
                <div className="text-[10px] font-black uppercase text-slate-400">Timezone</div>
                <div className="font-bold">{selectedSchedule.timezone}</div>
              </div>
              <div className="bg-slate-50 p-3 border border-slate-200">
                <div className="text-[10px] font-black uppercase text-slate-400">Status</div>
                <div className={`font-bold ${selectedSchedule.isActive ? 'text-green-600' : 'text-slate-400'}`}>
                  {selectedSchedule.isActive ? '🟢 Active' : '⚪ Inactive'}
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
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
                onClick={() => handleRunNow(selectedSchedule.id)}
                disabled={isLoading}
                className="flex-grow bg-brand-600 text-white px-4 py-2 font-black uppercase text-xs hover:bg-brand-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Play size={14} />}
                Run Now
              </button>
            </div>

            <div className="flex-grow" />
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-300">
            <Clock size={48} className="mb-4" />
            <div className="font-black uppercase text-sm">Select or Create a Schedule</div>
          </div>
        )}
      </div>

      {/* Right: Execution History */}
      <div className="md:col-span-4 bg-white border-2 border-slate-900 p-6 flex flex-col h-full shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
        <h3 className="font-black uppercase text-sm mb-4">Execution History</h3>
        <div className="overflow-y-auto flex-grow space-y-2 pr-2 custom-scrollbar">
          {executionHistory.length > 0 ? (
            executionHistory.map(exec => (
              <div key={exec.id} className="border-2 border-slate-200 p-3 hover:border-slate-300 cursor-pointer transition-all">
                <button
                  onClick={() => setExpandedHistoryId(expandedHistoryId === exec.id ? null : exec.id)}
                  className="w-full text-left flex items-start justify-between gap-2"
                >
                  <div className="flex-grow">
                    <div className={`text-xs font-black flex items-center gap-2 ${
                      exec.status === 'completed' ? 'text-green-600' :
                      exec.status === 'failed' ? 'text-red-600' :
                      exec.status === 'in_progress' ? 'text-blue-600' :
                      'text-slate-400'
                    }`}>
                      {exec.status === 'completed' && <CheckCircle2 size={12} />}
                      {exec.status === 'failed' && <AlertCircle size={12} />}
                      {exec.status === 'in_progress' && <Loader2 size={12} className="animate-spin" />}
                      {exec.status.toUpperCase()}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">
                      {exec.startedAt ? new Date(exec.startedAt).toLocaleString() : 'Pending'}
                    </div>
                    {exec.issueId && (
                      <div className="text-[10px] text-brand-600 font-bold mt-1">Issue: {exec.issueId.substring(0, 8)}</div>
                    )}
                  </div>
                  <ChevronRight size={14} className={`text-slate-300 transition-transform ${expandedHistoryId === exec.id ? 'rotate-90' : ''}`} />
                </button>

                {/* Expanded Details */}
                {expandedHistoryId === exec.id && (
                  <div className="mt-3 pt-3 border-t border-slate-200 space-y-2 text-xs">
                    {exec.errorMessage && (
                      <div className="p-2 bg-red-50 border border-red-200 text-red-700 rounded text-[10px] font-mono">
                        {exec.errorMessage}
                      </div>
                    )}
                    {exec.executionLogs && exec.executionLogs.length > 0 && (
                      <div>
                        <div className="font-black uppercase text-[10px] text-slate-400 mb-1">Logs</div>
                        <div className="space-y-1 text-[9px] font-mono text-slate-600">
                          {(exec.executionLogs as any[]).map((log, i) => (
                            <div key={i} className="border-l border-slate-200 pl-2">
                              <span className="text-slate-400">{log.agent}:</span> {log.status}
                              {log.error && <span className="text-red-600"> - {log.error}</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          ) : selectedSchedule ? (
            <div className="text-xs text-slate-400 italic text-center py-8">No execution history yet</div>
          ) : (
            <div className="text-xs text-slate-400 italic text-center py-8">Select a schedule to view history</div>
          )}
        </div>
      </div>
    </div>
    </div>
  );
};
