import { type NodeProps } from '@xyflow/react';
import { Badge } from '../../../../shared/components';
import { BaseNode, type BaseNodeData } from './BaseNode';

export interface OutputTypeNodeData extends BaseNodeData {
  properties: {
    outputType?:
      | 'json'
      | 'xml'
      | 'yaml'
      | 'text'
      | 'markdown'
      | 'csv'
      | 'html'
      | 'pdf'
      | 'binary';
    format?: string;
    template?: string;
    templateType?:
      | 'mustache'
      | 'handlebars'
      | 'jinja2'
      | 'ejs'
      | 'nunjucks'
      | 'plain';
    encoding?: 'utf-8' | 'utf-16' | 'ascii' | 'iso-8859-1' | 'base64' | 'hex';
    compression?: 'none' | 'gzip' | 'deflate' | 'brotli';
    destination?: 'console' | 'file' | 'http' | 'clipboard' | 'variable';
    destinationPath?: string;
  };
}

export function OutputTypeNode(props: NodeProps) {
  const { data } = props;
  const nodeData = data as unknown as OutputTypeNodeData;
  const outputType = (nodeData.properties?.outputType as string) || 'text';
  const format = nodeData.properties?.format || '';
  const template = nodeData.properties?.template;
  const templateType = nodeData.properties?.templateType;
  const encoding = nodeData.properties?.encoding;
  const compression = nodeData.properties?.compression;
  const destination = nodeData.properties?.destination;
  const destinationPath = nodeData.properties?.destinationPath;

  const getTypeColor = () => {
    // All badges should use white text for consistency
    return 'text-white border-white/20';
  };

  const getDestinationIcon = () => {
    switch (destination) {
      case 'file':
        return '💾';
      case 'http':
        return '🌐';
      case 'clipboard':
        return '📋';
      case 'variable':
        return '🔗';
      default:
        return '📺';
    }
  };

  return (
    <BaseNode {...props} variant="output">
      <div className="space-y-2">
        <div className="flex items-center gap-1">
          <span className="text-xs font-medium text-white">Type:</span>
          <Badge className={`text-xs py-0 ${getTypeColor()}`} variant="outline">
            {outputType.toUpperCase()}
          </Badge>
        </div>

        {format && (
          <div className="space-y-1">
            <span className="text-xs font-medium text-white">Format:</span>
            <div className="text-xs text-white truncate">{format}</div>
          </div>
        )}

        {template && (
          <div className="space-y-1">
            <span className="text-xs font-medium text-white">Template:</span>
            <div className="text-xs text-white/80 truncate">
              {templateType && templateType !== 'plain' && (
                <span className="text-xs opacity-75">{templateType}: </span>
              )}
              {template.length > 30
                ? `${template.substring(0, 30)}...`
                : template}
            </div>
          </div>
        )}

        {encoding && encoding !== 'utf-8' && (
          <div className="flex items-center gap-1">
            <span className="text-xs font-medium text-white">Encoding:</span>
            <Badge
              className={`text-xs py-0 ${getTypeColor()}`}
              variant="outline"
            >
              {encoding.toUpperCase()}
            </Badge>
          </div>
        )}

        {compression && compression !== 'none' && (
          <div className="flex items-center gap-1">
            <span className="text-xs font-medium text-white">Compressed:</span>
            <Badge
              className={`text-xs py-0 ${getTypeColor()}`}
              variant="outline"
            >
              {compression.toUpperCase()}
            </Badge>
          </div>
        )}

        <div className="flex items-center gap-1 text-xs text-white">
          <span>{getDestinationIcon()}</span>
          <span>
            {destination === 'file' || destination === 'http'
              ? destinationPath
                ? `${destination}: ${destinationPath.length > 20 ? `${destinationPath.substring(0, 20)}...` : destinationPath}`
                : `${destination} output`
              : `${destination || 'console'} output`}
          </span>
        </div>
      </div>
    </BaseNode>
  );
}
