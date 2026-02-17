import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { MapPin, TrendingUp } from 'lucide-react';


export function SpeciesDistributionChart() {
  const [data, setData] = useState<{ name: string; count: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchSpeciesData() {
      try {
        const { data: speciesData, error } = await supabase
          .from('species')
          .select('location');

        if (error) {
          console.error('Error fetching species data:', error);
          return;
        }

        if (speciesData) {
          // Count species by location
          const locationCounts: Record<string, number> = {};

          speciesData.forEach((species) => {
            const location = species.location || 'Unknown';
            locationCounts[location] = (locationCounts[location] || 0) + 1;
          });

          // Convert to array format for Recharts
          const chartData = Object.entries(locationCounts)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count);

          setData(chartData);
        }
      } catch (err) {
        console.error('Unexpected error fetching chart data:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchSpeciesData();
  }, []);

  const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6'];

  return (
    <section className="py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-xl bg-orange-100 text-orange-600">
          <TrendingUp className="w-5 h-5" />
        </div>
        <h2 className="font-display text-2xl font-semibold text-foreground">
          Species Distribution by Area
        </h2>
      </div>

      <div className="w-full h-[400px] bg-card rounded-2xl p-6 shadow-sm border border-border">
        <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4" />
          <span>Number of discovered species per location</span>
        </div>

        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 60,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
            <XAxis
              dataKey="name"
              angle={-45}
              textAnchor="end"
              interval={0}
              height={80}
              tick={{ fontSize: 12, fill: '#6B7280' }}
              stroke="#D1D5DB"
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 12, fill: '#6B7280' }}
              stroke="#D1D5DB"
            />
            <Tooltip
              cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '8px',
                border: '1px solid #E5E7EB',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]} animationDuration={1500}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
