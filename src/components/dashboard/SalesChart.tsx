import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface SalesChartProps {
  data: Array<{
    id: string;
    created_at: string;
    total_amount: number;
    status: string;
  }>;
}

export const SalesChart = ({ data }: SalesChartProps) => {
  // Grouper les commandes par jour
  const dailySales = data.reduce((acc: any, order) => {
    const date = format(new Date(order.created_at), 'dd/MM', { locale: fr });
    if (!acc[date]) {
      acc[date] = { date, sales: 0, orders: 0 };
    }
    acc[date].sales += order.total_amount;
    acc[date].orders += 1;
    return acc;
  }, {});

  const chartData = Object.values(dailySales).slice(-7); // 7 derniers jours

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-primary">
            Ventes: {formatCurrency(payload[0].value)}
          </p>
          <p className="text-muted-foreground text-sm">
            Commandes: {payload[0].payload.orders}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <defs>
            <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12 }}
            tickLine={{ stroke: 'currentColor', opacity: 0.3 }}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            tickLine={{ stroke: 'currentColor', opacity: 0.3 }}
            tickFormatter={(value) => formatCurrency(value)}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area 
            type="monotone" 
            dataKey="sales" 
            stroke="hsl(var(--primary))" 
            fillOpacity={1} 
            fill="url(#salesGradient)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
