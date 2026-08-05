import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export function useSubscription() {
  const { user } = useAuth();
  const isAuthenticated = !!user;
  const [tier, setTier] = useState('free'); // Default to free
  const [status, setStatus] = useState('active');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchSubscription() {
      if (!isAuthenticated || !user?.id) {
        setTier('free');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Supabase query using RLS. The user can only select their own row.
        const { data, error: sbError } = await supabase
          .from('subscriptions')
          .select('tier, status')
          .eq('user_id', user.id)
          .single();

        if (sbError) {
          // If no row exists, single() might throw a PGRST116. That's fine, it means they are 'free'.
          if (sbError.code !== 'PGRST116') {
            console.error('Error fetching subscription:', sbError);
            setError(sbError);
          }
          setTier('free');
        } else if (data) {
          setTier(data.tier);
          setStatus(data.status);
        }
      } catch (err) {
        console.error('Unexpected error fetching subscription:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    fetchSubscription();
  }, [user, isAuthenticated]);

  return {
    tier,
    status,
    loading,
    error,
    // Helper booleans for easy access gating in the UI
    isPremium: tier === 'weekly' || tier === 'monthly' || tier === 'annual',
    canUseAdvancedFilters: tier === 'annual',
    canUseMultiAppStacking: tier === 'monthly' || tier === 'annual',
  };
}
