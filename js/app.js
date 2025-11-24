// Aplicación principal

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await initializeApp();
    } catch (error) {
        console.error('Error inicializando aplicación:', error);
        if (typeof showAlert === 'function') {
            showAlert('Error al cargar la aplicación. Por favor, recarga la página.', 'error');
        }
    }
});

async function initializeApp() {
    try {
        // Verificar autenticación
        if (typeof updateAuthUI === 'function') {
            await updateAuthUI();
        }

        // Cargar publicaciones
        if (typeof loadPosts === 'function') {
            await loadPosts();
        }

        // Event listeners para modales
        setupModals();

        // Event listeners para formularios
        setupForms();

        // Event listeners para filtros
        setupFilters();

        // Event listeners para navegación
        setupNavigation();
    } catch (error) {
        console.error('Error en initializeApp:', error);
        throw error;
    }
}


// Configurar modales
function setupModals() {
    try {
        const loginModal = document.getElementById('login-modal');
        const registerModal = document.getElementById('register-modal');
        const addPostModal = document.getElementById('add-post-modal');

        // Botones para abrir modales
        const loginBtn = document.getElementById('login-btn');
        const profileBtn = document.getElementById('profile-btn');
        const addPostBtn = document.getElementById('add-post-btn');
        const showRegister = document.getElementById('show-register');
        const showLogin = document.getElementById('show-login');

        // Abrir login
        if (loginBtn) {
            loginBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                try {
                    if (loginModal) {
                        loginModal.style.display = 'block';
                    }
                } catch (error) {
                    console.error('Error abriendo modal de login:', error);
                }
            });
        }

        // Abrir registro
        if (showRegister) {
            showRegister.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                try {
                    if (loginModal) loginModal.style.display = 'none';
                    if (registerModal) registerModal.style.display = 'block';
                } catch (error) {
                    console.error('Error abriendo modal de registro:', error);
                }
            });
        }

        // Volver a login desde registro
        if (showLogin) {
            showLogin.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                try {
                    if (registerModal) registerModal.style.display = 'none';
                    if (loginModal) loginModal.style.display = 'block';
                } catch (error) {
                    console.error('Error cambiando a modal de login:', error);
                }
            });
        }

        // Abrir agregar publicación
        if (addPostBtn) {
            addPostBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                e.stopPropagation();
                try {
                    if (!supabase) {
                        if (typeof showAlert === 'function') {
                            showAlert('Supabase no está configurado.', 'error');
                        } else {
                            alert('Supabase no está configurado.');
                        }
                        return;
                    }
                    
                    if (typeof getCurrentUser === 'function') {
                        const user = await getCurrentUser();
                        if (!user) {
                            if (typeof showAlert === 'function') {
                                showAlert('Debes iniciar sesión para agregar una publicación', 'error');
                            } else {
                                alert('Debes iniciar sesión para agregar una publicación');
                            }
                            if (loginModal) {
                                loginModal.style.display = 'block';
                            }
                            return;
                        }
                    }
                    
                    if (addPostModal) {
                        addPostModal.style.display = 'block';
                    }
                } catch (error) {
                    console.error('Error abriendo modal de publicación:', error);
                    if (typeof showAlert === 'function') {
                        showAlert('Error al abrir el formulario. Por favor, intenta nuevamente.', 'error');
                    }
                }
            });
        }

        // Ir a perfil
        if (profileBtn) {
            profileBtn.addEventListener('click', (e) => {
                e.preventDefault();
                try {
                    window.location.href = 'profile.html';
                } catch (error) {
                    console.error('Error navegando a perfil:', error);
                }
            });
        }

        // Cerrar modales
        document.querySelectorAll('.close').forEach(closeBtn => {
            closeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                try {
                    const modal = e.target.closest('.modal');
                    if (modal) {
                        modal.style.display = 'none';
                    }
                } catch (error) {
                    console.error('Error cerrando modal:', error);
                }
            });
        });

        // Cerrar al hacer click fuera del modal
        window.addEventListener('click', (e) => {
            try {
                if (e.target.classList.contains('modal')) {
                    e.target.style.display = 'none';
                }
            } catch (error) {
                console.error('Error cerrando modal al hacer click fuera:', error);
            }
        });
    } catch (error) {
        console.error('Error configurando modales:', error);
    }
}

// Configurar formularios
function setupForms() {
    try {
        // Formulario de login
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                try {
                    const email = document.getElementById('login-email')?.value;
                    const password = document.getElementById('login-password')?.value;

                    if (!email || !password) {
                        if (typeof showAlert === 'function') {
                            showAlert('Por favor, completa todos los campos', 'error');
                        }
                        return;
                    }

                    if (typeof login === 'function') {
                        // Deshabilitar botón y mostrar estado de carga
                        const submitBtn = loginForm.querySelector('button[type="submit"]');
                        const originalText = submitBtn?.textContent;
                        if (submitBtn) {
                            submitBtn.disabled = true;
                            submitBtn.textContent = 'Iniciando sesión...';
                        }
                        
                        try {
                            const result = await login(email, password);
                            
                            if (submitBtn) {
                                submitBtn.disabled = false;
                                submitBtn.textContent = originalText || 'Iniciar Sesión';
                            }
                            
                            if (result.success) {
                                // Cerrar modal inmediatamente
                                const loginModal = document.getElementById('login-modal');
                                if (loginModal) loginModal.style.display = 'none';
                                loginForm.reset();
                                
                                // Mostrar mensaje de éxito inmediatamente
                                if (typeof showAlert === 'function') {
                                    showAlert('Sesión iniciada correctamente', 'success');
                                }
                                
                                // Actualizar UI de forma asíncrona (no bloquear)
                                setTimeout(async () => {
                                    if (typeof updateAuthUI === 'function') {
                                        try {
                                            await updateAuthUI();
                                        } catch (error) {
                                            console.error('Error actualizando UI:', error);
                                        }
                                    }
                                }, 100);
                                
                                // Actualización adicional después de un momento
                                setTimeout(async () => {
                                    if (typeof updateAuthUI === 'function') {
                                        try {
                                            await updateAuthUI();
                                        } catch (error) {
                                            console.error('Error en segunda actualización UI:', error);
                                        }
                                    }
                                }, 500);
                            } else {
                                if (typeof showAlert === 'function') {
                                    showAlert('Error: ' + result.error, 'error');
                                }
                            }
                        } catch (error) {
                            console.error('Error en login:', error);
                            if (submitBtn) {
                                submitBtn.disabled = false;
                                submitBtn.textContent = originalText || 'Iniciar Sesión';
                            }
                            if (typeof showAlert === 'function') {
                                showAlert('Error al iniciar sesión. Por favor, intenta nuevamente.', 'error');
                            }
                        }
                    }
                } catch (error) {
                    console.error('Error en formulario de login:', error);
                    if (typeof showAlert === 'function') {
                        showAlert('Error al iniciar sesión. Por favor, intenta nuevamente.', 'error');
                    }
                }
            });
        }

        // Formulario de registro
        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                try {
                    const name = document.getElementById('register-name')?.value;
                    const email = document.getElementById('register-email')?.value;
                    const password = document.getElementById('register-password')?.value;

                    if (!name || !email || !password) {
                        if (typeof showAlert === 'function') {
                            showAlert('Por favor, completa todos los campos', 'error');
                        }
                        return;
                    }

                    if (typeof register === 'function') {
                        // Mostrar indicador de carga
                        const submitBtn = registerForm.querySelector('button[type="submit"]');
                        const originalText = submitBtn?.textContent;
                        if (submitBtn) {
                            submitBtn.disabled = true;
                            submitBtn.textContent = 'Registrando...';
                        }

                        try {
                            const result = await register(name, email, password);
                            
                            if (submitBtn) {
                                submitBtn.disabled = false;
                                submitBtn.textContent = originalText || 'Registrarse';
                            }

                            if (result.success) {
                                // Cerrar modal de registro
                                const registerModal = document.getElementById('register-modal');
                                if (registerModal) registerModal.style.display = 'none';
                                registerForm.reset();
                                
                                // Si el usuario se registró y se autenticó automáticamente
                                await new Promise(resolve => setTimeout(resolve, 300));
                                
                                // Verificar si hay sesión activa
                                if (typeof supabase !== 'undefined' && supabase) {
                                    const { data: { session } } = await supabase.auth.getSession();
                                    if (session) {
                                        // Si hay sesión, actualizar UI y mostrar mensaje de éxito
                                        if (typeof updateAuthUI === 'function') {
                                            await updateAuthUI();
                                        }
                                        setTimeout(async () => {
                                            if (typeof updateAuthUI === 'function') {
                                                await updateAuthUI();
                                            }
                                            if (typeof showAlert === 'function') {
                                                showAlert('Registro exitoso. Sesión iniciada automáticamente.', 'success');
                                            }
                                        }, 500);
                                    } else {
                                        // Si no hay sesión, mostrar modal de login
                                        const loginModal = document.getElementById('login-modal');
                                        if (loginModal) {
                                            loginModal.style.display = 'block';
                                            // Pre-llenar el email en el formulario de login
                                            const loginEmail = document.getElementById('login-email');
                                            if (loginEmail) loginEmail.value = email;
                                        }
                                        if (typeof showAlert === 'function') {
                                            showAlert('Registro exitoso. Por favor inicia sesión.', 'success');
                                        }
                                    }
                                }
                            } else {
                                if (typeof showAlert === 'function') {
                                    showAlert('Error: ' + result.error, 'error');
                                }
                            }
                        } catch (error) {
                            if (submitBtn) {
                                submitBtn.disabled = false;
                                submitBtn.textContent = originalText || 'Registrarse';
                            }
                            throw error;
                        }
                    }
                } catch (error) {
                    console.error('Error en formulario de registro:', error);
                    if (typeof showAlert === 'function') {
                        showAlert('Error al registrarse. Por favor, intenta nuevamente.', 'error');
                    }
                }
            });
        }

        // Formulario de nueva publicación
        const addPostForm = document.getElementById('add-post-form');
        if (addPostForm) {
            addPostForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                try {
                    const name = document.getElementById('post-name')?.value;
                    const image = document.getElementById('post-image')?.value;
                    const description = document.getElementById('post-description')?.value;
                    const address = document.getElementById('post-address')?.value;

                    if (!name || !image || !description || !address) {
                        if (typeof showAlert === 'function') {
                            showAlert('Por favor, completa todos los campos', 'error');
                        }
                        return;
                    }

                    if (typeof createPost === 'function') {
                        const result = await createPost(name, image, description, address);
                        if (result.success) {
                            if (typeof showAlert === 'function') {
                                showAlert('Publicación creada exitosamente', 'success');
                            }
                            const addPostModal = document.getElementById('add-post-modal');
                            if (addPostModal) addPostModal.style.display = 'none';
                            addPostForm.reset();
                            if (typeof loadPosts === 'function') {
                                await loadPosts();
                            }
                        } else {
                            if (typeof showAlert === 'function') {
                                showAlert('Error: ' + result.error, 'error');
                            }
                            // Si el error es de sesión, abrir el modal de login
                            if (result.error && (result.error.includes('sesión') || result.error.includes('iniciar sesión'))) {
                                const loginModal = document.getElementById('login-modal');
                                const addPostModal = document.getElementById('add-post-modal');
                                if (addPostModal) addPostModal.style.display = 'none';
                                if (loginModal) {
                                    setTimeout(() => {
                                        loginModal.style.display = 'block';
                                    }, 1000);
                                }
                            }
                        }
                    }
                } catch (error) {
                    console.error('Error en formulario de publicación:', error);
                    if (typeof showAlert === 'function') {
                        showAlert('Error al crear la publicación. Por favor, intenta nuevamente.', 'error');
                    }
                }
            });
        }

        // Botón de cerrar sesión
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', async () => {
                try {
                    if (typeof logout === 'function') {
                        const result = await logout();
                        if (result.success) {
                            if (typeof showAlert === 'function') {
                                showAlert('Sesión cerrada', 'success');
                            }
                            if (typeof updateAuthUI === 'function') {
                                await updateAuthUI();
                            }
                            if (typeof loadPosts === 'function') {
                                await loadPosts();
                            }
                        }
                    }
                } catch (error) {
                    console.error('Error cerrando sesión:', error);
                }
            });
        }
    } catch (error) {
        console.error('Error configurando formularios:', error);
    }
}

// Configurar filtros
function setupFilters() {
    try {
        const filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.preventDefault();
                try {
                    filterBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    const filter = btn.dataset.filter;
                    if (typeof loadPosts === 'function') {
                        await loadPosts(filter);
                    }
                } catch (error) {
                    console.error('Error aplicando filtro:', error);
                }
            });
        });

        // Link de destacados
        const destacadosLink = document.getElementById('destacados-link');
        if (destacadosLink) {
            destacadosLink.addEventListener('click', async (e) => {
                e.preventDefault();
                try {
                    filterBtns.forEach(b => b.classList.remove('active'));
                    const featuredBtn = document.querySelector('[data-filter="featured"]');
                    if (featuredBtn) featuredBtn.classList.add('active');
                    if (typeof loadPosts === 'function') {
                        await loadPosts('featured');
                    }
                } catch (error) {
                    console.error('Error aplicando filtro de destacados:', error);
                }
            });
        }
    } catch (error) {
        console.error('Error configurando filtros:', error);
    }
}

// Configurar navegación
function setupNavigation() {
    try {
        // Navegación activa
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        document.querySelectorAll('.nav-link').forEach(link => {
            try {
                if (link.getAttribute('href') === currentPage) {
                    link.classList.add('active');
                }
            } catch (error) {
                console.error('Error configurando link de navegación:', error);
            }
        });
    } catch (error) {
        console.error('Error configurando navegación:', error);
    }
}

