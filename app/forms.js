// Gestor de formularios con validaciones y formateo
class FormManager {
    constructor() {
        this.setupEventListeners();
        this.setupFormValidations();
    }

    setupEventListeners() {
        // Formulario de contacto
        const contactForm = document.getElementById('contact-form');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => this.handleContactForm(e));
        }

        // Formulario de newsletter
        const newsletterForm = document.getElementById('newsletter-form');
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', (e) => this.handleNewsletterForm(e));
        }

        // Formulario de login
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLoginForm(e));
        }

        // Formulario de compra
        const purchaseForm = document.getElementById('purchase-form');
        if (purchaseForm) {
            purchaseForm.addEventListener('submit', (e) => {
                e.preventDefault();
            });
        }

        // Formulario de asistencia
        const attendanceForm = document.getElementById('attendance-form');
        if (attendanceForm) {
            attendanceForm.addEventListener('submit', (e) => {
                e.preventDefault();
            });
        }

        // Formulario de evento (admin)
        const eventForm = document.getElementById('event-form');
        if (eventForm) {
            eventForm.addEventListener('submit', (e) => {
                e.preventDefault();
            });
        }
    }

    setupFormValidations() {
        // Aplicar validaciones a todos los campos de texto
        this.setupTextInputs();
        this.setupNumberInputs();
        this.setupEmailInputs();
        this.setupPhoneInputs();
        this.setupCardInputs();
        this.setupDateInputs();
    }

    setupTextInputs() {
        // Campos de solo texto (nombres y títulos)
        const textInputs = document.querySelectorAll('input[type="text"][name*="name"], input[type="text"][name*="title"]');
        textInputs.forEach(input => {
            input.addEventListener('input', (e) => {
                // Permitir solo letras, espacios y algunos caracteres especiales
                let value = e.target.value;
                value = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s\-\.]/g, '');
                e.target.value = value;
            });

            input.addEventListener('blur', (e) => {
                // Capitalizar primera letra de cada palabra
                let value = e.target.value;
                value = value.replace(/\b\w/g, l => l.toUpperCase());
                e.target.value = value;
            });
        });

        // Campos de descripción (permitir más caracteres)
        const descriptionInputs = document.querySelectorAll('textarea[name*="description"], textarea[name*="message"]');
        descriptionInputs.forEach(input => {
            input.addEventListener('blur', (e) => {
                // Validar que no esté vacío
                if (e.target.value.trim().length < 10) {
                    this.showFieldError(input, 'La descripción debe tener al menos 10 caracteres');
                } else {
                    this.clearFieldError(input);
                }
            });
        });
    }

    setupNumberInputs() {
        // Campos de solo números
        const numberInputs = document.querySelectorAll('input[type="number"], input[name*="price"], input[name*="cvv"]');
        numberInputs.forEach(input => {
            input.addEventListener('input', (e) => {
                // Permitir solo números
                let value = e.target.value;
                value = value.replace(/[^0-9]/g, '');
                e.target.value = value;
            });
        });
    }

    setupEmailInputs() {
        // Campos de email
        const emailInputs = document.querySelectorAll('input[type="email"]');
        emailInputs.forEach(input => {
            input.addEventListener('blur', (e) => {
                const email = e.target.value;
                if (email && !this.isValidEmail(email)) {
                    this.showFieldError(input, 'Por favor ingresa un email válido');
                } else {
                    this.clearFieldError(input);
                }
            });
        });
    }

    setupPhoneInputs() {
        // Campos de teléfono
        const phoneInputs = document.querySelectorAll('input[name*="phone"]');
        phoneInputs.forEach(input => {
            input.addEventListener('input', (e) => {
                let value = e.target.value;
                // Permitir solo números, espacios, +, -, (, )
                value = value.replace(/[^0-9\s\+\-\(\)]/g, '');
                e.target.value = value;
            });

            input.addEventListener('blur', (e) => {
                const phone = e.target.value;
                if (phone && !this.isValidPhone(phone)) {
                    this.showFieldError(input, 'Por favor ingresa un teléfono válido');
                } else {
                    this.clearFieldError(input);
                }
            });
        });
    }

    setupCardInputs() {
        // Número de tarjeta
        const cardNumberInputs = document.querySelectorAll('input[name*="cardNumber"]');
        cardNumberInputs.forEach(input => {
            input.addEventListener('input', (e) => {
                let value = e.target.value;
                // Permitir solo números y espacios
                value = value.replace(/[^0-9\s]/g, '');
                // Formatear con espacios cada 4 dígitos
                value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
                e.target.value = value;
            });

            input.addEventListener('blur', (e) => {
                const cardNumber = e.target.value.replace(/\s/g, '');
                if (cardNumber && !this.isValidCardNumber(cardNumber)) {
                    this.showFieldError(input, 'Número de tarjeta inválido');
                } else {
                    this.clearFieldError(input);
                }
            });
        });

        // Fecha de vencimiento
        const expiryInputs = document.querySelectorAll('input[name*="expiryDate"]');
        expiryInputs.forEach(input => {
            input.addEventListener('input', (e) => {
                let value = e.target.value;
                // Permitir solo números y /
                value = value.replace(/[^0-9\/]/g, '');
                
                // Agregar / automáticamente después de 2 dígitos
                if (value.length === 2 && !value.includes('/')) {
                    value = value + '/';
                }
                
                e.target.value = value;
            });

            input.addEventListener('blur', (e) => {
                const expiry = e.target.value;
                if (expiry && !this.isValidExpiryDate(expiry)) {
                    this.showFieldError(input, 'Fecha de vencimiento inválida');
                } else {
                    this.clearFieldError(input);
                }
            });
        });

        // CVV
        const cvvInputs = document.querySelectorAll('input[name*="cvv"]');
        cvvInputs.forEach(input => {
            input.addEventListener('input', (e) => {
                let value = e.target.value;
                // Permitir solo números, máximo 4 dígitos
                value = value.replace(/[^0-9]/g, '');
                if (value.length > 4) {
                    value = value.slice(0, 4);
                }
                e.target.value = value;
            });

            input.addEventListener('blur', (e) => {
                const cvv = e.target.value;
                if (cvv && !this.isValidCVV(cvv)) {
                    this.showFieldError(input, 'CVV inválido');
                } else {
                    this.clearFieldError(input);
                }
            });
        });
    }

    setupDateInputs() {
        // Campos de fecha
        const dateInputs = document.querySelectorAll('input[type="datetime-local"], input[type="date"]');
        dateInputs.forEach(input => {
            input.addEventListener('blur', (e) => {
                const date = e.target.value;
                if (date && !this.isValidDate(date)) {
                    this.showFieldError(input, 'Fecha inválida');
                } else {
                    this.clearFieldError(input);
                }
            });
        });

        // Campos de URL (imágenes)
        const urlInputs = document.querySelectorAll('input[type="url"], input[name*="image"]');
        urlInputs.forEach(input => {
            input.addEventListener('blur', (e) => {
                const url = e.target.value;
                if (url && !this.isValidURL(url)) {
                    this.showFieldError(input, 'Por favor ingresa una URL válida');
                } else {
                    this.clearFieldError(input);
                }
            });
        });
    }

    // Funciones de validación
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    isValidPhone(phone) {
        // Permitir formatos: +57 300 123 4567, (300) 123-4567, 3001234567
        const phoneRegex = /^[\+]?[0-9\s\-\(\)]{7,15}$/;
        return phoneRegex.test(phone);
    }

    isValidCardNumber(cardNumber) {
        // Validación básica de tarjeta (Luhn algorithm simplificado)
        if (cardNumber.length < 13 || cardNumber.length > 19) return false;
        
        let sum = 0;
        let isEven = false;
        
        for (let i = cardNumber.length - 1; i >= 0; i--) {
            let digit = parseInt(cardNumber[i]);
            
            if (isEven) {
                digit *= 2;
                if (digit > 9) {
                    digit -= 9;
                }
            }
            
            sum += digit;
            isEven = !isEven;
        }
        
        return sum % 10 === 0;
    }

    isValidExpiryDate(expiry) {
        const expiryRegex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
        if (!expiryRegex.test(expiry)) return false;
        
        const [month, year] = expiry.split('/');
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear() % 100;
        const currentMonth = currentDate.getMonth() + 1;
        
        const expYear = parseInt(year);
        const expMonth = parseInt(month);
        
        if (expYear < currentYear) return false;
        if (expYear === currentYear && expMonth < currentMonth) return false;
        
        return true;
    }

    isValidCVV(cvv) {
        return cvv.length >= 3 && cvv.length <= 4;
    }

    isValidDate(date) {
        const selectedDate = new Date(date);
        const currentDate = new Date();
        return selectedDate > currentDate;
    }

    isValidURL(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    // Funciones para mostrar errores
    showFieldError(input, message) {
        // Remover error anterior
        this.clearFieldError(input);
        
        // Agregar clase de error
        input.classList.add('input-error');
        
        // Crear mensaje de error
        const errorDiv = document.createElement('div');
        errorDiv.className = 'text-red-500 text-sm mt-1 flex items-center error-message';
        errorDiv.innerHTML = `<i class="fas fa-exclamation-circle mr-1"></i>${message}`;
        errorDiv.id = `error-${input.id || input.name}`;
        
        // Insertar después del input
        input.parentNode.appendChild(errorDiv);
    }

    clearFieldError(input) {
        // Remover clases de error
        input.classList.remove('input-error');
        
        // Remover mensaje de error
        const errorDiv = document.getElementById(`error-${input.id || input.name}`);
        if (errorDiv) {
            errorDiv.remove();
        }
    }

    // Validar formulario completo
    validateForm(form) {
        let isValid = true;
        const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');
        
        inputs.forEach(input => {
            if (!input.value.trim()) {
                this.showFieldError(input, 'Este campo es obligatorio');
                isValid = false;
            } else {
                this.clearFieldError(input);
            }
        });
        
        return isValid;
    }

    async handleContactForm(e) {
        e.preventDefault();
        
        if (!this.validateForm(e.target)) {
            return;
        }
        
        const formData = new FormData(e.target);
        const messageData = {
            name: formData.get('name'),
            email: formData.get('email'),
            message: formData.get('message'),
            date: new Date().toISOString()
        };

        try {
            const response = await fetch('http://localhost:3000/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(messageData)
            });

            if (response.ok) {
                window.notificationManager.show('Mensaje enviado exitosamente', 'success');
                e.target.reset();
            } else {
                throw new Error('Error al enviar mensaje');
            }
        } catch (error) {
            console.error('Error:', error);
            window.notificationManager.show('Error al enviar el mensaje', 'error');
        }
    }

    async handleNewsletterForm(e) {
        e.preventDefault();
        
        if (!this.validateForm(e.target)) {
            return;
        }
        
        const formData = new FormData(e.target);
        const subscriptionData = {
            email: formData.get('email'),
            date: new Date().toISOString()
        };

        try {
            const response = await fetch('http://localhost:3000/subscriptions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(subscriptionData)
            });

            if (response.ok) {
                window.notificationManager.show('¡Suscripción exitosa!', 'success');
                e.target.reset();
            } else {
                throw new Error('Error al suscribirse');
            }
        } catch (error) {
            console.error('Error:', error);
            window.notificationManager.show('Error al procesar la suscripción', 'error');
        }
    }

    async handleLoginForm(e) {
        e.preventDefault();
        
        if (!this.validateForm(e.target)) {
            return;
        }
        
        const formData = new FormData(e.target);
        const username = formData.get('username');
        const password = formData.get('password');

        const success = await window.authManager.login(username, password);
        
        if (!success) {
            // El error ya se muestra en AuthManager
            return;
        }
    }
}

// Inicializar el gestor de formularios
window.formManager = new FormManager();