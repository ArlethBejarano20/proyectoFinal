// Funciones de autenticación

// Verificar si el usuario está autenticado
async function checkAuth() {
    if (!supabase) return null;
    try {
        const { data: { session } } = await supabase.auth.getSession();
        return session;
    } catch (error) {
        console.error('Error verificando autenticación:', error);
        return null;
    }
}

// Obtener usuario actual
async function getCurrentUser() {
    if (!supabase) return null;
    try {
        // Primero verificar la sesión (más rápido y confiable)
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
            console.error('Error obteniendo sesión:', sessionError);
            return null;
        }
        
        if (!session || !session.user) {
            return null;
        }
        
        // Usar directamente el usuario de la sesión (más rápido)
        // Solo intentar getUser si realmente lo necesitamos
        return session.user;
        
        // NOTA: Comentado para evitar bloqueos. Si necesitas datos actualizados del usuario,
        // puedes descomentar esto pero con timeout:
        /*
        try {
            const getUserPromise = supabase.auth.getUser();
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Timeout')), 3000)
            );
            
            const { data: { user }, error: userError } = await Promise.race([
                getUserPromise,
                timeoutPromise
            ]);
            
            if (userError) {
                console.error('Error obteniendo usuario:', userError);
                return session.user;
            }
            
            return user;
        } catch (error) {
            console.error('Error en getUser (usando usuario de sesión):', error);
            return session.user;
        }
        */
    } catch (error) {
        console.error('Error obteniendo usuario:', error);
        return null;
    }
}

// Iniciar sesión
async function login(email, password) {
    if (!supabase) {
        return { success: false, error: 'Supabase no está configurado' };
    }
    try {
        // Validar datos
        if (!email || !email.trim()) {
            return { success: false, error: 'El email es requerido' };
        }
        if (!password) {
            return { success: false, error: 'La contraseña es requerida' };
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email: email.trim().toLowerCase(),
            password: password
        });

        if (error) {
            console.error('Error en login:', error);
            // Mensajes de error más amigables
            if (error.message.includes('Invalid login credentials') || error.message.includes('invalid')) {
                return { success: false, error: 'Email o contraseña incorrectos' };
            }
            throw error;
        }

        // Verificar que la sesión se haya establecido
        if (data.session) {
            // Esperar un momento para asegurar que la sesión esté lista
            await new Promise(resolve => setTimeout(resolve, 200));
        }

        return { success: true, data };
    } catch (error) {
        console.error('Error en login:', error);
        return { success: false, error: error.message || 'Error al iniciar sesión' };
    }
}

// Registrarse
async function register(name, email, password) {
    if (!supabase) {
        return { success: false, error: 'Supabase no está configurado' };
    }
    try {
        // Validar datos antes de enviar
        if (!name || !name.trim()) {
            return { success: false, error: 'El nombre es requerido' };
        }
        if (!email || !email.trim()) {
            return { success: false, error: 'El email es requerido' };
        }
        if (!password || password.length < 6) {
            return { success: false, error: 'La contraseña debe tener al menos 6 caracteres' };
        }

        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return { success: false, error: 'El formato del email no es válido' };
        }

        // Registrar usuario en auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: email.trim().toLowerCase(),
            password: password
        });

        if (authError) {
            console.error('Error en signup:', authError);
            // Mensajes de error más amigables
            if (authError.message.includes('already registered') || authError.message.includes('already exists')) {
                return { success: false, error: 'Este email ya está registrado. Por favor, inicia sesión.' };
            }
            if (authError.message.includes('Password')) {
                return { success: false, error: 'La contraseña no cumple con los requisitos de seguridad.' };
            }
            throw authError;
        }

        // Crear perfil en la tabla profiles
        if (authData.user) {
            try {
                const { error: profileError } = await supabase
                    .from('profiles')
                    .insert([
                        {
                            id: authData.user.id,
                            name: name.trim(),
                            email: email.trim().toLowerCase()
                        }
                    ]);

                if (profileError) {
                    console.error('Error creando perfil:', profileError);
                    // Si el perfil ya existe, no es un error crítico
                    if (!profileError.message.includes('duplicate') && !profileError.code?.includes('23505')) {
                        return { success: false, error: 'Usuario creado pero error al crear perfil: ' + profileError.message };
                    }
                }
            } catch (profileErr) {
                console.error('Error creando perfil:', profileErr);
                // Continuar aunque falle el perfil, el usuario ya está creado
            }
        }

        return { success: true, data: authData };
    } catch (error) {
        console.error('Error en registro:', error);
        return { success: false, error: error.message || 'Error al registrarse. Por favor, intenta nuevamente.' };
    }
}

// Cerrar sesión
async function logout() {
    if (!supabase) {
        return { success: false, error: 'Supabase no está configurado' };
    }
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Variable para evitar múltiples llamadas simultáneas
let isUpdatingAuthUI = false;

// Actualizar UI según estado de autenticación
async function updateAuthUI() {
    // Evitar múltiples llamadas simultáneas
    if (isUpdatingAuthUI) {
        return;
    }
    
    if (!supabase) {
        // Si Supabase no está configurado, mantener UI por defecto
        const loginBtn = document.getElementById('login-btn');
        if (loginBtn) loginBtn.style.display = 'inline-block';
        return;
    }
    
    isUpdatingAuthUI = true;
    
    try {
        // Obtener elementos del DOM primero
        const loginBtn = document.getElementById('login-btn');
        const profileBtn = document.getElementById('profile-btn');
        const logoutBtn = document.getElementById('logout-btn');
        const userName = document.getElementById('user-name');
        
        // Verificar la sesión directamente (sin timeouts agresivos)
        let session = null;
        let user = null;
        
        try {
            const { data, error } = await supabase.auth.getSession();
            if (!error && data) {
                session = data.session;
                user = session?.user;
            }
        } catch (error) {
            // Silenciar errores de sesión, simplemente no hay sesión
            session = null;
            user = null;
        }

        if (user && session) {
            // Usuario autenticado - Actualizar UI inmediatamente
            if (loginBtn) loginBtn.style.display = 'none';
            if (profileBtn) profileBtn.style.display = 'inline-block';
            if (logoutBtn) logoutBtn.style.display = 'inline-block';
            
            // Obtener nombre del perfil de forma asíncrona (no bloquear)
            if (userName) {
                // Mostrar algo inmediatamente
                userName.textContent = `Hola, ${user.email?.split('@')[0] || 'Usuario'}`;
                
                // Intentar obtener el perfil en segundo plano (sin bloquear)
                supabase
                    .from('profiles')
                    .select('name')
                    .eq('id', user.id)
                    .single()
                    .then(({ data: profile, error: profileError }) => {
                        if (profile && !profileError && userName) {
                            userName.textContent = `Hola, ${profile.name}`;
                        }
                    })
                    .catch(() => {
                        // Silenciar errores de perfil
                    });
            }
        } else {
            // Usuario no autenticado
            if (loginBtn) loginBtn.style.display = 'inline-block';
            if (profileBtn) profileBtn.style.display = 'none';
            if (logoutBtn) logoutBtn.style.display = 'none';
            if (userName) userName.textContent = '';
        }
    } catch (error) {
        // Silenciar errores, solo actualizar UI básica
        const loginBtn = document.getElementById('login-btn');
        if (loginBtn) loginBtn.style.display = 'inline-block';
    } finally {
        isUpdatingAuthUI = false;
    }
}

// Escuchar cambios de autenticación
// Esto se ejecutará cuando supabase esté disponible
if (typeof window !== 'undefined') {
    // Esperar a que el DOM esté listo y supabase esté inicializado
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            // Intentar configurar el listener después de que el DOM esté listo
            setTimeout(setupAuthListener, 200);
        });
    } else {
        // Si el DOM ya está listo, intentar configurar el listener
        setTimeout(setupAuthListener, 200);
    }
}

// Variable para debounce de actualizaciones
let authUIUpdateTimeout = null;

function setupAuthListener() {
    // Verificar si supabase está disponible después de un pequeño delay
    setTimeout(() => {
        if (typeof supabase !== 'undefined' && supabase) {
            try {
                supabase.auth.onAuthStateChange(async (event, session) => {
                    try {
                        // Limpiar timeout anterior si existe
                        if (authUIUpdateTimeout) {
                            clearTimeout(authUIUpdateTimeout);
                        }
                        
                        // Usar debounce para evitar múltiples actualizaciones
                        authUIUpdateTimeout = setTimeout(async () => {
                            // Manejar eventos específicos
                            if (event === 'SIGNED_IN' || event === 'SIGNED_UP') {
                                // Esperar un momento para asegurar que la sesión esté lista
                                await new Promise(resolve => setTimeout(resolve, 200));
                                if (typeof updateAuthUI === 'function') {
                                    await updateAuthUI();
                                }
                            } else if (event === 'TOKEN_REFRESHED') {
                                // No actualizar UI en cada refresh de token para evitar spam
                                // Solo actualizar si es necesario
                            } else if (event === 'SIGNED_OUT' || !session) {
                                if (window.location.pathname.includes('profile.html')) {
                                    window.location.href = 'index.html';
                                }
                                if (typeof updateAuthUI === 'function') {
                                    await updateAuthUI();
                                }
                            } else if (event === 'INITIAL_SESSION') {
                                // Solo actualizar UI en la sesión inicial
                                if (typeof updateAuthUI === 'function') {
                                    await updateAuthUI();
                                }
                            }
                        }, 300); // Debounce de 300ms
                    } catch (error) {
                        // Silenciar errores del listener
                    }
                });
            } catch (error) {
                // Silenciar errores de configuración
            }
        } else {
            // Si supabase no está disponible, intentar de nuevo (solo una vez)
            setTimeout(setupAuthListener, 500);
        }
    }, 100);
}

