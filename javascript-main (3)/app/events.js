// Gestión de autenticación
class AuthManager {
    constructor() {
        this.isAuthenticated = false;
        this.init();
    }

    init() {
        // Verificar si estamos en la página de admin y no hay sesión activa
        if (window.location.pathname.includes('/admin.html')) {
            this.checkAdminAccess();
        }
        
        // Verificar sesión existente
        this.checkSession();
    }

    checkAdminAccess() {
        const isLoggedIn = localStorage.getItem('adminLoggedIn');
        if (!isLoggedIn || isLoggedIn !== 'true') {
            window.location.href = '/pages/login.html';
            return;
        }
    }

    checkSession() {
        const isLoggedIn = localStorage.getItem('adminLoggedIn');
        if (isLoggedIn === 'true') {
            this.isAuthenticated = true;
        }
    }

    async login(username, password) {
        // Credenciales de prueba
        if (username === 'admin' && password === 'admin123') {
            this.isAuthenticated = true;
            localStorage.setItem('adminLoggedIn', 'true');
            
            // Mostrar notificación de éxito
            if (window.notificationManager) {
                window.notificationManager.show('Inicio de sesión exitoso', 'success');
            }
            
            // Redirigir al panel de administración
            setTimeout(() => {
                window.location.href = '/pages/admin.html';
            }, 1000);
            
            return true;
        } else {
            if (window.notificationManager) {
                window.notificationManager.show('Credenciales incorrectas', 'error');
            }
            return false;
        }
    }

    logout() {
        this.isAuthenticated = false;
        localStorage.removeItem('adminLoggedIn');
        
        if (window.notificationManager) {
            window.notificationManager.show('Sesión cerrada exitosamente', 'success');
        }
        
        setTimeout(() => {
            window.location.href = '/pages/login.html';
        }, 1000);
    }
}

// Inicializar el gestor de autenticación
window.authManager = new AuthManager();