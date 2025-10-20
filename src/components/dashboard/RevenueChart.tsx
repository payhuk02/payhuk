import { memo, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent } from "@/components/ui/card";

interface RevenueChartProps {
  data: Array<{
    month: string;
    revenue: number;
  }>;
}

export const RevenueChart = memo(({ data }: RevenueChartProps) => {
  const formatCurrency = useMemo(() => (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }, []);

  const CustomTooltip = useMemo(() => ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-primary">
            Revenus: {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  }, [formatCurrency]);

  // Données optimisées avec memo
  const chartData = useMemo(() => {
    return data.map(item => ({
      ...item,
      revenue: Number(item.revenue) || 0
    }));
  }, [data]);

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis 
            dataKey="month" 
            tick={{ fontSize: 12 }}
            tickLine={{ stroke: 'currentColor', opacity: 0.3 }}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            tickLine={{ stroke: 'currentColor', opacity: 0.3 }}
            tickFormatter={formatCurrency}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line 
            type="monotone" 
            dataKey="revenue" 
            stroke="hsl(var(--primary))" 
            strokeWidth={3}
            dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
});

RevenueChart.displayName = 'RevenueChart';
