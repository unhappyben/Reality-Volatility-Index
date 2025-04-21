// pages/api/rvi/latest.ts
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  try {
    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({ error: "Supabase configuration missing" });
    }

    // Get the latest timestamp
    const { data: latestTimestamp, error: timestampError } = await supabase
      .from('rvi_aggregate')
      .select('timestamp')
      .order('timestamp', { ascending: false })
      .limit(1);
    
    if (timestampError) {
      console.error('Error fetching latest timestamp:', timestampError);
      return res.status(500).json({ error: 'Failed to fetch latest timestamp' });
    }

    if (!latestTimestamp || latestTimestamp.length === 0) {
      return res.status(404).json({ error: 'No data found' });
    }

    // Get all records with that timestamp
    const { data, error } = await supabase
      .from('rvi_aggregate')
      .select('*')
      .eq('timestamp', latestTimestamp[0].timestamp);
    
    if (error) {
      console.error('Error fetching latest data:', error);
      return res.status(500).json({ error: 'Failed to fetch latest data' });
    }

    // Process the data into the expected format
    const totalRVI = data.find(item => item.category === 'Total')?.rvi || 0;
    const categoryRVIs = Object.fromEntries(
      data
        .filter(item => item.category !== 'Total')
        .map(item => [item.category, item.rvi])
    );
    
    return res.status(200).json({
      timestamp: latestTimestamp[0].timestamp,
      totalRVI,
      categoryRVIs
    });
  } catch (err) {
    console.error('Error in RVI latest API:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}