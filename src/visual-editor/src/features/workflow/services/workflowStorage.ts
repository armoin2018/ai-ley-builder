import type { SerializedWorkflow } from '../utils/serialization';
import { PlantUMLExporter } from '../../../utils/export';

// Storage interface for different storage providers
export interface WorkflowStorageProvider {
  save(workflow: SerializedWorkflow): Promise<string>;
  load(id: string): Promise<SerializedWorkflow>;
  list(): Promise<WorkflowMetadata[]>;
  delete(id: string): Promise<void>;
  exists(id: string): Promise<boolean>;
}

export interface WorkflowMetadata {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  nodeCount: number;
  edgeCount: number;
}

// Local Storage implementation
export class LocalStorageProvider implements WorkflowStorageProvider {
  private readonly prefix = 'ailey_workflow_';
  private readonly metadataKey = 'ailey_workflows_metadata';

  async save(workflow: SerializedWorkflow): Promise<string> {
    try {
      const key = this.prefix + workflow.id;
      const serialized = JSON.stringify(workflow);

      // Check storage quota
      if (this.getStorageSize() + serialized.length > this.getStorageQuota()) {
        throw new Error(
          'Storage quota exceeded. Please delete some workflows.'
        );
      }

      localStorage.setItem(key, serialized);
      await this.updateMetadata(workflow);

      return workflow.id;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to save workflow: ${error.message}`);
      }
      throw new Error('Failed to save workflow: Unknown error');
    }
  }

  async load(id: string): Promise<SerializedWorkflow> {
    const key = this.prefix + id;
    const stored = localStorage.getItem(key);

    if (!stored) {
      throw new Error(`Workflow not found: ${id}`);
    }

    try {
      return JSON.parse(stored);
    } catch (error) {
      throw new Error(`Failed to parse workflow: ${id}`);
    }
  }

  async list(): Promise<WorkflowMetadata[]> {
    const stored = localStorage.getItem(this.metadataKey);
    if (!stored) {
      return [];
    }

    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }

  async delete(id: string): Promise<void> {
    const key = this.prefix + id;
    localStorage.removeItem(key);
    await this.removeFromMetadata(id);
  }

  async exists(id: string): Promise<boolean> {
    const key = this.prefix + id;
    return localStorage.getItem(key) !== null;
  }

  private async updateMetadata(workflow: SerializedWorkflow): Promise<void> {
    const metadata = await this.list();
    const existingIndex = metadata.findIndex(item => item.id === workflow.id);

    const workflowMetadata: WorkflowMetadata = {
      id: workflow.id,
      name: workflow.name,
      description: workflow.description,
      createdAt: workflow.createdAt,
      updatedAt: workflow.updatedAt,
      nodeCount: workflow.metadata.nodeCount,
      edgeCount: workflow.metadata.edgeCount,
    };

    if (existingIndex >= 0) {
      metadata[existingIndex] = workflowMetadata;
    } else {
      metadata.push(workflowMetadata);
    }

    localStorage.setItem(this.metadataKey, JSON.stringify(metadata));
  }

  private async removeFromMetadata(id: string): Promise<void> {
    const metadata = await this.list();
    const filtered = metadata.filter(item => item.id !== id);
    localStorage.setItem(this.metadataKey, JSON.stringify(filtered));
  }

  private getStorageSize(): number {
    let total = 0;
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key) && key.startsWith(this.prefix)) {
        total += localStorage[key].length;
      }
    }
    return total;
  }

  private getStorageQuota(): number {
    // Conservative estimate of localStorage quota (5MB)
    return 5 * 1024 * 1024;
  }
}

// File System implementation (for local file operations)
export class FileSystemProvider implements WorkflowStorageProvider {
  async save(workflow: SerializedWorkflow): Promise<string> {
    const filename = `${workflow.name.replace(/[^a-zA-Z0-9]/g, '_')}_${workflow.id}.json`;
    const content = JSON.stringify(workflow, null, 2);

    // Create and trigger download
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return workflow.id;
  }

  async load(_id: string): Promise<SerializedWorkflow> {
    // This would typically open a file dialog
    throw new Error(
      'File loading not implemented - use importFromFile method instead'
    );
  }

  async list(): Promise<WorkflowMetadata[]> {
    // File system doesn't maintain a list
    return [];
  }

  async delete(_id: string): Promise<void> {
    throw new Error('File system deletion not supported');
  }

  async exists(_id: string): Promise<boolean> {
    return false; // Can't check file existence in browser
  }

  // Special method for file import
  importFromFile(): Promise<SerializedWorkflow> {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';

      input.onchange = event => {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (!file) {
          reject(new Error('No file selected'));
          return;
        }

        const reader = new FileReader();
        reader.onload = e => {
          try {
            const content = e.target?.result as string;
            const workflow = JSON.parse(content);
            resolve(workflow);
          } catch (error) {
            reject(new Error('Failed to parse workflow file'));
          }
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsText(file);
      };

      input.click();
    });
  }
}

// Main workflow storage service
export class WorkflowStorageService {
  private provider: WorkflowStorageProvider;

  constructor(provider: WorkflowStorageProvider = new LocalStorageProvider()) {
    this.provider = provider;
  }

  setProvider(provider: WorkflowStorageProvider) {
    this.provider = provider;
  }

  async saveWorkflow(workflow: SerializedWorkflow): Promise<string> {
    // Update the updatedAt timestamp
    const updatedWorkflow = {
      ...workflow,
      updatedAt: new Date().toISOString(),
    };

    return await this.provider.save(updatedWorkflow);
  }

  async loadWorkflow(id: string): Promise<SerializedWorkflow> {
    return await this.provider.load(id);
  }

  async listWorkflows(): Promise<WorkflowMetadata[]> {
    const workflows = await this.provider.list();
    // Sort by updated date (most recent first)
    return workflows.sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  async deleteWorkflow(id: string): Promise<void> {
    return await this.provider.delete(id);
  }

  async workflowExists(id: string): Promise<boolean> {
    return await this.provider.exists(id);
  }

  async duplicateWorkflow(id: string, newName?: string): Promise<string> {
    const originalWorkflow = await this.loadWorkflow(id);
    const now = new Date().toISOString();
    const newId = `workflow_${Date.now()}`;

    const duplicatedWorkflow: SerializedWorkflow = {
      ...originalWorkflow,
      id: newId,
      name: newName || `${originalWorkflow.name} (Copy)`,
      createdAt: now,
      updatedAt: now,
    };

    return await this.saveWorkflow(duplicatedWorkflow);
  }

  async exportWorkflow(id: string): Promise<void> {
    const workflow = await this.loadWorkflow(id);
    const fileProvider = new FileSystemProvider();
    await fileProvider.save(workflow);
  }

  async importWorkflow(): Promise<SerializedWorkflow> {
    const fileProvider = new FileSystemProvider();
    return await fileProvider.importFromFile();
  }

  // Utility methods
  async getStorageStats(): Promise<{
    totalWorkflows: number;
    totalNodes: number;
    totalEdges: number;
  }> {
    const workflows = await this.listWorkflows();

    return {
      totalWorkflows: workflows.length,
      totalNodes: workflows.reduce((sum, w) => sum + w.nodeCount, 0),
      totalEdges: workflows.reduce((sum, w) => sum + w.edgeCount, 0),
    };
  }
}

// PlantUML Storage implementation
export class PlantUMLStorageProvider implements WorkflowStorageProvider {
  async save(workflow: SerializedWorkflow): Promise<string> {
    try {
      const result = await PlantUMLExporter.exportWorkflowToPUML(workflow, {
        includeNodeProperties: true,
        formatStyle: 'detailed',
        outputPath: PlantUMLExporter.getDefaultExportPath(),
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to export PlantUML');
      }

      return workflow.id;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(
          `Failed to save workflow as PlantUML: ${error.message}`
        );
      }
      throw new Error('Failed to save workflow as PlantUML: Unknown error');
    }
  }

  async load(_id: string): Promise<SerializedWorkflow> {
    // PlantUML import is not yet implemented
    throw new Error(
      'PlantUML import not yet implemented - use importFromPUML method instead'
    );
  }

  async list(): Promise<WorkflowMetadata[]> {
    // Cannot list PlantUML files in browser environment
    return [];
  }

  async delete(_id: string): Promise<void> {
    throw new Error(
      'PlantUML file deletion not supported in browser environment'
    );
  }

  async exists(_id: string): Promise<boolean> {
    return false; // Cannot check file existence in browser
  }

  // Special method for PlantUML import
  importFromPUML(): Promise<SerializedWorkflow> {
    return PlantUMLExporter.importFromPUML().then(workflow => {
      if (!workflow) {
        throw new Error('Failed to import PlantUML file');
      }
      return workflow;
    });
  }
}

// Export singleton instance (defaults to localStorage, can be changed to PlantUML)
export const workflowStorage = new WorkflowStorageService();

// Convenience method to switch to PlantUML storage
export const enablePlantUMLStorage = () => {
  workflowStorage.setProvider(new PlantUMLStorageProvider());
};

// Convenience method to switch back to localStorage
export const enableLocalStorage = () => {
  workflowStorage.setProvider(new LocalStorageProvider());
};
