import React, { useState, useEffect } from 'react';
import { storageService } from '../../services/storageService';
import { User, Save, Loader2, CheckCircle2, AlertCircle, Copy, Eye, EyeOff } from 'lucide-react';

interface AuthorTabProps {
  onAddLog: (agent: string, message: string, type: 'info' | 'success' | 'warning' | 'error') => void;
}

interface AuthorAgent {
  id: string;
  name: string;
  bio?: string;
  x_handle?: string;
  x_credentials?: {
    bearer_token?: string;
    api_key?: string;
    refresh_token?: string;
  };
  is_active: boolean;
}

export const AuthorTab: React.FC<AuthorTabProps> = ({ onAddLog }) => {
  const [author, setAuthor] = useState<AuthorAgent | null>(null);
  const [editingAuthor, setEditingAuthor] = useState<Partial<AuthorAgent> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [credentialsConnected, setCredentialsConnected] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [tokenInput, setTokenInput] = useState('');

  useEffect(() => {
    loadAuthor();
  }, []);

  const loadAuthor = async () => {
    setIsLoading(true);
    try {
      // Load author_agents table (hardcoded to bitcoin intrigue agent for now)
      let author = await storageService.getAuthorAgent('agent-bitcoinintrigue');

      // If author doesn't exist, create default one
      if (!author) {
        const defaultAuthor = {
          id: 'agent-bitcoinintrigue',
          name: 'Bitcoin Intrigue',
          bio: 'Daily Bitcoin newsletter explaining crypto like you\'re human',
          x_handle: '@bitcoinintrigue',
          is_active: true,
        };
        author = await storageService.saveAuthorAgent(defaultAuthor as any);
        onAddLog('System', 'Created default author profile', 'info');
      }

      if (author) {
        setAuthor(author);
        setCredentialsConnected(!!author.xCredentials?.bearer_token);
      }
    } catch (err: any) {
      onAddLog('System', `Failed to load author: ${err.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditAuthor = () => {
    if (author) {
      setEditingAuthor({
        ...author,
      });
    }
  };

  const handleSaveAuthor = async () => {
    if (!editingAuthor) return;

    setIsLoading(true);
    try {
      const updated = await storageService.saveAuthorAgent(editingAuthor as AuthorAgent);
      setAuthor(updated);
      setEditingAuthor(null);
      onAddLog('System', 'Author profile updated', 'success');
    } catch (err: any) {
      onAddLog('System', `Failed to save author: ${err.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCredentials = async () => {
    if (!tokenInput.trim()) {
      onAddLog('System', 'Please paste your X API bearer token', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const updated = await storageService.saveAuthorAgent({
        ...author!,
        x_credentials: {
          bearer_token: tokenInput,
        },
      });
      setAuthor(updated);
      setCredentialsConnected(true);
      setTokenInput('');
      setShowToken(false);
      onAddLog('System', 'X API credentials saved successfully', 'success');
    } catch (err: any) {
      onAddLog('System', `Failed to save credentials: ${err.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveCredentials = async () => {
    if (!window.confirm('Remove X API credentials? You can add them back later.')) return;

    setIsLoading(true);
    try {
      const updated = await storageService.saveAuthorAgent({
        ...author!,
        x_credentials: undefined,
      });
      setAuthor(updated);
      setCredentialsConnected(false);
      setTokenInput('');
      onAddLog('System', 'X API credentials removed', 'success');
    } catch (err: any) {
      onAddLog('System', `Failed to remove credentials: ${err.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCredentials = async () => {
    if (!author?.xCredentials?.bearer_token) {
      onAddLog('System', 'No credentials to verify', 'error');
      return;
    }

    setIsLoading(true);
    try {
      // This would call xService.verifyCredentials if it were exported
      onAddLog('System', 'Credential verification requires X API client initialization', 'warning');
    } catch (err: any) {
      onAddLog('System', `Verification failed: ${err.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !author) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 size={32} className="animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Profile Section */}
      <div className="bg-white border-2 border-slate-900 p-8 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
        <h2 className="font-black uppercase text-lg flex items-center gap-3 mb-8">
          <User size={20} className="text-brand-600" />
          Author Profile
        </h2>

        {!editingAuthor ? (
          <div className="space-y-6">
            {/* Display View */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Name</label>
                <div className="text-2xl font-black">{author?.name || 'Not set'}</div>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">X Handle</label>
                <div className="text-lg font-bold text-brand-600">{author?.xHandle || '@bitcoinintrigue'}</div>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Bio</label>
              <p className="text-sm text-slate-700 leading-relaxed">
                {author?.bio || 'No bio set'}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-200">
              <button
                onClick={handleEditAuthor}
                className="bg-slate-900 text-white px-6 py-2 font-black uppercase text-xs hover:bg-brand-600 flex items-center gap-2"
              >
                Edit Profile
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Edit View */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Name (Read-only)</label>
                <input
                  value={editingAuthor.name || ''}
                  disabled
                  className="w-full bg-slate-50 border-2 border-slate-200 p-2 text-sm font-bold text-slate-500"
                />
                <p className="text-[10px] text-slate-400 mt-1">Your author name cannot be changed</p>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">X Handle</label>
                <input
                  value={editingAuthor.x_handle || ''}
                  onChange={e => setEditingAuthor({ ...editingAuthor, x_handle: e.target.value })}
                  placeholder="@bitcoinintrigue"
                  className="w-full bg-slate-50 border-2 border-slate-200 p-2 text-sm font-bold focus:border-brand-600 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Bio</label>
              <textarea
                value={editingAuthor.bio || ''}
                onChange={e => setEditingAuthor({ ...editingAuthor, bio: e.target.value })}
                placeholder="Enter your author bio..."
                className="w-full h-24 bg-slate-50 border-2 border-slate-200 p-3 text-sm focus:border-brand-600 outline-none resize-none"
              />
            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-200">
              <button
                onClick={handleSaveAuthor}
                disabled={isLoading}
                className="bg-slate-900 text-white px-6 py-2 font-black uppercase text-xs hover:bg-brand-600 disabled:opacity-50 flex items-center gap-2"
              >
                {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                Save Changes
              </button>
              <button
                onClick={() => setEditingAuthor(null)}
                className="px-6 py-2 bg-slate-100 text-slate-900 font-black uppercase text-xs hover:bg-slate-200"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* X API Credentials Section */}
      <div className="bg-white border-2 border-slate-900 p-8 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
        <h2 className="font-black uppercase text-lg mb-8 flex items-center gap-3">
          <AlertCircle size={20} className="text-amber-600" />
          X API Credentials
        </h2>

        {!credentialsConnected ? (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 p-4 rounded text-sm text-blue-900">
              <strong>🔐 Secure Setup Required</strong><br />
              To post articles to X (Twitter), you need to provide your X API v2 Bearer Token. Your credentials are encrypted and stored securely.
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">
                X API Bearer Token
              </label>
              <textarea
                value={tokenInput}
                onChange={e => setTokenInput(e.target.value)}
                placeholder="Paste your X API v2 Bearer Token here..."
                className="w-full h-24 bg-slate-50 border-2 border-slate-200 p-3 text-xs font-mono focus:border-brand-600 outline-none resize-none"
              />
              <p className="text-[10px] text-slate-400 mt-2">
                <strong>How to get your token:</strong><br />
                1. Go to <a href="https://developer.twitter.com/en/portal/dashboard" target="_blank" rel="noopener noreferrer" className="text-brand-600 underline">X Developer Portal</a><br />
                2. Create or select your app<br />
                3. Go to "Keys and tokens"<br />
                4. Copy your "Bearer Token" (starts with "AAAA...")
              </p>
            </div>

            <button
              onClick={handleAddCredentials}
              disabled={isLoading || !tokenInput.trim()}
              className="w-full bg-brand-600 text-white px-6 py-3 font-black uppercase text-sm hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
              Connect X Account
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 p-4 rounded flex items-center gap-3">
              <CheckCircle2 size={20} className="text-green-600 flex-shrink-0" />
              <div>
                <strong className="text-green-900">✓ Connected</strong><br />
                <span className="text-sm text-green-800">X API credentials are configured and ready</span>
              </div>
            </div>

            <div className="bg-slate-50 border-2 border-slate-200 p-4 rounded">
              <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block">Current Bearer Token</label>
              <div className="flex items-center gap-2">
                <input
                  type={showToken ? 'text' : 'password'}
                  value={author?.xCredentials?.bearer_token || ''}
                  readOnly
                  className="flex-grow bg-white border border-slate-300 p-2 text-xs font-mono text-slate-600"
                />
                <button
                  onClick={() => setShowToken(!showToken)}
                  className="p-2 text-slate-400 hover:text-slate-600"
                  title={showToken ? 'Hide' : 'Show'}
                >
                  {showToken ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(author?.xCredentials?.bearer_token || '');
                    onAddLog('System', 'Token copied to clipboard', 'success');
                  }}
                  className="p-2 text-slate-400 hover:text-slate-600"
                  title="Copy to clipboard"
                >
                  <Copy size={16} />
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleVerifyCredentials}
                disabled={isLoading}
                className="flex-grow bg-slate-100 text-slate-900 px-4 py-2 font-black uppercase text-xs hover:bg-slate-200 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                Verify Connection
              </button>
              <button
                onClick={handleRemoveCredentials}
                className="flex-grow bg-red-100 text-red-900 px-4 py-2 font-black uppercase text-xs hover:bg-red-200"
              >
                Remove Token
              </button>
            </div>

            <div className="bg-amber-50 border border-amber-200 p-3 rounded text-xs text-amber-900">
              <strong>⚠️ Token Safety</strong><br />
              Never share your X API token. Keep it private and secure. If exposed, regenerate it in your X Developer settings immediately.
            </div>
          </div>
        )}
      </div>

      {/* Permissions Info */}
      <div className="bg-slate-50 border-2 border-slate-200 p-6">
        <h3 className="font-black uppercase text-sm mb-4">Required X API Permissions</h3>
        <ul className="space-y-2 text-sm">
          <li className="flex items-start gap-2">
            <span className="text-brand-600 font-bold">✓</span>
            <span>Read/Write Tweets</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-brand-600 font-bold">✓</span>
            <span>Tweet Compose Permissions</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-brand-600 font-bold">✓</span>
            <span>Access to Tweet Metrics</span>
          </li>
        </ul>
        <p className="text-xs text-slate-600 mt-4">
          Your X app must have "Read and Write" permissions enabled. Check your app settings in the X Developer Portal if you encounter permission errors.
        </p>
      </div>
    </div>
  );
};
