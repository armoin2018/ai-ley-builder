import type { NodeStoreItem, NodeStoreSettings } from '../types/settings';

interface GitHubFile {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string;
  type: string;
}

interface GitHubRepo {
  name: string;
  full_name: string;
  html_url: string;
  description: string;
  created_at: string;
  updated_at: string;
  stargazers_count: number;
}

export class NodeStoreService {
  private static readonly CACHE_KEY_PREFIX = 'node-store-';
  private static readonly INSTALLED_NODES_KEY = 'installed-nodes';

  /**
   * Fetch nodes from GitHub repository
   */
  static async fetchNodes(
    settings: NodeStoreSettings
  ): Promise<NodeStoreItem[]> {
    if (!settings.enabled) {
      throw new Error('Node store is disabled');
    }

    // Check cache first
    const cacheKey = `${this.CACHE_KEY_PREFIX}${settings.storeUrl}`;
    const cached = this.getFromCache(cacheKey, settings.cacheDuration);
    if (cached) {
      return cached;
    }

    try {
      const nodes = await this.fetchNodesFromGitHub(settings.storeUrl);

      // Cache the results
      this.saveToCache(cacheKey, nodes);

      return nodes;
    } catch (error) {
      console.error('Failed to fetch nodes from store:', error);
      throw new Error(
        `Failed to fetch nodes: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Install a node from the store
   */
  static async installNode(node: NodeStoreItem): Promise<boolean> {
    try {
      // Download node definition
      const response = await fetch(node.downloadUrl);
      if (!response.ok) {
        throw new Error(`Failed to download node: ${response.statusText}`);
      }

      const nodeDefinition = await response.text();

      // Store node definition in localStorage
      const nodeKey = `node-definition-${node.id}`;
      localStorage.setItem(nodeKey, nodeDefinition);

      // Update installed nodes list
      this.addToInstalledNodes(node);

      console.log(`Node "${node.name}" installed successfully`);
      return true;
    } catch (error) {
      console.error(`Failed to install node "${node.name}":`, error);
      throw new Error(
        `Installation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Uninstall a node
   */
  static uninstallNode(nodeId: string): boolean {
    try {
      // Remove node definition
      const nodeKey = `node-definition-${nodeId}`;
      localStorage.removeItem(nodeKey);

      // Update installed nodes list
      this.removeFromInstalledNodes(nodeId);

      console.log(`Node "${nodeId}" uninstalled successfully`);
      return true;
    } catch (error) {
      console.error(`Failed to uninstall node "${nodeId}":`, error);
      return false;
    }
  }

  /**
   * Enable/disable a node
   */
  static toggleNodeEnabled(nodeId: string, enabled: boolean): void {
    const installedNodes = this.getInstalledNodes();
    const nodeIndex = installedNodes.findIndex(n => n.id === nodeId);

    if (nodeIndex !== -1) {
      installedNodes[nodeIndex].enabled = enabled;
      localStorage.setItem(
        this.INSTALLED_NODES_KEY,
        JSON.stringify(installedNodes)
      );
    }
  }

  /**
   * Get list of installed nodes
   */
  static getInstalledNodes(): NodeStoreItem[] {
    try {
      const stored = localStorage.getItem(this.INSTALLED_NODES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  /**
   * Get node definition by ID
   */
  static getNodeDefinition(nodeId: string): string | null {
    const nodeKey = `node-definition-${nodeId}`;
    return localStorage.getItem(nodeKey);
  }

  /**
   * Share a node (create GitHub gist or similar)
   */
  static async shareNode(
    node: NodeStoreItem,
    nodeDefinition: string
  ): Promise<string> {
    // This would integrate with GitHub API to create a gist
    // For now, we'll return a mock URL
    console.log('Sharing node:', node.name);
    return `https://gist.github.com/shared-node-${node.id}`;
  }

  /**
   * Copy a node for editing
   */
  static copyNode(originalNode: NodeStoreItem): NodeStoreItem {
    const copiedNode: NodeStoreItem = {
      ...originalNode,
      id: `${originalNode.id}-copy-${Date.now()}`,
      name: `${originalNode.name} (Copy)`,
      version: '1.0.0',
      author: 'User',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      downloads: 0,
      rating: 0,
      installed: false,
      enabled: false,
    };

    return copiedNode;
  }

  /**
   * Search nodes by name, description, or tags
   */
  static searchNodes(nodes: NodeStoreItem[], query: string): NodeStoreItem[] {
    const lowerQuery = query.toLowerCase();
    return nodes.filter(
      node =>
        node.name.toLowerCase().includes(lowerQuery) ||
        node.description.toLowerCase().includes(lowerQuery) ||
        node.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
        node.category.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Filter nodes by category
   */
  static filterNodesByCategory(
    nodes: NodeStoreItem[],
    category: string
  ): NodeStoreItem[] {
    if (category === 'all') return nodes;
    return nodes.filter(node => node.category === category);
  }

  /**
   * Get unique categories from nodes
   */
  static getCategories(nodes: NodeStoreItem[]): string[] {
    const categories = new Set(nodes.map(node => node.category));
    return Array.from(categories).sort();
  }

  // Private helper methods

  private static async fetchNodesFromGitHub(
    repoUrl: string
  ): Promise<NodeStoreItem[]> {
    // Parse GitHub URL to extract owner/repo
    const urlParts = repoUrl.replace('https://github.com/', '').split('/');
    const owner = urlParts[0];
    const repo = urlParts[1];

    if (!owner || !repo) {
      throw new Error('Invalid GitHub repository URL');
    }

    // Fetch repository info
    const repoResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}`
    );
    if (!repoResponse.ok) {
      throw new Error('Repository not found');
    }

    const repoData: GitHubRepo = await repoResponse.json();

    // Fetch repository contents (looking for nodes directory)
    const contentsResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/nodes`
    );
    let files: GitHubFile[] = [];

    if (contentsResponse.ok) {
      files = await contentsResponse.json();
    } else {
      // Fallback: look for .json files in root
      const rootResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents`
      );
      if (rootResponse.ok) {
        const rootFiles: GitHubFile[] = await rootResponse.json();
        files = rootFiles.filter(f => f.name.endsWith('.json'));
      }
    }

    // Convert GitHub files to NodeStoreItems
    const nodes: NodeStoreItem[] = await Promise.all(
      files
        .filter(file => file.type === 'file' && file.name.endsWith('.json'))
        .map(async file => {
          try {
            // Fetch file content to extract metadata
            const fileResponse = await fetch(file.download_url);
            const content = await fileResponse.text();
            const nodeData = JSON.parse(content);

            const installedNodes = this.getInstalledNodes();
            const isInstalled = installedNodes.some(n => n.id === nodeData.id);
            const installedNode = installedNodes.find(
              n => n.id === nodeData.id
            );

            return {
              id: nodeData.id || file.name.replace('.json', ''),
              name: nodeData.name || file.name.replace('.json', ''),
              description: nodeData.description || 'No description available',
              version: nodeData.version || '1.0.0',
              author: nodeData.author || owner,
              tags: nodeData.tags || [],
              downloadUrl: file.download_url,
              thumbnailUrl: nodeData.thumbnailUrl,
              createdAt: repoData.created_at,
              updatedAt: repoData.updated_at,
              downloads: repoData.stargazers_count || 0,
              rating:
                Math.min(5, Math.max(0, repoData.stargazers_count / 10)) || 0,
              enabled: installedNode?.enabled || false,
              installed: isInstalled,
              nodeType: nodeData.nodeType || 'custom',
              category: nodeData.category || 'general',
              inputs: nodeData.inputs || [],
              outputs: nodeData.outputs || [],
              configuration: nodeData.configuration || {},
            } as NodeStoreItem;
          } catch (error) {
            console.warn(`Failed to parse node file ${file.name}:`, error);
            return null;
          }
        })
    );

    return nodes.filter(node => node !== null);
  }

  private static getFromCache(
    key: string,
    durationMinutes: number
  ): NodeStoreItem[] | null {
    try {
      const cached = localStorage.getItem(key);
      if (!cached) return null;

      const { data, timestamp } = JSON.parse(cached);
      const now = Date.now();
      const maxAge = durationMinutes * 60 * 1000; // Convert to milliseconds

      if (now - timestamp > maxAge) {
        localStorage.removeItem(key);
        return null;
      }

      return data;
    } catch {
      return null;
    }
  }

  private static saveToCache(key: string, data: NodeStoreItem[]): void {
    try {
      const cacheData = {
        data,
        timestamp: Date.now(),
      };
      localStorage.setItem(key, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Failed to save to cache:', error);
    }
  }

  private static addToInstalledNodes(node: NodeStoreItem): void {
    const installedNodes = this.getInstalledNodes();
    const existingIndex = installedNodes.findIndex(n => n.id === node.id);

    const nodeToAdd = { ...node, installed: true };

    if (existingIndex !== -1) {
      installedNodes[existingIndex] = nodeToAdd;
    } else {
      installedNodes.push(nodeToAdd);
    }

    localStorage.setItem(
      this.INSTALLED_NODES_KEY,
      JSON.stringify(installedNodes)
    );
  }

  private static removeFromInstalledNodes(nodeId: string): void {
    const installedNodes = this.getInstalledNodes();
    const filteredNodes = installedNodes.filter(n => n.id !== nodeId);
    localStorage.setItem(
      this.INSTALLED_NODES_KEY,
      JSON.stringify(filteredNodes)
    );
  }
}
