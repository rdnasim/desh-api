/**
 * Minimal .xlsx reader: the first worksheet as rows of cell values. Enough for government price
 * lists published as spreadsheets; no styles, dates are left as serial numbers.
 */
export type Cell = string | number | null;

const view = (b: Uint8Array) => new DataView(b.buffer, b.byteOffset, b.byteLength);

async function inflateRaw(data: Uint8Array): Promise<Uint8Array> {
  const stream = new Blob([data]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

/** Files in a zip archive, by name. */
async function unzip(bytes: Uint8Array): Promise<Map<string, Uint8Array>> {
  const v = view(bytes);
  let eocd = bytes.length - 22;
  while (eocd >= 0 && v.getUint32(eocd, true) !== 0x06054b50) eocd--;
  if (eocd < 0) throw new Error('xlsx: not a zip file');
  const count = v.getUint16(eocd + 10, true);
  let p = v.getUint32(eocd + 16, true);
  const files = new Map<string, Uint8Array>();
  const decoder = new TextDecoder();
  for (let i = 0; i < count; i++) {
    if (v.getUint32(p, true) !== 0x02014b50) throw new Error('xlsx: bad central directory');
    const method = v.getUint16(p + 10, true);
    const size = v.getUint32(p + 20, true);
    const nameLen = v.getUint16(p + 28, true);
    const extraLen = v.getUint16(p + 30, true);
    const commentLen = v.getUint16(p + 32, true);
    const local = v.getUint32(p + 42, true);
    const name = decoder.decode(bytes.subarray(p + 46, p + 46 + nameLen));
    const start = local + 30 + v.getUint16(local + 26, true) + v.getUint16(local + 28, true);
    const data = bytes.subarray(start, start + size);
    if (method === 0) files.set(name, data);
    else if (method === 8) files.set(name, await inflateRaw(data));
    p += 46 + nameLen + extraLen + commentLen;
  }
  return files;
}

const unescapeXml = (s: string) =>
  s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(Number.parseInt(h, 16)))
    .replace(/&amp;/g, '&');

/** Text of every <t> in a fragment, ignoring phonetic runs. */
const texts = (xml: string) =>
  [...xml.replace(/<rPh[\s\S]*?<\/rPh>/g, '').matchAll(/<t(?:\s[^>]*)?>([\s\S]*?)<\/t>/g)]
    .map((m) => unescapeXml(m[1] as string))
    .join('');

const column = (ref: string) =>
  [...(/^[A-Z]+/.exec(ref)?.[0] ?? 'A')].reduce((n, ch) => n * 26 + ch.charCodeAt(0) - 64, 0) - 1;

export async function readXlsx(bytes: Uint8Array): Promise<Cell[][]> {
  const files = await unzip(bytes);
  const decoder = new TextDecoder();
  const xml = (name: string) => {
    const f = files.get(name);
    return f ? decoder.decode(f) : undefined;
  };
  const shared = [...(xml('xl/sharedStrings.xml') ?? '').matchAll(/<si>([\s\S]*?)<\/si>/g)].map(
    (m) => texts(m[1] as string),
  );
  const sheetName =
    [...files.keys()].filter((n) => /^xl\/worksheets\/sheet\d+\.xml$/.test(n)).sort()[0] ?? '';
  const sheet = xml(sheetName);
  if (!sheet) throw new Error('xlsx: no worksheet');

  const rows: Cell[][] = [];
  for (const row of sheet.matchAll(/<row\b[^>]*\br="(\d+)"[^>]*>([\s\S]*?)<\/row>/g)) {
    const cells: Cell[] = [];
    for (const c of (row[2] as string).matchAll(/<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g)) {
      const attrs = c[1] as string;
      const body = c[2] ?? '';
      const ref = /\br="([A-Z]+\d+)"/.exec(attrs)?.[1] ?? '';
      const type = /\bt="(\w+)"/.exec(attrs)?.[1];
      const raw = /<v>([\s\S]*?)<\/v>/.exec(body)?.[1];
      let value: Cell = null;
      if (type === 's' && raw !== undefined) value = shared[Number(raw)] ?? null;
      else if (type === 'inlineStr') value = texts(body);
      else if ((type === 'str' || type === 'e') && raw !== undefined) value = unescapeXml(raw);
      else if (raw !== undefined && raw !== '') value = Number(raw);
      cells[column(ref)] = value;
    }
    rows[Number(row[1]) - 1] = Array.from(cells, (x) => x ?? null);
  }
  return Array.from(rows, (r) => r ?? []);
}
