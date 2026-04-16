import { cn } from '@/lib/utils';

interface PanelProps {
  title?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function Panel({ title, icon, children, actions, className }: PanelProps) {
  return (
    <div className={cn('flex flex-col h-full bg-white border-r', className)}>
      {/* 面板头部 */}
      {(title || actions) && (
        <div className="flex items-center justify-between px-3 py-2 border-b bg-gray-50">
          <div className="flex items-center gap-2">
            {icon && <span className="text-gray-500">{icon}</span>}
            {title && <h3 className="font-medium text-sm text-gray-700">{title}</h3>}
          </div>
          {actions && <div className="flex items-center gap-1">{actions}</div>}
        </div>
      )}
      
      {/* 面板内容 */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}
