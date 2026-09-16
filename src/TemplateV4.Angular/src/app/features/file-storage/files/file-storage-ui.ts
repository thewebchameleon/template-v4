import type { FileItem } from '../../../api/models/file-item';

export function filterVisibleFileGroups<T extends { id: string }>(groups: readonly T[]): T[] {
  return groups.filter(() => true);
}

export function filterVisibleFileFolders<T extends { fileCount?: number }>(
  group: string,
  folders: readonly T[],
): T[] {
  return group === 'file-storage'
    ? folders.filter(() => true)
    : folders.filter((folder) => (folder.fileCount ?? 0) > 0);
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
export function fileIconName(file: Pick<FileItem, 'name' | 'isFolder' | 'category'>): string {
  if (file.isFolder) return 'phosphorFolderDuotone';
  const extension = file.name.includes('.') ? file.name.split('.').pop()!.toLowerCase() : '';
  if (Object.hasOwn(extensions, extension)) return extensions[extension];
  const category = file.category ?? 'other';
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
