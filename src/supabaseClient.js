import { createClient } from '@supabase/supabase-js';


const supabaseUrl = 'https://xywzkvpznsuqplfnyjjk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5d3prdnB6bnN1cXBsZm55amprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg5MjY0NzcsImV4cCI6MjA2NDUwMjQ3N30.mOVzG6j3OpQFI01zLHvF4sLqj3JeEy6jYPBY1JMAIho';

export const supabase = createClient(supabaseUrl, supabaseKey);