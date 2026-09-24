import type { FileItem } from '../../../../../src/TemplateV4.Angular/src/app/api/models/file-item';

export function filterVisibleFileGroups<T extends { id: string }>(groups: readonly T[]): T[] {
  return groups.filter(() => true);
}

export function filterVisibleFileFolders<T extends { fileCount?: number }>(
  group: string,
  folders: readonly T[],
): T[] {
  if (group === 'recent' || group === 'important' || group === 'starred') return [];
  return group === 'file-storage' ? folders.filter(() => true) : folders.filter((folder) => (folder.fileCount ?? 0) > 0);
}

const extensions: Record<string, string> = {
  pdf: 'phosphorFilePdfDuotone',
  doc: 'phosphorFileDocDuotone',
  docx: 'phosphorFileDocDuotone',
  odt: 'phosphorFileDocDuotone',
  xls: 'phosphorFileXlsDuotone',
  xlsx: 'phosphorFileXlsDuotone',
  ods: 'phosphorFileXlsDuotone',
  csv: 'phosphorFileCsvDuotone',
  ppt: 'phosphorFilePptDuotone',
  pptx: 'phosphorFilePptDuotone',
  odp: 'phosphorFilePptDuotone',
  jpg: 'phosphorFileJpgDuotone',
  jpeg: 'phosphorFileJpgDuotone',
  png: 'phosphorFilePngDuotone',
  svg: 'phosphorFileSvgDuotone',
  gif: 'phosphorFileImageDuotone',
  webp: 'phosphorFileImageDuotone',
  mp4: 'phosphorFileVideoDuotone',
  mov: 'phosphorFileVideoDuotone',
  webm: 'phosphorFileVideoDuotone',
  mp3: 'phosphorFileAudioDuotone',
  m4a: 'phosphorFileAudioDuotone',
  wav: 'phosphorFileAudioDuotone',
  txt: 'phosphorFileTxtDuotone',
  md: 'phosphorFileMdDuotone',
  zip: 'phosphorFileZipDuotone',
  html: 'phosphorFileHtmlDuotone',
  htm: 'phosphorFileHtmlDuotone',
  css: 'phosphorFileCssDuotone',
  js: 'phosphorFileJsDuotone',
  mjs: 'phosphorFileJsDuotone',
  jsx: 'phosphorFileJsxDuotone',
  ts: 'phosphorFileTsDuotone',
  tsx: 'phosphorFileTsxDuotone',
  py: 'phosphorFilePyDuotone',
  rs: 'phosphorFileRsDuotone',
  sql: 'phosphorFileSqlDuotone',
  vue: 'phosphorFileVueDuotone',
  c: 'phosphorFileCDuotone',
  cpp: 'phosphorFileCppDuotone',
  cs: 'phosphorFileCSharpDuotone',
  ini: 'phosphorFileIniDuotone',
};
const categories: Record<string, string> = {
  images: 'phosphorFileImageDuotone',
  documents: 'phosphorFileTextDuotone',
  spreadsheets: 'phosphorFileXlsDuotone',
  presentations: 'phosphorFilePptDuotone',
  video: 'phosphorFileVideoDuotone',
  audio: 'phosphorFileAudioDuotone',
  archives: 'phosphorFileArchiveDuotone',
};
export function fileCategory(file: Pick<FileItem, 'name' | 'isFolder' | 'category'>): string {
  if (file.isFolder) return 'folders';
  if (file.category) return file.category;
  const extension = file.name.includes('.') ? file.name.split('.').pop()!.toLowerCase() : '';
  if (/^(jpg|jpeg|png|svg|gif|webp)$/.test(extension)) return 'images';
  if (/^(pdf|doc|docx|odt|txt|md)$/.test(extension)) return 'documents';
  if (/^(xls|xlsx|ods|csv)$/.test(extension)) return 'spreadsheets';
  if (/^(ppt|pptx|odp)$/.test(extension)) return 'presentations';
  if (/^(mp4|mov|webm)$/.test(extension)) return 'video';
  if (/^(mp3|m4a|wav)$/.test(extension)) return 'audio';
  if (/^(zip|rar|7z|tar|gz)$/.test(extension)) return 'archives';
  return 'other';
}
export function fileIconName(file: Pick<FileItem, 'name' | 'isFolder' | 'category'>): string {
  if (file.isFolder) return 'phosphorFolderDuotone';
  const extension = file.name.includes('.') ? file.name.split('.').pop()!.toLowerCase() : '';
  if (Object.hasOwn(extensions, extension)) return extensions[extension];
  const category = fileCategory(file);
  return Object.hasOwn(categories, category) ? categories[category] : 'phosphorFileDuotone';
}

export function canMoveFolder(
  source: FileItem,
  parentId: string | null,
  folders: FileItem[],
): boolean {
  if (!source.isFolder || source.permission !== 'owner' || source.parentId === parentId)
    return false;
  const seen = new Set([source.id]);
  let parent = parentId;
  while (parent !== null) {
    if (seen.has(parent)) return false;
    seen.add(parent);
    const folder = folders.find((entry) => entry.id === parent);
    if (!folder?.isFolder || folder.permission !== 'owner') return false;
    parent = folder.parentId;
  }
  return true;
}

export function canMoveEntry(
  source: FileItem,
  parentId: string | null,
  folders: FileItem[],
): boolean {
  if (source.permission !== 'owner' || source.parentId === parentId) return false;
  if (source.isFolder) return canMoveFolder(source, parentId, folders);
  if (parentId === null) return true;
  const target = folders.find((entry) => entry.id === parentId);
  return !!target?.isFolder && target.permission === 'owner';
}
