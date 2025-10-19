import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Code2,
  Edit3,
  Eye,
  FolderOpen,
  Maximize2,
  Minimize2,
  RefreshCw,
  Save,
} from 'lucide-react';
import { Button } from './Button';
import { cn } from '../../utils';

// Declare jQuery and Trumbowyg for TypeScript
declare global {
  interface Window {
    jQuery: any;
    $: any;
  }
}

export interface RichTextEditorProps {
  className?: string;
  title: string;
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
  height?: number;
  enablePlantUMLSupport?: boolean;
}

export function RichTextEditor({
  className,
  title,
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
  height = 400,
  enablePlantUMLSupport = false,
}: RichTextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [localContent, setLocalContent] = useState(content);
  const [hasChanges, setHasChanges] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

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
      if (onContentChange) {
        onContentChange(newContent);
      }
    },
    [content, onContentChange]
  );

  const handleSave = useCallback(async () => {
    if (onSave) {
      try {
        await onSave();
        setHasChanges(false);
      } catch (error) {
        console.error('Failed to save:', error);
      }
    }
  }, [onSave]);

  const handleLoad = useCallback(async () => {
    if (onLoad) {
      try {
        const loadedContent = await onLoad();
        setLocalContent(loadedContent);
        setHasChanges(false);
      } catch (error) {
        console.error('Failed to load:', error);
      }
    }
  }, [onLoad]);

  const handleRefresh = useCallback(() => {
    setLocalContent(content);
    setHasChanges(false);
  }, [content]);

  const handleFullscreen = useCallback(() => {
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

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
        'flex flex-col bg-white border border-gray-200 rounded-lg shadow-sm',
        isFullscreen && 'fixed inset-0 z-50 rounded-none',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium text-gray-900">{title}</h3>
          {hasChanges && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
              Unsaved
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          {onLoad && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLoad}
              disabled={isLoading}
              className="h-7 px-2"
            >
              <FolderOpen className="w-3 h-3" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            className="h-7 px-2"
          >
            <RefreshCw className="w-3 h-3" />
          </Button>
          {onPreviewToggle && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onPreviewToggle}
              className="h-7 px-2"
            >
              {showPreview ? (
                <Edit3 className="w-3 h-3" />
              ) : (
                <Eye className="w-3 h-3" />
              )}
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleFullscreen}
            className="h-7 px-2"
          >
            {isFullscreen ? (
              <Minimize2 className="w-3 h-3" />
            ) : (
              <Maximize2 className="w-3 h-3" />
            )}
          </Button>
          {onSave && (
            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              className="h-7 px-3"
            >
              {isSaving ? (
                <RefreshCw className="w-3 h-3 animate-spin" />
              ) : (
                <Save className="w-3 h-3" />
              )}
            </Button>
          )}
        </div>
      </div>

      {/* File Info */}
      {fileInfo && (
        <div className="px-3 py-2 text-xs text-gray-500 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <span className="font-mono truncate">{fileInfo.path}</span>
            <div className="flex items-center gap-4 ml-2">
              {fileInfo.lastModified && (
                <span>Modified: {fileInfo.lastModified.toLocaleString()}</span>
              )}
              {fileInfo.size && <span>Size: {fileInfo.size} bytes</span>}
            </div>
          </div>
        </div>
      )}

      {/* Editor */}
      <div className="flex-1 relative overflow-hidden">
        {showPreview ? (
          <div
            className="p-4 prose prose-sm max-w-none overflow-auto whitespace-pre-wrap"
            style={{
              height: isFullscreen ? 'calc(100vh - 120px)' : `${height}px`,
            }}
          >
            {localContent}
          </div>
        ) : (
          <textarea
            ref={textareaRef}
            className="w-full h-full p-4 resize-none border-0 focus:outline-none font-mono text-sm"
            style={{
              height: isFullscreen ? 'calc(100vh - 120px)' : `${height}px`,
            }}
            placeholder={placeholder}
            readOnly={readOnly}
            value={localContent}
            onChange={handleContentChange}
          />
        )}
      </div>
    </div>
  );
}
