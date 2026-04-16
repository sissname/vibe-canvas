import { ProjectFile } from '@/stores/file-store';
import { GeneratedProject } from '@/types/generation';

interface ZipEntry {
  path: string;
  content: string;
}

interface EncodedEntry {
  crc: number;
  data: Uint8Array;
  name: Uint8Array;
  path: string;
}

const textEncoder = new TextEncoder();
const crcTable = createCrcTable();

export function createProjectZip(project: GeneratedProject, files: ProjectFile[]): Blob {
  const entries = createProjectEntries(project, files).map(encodeEntry);
  const localParts: Uint8Array[] = [];
  const centralParts: Uint8Array[] = [];
  let offset = 0;

  for (const entry of entries) {
    const localHeader = createLocalHeader(entry);
    localParts.push(localHeader, entry.name, entry.data);
    centralParts.push(createCentralDirectoryHeader(entry, offset), entry.name);
    offset += localHeader.length + entry.name.length + entry.data.length;
  }

  const centralSize = sumLengths(centralParts);
  const centralOffset = offset;
  const endRecord = createEndRecord(entries.length, centralSize, centralOffset);

  return new Blob(
    toBlobParts([...localParts, ...centralParts, endRecord]),
    { type: 'application/zip' }
  );
}

function createProjectEntries(project: GeneratedProject, files: ProjectFile[]): ZipEntry[] {
  const normalizedFiles = files.map((file) => ({
    path: normalizeZipPath(file.path || file.name),
    content: file.content,
  }));
  const manifest = {
    exportedAt: new Date().toISOString(),
    project: {
      id: project.id,
      prompt: project.prompt,
      title: project.title,
      tagline: project.tagline,
      description: project.description,
      createdAt: project.createdAt,
    },
    files: normalizedFiles.map((file) => file.path),
  };
  const readme = `# ${project.title}

${project.description}

## Original Prompt

${project.prompt}

## Files

${normalizedFiles.map((file) => `- \`${file.path}\``).join('\n')}
`;

  return dedupeEntries([
    ...normalizedFiles,
    {
      path: 'README.md',
      content: readme,
    },
    {
      path: 'vibecanvas-project.json',
      content: `${JSON.stringify(manifest, null, 2)}\n`,
    },
  ]);
}

function encodeEntry(entry: ZipEntry): EncodedEntry {
  const data = textEncoder.encode(entry.content);

  return {
    crc: crc32(data),
    data,
    name: textEncoder.encode(entry.path),
    path: entry.path,
  };
}

function createLocalHeader(entry: EncodedEntry): Uint8Array {
  const header = new Uint8Array(30);
  const view = new DataView(header.buffer);

  view.setUint32(0, 0x04034b50, true);
  view.setUint16(4, 20, true);
  view.setUint16(6, 0x0800, true);
  view.setUint16(8, 0, true);
  view.setUint16(10, 0, true);
  view.setUint16(12, 0, true);
  view.setUint32(14, entry.crc, true);
  view.setUint32(18, entry.data.length, true);
  view.setUint32(22, entry.data.length, true);
  view.setUint16(26, entry.name.length, true);
  view.setUint16(28, 0, true);

  return header;
}

function createCentralDirectoryHeader(entry: EncodedEntry, offset: number): Uint8Array {
  const header = new Uint8Array(46);
  const view = new DataView(header.buffer);

  view.setUint32(0, 0x02014b50, true);
  view.setUint16(4, 20, true);
  view.setUint16(6, 20, true);
  view.setUint16(8, 0x0800, true);
  view.setUint16(10, 0, true);
  view.setUint16(12, 0, true);
  view.setUint16(14, 0, true);
  view.setUint32(16, entry.crc, true);
  view.setUint32(20, entry.data.length, true);
  view.setUint32(24, entry.data.length, true);
  view.setUint16(28, entry.name.length, true);
  view.setUint16(30, 0, true);
  view.setUint16(32, 0, true);
  view.setUint16(34, 0, true);
  view.setUint16(36, 0, true);
  view.setUint32(38, 0, true);
  view.setUint32(42, offset, true);

  return header;
}

function createEndRecord(entryCount: number, centralSize: number, centralOffset: number): Uint8Array {
  const record = new Uint8Array(22);
  const view = new DataView(record.buffer);

  view.setUint32(0, 0x06054b50, true);
  view.setUint16(4, 0, true);
  view.setUint16(6, 0, true);
  view.setUint16(8, entryCount, true);
  view.setUint16(10, entryCount, true);
  view.setUint32(12, centralSize, true);
  view.setUint32(16, centralOffset, true);
  view.setUint16(20, 0, true);

  return record;
}

function crc32(data: Uint8Array): number {
  let crc = 0xffffffff;

  for (const byte of data) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ byte) & 0xff];
  }

  return (crc ^ 0xffffffff) >>> 0;
}

function createCrcTable(): Uint32Array {
  const table = new Uint32Array(256);

  for (let index = 0; index < 256; index += 1) {
    let value = index;

    for (let bit = 0; bit < 8; bit += 1) {
      value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    }

    table[index] = value >>> 0;
  }

  return table;
}

function dedupeEntries(entries: ZipEntry[]): ZipEntry[] {
  const counts = new Map<string, number>();

  return entries.map((entry) => {
    const cleanPath = normalizeZipPath(entry.path);
    const seenCount = counts.get(cleanPath) ?? 0;
    counts.set(cleanPath, seenCount + 1);

    if (seenCount === 0) {
      return { ...entry, path: cleanPath };
    }

    return {
      ...entry,
      path: appendSuffix(cleanPath, seenCount + 1),
    };
  });
}

function appendSuffix(path: string, suffix: number): string {
  const lastDot = path.lastIndexOf('.');
  const lastSlash = path.lastIndexOf('/');

  if (lastDot > lastSlash) {
    return `${path.slice(0, lastDot)}-${suffix}${path.slice(lastDot)}`;
  }

  return `${path}-${suffix}`;
}

function normalizeZipPath(path: string): string {
  const cleanPath = path
    .replaceAll('\\', '/')
    .split('/')
    .filter((part) => part && part !== '.' && part !== '..')
    .join('/');

  return cleanPath || 'untitled.txt';
}

function sumLengths(parts: Uint8Array[]): number {
  return parts.reduce((total, part) => total + part.length, 0);
}

function toBlobParts(parts: Uint8Array[]): ArrayBuffer[] {
  return parts.map((part) => new Uint8Array(part).buffer);
}
