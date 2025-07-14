// Gestor de compras y asistencias
class PurchaseManager {
    constructor() {
        this.currentStep = 1;
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Prevenir el envío del formulario que causa el cierre del modal
        const purchaseForm = document.getElementById('purchase-form');
        if (purchaseForm) {
            purchaseForm.addEventListener('submit', (e) => {
                e.preventDefault();
            });
        }

        const attendanceForm = document.getElementById('attendance-form');
        if (attendanceForm) {
            attendanceForm.addEventListener('submit', (e) => {
                e.preventDefault();
            });
        }
    }

    async proceedPurchase() {
        const step1 = document.getElementById('purchase-step-1');
        const step2 = document.getElementById('purchase-step-2');
        const step3 = document.getElementById('purchase-step-3');
        const buttons = document.getElementById('purchase-buttons');
        const continueBtn = document.getElementById('purchase-continue');

        if (this.currentStep === 1) {
            // Validar formulario del paso 1
            const form = document.getElementById('purchase-form');
            if (!window.formManager.validateForm(form)) {
                return;
            }

            // Ir al paso 2
            step1.classList.add('hidden');
            step2.classList.remove('hidden');
            continueBtn.textContent = 'Procesar Pago';
            this.currentStep = 2;

        } else if (this.currentStep === 2) {
            // Validar formulario del paso 2
            const form = document.getElementById('payment-form');
            if (!window.formManager.validateForm(form)) {
                return;
            }

            // Simular procesamiento de pago
            continueBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Procesando...';
            continueBtn.disabled = true;

            try {
                await this.processPurchase();
                
                // Ir al paso 3
                step2.classList.add('hidden');
                step3.classList.remove('hidden');
                buttons.classList.add('hidden');
                this.currentStep = 3;

            } catch (error) {
                window.notificationManager.show('Error al procesar el pago', 'error');
                continueBtn.innerHTML = 'Procesar Pago';
                continueBtn.disabled = false;
            }
        }
    }

    async processPurchase() {
        // Simular delay de procesamiento
        await new Promise(resolve => setTimeout(resolve, 2000));

        const formData = new FormData(document.getElementById('purchase-form'));
        const ticketNumber = `TKT-${Date.now()}`;
        
        const ticketData = {
            eventId: parseInt(window.eventManager.currentEvent.id),
            ticketNumber: ticketNumber,
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            purchaseDate: new Date().toISOString()
        };

        // Guardar en la base de datos
        const response = await fetch('http://localhost:3000/tickets', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(ticketData)
        });

        if (!response.ok) {
            throw new Error('Error al guardar el ticket');
        }

        // Mostrar notificación de éxito
        window.notificationManager.show('¡Compra realizada exitosamente!', 'success');

        // Mostrar información del ticket
        document.getElementById('ticket-number').textContent = ticketNumber;
        document.getElementById('ticket-event-name').textContent = window.eventManager.currentEvent.title;
        
        const eventDate = new Date(window.eventManager.currentEvent.date);
        document.getElementById('ticket-event-date').textContent = eventDate.toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        // NO resetear automáticamente - el usuario debe cerrar manualmente
        // this.currentStep = 1;
    }

    async processAttendance() {
        const form = document.getElementById('attendance-form');
        if (!window.formManager.validateForm(form)) {
            return;
        }

        const continueBtn = document.getElementById('attendance-continue');
        continueBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Procesando...';
        continueBtn.disabled = true;

        try {
            // Simular delay de procesamiento
            await new Promise(resolve => setTimeout(resolve, 1500));

            const formData = new FormData(form);
            const attendanceNumber = `ATT-${Date.now()}`;
            
            const attendanceData = {
                eventId: parseInt(window.eventManager.currentEvent.id),
                attendanceNumber: attendanceNumber,
                name: formData.get('name'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                registrationDate: new Date().toISOString()
            };

            // Guardar en la base de datos
            const response = await fetch('http://localhost:3000/attendees', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(attendanceData)
            });

            if (!response.ok) {
                throw new Error('Error al registrar asistencia');
            }

            // Mostrar notificación de éxito
            window.notificationManager.show('¡Asistencia confirmada exitosamente!', 'success');

            // Mostrar paso de confirmación
            document.getElementById('attendance-step-1').classList.add('hidden');
            document.getElementById('attendance-step-2').classList.remove('hidden');
            document.getElementById('attendance-buttons').classList.add('hidden');

            // Mostrar información de registro
            document.getElementById('attendance-number').textContent = attendanceNumber;
            document.getElementById('attendance-event-name').textContent = window.eventManager.currentEvent.title;
            
            const eventDate = new Date(window.eventManager.currentEvent.date);
            document.getElementById('attendance-event-date').textContent = eventDate.toLocaleDateString('es-ES', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            // NO resetear automáticamente - el usuario debe cerrar manualmente

        } catch (error) {
            window.notificationManager.show('Error al confirmar asistencia', 'error');
            continueBtn.innerHTML = 'Confirmar Asistencia';
            continueBtn.disabled = false;
        }
    }
}

// Inicializar el gestor de compras
window.purchaseManager = new PurchaseManager();