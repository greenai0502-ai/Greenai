import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { MapPin, TrendingUp } from 'lucide-react';

export function SpeciesDistributionChart() {
  const [data, setData] = useState<{ name: string; count: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check for mobile on mount and resize
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    let isMounted = true;
    console.log('[Chart Debug] Component mounted, starting fetch from CSV...');

    async function fetchSpeciesData() {
      try {
        // Fetch CSV file locally
        // Note: In production, ensure this file is accessible via public URL
        const response = await fetch('/data/species_data.csv');

        if (!response.ok) {
          throw new Error(`Failed to fetch CSV data: ${response.status} ${response.statusText}`);
        }

        const csvText = await response.text();
        console.log('[Chart Debug] CSV content loaded, length:', csvText.length);

        // Simple CSV Parser
        const lines = csvText.split('\n');
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

        const speciesIndex = headers.indexOf('species');
        const locationIndex = headers.indexOf('location');

        if (speciesIndex === -1 || locationIndex === -1) {
          throw new Error('CSV headers must include "species" and "location"');
        }

        const parsedData = lines.slice(1)
          .map(line => {
            const values = line.split(',');
            if (values.length < 2) return null;
            return {
              species: values[speciesIndex]?.trim(),
              location: values[locationIndex]?.trim()
            };
          })
          .filter(item => item && item.species && item.location);

        console.log('[Chart Debug] Parsed CSV data:', parsedData.length, 'records');

        if (!isMounted) return;

        if (parsedData.length > 0) {
          const locationCounts: Record<string, number> = {};

          parsedData.forEach((item) => {
            if (!item) return;
            let location = item.location || 'Unknown';
            location = location.trim();
            locationCounts[location] = (locationCounts[location] || 0) + 1;
          });

          const chartData = Object.entries(locationCounts)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count);

          setData(chartData);
          setErrorMsg(null);
        } else {
          setErrorMsg('CSV file is empty or contains no valid data rows');
        }
      } catch (err: any) {
        console.error('[Chart Debug] Error:', err);
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
  const OTHER_COLOR = '#9CA3AF'; // Gray for 'Others'
  const csvFile = '/data/species_data.csv';

  // Prepare data for mobile (group small values)
  const getMobileData = () => {
    if (data.length <= 6) return data;

    const topItems = data.slice(0, 5);
    const otherItems = data.slice(5);
    const otherCount = otherItems.reduce((sum, item) => sum + item.count, 0);

    return [
      ...topItems,
      { name: 'Others', count: otherCount }
    ];
  };

  const mobileData = isMobile ? getMobileData() : [];

  // Custom Label for Pie Chart
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    // Only show label if percentage is significant (> 5%)
    if (percent < 0.05) return null;

    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={12} fontWeight="bold">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

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
            {errorMsg || "0 records found in CSV file."}
          </p>

          <div className="bg-gray-100 p-4 rounded text-xs text-left overflow-auto max-w-lg mx-auto">
            <p className="font-bold mb-1">Diagnostic Info:</p>
            <ul className="list-disc pl-4 space-y-1">
              <li><strong>Source:</strong> CSV File ({csvFile})</li>
              <li><strong>Status:</strong> {errorMsg ? 'Failed' : 'Empty'}</li>
            </ul>
            <p className="mt-2 font-bold">Troubleshooting:</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>Check browser console for [Chart Debug] logs</li>
              <li>Ensure '/public/data/species_data.csv' exists</li>
              <li>Verify CSV format (header: species,location)</li>
            </ul>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Retry Loading
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

      <div className={`w-full ${isMobile ? 'h-[500px]' : 'h-[400px]'} bg-card rounded-2xl p-4 md:p-6 shadow-sm border border-border`}>
        <div className="flex items-center gap-2 mb-4 text-xs md:text-sm text-muted-foreground">
          <MapPin className="w-3 h-3 md:w-4 md:h-4" />
          <span>Number of discovered species per location</span>
        </div>

        <ResponsiveContainer width="100%" height="100%">
          {isMobile ? (
            <PieChart margin={{ top: 20, bottom: 20 }}>
              <Pie
                data={mobileData}
                cx="50%"
                cy="45%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={100}
                fill="#8884d8"
                dataKey="count"
                paddingAngle={2}
              >
                {mobileData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.name === 'Others' ? OTHER_COLOR : COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  borderRadius: '8px',
                  border: '1px solid #E5E7EB',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  fontSize: '12px'
                }}
              />
              <Legend
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
                wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
              />
            </PieChart>
          ) : (
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
          )}
        </ResponsiveContainer>
      </div>
    </section>
  );
}
