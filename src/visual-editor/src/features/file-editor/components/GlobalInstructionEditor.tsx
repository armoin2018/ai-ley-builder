import { useCallback, useState } from 'react';
import { CodeEditor } from '../../../shared/components/CodeEditor';
import { getAiLeyRoot } from '../../../utils/paths';

interface GlobalInstructionFile {
  path: string;
  content: string;
  sections: Array<{
    title: string;
    content: string;
  }>;
}

interface GlobalInstructionEditorProps {
  className?: string;
  file?: GlobalInstructionFile;
  onSave?: (content: string) => Promise<void>;
  onContentChange?: (content: string) => void;
}

export function GlobalInstructionEditor({
  className,
  file,
  onSave,
  onContentChange,
}: GlobalInstructionEditorProps) {
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
      console.log('Loading Global Instructions from:', fullPath);

      return file.content || getDefaultGlobalInstructionContent();
    } finally {
      setIsLoading(false);
    }
  }, [file]);

  const getDefaultGlobalInstructionContent = () => {
    return `# Universal Project Coding & Management Guide

## Overview

This document contains universal instructions that apply across all AI-LEY projects and commands. These guidelines ensure consistency, quality, and maintainability across the entire ecosystem.

## Core Principles

### 1. Code Quality Standards

#### Code Style
- **Consistency**: Follow established patterns within each codebase
- **Readability**: Write self-documenting code with clear variable names
- **Comments**: Document complex logic and business rules
- **Testing**: Include appropriate test coverage for new functionality

#### Architecture
- **Modularity**: Break complex systems into manageable components
- **Separation of Concerns**: Each module should have a single responsibility
- **DRY Principle**: Don't repeat yourself - extract common functionality
- **SOLID Principles**: Follow Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, and Dependency Inversion

### 2. Documentation Standards

#### Code Documentation
- **Inline Comments**: Explain complex algorithms and business logic
- **Function Documentation**: Document parameters, return values, and side effects
- **API Documentation**: Provide comprehensive API documentation for public interfaces
- **README Files**: Include clear setup and usage instructions

#### Project Documentation
- **Architecture Decisions**: Document major technical decisions and rationale
- **Change Logs**: Maintain detailed change logs for releases
- **User Guides**: Provide clear user-facing documentation
- **Troubleshooting**: Document common issues and solutions

### 3. Project Management

#### File Organization
- **Consistent Structure**: Follow established folder hierarchies
- **Naming Conventions**: Use clear, descriptive file and folder names
- **Version Control**: Use meaningful commit messages and branch names
- **Dependencies**: Keep dependencies up to date and minimize unnecessary packages

#### Process Management
- **Requirements**: Clearly document and track requirements
- **Testing**: Implement comprehensive testing strategies
- **Code Review**: Require peer review for all significant changes
- **Deployment**: Use automated deployment processes where possible

## Specific Guidelines

### AI-LEY Framework Guidelines

#### Persona Development
- **Role Clarity**: Each persona should have a clearly defined role and expertise
- **Communication Style**: Define tone, approach, and response patterns
- **Examples**: Provide concrete examples of persona interactions
- **Consistency**: Maintain consistent persona behavior across interactions

#### Instruction Writing
- **Clarity**: Write clear, actionable instructions
- **Structure**: Use consistent formatting and organization
- **Examples**: Include practical examples and use cases
- **Validation**: Define success criteria and validation methods

#### Prompt Engineering
- **Context**: Provide sufficient context for effective AI responses
- **Variables**: Use well-defined variables with clear types and defaults
- **Testing**: Test prompts with various inputs and scenarios
- **Iteration**: Continuously improve prompts based on results

### Technical Implementation

#### Error Handling
- **Graceful Degradation**: Handle errors gracefully without breaking user experience
- **Logging**: Implement comprehensive logging for debugging
- **User Feedback**: Provide clear error messages to users
- **Recovery**: Implement recovery mechanisms where appropriate

#### Performance
- **Optimization**: Optimize for performance without sacrificing maintainability
- **Caching**: Use appropriate caching strategies
- **Resource Management**: Manage memory and computational resources efficiently
- **Monitoring**: Implement performance monitoring and alerting

#### Security
- **Input Validation**: Validate all user inputs
- **Authentication**: Implement proper authentication and authorization
- **Data Protection**: Protect sensitive data throughout the system
- **Updates**: Keep security patches and dependencies current

## Quality Assurance

### Code Review Process

#### Review Criteria
- [ ] Code follows established style guidelines
- [ ] Tests are included and passing
- [ ] Documentation is updated
- [ ] Security considerations are addressed
- [ ] Performance impact is acceptable

#### Review Checklist
- [ ] Functionality works as intended
- [ ] Error handling is appropriate
- [ ] Code is well-documented
- [ ] Tests cover edge cases
- [ ] No security vulnerabilities introduced

### Testing Standards

#### Test Types
- **Unit Tests**: Test individual components in isolation
- **Integration Tests**: Test component interactions
- **End-to-End Tests**: Test complete user workflows
- **Performance Tests**: Validate performance requirements

#### Test Quality
- **Coverage**: Maintain appropriate test coverage
- **Reliability**: Tests should be deterministic and reliable
- **Maintainability**: Tests should be easy to understand and maintain
- **Speed**: Tests should run quickly to enable rapid feedback

## Continuous Improvement

### Learning and Adaptation
- **Retrospectives**: Regular review of processes and outcomes
- **Feedback**: Collect and act on feedback from users and team members
- **Innovation**: Encourage experimentation with new tools and techniques
- **Knowledge Sharing**: Share learnings across teams and projects

### Metrics and Monitoring
- **Quality Metrics**: Track code quality, bug rates, and technical debt
- **Performance Metrics**: Monitor system performance and user experience
- **Process Metrics**: Measure development velocity and efficiency
- **User Metrics**: Track user satisfaction and adoption

## Enforcement and Compliance

### Automated Checks
- **Linting**: Use automated code linting tools
- **Testing**: Require passing tests for all commits
- **Security Scanning**: Implement automated security vulnerability scanning
- **Dependency Checking**: Monitor for outdated or vulnerable dependencies

### Manual Reviews
- **Peer Review**: Require peer review for all significant changes
- **Architecture Review**: Review major architectural decisions
- **Security Review**: Conduct security reviews for sensitive changes
- **Documentation Review**: Ensure documentation is accurate and complete

## Updates and Versioning

### Version Control
- **Semantic Versioning**: Use semantic versioning for releases
- **Change Documentation**: Document all changes in release notes
- **Backward Compatibility**: Maintain backward compatibility when possible
- **Migration Guides**: Provide migration guides for breaking changes

### Maintenance
- **Regular Updates**: Keep dependencies and tools up to date
- **Refactoring**: Regularly refactor code to improve maintainability
- **Technical Debt**: Address technical debt systematically
- **Performance Optimization**: Continuously optimize performance

---

**Note**: These instructions are living documents that should be updated as the project evolves and new best practices are discovered.

**Last Updated**: ${new Date().toISOString()}
**Version**: 2.0.0`;
  };

  const syntaxHelp = {
    title: 'Global Instructions Syntax',
    examples: [
      {
        label: 'Section Header',
        snippet: `## Core Principles

### 1. Quality Standards`,
        description: 'Organizes content into clear hierarchical sections',
      },
      {
        label: 'Guideline Structure',
        snippet: `#### Code Style
- **Consistency**: Follow established patterns
- **Readability**: Write self-documenting code
- **Comments**: Document complex logic`,
        description: 'Structures guidelines with clear formatting',
      },
      {
        label: 'Process Checklist',
        snippet: `#### Review Criteria
- [ ] Code follows style guidelines
- [ ] Tests are included and passing
- [ ] Documentation is updated`,
        description: 'Creates actionable checklists for processes',
      },
      {
        label: 'Best Practice Block',
        snippet: `### Error Handling
- **Graceful Degradation**: Handle errors gracefully
- **Logging**: Implement comprehensive logging
- **User Feedback**: Provide clear error messages`,
        description: 'Documents best practices with explanations',
      },
      {
        label: 'Standards Definition',
        snippet: `### Testing Standards

#### Test Types
- **Unit Tests**: Test individual components
- **Integration Tests**: Test component interactions`,
        description: 'Defines clear standards and requirements',
      },
      {
        label: 'Metadata Section',
        snippet: `---

**Note**: These instructions are living documents.
**Last Updated**: ${new Date().toISOString()}
**Version**: 2.0.0`,
        description: 'Includes document metadata and versioning',
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
      title="Global Instructions"
      language="markdown"
      content={content}
      onContentChange={handleContentChange}
      onSave={handleSave}
      onLoad={handleLoad}
      isLoading={isLoading}
      isSaving={isSaving}
      placeholder="Enter global instructions in Markdown format..."
      fileInfo={fileInfo}
      syntaxHelp={syntaxHelp}
      enableRichTextMode={true}
    />
  );
}
