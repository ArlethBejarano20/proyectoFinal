// Funciones para manejar publicaciones

// Obtener todas las publicaciones
async function getPosts(filter = 'all') {
    if (!supabase) {
        return { success: true, data: [] };
    }
    
    try {
        let query = supabase
            .from('posts')
            .select(`
                *,
                profiles:user_id (name),
                likes (id, user_id),
                reviews (id)
            `)
            .order('created_at', { ascending: false });

        if (filter === 'featured') {
            query = query.eq('featured', true);
        }

        const { data, error } = await query;

        if (error) throw error;
        return { success: true, data: data || [] };
    } catch (error) {
        console.error('Error obteniendo publicaciones:', error);
        return { success: false, error: error.message };
    }
}

// Crear nueva publicación
async function createPost(name, image, description, address) {
    if (!supabase) {
        return { success: false, error: 'Supabase no está configurado' };
    }
    try {
        const user = await getCurrentUser();
        if (!user) {
            return { success: false, error: 'Debes iniciar sesión para publicar' };
        }

        const { data, error } = await supabase
            .from('posts')
            .insert([
                {
                    name: name,
                    image_url: image,
                    description: description,
                    address: address,
                    user_id: user.id
                }
            ])
            .select()
            .single();

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Dar like a una publicación
async function toggleLike(postId) {
    if (!supabase) {
        showAlert('Supabase no está configurado', 'error');
        return { success: false, error: 'Supabase no configurado' };
    }
    try {
        const user = await getCurrentUser();
        if (!user) {
            showAlert('Debes iniciar sesión para dar me gusta', 'error');
            return { success: false, error: 'No autenticado' };
        }

        // Verificar si ya tiene like
        const { data: existingLike } = await supabase
            .from('likes')
            .select('id')
            .eq('post_id', postId)
            .eq('user_id', user.id)
            .single();

        if (existingLike) {
            // Quitar like
            const { error } = await supabase
                .from('likes')
                .delete()
                .eq('post_id', postId)
                .eq('user_id', user.id);

            if (error) throw error;
            return { success: true, liked: false };
        } else {
            // Agregar like
            const { error } = await supabase
                .from('likes')
                .insert([
                    {
                        post_id: postId,
                        user_id: user.id
                    }
                ]);

            if (error) throw error;
            return { success: true, liked: true };
        }
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Verificar si el usuario le dio like a una publicación
async function checkUserLiked(postId) {
    if (!supabase) return false;
    try {
        const user = await getCurrentUser();
        if (!user) return false;

        const { data } = await supabase
            .from('likes')
            .select('id')
            .eq('post_id', postId)
            .eq('user_id', user.id)
            .single();

        return !!data;
    } catch (error) {
        return false;
    }
}

// Marcar publicación como destacada
async function toggleFeatured(postId) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return { success: false, error: 'No autenticado' };
        }

        // Obtener publicación actual
        const { data: post } = await supabase
            .from('posts')
            .select('featured')
            .eq('id', postId)
            .single();

        if (!post) {
            return { success: false, error: 'Publicación no encontrada' };
        }

        // Toggle featured
        const { error } = await supabase
            .from('posts')
            .update({ featured: !post.featured })
            .eq('id', postId);

        if (error) throw error;
        return { success: true, featured: !post.featured };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Renderizar publicaciones en el grid
async function renderPosts(posts) {
    const grid = document.getElementById('posts-grid');
    if (!grid) return;

    grid.innerHTML = '';

    if (!posts || posts.length === 0) {
        grid.innerHTML = '<p style="text-align: center; color: var(--text-light); grid-column: 1 / -1;">No hay publicaciones aún</p>';
        return;
    }

    for (const post of posts) {
        const liked = await checkUserLiked(post.id);
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
                        <button class="like-btn ${liked ? 'liked' : ''}" data-post-id="${post.id}">
                            <i class="fas fa-heart"></i>
                        </button>
                        <span class="like-count">${likeCount}</span>
                        <button class="review-btn" data-post-id="${post.id}">
                            <i class="fas fa-comment"></i> ${reviewCount}
                        </button>
                    </div>
                    ${post.featured ? '<span class="featured-badge">⭐ Destacada</span>' : ''}
                </div>
            </div>
        `;

        grid.appendChild(postCard);
    }

    // Agregar event listeners
    document.querySelectorAll('.like-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const postId = btn.dataset.postId;
            const result = await toggleLike(postId);
            if (result.success) {
                await loadPosts();
            }
        });
    });

    document.querySelectorAll('.review-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const postId = btn.dataset.postId;
            await showPostDetail(postId);
        });
    });

    document.querySelectorAll('.post-card').forEach(card => {
        card.addEventListener('click', async (e) => {
            if (!e.target.closest('.post-actions')) {
                const postId = card.querySelector('.like-btn').dataset.postId;
                await showPostDetail(postId);
            }
        });
    });
}

// Cargar y mostrar publicaciones
async function loadPosts(filter = 'all') {
    const result = await getPosts(filter);
    if (result.success) {
        await renderPosts(result.data);
    } else {
        showAlert('Error al cargar publicaciones: ' + result.error, 'error');
    }
}

// Mostrar detalles de publicación
async function showPostDetail(postId) {
    if (!supabase) {
        showAlert('Supabase no está configurado', 'error');
        return;
    }
    try {
        const { data: post, error } = await supabase
            .from('posts')
            .select(`
                *,
                profiles:user_id (name),
                likes (id, user_id),
                reviews (
                    id,
                    rating,
                    comment,
                    created_at,
                    profiles:user_id (name)
                )
            `)
            .eq('id', postId)
            .single();

        if (error) throw error;

        const liked = await checkUserLiked(postId);
        const likeCount = post.likes ? post.likes.length : 0;

        const modal = document.getElementById('post-detail-modal');
        const content = document.getElementById('post-detail-content');

        content.innerHTML = `
            <div class="post-detail">
                <img src="${post.image_url}" alt="${post.name}" class="post-detail-image" onerror="this.src='https://via.placeholder.com/400x400?text=Cafeteria'">
                <div class="post-detail-info">
                    <h2>${post.name}</h2>
                    <p class="post-detail-address"><i class="fas fa-map-marker-alt"></i> ${post.address}</p>
                    <p class="post-detail-description">${post.description}</p>
                    <div class="post-actions">
                        <button class="like-btn ${liked ? 'liked' : ''}" data-post-id="${post.id}">
                            <i class="fas fa-heart"></i>
                        </button>
                        <span class="like-count">${likeCount} me gusta</span>
                    </div>
                    <div class="reviews-section">
                        <h3>Reseñas (${post.reviews ? post.reviews.length : 0})</h3>
                        <div id="reviews-list">
                            ${post.reviews && post.reviews.length > 0 
                                ? post.reviews.map(review => `
                                    <div class="review-item">
                                        <div class="review-header">
                                            <span class="review-author">${review.profiles.name}</span>
                                            <span class="review-rating">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</span>
                                        </div>
                                        <p class="review-text">${review.comment}</p>
                                    </div>
                                `).join('')
                                : '<p style="color: var(--text-light);">No hay reseñas aún</p>'
                            }
                        </div>
                        <div class="review-form">
                            <h4>Agregar Reseña</h4>
                            <form id="add-review-form">
                                <div class="form-group">
                                    <label>Calificación</label>
                                    <div class="rating-input">
                                        ${[1,2,3,4,5].map(i => `<span class="rating-star" data-rating="${i}">☆</span>`).join('')}
                                    </div>
                                    <input type="hidden" id="review-rating" value="5">
                                </div>
                                <div class="form-group">
                                    <label for="review-comment">Comentario</label>
                                    <textarea id="review-comment" rows="3" required></textarea>
                                </div>
                                <button type="submit" class="btn btn-primary">Agregar Reseña</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Rating stars
        content.querySelectorAll('.rating-star').forEach(star => {
            star.addEventListener('click', () => {
                const rating = parseInt(star.dataset.rating);
                document.getElementById('review-rating').value = rating;
                content.querySelectorAll('.rating-star').forEach((s, i) => {
                    s.textContent = i < rating ? '★' : '☆';
                    s.classList.toggle('active', i < rating);
                });
            });
        });

        // Like button
        content.querySelector('.like-btn')?.addEventListener('click', async () => {
            const result = await toggleLike(postId);
            if (result.success) {
                await showPostDetail(postId);
            }
        });

        // Review form
        content.querySelector('#add-review-form')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const rating = parseInt(document.getElementById('review-rating').value);
            const comment = document.getElementById('review-comment').value;
            const result = await createReview(postId, rating, comment);
            if (result.success) {
                await showPostDetail(postId);
            }
        });

        modal.style.display = 'block';
    } catch (error) {
        showAlert('Error al cargar detalles: ' + error.message, 'error');
    }
}

// Función auxiliar para mostrar alertas
function showAlert(message, type = 'success') {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    document.body.insertBefore(alert, document.body.firstChild);
    setTimeout(() => alert.remove(), 5000);
}

