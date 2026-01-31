import { FC } from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner: FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-gray-600 border-t-blue-500`}
      />
    </div>
  );
};

interface LoadingOverlayProps {
  message?: string;
}

export const LoadingOverlay: FC<LoadingOverlayProps> = ({ 
  message = 'Loading...' 
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <LoadingSpinner size="lg" />
        <p className="text-gray-300 text-sm">{message}</p>
      </div>
    </div>
  );
};

interface SkeletonProps {
  className?: string;
}

export const Skeleton: FC<SkeletonProps> = ({ className = '' }) => {
  return (
    <div
      className={`animate-pulse bg-gray-700 rounded ${className}`}
    />
  );
};

interface SkeletonCardProps {
  lines?: number;
}

export const SkeletonCard: FC<SkeletonCardProps> = ({ lines = 3 }) => {
  return (
    <div className="bg-gray-800 rounded-lg p-4 space-y-3">
      <Skeleton className="h-6 w-3/4" />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className="h-4 w-full" />
      ))}
    </div>
  );
};

interface SkeletonTableProps {
  rows?: number;
  columns?: number;
}

export const SkeletonTable: FC<SkeletonTableProps> = ({ 
  rows = 5, 
  columns = 4 
}) => {
  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex gap-4 p-4 border-b border-gray-700">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4 p-4 border-b border-gray-700/50">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
};

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState: FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {icon && (
        <div className="text-gray-500 mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-medium text-gray-300 mb-2">{title}</h3>
      {description && (
        <p className="text-gray-500 text-sm max-w-sm mb-4">{description}</p>
      )}
      {action}
    </div>
  );
};

interface StatusBadgeProps {
  status: 'healthy' | 'warning' | 'critical' | 'unknown' | 'pending' | 'success' | 'failed';
  label?: string;
  pulse?: boolean;
}

export const StatusBadge: FC<StatusBadgeProps> = ({ 
  status, 
  label, 
  pulse = false 
}) => {
  const statusConfig = {
    healthy: { bg: 'bg-green-500/20', text: 'text-green-400', dot: 'bg-green-500' },
    success: { bg: 'bg-green-500/20', text: 'text-green-400', dot: 'bg-green-500' },
    warning: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', dot: 'bg-yellow-500' },
    pending: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', dot: 'bg-yellow-500' },
    critical: { bg: 'bg-red-500/20', text: 'text-red-400', dot: 'bg-red-500' },
    failed: { bg: 'bg-red-500/20', text: 'text-red-400', dot: 'bg-red-500' },
    unknown: { bg: 'bg-gray-500/20', text: 'text-gray-400', dot: 'bg-gray-500' },
  };

  const config = statusConfig[status] || statusConfig.unknown;
  const displayLabel = label || status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot} ${pulse ? 'animate-pulse' : ''}`} />
      {displayLabel}
    </span>
  );
};

interface ProgressBarProps {
  value: number;
  max?: number;
  showLabel?: boolean;
  color?: 'blue' | 'green' | 'yellow' | 'red';
  size?: 'sm' | 'md' | 'lg';
}

export const ProgressBar: FC<ProgressBarProps> = ({
  value,
  max = 100,
  showLabel = false,
  color = 'blue',
  size = 'md',
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
  };
  
  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  return (
    <div className="w-full">
      <div className={`w-full bg-gray-700 rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <div
          className={`${colorClasses[color]} h-full rounded-full transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <div className="text-xs text-gray-400 mt-1 text-right">
          {percentage.toFixed(0)}%
        </div>
      )}
    </div>
  );
};
