import { memo, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Badge } from "@/components/ui/badge";

interface TopProductsChartProps {
  products: Array<{
    id: string;
    name: string;
    price: number;
    sales_count: number;
    category: string;
  }>;
}

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--secondary))',
  'hsl(var(--accent))',
  'hsl(var(--muted))',
  'hsl(var(--destructive))',
  'hsl(var(--warning))',
  'hsl(var(--success))',
];

export const TopProductsChart = memo(({ products }: TopProductsChartProps) => {
  const formatNumber = useMemo(() => (value: number) => {
    return new Intl.NumberFormat('fr-FR').format(value);
  }, []);

  const CustomTooltip = useMemo(() => ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-primary">
            Ventes: {formatNumber(data.value)}
          </p>
          <p className="text-muted-foreground text-sm">
            Produits: {data.payload.count}
          </p>
        </div>
      );
    }
    return null;
  }, [formatNumber]);

  const CustomLegend = useMemo(() => ({ payload }: any) => {
    return (
      <div className="flex flex-wrap gap-2 justify-center mt-4">
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-muted-foreground">
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }, []);

  // Grouper par catégorie avec memo
  const chartData = useMemo(() => {
    if (!Array.isArray(products) || products.length === 0) {
      return [];
    }

    const categoryData = products.reduce((acc: any, product) => {
      const category = product.category || 'Sans catégorie';
      if (!acc[category]) {
        acc[category] = { name: category, value: 0, count: 0 };
      }
      acc[category].value += Number(product.sales_count) || 0;
      acc[category].count += 1;
      return acc;
    }, {});

    return Object.values(categoryData).slice(0, 6); // Top 6 catégories
  }, [products]);

  if (chartData.length === 0) {
    return (
      <div className="h-[300px] w-full flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <p>Aucune donnée disponible</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
});

TopProductsChart.displayName = 'TopProductsChart';
