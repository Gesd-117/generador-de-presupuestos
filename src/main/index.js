import { BrowserWindow, app, ipcMain, dialog, Menu } from "electron";
import { join } from "node:path";
import { readFile, writeFile } from "node:fs/promises";
import { is } from "@electron-toolkit/utils";
//import iconpath from "../../resources/icons/icon.svg?asset";

const createWindow = () => {
  const mainWin = new BrowserWindow({
    width: 1024,
    height: 768,
    show: false,
    //icon: iconpath,
    webPreferences: {
      nodeIntegration: false,
      preload: join(__dirname, '..', 'preload', 'index.js'),
    }
  });

  mainWin.on('ready-to-show', () => {
    mainWin.show();
  });

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWin.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    mainWin.loadFile(join(__dirname, '..', 'renderer', 'index.html'));
  }
};

const escaparHtml = (valor = '') => {
  return String(valor)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

const limpiarNombreArchivo = (nombre = 'presupuesto') => {
  return String(nombre)
    .trim()
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '_')
    .replace(/\s+/g, '_')
    .slice(0, 80);
}

const reemplazarPlantilla = (html, datos) => {
  const valores = {
    titulo: escaparHtml(datos.titulo || 'Presupuesto'),
    numero: escaparHtml(datos.numero || '0000000001'),
    nombre: escaparHtml(datos.nombre || ''),
    web: escaparHtml(datos.web || ''),
    email: escaparHtml(datos.email || ''),
    fecha: escaparHtml(datos.fecha || ''),
    empresa: escaparHtml(datos.empresa || ''),
    cliente: escaparHtml(datos.cliente || ''),
    plan: escaparHtml(datos.plan || ''),
    servicio: escaparHtml(datos.servicio || ''),
    precio: escaparHtml(datos.precio || ''),
    iva: escaparHtml(datos.iva || ''),
    total: escaparHtml(datos.total || ''),
    limite: escaparHtml(datos.limite || ''),
  };

    return Object.entries(valores).reduce(
    (resultado, [clave, valor]) => {
      return resultado.replaceAll(`{{${clave}}}`, valor);
    },
    html,
  );
}

ipcMain.handle('pdf:generar-presupuesto', async (event, datos) => {
  const ventanaOrigen = BrowserWindow.fromWebContents(event.sender);

  if (!datos || typeof datos !== 'object') {
    throw new Error('Los datos del presupuesto no son válidos.');
  }

  const nombreCliente = limpiarNombreArchivo(datos.cliente || 'cliente');
  const numero = limpiarNombreArchivo(datos.numero || '0001');

  const { canceled, filePath } = await dialog.showSaveDialog(ventanaOrigen, {
    title: 'Guardar presupuesto en PDF',
    defaultPath: `presupuesto-${numero}-${nombreCliente}.pdf`,
    filters: [
      {
        name: 'Documento PDF',
        extensions: ['pdf'],
      },
    ],
  });

  if (canceled || !filePath) {
    return {
      ok: false,
      cancelado: true,
    };
  }

  let ventanaPdf;

  try {
    const rutaPlantilla = app.isPackaged
    ? join(__dirname,'..', 'renderer','presupuesto-template.html')
    : join(__dirname,'..', '..','src','renderer','src','pdf','presupuesto-template.html');

    const plantilla = await readFile(rutaPlantilla, 'utf-8');
    const htmlFinal = reemplazarPlantilla(plantilla, datos);

    ventanaPdf = new BrowserWindow({
      show: false,
      width: 794,
      height: 1123,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
      },
    });

    const dataUrl = `data:text/html;charset=utf-8,${encodeURIComponent(
      htmlFinal,
    )}`;

    await ventanaPdf.loadURL(dataUrl);

    await ventanaPdf.webContents.executeJavaScript(
      'document.fonts ? document.fonts.ready : Promise.resolve()',
    );

    const pdfBuffer = await ventanaPdf.webContents.printToPDF({
      pageSize: 'A4',
      printBackground: true,
      landscape: false,
      margins: {
        top: 0.4,
        bottom: 0.4,
        left: 0.4,
        right: 0.4,
      },
    });

    await writeFile(filePath, pdfBuffer);

    return {
      ok: true,
      ruta: filePath,
    };
  } catch (error) {
    console.error('Error al generar el PDF:', error);

    throw new Error(
      `No se pudo generar el presupuesto en PDF: ${error.message}`,
    );
  } finally {
    if (ventanaPdf && !ventanaPdf.isDestroyed()) {
      ventanaPdf.destroy();
    }
  }
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});