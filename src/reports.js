/**
 * Genera un reporte PDF oficial de Hemodinamia basado en un folio de quirófano.
 * @param {string} idFolioQX El folio del procedimiento.
 * @return {string} La URL del archivo PDF generado.
 */
function generarPDF(idFolioQX) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // 1. Obtener datos del procedimiento
    const procSheet = ss.getSheetByName('Procedimientos');
    const procData = getRowByValue(procSheet, 'ID_Folio_QX', idFolioQX);
    
    if (!procData) throw new Error('No se encontró el Folio QX: ' + idFolioQX);

    // 2. Obtener consumos relacionados
    const consumosSheet = ss.getSheetByName('Consumos_Detalle');
    const consumos = getRowsByValue(consumosSheet, 'Ref_Folio_QX', idFolioQX);

    // 3. Crear el contenido HTML del reporte
    const htmlContent = createHemodinamiaHtml(procData, consumos);

    // 4. Generar el PDF
    const blob = HtmlService.createHtmlOutput(htmlContent)
      .getAs('application/pdf')
      .setName(`Reporte_Hemodinamia_${idFolioQX}.pdf`);

    // 5. Guardar en Drive
    const folderName = 'Reportes_Hemodinamia';
    let folder;
    const folders = DriveApp.getFoldersByName(folderName);
    if (folders.hasNext()) {
      folder = folders.next();
    } else {
      folder = DriveApp.createFolder(folderName);
    }

    const file = folder.createFile(blob);
    return file.getUrl();

  } catch (e) {
    Logger.log('Error en generarPDF: ' + e.toString());
    throw e;
  }
}

/**
 * Crea el diseño HTML para el reporte médico.
 */
function createHemodinamiaHtml(proc, consumos) {
  let tableRows = '';
  consumos.forEach(item => {
    tableRows += `
      <tr>
        <td>${item.Ref_Codigo}</td>
        <td>${item.Cantidad}</td>
        <td>Conciliación: ${item.Num_Conciliacion || 'N/A'}</td>
      </tr>`;
  });

  return `
    <html>
      <head>
        <style>
          body { font-family: 'Helvetica', sans-serif; color: #333; padding: 20px; }
          .header { border-bottom: 2px solid #004687; padding-bottom: 10px; margin-bottom: 20px; text-align: center; }
          .patient-info { margin-bottom: 30px; background: #f9f9f9; padding: 15px; border-radius: 8px; }
          .table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          .table th, .table td { border: 1px solid #ddd; padding: 10px; text-align: left; }
          .table th { background-color: #004687; color: white; }
          .signature-box { margin-top: 50px; text-align: center; }
          .signature-img { max-width: 200px; border-bottom: 1px solid #000; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Reporte Oficial de Hemodinamia</h1>
          <p>Unidad de Especialidades Médicas</p>
        </div>
        
        <div class="patient-info">
          <h3>Información del Paciente</h3>
          <p><strong>Folio QX:</strong> ${proc.ID_Folio_QX}</p>
          <p><strong>Paciente:</strong> ${proc.Nombre_Pacient}</p>
          <p><strong>Registro:</strong> ${proc.Registro_Hospitalario}</p>
          <p><strong>Fecha:</strong> ${proc.Fecha_QX}</p>
          <p><strong>Médico:</strong> ${proc.Medico_Tratante}</p>
        </div>

        <h3>Detalle de Consumos de Material</h3>
        <table class="table">
          <thead>
            <tr>
              <th>Código Material</th>
              <th>Cantidad</th>
              <th>Referencia</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>

        <div class="signature-box">
          <p><strong>Validación Médica</strong></p>
          <img class="signature-img" src="${proc.Firma_Digital || ''}" alt="Firma Digital">
          <p>${proc.Medico_Tratante}</p>
        </div>
      </body>
    </html>
  `;
}

/**
 * Funciones auxiliares para búsqueda de datos
 */
function getRowByValue(sheet, columnName, value) {
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const colIndex = headers.indexOf(columnName);
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][colIndex].toString() === value.toString()) {
      const obj = {};
      headers.forEach((h, idx) => obj[h] = data[i][idx]);
      return obj;
    }
  }
  return null;
}

function getRowsByValue(sheet, columnName, value) {
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const colIndex = headers.indexOf(columnName);
  const results = [];
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][colIndex].toString() === value.toString()) {
      const obj = {};
      headers.forEach((h, idx) => obj[h] = data[i][idx]);
      results.push(obj);
    }
  }
  return results;
}
