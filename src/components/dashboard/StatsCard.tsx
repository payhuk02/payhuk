import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
  };
  className?: string;
}

export const StatsCard = ({ title, value, description, icon: Icon, trend, className }: StatsCardProps) => {
  return (
    <Card className={`shadow-soft hover:shadow-medium transition-smooth hover-scale ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between pb-1 sm:pb-2 p-2 sm:p-3 md:p-4 lg:p-6">
        <CardTitle className="text-[10px] sm:text-xs md:text-sm font-medium truncate">{title}</CardTitle>
        <Icon className="h-3 w-3 sm:h-4 sm:w-4 md:h-5 md:w-5 text-muted-foreground flex-shrink-0" />
      </CardHeader>
      <CardContent className="p-2 sm:p-3 md:p-4 lg:p-6 pt-0">
        <div className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-bold animate-fade-in break-words">{value}</div>
        {description && (
          <p className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground mt-1 line-clamp-1">{description}</p>
        )}
        {trend && (
          <div className="flex items-center gap-1 mt-1 sm:mt-2 flex-wrap">
            <Badge variant={trend.value >= 0 ? "default" : "destructive"} className="text-[9px] sm:text-[10px] md:text-xs">
              {trend.value >= 0 ? "+" : ""}{trend.value}%
            </Badge>
            <span className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground truncate">{trend.label}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
