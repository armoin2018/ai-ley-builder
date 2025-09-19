import { useCallback, useState } from 'react';
import { CodeEditor } from '../../../shared/components/CodeEditor';
import { getAiLeyRoot } from '../../../utils/paths';

interface PlantUMLFile {
  name: string;
  path: string;
  content: string;
  workflowName: string;
}

interface PlantUMLEditorProps {
  className?: string;
  file?: PlantUMLFile;
  onSave?: (content: string) => Promise<void>;
  onContentChange?: (content: string) => void;
}

export function PlantUMLEditor({
  className,
  file,
  onSave,
  onContentChange,
}: PlantUMLEditorProps) {
  const [content, setContent] = useState(file?.content || '');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleContentChange = useCallback(
    (newContent: string) => {
      setContent(newContent);
      onContentChange?.(newContent);
    },
    [onContentChange]
  );

  const handleSave = useCallback(async () => {
    if (!onSave) return;

    setIsSaving(true);
    try {
      await onSave(content);
    } finally {
      setIsSaving(false);
    }
  }, [content, onSave]);

  const handleLoad = useCallback(async () => {
    if (!file?.path) return '';

    setIsLoading(true);
    try {
      // Simulate loading from file system
      // In a real implementation, this would read from the actual file
      const fullPath = `${getAiLeyRoot()}/${file.path}`;
      console.log('Loading PlantUML from:', fullPath);

      // For now, return the existing content
      return file.content || getDefaultPlantUMLContent(file.name);
    } finally {
      setIsLoading(false);
    }
  }, [file]);

  const getDefaultPlantUMLContent = (workflowName: string) => {
    return `@startuml ${workflowName}
!theme plain

title ${workflowName}

' Define workflow components
start
:requirements;
:learn;
:evolve;
:build-design;
:build-plan;
:implement;
:test;
:document;
:launch;
stop

@enduml`;
  };

  const syntaxHelp = {
    title: 'PlantUML Syntax Guide',
    examples: [
      {
        label: 'Basic Activity',
        snippet: ':activity name;',
        description: 'Creates a basic activity box in the workflow',
      },
      {
        label: 'Start/End',
        snippet: 'start\n:process;\nstop',
        description: 'Defines the beginning and end of the workflow',
      },
      {
        label: 'Conditional',
        snippet: 'if (condition?) then (yes)\n  :action;\nelse (no)\n  :other action;\nendif',
        description: 'Creates a decision point with true/false paths',
      },
      {
        label: 'Parallel Activities',
        snippet: 'fork\n  :activity 1;\nfork again\n  :activity 2;\nend fork',
        description: 'Runs multiple activities in parallel',
      },
      {
        label: 'Loop',
        snippet: 'repeat\n  :process item;\nrepeat while (more items?)',
        description: 'Creates a loop that repeats while condition is true',
      },
      {
        label: 'Note',
        snippet: 'note left: This is a note',
        description: 'Adds explanatory notes to activities',
      },
      {
        label: 'AI-LEY Metadata',
        snippet: '\'@node-meta {"type":"custom-prompt","properties":{"promptText":"example"}}',
        description: 'Adds AI-LEY specific metadata for visual editor integration',
      },
    ],
  };

  const fileInfo = file
    ? {
        path: file.path,
        lastModified: new Date(),
        size: content.length,
      }
    : undefined;

  return (
    <CodeEditor
      className={className}
      title={file ? `PlantUML: ${file.name}` : 'PlantUML Editor'}
      language="plantuml"
      content={content}
      onContentChange={handleContentChange}
      onSave={handleSave}
      onLoad={handleLoad}
      isLoading={isLoading}
      isSaving={isSaving}
      placeholder="Enter PlantUML syntax here..."
      fileInfo={fileInfo}
      syntaxHelp={syntaxHelp}
    />
  );
}