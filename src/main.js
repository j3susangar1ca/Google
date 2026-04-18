/**
 * Trigger que se ejecuta cada vez que se edita una celda en la hoja de cálculo.
 * @param {Object} e Objeto de evento de Google Apps Script.
 */
function onEdit(e) {
  const range = e.range;
  const sheet = range.getSheet();
  const sheetName = sheet.getName();

  // Solo actuar si el cambio ocurre en la hoja 'Movimientos'
  if (sheetName === 'Movimientos') {
    validarMovimiento(range);
  }
}
