import {
  Code2,
  Edit3,
  Eye,
  FileText,
  FolderOpen,
  RefreshCw,
  Save,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { cn } from '../../utils';
import { Button } from './Button';
// import { RichTextEditor } from './RichTextEditor';

export interface CodeEditorProps {
  className?: string;
  title: string;
  language?: 'markdown' | 'yaml' | 'plaintext' | 'plantuml';
  content: string;
  onContentChange?: (content: string) => void;
  onSave?: () => Promise<void>;
  onLoad?: () => Promise<string>;
  isLoading?: boolean;
  isSaving?: boolean;
  readOnly?: boolean;
  placeholder?: string;
  showPreview?: boolean;
  onPreviewToggle?: () => void;
  fileInfo?: {
    path: string;
    lastModified?: Date;
    size?: number;
  };
  syntaxHelp?: {
    title: string;
    examples: Array<{
      label: string;
      snippet: string;
      description?: string;
    }>;
  };
  enableRichTextMode?: boolean;
  plantUMLSettings?: {
    validationEnabled: boolean;
    renderUrl: string;
    onValidate?: (content: string) => Promise<boolean>;
    onRender?: (content: string) => Promise<string>;
  };
}

export function CodeEditor({
  className,
  title,
  language = 'markdown',
  content,
  onContentChange,
  onSave,
  onLoad,
  isLoading = false,
  isSaving = false,
  readOnly = false,
  placeholder = 'Enter content here...',
  showPreview = false,
  onPreviewToggle,
  fileInfo,
  syntaxHelp,
  enableRichTextMode = false,
  plantUMLSettings,
}: CodeEditorProps) {
  const [localContent, setLocalContent] = useState(content);
  const [hasChanges, setHasChanges] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [isRichTextMode, setIsRichTextMode] = useState(false);

  // Sync local content with prop content
  useEffect(() => {
    setLocalContent(content);
    setHasChanges(false);
  }, [content]);

  const handleContentChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newContent = e.target.value;
      setLocalContent(newContent);
      setHasChanges(newContent !== content);
      onContentChange?.(newContent);
    },
    [content, onContentChange]
  );

  const handleSave = useCallback(async () => {
    if (onSave) {
      await onSave();
      setHasChanges(false);
    }
  }, [onSave]);

  const handleLoad = useCallback(async () => {
    if (onLoad) {
      try {
        const loadedContent = await onLoad();
        setLocalContent(loadedContent);
        setHasChanges(false);
      } catch (error) {
        console.error('Failed to load content:', error);
      }
    }
  }, [onLoad]);

  const insertSnippet = useCallback(
    (snippet: string) => {
      const textarea = document.querySelector(
        `textarea[data-editor="${title}"]`
      ) as HTMLTextAreaElement;
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newContent =
          localContent.substring(0, start) +
          snippet +
          localContent.substring(end);
        setLocalContent(newContent);
        setHasChanges(true);
        onContentChange?.(newContent);

        // Set cursor position after the inserted snippet
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(
            start + snippet.length,
            start + snippet.length
          );
        }, 0);
      }
    },
    [localContent, onContentChange, title]
  );

  const getLanguageLabel = () => {
    switch (language) {
      case 'markdown':
        return 'Markdown';
      case 'yaml':
        return 'YAML';
      case 'plantuml':
        return 'PlantUML';
      default:
        return 'Text';
    }
  };

  if (isLoading) {
    return (
      <div
        className={cn(
          'flex items-center justify-center h-64 bg-slate-50 rounded-lg border',
          className
        )}
      >
        <div className="flex items-center gap-2 text-slate-500">
          <div className="animate-spin h-4 w-4 border-2 border-slate-300 border-t-slate-600 rounded-full"></div>
          <span>Loading {title}...</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex flex-col h-full bg-white rounded-lg border',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-slate-50 rounded-t-lg">
        <div className="flex items-center gap-3">
          <Code2 className="w-5 h-5 text-slate-600" />
          <div>
            <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>{getLanguageLabel()}</span>
              {fileInfo && (
                <>
                  <span>•</span>
                  <span>{fileInfo.path}</span>
                  {fileInfo.lastModified && (
                    <>
                      <span>•</span>
                      <span>
                        Modified {fileInfo.lastModified.toLocaleDateString()}
                      </span>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
          {hasChanges && (
            <div
              className="w-2 h-2 bg-orange-400 rounded-full"
              title="Unsaved changes"
            />
          )}
        </div>

        <div className="flex items-center gap-2">
          {enableRichTextMode && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsRichTextMode(!isRichTextMode)}
              className="text-slate-600"
              title={
                isRichTextMode
                  ? 'Switch to plain text'
                  : 'Switch to rich text editor'
              }
            >
              {isRichTextMode ? (
                <Code2 className="w-4 h-4" />
              ) : (
                <FileText className="w-4 h-4" />
              )}
            </Button>
          )}

          {syntaxHelp && !isRichTextMode && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHelp(!showHelp)}
              className="text-slate-600"
              title="Show syntax help"
            >
              <Edit3 className="w-4 h-4" />
            </Button>
          )}

          {onPreviewToggle && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onPreviewToggle}
              className="text-slate-600"
              title={showPreview ? 'Show editor' : 'Show preview'}
            >
              {showPreview ? (
                <Edit3 className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </Button>
          )}

          {onLoad && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleLoad}
              disabled={isLoading}
              className="flex items-center gap-2"
              title="Load from file"
            >
              <FolderOpen className="w-4 h-4" />
              Load
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setLocalContent(content);
              setHasChanges(false);
            }}
            disabled={!hasChanges}
            className="flex items-center gap-2"
            title="Reset changes"
          >
            <RefreshCw className="w-4 h-4" />
            Reset
          </Button>

          {onSave && (
            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
              disabled={isSaving || !hasChanges || readOnly}
              className="flex items-center gap-2"
              title={readOnly ? 'Read only' : 'Save changes'}
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Syntax Help Sidebar - only show in plain text mode */}
        {syntaxHelp && showHelp && !isRichTextMode && (
          <div className="w-80 border-r bg-slate-50 p-4 overflow-y-auto">
            <h4 className="font-semibold text-slate-900 mb-3">
              {syntaxHelp.title}
            </h4>
            <div className="space-y-3">
              {syntaxHelp.examples.map((example, index) => (
                <div
                  key={index}
                  className="border border-slate-200 rounded-lg p-3 bg-white"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">
                      {example.label}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => insertSnippet(example.snippet)}
                      className="text-xs h-6 px-2"
                    >
                      Insert
                    </Button>
                  </div>
                  <pre className="text-xs text-slate-600 bg-slate-50 p-2 rounded border font-mono overflow-x-auto">
                    {example.snippet}
                  </pre>
                  {example.description && (
                    <p className="text-xs text-slate-500 mt-1">
                      {example.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Editor */}
        <div className="flex-1">
          {isRichTextMode ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              Rich Text Editor temporarily disabled
            </div>
          ) : (
            /* <RichTextEditor
              title={title}
              content={localContent}
              onContentChange={handleContentChange}
              onSave={handleSave}
              onLoad={handleLoad}
              isLoading={isLoading}
              isSaving={isSaving}
              readOnly={readOnly}
              placeholder={placeholder}
              fileInfo={fileInfo}
              enablePlantUMLSupport={language === 'plantuml'}
              plantUMLSettings={plantUMLSettings}
              className="h-full border-0 rounded-none"
            /> */
            <div className="p-4 h-full">
              <textarea
                data-editor={title}
                value={localContent}
                onChange={handleContentChange}
                readOnly={readOnly}
                placeholder={placeholder}
                className={cn(
                  'w-full h-full resize-none rounded-lg border border-slate-200 p-4',
                  'font-mono text-sm leading-relaxed',
                  'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                  'placeholder:text-slate-400',
                  readOnly && 'bg-slate-50 text-slate-700'
                )}
                spellCheck={language === 'markdown'}
              />
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between p-3 border-t bg-slate-50 text-xs text-slate-500 rounded-b-lg">
        <div className="flex items-center gap-4">
          <span>Lines: {localContent.split('\n').length}</span>
          <span>Characters: {localContent.length}</span>
          {fileInfo?.size && (
            <span>Size: {Math.round(fileInfo.size / 1024)}KB</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <span className="text-orange-600">Unsaved changes</span>
          )}
          <span className="text-slate-400">{getLanguageLabel()}</span>
          {enableRichTextMode && <span className="text-slate-400">•</span>}
          {enableRichTextMode && (
            <span className="text-slate-400">
              {isRichTextMode ? 'Rich Text' : 'Plain Text'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
