
import React, { useState, useEffect } from 'react';
import { storageService } from '../../services/storageService';
import { agentService } from '../../services/agentService';
import { ProductionChecklist } from './ProductionChecklist';
import { SchedulesTab } from './SchedulesTab';
import { AuthorTab } from './AuthorTab';
import {
  BriefingData,
  AgentLog,
  AgentDefinition,
  WorkflowDefinition,
  Subscriber,
  AnalyticsData,
  DistributionEvent,
  Story
} from '../../types';
import {
  Settings, Play, Trash2, Terminal, Layers, Bot, Code, Users, BarChart3,
  Share2, Mail, Twitter, UserPlus, ToggleRight, ToggleLeft, ArrowRight,
  CheckCircle2, Cloud, Loader2, RefreshCw, Database, AlertCircle, Plus,
  Save, ArrowUp, ArrowDown, ChevronRight, Eye, Clock, Image as ImageIcon,
  Edit3, X, Calendar, User
} from 'lucide-react';

export const BackOffice: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pipeline' | 'agents' | 'workflows' | 'schedules' | 'author' | 'audience' | 'analytics' | 'distribution' | 'system'>('pipeline');
  
  // Data State
  const [issues, setIssues] = useState<BriefingData[]>([]);
  const [agents, setAgents] = useState<AgentDefinition[]>([]);
  const [workflows, setWorkflows] = useState<WorkflowDefinition[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  
  // Selection State
  const [selectedIssue, setSelectedIssue] = useState<BriefingData | null>(null);
  const [editingStoryIndex, setEditingStoryIndex] = useState<number>(0);
  const [editingAgent, setEditingAgent] = useState<AgentDefinition | null>(null);
  const [editingWorkflow, setEditingWorkflow] = useState<WorkflowDefinition | null>(null);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>('');

  // Delete Confirmation State
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'agent' | 'workflow' | 'issue', id: string, name?: string } | null>(null);

  // System State
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newSubEmail, setNewSubEmail] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
        const [fetchedIssues, fetchedAgents, fetchedWorkflows, fetchedSubs, fetchedAnalytics] = await Promise.all([
            storageService.getAllIssues(),
            storageService.getAgents(),
            storageService.getWorkflows(),
            storageService.getSubscribers(),
            storageService.getAnalytics()
        ]);

        setIssues(fetchedIssues);
        setAgents(fetchedAgents);
        setWorkflows(fetchedWorkflows);
        
        // Set default selected workflow
        if (fetchedWorkflows.length > 0 && !selectedWorkflowId) {
            const active = fetchedWorkflows.find(w => w.isActive) || fetchedWorkflows[0];
            if (active) setSelectedWorkflowId(active.id);
        }

        setSubscribers(fetchedSubs);
        setAnalytics(fetchedAnalytics);
    } catch (e) {
        addLog('System', 'Failed to load data from Supabase', 'error');
    } finally {
        if (!silent) setIsLoading(false);
    }
  };

  const addLog = (agent: string, message: string, type: AgentLog['type'] = 'info') => {
    setLogs(prev => [{ agent, message, type, timestamp: new Date().toLocaleTimeString() }, ...prev].slice(0, 50));
  };

  // --- DELETE CONFIRMATION HANDLER ---
  const confirmDelete = async () => {
      if (!deleteTarget) return;

      const { type, id, name } = deleteTarget;
      setDeleteTarget(null); // Close modal
      setIsLoading(true);

      console.log(`[BackOffice] Deleting ${type}: ${id}`);

      try {
          if (type === 'agent') {
               // Optimistic Update
               const prev = [...agents];
               setAgents(a => a.filter(i => i.id !== id));
               if(editingAgent?.id === id) setEditingAgent(null);
               
               try {
                   await storageService.deleteAgent(id);
                   addLog('System', `Agent ${name || id} deleted.`, 'success');
               } catch (e: any) {
                   setAgents(prev); // Revert
                   throw e;
               }
          } 
          else if (type === 'workflow') {
               const prev = [...workflows];
               setWorkflows(w => w.filter(i => i.id !== id));
               if(editingWorkflow?.id === id) setEditingWorkflow(null);

               try {
                   await storageService.deleteWorkflow(id);
                   addLog('System', `Workflow ${name || id} deleted.`, 'success');
               } catch (e: any) {
                   setWorkflows(prev);
                   throw e;
               }
          } 
          else if (type === 'issue') {
               const prev = [...issues];
               setIssues(i => i.filter(x => x.id !== id));
               if(selectedIssue?.id === id) setSelectedIssue(null);

               try {
                   await storageService.deleteIssue(id);
                   addLog('System', `Issue deleted.`, 'success');
               } catch (e: any) {
                   setIssues(prev);
                   throw e;
               }
          }
      } catch (e: any) {
          console.error(`[BackOffice] Delete Error:`, e);
          addLog('System', `Delete failed: ${e.message}`, 'error');
          alert(`Failed to delete. Check console for RLS errors.`);
      } finally {
          setIsLoading(false);
      }
  };

  // --- WORKFLOW RUNNER ---
  const runWorkflow = async () => {
    const workflow = workflows.find(w => w.id === selectedWorkflowId);
    if (!workflow) {
        addLog('System', 'No workflow selected.', 'error');
        return;
    }

    setIsRunning(true);
    addLog('System', `Starting Workflow: ${workflow.name}`, 'info');
    
    let context = ""; 
    let currentDraft: BriefingData | null = null;

    try {
      for (const agentId of workflow.steps) {
        const agent = agents.find(a => a.id === agentId);
        if (!agent || !agent.isActive) continue;

        addLog(agent.name, `Executing ${agent.role}...`, 'info');
        
        // Pass the context (previous step output) to the agent
        const response = await agentService.runStep(agent, context);
        
        // Logic to handle Data Piping based on Role
        if (agent.role === 'researcher' || agent.role === 'planner') {
            context = response; // Text flow
            addLog(agent.name, `Output generated (${response.length} chars).`, 'success');
        } 
        else if (agent.role === 'writer') {
            context = response; 
            currentDraft = parseBriefingJSON(response);
            if (currentDraft) addLog(agent.name, `Draft written (${currentDraft.stories.length} stories).`, 'success');
            else addLog(agent.name, 'Failed to parse JSON output.', 'warning');
        } 
        else if (agent.role === 'reviewer') {
            context = response;
            const reviewed = parseBriefingJSON(response);
            if (reviewed) {
                currentDraft = reviewed;
                addLog(agent.name, 'Review complete.', 'success');
            }
        } 
        else if (agent.role === 'seo') {
            context = response;
            const finalized = parseBriefingJSON(response);
            if (finalized) {
                currentDraft = finalized;
                addLog(agent.name, 'SEO Metadata added.', 'success');
            }
        }
        else if (agent.role === 'image') {
            context = response;
            const withImages = parseBriefingJSON(response);
            if (withImages) {
                currentDraft = withImages;
                addLog(agent.name, 'Images generated and embedded.', 'success');
            } else {
                addLog(agent.name, 'Image generation completed.', 'success');
            }
        }
      }

      // Final Save
      if (currentDraft) {
          const finalIssue: BriefingData = {
              ...currentDraft,
              id: `issue-${Date.now()}`,
              status: 'review', // Sets to Draft/Review mode
              date: new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
              issueNumber: (issues.length > 0 ? (issues[0].issueNumber || 100) + 1 : 1),
              lastUpdated: new Date().toISOString()
          };
          
          await storageService.saveIssue(finalIssue);
          addLog('System', 'Draft saved to database.', 'success');
          
          await loadData();
          setSelectedIssue(finalIssue);
          setEditingStoryIndex(0);
          setActiveTab('pipeline');
      } else {
          addLog('System', 'Workflow finished but no valid JSON draft was generated.', 'warning');
      }

    } catch (error: any) {
      addLog('System', 'Workflow failed: ' + error.message, 'error');
      console.error(error);
    } finally {
      setIsRunning(false);
    }
  };

  const parseBriefingJSON = (text: string): BriefingData | null => {
      try {
          return JSON.parse(text);
      } catch (e) {
          try {
             const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\{[\s\S]*\}/);
             if (jsonMatch) {
                 const cleanStr = jsonMatch[1] || jsonMatch[0];
                 return JSON.parse(cleanStr);
             }
          } catch (e2) {
             return null;
          }
          return null;
      }
  };

  // --- RENDER HELPERS ---
  const handleSaveAgent = async (agent: AgentDefinition) => {
      try {
          await storageService.saveAgent(agent);
          addLog('System', `Agent "${agent.name}" saved.`, 'success');
          loadData(true);
      } catch (e: any) {
          alert(e.message);
      }
  };

  const handleSaveWorkflow = async (workflow: WorkflowDefinition) => {
      try {
          await storageService.saveWorkflow(workflow);
          addLog('System', `Workflow "${workflow.name}" saved.`, 'success');
          loadData(true);
      } catch (e: any) {
          alert(e.message);
      }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-10 pb-20 font-sans text-slate-900">
      
      {/* DELETE MODAL */}
      {deleteTarget && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
              <div className="bg-white border-2 border-slate-900 shadow-2xl p-6 max-w-sm w-full animate-fade-in">
                  <div className="flex items-center gap-3 text-red-600 mb-4">
                      <AlertCircle size={32} />
                      <h3 className="font-black uppercase text-lg">Confirm Delete</h3>
                  </div>
                  <p className="font-serif text-slate-600 mb-6">
                      Are you sure you want to delete the <strong>{deleteTarget.type}</strong> "{deleteTarget.name || deleteTarget.id}"? This action cannot be undone.
                  </p>
                  <div className="flex gap-3 justify-end">
                      <button 
                        onClick={() => setDeleteTarget(null)}
                        className="px-4 py-2 font-bold uppercase text-xs text-slate-500 hover:text-slate-900"
                      >
                          Cancel
                      </button>
                      <button 
                        onClick={confirmDelete}
                        className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 font-black uppercase text-xs shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] active:shadow-none active:translate-x-[1px] active:translate-y-[1px]"
                      >
                          Yes, Delete
                      </button>
                  </div>
              </div>
          </div>
      )}

      <div className="max-w-[1400px] mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tight flex items-center gap-3">
              <Settings className="text-brand-600" /> Command Center
            </h1>
            <div className="flex flex-wrap gap-2 mt-4">
              {[
                { id: 'pipeline', label: 'Pipeline', icon: Layers },
                { id: 'agents', label: 'Agents', icon: Bot },
                { id: 'workflows', label: 'Workflows', icon: Code },
                { id: 'schedules', label: 'Schedules', icon: Calendar },
                { id: 'author', label: 'Author', icon: User },
                { id: 'distribution', label: 'Distro', icon: Share2 },
                { id: 'audience', label: 'Audience', icon: Users },
                { id: 'analytics', label: 'Stats', icon: BarChart3 },
                { id: 'system', label: 'System', icon: Cloud }
              ].map(tab => (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-3 py-2 font-black uppercase text-[9px] tracking-widest border-2 transition-all shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] ${
                    activeTab === tab.id ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <tab.icon size={12} /> {tab.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
             <button onClick={() => loadData(false)} disabled={isLoading} className="hidden lg:flex items-center gap-2 bg-white border-2 border-slate-200 px-4 py-2 rounded-sm hover:border-brand-600">
                <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
             </button>
             
             {/* RESTORED: Run Pipeline Controls */}
             {activeTab === 'pipeline' && (
                <div className="flex items-center gap-2">
                    <select 
                        value={selectedWorkflowId} 
                        onChange={(e) => setSelectedWorkflowId(e.target.value)}
                        className="h-12 border-2 border-slate-900 px-3 bg-white font-bold text-xs uppercase focus:outline-none focus:border-brand-600"
                    >
                        <option value="" disabled>Select Workflow</option>
                        {workflows.map(w => (
                            <option key={w.id} value={w.id}>{w.name}</option>
                        ))}
                    </select>
                    <button 
                        onClick={runWorkflow}
                        disabled={isRunning || !selectedWorkflowId}
                        className="h-12 bg-brand-600 hover:bg-brand-700 text-white font-black uppercase px-6 border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] flex items-center gap-2 transition-all active:shadow-none active:translate-x-[2px] active:translate-y-[2px] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isRunning ? <Loader2 className="animate-spin" /> : <Play size={20} />}
                        Run Workflow
                    </button>
                </div>
             )}
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-8">
            
            {activeTab === 'agents' && (
                <div className="grid md:grid-cols-12 gap-6 h-[600px]">
                    <div className="md:col-span-4 bg-white border-2 border-slate-900 p-4 flex flex-col h-full shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
                         <div className="flex justify-between items-center mb-4">
                             <h3 className="font-black uppercase text-sm">Agents</h3>
                             <button 
                                onClick={() => setEditingAgent({ id: `agent-${Date.now()}`, name: 'New Agent', role: 'researcher', instructions: '', isActive: true, model: 'gemini-3-flash-preview' })}
                                className="bg-slate-900 text-white p-1 hover:bg-brand-600"
                             >
                                 <Plus size={16} />
                             </button>
                         </div>
                         <div className="overflow-y-auto flex-grow space-y-2 pr-2 custom-scrollbar">
                             {agents.map(agent => (
                                 <button
                                    key={agent.id}
                                    onClick={() => setEditingAgent(agent)}
                                    className={`w-full text-left p-3 border-2 transition-all flex justify-between items-center group ${editingAgent?.id === agent.id ? 'border-brand-600 bg-brand-50' : 'border-slate-100 hover:border-slate-300'}`}
                                 >
                                     <div>
                                         <div className="font-bold text-xs">{agent.name}</div>
                                         <div className="text-[10px] text-slate-400 uppercase">{agent.role}</div>
                                     </div>
                                     <ChevronRight size={14} className={`text-slate-300 ${editingAgent?.id === agent.id ? 'text-brand-600' : ''}`} />
                                 </button>
                             ))}
                         </div>
                    </div>

                    <div className="md:col-span-8 bg-white border-2 border-slate-900 p-6 flex flex-col h-full shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
                         {editingAgent ? (
                             <div className="flex flex-col h-full space-y-4">
                                 <div className="flex justify-between items-start">
                                     <h3 className="font-black uppercase text-sm flex items-center gap-2">
                                        <Bot size={16} className="text-brand-600"/> Edit Agent
                                     </h3>
                                     <button 
                                        type="button"
                                        onClick={() => setDeleteTarget({ type: 'agent', id: editingAgent.id, name: editingAgent.name })}
                                        className="p-2 text-slate-400 hover:text-red-600 border border-transparent hover:border-red-100 rounded"
                                        title="Delete Agent"
                                     >
                                        <Trash2 size={18} />
                                     </button>
                                 </div>
                                 
                                 {/* Form Fields (Name, Role, Model, Instructions) */}
                                 <div className="grid grid-cols-2 gap-4">
                                     <div>
                                         <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Name</label>
                                         <input value={editingAgent.name} onChange={e => setEditingAgent({...editingAgent, name: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-200 p-2 text-sm font-bold focus:border-brand-600 outline-none" />
                                     </div>
                                     <div>
                                         <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Role</label>
                                         <select value={editingAgent.role} onChange={e => setEditingAgent({...editingAgent, role: e.target.value as any})} className="w-full bg-slate-50 border-2 border-slate-200 p-2 text-sm font-bold focus:border-brand-600 outline-none">
                                             <option value="researcher">Researcher</option>
                                             <option value="planner">Planner</option>
                                             <option value="writer">Writer</option>
                                             <option value="reviewer">Reviewer</option>
                                             <option value="seo">SEO Agent</option>
                                         </select>
                                     </div>
                                 </div>
                                 <div>
                                     <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Model</label>
                                     <input value={editingAgent.model} onChange={e => setEditingAgent({...editingAgent, model: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-200 p-2 text-xs font-mono focus:border-brand-600 outline-none" />
                                 </div>
                                 <div className="flex-grow flex flex-col">
                                     <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Instructions</label>
                                     <textarea value={editingAgent.instructions} onChange={e => setEditingAgent({...editingAgent, instructions: e.target.value})} className="w-full flex-grow bg-slate-50 border-2 border-slate-200 p-3 text-xs font-mono focus:border-brand-600 outline-none resize-none" />
                                 </div>

                                 <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                                     <label className="flex items-center gap-2 cursor-pointer select-none">
                                         <div className={`w-10 h-6 rounded-full p-1 transition-colors ${editingAgent.isActive ? 'bg-green-500' : 'bg-slate-300'}`} onClick={() => setEditingAgent({...editingAgent, isActive: !editingAgent.isActive})}>
                                             <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${editingAgent.isActive ? 'translate-x-4' : ''}`}></div>
                                         </div>
                                         <span className="text-xs font-bold uppercase text-slate-500">Active</span>
                                     </label>
                                     <button onClick={() => handleSaveAgent(editingAgent)} className="bg-slate-900 text-white px-6 py-2 font-black uppercase text-xs flex items-center gap-2 hover:bg-brand-600">
                                         <Save size={14} /> Save Changes
                                     </button>
                                 </div>
                             </div>
                         ) : (
                             <div className="h-full flex flex-col items-center justify-center text-slate-300">
                                 <Bot size={48} className="mb-4" />
                                 <div className="font-black uppercase text-sm">Select an Agent</div>
                             </div>
                         )}
                    </div>
                </div>
            )}
            
            {activeTab === 'workflows' && (
                <div className="grid md:grid-cols-12 gap-6 h-[600px]">
                    <div className="md:col-span-4 bg-white border-2 border-slate-900 p-4 flex flex-col h-full shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
                         <div className="flex justify-between items-center mb-4">
                             <h3 className="font-black uppercase text-sm">Workflows</h3>
                             <button onClick={() => setEditingWorkflow({ id: `wf-${Date.now()}`, name: 'New Workflow', description: '...', steps: [], isActive: true })} className="bg-slate-900 text-white p-1 hover:bg-brand-600">
                                 <Plus size={16} />
                             </button>
                         </div>
                         <div className="overflow-y-auto flex-grow space-y-2 pr-2 custom-scrollbar">
                             {workflows.map(wf => (
                                 <button key={wf.id} onClick={() => setEditingWorkflow(wf)} className={`w-full text-left p-3 border-2 transition-all flex justify-between items-center group ${editingWorkflow?.id === wf.id ? 'border-brand-600 bg-brand-50' : 'border-slate-100 hover:border-slate-300'}`}>
                                     <div>
                                         <div className="font-bold text-xs">{wf.name}</div>
                                         <div className="text-[10px] text-slate-400 uppercase">{wf.steps.length} Steps</div>
                                     </div>
                                     <ChevronRight size={14} className={`text-slate-300 ${editingWorkflow?.id === wf.id ? 'text-brand-600' : ''}`} />
                                 </button>
                             ))}
                         </div>
                    </div>

                    <div className="md:col-span-8 bg-white border-2 border-slate-900 p-6 flex flex-col h-full shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
                         {editingWorkflow ? (
                             <div className="flex flex-col h-full space-y-4">
                                 <div className="flex justify-between items-start">
                                     <h3 className="font-black uppercase text-sm flex items-center gap-2">
                                        <Code size={16} className="text-brand-600"/> Pipeline Editor
                                     </h3>
                                     <button 
                                        type="button"
                                        onClick={() => setDeleteTarget({ type: 'workflow', id: editingWorkflow.id, name: editingWorkflow.name })} 
                                        className="p-2 text-slate-400 hover:text-red-600 border border-transparent hover:border-red-100 rounded"
                                     >
                                        <Trash2 size={18} />
                                     </button>
                                 </div>
                                 
                                 {/* Workflow Form Fields (Name, Desc) */}
                                 <div>
                                     <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Name</label>
                                     <input value={editingWorkflow.name} onChange={e => setEditingWorkflow({...editingWorkflow, name: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-200 p-2 text-sm font-bold focus:border-brand-600 outline-none" />
                                 </div>
                                 <div>
                                     <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Description</label>
                                     <input value={editingWorkflow.description} onChange={e => setEditingWorkflow({...editingWorkflow, description: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-200 p-2 text-xs text-slate-600 focus:border-brand-600 outline-none" />
                                 </div>

                                 {/* Steps Editor */}
                                 <div className="flex-grow flex flex-col border-2 border-slate-100 bg-slate-50 p-4 overflow-hidden">
                                     <label className="text-[10px] font-black uppercase text-slate-400 mb-3 block">Sequence</label>
                                     <div className="flex-grow overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                         {editingWorkflow.steps.map((agentId, index) => {
                                             const agent = agents.find(a => a.id === agentId);
                                             return (
                                                 <div key={index} className="flex items-center gap-2 bg-white border border-slate-200 p-2 shadow-sm">
                                                     <div className="bg-slate-900 text-white w-5 h-5 flex items-center justify-center text-[10px] font-bold rounded-full shrink-0">{index + 1}</div>
                                                     <div className="flex-grow min-w-0">
                                                         <div className="text-xs font-bold truncate">{agent ? agent.name : <span className="text-red-500">Unknown ({agentId})</span>}</div>
                                                     </div>
                                                     <div className="flex gap-1">
                                                         <button onClick={() => {const newSteps = [...editingWorkflow.steps]; [newSteps[index - 1], newSteps[index]] = [newSteps[index], newSteps[index - 1]]; setEditingWorkflow({...editingWorkflow, steps: newSteps});}} disabled={index === 0} className="p-1 text-slate-300 hover:text-slate-900"><ArrowUp size={14}/></button>
                                                         <button onClick={() => {const newSteps = [...editingWorkflow.steps]; [newSteps[index + 1], newSteps[index]] = [newSteps[index], newSteps[index + 1]]; setEditingWorkflow({...editingWorkflow, steps: newSteps});}} disabled={index === editingWorkflow.steps.length - 1} className="p-1 text-slate-300 hover:text-slate-900"><ArrowDown size={14}/></button>
                                                         <button onClick={() => {const newSteps = editingWorkflow.steps.filter((_, i) => i !== index); setEditingWorkflow({...editingWorkflow, steps: newSteps});}} className="p-1 text-slate-300 hover:text-red-500"><Trash2 size={14}/></button>
                                                     </div>
                                                 </div>
                                             );
                                         })}
                                     </div>
                                 </div>
                                 
                                 {/* Add Step */}
                                 <div className="flex gap-2">
                                     <select className="flex-grow bg-white border-2 border-slate-200 p-2 text-xs font-bold focus:border-brand-600 outline-none" onChange={(e) => {if(e.target.value) {setEditingWorkflow({...editingWorkflow, steps: [...editingWorkflow.steps, e.target.value]}); e.target.value = '';}}}>
                                         <option value="">+ Add Agent Step</option>
                                         {agents.map(a => <option key={a.id} value={a.id}>{a.name} ({a.role})</option>)}
                                     </select>
                                 </div>

                                 <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                                     <button onClick={() => handleSaveWorkflow(editingWorkflow)} className="bg-slate-900 text-white px-6 py-2 font-black uppercase text-xs flex items-center gap-2 hover:bg-brand-600">
                                         <Save size={14} /> Save Changes
                                     </button>
                                 </div>
                             </div>
                         ) : (
                             <div className="h-full flex flex-col items-center justify-center text-slate-300">
                                 <Code size={48} className="mb-4" />
                                 <div className="font-black uppercase text-sm">Select a Workflow</div>
                             </div>
                         )}
                    </div>
                </div>
            )}
            
            {activeTab === 'pipeline' && (
                <div className="space-y-8">
                     {selectedIssue ? (
                        <>
                           {/* Issue Header */}
                            <div className="bg-white border-2 border-slate-900 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                             <div>
                                 <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Editing Draft</div>
                                 <h2 className="text-2xl font-black uppercase tracking-tight">{selectedIssue.intro?.headline || "Untitled Issue"}</h2>
                             </div>
                             <div className="flex gap-3">
                                 <button 
                                    onClick={async () => { 
                                        const updated = { ...selectedIssue, status: 'published' as const };
                                        await storageService.saveIssue(updated);
                                        setSelectedIssue(updated);
                                        setIssues(prev => prev.map(i => i.id === updated.id ? updated : i));
                                        addLog('System', 'Issue Published Live.', 'success');
                                    }} 
                                    className="bg-brand-600 text-white px-4 py-2 font-black uppercase text-xs hover:bg-brand-700 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] active:shadow-none active:translate-x-[1px] active:translate-y-[1px]"
                                 >
                                    {selectedIssue.status === 'published' ? 'Update Live' : 'Publish Live'}
                                 </button>
                                 
                                 <button onClick={async () => { await storageService.saveIssue(selectedIssue); addLog('System', 'Saved.', 'success'); }} className="bg-slate-100 text-slate-900 px-4 py-2 font-black uppercase text-xs hover:bg-slate-200">Save</button>
                                 
                                 <button 
                                    type="button"
                                    onClick={() => setDeleteTarget({ type: 'issue', id: selectedIssue.id, name: selectedIssue.intro.headline })}
                                    className="p-2 text-slate-400 hover:text-red-600 border border-transparent hover:border-red-100 rounded"
                                 >
                                     <Trash2 size={18} />
                                 </button>
                             </div>
                        </div>

                        {/* Story Editor (Simplified for brevity, logic remains same) */}
                        <div className="bg-white border-2 border-slate-900 p-6">
                             {/* ... Inputs for Headlines/Content ... */}
                             <h3 className="text-xs font-black uppercase text-slate-400 mb-4">Draft Content</h3>
                             <p className="text-sm font-serif italic text-slate-500 mb-4">Select a story tab to edit content.</p>
                             
                             {/* Story Navigation */}
                            <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar mb-6">
                                {selectedIssue.stories.map((s, i) => (
                                    <button key={i} onClick={() => setEditingStoryIndex(i)} className={`shrink-0 px-4 py-2 border-2 text-xs font-black uppercase whitespace-nowrap transition-all ${editingStoryIndex === i ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-500 border-slate-200'}`}>
                                        {s.category}
                                    </button>
                                ))}
                            </div>
                            
                            {/* Selected Story Editor */}
                            {selectedIssue.stories[editingStoryIndex] && (
                                <div className="space-y-6">
                                    {/* Headline */}
                                    <div>
                                        <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Headline</label>
                                        <input 
                                            className="w-full text-xl font-bold border-b border-slate-200 pb-2 bg-transparent focus:border-brand-600 outline-none" 
                                            value={selectedIssue.stories[editingStoryIndex].headline} 
                                            onChange={(e) => { const newS = [...selectedIssue.stories]; newS[editingStoryIndex].headline = e.target.value; setSelectedIssue({...selectedIssue, stories: newS}); }} 
                                        />
                                    </div>

                                    {/* Main Content */}
                                    <div>
                                        <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">
                                            Body Content 
                                            <span className="text-[9px] font-normal text-slate-400 ml-2 normal-case">(Use ---INTRIGUE-TAKE-START--- ... ---INTRIGUE-TAKE-END--- to embed take)</span>
                                        </label>
                                        <textarea 
                                            className="w-full h-64 p-3 bg-slate-50 border-2 border-slate-200 font-serif focus:border-brand-600 outline-none leading-relaxed text-sm" 
                                            value={selectedIssue.stories[editingStoryIndex].content.join('\n\n')} 
                                            onChange={(e) => { const newS = [...selectedIssue.stories]; newS[editingStoryIndex].content = e.target.value.split('\n\n'); setSelectedIssue({...selectedIssue, stories: newS}); }} 
                                        />
                                    </div>

                                    {/* Intrigue Take Editor */}
                                    <div>
                                        <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Intrigue Take (Default Bottom Placement)</label>
                                        <textarea 
                                            className="w-full h-24 p-3 bg-brand-50/50 border-2 border-slate-200 font-serif italic text-sm focus:border-brand-600 outline-none" 
                                            value={selectedIssue.stories[editingStoryIndex].intrigueTake || ''} 
                                            onChange={(e) => { 
                                                const newS = [...selectedIssue.stories]; 
                                                newS[editingStoryIndex].intrigueTake = e.target.value; 
                                                setSelectedIssue({...selectedIssue, stories: newS}); 
                                            }}
                                            placeholder="Enter the editorial take here..."
                                        />
                                        <p className="text-[10px] text-slate-400 mt-1 italic">
                                            Tip: Copy this text and paste it into the Body Content wrapped in <strong>---INTRIGUE-TAKE-START---</strong> and <strong>---INTRIGUE-TAKE-END---</strong> to position it specifically.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                        </>
                     ) : (
                        <div className="h-96 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 bg-white/50">
                            <Layers size={64} className="text-slate-200 mb-4" />
                            <h3 className="font-black uppercase text-slate-400">Pipeline Empty</h3>
                        </div>
                     )}
                </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-4 space-y-6">
             <div className="bg-white border-2 border-slate-900 p-6">
                <h3 className="font-black text-[10px] uppercase tracking-widest text-slate-400 mb-6">Briefing Queue</h3>
                <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                    {issues.map(issue => (
                        <div key={issue.id} className="relative group">
                            <button
                                onClick={() => { setSelectedIssue(issue); setActiveTab('pipeline'); }}
                                className={`w-full p-4 text-left border-2 transition-all ${selectedIssue?.id === issue.id ? 'border-brand-600 bg-brand-50 shadow-[4px_4px_0px_0px_rgba(234,88,12,0.1)]' : 'border-slate-50 bg-white'}`}
                            >
                                <div className="font-black text-sm mb-1 truncate pr-6">{issue.intro?.headline || issue.stories?.[0]?.headline || 'Untitled Issue'}</div>
                                <div className="flex justify-between items-center text-[8px] uppercase font-black text-slate-400">
                                    <span>{issue.date}</span>
                                    <span className={issue.status === 'published' ? 'text-green-600' : 'text-amber-600'}>{issue.status}</span>
                                </div>
                            </button>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setDeleteTarget({ type: 'issue', id: issue.id, name: issue.intro?.headline || issue.stories?.[0]?.headline || 'Untitled Issue' });
                                }}
                                className="absolute top-2 right-2 z-10 p-2 text-slate-400 hover:text-red-600 bg-white/80 hover:bg-white rounded-full transition-colors border border-transparent hover:border-slate-200"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    ))}
                    {issues.length === 0 && <div className="text-xs text-slate-400 italic">No issues found.</div>}
                </div>
             </div>

             {/* Image Preview Pane */}
             {selectedIssue && activeTab === 'pipeline' && (
                <div className="bg-white border-2 border-slate-900 p-6">
                   <h3 className="font-black text-[10px] uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                       <ImageIcon size={14} /> Draft Images
                   </h3>
                   <div className="space-y-4 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                       {selectedIssue.stories && selectedIssue.stories.length > 0 ? (
                           selectedIssue.stories.map((story, idx) => (
                               <div key={idx} className="space-y-2">
                                   <div className="text-[10px] font-bold uppercase text-slate-500">{story.category}</div>
                                   {story.image ? (
                                       <img
                                           src={story.image}
                                           alt={story.headline}
                                           className="w-full aspect-video object-cover border-2 border-slate-200 rounded-sm"
                                       />
                                   ) : (
                                       <div className="w-full aspect-video bg-gradient-to-br from-slate-100 to-slate-200 border-2 border-dashed border-slate-300 flex items-center justify-center rounded-sm">
                                           <div className="text-center">
                                               <ImageIcon size={24} className="text-slate-300 mx-auto mb-2" />
                                               <div className="text-[10px] text-slate-400">Waiting for image</div>
                                           </div>
                                       </div>
                                   )}
                               </div>
                           ))
                       ) : (
                           <div className="text-xs text-slate-400 italic text-center py-6">No stories to display</div>
                       )}
                   </div>
                </div>
             )}

             {/* Logs */}
             <div className="bg-slate-900 p-6 rounded-sm">
                <h3 className="font-black text-[10px] uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                    <Terminal size={14} /> Agent Feed
                </h3>
                <div className="h-80 overflow-y-auto space-y-4 font-mono text-[10px] pr-2 custom-scrollbar-dark">
                    {logs.map((log, i) => (
                        <div key={i} className={`border-l-2 pl-3 py-1 ${log.type === 'success' ? 'text-green-400 border-green-500' : log.type === 'error' ? 'text-red-400 border-red-500' : 'text-slate-400 border-slate-700'}`}>
                            <div className="text-[8px] opacity-30 mb-1 font-bold uppercase">{log.agent} • {log.timestamp}</div>
                            <div className="leading-relaxed break-words">{log.message.substring(0, 200)}{log.message.length > 200 ? '...' : ''}</div>
                        </div>
                    ))}
                </div>
             </div>
          </div>

        </div>

        {/* SCHEDULES TAB */}
        {activeTab === 'schedules' && (
          <SchedulesTab
            workflows={workflows}
            onLoadData={() => loadData(true)}
            onAddLog={addLog}
          />
        )}

        {/* AUTHOR TAB */}
        {activeTab === 'author' && (
          <AuthorTab
            onAddLog={addLog}
          />
        )}

      </div>
    </div>
  );
};
