/**
 * Funciones para la migración de datos desde CSV a las tablas del sistema.
 */

/**
 * Función principal para ejecutar la migración.
 * Recibe los contenidos de los CSV como strings.
 */
function ejecutarMigracion(csvContrato, csvRegistros) {
  try {
    if (csvContrato) importarCatalogo(csvContrato);
    if (csvRegistros) {
      importarProcedimientos(csvRegistros);
      importarConsumos(csvRegistros);
    }
    SpreadsheetApp.getUi().alert('Migración completada con éxito.');
  } catch (e) {
    Logger.log('Error en migración: ' + e.toString());
    throw e;
  }
}

/**
 * Importa los datos del Contrato al Catálogo.
 */
function importarCatalogo(csvData) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Catalogo');
  const data = Utilities.parseCsv(csvData);
  
  // Mapeo basado en el archivo: Codigo, Descripcion del Articulo, Cantidad Maxima, Precio Unitario...
  // Destino: ID_Codigo, Descripcion, Precio_Unitario, Cantidad_Original, Ampliacion_Art80, Ajuste_Reasignacion, Tope_Actualizado, Consumido_Total, Disponible_Real, Proveedor
  
  const rows = data.slice(1).map(row => {
    const idCodigo = row[0];
    const descripcion = row[1];
    const cantidadOriginal = Number(row[2]) || 0;
    const precioUnitario = Number(row[3]) || 0;
    
    return [
      idCodigo,      // ID_Codigo
      descripcion,   // Descripcion
      precioUnitario, // Precio_Unitario
      cantidadOriginal, // Cantidad_Original
      0,             // Ampliacion_Art80
      0,             // Ajuste_Reasignacion
      cantidadOriginal, // Tope_Actualizado (Inicialmente igual a original)
      0,             // Consumido_Total (Se actualizará)
      cantidadOriginal, // Disponible_Real
      'WELLNES CENTER BIOTECHNOLOGY S.A DE C.V' // Proveedor (Default detectado)
    ];
  });

  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
  }
}

/**
 * Importa registros de Procedimientos (basado en folios únicos de Registros.csv).
 */
function importarProcedimientos(csvData) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Procedimientos');
  const data = Utilities.parseCsv(csvData);
  
  // CSV: Conciliacion, Numero Registro, Folio QX, Registro Hospitalario, Nombre Paciente, Cantidad, Codigo, Descripcion, Proveedor, Fecha, RUD Medico, Nombre Medico
  // Destino: ID_Folio_QX, Registro_Hospitalario, Nombre_Paciente, Fecha_QX, Medico_Tratante, Estatus_Administrativo, Firma_Digital
  
  const foliosProcesados = new Set();
  const rows = [];

  data.slice(1).forEach(row => {
    const folio = row[2];
    if (folio && !foliosProcesados.has(folio)) {
      foliosProcesados.add(folio);
      rows.push([
        folio,          // ID_Folio_QX
        row[3],         // Registro_Hospitalario
        row[4],         // Nombre_Paciente
        row[9],         // Fecha_QX
        row[11],        // Medico_Tratante
        'Validado',    // Estatus_Administrativo (Default para carga inicial)
        ''              // Firma_Digital
      ]);
    }
  });

  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
  }
}

/**
 * Importa el detalle de consumos.
 */
function importarConsumos(csvData) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Consumos');
  const data = Utilities.parseCsv(csvData);
  
  // CSV Index: 1:Numero Registro, 2:Folio QX, 6:Codigo, 5:Cantidad, 0:Conciliacion
  // Destino: ID_Registro, Ref_Folio_QX, Ref_Codigo, Cantidad, Num_Conciliacion
  
  const rows = data.slice(1).map(row => {
    return [
      row[1], // ID_Registro (Numero Registro)
      row[2], // Ref_Folio_QX (Folio QX)
      row[6], // Ref_Codigo (Codigo)
      Number(row[5]) || 0, // Cantidad
      row[0]  // Num_Conciliacion (Conciliacion)
    ];
  });

  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, rows[0].length).setValues(rows);
  }
}
