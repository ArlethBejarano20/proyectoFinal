// Funciones para manejar reseñas

// Crear reseña
async function createReview(postId, rating, comment) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            showAlert('Debes iniciar sesión para agregar una reseña', 'error');
            return { success: false, error: 'No autenticado' };
        }

        // Verificar si ya tiene una reseña
        const { data: existingReview } = await supabase
            .from('reviews')
            .select('id')
            .eq('post_id', postId)
            .eq('user_id', user.id)
            .single();

        if (existingReview) {
            // Actualizar reseña existente
            const { error } = await supabase
                .from('reviews')
                .update({
                    rating: rating,
                    comment: comment
                })
                .eq('id', existingReview.id);

            if (error) throw error;
            showAlert('Reseña actualizada', 'success');
        } else {
            // Crear nueva reseña
            const { error } = await supabase
                .from('reviews')
                .insert([
                    {
                        post_id: postId,
                        user_id: user.id,
                        rating: rating,
                        comment: comment
                    }
                ]);

            if (error) throw error;
            showAlert('Reseña agregada', 'success');
        }

        return { success: true };
    } catch (error) {
        showAlert('Error al agregar reseña: ' + error.message, 'error');
        return { success: false, error: error.message };
    }
}

// Obtener reseñas de un post
async function getPostReviews(postId) {
    try {
        const { data, error } = await supabase
            .from('reviews')
            .select(`
                *,
                profiles:user_id (name)
            `)
            .eq('post_id', postId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return { success: true, data: data || [] };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Obtener reseñas del usuario actual
async function getUserReviews(userId) {
    try {
        const { data, error } = await supabase
            .from('reviews')
            .select(`
                *,
                posts:post_id (id, name, image_url)
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return { success: true, data: data || [] };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

