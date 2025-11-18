// Aplicación principal

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', async () => {
    await initializeApp();
});

async function initializeApp() {
    // Verificar autenticación
    await updateAuthUI();

    // Cargar publicaciones
    await loadPosts();

    // Event listeners para modales
    setupModals();

    // Event listeners para formularios
    setupForms();

    // Event listeners para filtros
    setupFilters();

    // Event listeners para navegación
    setupNavigation();
}

// Configurar modales
function setupModals() {
    const loginModal = document.getElementById('login-modal');
    const registerModal = document.getElementById('register-modal');
    const addPostModal = document.getElementById('add-post-modal');
    const postDetailModal = document.getElementById('post-detail-modal');

    // Botones para abrir modales
    const loginBtn = document.getElementById('login-btn');
    const profileBtn = document.getElementById('profile-btn');
    const addPostBtn = document.getElementById('add-post-btn');
    const showRegister = document.getElementById('show-register');
    const showLogin = document.getElementById('show-login');

    // Abrir login
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            if (!supabase) {
                alert('Supabase no está configurado.');
            }
            if (loginModal) loginModal.style.display = 'block';
        });
    }

    // Abrir registro
    if (showRegister) {
        showRegister.addEventListener('click', (e) => {
            e.preventDefault();
            loginModal.style.display = 'none';
            registerModal.style.display = 'block';
        });
    }

    // Volver a login desde registro
    if (showLogin) {
        showLogin.addEventListener('click', (e) => {
            e.preventDefault();
            registerModal.style.display = 'none';
            loginModal.style.display = 'block';
        });
    }

    // Abrir agregar publicación
    if (addPostBtn) {
        addPostBtn.addEventListener('click', async () => {
            if (!supabase) {
                alert('Supabase no está configurado.');
                if (addPostModal) addPostModal.style.display = 'block';
                return;
            }
            const user = await getCurrentUser();
            if (!user) {
                if (typeof showAlert === 'function') {
                    showAlert('Debes iniciar sesión para agregar una publicación', 'error');
                } else {
                    alert('Debes iniciar sesión para agregar una publicación');
                }
                if (loginModal) loginModal.style.display = 'block';
                return;
            }
            if (addPostModal) addPostModal.style.display = 'block';
        });
    }

    // Ir a perfil
    if (profileBtn) {
        profileBtn.addEventListener('click', () => {
            window.location.href = 'profile.html';
        });
    }

    // Cerrar modales
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
            }
        });
    });

    // Cerrar al hacer click fuera del modal
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
}

// Configurar formularios
function setupForms() {
    // Formulario de login
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;

            const result = await login(email, password);
            if (result.success) {
                showAlert('Sesión iniciada correctamente', 'success');
                document.getElementById('login-modal').style.display = 'none';
                loginForm.reset();
                await updateAuthUI();
            } else {
                showAlert('Error: ' + result.error, 'error');
            }
        });
    }

    // Formulario de registro
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('register-name').value;
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;

            const result = await register(name, email, password);
            if (result.success) {
                showAlert('Registro exitoso. Por favor inicia sesión.', 'success');
                document.getElementById('register-modal').style.display = 'none';
                registerForm.reset();
                document.getElementById('login-modal').style.display = 'block';
            } else {
                showAlert('Error: ' + result.error, 'error');
            }
        });
    }

    // Formulario de nueva publicación
    const addPostForm = document.getElementById('add-post-form');
    if (addPostForm) {
        addPostForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('post-name').value;
            const image = document.getElementById('post-image').value;
            const description = document.getElementById('post-description').value;
            const address = document.getElementById('post-address').value;

            const result = await createPost(name, image, description, address);
            if (result.success) {
                showAlert('Publicación creada exitosamente', 'success');
                document.getElementById('add-post-modal').style.display = 'none';
                addPostForm.reset();
                await loadPosts();
            } else {
                showAlert('Error: ' + result.error, 'error');
            }
        });
    }

    // Botón de cerrar sesión
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            const result = await logout();
            if (result.success) {
                showAlert('Sesión cerrada', 'success');
                await updateAuthUI();
                await loadPosts();
            }
        });
    }
}

// Configurar filtros
function setupFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', async () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filter = btn.dataset.filter;
            await loadPosts(filter);
        });
    });

    // Link de destacados
    const destacadosLink = document.getElementById('destacados-link');
    if (destacadosLink) {
        destacadosLink.addEventListener('click', async (e) => {
            e.preventDefault();
            filterBtns.forEach(b => b.classList.remove('active'));
            document.querySelector('[data-filter="featured"]')?.classList.add('active');
            await loadPosts('featured');
        });
    }
}

// Configurar navegación
function setupNavigation() {
    // Navegación activa
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link').forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        }
    });
}

