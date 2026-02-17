import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { MapPin, TrendingUp } from 'lucide-react';


export function SpeciesDistributionChart() {
  const [data, setData] = useState<{ name: string; count: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    console.log('[Chart Debug] Component mounted, starting fetch from "identifications"...');

    // Check config immediately
    const hasUrl = !!import.meta.env.VITE_SUPABASE_URL;
    const hasKey = !!import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!hasUrl || !hasKey) {
      console.error('[Chart Debug] Missing Supabase Config');
      setErrorMsg(`Missing Supabase Configuration. URL: ${hasUrl}, Key: ${hasKey}. Check Vercel Environment Variables.`);
      setIsLoading(false);
      return;
    }

    async function fetchSpeciesData() {
      try {
        console.log('[Chart Debug] Starting fetch with 5s timeout...');

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Request timed out (15000ms) - Database might be paused or slow')), 15000)
        );

        const fetchPromise = supabase
          .from('identifications')
          .select('species, location');

        const result = await Promise.race([fetchPromise, timeoutPromise]) as any;

        // Handle explicit Supabase error
        if (result.error) {
          throw result.error;
        }

        const identificationsData = result.data;

        if (!isMounted) return;

        console.log('[Chart Debug] Fetched identifications data:', identificationsData?.length, 'records');

        if (identificationsData) {
          const locationCounts: Record<string, number> = {};

          identificationsData.forEach((item: any) => {
            let location = item.location || 'Unknown';
            location = location.trim();
            locationCounts[location] = (locationCounts[location] || 0) + 1;
          });

          const chartData = Object.entries(locationCounts)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count);

          setData(chartData);
        }
      } catch (err: any) {
        console.error('[Chart Debug] Error or Timeout:', err);
        if (isMounted) {
          setErrorMsg(err.message || 'Unknown error occurred');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchSpeciesData();

    return () => {
      isMounted = false;
    };
  }, []);

  const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6'];

  if (isLoading) {
    return (
      <section className="py-8">
        <div className="w-full h-[400px] bg-card rounded-2xl p-6 flex items-center justify-center">
          <p className="text-muted-foreground animate-pulse">Loading chart data...</p>
        </div>
      </section>
    );
  }

  if (data.length === 0 || errorMsg) {
    return (
      <section className="py-8">
        <div className="w-full h-[400px] bg-card rounded-2xl p-6 flex flex-col items-center justify-center text-center">
          <p className="text-red-500 font-semibold mb-2">
            {errorMsg ? 'Error Loading Data' : 'No data to display'}
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            {errorMsg || "The database returned 0 records from 'identifications'. RLS might be blocking access."}
          </p>

          <div className="bg-gray-100 p-4 rounded text-xs text-left overflow-auto max-w-lg mx-auto">
            <p className="font-bold mb-1">Troubleshooting:</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>Check Vercel Environment Variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)</li>
              <li>Ensure "identifications" table exists and has data</li>
              <li>Check RLS Policies: `CREATE POLICY "Public Read" ON identifications FOR SELECT USING (true);`</li>
            </ul>
          </div>
          <div className="mt-4 p-4 bg-gray-100 rounded text-xs text-left overflow-auto max-w-md">
            <code>
              Run in Supabase SQL Editor:<br />
              CREATE POLICY "Public Read Access" ON public.identifications FOR SELECT USING (true);
            </code>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Retry Connection
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-xl bg-orange-100 text-orange-600">
          <TrendingUp className="w-5 h-5" />
        </div>
        <h2 className="font-display text-2xl font-semibold text-foreground">
          Species Distribution by Area ({data.reduce((acc, curr) => acc + curr.count, 0)} items)
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
