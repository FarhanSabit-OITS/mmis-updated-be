function normalizePdfText(value = '') {
  return String(value)
    .replace(/[\r\n\t]+/g, ' ')
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

function wrapLine(line, maxChars = 88) {
  const text = normalizePdfText(line);
  if (!text) return [''];
  if (text.length <= maxChars) return [text];

  const parts = [];
  let remaining = text;

  while (remaining.length > maxChars) {
    let splitAt = remaining.lastIndexOf(' ', maxChars);
    if (splitAt < 1) splitAt = maxChars;
    parts.push(remaining.slice(0, splitAt).trim());
    remaining = remaining.slice(splitAt).trim();
  }

  if (remaining) parts.push(remaining);
  return parts;
}

function paginateLines(lines, pageLineLimit = 44) {
  const wrappedLines = lines.flatMap((line) => wrapLine(line));
  const pages = [];

  for (let index = 0; index < wrappedLines.length; index += pageLineLimit) {
    pages.push(wrappedLines.slice(index, index + pageLineLimit));
  }

  return pages.length ? pages : [['']];
}

function buildPageStream(lines) {
  const commands = ['BT', '/F1 11 Tf'];
  let y = 790;

  lines.forEach((line) => {
    commands.push(`1 0 0 1 40 ${y} Tm`);
    commands.push(`(${escapePdfText(line)}) Tj`);
    y -= 16;
  });

  commands.push('ET');
  return commands.join('\n');
}

function createPdfObject(id, body) {
  return `${id} 0 obj\n${body}\nendobj\n`;
}

function createSimplePdf(lines) {
  const pages = paginateLines(lines);
  const objects = [];
  const fontObjectId = 1;
  let nextObjectId = 2;

  objects.push(createPdfObject(fontObjectId, '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>'));

  const contentObjectIds = [];
  const pageObjectIds = [];

  pages.forEach((pageLines) => {
    const stream = buildPageStream(pageLines);
    const streamBuffer = Buffer.from(stream, 'latin1');
    const contentObjectId = nextObjectId++;
    const pageObjectId = nextObjectId++;

    contentObjectIds.push(contentObjectId);
    pageObjectIds.push(pageObjectId);

    objects.push(
      createPdfObject(
        contentObjectId,
        `<< /Length ${streamBuffer.length} >>\nstream\n${stream}\nendstream`
      )
    );
  });

  const pagesObjectId = nextObjectId++;
  const catalogObjectId = nextObjectId++;

  pageObjectIds.forEach((pageObjectId, index) => {
    objects.push(
      createPdfObject(
        pageObjectId,
        `<< /Type /Page /Parent ${pagesObjectId} 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 ${fontObjectId} 0 R >> >> /Contents ${contentObjectIds[index]} 0 R >>`
      )
    );
  });

  objects.push(
    createPdfObject(
      pagesObjectId,
      `<< /Type /Pages /Kids [${pageObjectIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pageObjectIds.length} >>`
    )
  );

  objects.push(createPdfObject(catalogObjectId, `<< /Type /Catalog /Pages ${pagesObjectId} 0 R >>`));

  let pdf = '%PDF-1.4\n';
  const offsets = [0];

  objects.forEach((objectText) => {
    offsets.push(Buffer.byteLength(pdf, 'latin1'));
    pdf += objectText;
  });

  const xrefOffset = Buffer.byteLength(pdf, 'latin1');
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogObjectId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return Buffer.from(pdf, 'latin1');
}

module.exports = {
  createSimplePdf,
};
