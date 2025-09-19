import { useCallback, useState } from 'react';
import { CodeEditor } from '../../../shared/components/CodeEditor';
import { getAiLeyRoot } from '../../../utils/paths';

interface PersonaFile {
  name: string;
  path: string;
  type: string;
  tone: string;
  expertise: string[];
  background: string;
  communication_style: string;
  content: string;
}

interface PersonaEditorProps {
  className?: string;
  file?: PersonaFile;
  onSave?: (content: string) => Promise<void>;
  onContentChange?: (content: string) => void;
}

export function PersonaEditor({
  className,
  file,
  onSave,
  onContentChange,
}: PersonaEditorProps) {
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
      const fullPath = `${getAiLeyRoot()}/${file.path}`;
      console.log('Loading Persona from:', fullPath);

      return file.content || getDefaultPersonaContent(file.name);
    } finally {
      setIsLoading(false);
    }
  }, [file]);

  const getDefaultPersonaContent = (personaName: string) => {
    return `---
name: ${personaName}
type: Expert Assistant
tone: professional
expertise:
  - Domain Expertise
  - Problem Solving
background: |
  Experienced professional with deep knowledge in the specified domain.
communication_style: direct
lastUpdated: ${new Date().toISOString()}
version: 1.0.0
---

# ${personaName} Persona

## Role Definition

You are a **${personaName}** - an expert assistant specializing in [domain area]. You have extensive experience in [specific expertise areas] and provide clear, actionable guidance.

## Expertise Areas

- **Primary**: [Main area of expertise]
- **Secondary**: [Supporting areas]
- **Tools**: [Relevant tools and technologies]

## Communication Style

- **Tone**: Professional and approachable
- **Response Style**: Direct and actionable
- **Format**: Structured with clear explanations
- **Examples**: Provide concrete examples when helpful

## Background Context

[Detailed background about the persona's experience, training, and perspective]

## Specific Guidelines

### Do's
- Provide specific, actionable advice
- Ask clarifying questions when needed
- Reference best practices
- Offer multiple approaches when appropriate

### Don'ts
- Make assumptions without clarification
- Provide generic responses
- Ignore context or constraints
- Overwhelm with unnecessary details

## Example Interactions

### Scenario 1: [Common use case]
**User**: [Example question]
**Response approach**: [How this persona would respond]

### Scenario 2: [Another use case]
**User**: [Example question]
**Response approach**: [How this persona would respond]

## Success Metrics

This persona is effective when:
- Users receive clear, actionable guidance
- Solutions address the specific context
- Responses demonstrate domain expertise
- Users can implement recommendations successfully`;
  };

  const syntaxHelp = {
    title: 'Persona Markdown Syntax',
    examples: [
      {
        label: 'YAML Frontmatter',
        snippet: `---
name: Expert Name
type: Domain Expert
tone: professional
expertise:
  - Area 1
  - Area 2
---`,
        description: 'Defines persona metadata at the top of the file',
      },
      {
        label: 'Role Definition',
        snippet: `## Role Definition

You are a **[Role Title]** - [brief description of the role and expertise].`,
        description: 'Clearly defines the persona\'s primary role',
      },
      {
        label: 'Expertise Areas',
        snippet: `## Expertise Areas

- **Primary**: [Main expertise]
- **Secondary**: [Supporting areas]
- **Tools**: [Relevant technologies]`,
        description: 'Lists the persona\'s areas of knowledge',
      },
      {
        label: 'Communication Guidelines',
        snippet: `### Do's
- Provide specific advice
- Ask clarifying questions

### Don'ts
- Make assumptions
- Provide generic responses`,
        description: 'Defines how the persona should communicate',
      },
      {
        label: 'Example Interactions',
        snippet: `### Scenario: [Use case]
**User**: [Example question]
**Response approach**: [How to respond]`,
        description: 'Provides concrete examples of persona behavior',
      },
      {
        label: 'Background Block',
        snippet: `## Background Context

[Detailed description of experience, training, and perspective]`,
        description: 'Explains the persona\'s background and experience',
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
      title={file ? `Persona: ${file.name}` : 'Persona Editor'}
      language="markdown"
      content={content}
      onContentChange={handleContentChange}
      onSave={handleSave}
      onLoad={handleLoad}
      isLoading={isLoading}
      isSaving={isSaving}
      placeholder="Enter persona definition in Markdown format..."
      fileInfo={fileInfo}
      syntaxHelp={syntaxHelp}
      enableRichTextMode={true}
    />
  );
}