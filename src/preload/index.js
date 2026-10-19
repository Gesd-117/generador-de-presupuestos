import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('presupuestoAPI', {
  generarPDF: (datos) => ipcRenderer.invoke(
    'pdf:generar-presupuesto',
    datos,
  ),
});