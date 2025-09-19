import { useState, useCallback } from 'react';
import { getAiLeyRoot, AI_LEY_PATHS } from '../../../utils/paths';

interface FileEditorTab {
  id: string;
  title: string;
  filePath: string;
  fileType: 'plantuml' | 'persona' | 'instruction' | 'global-instruction' | 'command-prompt';
  content: string;
  hasChanges: boolean;
  lastModified?: Date;
}

export interface FileManagerHook {
  tabs: FileEditorTab[];
  activeTabId: string | null;
  isLoading: boolean;
  error: string | null;
  createTab: (fileType: FileEditorTab['fileType'], title?: string, filePath?: string) => void;
  openFile: (filePath: string) => Promise<void>;
  saveFile: (tabId: string) => Promise<void>;
  closeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  updateTabContent: (tabId: string, content: string) => void;
  loadRecentFiles: () => Promise<void>;
}

export function useFileManager(): FileManagerHook {
  const [tabs, setTabs] = useState<FileEditorTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createTab = useCallback(
    (fileType: FileEditorTab['fileType'], title?: string, filePath?: string) => {
      const newTab: FileEditorTab = {
        id: `tab-${Date.now()}`,
        title: title || getDefaultTitle(fileType),
        filePath: filePath || '',
        fileType,
        content: getDefaultContent(fileType, title),
        hasChanges: false,
      };

      setTabs((prevTabs) => [...prevTabs, newTab]);
      setActiveTabId(newTab.id);
    },
    []
  );

  const openFile = useCallback(async (filePath: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Determine file type from path
      const fileType = getFileTypeFromPath(filePath);
      const fileName = filePath.split('/').pop() || 'Unknown';
      const title = fileName.replace(/\.[^/.]+$/, ''); // Remove extension

      // In a real implementation, you would read the file content
      // For now, we'll simulate loading
      const content = await simulateFileLoad(filePath);

      const newTab: FileEditorTab = {
        id: `tab-${Date.now()}`,
        title,
        filePath,
        fileType,
        content,
        hasChanges: false,
        lastModified: new Date(),
      };

      setTabs((prevTabs) => [...prevTabs, newTab]);
      setActiveTabId(newTab.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to open file');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveFile = useCallback(async (tabId: string) => {
    const tab = tabs.find((t) => t.id === tabId);
    if (!tab) return;

    setIsLoading(true);
    setError(null);

    try {
      // In a real implementation, you would save to the actual file system
      await simulateFileSave(tab.filePath || generateFilePath(tab), tab.content);

      setTabs((prevTabs) =>
        prevTabs.map((t) =>
          t.id === tabId ? { ...t, hasChanges: false, lastModified: new Date() } : t
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save file');
    } finally {
      setIsLoading(false);
    }
  }, [tabs]);

  const closeTab = useCallback(
    (tabId: string) => {
      setTabs((prevTabs) => {
        const newTabs = prevTabs.filter((tab) => tab.id !== tabId);

        // Update active tab if the closed tab was active
        if (activeTabId === tabId) {
          setActiveTabId(newTabs.length > 0 ? newTabs[newTabs.length - 1].id : null);
        }

        return newTabs;
      });
    },
    [activeTabId]
  );

  const setActiveTab = useCallback((tabId: string) => {
    setActiveTabId(tabId);
  }, []);

  const updateTabContent = useCallback((tabId: string, content: string) => {
    setTabs((prevTabs) =>
      prevTabs.map((tab) =>
        tab.id === tabId
          ? { ...tab, content, hasChanges: content !== tab.content }
          : tab
      )
    );
  }, []);

  const loadRecentFiles = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // In a real implementation, you would load recent files from storage
      const recentFiles = await simulateLoadRecentFiles();

      for (const file of recentFiles) {
        await openFile(file.path);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load recent files');
    } finally {
      setIsLoading(false);
    }
  }, [openFile]);

  return {
    tabs,
    activeTabId,
    isLoading,
    error,
    createTab,
    openFile,
    saveFile,
    closeTab,
    setActiveTab,
    updateTabContent,
    loadRecentFiles,
  };
}

// Helper functions

function getDefaultTitle(fileType: FileEditorTab['fileType']): string {
  switch (fileType) {
    case 'plantuml':
      return 'New Workflow';
    case 'persona':
      return 'New Persona';
    case 'instruction':
      return 'New Instruction';
    case 'global-instruction':
      return 'Global Instructions';
    case 'command-prompt':
      return 'New Command';
    default:
      return 'New File';
  }
}

function getDefaultContent(fileType: FileEditorTab['fileType'], title?: string): string {
  const name = title || getDefaultTitle(fileType);

  switch (fileType) {
    case 'plantuml':
      return `@startuml ${name}
!theme plain

title ${name}

start
:requirements;
:learn;
:build;
stop

@enduml`;
    case 'persona':
      return `---
name: ${name}
type: Expert Assistant
tone: professional
---

# ${name} Persona

You are a ${name} - an expert assistant specialized in [domain].`;
    case 'instruction':
      return `---
name: ${name}
type: instruction
priority: medium
---

# ${name} Instructions

## Overview
[Description of what this instruction covers]`;
    case 'global-instruction':
      return `# Universal Project Guidelines

## Core Principles
[Universal guidelines that apply to all projects]`;
    case 'command-prompt':
      return `---
title: ${name}
author: AI-LEY
---

# Copilot Command: ${name}

## Goal
[Description of what this command accomplishes]`;
    default:
      return '';
  }
}

function getFileTypeFromPath(filePath: string): FileEditorTab['fileType'] {
  const fileName = filePath.toLowerCase();

  if (fileName.includes('plantuml') || fileName.endsWith('.puml') || fileName.endsWith('.plantuml')) {
    return 'plantuml';
  }
  if (fileName.includes('persona')) {
    return 'persona';
  }
  if (fileName.includes('global-instruction') || fileName === 'global-instructions.md') {
    return 'global-instruction';
  }
  if (fileName.includes('instruction')) {
    return 'instruction';
  }
  if (fileName.includes('prompt') || fileName.includes('command')) {
    return 'command-prompt';
  }

  return 'instruction'; // Default
}

function generateFilePath(tab: FileEditorTab): string {
  const root = getAiLeyRoot();
  const timestamp = new Date().toISOString().split('T')[0];

  switch (tab.fileType) {
    case 'plantuml':
      return `${root}/shared/uml-flows/${tab.title.toLowerCase().replace(/\s+/g, '-')}.puml`;
    case 'persona':
      return `${AI_LEY_PATHS.PERSONAS}/${tab.title.toLowerCase().replace(/\s+/g, '-')}.md`;
    case 'instruction':
      return `${AI_LEY_PATHS.INSTRUCTIONS}/${tab.title.toLowerCase().replace(/\s+/g, '-')}.md`;
    case 'global-instruction':
      return `${AI_LEY_PATHS.ROOT}/shared/global-instructions.md`;
    case 'command-prompt':
      return `${AI_LEY_PATHS.PROMPTS}/${tab.title.toLowerCase().replace(/\s+/g, '-')}.md`;
    default:
      return `${root}/shared/${tab.title.toLowerCase().replace(/\s+/g, '-')}.md`;
  }
}

// Simulation functions (replace with real implementations)

async function simulateFileLoad(filePath: string): Promise<string> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Return mock content based on file type
  const fileType = getFileTypeFromPath(filePath);
  const fileName = filePath.split('/').pop()?.replace(/\.[^/.]+$/, '') || 'File';

  return getDefaultContent(fileType, fileName);
}

async function simulateFileSave(filePath: string, content: string): Promise<void> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));

  console.log(`Saving file to ${filePath}:`, content.substring(0, 100) + '...');
}

async function simulateLoadRecentFiles(): Promise<Array<{ path: string; lastModified: Date }>> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 200));

  return [
    {
      path: `${AI_LEY_PATHS.PERSONAS}/expert-developer.md`,
      lastModified: new Date(Date.now() - 86400000), // 1 day ago
    },
    {
      path: `${AI_LEY_PATHS.INSTRUCTIONS}/code-review.md`,
      lastModified: new Date(Date.now() - 172800000), // 2 days ago
    },
  ];
}