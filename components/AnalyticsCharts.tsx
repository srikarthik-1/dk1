
import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import type { Customer } from '../types';

interface AnalyticsChartsProps {
  customers: Customer[];
  chartType?: 'line' | 'pie';
}

const COLORS = ['#000000', '#6b7280', '#d1d5db'];

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ customers, chartType = 'line' }) => {
  // Mock data for line chart as in original
  const lineChartData = useMemo(() => [
    { name: 'Week 1', Revenue: 12000, Points: 500 },
    { name: 'Week 2', Revenue: 19000, Points: 1200 },
    { name: 'Week 3', Revenue: 15000, Points: 800 },
    { name: 'Week 4', Revenue: 22000, Points: 1500 },
  ], []);
  
  const pieChartData = useMemo(() => {
    let low = 0, mid = 0, high = 0;
    customers.forEach(c => {
        if((c.totalSpent || 0) > 10000) high++;
        else if((c.totalSpent || 0) > 2000) mid++;
        else low++;
    });
    return [
      { name: 'VIP (>10k)', value: high },
      { name: 'Regular (>2k)', value: mid },
      { name: 'New (<2k)', value: low },
    ];
  }, [customers]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/80 backdrop-blur-sm border border-neutral-300 p-3 rounded-md shadow-lg">
          <p className="font-bold text-black">{label}</p>
          {payload.map((pld: any) => (
             <p key={pld.dataKey} style={{ color: pld.color }}>
                {pld.dataKey}: {pld.dataKey === 'Revenue' ? '₹' : ''}{pld.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (chartType === 'line') {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={lineChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis yAxisId="left" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${Number(value)/1000}k`} />
          <YAxis yAxisId="right" orientation="right" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{fontSize: "12px", color: '#374151'}}/>
          <Line yAxisId="left" type="monotone" dataKey="Revenue" stroke="#000000" strokeWidth={2} dot={{ r: 4, fill: '#000000' }} activeDot={{ r: 6 }} />
          <Line yAxisId="right" type="monotone" dataKey="Points" stroke="#6b7280" strokeDasharray="5 5" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  if (chartType === 'pie') {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={pieChartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={'80%'}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
            stroke="none"
          >
            {pieChartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{fontSize: "12px", color: '#374151'}}/>
        </PieChart>
      </ResponsiveContainer>
    );
  }

  return null;
};