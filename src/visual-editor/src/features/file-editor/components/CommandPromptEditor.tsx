import { useCallback, useState } from 'react';
import { CodeEditor } from '../../../shared/components/CodeEditor';
import { getAiLeyRoot } from '../../../utils/paths';

interface CommandPromptFile {
  name: string;
  path: string;
  fileName: string;
  variables: Array<{
    name: string;
    type: string;
    default?: string;
    description?: string;
  }>;
  content: string;
}

interface CommandPromptEditorProps {
  className?: string;
  file?: CommandPromptFile;
  onSave?: (content: string) => Promise<void>;
  onContentChange?: (content: string) => void;
}

export function CommandPromptEditor({
  className,
  file,
  onSave,
  onContentChange,
}: CommandPromptEditorProps) {
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
      console.log('Loading Command Prompt from:', fullPath);

      return file.content || getDefaultCommandPromptContent(file.name);
    } finally {
      setIsLoading(false);
    }
  }, [file]);

  const getDefaultCommandPromptContent = (promptName: string) => {
    return `---
agentMode: general
applyTo: general
author: AI-LEY
description: ${promptName} command prompt for automated workflow execution
extensions:
  - .md
  - .txt
guidelines: Follow AI-LEY project standards and Universal Project Coding & Management Guide
instructionType: general
keywords: [automation, workflow, command, execution]
lastUpdated: '${new Date().toISOString()}'
summaryScore: 4.0
title: ${promptName}
version: 1.0.0
---

# Copilot Command: ${promptName}

## Variables

- Project files and structure are defined in \`.ai-ley/shared/variables/folder-structure.yaml\`
- Use mustache syntax like \`{{folders.prompts}}\` and \`{{files.requirements}}\` for path references
- Variables can be passed from the command invocation

## References

- See the \`.ai-ley/shared/global-instructions.md\` file for universal guidelines
- Reference applicable personas in \`{{folders.personas}}\` as needed
- Follow instructions in \`{{folders.instructions}}\` for specific processes
- Use conflict resolution guidelines when information conflicts

## Goal

Given:
- \`{{input.context}}\` - The context or request provided by the user
- \`{{input.parameters}}\` - Any specific parameters or options
- Current project state and files

Produce:
- \`{{output.result}}\` - The expected deliverable or outcome
- \`{{output.status}}\` - Success/failure status with details
- \`{{output.recommendations}}\` - Follow-up actions or suggestions

## Command

You are an expert assistant specialized in [domain area]. Your role is to [primary function] while ensuring [quality standards].

### Step 1: Context Analysis

**Input Processing**:
- Parse the provided context and parameters
- Identify the scope and requirements
- Validate inputs and flag any missing information
- Assess complexity and resource requirements

**Context Validation**:
\`\`\`markdown
## Context Analysis: [Current Date]

### Input Summary
- **Request Type**: [Category of request]
- **Scope**: [What needs to be accomplished]
- **Constraints**: [Limitations or requirements]
- **Resources**: [Available resources and dependencies]

### Validation Results
- ✅ All required inputs provided
- ✅ Scope is clearly defined
- ✅ Resources are available
- ⚠️ [Any concerns or clarifications needed]
\`\`\`

### Step 2: Planning and Strategy

**Development Approach**:
1. **Analysis Phase**: [How to analyze the requirements]
2. **Design Phase**: [How to plan the solution]
3. **Implementation Phase**: [How to execute the work]
4. **Validation Phase**: [How to verify success]

**Resource Planning**:
- **Time Estimate**: [Expected duration]
- **Dependencies**: [Required files, tools, or processes]
- **Risk Assessment**: [Potential challenges and mitigations]

### Step 3: Implementation

**Core Implementation Process**:

#### Phase 1: [Initial Phase]
- **Objective**: [What this phase accomplishes]
- **Actions**:
  - [Specific action 1]
  - [Specific action 2]
  - [Specific action 3]
- **Deliverables**: [What is produced in this phase]
- **Validation**: [How to verify phase completion]

#### Phase 2: [Development Phase]
- **Objective**: [What this phase accomplishes]
- **Actions**:
  - [Specific action 1]
  - [Specific action 2]
  - [Specific action 3]
- **Deliverables**: [What is produced in this phase]
- **Validation**: [How to verify phase completion]

#### Phase 3: [Finalization Phase]
- **Objective**: [What this phase accomplishes]
- **Actions**:
  - [Specific action 1]
  - [Specific action 2]
  - [Specific action 3]
- **Deliverables**: [What is produced in this phase]
- **Validation**: [How to verify phase completion]

### Step 4: Quality Assurance

**Quality Checks**:
- [ ] Solution meets all specified requirements
- [ ] Implementation follows project standards
- [ ] Documentation is complete and accurate
- [ ] Testing validates functionality
- [ ] Security considerations are addressed

**Validation Process**:
\`\`\`markdown
## Quality Validation: [Current Date]

### Requirements Compliance
- [Requirement 1]: ✅ Met / ⚠️ Partial / ❌ Not Met
- [Requirement 2]: ✅ Met / ⚠️ Partial / ❌ Not Met
- [Requirement 3]: ✅ Met / ⚠️ Partial / ❌ Not Met

### Standards Compliance
- Code Quality: [Assessment]
- Documentation: [Assessment]
- Testing: [Assessment]
- Security: [Assessment]

### Performance Validation
- [Performance Metric 1]: [Result]
- [Performance Metric 2]: [Result]
- [Performance Metric 3]: [Result]
\`\`\`

### Step 5: Documentation and Handoff

**Documentation Requirements**:
- **Implementation Summary**: [What was built and how]
- **Usage Instructions**: [How to use the solution]
- **Maintenance Guide**: [How to maintain and update]
- **Troubleshooting**: [Common issues and solutions]

**Deliverable Package**:
\`\`\`markdown
# ${promptName} Completion Report

## Summary
- **Objective**: [What was requested]
- **Solution**: [What was delivered]
- **Status**: [Success/Partial/Failed]

## Deliverables
- [Deliverable 1]: [Location/Description]
- [Deliverable 2]: [Location/Description]
- [Deliverable 3]: [Location/Description]

## Usage Instructions
1. [Step 1 to use the solution]
2. [Step 2 to use the solution]
3. [Step 3 to use the solution]

## Next Steps
- [ ] [Immediate action required]
- [ ] [Follow-up task 1]
- [ ] [Follow-up task 2]

## Support Information
- **Documentation**: [Where to find additional info]
- **Contact**: [Who to contact for support]
- **Updates**: [How to get updates or report issues]
\`\`\`

## Examples

### Example 1: Simple Request
**Input Context**: "Create a new feature for user authentication"
**Parameters**: {"type": "oauth", "provider": "google"}
**Expected Output**: Complete OAuth implementation with documentation

### Example 2: Complex Request
**Input Context**: "Optimize database performance for large datasets"
**Parameters**: {"threshold": "1M records", "target": "< 2s response"}
**Expected Output**: Performance optimization plan and implementation

### Example 3: Analysis Request
**Input Context**: "Review codebase for security vulnerabilities"
**Parameters**: {"scope": "authentication", "severity": "high"}
**Expected Output**: Security assessment report with remediation plan

## Notes

- Always validate inputs before processing
- Provide clear status updates for long-running operations
- Include error handling and recovery procedures
- Document decisions and rationale for future reference
- Follow the established patterns and conventions in the codebase
- Consider backwards compatibility and migration requirements
- Test thoroughly before marking as complete`;
  };

  const syntaxHelp = {
    title: 'Command Prompt Markdown Syntax',
    examples: [
      {
        label: 'YAML Frontmatter',
        snippet: `---
agentMode: general
applyTo: general
author: AI-LEY
description: Command description
keywords: [automation, workflow]
---`,
        description: 'Defines command metadata and configuration',
      },
      {
        label: 'Variable Reference',
        snippet: `{{folders.prompts}}
{{files.requirements}}
{{input.context}}
{{output.result}}`,
        description:
          'References variables from folder structure and command input/output',
      },
      {
        label: 'Step Structure',
        snippet: `### Step 1: Analysis Phase

**Input Processing**:
- Parse the provided context
- Identify requirements
- Validate inputs`,
        description: 'Organizes command execution into clear steps',
      },
      {
        label: 'Implementation Phase',
        snippet: `#### Phase 1: [Phase Name]
- **Objective**: [What this accomplishes]
- **Actions**: [Specific actions]
- **Deliverables**: [What is produced]
- **Validation**: [How to verify]`,
        description: 'Structures implementation phases with clear objectives',
      },
      {
        label: 'Quality Checklist',
        snippet: `**Quality Checks**:
- [ ] Requirements met
- [ ] Standards followed
- [ ] Documentation complete
- [ ] Testing validates functionality`,
        description: 'Creates quality assurance checklists',
      },
      {
        label: 'Example Usage',
        snippet: `### Example: [Scenario Name]
**Input Context**: "Description of request"
**Parameters**: {"key": "value"}
**Expected Output**: Description of result`,
        description: 'Provides concrete usage examples',
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
      title={file ? `Command Prompt: ${file.name}` : 'Command Prompt Editor'}
      language="markdown"
      content={content}
      onContentChange={handleContentChange}
      onSave={handleSave}
      onLoad={handleLoad}
      isLoading={isLoading}
      isSaving={isSaving}
      placeholder="Enter command prompt content in Markdown format..."
      fileInfo={fileInfo}
      syntaxHelp={syntaxHelp}
      enableRichTextMode={true}
    />
  );
}
