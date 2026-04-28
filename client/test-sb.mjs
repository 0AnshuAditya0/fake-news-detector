import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bqrgzvqmlcetgfvarzxu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxcmd6dnFtbGNldGdmdmFyenh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2OTA4NTEsImV4cCI6MjA4NjI2Njg1MX0.PM6o_A9W8Q900hITzQkxoFqzRgRkaawhm7DKoGUSB3w';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  const { error } = await supabase.from('analyses').insert({
    id: '123e4567-e89b-12d3-a456-426614174000',
    prediction: 'FAKE',
    confidence: 90,
    overall_score: 50,
    signals: {
      ml_score: 50,
      sentiment_score: 50,
      clickbait_score: 50,
      source_score: 50,
      bias_score: 50
    },
    created_at: new Date().toISOString()
  });
  console.log("Insert 1 error:", error);

  const { error: err2 } = await supabase.from('analyses').insert({
    id: '123e4567-e89b-12d3-a456-426614174001',
    user_id: '00000000-0000-0000-0000-000000000000',
    prediction: 'FAKE',
    confidence: 90,
    overall_score: 50,
    signals: {
      ml_score: 50,
      sentiment_score: 50,
      clickbait_score: 50,
      source_score: 50,
      bias_score: 50
    },
    created_at: new Date().toISOString()
  });
  console.log("Insert 2 error:", err2);
}

test();
