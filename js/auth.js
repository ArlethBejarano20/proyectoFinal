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
        const { data: { user } } = await supabase.auth.getUser();
        return user;
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
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Registrarse
async function register(name, email, password) {
    if (!supabase) {
        return { success: false, error: 'Supabase no está configurado' };
    }
    try {
        // Registrar usuario en auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: email,
            password: password
        });

        if (authError) throw authError;

        // Crear perfil en la tabla profiles
        if (authData.user) {
            const { error: profileError } = await supabase
                .from('profiles')
                .insert([
                    {
                        id: authData.user.id,
                        name: name,
                        email: email
                    }
                ]);

            if (profileError) {
                console.error('Error creando perfil:', profileError);
            }
        }

        return { success: true, data: authData };
    } catch (error) {
        return { success: false, error: error.message };
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

// Actualizar UI según estado de autenticación
async function updateAuthUI() {
    if (!supabase) {
        // Si Supabase no está configurado, mantener UI por defecto
        const loginBtn = document.getElementById('login-btn');
        if (loginBtn) loginBtn.style.display = 'inline-block';
        return;
    }
    
    try {
        const user = await getCurrentUser();
        const loginBtn = document.getElementById('login-btn');
        const profileBtn = document.getElementById('profile-btn');
        const logoutBtn = document.getElementById('logout-btn');
        const userName = document.getElementById('user-name');

        if (user) {
            // Usuario autenticado
            if (loginBtn) loginBtn.style.display = 'none';
            if (profileBtn) profileBtn.style.display = 'inline-block';
            if (logoutBtn) logoutBtn.style.display = 'inline-block';
            
            // Obtener nombre del perfil
            try {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('name')
                    .eq('id', user.id)
                    .single();

                if (userName && profile) {
                    userName.textContent = `Hola, ${profile.name}`;
                }
            } catch (error) {
                console.error('Error obteniendo perfil:', error);
            }
        } else {
            // Usuario no autenticado
            if (loginBtn) loginBtn.style.display = 'inline-block';
            if (profileBtn) profileBtn.style.display = 'none';
            if (logoutBtn) logoutBtn.style.display = 'none';
            if (userName) userName.textContent = '';
        }
    } catch (error) {
        console.error('Error actualizando UI de autenticación:', error);
    }
}

// Escuchar cambios de autenticación
if (supabase) {
    supabase.auth.onAuthStateChange((event, session) => {
        updateAuthUI();
        if (event === 'SIGNED_OUT') {
            if (window.location.pathname.includes('profile.html')) {
                window.location.href = 'index.html';
            }
        }
    });
}

