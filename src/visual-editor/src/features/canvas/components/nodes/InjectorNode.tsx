import { type NodeProps } from '@xyflow/react';
import { Calendar, Clock, Play, Webhook } from 'lucide-react';
import { Badge } from '../../../../shared/components';
import { BaseNode, type BaseNodeData } from './BaseNode';

export interface InjectorNodeData extends BaseNodeData {
  properties: {
    triggerType?: 'manual' | 'interval' | 'cron' | 'webhook';
    payload?: string;
    payloadType?:
      | 'json'
      | 'string'
      | 'number'
      | 'boolean'
      | 'timestamp'
      | 'buffer';
    interval?: number;
    cronExpression?: string;
    autoStart?: boolean;
    repeatCount?: number;
  };
}

export function InjectorNode(props: NodeProps) {
  const { data } = props;
  const nodeData = data as unknown as InjectorNodeData;
  const triggerType = nodeData.properties?.triggerType || 'manual';
  const interval = nodeData.properties?.interval || 60;
  const cronExpression = nodeData.properties?.cronExpression || '0 * * * * *';
  const autoStart = nodeData.properties?.autoStart || false;
  const payloadType = nodeData.properties?.payloadType || 'json';

  const getTriggerIcon = () => {
    switch (triggerType) {
      case 'interval':
        return <Clock className="w-4 h-4" />;
      case 'cron':
        return <Calendar className="w-4 h-4" />;
      case 'webhook':
        return <Webhook className="w-4 h-4" />;
      default:
        return <Play className="w-4 h-4" />;
    }
  };

  const getTriggerLabel = () => {
    switch (triggerType) {
      case 'interval':
        return `Every ${interval}s`;
      case 'cron':
        return cronExpression.length > 15
          ? `${cronExpression.substring(0, 12)}...`
          : cronExpression;
      case 'webhook':
        return 'On webhook';
      default:
        return 'Manual';
    }
  };

  const getTypeColor = () => {
    switch (triggerType) {
      case 'interval':
        return 'text-white border-white/20 bg-blue-500/20';
      case 'cron':
        return 'text-white border-white/20 bg-purple-500/20';
      case 'webhook':
        return 'text-white border-white/20 bg-orange-500/20';
      default:
        return 'text-white border-white/20 bg-green-500/20';
    }
  };

  return (
    <BaseNode {...props} variant="trigger">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="text-white">{getTriggerIcon()}</div>
          <Badge className={`text-xs py-0 ${getTypeColor()}`} variant="outline">
            {getTriggerLabel()}
          </Badge>
        </div>

        {payloadType !== 'json' && (
          <div className="flex items-center gap-1">
            <span className="text-xs font-medium text-white">Type:</span>
            <Badge
              className="text-xs py-0 text-white border-white/20 bg-white/10"
              variant="outline"
            >
              {payloadType.toUpperCase()}
            </Badge>
          </div>
        )}

        <div className="flex items-center gap-2 text-xs text-white">
          {autoStart && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span>Auto-start</span>
            </div>
          )}
          <span>⚡ Trigger</span>
        </div>
      </div>
    </BaseNode>
  );
}
