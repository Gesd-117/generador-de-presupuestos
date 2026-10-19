import '../assets/main.css';
import handleDate from "./handle-date";
import handleModal from "./handle-modal";

const IVA_PORCENTAJE = 0.16;

const main = () => {
    //console.log('renderer.js funcionando ok.');

    handleDate();
    handleModal();
    
    configurarFormularioEmpresa();
    configurarFormularioPresupuesto();

    let planes = obtenerPlanes();
    planes = Object.keys(planes);
    //console.log(planes);
    renderPlanes(planes);
};

const configurarFormularioEmpresa = () => {
    const formEmpresa = document.getElementById('form-empresa');

    formEmpresa.addEventListener('submit', (event) => {
        event.preventDefault();

        const datosForm = new FormData(formEmpresa);

        const empresa = {
            empresa: datosForm.get('empresa').trim(),
            web: datosForm.get('web').trim(),
            email: datosForm.get('email').trim()
        };

        localStorage.setItem('datos-empresa', JSON.stringify(empresa))
        alert('Datos de la empresa guardados correctamente.');
    });
};

const configurarFormularioPresupuesto = () => {
  const formPresupuesto = document.getElementById('form-presupuesto');

  formPresupuesto.addEventListener('submit', async (event) => {
    event.preventDefault();

    try {
      const datos = obtenerDatosPresupuesto();

      const resultado = await window.presupuestoAPI.generarPDF(datos);

      if (resultado.cancelado) {
        return;
      }

      if (resultado.ok) {
        alert(`PDF generado correctamente.\n\nGuardado en:\n${resultado.ruta}`);
      }
    } catch (error) {
      console.error('Error creando el PDF:', error);

      alert(`No se pudo generar el PDF.\n\n${error.message}`);
    }
  });
};

const obtenerDatosPresupuesto = () => {
  const datosEmpresaGuardados = localStorage.getItem('datos-empresa');

  if (!datosEmpresaGuardados) {
    throw new Error(
      'Primero debes configurar y guardar los datos de tu empresa.',
    );
  }

  const datosEmpresa = JSON.parse(datosEmpresaGuardados);
  const formPresupuesto = document.getElementById('form-presupuesto');
  const datosForm = new FormData(formPresupuesto);

  const planes = obtenerPlanes();

  const indicePlan = Number(datosForm.get('plan'));
  const planSeleccionado = Object.keys(planes)[indicePlan];

  if (!planSeleccionado || !planes[planSeleccionado]) {
    throw new Error('Debes seleccionar un plan.');
  }

  const [servicio, precioBase] = planes[planSeleccionado];

  const precio = Number(precioBase);
  const iva = precio * IVA_PORCENTAJE;
  const total = precio + iva;

  return {
    titulo: 'Presupuesto',
    numero: crearNumeroPresupuesto(),
    nombre: datosEmpresa.empresa,
    web: datosEmpresa.web,
    email: datosEmpresa.email,
    fecha: String(datosForm.get('fecha') || '').trim(),
    empresa: String(datosForm.get('empresa') || '').trim(),
    cliente: String(datosForm.get('cliente') || '').trim(),
    plan: letraCapital(planSeleccionado),
    servicio,
    precio: formatearMoneda(precio),
    iva: formatearMoneda(iva),
    total: formatearMoneda(total),
    limite: String(datosForm.get('limite') || '').trim(),
    mensaje: String(datosForm.get('mensaje') || '').trim(),
  };
};

const formatearMoneda = (monto) => {
  return new Intl.NumberFormat('es-VE', {
    style: 'currency',
    currency: 'VES',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(monto);
};

const crearFechaPresupuesto = () => {
  const fecha = new Date();

  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  const hora = String(fecha.getHours()).padStart(2, '0');
  const minuto = String(fecha.getMinutes()).padStart(2, '0');
  const segundo = String(fecha.getSeconds()).padStart(2, '0');

  return `${anio}${mes}${dia}-${hora}${minuto}${segundo}`;
};

const crearNumeroPresupuesto = () => {
  const clave = 'ultimo-numero-presupuesto';

  const ultimoNumero = Number(localStorage.getItem(clave) ?? 0);

  const siguienteNumero = ultimoNumero + 1;

  localStorage.setItem(clave, String(siguienteNumero));

  return String(siguienteNumero).padStart(10, '0');
};

const obtenerPlanes = () => {
    return {
        corporativo: ['desarrollo de aplicación web', 2000],
        personal: ['desarrollo de sitio web', 800],
        mantenimiento: ['mantenimiento web', 100]
    };
};

const renderPlanes = (planes = []) => {
    console.log(`renderPlanes: ${planes}`);
    const planSelect = document.getElementById('planes-select');
    planSelect.innerHTML = '<option value="" class="hidden"></option>' +
        planes.map((plan, index) => `<option value="${index}">${letraCapital(plan)}</option>`).join('');
};

const letraCapital = (texto = '') => {
    return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
};

document.addEventListener('DOMContentLoaded', main);
