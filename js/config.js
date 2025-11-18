// Configuración de Supabase
// IMPORTANTE: Reemplaza estos valores con tus credenciales de Supabase
const SUPABASE_URL = 'https://dbcxgwchndnnzeuixxtc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRiY3hnd2NobmRubnpldWl4eHRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0OTI1NTIsImV4cCI6MjA3OTA2ODU1Mn0.78RdxjVzst2YzKb0SSSImjxhYdjPneqpGOe8x4s1EOA';

// Inicializar cliente de Supabase solo si las credenciales están configuradas
let supabase = null;
try {
    if (SUPABASE_URL && SUPABASE_ANON_KEY && 
        SUPABASE_URL !== 'https://dbcxgwchndnnzeuixxtc.supabase.co' && 
        SUPABASE_ANON_KEY !== 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRiY3hnd2NobmRubnpldWl4eHRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0OTI1NTIsImV4cCI6MjA3OTA2ODU1Mn0.78RdxjVzst2YzKb0SSSImjxhYdjPneqpGOe8x4s1EOA') {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    } else {
        console.warn('Supabase no está configurado.');
    }
} catch (error) {
    console.error('Error inicializando Supabase:', error);
}

