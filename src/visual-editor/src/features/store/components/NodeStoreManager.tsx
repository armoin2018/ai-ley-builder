import {
  Calendar,
  Copy,
  Download,
  ExternalLink,
  Package,
  Power,
  RefreshCw,
  Search,
  Share,
  Star,
  Trash2,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSettings } from '../../../hooks/useSettings';
import { NodeStoreService } from '../../../services/nodeStoreService';
import { Badge, Button, Input } from '../../../shared/components';
import type { NodeStoreItem } from '../../../types/settings';
import { cn } from '../../../utils';

interface NodeStoreManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NodeStoreManager({ isOpen, onClose }: NodeStoreManagerProps) {
  const { settings } = useSettings();
  const [nodes, setNodes] = useState<NodeStoreItem[]>([]);
  const [filteredNodes, setFilteredNodes] = useState<NodeStoreItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showInstalled, setShowInstalled] = useState(false);

  // Load nodes on mount and when store URL changes
  useEffect(() => {
    if (isOpen && settings.nodeStore.enabled) {
      loadNodes();
    }
  }, [isOpen, settings.nodeStore]);

  // Filter nodes based on search and category
  useEffect(() => {
    let filtered = nodes;

    if (searchQuery) {
      filtered = NodeStoreService.searchNodes(filtered, searchQuery);
    }

    if (selectedCategory !== 'all') {
      filtered = NodeStoreService.filterNodesByCategory(
        filtered,
        selectedCategory
      );
    }

    if (showInstalled) {
      filtered = filtered.filter(node => node.installed);
    }

    setFilteredNodes(filtered);
  }, [nodes, searchQuery, selectedCategory, showInstalled]);

  const loadNodes = async () => {
    setLoading(true);
    setError(null);

    try {
      const fetchedNodes = await NodeStoreService.fetchNodes(
        settings.nodeStore
      );

      // Merge with installed nodes to get current status
      const installedNodes = NodeStoreService.getInstalledNodes();
      const mergedNodes = fetchedNodes.map(node => {
        const installedNode = installedNodes.find(n => n.id === node.id);
        return {
          ...node,
          installed: !!installedNode,
          enabled: installedNode?.enabled || false,
        };
      });

      setNodes(mergedNodes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load nodes');
    } finally {
      setLoading(false);
    }
  };

  const handleInstallNode = async (node: NodeStoreItem) => {
    try {
      await NodeStoreService.installNode(node);
      // Reload to update status
      loadNodes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to install node');
    }
  };

  const handleUninstallNode = async (nodeId: string) => {
    if (!confirm('Are you sure you want to uninstall this node?')) return;

    try {
      NodeStoreService.uninstallNode(nodeId);
      loadNodes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to uninstall node');
    }
  };

  const handleToggleEnabled = (nodeId: string, enabled: boolean) => {
    NodeStoreService.toggleNodeEnabled(nodeId, enabled);
    loadNodes();
  };

  const handleCopyNode = (node: NodeStoreItem) => {
    const copiedNode = NodeStoreService.copyNode(node);
    console.log('Node copied for editing:', copiedNode);
    // This would open the node editor with the copied node
  };

  const handleShareNode = async (node: NodeStoreItem) => {
    try {
      const nodeDefinition = NodeStoreService.getNodeDefinition(node.id);
      if (!nodeDefinition) {
        throw new Error('Node definition not found');
      }

      const shareUrl = await NodeStoreService.shareNode(node, nodeDefinition);
      // Copy to clipboard or show share dialog
      navigator.clipboard?.writeText(shareUrl);
      alert('Share URL copied to clipboard!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to share node');
    }
  };

  const categories = NodeStoreService.getCategories(nodes);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-5/6 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <Package className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-slate-900">
                Node Store
              </h2>
              <p className="text-sm text-slate-600">
                Browse, download, and manage custom nodes
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
              placeholder="Search nodes..."
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

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="show-installed"
              checked={showInstalled}
              onChange={e => setShowInstalled(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
            />
            <label htmlFor="show-installed" className="text-sm text-slate-700">
              Installed only
            </label>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={loadNodes}
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
                Loading nodes...
              </div>
            </div>
          ) : filteredNodes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-500">
              <Package className="w-16 h-16 mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No nodes found</h3>
              <p className="text-sm text-center">
                {searchQuery || selectedCategory !== 'all' || showInstalled
                  ? 'Try adjusting your filters'
                  : 'No nodes available in the store'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredNodes.map(node => (
                <div
                  key={node.id}
                  className="border border-slate-200 rounded-lg p-4 hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 mb-1">
                        {node.name}
                      </h3>
                      <p className="text-xs text-slate-500 mb-2">
                        v{node.version} by {node.author}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm text-slate-600">
                        {node.rating.toFixed(1)}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                    {node.description}
                  </p>

                  <div className="flex flex-wrap gap-1 mb-3">
                    <Badge variant="outline" className="text-xs">
                      {node.category}
                    </Badge>
                    {node.tags.slice(0, 2).map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {node.tags.length > 2 && (
                      <Badge variant="secondary" className="text-xs">
                        +{node.tags.length - 2}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                    <div className="flex items-center gap-1">
                      <Download className="w-3 h-3" />
                      {node.downloads}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(node.updatedAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!node.installed ? (
                      <Button
                        size="sm"
                        onClick={() => handleInstallNode(node)}
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
                            handleToggleEnabled(node.id, !node.enabled)
                          }
                          className={cn(
                            'flex items-center gap-1',
                            node.enabled
                              ? 'text-green-600 border-green-200'
                              : 'text-slate-600'
                          )}
                        >
                          <Power className="w-3 h-3" />
                          {node.enabled ? 'On' : 'Off'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUninstallNode(node.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    )}

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyNode(node)}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>

                    {node.installed && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleShareNode(node)}
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
            {filteredNodes.length} nodes •{' '}
            {filteredNodes.filter(n => n.installed).length} installed
          </div>
          <div className="flex items-center gap-2">
            <a
              href={settings.nodeStore.storeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
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
