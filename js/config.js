// Configuración de Supabase
// IMPORTANTE: Reemplaza estos valores con tus credenciales de Supabase

const SUPABASE_URL = 'https://dbcxgwchndnnzeuixxtc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRiY3hnd2NobmRubnpldWl4eHRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0OTI1NTIsImV4cCI6MjA3OTA2ODU1Mn0.78RdxjVzst2YzKb0SSSImjxhYdjPneqpGOe8x4s1EOA';

// Inicializar cliente
let supabase = null;

try {
    if (SUPABASE_URL && SUPABASE_ANON_KEY) {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
            auth: {
                autoRefreshToken: true,
                persistSession: true,
                detectSessionInUrl: true
            }
        });
        console.log("Supabase conectado correctamente");
        
        // Configurar listener de autenticación inmediatamente
        if (typeof setupAuthListener === 'function') {
            setupAuthListener();
        } else {
            // Si la función aún no está disponible, esperar un momento
            setTimeout(() => {
                if (typeof setupAuthListener === 'function') {
                    setupAuthListener();
                }
            }, 100);
        }
        
        // Verificar sesión al inicializar y actualizar UI
        supabase.auth.getSession().then(async ({ data: { session } }) => {
            if (session) {
                console.log("Sesión encontrada al inicializar");
                // Actualizar UI si hay una función disponible
                if (typeof updateAuthUI === 'function') {
                    await updateAuthUI();
                }
            }
        });
    } else {
        console.warn("Faltan credenciales de Supabase.");
    }
} catch (error) {
    console.error("Error inicializando Supabase:", error);
}


