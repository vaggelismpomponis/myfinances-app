
import { supabase } from './src/supabase.js';

async function testBroadcasts() {
    console.log('Testing broadcasts table...');
    const { data, error } = await supabase
        .from('broadcasts')
        .select('*')
        .limit(1);
    
    if (error) {
        console.error('Error fetching broadcasts:', error);
    } else {
        console.log('Successfully fetched broadcasts:', data);
    }
}

testBroadcasts();
