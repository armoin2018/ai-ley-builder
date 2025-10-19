import { useCallback, useState } from 'react';
import { CodeEditor } from '../../../shared/components/CodeEditor';
import { getAiLeyRoot } from '../../../utils/paths';

interface InstructionFile {
  name: string;
  path: string;
  type: string;
  priority: 'high' | 'medium' | 'low';
  scope: string[];
  content: string;
}

interface InstructionEditorProps {
  className?: string;
  file?: InstructionFile;
  onSave?: (content: string) => Promise<void>;
  onContentChange?: (content: string) => void;
}

export function InstructionEditor({
  className,
  file,
  onSave,
  onContentChange,
}: InstructionEditorProps) {
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
      console.log('Loading Instruction from:', fullPath);

      return file.content || getDefaultInstructionContent(file.name);
    } finally {
      setIsLoading(false);
    }
  }, [file]);

  const getDefaultInstructionContent = (instructionName: string) => {
    return `---
name: ${instructionName}
type: instruction
priority: medium
scope:
  - general
applyTo: general
author: AI-LEY
description: ${instructionName} instruction guidelines
keywords: [guidance, process, workflow]
lastUpdated: ${new Date().toISOString()}
version: 1.0.0
---

# ${instructionName} Instructions

## Overview

This instruction provides guidance for [specific area or process]. Follow these guidelines to ensure consistent and effective [outcomes/results].

## Scope

This instruction applies to:
- [Context 1]
- [Context 2]
- [Context 3]

## Prerequisites

Before following this instruction, ensure:
- [ ] [Prerequisite 1]
- [ ] [Prerequisite 2]
- [ ] [Required knowledge/access]

## Core Guidelines

### Primary Principles

1. **[Principle 1]**: [Detailed explanation]
   - [Supporting detail]
   - [Example or clarification]

2. **[Principle 2]**: [Detailed explanation]
   - [Supporting detail]
   - [Example or clarification]

3. **[Principle 3]**: [Detailed explanation]
   - [Supporting detail]
   - [Example or clarification]

### Implementation Steps

#### Step 1: [Action Name]
- **Purpose**: [Why this step is necessary]
- **Process**: [How to complete this step]
- **Validation**: [How to verify success]

#### Step 2: [Action Name]
- **Purpose**: [Why this step is necessary]
- **Process**: [How to complete this step]
- **Validation**: [How to verify success]

#### Step 3: [Action Name]
- **Purpose**: [Why this step is necessary]
- **Process**: [How to complete this step]
- **Validation**: [How to verify success]

## Quality Standards

### Must Do
- ✅ [Required action 1]
- ✅ [Required action 2]
- ✅ [Required action 3]

### Should Do
- 🟡 [Recommended action 1]
- 🟡 [Recommended action 2]
- 🟡 [Recommended action 3]

### Must Not Do
- ❌ [Prohibited action 1]
- ❌ [Prohibited action 2]
- ❌ [Prohibited action 3]

## Examples

### Example 1: [Scenario]
**Context**: [Situation description]
**Approach**: [How to apply the instruction]
**Expected Outcome**: [What should result]

### Example 2: [Scenario]
**Context**: [Situation description]
**Approach**: [How to apply the instruction]
**Expected Outcome**: [What should result]

## Common Issues and Solutions

### Issue: [Problem Description]
**Symptoms**: [How to identify this issue]
**Root Cause**: [Why this happens]
**Solution**: [How to resolve]
**Prevention**: [How to avoid in future]

### Issue: [Problem Description]
**Symptoms**: [How to identify this issue]
**Root Cause**: [Why this happens]
**Solution**: [How to resolve]
**Prevention**: [How to avoid in future]

## References

- [Related instruction 1]
- [Related process 2]
- [External resource 3]

## Success Metrics

This instruction is effective when:
- [ ] [Measurable outcome 1]
- [ ] [Measurable outcome 2]
- [ ] [Measurable outcome 3]

## Review and Updates

- **Review Frequency**: [How often to review]
- **Update Triggers**: [When to update this instruction]
- **Feedback Process**: [How to provide feedback]`;
  };

  const syntaxHelp = {
    title: 'Instruction Markdown Syntax',
    examples: [
      {
        label: 'YAML Frontmatter',
        snippet: `---
name: Instruction Name
type: instruction
priority: high
scope:
  - area1
  - area2
---`,
        description: 'Defines instruction metadata and classification',
      },
      {
        label: 'Step-by-Step Process',
        snippet: `#### Step 1: [Action Name]
- **Purpose**: [Why this step is necessary]
- **Process**: [How to complete]
- **Validation**: [How to verify success]`,
        description: 'Structures clear, actionable steps',
      },
      {
        label: 'Quality Standards',
        snippet: `### Must Do
- ✅ [Required action]

### Should Do
- 🟡 [Recommended action]

### Must Not Do
- ❌ [Prohibited action]`,
        description: "Defines clear do's and don'ts",
      },
      {
        label: 'Example Scenario',
        snippet: `### Example: [Scenario Name]
**Context**: [Situation description]
**Approach**: [How to apply instruction]
**Expected Outcome**: [What should result]`,
        description: 'Provides concrete usage examples',
      },
      {
        label: 'Issue Resolution',
        snippet: `### Issue: [Problem Description]
**Symptoms**: [How to identify]
**Solution**: [How to resolve]
**Prevention**: [How to avoid]`,
        description: 'Documents troubleshooting guidance',
      },
      {
        label: 'Checklist',
        snippet: `## Prerequisites
- [ ] [Requirement 1]
- [ ] [Requirement 2]
- [ ] [Requirement 3]`,
        description: 'Creates actionable checklists',
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
      title={file ? `Instruction: ${file.name}` : 'Instruction Editor'}
      language="markdown"
      content={content}
      onContentChange={handleContentChange}
      onSave={handleSave}
      onLoad={handleLoad}
      isLoading={isLoading}
      isSaving={isSaving}
      placeholder="Enter instruction content in Markdown format..."
      fileInfo={fileInfo}
      syntaxHelp={syntaxHelp}
      enableRichTextMode={true}
    />
  );
}
