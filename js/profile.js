// Funciones para la página de perfil

// Cargar datos del perfil
async function loadProfile() {
    const user = await getCurrentUser();
    if (!user) {
        window.location.href = 'index.html';
        return;
    }

    // Cargar información del perfil
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (profile) {
        document.getElementById('profile-name').textContent = profile.name;
        document.getElementById('profile-email').textContent = profile.email || user.email;
    }

    // Cargar estadísticas
    await loadProfileStats(user.id);

    // Cargar contenido según tab activo
    const activeTab = document.querySelector('.tab-btn.active')?.dataset.tab || 'posts';
    await loadTabContent(activeTab, user.id);

    // Event listeners para tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            btn.classList.add('active');
            const tab = btn.dataset.tab;
            document.getElementById(`${tab}-tab`).classList.add('active');
            loadTabContent(tab, user.id);
        });
    });

    // Actualizar nombre en header
    const userName = document.getElementById('user-name');
    if (userName && profile) {
        userName.textContent = profile.name;
    }

    // Botón de cerrar sesión
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            const result = await logout();
            if (result.success) {
                window.location.href = 'index.html';
            }
        });
    }
}

// Cargar estadísticas del perfil
async function loadProfileStats(userId) {
    // Contar publicaciones
    const { count: postsCount } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

    // Contar likes dados
    const { count: likesCount } = await supabase
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

    // Contar reseñas
    const { count: reviewsCount } = await supabase
        .from('reviews')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

    document.getElementById('posts-count').textContent = postsCount || 0;
    document.getElementById('likes-count').textContent = likesCount || 0;
    document.getElementById('reviews-count').textContent = reviewsCount || 0;
}

// Cargar contenido de tab
async function loadTabContent(tab, userId) {
    switch (tab) {
        case 'posts':
            await loadMyPosts(userId);
            break;
        case 'liked':
            await loadLikedPosts(userId);
            break;
        case 'reviews':
            await loadMyReviews(userId);
            break;
    }
}

// Cargar mis publicaciones
async function loadMyPosts(userId) {
    const { data: posts, error } = await supabase
        .from('posts')
        .select(`
            *,
            likes (id),
            reviews (id)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error cargando publicaciones:', error);
        return;
    }

    const grid = document.getElementById('my-posts-grid');
    grid.innerHTML = '';

    if (!posts || posts.length === 0) {
        grid.innerHTML = '<p style="text-align: center; color: var(--text-light); grid-column: 1 / -1;">No has publicado ninguna cafetería aún</p>';
        return;
    }

    for (const post of posts) {
        const likeCount = post.likes ? post.likes.length : 0;
        const reviewCount = post.reviews ? post.reviews.length : 0;

        const postCard = document.createElement('div');
        postCard.className = 'post-card';
        postCard.innerHTML = `
            <img src="${post.image_url}" alt="${post.name}" class="post-image" onerror="this.src='https://via.placeholder.com/300x300?text=Cafeteria'">
            <div class="post-info">
                <h3 class="post-title">${post.name}</h3>
                <p class="post-description">${post.description}</p>
                <div class="post-footer">
                    <div class="post-actions">
                        <span class="like-count"><i class="fas fa-heart"></i> ${likeCount}</span>
                        <span class="like-count"><i class="fas fa-comment"></i> ${reviewCount}</span>
                    </div>
                    ${post.featured ? '<span class="featured-badge">⭐ Destacada</span>' : ''}
                </div>
            </div>
        `;

        postCard.addEventListener('click', () => {
            window.location.href = `index.html#post-${post.id}`;
        });

        grid.appendChild(postCard);
    }
}

// Cargar publicaciones que me gustan
async function loadLikedPosts(userId) {
    const { data: likes, error } = await supabase
        .from('likes')
        .select(`
            posts:post_id (
                *,
                likes (id),
                reviews (id)
            )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error cargando likes:', error);
        return;
    }

    const grid = document.getElementById('liked-posts-grid');
    grid.innerHTML = '';

    if (!likes || likes.length === 0) {
        grid.innerHTML = '<p style="text-align: center; color: var(--text-light); grid-column: 1 / -1;">No has dado me gusta a ninguna publicación</p>';
        return;
    }

    const posts = likes.map(like => like.posts).filter(Boolean);

    for (const post of posts) {
        const likeCount = post.likes ? post.likes.length : 0;
        const reviewCount = post.reviews ? post.reviews.length : 0;

        const postCard = document.createElement('div');
        postCard.className = 'post-card';
        postCard.innerHTML = `
            <img src="${post.image_url}" alt="${post.name}" class="post-image" onerror="this.src='https://via.placeholder.com/300x300?text=Cafeteria'">
            <div class="post-info">
                <h3 class="post-title">${post.name}</h3>
                <p class="post-description">${post.description}</p>
                <div class="post-footer">
                    <div class="post-actions">
                        <span class="like-count"><i class="fas fa-heart"></i> ${likeCount}</span>
                        <span class="like-count"><i class="fas fa-comment"></i> ${reviewCount}</span>
                    </div>
                </div>
            </div>
        `;

        postCard.addEventListener('click', () => {
            window.location.href = `index.html#post-${post.id}`;
        });

        grid.appendChild(postCard);
    }
}

// Cargar mis reseñas
async function loadMyReviews(userId) {
    const result = await getUserReviews(userId);
    const list = document.getElementById('my-reviews-list');
    list.innerHTML = '';

    if (!result.success || !result.data || result.data.length === 0) {
        list.innerHTML = '<p style="text-align: center; color: var(--text-light);">No has escrito ninguna reseña</p>';
        return;
    }

    for (const review of result.data) {
        const reviewItem = document.createElement('div');
        reviewItem.className = 'review-item';
        reviewItem.innerHTML = `
            <div style="display: flex; gap: 16px; align-items: start;">
                ${review.posts ? `
                    <img src="${review.posts.image_url}" alt="${review.posts.name}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px;" onerror="this.src='https://via.placeholder.com/80x80?text=Cafeteria'">
                ` : ''}
                <div style="flex: 1;">
                    <div class="review-header">
                        <span class="review-author">${review.posts ? review.posts.name : 'Cafetería'}</span>
                        <span class="review-rating">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</span>
                    </div>
                    <p class="review-text">${review.comment}</p>
                    <p style="font-size: 12px; color: var(--text-light); margin-top: 8px;">
                        ${new Date(review.created_at).toLocaleDateString('es-MX')}
                    </p>
                </div>
            </div>
        `;
        list.appendChild(reviewItem);
    }
}

// Inicializar perfil cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', async () => {
    await loadProfile();
});

