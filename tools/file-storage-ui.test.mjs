import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import vm from "node:vm";

const require = createRequire(
  new URL("../src/TemplateV4.Angular/package.json", import.meta.url),
);
const ts = require("typescript");
const source = readFileSync(
  new URL(
    "../modules/Bundled/FileStorage/Frontend/files/file-storage-ui.ts",
    import.meta.url,
  ),
  "utf8",
);
const exports = {};
vm.runInNewContext(
  ts.transpileModule(source, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.CommonJS,
    },
  }).outputText,
  { exports },
);
const {
  fileIconName,
  canMoveFolder,
  canMoveEntry,
  filterVisibleFileGroups,
  filterVisibleFileFolders,
} = exports;

const folder = (id, parentId = null, permission = "owner") => ({
  id,
  parentId,
  name: id,
  permission,
  isFolder: true,
});

test("submenu keeps every file group visible regardless of its file count", () => {
  const groups = [
    { id: "file-storage" },
    { id: "important" },
    { id: "shared" },
    { id: "recent" },
    { id: "starred" },
    { id: "trash" },
  ];
  assert.deepEqual(
    filterVisibleFileGroups(groups).map((group) => group.id),
    ["file-storage", "important", "shared", "recent", "starred", "trash"],
  );
});

test("group folders require direct files rather than nested folders", () => {
  const folders = [
    { id: "empty", fileCount: 0, itemCount: 0 },
    { id: "nested-only", fileCount: 0, itemCount: 1 },
    { id: "with-file", fileCount: 1, itemCount: 1 },
  ];
  assert.deepEqual(
    filterVisibleFileFolders("recent", folders).map((entry) => entry.id),
    ["with-file"],
  );
  assert.deepEqual(
    filterVisibleFileFolders("file-storage", folders).map((entry) => entry.id),
    ["empty", "nested-only", "with-file"],
  );
});

test("specific formats take precedence over category, with same-set fallback", () => {
  for (const [name, category, icon] of [
    ["report.PDF", "documents", "phosphorFilePdfDuotone"],
    ["report.docx", "documents", "phosphorFileDocDuotone"],
    ["photo.jpeg", "images", "phosphorFileJpgDuotone"],
    ["movie.mp4", "video", "phosphorFileVideoDuotone"],
    ["archive.7z", "archives", "phosphorFileArchiveDuotone"],
    ["unknown.bin", "other", "phosphorFileDuotone"],
    ["README", undefined, "phosphorFileDuotone"],
    ["unknown.constructor", "constructor", "phosphorFileDuotone"],
  ])
    assert.equal(fileIconName({ name, category, isFolder: false }), icon);
  assert.equal(
    fileIconName({ name: "folder.pdf", isFolder: true }),
    "phosphorFolderDuotone",
  );
});

test("folder moves allow reparenting and returning to root without sibling reordering", () => {
  const a = folder("a"),
    b = folder("b"),
    child = folder("child", "a");
  const folders = [a, b, child];
  assert.equal(canMoveFolder(a, "b", folders), true);
  assert.equal(canMoveFolder(child, null, folders), true);
  assert.equal(canMoveFolder(child, "b", folders), true);
  assert.equal(canMoveFolder(a, null, folders), false);
  assert.equal(canMoveFolder(child, "a", folders), false);
});

test("folder moves reject self, deep descendants, missing targets and non-owned paths", () => {
  const a = folder("a"),
    child = folder("child", "a"),
    grandchild = folder("grandchild", "child");
  const shared = folder("shared", null, "editor");
  const folders = [a, child, grandchild, shared];
  for (const target of ["a", "child", "grandchild", "missing", "shared"]) {
    assert.equal(canMoveFolder(a, target, folders), false);
  }
  assert.equal(canMoveFolder(shared, "a", folders), false);
  assert.equal(
    canMoveFolder({ ...child, isFolder: false }, null, folders),
    false,
  );
  assert.equal(
    canMoveFolder(a, "loop", [...folders, folder("loop", "loop")]),
    false,
  );
});

test("entry moves allow owned files and folders but reject unchanged and invalid targets", () => {
  const a = folder("a"),
    b = folder("b"),
    shared = folder("shared", null, "editor");
  const file = { ...folder("file", "a"), isFolder: false };
  assert.equal(canMoveEntry(file, "b", [a, b, shared]), true);
  assert.equal(canMoveEntry(file, null, [a, b, shared]), true);
  assert.equal(canMoveEntry(file, "a", [a, b, shared]), false);
  assert.equal(canMoveEntry(file, "shared", [a, b, shared]), false);
  assert.equal(
    canMoveEntry({ ...file, permission: "viewer" }, "b", [a, b]),
    false,
  );
  assert.equal(canMoveEntry(a, "b", [a, b]), true);
});
