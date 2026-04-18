/**
 * Lógica de negocio para el control presupuestal (Art. 80 y Reasignaciones).
 */

/**
 * Valida si una ampliación cumple con el Art. 80 (Máximo 20% de la cantidad original).
 * @param {string} codigo ID del código en el catálogo.
 * @param {number} cantidadNueva Cantidad adicional solicitada.
 * @return {boolean}
 */
function validarAmpliacionArt80(codigo, cantidadNueva) {
  try {
    const datos = getDatosCatalogo(codigo);
    if (!datos) throw new Error('Código no encontrado en catálogo.');

    const limite = datos.Cantidad_Original * 0.20;
    const totalAmpliacionPosible = datos.Ampliacion_Art80 + cantidadNueva;

    if (totalAmpliacionPosible > limite) {
      Logger.log(`Validación Art 80 Fallida: ${totalAmpliacionPosible} excede el límite de ${limite}`);
      return false;
    }
    return true;
  } catch (e) {
    Logger.log('Error en validarAmpliacionArt80: ' + e.toString());
    return false;
  }
}

/**
 * Permite reasignar saldo entre dos claves si pertenecen al mismo proveedor.
 * @param {string} codigoOrigen Código que cede presupuesto.
 * @param {string} codigoDestino Código que recibe presupuesto.
 * @param {number} unidades Unidades a transferir.
 * @return {boolean}
 */
function reasignarPresupuesto(codigoOrigen, codigoDestino, unidades) {
  try {
    const origen = getDatosCatalogo(codigoOrigen);
    const destino = getDatosCatalogo(codigoDestino);

    if (!origen || !destino) throw new Error('Uno o ambos códigos no existen.');
    if (origen.Proveedor !== destino.Proveedor) {
      throw new Error('Solo se permiten reasignaciones entre claves del mismo proveedor.');
    }
    if (origen.Disponible_Real < unidades) {
      throw new Error('Saldo insuficiente en código origen.');
    }

    // Aquí iría la lógica para actualizar la hoja y crear el registro en 'Movimientos'
    // Por ahora solo validamos.
    return true;
  } catch (e) {
    Logger.log('Error en reasignarPresupuesto: ' + e.toString());
    throw e;
  }
}

/**
 * Obtiene los datos de una fila del catálogo por su ID_Codigo.
 * @param {string} codigo
 * @return {Object|null}
 */
function getDatosCatalogo(codigo) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Catalogo');
  const values = sheet.getDataRange().getValues();
  const headers = values[0];
  
  const colCodigo = headers.indexOf('ID_Codigo');
  
  for (let i = 1; i < values.length; i++) {
    if (values[i][colCodigo].toString() === codigo.toString()) {
      const rowData = {};
      headers.forEach((header, index) => {
        rowData[header] = values[i][index];
      });
      return rowData;
    }
  }
  return null;
}

/**
 * Recalcula el 'Tope_Actualizado' dinámicamente para una fila.
 * Formula: Original + Ampliacion + Ajuste
 */
function actualizarTope(codigo) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Catalogo');
  const values = sheet.getDataRange().getValues();
  const headers = values[0];
  
  const colIndex = {
    codigo: headers.indexOf('ID_Codigo'),
    original: headers.indexOf('Cantidad_Original'),
    ampliacion: headers.indexOf('Ampliacion_Art80'),
    ajuste: headers.indexOf('Ajuste_Reasignacion'),
    tope: headers.indexOf('Tope_Actualizado')
  };

  for (let i = 1; i < values.length; i++) {
    if (values[i][colIndex.codigo].toString() === codigo.toString()) {
      const nuevoTope = Number(values[i][colIndex.original]) + 
                        Number(values[i][colIndex.ampliacion]) + 
                        Number(values[i][colIndex.ajuste]);
      
      sheet.getRange(i + 1, colIndex.tope + 1).setValue(nuevoTope);
      return nuevoTope;
    }
  }
}

/**
 * Valida un movimiento detectado por el trigger onEdit.
 * @param {GoogleAppsScript.Spreadsheet.Range} range El rango editado.
 */
function validarMovimiento(range) {
  const sheet = range.getSheet();
  const row = range.getRow();
  
  // No validar el encabezado
  if (row === 1) return;

  const rowData = sheet.getRange(row, 1, 1, sheet.getLastColumn()).getValues()[0];
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  const colIndex = {
    tipo: headers.indexOf('Tipo'),
    codigoOrigen: headers.indexOf('Codigo_Origen'),
    codigoDestino: headers.indexOf('Codigo_Destino'),
    cantidad: headers.indexOf('Cantidad_Movida')
  };

  const tipo = rowData[colIndex.tipo];
  const codOrigen = rowData[colIndex.codigoOrigen];
  const codDestino = rowData[colIndex.codigoDestino];
  const cantidad = rowData[colIndex.cantidad];

  try {
    if (tipo === 'Ampliación 20%') {
      const esValido = validarAmpliacionArt80(codDestino, cantidad);
      if (!esValido) {
        SpreadsheetApp.getUi().alert('⚠️ Error de Validación: La ampliación excede el 20% permitido por el Art. 80.');
      }
    } else if (tipo === 'Reasignación') {
      reasignarPresupuesto(codOrigen, codDestino, cantidad);
    }
  } catch (e) {
    SpreadsheetApp.getUi().alert('❌ Error en el movimiento: ' + e.message);
  }
}

