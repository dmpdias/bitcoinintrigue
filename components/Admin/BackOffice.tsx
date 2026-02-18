
import React, { useState, useEffect } from 'react';
import { storageService } from '../../services/storageService';
import { agentService } from '../../services/agentService';
import { ProductionChecklist } from './ProductionChecklist';
import { 
  BriefingData, 
  AgentLog, 
  AgentDefinition, 
  WorkflowDefinition, 
  Subscriber, 
  AnalyticsData, 
  DistributionEvent 
} from '../../types';
import { 
  Settings, 
  Play, 
  Trash2, 
  Terminal,
  Save,
  Send,
  Loader2,
  Layers,
  Bot,
  Plus,
  ChevronRight,
  ToggleLeft,
  ToggleRight,
  Code,
  Users,
  BarChart3,
  Share2,
  Twitter,
  Mail,
  ArrowUpRight,
  ArrowDownRight,
  UserPlus,
  X,
  Edit,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Cloud,
  AlertCircle
} from 'lucide-react';

export const BackOffice: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pipeline' | 'agents' | 'workflows' | 'audience' | 'analytics' | 'distribution' | 'system'>('pipeline');
  const [issues, setIssues] = useState<BriefingData[]>([]);
  const [agents, setAgents] = useState<AgentDefinition[]>([]);
  const [workflows, setWorkflows] = useState<WorkflowDefinition[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [distributions, setDistributions] = useState<DistributionEvent[]>([]);
  
  const [selectedIssue, setSelectedIssue] = useState<BriefingData | null>(null);
  const [editingAgent, setEditingAgent] = useState<AgentDefinition | null>(null);
  const [editingWorkflow, setEditingWorkflow] = useState<WorkflowDefinition | null>(null);
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [newSubEmail, setNewSubEmail] = useState('');

  useEffect(() => {
    storageService.initialize();
    refreshData();
  }, []);

  const refreshData = () => {
    setIssues(storageService.getAllIssues());
    setAgents(storageService.getAgents());
    setWorkflows(storageService.getWorkflows());
    setSubscribers(storageService.getSubscribers());
    setAnalytics(storageService.getAnalytics());
    setDistributions(storageService.getDistributions());
  };

  const addLog = (agent: string, message: string, type: AgentLog['type'] = 'info') => {
    setLogs(prev => [{ agent, message, type, timestamp: new Date().toLocaleTimeString() }, ...prev].slice(0, 50));
  };

  const runWorkflow = async (workflow: WorkflowDefinition) => {
    setIsRunning(true);
    addLog('System', `Starting Workflow: ${workflow.name}`, 'info');
    
    let context = "";
    try {
      for (const agentId of workflow.steps) {
        const agent = agents.find(a => a.id === agentId);
        if (!agent || !agent.isActive) continue;

        addLog(agent.name, `Executing ${agent.role}...`, 'info');
        context = await agentService.runStep(agent, context);
        addLog(agent.name, `Completed.`, 'success');
      }

      const jsonStart = context.indexOf('{');
      if (jsonStart !== -1) {
        try {
          const rawJson = context.substring(jsonStart, context.lastIndexOf('}') + 1);
          const draft = JSON.parse(rawJson);
          const finalDraft: BriefingData = {
            ...draft,
            id: `issue-${Date.now()}`,
            status: 'review',
            date: new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
            lastUpdated: new Date().toISOString()
          };
          storageService.saveIssue(finalDraft);
          setIssues(storageService.getAllIssues());
          setSelectedIssue(finalDraft);
          setActiveTab('pipeline');
          addLog('System', 'Pipeline updated with new draft.', 'success');
        } catch (e) {
          addLog('System', 'Agent output parsing error: ' + e, 'error');
        }
      } else {
        addLog('System', 'Workflow finished. No JSON found.', 'warning');
      }
    } catch (error) {
      addLog('System', 'Critical workflow error: ' + error, 'error');
    } finally {
      setIsRunning(false);
    }
  };

  const handleCreateAgent = () => {
    const newAgent: AgentDefinition = {
      id: `agent-${Date.now()}`,
      name: 'New Agent',
      role: 'journalist',
      model: 'gemini-3-flash-preview',
      isActive: true,
      instructions: 'You are a helpful assistant.'
    };
    storageService.saveAgent(newAgent);
    refreshData();
    setEditingAgent(newAgent);
  };

  const handleCreateWorkflow = () => {
    const newWf: WorkflowDefinition = {
      id: `wf-${Date.now()}`,
      name: 'New Pipeline',
      description: 'A custom sequence of agents.',
      steps: [],
      isActive: true
    };
    storageService.saveWorkflow(newWf);
    refreshData();
    setEditingWorkflow(newWf);
  };

  const handleDistribute = (issue: BriefingData, channel: 'email' | 'x') => {
    addLog('Broadcaster', `Broadcasting #${issue.issueNumber} via ${channel.toUpperCase()}...`, 'info');
    
    setTimeout(() => {
      const event: DistributionEvent = {
        id: `dist-${Date.now()}`,
        issueId: issue.id,
        channel,
        timestamp: new Date().toISOString(),
        status: 'sent',
        reach: channel === 'email' ? subscribers.length : Math.floor(Math.random() * 5000 + 1000)
      };
      storageService.trackDistribution(event);
      refreshData();
      addLog('Broadcaster', `${channel.toUpperCase()} broadcast successful.`, 'success');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-10 pb-20 font-sans text-slate-900">
      <div className="max-w-[1400px] mx-auto px-4">
        
        {/* Warning Banner */}
        <div className="mb-6 bg-brand-50 border-2 border-brand-200 p-3 flex items-center justify-between shadow-[4px_4px_0px_0px_rgba(234,88,12,0.1)]">
            <div className="flex items-center gap-3">
                <AlertCircle size={18} className="text-brand-600" />
                <span className="text-[10px] font-black uppercase tracking-widest text-brand-900">
                    Prototype Environment: Data is persisted in local browser storage only.
                </span>
            </div>
            <button onClick={() => setActiveTab('system')} className="text-[10px] font-black uppercase text-brand-600 hover:underline">
                Ready to go Cloud?
            </button>
        </div>

        {/* Navigation & Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tight flex items-center gap-3">
              <Settings className="text-brand-600" /> Command Center
            </h1>
            <div className="flex flex-wrap gap-2 mt-4">
              {[
                { id: 'pipeline', label: 'Pipeline', icon: Layers },
                { id: 'distribution', label: 'Distro', icon: Share2 },
                { id: 'audience', label: 'Audience', icon: Users },
                { id: 'analytics', label: 'Stats', icon: BarChart3 },
                { id: 'agents', label: 'Agents', icon: Bot },
                { id: 'workflows', label: 'Workflows', icon: Code },
                { id: 'system', label: 'Ready?', icon: ShieldCheck }
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
             <div className="hidden lg:flex items-center gap-2 bg-white border-2 border-slate-200 px-4 py-2 rounded-sm">
                <Cloud size={14} className="text-slate-300" />
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Local Sim Mode</span>
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
             </div>
             {activeTab === 'pipeline' && (
                <button 
                    onClick={() => {
                        const defaultWf = workflows.find(w => w.isActive) || workflows[0];
                        if (defaultWf) runWorkflow(defaultWf);
                    }}
                    disabled={isRunning}
                    className="bg-brand-600 hover:bg-brand-700 text-white font-black uppercase px-6 py-3 border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] flex items-center gap-2 transition-all active:shadow-none active:translate-x-[2px] active:translate-y-[2px] disabled:opacity-50"
                >
                    {isRunning ? <Loader2 className="animate-spin" /> : <Play size={20} />}
                    Run Daily Pipeline
                </button>
             )}
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-8">
            
            {activeTab === 'system' && <ProductionChecklist />}

            {activeTab === 'pipeline' && (
               <div className="space-y-6">
                 {selectedIssue ? (
                    <div className="bg-white border-2 border-slate-900 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] p-8">
                        <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-100">
                            <h2 className="text-2xl font-black uppercase tracking-tight">Review Content</h2>
                            <div className="flex gap-3">
                                <button 
                                    onClick={() => {
                                        const updated = { ...selectedIssue, status: 'published' as const };
                                        storageService.saveIssue(updated);
                                        refreshData();
                                        setSelectedIssue(updated);
                                        addLog('System', 'Issue approved and published.', 'success');
                                    }}
                                    disabled={selectedIssue.status === 'published'}
                                    className="bg-slate-900 text-white px-6 py-2 font-black uppercase text-sm hover:bg-brand-600 transition-colors flex items-center gap-2 disabled:opacity-50"
                                >
                                    <CheckCircle2 size={16} /> {selectedIssue.status === 'published' ? 'Published' : 'Approve & Publish'}
                                </button>
                                <button 
                                    onClick={() => {
                                        storageService.deleteIssue(selectedIssue.id);
                                        refreshData();
                                        setSelectedIssue(null);
                                    }}
                                    className="p-2 text-slate-400 hover:text-red-600"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        </div>
                        <div className="space-y-8">
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Subject Line</label>
                                <input 
                                    className="w-full text-2xl font-black bg-slate-50 p-4 border-none outline-none focus:ring-2 ring-brand-600" 
                                    value={selectedIssue.intro?.headline} 
                                    onChange={(e) => {
                                        const updated = { ...selectedIssue, intro: { ...selectedIssue.intro, headline: e.target.value } };
                                        setSelectedIssue(updated);
                                        storageService.saveIssue(updated);
                                    }}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Intro Content</label>
                                <textarea 
                                    className="w-full h-32 bg-slate-50 p-4 font-serif leading-relaxed resize-none outline-none focus:ring-2 ring-brand-600" 
                                    value={selectedIssue.intro?.content}
                                    onChange={(e) => {
                                        const updated = { ...selectedIssue, intro: { ...selectedIssue.intro, content: e.target.value } };
                                        setSelectedIssue(updated);
                                        storageService.saveIssue(updated);
                                    }}
                                />
                            </div>
                            <div className="grid md:grid-cols-2 gap-6">
                                {selectedIssue.stories.map((story, i) => (
                                    <div key={i} className="p-5 border-2 border-slate-100 rounded-sm">
                                        <div className="text-[10px] font-black text-brand-600 uppercase mb-2">{story.category}</div>
                                        <input 
                                            className="w-full font-black text-slate-900 mb-2 bg-transparent border-none p-0 outline-none" 
                                            value={story.headline}
                                            onChange={(e) => {
                                                const stories = [...selectedIssue.stories];
                                                stories[i] = { ...stories[i], headline: e.target.value };
                                                const updated = { ...selectedIssue, stories };
                                                setSelectedIssue(updated);
                                                storageService.saveIssue(updated);
                                            }}
                                        />
                                        <textarea 
                                            className="w-full h-24 text-xs text-slate-600 bg-transparent border-none p-0 outline-none font-serif leading-relaxed resize-none" 
                                            value={story.content.join('\n\n')}
                                            onChange={(e) => {
                                                const stories = [...selectedIssue.stories];
                                                stories[i] = { ...stories[i], content: e.target.value.split('\n\n') };
                                                const updated = { ...selectedIssue, stories };
                                                setSelectedIssue(updated);
                                                storageService.saveIssue(updated);
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                 ) : (
                    <div className="h-96 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 bg-white/50">
                        <Layers size={64} className="text-slate-200 mb-4" />
                        <h3 className="font-black uppercase text-slate-400">Pipeline Empty</h3>
                        <p className="text-xs text-slate-300 mt-2">Generate a draft or select an item from the queue.</p>
                    </div>
                 )}
               </div>
            )}

            {/* Other tabs simplified for space - similar to before */}
            {activeTab === 'distribution' && (
                <div className="space-y-6">
                    <div className="bg-white border-2 border-slate-900 p-8 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]">
                        <h2 className="text-2xl font-black uppercase mb-6">Distribution Hub</h2>
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="p-6 border-2 border-slate-100 space-y-4">
                                <div className="flex items-center gap-3">
                                    <Mail className="text-brand-600"/>
                                    <h4 className="font-black uppercase text-sm">Email Broadcast</h4>
                                </div>
                                <button 
                                    onClick={() => selectedIssue && handleDistribute(selectedIssue, 'email')}
                                    disabled={!selectedIssue || selectedIssue.status !== 'published'}
                                    className="w-full bg-slate-900 text-white font-black uppercase text-xs py-3 hover:bg-brand-600 disabled:opacity-20"
                                >
                                    Push to Email
                                </button>
                            </div>
                            <div className="p-6 border-2 border-slate-100 space-y-4">
                                <div className="flex items-center gap-3">
                                    <Twitter className="text-slate-900"/>
                                    <h4 className="font-black uppercase text-sm">X Post</h4>
                                </div>
                                <button 
                                    onClick={() => selectedIssue && handleDistribute(selectedIssue, 'x')}
                                    disabled={!selectedIssue || selectedIssue.status !== 'published'}
                                    className="w-full bg-slate-900 text-white font-black uppercase text-xs py-3 hover:bg-brand-600 disabled:opacity-20"
                                >
                                    Post to X
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Audience Tab */}
            {activeTab === 'audience' && (
                <div className="bg-white border-2 border-slate-900 p-8 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]">
                    <div className="flex justify-between items-center mb-10">
                        <h2 className="text-2xl font-black uppercase">Audience List</h2>
                        <div className="flex gap-2">
                            <input value={newSubEmail} onChange={(e) => setNewSubEmail(e.target.value)} placeholder="Email..." className="bg-slate-50 border-2 border-slate-200 px-4 py-2 text-xs outline-none" />
                            <button 
                                onClick={() => {
                                    if(!newSubEmail) return;
                                    storageService.saveSubscriber({ id: Date.now().toString(), email: newSubEmail, joinedDate: new Date().toISOString().split('T')[0], status: 'active', source: 'manual' });
                                    setNewSubEmail(''); refreshData();
                                }}
                                className="bg-slate-900 text-white px-6 py-2 text-[10px] font-black uppercase"
                            >
                                <UserPlus size={14}/> Add
                            </button>
                        </div>
                    </div>
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b-2 border-slate-900 text-[10px] font-black uppercase text-slate-400">
                                <th className="pb-4">Email Address</th>
                                <th className="pb-4">Status</th>
                                <th className="pb-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {subscribers.map(sub => (
                                <tr key={sub.id} className="text-sm">
                                    <td className="py-4 font-bold">{sub.email}</td>
                                    <td className="py-4 font-black uppercase text-[10px]">{sub.status}</td>
                                    <td className="py-4 text-right">
                                        <button onClick={() => { storageService.deleteSubscriber(sub.id); refreshData(); }} className="text-slate-300 hover:text-red-600"><Trash2 size={16}/></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'analytics' && analytics && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {[
                        { label: 'Subscribers', val: analytics.totalSubscribers, up: true },
                        { label: 'Open Rate', val: `${analytics.openRate}%`, up: true },
                        { label: 'Click Rate', val: `${analytics.clickRate}%`, up: false },
                        { label: 'Web Traffic', val: `${(analytics.webViews / 1000).toFixed(1)}k`, up: true }
                    ].map((stat, i) => (
                        <div key={i} className="bg-white border-2 border-slate-900 p-6 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
                            <div className="text-[10px] font-black uppercase text-slate-400 mb-3">{stat.label}</div>
                            <div className="text-3xl font-black mb-1">{stat.val}</div>
                        </div>
                    ))}
                </div>
            )}

            {activeTab === 'agents' && (
                <div className="grid md:grid-cols-2 gap-6">
                    {agents.map(agent => (
                        <div key={agent.id} className="bg-white border-2 border-slate-900 p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)]">
                            <div className="flex justify-between items-start mb-6">
                                <h4 className="font-black uppercase text-sm">{agent.name}</h4>
                                <button onClick={() => { storageService.saveAgent({...agent, isActive: !agent.isActive}); refreshData(); }} className={agent.isActive ? 'text-green-500' : 'text-slate-300'}>
                                    {agent.isActive ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                                </button>
                            </div>
                            <textarea 
                                className="w-full h-32 bg-slate-50 p-3 text-xs font-mono border-none"
                                value={agent.instructions}
                                onChange={(e) => { storageService.saveAgent({...agent, instructions: e.target.value}); refreshData(); }}
                            />
                        </div>
                    ))}
                    <button onClick={handleCreateAgent} className="border-2 border-dashed border-slate-200 p-8 text-[10px] font-black uppercase text-slate-400">+ New Agent</button>
                </div>
            )}

            {activeTab === 'workflows' && (
                <div className="space-y-6">
                    {workflows.map(wf => (
                        <div key={wf.id} className="bg-white border-2 border-slate-900 p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.05)]">
                            <h3 className="text-xl font-black uppercase mb-4">{wf.name}</h3>
                            <div className="flex flex-wrap items-center gap-4">
                                {wf.steps.map((agentId, i) => (
                                    <React.Fragment key={i}>
                                        <div className="px-4 py-2 bg-slate-50 border-2 border-slate-100 text-[10px] font-black uppercase">
                                            {agents.find(a => a.id === agentId)?.name}
                                        </div>
                                        {i < wf.steps.length - 1 && <ArrowRight size={16} className="text-slate-300" />}
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>
                    ))}
                    <button onClick={handleCreateWorkflow} className="w-full border-2 border-dashed border-slate-200 p-8 text-[10px] font-black uppercase text-slate-400">+ New Pipeline</button>
                </div>
            )}

          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-4 space-y-6">
             <div className="bg-white border-2 border-slate-900 p-6">
                <h3 className="font-black text-[10px] uppercase tracking-widest text-slate-400 mb-6">Briefing Queue</h3>
                <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                    {issues.sort((a,b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()).map(issue => (
                        <button 
                            key={issue.id}
                            onClick={() => { setSelectedIssue(issue); setActiveTab('pipeline'); }}
                            className={`w-full p-4 text-left border-2 transition-all ${selectedIssue?.id === issue.id ? 'border-brand-600 bg-brand-50 shadow-[4px_4px_0px_0px_rgba(234,88,12,0.1)]' : 'border-slate-50 bg-white'}`}
                        >
                            <div className="font-black text-sm mb-1 truncate">{issue.intro?.headline}</div>
                            <div className="flex justify-between items-center text-[8px] uppercase font-black text-slate-400">
                                <span>{issue.date}</span>
                                <span className={issue.status === 'published' ? 'text-green-600' : 'text-amber-600'}>{issue.status}</span>
                            </div>
                        </button>
                    ))}
                </div>
             </div>

             <div className="bg-slate-900 p-6 rounded-sm">
                <h3 className="font-black text-[10px] uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                    <Terminal size={14} /> Agent Feed
                </h3>
                <div className="h-80 overflow-y-auto space-y-4 font-mono text-[10px] pr-2 custom-scrollbar-dark">
                    {logs.map((log, i) => (
                        <div key={i} className={`border-l-2 pl-3 py-1 ${log.type === 'success' ? 'text-green-400 border-green-500' : 'text-slate-400 border-slate-700'}`}>
                            <div className="text-[8px] opacity-30 mb-1 font-bold uppercase">{log.agent} • {log.timestamp}</div>
                            <div className="leading-relaxed">{log.message}</div>
                        </div>
                    ))}
                    {logs.length === 0 && <div className="text-slate-700 italic text-center py-32">Ready.</div>}
                </div>
             </div>
          </div>

        </div>

      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar-dark::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar-dark::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
      `}</style>
    </div>
  );
};
