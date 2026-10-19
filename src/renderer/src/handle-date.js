const handleDate = () => {
    const dateInputs = document.getElementsByClassName('date');
    const dateErrors = document.getElementsByClassName('date-error');

    // Función para verificar si es año bisiesto
    const esBisiesto = (anio) => {
        return (anio % 4 === 0 && anio % 100 !== 0) || (anio % 400 === 0);
    };

    // Función para obtener días máximos por mes
    const obtenerDiasMes = (mes, anio) => {
        const diasPorMes = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        
        // Febrero en año bisiesto
        if (mes === 2 && esBisiesto(anio)) {
            return 29;
        }
        
        return diasPorMes[mes - 1];
    };

    // Función para validar fecha completa
    const validarFecha = (dia, mes, anio) => {
        // Validar rangos básicos
        if (mes < 1 || mes > 12) {
            return { 
                valido: false,
                mensaje: 'Mes inválido (1-12)'
            };
        };
        
        const diasMaximos = obtenerDiasMes(mes, anio);
        
        if (dia < 1 || dia > diasMaximos) {
            return { 
                valido: false, 
                mensaje: `Día inválido para ${mes}/${anio} (1-${diasMaximos})` 
            };
        };
        
        // Validar año razonable (opcional)
        const anioActual = new Date().getFullYear();
        if (anio < 1980 || anio > anioActual + 50) {
            return { 
                valido: false, 
                mensaje: 'Año fuera de rango (1980-' + (anioActual + 50) + ')' 
            };
        };
        
        // Validación adicional con objeto Date
        const fecha = new Date(anio, mes - 1, dia);
        if (
            fecha.getFullYear() !== anio ||
            fecha.getMonth() !== mes - 1 ||
            fecha.getDate() !== dia
        ) {
            return { 
                valido: false,
                mensaje: 'Fecha inválida'
            };
        };
        
        return { valido: true, mensaje: '' };
    }

    // Formateo automático
    const asignarEventos = (dateInput, dateError) => {
        dateInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, ''); // solo números
            
            if (value.length > 8) {
                value = value.slice(0, 8);
            };
            
            // Formatear dd/mm/aaaa
            if (value.length >= 5) {
                value = `${value.slice(0, 2)}/${value.slice(2, 4)}/${value.slice(4)}`;
            } else if (value.length >= 3) {
                value = `${value.slice(0, 2)}/${value.slice(2)}`;
            };
            
            e.target.value = value;
            
            // Limpiar error mientras escribe
            dateError.classList.add('hidden');
            dateInput.setCustomValidity('');
        });

        // Restringir entrada a solo números
        dateInput.addEventListener('keydown', (e) => {
            // Permitir: backspace, delete, tab, flechas
            if (
                e.key === 'Backspace' ||
                e.key === 'Delete' ||
                e.key === 'Tab' ||
                e.key.startsWith('Arrow')
            ) {
                return;
            };
            
            // Solo permitir dígitos
            if (!/^\d$/.test(e.key)) {
                e.preventDefault();
            };
            
            // Limitar longitud máxima (10 caracteres: dd/mm/aaaa)
            if (e.target.value.replace(/\D/g, '').length >= 8) {
                e.preventDefault();
            };
        });

        // Validación en blur (cuando pierde el foco)
        dateInput.addEventListener('blur', () => {
            const value = dateInput.value.trim();
            
            // Campo vacío
            if (!value) {
                dateInput.setCustomValidity('Fecha requerida');
                dateError.textContent = 'Fecha requerida';
                dateError.classList.remove('hidden');
                return;
            };
            
            // Validar formato
            const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
            
            if (!regex.test(value)) {
                dateInput.setCustomValidity('Formato inválido. Use dd/mm/aaaa');
                dateError.textContent = 'Formato inválido. Use dd/mm/aaaa';
                dateError.classList.remove('hidden');
                return;
            };
            
            // Extraer componentes
            const [, diaStr, mesStr, anioStr] = value.match(regex);
            const dia = Number(diaStr);
            const mes = Number(mesStr);
            const anio = Number(anioStr);
            
            // Validar fecha completa (incluye años bisiestos)
            const resultado = validarFecha(dia, mes, anio);
            
            if (!resultado.valido) {
                dateInput.setCustomValidity(resultado.mensaje);
                dateError.textContent = resultado.mensaje;
                dateError.classList.remove('hidden');
            } else {
                dateInput.setCustomValidity('');
                dateError.classList.add('hidden');
            };
        });
        
        // Validación en tiempo real
        dateInput.addEventListener('input', (e) => {
            const value = e.target.value.trim();
            const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
            
            if (regex.test(value) && value.length === 10) {
                const [, diaStr, mesStr, anioStr] = value.match(regex);
                const dia = Number(diaStr);
                const mes = Number(mesStr);
                const anio = Number(anioStr);
                
                const resultado = validarFecha(dia, mes, anio);
                
                if (!resultado.valido) {
                    dateError.textContent = resultado.mensaje;
                    dateError.classList.remove('hidden');
                } else {
                    dateError.classList.add('hidden');
                };
            };
        });
    }

    // Convertir HTMLCollection a Array para usar forEach
    Array.from(dateInputs).forEach((dateInput, index) => {
        // Asignar el error correspondiente por índice (o el último si no hay suficientes)
        const dateError = dateErrors[index] || dateErrors[dateErrors.length - 1];
        asignarEventos(dateInput, dateError);
    });


    // Prevenir envío si hay error
    /* document.querySelector('form').addEventListener('submit', (e) => {
        const value = dateInput.value.trim();
        const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
        
        if (regex.test(value)) {
            const [, diaStr, mesStr, anioStr] = value.match(regex);
            const dia = Number(diaStr);
            const mes = Number(mesStr);
            const anio = Number(anioStr);
            
            const resultado = validarFecha(dia, mes, anio);
            
            if (!resultado.valido) {
                e.preventDefault();
                dateInput.setCustomValidity(resultado.mensaje);
                dateError.textContent = resultado.mensaje;
                dateError.classList.remove('hidden');
                dateInput.focus();
            };
        };
    }); */
};

export default handleDate;