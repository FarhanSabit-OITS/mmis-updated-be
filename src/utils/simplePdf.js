function normalizePdfText(value = '') {
  return String(value)
    .replace(/[^\x20-\x7E]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function escapePdfText(value = '') {
  return normalizePdfText(value)
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

function buildTextStream(lines) {
  const commands = ['BT', '/F1 11 Tf', '40 790 Td'];
  lines.forEach((line, index) => {
    if (index > 0) commands.push('0 -16 Td');
    commands.push(`(${escapePdfText(line)}) Tj`);
  });
  commands.push('ET');
  return commands.join('\n');
}

function createSimplePdf(lines) {
  const objects = [];
  const addObject = (body) => {
    objects.push(body);
    return objects.length;
  };

  const contentStream = buildTextStream(lines);
  const contentBuffer = Buffer.from(contentStream, 'ascii');

  const fontId = addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
  const contentId = addObject(`<< /Length ${contentBuffer.length} >>\nstream\n${contentStream}\nendstream`);
  const pagesId = addObject('<< /Type /Pages /Kids [4 0 R] /Count 1 >>');
  const pageId = addObject(`<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 ${fontId} 0 R >> >> /Contents ${contentId} 0 R >>`);
  const catalogId = addObject(`<< /Type /Catalog /Pages ${pagesId} 0 R >>`);

  let pdf = '%PDF-1.4\n%\xE2\xE3\xCF\xD3\n';
  const offsets = [0];

  objects.forEach((body, index) => {
    offsets.push(Buffer.byteLength(pdf, 'ascii'));
    pdf += `${index + 1} 0 obj\n${body}\nendobj\n`;
  });

  const xrefPosition = Buffer.byteLength(pdf, 'ascii');
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xrefPosition}\n%%EOF`;

  return Buffer.from(pdf, 'ascii');
}

module.exports = {
  createSimplePdf,
};
