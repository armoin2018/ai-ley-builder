import type { FlowStoreItem, FlowStoreSettings } from '../types/settings';

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

export class FlowStoreService {
  private static readonly CACHE_KEY_PREFIX = 'flow-store-';
  private static readonly INSTALLED_FLOWS_KEY = 'installed-flows';

  /**
   * Fetch flows from GitHub repository
   */
  static async fetchFlows(
    settings: FlowStoreSettings
  ): Promise<FlowStoreItem[]> {
    if (!settings.enabled) {
      throw new Error('Flow store is disabled');
    }

    // Check cache first
    const cacheKey = `${this.CACHE_KEY_PREFIX}${settings.storeUrl}`;
    const cached = this.getFromCache(cacheKey, settings.cacheDuration);
    if (cached) {
      return cached;
    }

    try {
      const flows = await this.fetchFlowsFromGitHub(settings.storeUrl);

      // Cache the results
      this.saveToCache(cacheKey, flows);

      return flows;
    } catch (error) {
      console.error('Failed to fetch flows from store:', error);
      throw new Error(
        `Failed to fetch flows: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Install a flow from the store
   */
  static async installFlow(flow: FlowStoreItem): Promise<boolean> {
    try {
      // Download flow definition
      const response = await fetch(flow.downloadUrl);
      if (!response.ok) {
        throw new Error(`Failed to download flow: ${response.statusText}`);
      }

      const flowDefinition = await response.text();

      // Store flow definition in localStorage
      const flowKey = `flow-definition-${flow.id}`;
      localStorage.setItem(flowKey, flowDefinition);

      // Update installed flows list
      this.addToInstalledFlows(flow);

      console.log(`Flow "${flow.name}" installed successfully`);
      return true;
    } catch (error) {
      console.error(`Failed to install flow "${flow.name}":`, error);
      throw new Error(
        `Installation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Uninstall a flow
   */
  static uninstallFlow(flowId: string): boolean {
    try {
      // Remove flow definition
      const flowKey = `flow-definition-${flowId}`;
      localStorage.removeItem(flowKey);

      // Update installed flows list
      this.removeFromInstalledFlows(flowId);

      console.log(`Flow "${flowId}" uninstalled successfully`);
      return true;
    } catch (error) {
      console.error(`Failed to uninstall flow "${flowId}":`, error);
      return false;
    }
  }

  /**
   * Enable/disable a flow
   */
  static toggleFlowEnabled(flowId: string, enabled: boolean): void {
    const installedFlows = this.getInstalledFlows();
    const flowIndex = installedFlows.findIndex(f => f.id === flowId);

    if (flowIndex !== -1) {
      installedFlows[flowIndex].enabled = enabled;
      localStorage.setItem(
        this.INSTALLED_FLOWS_KEY,
        JSON.stringify(installedFlows)
      );
    }
  }

  /**
   * Get list of installed flows
   */
  static getInstalledFlows(): FlowStoreItem[] {
    try {
      const stored = localStorage.getItem(this.INSTALLED_FLOWS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  /**
   * Get flow definition by ID
   */
  static getFlowDefinition(flowId: string): string | null {
    const flowKey = `flow-definition-${flowId}`;
    return localStorage.getItem(flowKey);
  }

  /**
   * Import a flow into the current workspace
   */
  static async importFlow(
    flowId: string
  ): Promise<{ nodes: any[]; edges: any[] }> {
    const flowDefinition = this.getFlowDefinition(flowId);
    if (!flowDefinition) {
      throw new Error('Flow not found');
    }

    try {
      // Parse PlantUML to React Flow format
      // This would use the existing PlantUML parser
      const { parsePlantUMLToFlow } = await import('../utils/plantuml-parser');
      const result = parsePlantUMLToFlow(flowDefinition);

      console.log(`Flow "${flowId}" imported successfully`);
      return result;
    } catch (error) {
      console.error(`Failed to import flow "${flowId}":`, error);
      throw new Error(
        `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Share a flow (create GitHub gist or similar)
   */
  static async shareFlow(
    flow: FlowStoreItem,
    flowDefinition: string
  ): Promise<string> {
    // This would integrate with GitHub API to create a gist
    // For now, we'll return a mock URL
    console.log('Sharing flow:', flow.name);
    return `https://gist.github.com/shared-flow-${flow.id}`;
  }

  /**
   * Copy a flow for editing
   */
  static copyFlow(originalFlow: FlowStoreItem): FlowStoreItem {
    const copiedFlow: FlowStoreItem = {
      ...originalFlow,
      id: `${originalFlow.id}-copy-${Date.now()}`,
      name: `${originalFlow.name} (Copy)`,
      version: '1.0.0',
      author: 'User',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      downloads: 0,
      rating: 0,
      installed: false,
      enabled: false,
    };

    return copiedFlow;
  }

  /**
   * Search flows by name, description, or tags
   */
  static searchFlows(flows: FlowStoreItem[], query: string): FlowStoreItem[] {
    const lowerQuery = query.toLowerCase();
    return flows.filter(
      flow =>
        flow.name.toLowerCase().includes(lowerQuery) ||
        flow.description.toLowerCase().includes(lowerQuery) ||
        flow.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
        flow.category.toLowerCase().includes(lowerQuery) ||
        flow.flowType.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Filter flows by category
   */
  static filterFlowsByCategory(
    flows: FlowStoreItem[],
    category: string
  ): FlowStoreItem[] {
    if (category === 'all') return flows;
    return flows.filter(flow => flow.category === category);
  }

  /**
   * Filter flows by complexity
   */
  static filterFlowsByComplexity(
    flows: FlowStoreItem[],
    complexity: string
  ): FlowStoreItem[] {
    if (complexity === 'all') return flows;
    return flows.filter(flow => flow.complexity === complexity);
  }

  /**
   * Get unique categories from flows
   */
  static getCategories(flows: FlowStoreItem[]): string[] {
    const categories = new Set(flows.map(flow => flow.category));
    return Array.from(categories).sort();
  }

  /**
   * Get unique flow types from flows
   */
  static getFlowTypes(flows: FlowStoreItem[]): string[] {
    const types = new Set(flows.map(flow => flow.flowType));
    return Array.from(types).sort();
  }

  // Private helper methods

  private static async fetchFlowsFromGitHub(
    repoUrl: string
  ): Promise<FlowStoreItem[]> {
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

    // Fetch repository contents (looking for flows directory)
    const contentsResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/flows`
    );
    let files: GitHubFile[] = [];

    if (contentsResponse.ok) {
      files = await contentsResponse.json();
    } else {
      // Fallback: look for .puml files in root
      const rootResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents`
      );
      if (rootResponse.ok) {
        const rootFiles: GitHubFile[] = await rootResponse.json();
        files = rootFiles.filter(
          f => f.name.endsWith('.puml') || f.name.endsWith('.plantuml')
        );
      }
    }

    // Convert GitHub files to FlowStoreItems
    const flows: FlowStoreItem[] = await Promise.all(
      files
        .filter(
          file =>
            file.type === 'file' &&
            (file.name.endsWith('.puml') ||
              file.name.endsWith('.plantuml') ||
              file.name.endsWith('.json'))
        )
        .map(async file => {
          try {
            // Fetch file content to extract metadata
            const fileResponse = await fetch(file.download_url);
            const content = await fileResponse.text();

            let flowData: any = {};

            if (file.name.endsWith('.json')) {
              flowData = JSON.parse(content);
            } else {
              // Parse PlantUML comments for metadata
              flowData = this.parseFlowMetadata(content);
            }

            // Analyze flow complexity
            const complexity = this.analyzeFlowComplexity(content);

            const installedFlows = this.getInstalledFlows();
            const isInstalled = installedFlows.some(
              f => f.id === flowData.id || f.id === file.name
            );
            const installedFlow = installedFlows.find(
              f => f.id === flowData.id || f.id === file.name
            );

            return {
              id:
                flowData.id || file.name.replace(/\.(puml|plantuml|json)$/, ''),
              name:
                flowData.name ||
                file.name.replace(/\.(puml|plantuml|json)$/, ''),
              description: flowData.description || 'No description available',
              version: flowData.version || '1.0.0',
              author: flowData.author || owner,
              tags: flowData.tags || [],
              downloadUrl: file.download_url,
              thumbnailUrl: flowData.thumbnailUrl,
              createdAt: repoData.created_at,
              updatedAt: repoData.updated_at,
              downloads: repoData.stargazers_count || 0,
              rating:
                Math.min(5, Math.max(0, repoData.stargazers_count / 10)) || 0,
              enabled: installedFlow?.enabled || false,
              installed: isInstalled,
              flowType: flowData.flowType || 'workflow',
              category: flowData.category || 'general',
              nodes: flowData.nodes || [],
              connections: flowData.connections || 0,
              complexity,
            } as FlowStoreItem;
          } catch (error) {
            console.warn(`Failed to parse flow file ${file.name}:`, error);
            return null;
          }
        })
    );

    return flows.filter(flow => flow !== null);
  }

  private static parseFlowMetadata(content: string): any {
    const metadata: any = {};

    // Extract metadata from PlantUML comments
    const lines = content.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();

      if (trimmed.startsWith("' @name:")) {
        metadata.name = trimmed.replace("' @name:", '').trim();
      } else if (trimmed.startsWith("' @description:")) {
        metadata.description = trimmed.replace("' @description:", '').trim();
      } else if (trimmed.startsWith("' @author:")) {
        metadata.author = trimmed.replace("' @author:", '').trim();
      } else if (trimmed.startsWith("' @version:")) {
        metadata.version = trimmed.replace("' @version:", '').trim();
      } else if (trimmed.startsWith("' @tags:")) {
        metadata.tags = trimmed
          .replace("' @tags:", '')
          .trim()
          .split(',')
          .map(t => t.trim());
      } else if (trimmed.startsWith("' @category:")) {
        metadata.category = trimmed.replace("' @category:", '').trim();
      } else if (trimmed.startsWith("' @flowType:")) {
        metadata.flowType = trimmed.replace("' @flowType:", '').trim();
      }
    }

    // Count nodes and connections
    const nodeMatches = content.match(/^\s*[a-zA-Z_][a-zA-Z0-9_]*\s*:/gm);
    const connectionMatches = content.match(/-->/g);

    metadata.nodes = nodeMatches ? nodeMatches.length : 0;
    metadata.connections = connectionMatches ? connectionMatches.length : 0;

    return metadata;
  }

  private static analyzeFlowComplexity(
    content: string
  ): 'simple' | 'medium' | 'complex' {
    const lines = content.split('\n').length;
    const nodes = (content.match(/^\s*[a-zA-Z_][a-zA-Z0-9_]*\s*:/gm) || [])
      .length;
    const connections = (content.match(/-->/g) || []).length;

    if (lines < 20 && nodes < 5 && connections < 5) {
      return 'simple';
    } else if (lines < 50 && nodes < 15 && connections < 15) {
      return 'medium';
    } else {
      return 'complex';
    }
  }

  private static getFromCache(
    key: string,
    durationMinutes: number
  ): FlowStoreItem[] | null {
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

  private static saveToCache(key: string, data: FlowStoreItem[]): void {
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

  private static addToInstalledFlows(flow: FlowStoreItem): void {
    const installedFlows = this.getInstalledFlows();
    const existingIndex = installedFlows.findIndex(f => f.id === flow.id);

    const flowToAdd = { ...flow, installed: true };

    if (existingIndex !== -1) {
      installedFlows[existingIndex] = flowToAdd;
    } else {
      installedFlows.push(flowToAdd);
    }

    localStorage.setItem(
      this.INSTALLED_FLOWS_KEY,
      JSON.stringify(installedFlows)
    );
  }

  private static removeFromInstalledFlows(flowId: string): void {
    const installedFlows = this.getInstalledFlows();
    const filteredFlows = installedFlows.filter(f => f.id !== flowId);
    localStorage.setItem(
      this.INSTALLED_FLOWS_KEY,
      JSON.stringify(filteredFlows)
    );
  }
}
