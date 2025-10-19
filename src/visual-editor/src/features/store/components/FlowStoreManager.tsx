import React, { useEffect, useState } from 'react';
import {
  Activity,
  Calendar,
  Copy,
  Download,
  ExternalLink,
  GitBranch,
  Import,
  Layers,
  Power,
  RefreshCw,
  Search,
  Share,
  Star,
  Tag,
  Trash2,
  User,
} from 'lucide-react';
import { Badge, Button, Input } from '../../../shared/components';
import { cn } from '../../../utils';
import { useSettings } from '../../../hooks/useSettings';
import { FlowStoreService } from '../../../services/flowStoreService';
import type { FlowStoreItem } from '../../../types/settings';

interface FlowStoreManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onImportFlow?: (nodes: any[], edges: any[]) => void;
}

export function FlowStoreManager({
  isOpen,
  onClose,
  onImportFlow,
}: FlowStoreManagerProps) {
  const { settings } = useSettings();
  const [flows, setFlows] = useState<FlowStoreItem[]>([]);
  const [filteredFlows, setFilteredFlows] = useState<FlowStoreItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedComplexity, setSelectedComplexity] = useState('all');
  const [showInstalled, setShowInstalled] = useState(false);

  // Load flows on mount and when store URL changes
  useEffect(() => {
    if (isOpen && settings.flowStore.enabled) {
      loadFlows();
    }
  }, [isOpen, settings.flowStore]);

  // Filter flows based on search and filters
  useEffect(() => {
    let filtered = flows;

    if (searchQuery) {
      filtered = FlowStoreService.searchFlows(filtered, searchQuery);
    }

    if (selectedCategory !== 'all') {
      filtered = FlowStoreService.filterFlowsByCategory(
        filtered,
        selectedCategory
      );
    }

    if (selectedComplexity !== 'all') {
      filtered = FlowStoreService.filterFlowsByComplexity(
        filtered,
        selectedComplexity
      );
    }

    if (showInstalled) {
      filtered = filtered.filter(flow => flow.installed);
    }

    setFilteredFlows(filtered);
  }, [flows, searchQuery, selectedCategory, selectedComplexity, showInstalled]);

  const loadFlows = async () => {
    setLoading(true);
    setError(null);

    try {
      const fetchedFlows = await FlowStoreService.fetchFlows(
        settings.flowStore
      );

      // Merge with installed flows to get current status
      const installedFlows = FlowStoreService.getInstalledFlows();
      const mergedFlows = fetchedFlows.map(flow => {
        const installedFlow = installedFlows.find(f => f.id === flow.id);
        return {
          ...flow,
          installed: !!installedFlow,
          enabled: installedFlow?.enabled || false,
        };
      });

      setFlows(mergedFlows);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load flows');
    } finally {
      setLoading(false);
    }
  };

  const handleInstallFlow = async (flow: FlowStoreItem) => {
    try {
      await FlowStoreService.installFlow(flow);
      // Reload to update status
      loadFlows();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to install flow');
    }
  };

  const handleUninstallFlow = async (flowId: string) => {
    if (!confirm('Are you sure you want to uninstall this flow?')) return;

    try {
      FlowStoreService.uninstallFlow(flowId);
      loadFlows();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to uninstall flow');
    }
  };

  const handleToggleEnabled = (flowId: string, enabled: boolean) => {
    FlowStoreService.toggleFlowEnabled(flowId, enabled);
    loadFlows();
  };

  const handleImportFlow = async (flow: FlowStoreItem) => {
    try {
      const { nodes, edges } = await FlowStoreService.importFlow(flow.id);
      onImportFlow?.(nodes, edges);
      // Show success message
      alert(`Flow "${flow.name}" imported successfully!`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import flow');
    }
  };

  const handleCopyFlow = (flow: FlowStoreItem) => {
    const copiedFlow = FlowStoreService.copyFlow(flow);
    console.log('Flow copied for editing:', copiedFlow);
    // This would open the flow editor with the copied flow
  };

  const handleShareFlow = async (flow: FlowStoreItem) => {
    try {
      const flowDefinition = FlowStoreService.getFlowDefinition(flow.id);
      if (!flowDefinition) {
        throw new Error('Flow definition not found');
      }

      const shareUrl = await FlowStoreService.shareFlow(flow, flowDefinition);
      // Copy to clipboard or show share dialog
      navigator.clipboard?.writeText(shareUrl);
      alert('Share URL copied to clipboard!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to share flow');
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'simple':
        return 'text-green-600 bg-green-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'complex':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-slate-600 bg-slate-50';
    }
  };

  const categories = FlowStoreService.getCategories(flows);
  const complexityOptions = ['simple', 'medium', 'complex'];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-5/6 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <GitBranch className="w-6 h-6 text-green-600" />
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                Flow Store
              </h2>
              <p className="text-sm text-slate-600">
                Browse, download, and manage workflow templates
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ✕
          </Button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-4 p-4 border-b border-slate-200 bg-slate-50">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search flows..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10 pr-4"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-md text-sm"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <select
            value={selectedComplexity}
            onChange={e => setSelectedComplexity(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-md text-sm"
          >
            <option value="all">All Complexity</option>
            {complexityOptions.map(complexity => (
              <option key={complexity} value={complexity}>
                {complexity}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="show-installed-flows"
              checked={showInstalled}
              onChange={e => setShowInstalled(e.target.checked)}
              className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
            />
            <label
              htmlFor="show-installed-flows"
              className="text-sm text-slate-700"
            >
              Installed only
            </label>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={loadFlows}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
            Refresh
          </Button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-4 bg-red-50 border-b border-red-200">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="flex items-center gap-3 text-slate-600">
                <RefreshCw className="w-5 h-5 animate-spin" />
                Loading flows...
              </div>
            </div>
          ) : filteredFlows.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-500">
              <GitBranch className="w-16 h-16 mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No flows found</h3>
              <p className="text-sm text-center">
                {searchQuery ||
                selectedCategory !== 'all' ||
                selectedComplexity !== 'all' ||
                showInstalled
                  ? 'Try adjusting your filters'
                  : 'No flows available in the store'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFlows.map(flow => (
                <div
                  key={flow.id}
                  className="border border-slate-200 rounded-lg p-4 hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 mb-1">
                        {flow.name}
                      </h3>
                      <p className="text-xs text-slate-500 mb-2">
                        v{flow.version} by {flow.author}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm text-slate-600">
                        {flow.rating.toFixed(1)}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                    {flow.description}
                  </p>

                  <div className="flex flex-wrap gap-1 mb-3">
                    <Badge variant="outline" size="sm">
                      {flow.category}
                    </Badge>
                    <Badge
                      variant="secondary"
                      size="sm"
                      className={getComplexityColor(flow.complexity)}
                    >
                      {flow.complexity}
                    </Badge>
                    {flow.tags.slice(0, 1).map(tag => (
                      <Badge key={tag} variant="secondary" size="sm">
                        {tag}
                      </Badge>
                    ))}
                    {flow.tags.length > 1 && (
                      <Badge variant="secondary" size="sm">
                        +{flow.tags.length - 1}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Layers className="w-3 h-3" />
                        {flow.nodes.length || 0}
                      </div>
                      <div className="flex items-center gap-1">
                        <Activity className="w-3 h-3" />
                        {flow.connections}
                      </div>
                      <div className="flex items-center gap-1">
                        <Download className="w-3 h-3" />
                        {flow.downloads}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(flow.updatedAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!flow.installed ? (
                      <Button
                        size="sm"
                        onClick={() => handleInstallFlow(flow)}
                        className="flex-1"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Install
                      </Button>
                    ) : (
                      <div className="flex items-center gap-2 flex-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleToggleEnabled(flow.id, !flow.enabled)
                          }
                          className={cn(
                            'flex items-center gap-1',
                            flow.enabled
                              ? 'text-green-600 border-green-200'
                              : 'text-slate-600'
                          )}
                        >
                          <Power className="w-3 h-3" />
                          {flow.enabled ? 'On' : 'Off'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUninstallFlow(flow.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    )}

                    {flow.installed && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleImportFlow(flow)}
                        title="Import into workspace"
                      >
                        <Import className="w-3 h-3" />
                      </Button>
                    )}

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyFlow(flow)}
                      title="Copy for editing"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>

                    {flow.installed && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleShareFlow(flow)}
                        title="Share flow"
                      >
                        <Share className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-slate-200 bg-slate-50">
          <div className="text-sm text-slate-600">
            {filteredFlows.length} flows •{' '}
            {filteredFlows.filter(f => f.installed).length} installed
          </div>
          <div className="flex items-center gap-2">
            <a
              href={settings.flowStore.storeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-green-600 hover:text-green-700 flex items-center gap-1"
            >
              View Store
              <ExternalLink className="w-3 h-3" />
            </a>
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
