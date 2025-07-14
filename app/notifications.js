// Archivo principal - solo inicialización y funciones globales
document.addEventListener('DOMContentLoaded', function() {
    console.log('Tierra Tostada - Sistema de Eventos de Café iniciado');
});

// Funciones globales para mantener compatibilidad con HTML existente
function showSection(sectionName) {
    if (window.adminManager) {
        window.adminManager.showSection(sectionName);
    }
}

function logout() {
    if (window.authManager) {
        window.authManager.logout();
    }
}

function closeEventDetailsModal() {
    if (window.eventManager) {
        window.eventManager.closeEventDetailsModal();
    }
}

function closePurchaseModal() {
    if (window.eventManager) {
        window.eventManager.closePurchaseModal();
    }
}

function closeAttendanceModal() {
    if (window.eventManager) {
        window.eventManager.closeAttendanceModal();
    }
}

function proceedPurchase() {
    if (window.purchaseManager) {
        window.purchaseManager.proceedPurchase();
    }
}

function processAttendance() {
    if (window.purchaseManager) {
        window.purchaseManager.processAttendance();
    }
}

// Funciones de confirmación modal
function closeConfirmationModal() {
    if (window.adminManager) {
        window.adminManager.closeConfirmationModal();
    } else {
        const modal = document.getElementById('confirmation-modal');
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }
    }
}