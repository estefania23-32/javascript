// Gestor del panel de administración
class AdminManager {
    constructor() {
        this.currentSection = 'dashboard';
        this.events = [];
        this.subscriptions = [];
        this.messages = [];
        this.tickets = [];
        this.attendees = [];
        this.init();
    }

    async init() {
        // Verificar autenticación
        if (!window.authManager.isAuthenticated) {
            window.location.href = '/pages/login.html';
            return;
        }

        await this.loadData();
        this.updateDashboard();
        this.setupEventListeners();
    }

    async loadData() {
        try {
            const [eventsRes, subscriptionsRes, messagesRes, ticketsRes, attendeesRes] = await Promise.all([
                fetch('http://localhost:3000/events'),
                fetch('http://localhost:3000/subscriptions'),
                fetch('http://localhost:3000/messages'),
                fetch('http://localhost:3000/tickets'),
                fetch('http://localhost:3000/attendees')
            ]);

            this.events = await eventsRes.json();
            this.subscriptions = await subscriptionsRes.json();
            this.messages = await messagesRes.json();
            this.tickets = await ticketsRes.json();
            this.attendees = await attendeesRes.json();
        } catch (error) {
            console.error('Error loading admin data:', error);
            window.notificationManager.show('Error al cargar datos del panel', 'error');
        }
    }

    updateDashboard() {
        // Actualizar estadísticas
        const activeEvents = this.events.filter(e => e.status === 'active').length;
        const cancelledEvents = this.events.filter(e => e.status === 'cancelled').length;
        const freeEvents = this.events.filter(e => e.type === 'free').length;
        const paidEvents = this.events.filter(e => e.type === 'paid').length;

        document.getElementById('active-events').textContent = activeEvents;
        document.getElementById('cancelled-events').textContent = cancelledEvents;
        document.getElementById('free-events').textContent = freeEvents;
        document.getElementById('paid-events').textContent = paidEvents;
        document.getElementById('subscriptions-count').textContent = this.subscriptions.length;
        document.getElementById('messages-count').textContent = this.messages.length;
        document.getElementById('tickets-sold').textContent = this.tickets.length;
        document.getElementById('attendees-count').textContent = this.attendees.length;
    }

    setupEventListeners() {
        // Manejadores de eventos para navegación del admin
        const navButtons = document.querySelectorAll('.admin-nav-btn');
        navButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const section = e.target.getAttribute('onclick').match(/'([^']+)'/)[1];
                this.showSection(section);
            });
        });
    }

    showSection(sectionName) {
        // Ocultar todas las secciones
        document.querySelectorAll('.admin-section').forEach(section => {
            section.classList.add('hidden');
        });

        // Mostrar la sección seleccionada
        const targetSection = document.getElementById(`${sectionName}-section`);
        if (targetSection) {
            targetSection.classList.remove('hidden');
        }

        // Actualizar navegación activa
        document.querySelectorAll('.admin-nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeBtn = document.querySelector(`[onclick="showSection('${sectionName}')"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }

        this.currentSection = sectionName;

        // Cargar contenido específico de la sección
        switch (sectionName) {
            case 'events':
                this.loadEventsTable();
                break;
            case 'subscriptions':
                this.loadSubscriptionsTable();
                break;
            case 'messages':
                this.loadMessagesTable();
                break;
            case 'tickets':
                this.loadTicketsTable();
                break;
            case 'attendees':
                this.loadAttendeesTable();
                break;
        }
    }

    loadEventsTable() {
        const container = document.getElementById('events-table');
        if (!container) return;

        container.innerHTML = `
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead>
                        <tr class="border-b border-coffee-200">
                            <th class="text-left py-4 px-4 font-semibold text-coffee-800">Título</th>
                            <th class="text-left py-4 px-4 font-semibold text-coffee-800">Fecha</th>
                            <th class="text-left py-4 px-4 font-semibold text-coffee-800">Estado</th>
                            <th class="text-left py-4 px-4 font-semibold text-coffee-800">Tipo</th>
                            <th class="text-left py-4 px-4 font-semibold text-coffee-800">Precio</th>
                            <th class="text-left py-4 px-4 font-semibold text-coffee-800">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.events.map(event => {
                            const eventDate = new Date(event.date);
                            const formattedDate = eventDate.toLocaleDateString('es-ES');
                            const statusClass = event.status === 'active' ? 'bg-green-100 text-green-800' : 
                                               event.status === 'inactive' ? 'bg-gray-100 text-gray-800' : 
                                               'bg-red-100 text-red-800';
                            const typeClass = event.type === 'free' ? 'bg-blue-100 text-blue-800' : 'bg-coffee-100 text-coffee-800';

                            return `
                                <tr class="border-b border-coffee-100 hover:bg-coffee-50">
                                    <td class="py-4 px-4">
                                        <div class="font-medium text-coffee-800">${event.title}</div>
                                    </td>
                                    <td class="py-4 px-4 text-coffee-700">${formattedDate}</td>
                                    <td class="py-4 px-4">
                                        <span class="px-3 py-1 rounded-full text-xs font-semibold ${statusClass}">
                                            ${event.status === 'active' ? 'Activo' : event.status === 'inactive' ? 'Inactivo' : 'Cancelado'}
                                        </span>
                                    </td>
                                    <td class="py-4 px-4">
                                        <span class="px-3 py-1 rounded-full text-xs font-semibold ${typeClass}">
                                            ${event.type === 'free' ? 'Gratuito' : 'Pago'}
                                        </span>
                                    </td>
                                    <td class="py-4 px-4 text-coffee-700">
                                        ${event.type === 'paid' ? `$${event.price?.toLocaleString()}` : 'Gratuito'}
                                    </td>
                                    <td class="py-4 px-4">
                                        <div class="flex space-x-2">
                                            <button onclick="window.adminManager.editEvent('${event.id}')" 
                                                    class="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                                                <i class="fas fa-edit"></i>
                                            </button>
                                            <button onclick="window.adminManager.deleteEvent('${event.id}')" 
                                                    class="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    loadSubscriptionsTable() {
        const container = document.getElementById('subscriptions-table');
        if (!container) return;

        container.innerHTML = `
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead>
                        <tr class="border-b border-coffee-200">
                            <th class="text-left py-4 px-4 font-semibold text-coffee-800">Email</th>
                            <th class="text-left py-4 px-4 font-semibold text-coffee-800">Fecha de Suscripción</th>
                            <th class="text-left py-4 px-4 font-semibold text-coffee-800">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.subscriptions.map(subscription => {
                            const subDate = new Date(subscription.date);
                            const formattedDate = subDate.toLocaleDateString('es-ES');

                            return `
                                <tr class="border-b border-coffee-100 hover:bg-coffee-50">
                                    <td class="py-4 px-4 text-coffee-800">${subscription.email}</td>
                                    <td class="py-4 px-4 text-coffee-700">${formattedDate}</td>
                                    <td class="py-4 px-4">
                                        <button onclick="window.adminManager.deleteSubscription('${subscription.id}')" 
                                                class="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    loadMessagesTable() {
        const container = document.getElementById('messages-table');
        if (!container) return;

        container.innerHTML = `
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead>
                        <tr class="border-b border-coffee-200">
                            <th class="text-left py-4 px-4 font-semibold text-coffee-800">Nombre</th>
                            <th class="text-left py-4 px-4 font-semibold text-coffee-800">Email</th>
                            <th class="text-left py-4 px-4 font-semibold text-coffee-800">Mensaje</th>
                            <th class="text-left py-4 px-4 font-semibold text-coffee-800">Fecha</th>
                            <th class="text-left py-4 px-4 font-semibold text-coffee-800">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.messages.map(message => {
                            const msgDate = new Date(message.date);
                            const formattedDate = msgDate.toLocaleDateString('es-ES');

                            return `
                                <tr class="border-b border-coffee-100 hover:bg-coffee-50">
                                    <td class="py-4 px-4 text-coffee-800">${message.name}</td>
                                    <td class="py-4 px-4 text-coffee-700">${message.email}</td>
                                    <td class="py-4 px-4 text-coffee-700 max-w-xs truncate">${message.message}</td>
                                    <td class="py-4 px-4 text-coffee-700">${formattedDate}</td>
                                    <td class="py-4 px-4">
                                        <button onclick="window.adminManager.deleteMessage('${message.id}')" 
                                                class="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    loadTicketsTable() {
        const container = document.getElementById('tickets-table');
        if (!container) return;

        container.innerHTML = `
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead>
                        <tr class="border-b border-coffee-200">
                            <th class="text-left py-4 px-4 font-semibold text-coffee-800">Número de Ticket</th>
                            <th class="text-left py-4 px-4 font-semibold text-coffee-800">Evento</th>
                            <th class="text-left py-4 px-4 font-semibold text-coffee-800">Comprador</th>
                            <th class="text-left py-4 px-4 font-semibold text-coffee-800">Email</th>
                            <th class="text-left py-4 px-4 font-semibold text-coffee-800">Fecha de Compra</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.tickets.map(ticket => {
                            const event = this.events.find(e => e.id == ticket.eventId);
                            const purchaseDate = new Date(ticket.purchaseDate);
                            const formattedDate = purchaseDate.toLocaleDateString('es-ES');

                            return `
                                <tr class="border-b border-coffee-100 hover:bg-coffee-50">
                                    <td class="py-4 px-4 font-mono text-coffee-800">${ticket.ticketNumber}</td>
                                    <td class="py-4 px-4 text-coffee-700">${event ? event.title : 'Evento no encontrado'}</td>
                                    <td class="py-4 px-4 text-coffee-800">${ticket.name}</td>
                                    <td class="py-4 px-4 text-coffee-700">${ticket.email}</td>
                                    <td class="py-4 px-4 text-coffee-700">${formattedDate}</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    loadAttendeesTable() {
        const container = document.getElementById('attendees-table');
        if (!container) return;

        container.innerHTML = `
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead>
                        <tr class="border-b border-coffee-200">
                            <th class="text-left py-4 px-4 font-semibold text-coffee-800">Número de Registro</th>
                            <th class="text-left py-4 px-4 font-semibold text-coffee-800">Evento</th>
                            <th class="text-left py-4 px-4 font-semibold text-coffee-800">Asistente</th>
                            <th class="text-left py-4 px-4 font-semibold text-coffee-800">Email</th>
                            <th class="text-left py-4 px-4 font-semibold text-coffee-800">Fecha de Registro</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.attendees.map(attendee => {
                            const event = this.events.find(e => e.id == attendee.eventId);
                            const regDate = new Date(attendee.registrationDate);
                            const formattedDate = regDate.toLocaleDateString('es-ES');

                            return `
                                <tr class="border-b border-coffee-100 hover:bg-coffee-50">
                                    <td class="py-4 px-4 font-mono text-coffee-800">${attendee.attendanceNumber}</td>
                                    <td class="py-4 px-4 text-coffee-700">${event ? event.title : 'Evento no encontrado'}</td>
                                    <td class="py-4 px-4 text-coffee-800">${attendee.name}</td>
                                    <td class="py-4 px-4 text-coffee-700">${attendee.email}</td>
                                    <td class="py-4 px-4 text-coffee-700">${formattedDate}</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    // Funciones para gestión de eventos
    showEventForm(eventId = null) {
        const modal = document.getElementById('event-modal');
        const form = document.getElementById('event-form');
        const title = document.getElementById('event-modal-title');
        
        // Resetear formulario
        form.reset();
        document.getElementById('event-id').value = '';
        document.getElementById('price-field').classList.add('hidden');
        
        if (eventId) {
            // Modo edición
            const event = this.events.find(e => e.id === eventId);
            if (event) {
                title.textContent = 'Editar Evento';
                document.getElementById('event-id').value = event.id;
                form.querySelector('[name="title"]').value = event.title;
                form.querySelector('[name="description"]').value = event.description;
                form.querySelector('[name="image"]').value = event.image;
                form.querySelector('[name="date"]').value = event.date.slice(0, 16);
                form.querySelector('[name="status"]').value = event.status;
                form.querySelector('[name="type"]').value = event.type;
                
                if (event.type === 'paid') {
                    document.getElementById('price-field').classList.remove('hidden');
                    form.querySelector('[name="price"]').value = event.price;
                }
                
                // Cargar patrocinadores
                this.loadSponsors(event.sponsors || []);
            }
        } else {
            // Modo creación
            title.textContent = 'Nuevo Evento';
            this.loadSponsors([]);
        }
        
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }

    closeEventModal() {
        const modal = document.getElementById('event-modal');
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }

    async saveEvent() {
        const form = document.getElementById('event-form');
        
        // Validar formulario
        if (!window.formManager.validateForm(form)) {
            return;
        }
        
        const formData = new FormData(form);
        
        const eventData = {
            title: formData.get('title'),
            description: formData.get('description'),
            image: formData.get('image'),
            date: formData.get('date'),
            status: formData.get('status'),
            type: formData.get('type'),
            price: formData.get('type') === 'paid' ? parseFloat(formData.get('price')) : 0,
            sponsors: this.getSponsorsFromForm()
        };

        const eventId = formData.get('id');
        
        try {
            let response;
            if (eventId) {
                // Actualizar evento existente
                response = await fetch(`http://localhost:3000/events/${eventId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...eventData, id: eventId })
                });
            } else {
                // Crear nuevo evento
                response = await fetch('http://localhost:3000/events', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(eventData)
                });
            }

            if (response.ok) {
                window.notificationManager.show(
                    eventId ? 'Evento actualizado correctamente' : 'Evento creado correctamente', 
                    'success'
                );
                this.closeEventModal();
                await this.loadData();
                this.loadEventsTable();
                this.updateDashboard();
            } else {
                throw new Error('Error al guardar evento');
            }
        } catch (error) {
            console.error('Error saving event:', error);
            window.notificationManager.show('Error al guardar evento', 'error');
        }
    }

    async deleteEvent(eventId) {
        const event = this.events.find(e => e.id === eventId);
        const eventName = event ? event.title : 'este evento';
        
        this.showConfirmationModal(
            'Eliminar Evento',
            `¿Estás seguro de que quieres eliminar "${eventName}"? Esta acción no se puede deshacer.`,
            async () => {
                try {
                    const response = await fetch(`http://localhost:3000/events/${eventId}`, {
                        method: 'DELETE'
                    });

                    if (response.ok) {
                        window.notificationManager.show('Evento eliminado correctamente', 'success');
                        await this.loadData();
                        this.loadEventsTable();
                        this.updateDashboard();
                    } else {
                        throw new Error('Error al eliminar evento');
                    }
                } catch (error) {
                    console.error('Error deleting event:', error);
                    window.notificationManager.show('Error al eliminar evento', 'error');
                }
            }
        );
    }

    editEvent(eventId) {
        this.showEventForm(eventId);
    }

    // Funciones para gestión de suscripciones
    async deleteSubscription(subscriptionId) {
        const subscription = this.subscriptions.find(s => s.id === subscriptionId);
        const email = subscription ? subscription.email : 'esta suscripción';
        
        this.showConfirmationModal(
            'Eliminar Suscripción',
            `¿Estás seguro de que quieres eliminar la suscripción de "${email}"? Esta acción no se puede deshacer.`,
            async () => {
                try {
                    const response = await fetch(`http://localhost:3000/subscriptions/${subscriptionId}`, {
                        method: 'DELETE'
                    });

                    if (response.ok) {
                        window.notificationManager.show('Suscripción eliminada correctamente', 'success');
                        await this.loadData();
                        this.loadSubscriptionsTable();
                        this.updateDashboard();
                    } else {
                        throw new Error('Error al eliminar suscripción');
                    }
                } catch (error) {
                    console.error('Error deleting subscription:', error);
                    window.notificationManager.show('Error al eliminar suscripción', 'error');
                }
            }
        );
    }

    // Funciones para gestión de mensajes
    async deleteMessage(messageId) {
        const message = this.messages.find(m => m.id === messageId);
        const senderName = message ? message.name : 'este mensaje';
        
        this.showConfirmationModal(
            'Eliminar Mensaje',
            `¿Estás seguro de que quieres eliminar el mensaje de "${senderName}"? Esta acción no se puede deshacer.`,
            async () => {
                try {
                    const response = await fetch(`http://localhost:3000/messages/${messageId}`, {
                        method: 'DELETE'
                    });

                    if (response.ok) {
                        window.notificationManager.show('Mensaje eliminado correctamente', 'success');
                        await this.loadData();
                        this.loadMessagesTable();
                        this.updateDashboard();
                    } else {
                        throw new Error('Error al eliminar mensaje');
                    }
                } catch (error) {
                    console.error('Error deleting message:', error);
                    window.notificationManager.show('Error al eliminar mensaje', 'error');
                }
            }
        );
    }

    // Funciones auxiliares para patrocinadores
    loadSponsors(sponsors) {
        const container = document.getElementById('sponsors-container');
        container.innerHTML = '';
        
        if (sponsors.length === 0) {
            this.addSponsor();
        } else {
            sponsors.forEach(sponsor => {
                this.addSponsor(sponsor.name);
            });
        }
    }

    addSponsor(value = '') {
        const container = document.getElementById('sponsors-container');
        const sponsorDiv = document.createElement('div');
        sponsorDiv.className = 'sponsor-input flex gap-3';
        sponsorDiv.innerHTML = `
            <input type="text" name="sponsor" placeholder="Nombre del patrocinador" value="${value}"
                   class="flex-1 px-4 py-3 border border-coffee-200 rounded-xl focus:ring-2 focus:ring-coffee-500 focus:border-transparent">
            <button type="button" onclick="window.adminManager.removeSponsor(this)" class="px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors">
                <i class="fas fa-trash"></i>
            </button>
        `;
        container.appendChild(sponsorDiv);
    }

    removeSponsor(button) {
        const container = document.getElementById('sponsors-container');
        if (container.children.length > 1) {
            button.parentElement.remove();
        }
    }

    getSponsorsFromForm() {
        const sponsorInputs = document.querySelectorAll('[name="sponsor"]');
        const sponsors = [];
        sponsorInputs.forEach(input => {
            if (input.value.trim()) {
                sponsors.push({ name: input.value.trim() });
            }
        });
        return sponsors;
    }

    // Función para mostrar modal de confirmación personalizado
    showConfirmationModal(title, message, onConfirm) {
        const modal = document.getElementById('confirmation-modal');
        const modalContent = document.getElementById('confirmation-modal-content');
        const titleElement = document.getElementById('confirmation-title');
        const messageElement = document.getElementById('confirmation-message');
        const confirmButton = document.getElementById('confirmation-confirm');
        
        // Configurar contenido del modal
        titleElement.textContent = title;
        messageElement.textContent = message;
        
        // Configurar botón de confirmación
        confirmButton.onclick = () => {
            this.closeConfirmationModal();
            onConfirm();
        };
        
        // Mostrar modal con animación
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        
        // Animar entrada del modal
        setTimeout(() => {
            modalContent.classList.remove('scale-95');
            modalContent.classList.add('scale-100');
        }, 10);
    }

    closeConfirmationModal() {
        const modal = document.getElementById('confirmation-modal');
        const modalContent = document.getElementById('confirmation-modal-content');
        
        // Animar salida del modal
        modalContent.classList.remove('scale-100');
        modalContent.classList.add('scale-95');
        
        setTimeout(() => {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }, 300);
    }
}

// Inicializar el gestor de administración solo si estamos en la página de admin
if (window.location.pathname.includes('/admin.html')) {
    window.adminManager = new AdminManager();
}

// Funciones globales para compatibilidad con HTML
function showEventForm(eventId = null) {
    if (window.adminManager) {
        window.adminManager.showEventForm(eventId);
    }
}

function closeEventModal() {
    if (window.adminManager) {
        window.adminManager.closeEventModal();
    }
}

function saveEvent() {
    if (window.adminManager) {
        window.adminManager.saveEvent();
    }
}

function togglePriceField(select) {
    const priceField = document.getElementById('price-field');
    if (select.value === 'paid') {
        priceField.classList.remove('hidden');
    } else {
        priceField.classList.add('hidden');
    }
}

function addSponsor() {
    if (window.adminManager) {
        window.adminManager.addSponsor();
    }
}

function removeSponsor(button) {
    if (window.adminManager) {
        window.adminManager.removeSponsor(button);
    }
}