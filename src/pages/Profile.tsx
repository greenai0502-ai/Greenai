import { User, LogOut } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [stats, setStats] = useState({
    scans: 0,
    plants: 0,
    saved: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchUserStats = useCallback(async () => {
    if (!user?.id) {
      console.log('No user ID available, skipping stats fetch');
      return;
    }

    try {
      setLoading(true);
      console.log('Fetching stats for user:', user.id);
      
      // Get token from localStorage instead of Supabase client
      console.log('Getting auth token from localStorage...');
      const authStorage = localStorage.getItem('sb-zzgdtsofmffjnthpihrs-auth-token');
      if (!authStorage) {
        console.error('No auth token in localStorage');
        setStats({ scans: 0, plants: 0, saved: 0 });
        return;
      }
      
      const authData = JSON.parse(authStorage);
      const accessToken = authData?.access_token;
      console.log('Access token found:', !!accessToken);
      
      if (!accessToken) {
        console.error('No access token');
        setStats({ scans: 0, plants: 0, saved: 0 });
        return;
      }
      
      // Use direct fetch with token from localStorage
      console.log('Fetching identifications...');
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/identifications?user_id=eq.${user.id}&select=species,found_in_database`,
        {
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );
      
      console.log('Fetch completed, status:', response.status);

      if (!response.ok) {
        console.error('Error fetching stats:', response.status);
        setStats({ scans: 0, plants: 0, saved: 0 });
        toast({
          title: "Failed to load stats",
          description: `HTTP ${response.status}`,
          variant: "destructive",
        });
        return;
      }

      const identifications = await response.json();
      console.log('Identifications fetched:', identifications);

      if (identifications) {
        const scans = identifications.length;
        const uniqueSpecies = new Set(identifications.map(id => id.species));
        const plants = uniqueSpecies.size;
        const saved = identifications.filter(id => id.found_in_database).length;

        console.log('Stats calculated:', { scans, plants, saved });
        setStats({ scans, plants, saved });
      } else {
        setStats({ scans: 0, plants: 0, saved: 0 });
      }
    } catch (error: any) {
      console.error('Error fetching user stats:', error);
      setStats({ scans: 0, plants: 0, saved: 0 });
      toast({
        title: "Error",
        description: error.message || "Failed to load statistics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      console.log('Fetch complete');
    }
  }, [user?.id, toast]);

  useEffect(() => {
    if (user?.id) {
      console.log('User changed or component mounted, fetching stats...');
      fetchUserStats();

      // Subscribe to realtime changes in identifications table
      console.log('Setting up realtime subscription for identifications...');
      const subscription = supabase
        .channel('identifications-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'identifications',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('Realtime event received:', payload);
            // Refetch stats when any change occurs
            fetchUserStats();
          }
        )
        .subscribe((status) => {
          console.log('Subscription status:', status);
        });

      // Listen for custom events as fallback (when realtime isn't enabled)
      const handleIdentificationSaved = () => {
        console.log('Custom event received: identification-saved');
        fetchUserStats();
      };
      window.addEventListener('identification-saved', handleIdentificationSaved);

      // Cleanup subscription on unmount or user change
      return () => {
        console.log('Cleaning up realtime subscription and event listeners');
        subscription.unsubscribe();
        window.removeEventListener('identification-saved', handleIdentificationSaved);
      };
    } else {
      console.log('No user logged in');
    }
  }, [user?.id, fetchUserStats]);

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged out",
        description: "You've been successfully logged out.",
      });
      navigate('/', { replace: true });
    } catch (error: any) {
      console.error('Logout error:', error);
      toast({
        title: "Logout failed",
        description: error.message || "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8 max-w-lg">
        {/* Profile Card */}
        <div className="bg-card rounded-2xl p-6 card-shadow text-center mb-6 animate-fade-in">
          <div className="relative inline-block mb-4">
            <div className="w-24 h-24 rounded-full nature-gradient flex items-center justify-center">
              <User className="w-12 h-12 text-primary-foreground" />
            </div>
          </div>
          <h2 className="font-display text-2xl font-bold text-foreground mb-1">
            {user?.name || 'User'}
          </h2>
          <p className="text-muted-foreground">{user?.email}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Scans', value: loading ? '...' : stats.scans.toString() },
            { label: 'Plants', value: loading ? '...' : stats.plants.toString() },
            { label: 'Saved', value: loading ? '...' : stats.saved.toString() },
          ].map((stat, index) => (
            <div
              key={stat.label}
              className="bg-card rounded-xl p-4 card-shadow text-center animate-fade-in"
              style={{ animationDelay: `${(index + 1) * 100}ms` }}
            >
              <p className="text-2xl font-bold text-primary">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Menu Items */}
        <div className="bg-card rounded-2xl overflow-hidden card-shadow animate-fade-in" style={{ animationDelay: '300ms' }}>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 p-4 hover:bg-destructive/10 transition-colors text-destructive"
          >
            <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
              <LogOut className="w-5 h-5" />
            </div>
            <span className="flex-1 text-left font-medium">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}
