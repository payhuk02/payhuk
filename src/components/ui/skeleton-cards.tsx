import { cn } from "@/lib/utils";

interface SkeletonCardProps {
  className?: string;
  showIcon?: boolean;
  showDescription?: boolean;
}

export const SkeletonCard = ({ 
  className, 
  showIcon = true, 
  showDescription = true 
}: SkeletonCardProps) => {
  return (
    <div className={cn("rounded-lg border bg-card p-6", className)}>
      <div className="flex items-center justify-between space-y-0 pb-2">
        <div className="h-4 w-24 bg-muted animate-pulse rounded" />
        {showIcon && (
          <div className="h-4 w-4 bg-muted animate-pulse rounded" />
        )}
      </div>
      <div className="space-y-2">
        <div className="h-8 w-16 bg-muted animate-pulse rounded" />
        {showDescription && (
          <div className="h-3 w-20 bg-muted animate-pulse rounded" />
        )}
      </div>
    </div>
  );
};

interface SkeletonChartProps {
  className?: string;
}

export const SkeletonChart = ({ className }: SkeletonChartProps) => {
  return (
    <div className={cn("rounded-lg border bg-card p-6", className)}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-5 w-32 bg-muted animate-pulse rounded" />
          <div className="h-4 w-20 bg-muted animate-pulse rounded" />
        </div>
        <div className="h-[300px] w-full bg-muted animate-pulse rounded" />
      </div>
    </div>
  );
};

interface SkeletonTableProps {
  rows?: number;
  className?: string;
}

export const SkeletonTable = ({ rows = 5, className }: SkeletonTableProps) => {
  return (
    <div className={cn("rounded-lg border bg-card p-6", className)}>
      <div className="space-y-4">
        <div className="h-5 w-40 bg-muted animate-pulse rounded" />
        <div className="space-y-3">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <div className="h-4 w-4 bg-muted animate-pulse rounded" />
              <div className="h-4 w-24 bg-muted animate-pulse rounded" />
              <div className="h-4 w-16 bg-muted animate-pulse rounded" />
              <div className="h-4 w-20 bg-muted animate-pulse rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
