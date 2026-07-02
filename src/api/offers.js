import { supabase } from '@/lib/supabase';

export const offersApi = {
  list: async (userId) => {
    if (!userId) return [];
    
    const { data, error } = await supabase
      .from('offers')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error('Error fetching offers:', error);
      return [];
    }
    
    return data;
  },

  create: async (offerData, userId) => {
    if (!userId) throw new Error('User must be logged in');

    // Flatten metrics into the main object to save to DB, or store metrics as JSONB
    // The previous app just saved everything flat. Let's do a flat insert.
    const dbPayload = {
      user_id: userId,
      platform: offerData.platform || 'Spark',
      pay: offerData.pay,
      tips: offerData.tips,
      miles: offerData.miles,
      miles_back: offerData.miles_back,
      time_minutes: offerData.time_minutes,
      items: offerData.items,
      dropoff_zone: offerData.dropoff_zone,
      rating: offerData.rating,
      net_profit: offerData.metrics?.net_profit || 0,
      hourly_rate: offerData.metrics?.hourly_rate || 0,
      per_mile_rate: offerData.metrics?.per_mile_rate || 0,
      gas_cost: offerData.metrics?.gas_cost || 0
    };

    const { data, error } = await supabase
      .from('offers')
      .insert([dbPayload])
      .select()
      .single();

    if (error) {
      console.error('Error creating offer:', error);
      throw error;
    }

    return data;
  },

  delete: async (id) => {
    const { error } = await supabase
      .from('offers')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting offer:', error);
      throw error;
    }

    return { success: true };
  }
};
