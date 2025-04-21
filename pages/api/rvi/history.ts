// pages/api/rvi/history.ts
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

    // Get unique timestamps ordered by timestamp (ascending)
    const { data: timestamps, error: timestampError } = await supabase
      .from('rvi_aggregate')
      .select('timestamp')
      .order('timestamp', { ascending: true });
    
    if (timestampError) {
      console.error('Error fetching timestamps:', timestampError);
      return res.status(500).json({ error: 'Failed to fetch timestamps' });
    }

    if (!timestamps || timestamps.length === 0) {
      return res.status(404).json({ error: 'No data found' });
    }

    // Get unique timestamps
    const uniqueTimestamps = [...new Set(timestamps.map(t => t.timestamp))];

    // Fetch data for all timestamps
    const { data, error } = await supabase
      .from('rvi_aggregate')
      .select('*')
      .in('timestamp', uniqueTimestamps)
      .order('timestamp', { ascending: true });

    if (error) {
      console.error('Error fetching history data:', error);
      return res.status(500).json({ error: 'Failed to fetch history data' });
    }

    // Process data into the expected format
    const groupedData = {};
    
    data.forEach(item => {
      if (!groupedData[item.timestamp]) {
        groupedData[item.timestamp] = {
          timestamp: item.timestamp,
          categoryRVIs: {}
        };
      }
      
      if (item.category === 'Total') {
        groupedData[item.timestamp].totalRVI = item.rvi;
      } else {
        groupedData[item.timestamp].categoryRVIs[item.category] = item.rvi;
      }
    });

    const history = Object.values(groupedData);
    
    return res.status(200).json(history);
  } catch (err) {
    console.error('Error in RVI history API:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}