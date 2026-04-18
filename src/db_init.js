/**
 * Configura las tablas necesarias en la hoja de cálculo según el esquema definido.
 * Crea las pestañas 'Catalogo', 'Procedimientos', 'Consumos' y 'Movimientos' si no existen.
 */
function configurarTablas() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const tablas = {
    'Catalogo': [
      'ID_Codigo', 'Descripcion', 'Precio_Unitario', 'Cantidad_Original', 
      'Ampliacion_Art80', 'Ajuste_Reasignacion', 'Tope_Actualizado', 
      'Consumido_Total', 'Disponible_Real', 'Proveedor'
    ],
    'Procedimientos': [
      'ID_Folio_QX', 'Registro_Hospitalario', 'Nombre_Paciente', 
      'Fecha_QX', 'Medico_Tratante', 'Estatus_Administrativo', 'Firma_Digital'
    ],
    'Consumos': [
      'ID_Registro', 'Ref_Folio_QX', 'Ref_Codigo', 'Cantidad', 'Num_Conciliacion'
    ],
    'Movimientos': [
      'ID_Movimiento', 'Tipo', 'Codigo_Origen', 'Codigo_Destino', 
      'Cantidad_Movida', 'Justificacion'
    ]
  };

  try {
    Object.keys(tablas).forEach(nombreTabla => {
      let sheet = ss.getSheetByName(nombreTabla);
      if (!sheet) {
        sheet = ss.insertSheet(nombreTabla);
        Logger.log(`Hoja creada: ${nombreTabla}`);
      } else {
        Logger.log(`Hoja ya existente: ${nombreTabla}. Se actualizarán encabezados.`);
      }

      // Configurar encabezados
      const encabezados = tablas[nombreTabla];
      sheet.getRange(1, 1, 1, encabezados.length).setValues([encabezados])
           .setBackground('#4a86e8')
           .setFontColor('white')
           .setFontWeight('bold');
      
      // Congelar primera fila
      sheet.setFrozenRows(1);
    });
    
    SpreadsheetApp.getUi().alert('Configuración de tablas completada con éxito.');
  } catch (e) {
    Logger.log('Error en configurarTablas: ' + e.toString());
    throw new Error('No se pudo completar la configuración de tablas: ' + e.message);
  }
}
