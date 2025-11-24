// Funciones auxiliares globales

// Función para mostrar alertas
function showAlert(message, type = 'success') {
    try {
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.textContent = message;
        alert.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        `;
        
        if (type === 'success') {
            alert.style.backgroundColor = '#10b981';
        } else if (type === 'error') {
            alert.style.backgroundColor = '#ef4444';
        } else {
            alert.style.backgroundColor = '#3b82f6';
        }
        
        document.body.appendChild(alert);
        
        setTimeout(() => {
            alert.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => {
                if (alert.parentNode) {
                    alert.remove();
                }
            }, 300);
        }, 5000);
    } catch (error) {
        console.error('Error mostrando alerta:', error);
        // Fallback a alert nativo
        alert(message);
    }
}

// Agregar estilos de animación si no existen
if (!document.getElementById('alert-animations')) {
    const style = document.createElement('style');
    style.id = 'alert-animations';
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

