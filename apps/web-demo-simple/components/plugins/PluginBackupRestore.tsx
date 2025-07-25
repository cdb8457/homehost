'use client';

import { useState, useEffect } from 'react';
import { ApiClient } from '@/lib/api-client';
import { LoadingSpinner } from '../LoadingSpinner';
import {
  Download,
  Upload,
  Archive,
  RotateCcw,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Clock,
  HardDrive,
  Package,
  Database,
  Shield,
  Calendar,
  Filter,
  Search,
  RefreshCw,
  Settings,
  X,
  FileText,
  Save,
  Loader2,
  Eye,
  Copy,
  ExternalLink,
  AlertCircle
} from 'lucide-react';

interface BackupEntry {
  id: string;
  name: string;
  description: string;
  type: 'full' | 'configurations' | 'data' | 'custom';
  serverId: string;
  serverName: string;
  pluginIds: string[];
  pluginNames: string[];
  size: number;
  createdAt: string;
  createdBy: string;
  status: 'completed' | 'failed' | 'in_progress';
  metadata: {
    pluginCount: number;
    configurationCount: number;
    dataSize: number;
    checksum: string;
    version: string;
  };
}

interface BackupJob {
  id: string;
  type: 'backup' | 'restore';
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  startedAt: string;
  completedAt?: string;
  error?: string;
  target: {
    serverId: string;
    serverName: string;
    pluginIds: string[];
  };
}

interface PluginBackupRestoreProps {
  serverId?: string;
  serverName?: string;
  pluginId?: string;
  compact?: boolean;
}

export default function PluginBackupRestore({
  serverId,
  serverName,
  pluginId,
  compact = false
}: PluginBackupRestoreProps) {
  const [backups, setBackups] = useState<BackupEntry[]>([]);
  const [activeJobs, setActiveJobs] = useState<BackupJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createBackupOpen, setCreateBackupOpen] = useState(false);
  const [restoreModalOpen, setRestoreModalOpen] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState<BackupEntry | null>(null);
  const [backupTypeFilter, setBackupTypeFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const apiClient = new ApiClient();

  useEffect(() => {
    loadBackups();
    loadActiveJobs();
    
    // Poll for job updates
    const interval = setInterval(() => {
      loadActiveJobs();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [serverId, pluginId]);

  const loadBackups = async () => {
    try {
      setLoading(true);
      setError(null);

      // Mock backup data
      const mockBackups = generateMockBackups();
      setBackups(mockBackups);
    } catch (err) {
      setError('Failed to load backups');
    } finally {
      setLoading(false);
    }
  };

  const loadActiveJobs = async () => {
    try {
      // Mock active jobs
      const mockJobs = generateMockJobs();
      setActiveJobs(mockJobs);
    } catch (err) {
      // Fail silently for job polling
    }
  };

  const generateMockBackups = (): BackupEntry[] => [
    {
      id: '1',
      name: 'Weekly Full Backup',
      description: 'Automated weekly backup of all plugins and configurations',
      type: 'full',
      serverId: serverId || '1',
      serverName: serverName || 'Test Valheim Server',
      pluginIds: ['1', '2', '3', '4', '5'],
      pluginNames: ['AutoBackup Pro', 'Economy Manager', 'Anti-Griefing Shield', 'PvP Arena', 'Performance Monitor'],
      size: 156.7 * 1024 * 1024, // 156.7MB
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      createdBy: 'System',
      status: 'completed',
      metadata: {
        pluginCount: 5,
        configurationCount: 12,
        dataSize: 145.2 * 1024 * 1024,
        checksum: 'sha256:abc123def456',
        version: '1.0.0'
      }
    },
    {
      id: '2',
      name: 'Configuration Backup',
      description: 'Backup of plugin configurations before major update',
      type: 'configurations',
      serverId: serverId || '1',
      serverName: serverName || 'Test Valheim Server',
      pluginIds: ['1', '5'],
      pluginNames: ['AutoBackup Pro', 'Performance Monitor'],
      size: 2.5 * 1024 * 1024,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      createdBy: 'admin',
      status: 'completed',
      metadata: {
        pluginCount: 2,
        configurationCount: 8,
        dataSize: 0,
        checksum: 'sha256:def789ghi012',
        version: '1.0.0'
      }
    },
    {
      id: '3',
      name: 'AutoBackup Pro Data',
      description: 'Daily data backup for AutoBackup Pro plugin',
      type: 'data',
      serverId: serverId || '1',
      serverName: serverName || 'Test Valheim Server',
      pluginIds: ['1'],
      pluginNames: ['AutoBackup Pro'],
      size: 45.2 * 1024 * 1024,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      createdBy: 'AutoBackup Pro',
      status: 'completed',
      metadata: {
        pluginCount: 1,
        configurationCount: 3,
        dataSize: 42.8 * 1024 * 1024,
        checksum: 'sha256:ghi345jkl678',
        version: '1.0.0'
      }
    }
  ];

  const generateMockJobs = (): BackupJob[] => [
    {
      id: '1',
      type: 'backup',
      status: 'running',
      progress: 67,
      startedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      target: {
        serverId: serverId || '1',
        serverName: serverName || 'Test Valheim Server',
        pluginIds: ['1', '2', '3']
      }
    }
  ];

  const handleCreateBackup = async (backupConfig: any) => {
    try {
      setError(null);
      
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Add new job
      const newJob: BackupJob = {
        id: Date.now().toString(),
        type: 'backup',
        status: 'pending',
        progress: 0,
        startedAt: new Date().toISOString(),
        target: {
          serverId: serverId || '1',
          serverName: serverName || 'Test Valheim Server',
          pluginIds: backupConfig.pluginIds || []
        }
      };
      
      setActiveJobs(prev => [...prev, newJob]);
      setCreateBackupOpen(false);
      
      // Simulate job completion
      setTimeout(() => {
        setActiveJobs(prev => prev.filter(job => job.id !== newJob.id));
        loadBackups();
      }, 10000);
      
    } catch (err) {
      setError('Failed to create backup');
    }
  };

  const handleRestoreBackup = async (backupId: string, options: any) => {
    try {
      setError(null);
      
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Add new job
      const newJob: BackupJob = {
        id: Date.now().toString(),
        type: 'restore',
        status: 'pending',
        progress: 0,
        startedAt: new Date().toISOString(),
        target: {
          serverId: serverId || '1',
          serverName: serverName || 'Test Valheim Server',
          pluginIds: selectedBackup?.pluginIds || []
        }
      };
      
      setActiveJobs(prev => [...prev, newJob]);
      setRestoreModalOpen(false);
      setSelectedBackup(null);
      
      // Simulate job completion
      setTimeout(() => {
        setActiveJobs(prev => prev.filter(job => job.id !== newJob.id));
      }, 8000);
      
    } catch (err) {
      setError('Failed to restore backup');
    }
  };

  const handleDeleteBackup = async (backupId: string) => {
    if (!confirm('Are you sure you want to delete this backup? This action cannot be undone.')) {
      return;
    }
    
    try {
      setError(null);
      
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setBackups(prev => prev.filter(backup => backup.id !== backupId));
      
    } catch (err) {
      setError('Failed to delete backup');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'full': return <Archive className="w-4 h-4 text-blue-500" />;
      case 'configurations': return <Settings className="w-4 h-4 text-green-500" />;
      case 'data': return <Database className="w-4 h-4 text-purple-500" />;
      case 'custom': return <Package className="w-4 h-4 text-orange-500" />;
      default: return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-500';
      case 'failed': return 'text-red-500';
      case 'in_progress': return 'text-yellow-500';
      default: return 'text-gray-500';
    }
  };

  const filteredBackups = backups.filter(backup => {
    const matchesSearch = !searchTerm || 
      backup.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      backup.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = backupTypeFilter === 'all' || backup.type === backupTypeFilter;
    
    return matchesSearch && matchesType;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" text="Loading backups..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Plugin Backup & Restore</h2>
          <p className="text-gray-400">
            {serverId ? `Manage backups for ${serverName}` : 'Manage backups across all servers'}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCreateBackupOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Archive className="w-4 h-4" />
            Create Backup
          </button>
          
          <button
            onClick={loadBackups}
            className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Active Jobs */}
      {activeJobs.length > 0 && (
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-3">Active Operations</h3>
          <div className="space-y-3">
            {activeJobs.map((job) => (
              <div key={job.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                <div className="flex items-center gap-3">
                  {job.type === 'backup' ? (
                    <Archive className="w-5 h-5 text-blue-500" />
                  ) : (
                    <RotateCcw className="w-5 h-5 text-green-500" />
                  )}
                  <div>
                    <h4 className="font-medium text-white">
                      {job.type === 'backup' ? 'Creating Backup' : 'Restoring Backup'}
                    </h4>
                    <p className="text-sm text-gray-400">{job.target.serverName}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-sm font-medium text-white">{job.progress}%</div>
                    <div className="text-xs text-gray-400">{job.status}</div>
                  </div>
                  <div className="w-20 h-2 bg-gray-600 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${
                        job.status === 'failed' ? 'bg-red-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${job.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-900 border border-red-700 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <span className="text-red-300">{error}</span>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search backups..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
          />
        </div>
        
        <select
          value={backupTypeFilter}
          onChange={(e) => setBackupTypeFilter(e.target.value)}
          className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
        >
          <option value="all">All Types</option>
          <option value="full">Full Backup</option>
          <option value="configurations">Configurations</option>
          <option value="data">Data Only</option>
          <option value="custom">Custom</option>
        </select>
      </div>

      {/* Backup List */}
      <div className="space-y-4">
        {filteredBackups.map((backup) => (
          <div key={backup.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center">
                  {getTypeIcon(backup.type)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-white">{backup.name}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(backup.status)}`}>
                      {backup.status}
                    </span>
                  </div>
                  
                  <p className="text-gray-400 mb-2">{backup.description}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-300">
                    <div className="flex items-center gap-1">
                      <Package className="w-4 h-4" />
                      <span>{backup.metadata.pluginCount} plugins</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <HardDrive className="w-4 h-4" />
                      <span>{formatFileSize(backup.size)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(backup.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>by {backup.createdBy}</span>
                    </div>
                  </div>
                  
                  {backup.pluginNames.length > 0 && (
                    <div className="mt-3">
                      <div className="flex flex-wrap gap-1">
                        {backup.pluginNames.slice(0, 3).map((name, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded">
                            {name}
                          </span>
                        ))}
                        {backup.pluginNames.length > 3 && (
                          <span className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded">
                            +{backup.pluginNames.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setSelectedBackup(backup);
                    setRestoreModalOpen(true);
                  }}
                  className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Restore
                </button>
                
                <button
                  onClick={() => {
                    // Mock download
                    const blob = new Blob(['Mock backup file'], { type: 'application/octet-stream' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${backup.name}.backup`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
                
                <button
                  onClick={() => handleDeleteBackup(backup.id)}
                  className="flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredBackups.length === 0 && (
        <div className="text-center py-12">
          <Archive className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-400 mb-2">No backups found</h3>
          <p className="text-gray-500">
            {backups.length === 0 
              ? 'No backups have been created yet. Create your first backup to get started.'
              : 'No backups match your current filters.'
            }
          </p>
        </div>
      )}

      {/* Create Backup Modal */}
      <CreateBackupModal
        isOpen={createBackupOpen}
        onClose={() => setCreateBackupOpen(false)}
        onCreateBackup={handleCreateBackup}
        serverId={serverId}
        serverName={serverName}
        pluginId={pluginId}
      />

      {/* Restore Modal */}
      <RestoreBackupModal
        isOpen={restoreModalOpen}
        onClose={() => {
          setRestoreModalOpen(false);
          setSelectedBackup(null);
        }}
        onRestoreBackup={handleRestoreBackup}
        backup={selectedBackup}
      />
    </div>
  );
}

// Create Backup Modal Component
function CreateBackupModal({ 
  isOpen, 
  onClose, 
  onCreateBackup, 
  serverId, 
  serverName, 
  pluginId 
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreateBackup: (config: any) => void;
  serverId?: string;
  serverName?: string;
  pluginId?: string;
}) {
  const [backupName, setBackupName] = useState('');
  const [backupDescription, setBackupDescription] = useState('');
  const [backupType, setBackupType] = useState<'full' | 'configurations' | 'data' | 'custom'>('full');
  const [selectedPlugins, setSelectedPlugins] = useState<string[]>([]);
  const [includeConfigurations, setIncludeConfigurations] = useState(true);
  const [includeData, setIncludeData] = useState(true);
  const [creating, setCreating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!backupName.trim()) {
      alert('Please enter a backup name');
      return;
    }
    
    setCreating(true);
    
    try {
      await onCreateBackup({
        name: backupName.trim(),
        description: backupDescription.trim(),
        type: backupType,
        serverId,
        pluginIds: selectedPlugins,
        includeConfigurations,
        includeData
      });
      
      // Reset form
      setBackupName('');
      setBackupDescription('');
      setBackupType('full');
      setSelectedPlugins([]);
      setIncludeConfigurations(true);
      setIncludeData(true);
    } finally {
      setCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-75" onClick={onClose} />

        <div className="inline-block w-full max-w-md px-6 py-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-gray-800 border border-gray-700 shadow-xl rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-white">Create Backup</h3>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Backup Name
              </label>
              <input
                type="text"
                value={backupName}
                onChange={(e) => setBackupName(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                placeholder="Enter backup name..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={backupDescription}
                onChange={(e) => setBackupDescription(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                placeholder="Describe this backup..."
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Backup Type
              </label>
              <select
                value={backupType}
                onChange={(e) => setBackupType(e.target.value as any)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="full">Full Backup</option>
                <option value="configurations">Configurations Only</option>
                <option value="data">Data Only</option>
                <option value="custom">Custom Selection</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={includeConfigurations}
                  onChange={(e) => setIncludeConfigurations(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-300">Include plugin configurations</span>
              </label>
              
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={includeData}
                  onChange={(e) => setIncludeData(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-300">Include plugin data</span>
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-400 hover:text-white border border-gray-600 hover:border-gray-500 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Create Backup
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Restore Backup Modal Component
function RestoreBackupModal({ 
  isOpen, 
  onClose, 
  onRestoreBackup, 
  backup 
}: {
  isOpen: boolean;
  onClose: () => void;
  onRestoreBackup: (backupId: string, options: any) => void;
  backup: BackupEntry | null;
}) {
  const [restoreConfigurations, setRestoreConfigurations] = useState(true);
  const [restoreData, setRestoreData] = useState(true);
  const [overwriteExisting, setOverwriteExisting] = useState(false);
  const [restoring, setRestoring] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!backup) return;
    
    if (!confirm('Are you sure you want to restore this backup? This will modify your current plugin configurations.')) {
      return;
    }
    
    setRestoring(true);
    
    try {
      await onRestoreBackup(backup.id, {
        restoreConfigurations,
        restoreData,
        overwriteExisting
      });
    } finally {
      setRestoring(false);
    }
  };

  if (!isOpen || !backup) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-75" onClick={onClose} />

        <div className="inline-block w-full max-w-md px-6 py-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-gray-800 border border-gray-700 shadow-xl rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-white">Restore Backup</h3>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mb-4 p-4 bg-gray-700 rounded-lg">
            <h4 className="font-medium text-white mb-2">{backup.name}</h4>
            <p className="text-sm text-gray-300">{backup.description}</p>
            <div className="mt-2 text-xs text-gray-400">
              Created: {new Date(backup.createdAt).toLocaleString()}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-yellow-900 border border-yellow-700 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-medium text-yellow-300">Warning</span>
              </div>
              <p className="text-sm text-yellow-200">
                Restoring this backup will modify your current plugin configurations. Make sure to create a backup of your current state if needed.
              </p>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={restoreConfigurations}
                  onChange={(e) => setRestoreConfigurations(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-300">Restore plugin configurations</span>
              </label>
              
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={restoreData}
                  onChange={(e) => setRestoreData(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-300">Restore plugin data</span>
              </label>
              
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={overwriteExisting}
                  onChange={(e) => setOverwriteExisting(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-300">Overwrite existing configurations</span>
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-400 hover:text-white border border-gray-600 hover:border-gray-500 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={restoring}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {restoring ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RotateCcw className="w-4 h-4" />
                )}
                Restore Backup
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}