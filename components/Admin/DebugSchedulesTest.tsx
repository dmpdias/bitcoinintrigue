import React, { useState } from 'react';
import { storageService } from '../../services/storageService';
import { AlertCircle, CheckCircle2, Loader2, RefreshCw } from 'lucide-react';

export const DebugSchedulesTest: React.FC = () => {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testRunTime, setTestRunTime] = useState<string>('');
  const [rawResponse, setRawResponse] = useState<any>(null);

  const testGetSchedules = async () => {
    setIsLoading(true);
    setError(null);
    setSchedules([]);
    setRawResponse(null);
    const startTime = Date.now();

    try {
      console.log('[DEBUG TEST] Starting getSchedules test...');
      const result = await storageService.getSchedules();
      const endTime = Date.now();
      const duration = endTime - startTime;

      console.log('[DEBUG TEST] Success! Result:', result);
      console.log('[DEBUG TEST] Duration:', duration, 'ms');
      console.log('[DEBUG TEST] Result type:', typeof result);
      console.log('[DEBUG TEST] Is array:', Array.isArray(result));
      console.log('[DEBUG TEST] Length:', result.length);

      setSchedules(result);
      setRawResponse(result);
      setTestRunTime(`${duration}ms`);
    } catch (err: any) {
      console.error('[DEBUG TEST] Error:', err);
      setError(err.message || String(err));
      setTestRunTime(`failed after ${Date.now() - startTime}ms`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto p-6">
      <div className="bg-yellow-50 border-2 border-yellow-200 p-4 rounded">
        <h2 className="font-black uppercase text-lg text-yellow-900 mb-2">🧪 Schedules Debug Test</h2>
        <p className="text-sm text-yellow-800">
          This test directly calls storageService.getSchedules() to diagnose issues.
          Check browser console (F12 → Console tab) for detailed logs.
        </p>
      </div>

      <button
        onClick={testGetSchedules}
        disabled={isLoading}
        className="w-full bg-slate-900 text-white px-6 py-3 font-black uppercase text-sm hover:bg-brand-600 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isLoading ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
        {isLoading ? 'Testing...' : 'Run Test'}
      </button>

      {testRunTime && (
        <div className="bg-slate-50 border border-slate-200 p-3 rounded text-sm">
          <span className="font-bold">Test Duration:</span> {testRunTime}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-2 border-red-200 p-4 rounded">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-black uppercase text-sm text-red-900">Error</h3>
              <p className="text-sm text-red-700 mt-1 font-mono">{error}</p>
            </div>
          </div>
        </div>
      )}

      {schedules.length > 0 && (
        <div className="bg-green-50 border-2 border-green-200 p-4 rounded">
          <div className="flex items-start gap-3">
            <CheckCircle2 size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-black uppercase text-sm text-green-900">Success!</h3>
              <p className="text-sm text-green-700 mt-1">
                Found {schedules.length} schedule{schedules.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
      )}

      {schedules.length === 0 && !error && testRunTime && (
        <div className="bg-orange-50 border-2 border-orange-200 p-4 rounded">
          <h3 className="font-black uppercase text-sm text-orange-900 mb-2">⚠️ No Schedules Found</h3>
          <p className="text-sm text-orange-700">
            The query executed successfully but returned 0 schedules. Check if:
          </p>
          <ul className="text-sm text-orange-700 mt-2 ml-4 space-y-1">
            <li>• The schedules table exists in your Supabase database</li>
            <li>• You have inserted test data into the schedules table</li>
            <li>• The RLS policies allow reading from the schedules table</li>
            <li>• Your Supabase project URL and API key are correct</li>
          </ul>
        </div>
      )}

      {schedules.length > 0 && (
        <div className="bg-white border-2 border-slate-900 p-6 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
          <h3 className="font-black uppercase text-sm mb-4">Schedules Found</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b-2 border-slate-900">
                  <th className="text-left p-2 font-black text-xs uppercase">ID</th>
                  <th className="text-left p-2 font-black text-xs uppercase">Name</th>
                  <th className="text-left p-2 font-black text-xs uppercase">Workflow ID</th>
                  <th className="text-left p-2 font-black text-xs uppercase">Cron</th>
                  <th className="text-left p-2 font-black text-xs uppercase">Active</th>
                </tr>
              </thead>
              <tbody>
                {schedules.map((s, i) => (
                  <tr key={i} className="border-b border-slate-200 hover:bg-slate-50">
                    <td className="p-2 font-mono text-[11px]">{s.id?.substring(0, 8)}...</td>
                    <td className="p-2 font-bold">{s.name}</td>
                    <td className="p-2 font-mono text-[11px]">{s.workflowId}</td>
                    <td className="p-2 font-mono text-[11px]">{s.cronExpression}</td>
                    <td className="p-2">{s.isActive ? '✅' : '❌'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {rawResponse && (
        <details className="bg-slate-50 border border-slate-200 p-4 rounded">
          <summary className="cursor-pointer font-bold text-sm uppercase">Raw JSON Response</summary>
          <pre className="mt-3 bg-white p-3 rounded border border-slate-200 text-[10px] overflow-x-auto font-mono text-slate-700">
            {JSON.stringify(rawResponse, null, 2)}
          </pre>
        </details>
      )}

      <div className="bg-blue-50 border border-blue-200 p-3 rounded text-xs text-blue-700">
        <strong>💡 Tip:</strong> Open your browser's Developer Tools (F12) and go to the Console tab to see detailed logs from the test execution.
      </div>
    </div>
  );
};
