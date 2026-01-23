import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';

const scriptDir = path.dirname(new URL(import.meta.url).pathname);
const repoRoot = path.resolve(scriptDir, '..');
const schemaDir = path.join(repoRoot, 'src', 'data', 'schemas');
const srcDir = path.join(repoRoot, 'src');
const lucideIndexPath = path.join(
  repoRoot,
  'node_modules',
  'lucide-react',
  'dist',
  'esm',
  'lucide-react.js'
);
const outputPath = path.join(
  repoRoot,
  'packages',
  'liveview',
  'lib',
  'stitch_ui',
  'components',
  'lucide_icons.ex'
);
const TARGET_ICON_COUNT = 200;
const COMMON_KEYWORDS = [
  'Arrow',
  'Chevron',
  'Caret',
  'Corner',
  'Move',
  'Rotate',
  'Refresh',
  'Undo',
  'Redo',
  'Plus',
  'Minus',
  'X',
  'Check',
  'Search',
  'Filter',
  'Sort',
  'Menu',
  'Settings',
  'Sliders',
  'Edit',
  'Pen',
  'Pencil',
  'Trash',
  'Copy',
  'Save',
  'Download',
  'Upload',
  'Share',
  'Eye',
  'Lock',
  'Unlock',
  'Shield',
  'Key',
  'Info',
  'Alert',
  'Help',
  'Circle',
  'Square',
  'Triangle',
  'Play',
  'Pause',
  'Stop',
  'Rewind',
  'FastForward',
  'Skip',
  'User',
  'Users',
  'Mail',
  'Phone',
  'Message',
  'Chat',
  'Bell',
  'Calendar',
  'Clock',
  'Map',
  'Globe',
  'Home',
  'Folder',
  'File',
  'Image',
  'Video',
  'Camera',
  'Mic',
  'Headphones',
  'Shopping',
  'Cart',
  'Credit',
  'Dollar',
  'Tag',
  'Package',
  'Truck',
  'Chart',
  'Graph',
  'Pie',
  'Bar',
  'Trending',
  'Activity',
  'Gauge',
  'Cloud',
  'Database',
  'Server',
  'Cpu',
  'Terminal',
  'Code',
  'Git',
  'Star',
  'Heart',
  'Flag',
  'Bookmark',
  'Pin',
  'Location',
  'Target',
  'Compass'
];

function collectIconNames(node, acc) {
  if (node === null || node === undefined) return;
  if (Array.isArray(node)) {
    node.forEach((item) => collectIconNames(item, acc));
    return;
  }
  if (typeof node === 'object') {
    if (node.type === 'Icon' && node.props && node.props.name) {
      acc.add(node.props.name);
    }
    Object.values(node).forEach((value) => collectIconNames(value, acc));
  }
}

function loadSchemaIconNames() {
  const names = new Set();
  const files = fs.readdirSync(schemaDir).filter((file) => file.endsWith('.json'));
  files.forEach((file) => {
    const fullPath = path.join(schemaDir, file);
    const data = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
    collectIconNames(data, names);
  });
  return Array.from(names).sort();
}

function walkDir(dir, entries) {
  const list = fs.readdirSync(dir, { withFileTypes: true });
  list.forEach((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkDir(fullPath, entries);
    } else {
      entries.push(fullPath);
    }
  });
}

function loadReactIconNames() {
  const names = new Set();
  const files = [];
  walkDir(srcDir, files);
  files
    .filter((file) => file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx'))
    .forEach((file) => {
      const text = fs.readFileSync(file, 'utf8');
      const matches = text.matchAll(/import\s+\{([^}]+)\}\s+from\s+['"]lucide-react['"]/g);
      for (const match of matches) {
        const chunk = match[1];
        chunk.split(',').forEach((part) => {
          const raw = part.trim();
          if (!raw) return;
          const name = raw.split(' as ')[0].trim();
          if (name) names.add(name);
        });
      }
    });
  return Array.from(names).sort();
}

function buildIconFileMap() {
  const content = fs.readFileSync(lucideIndexPath, 'utf8');
  const exportRegex = /export\s+\{([^}]+)\}\s+from\s+'\.\/icons\/([^']+)\.js';/g;
  const map = new Map();
  let match;
  while ((match = exportRegex.exec(content))) {
    const namesChunk = match[1];
    const fileName = match[2];
    const parts = namesChunk.split(',');
    parts.forEach((part) => {
      const trimmed = part.trim();
      const nameMatch = trimmed.match(/default\s+as\s+([A-Za-z0-9_]+)/);
      if (nameMatch) {
        const name = nameMatch[1];
        if (!map.has(name)) {
          map.set(name, fileName);
        }
      }
    });
  }
  return map;
}

function buildIconSelection(availableNames, requiredNames) {
  if (requiredNames.length > TARGET_ICON_COUNT) {
    throw new Error(`Required icon count (${requiredNames.length}) exceeds target ${TARGET_ICON_COUNT}.`);
  }

  const availableSet = new Set(availableNames);
  const selected = [];
  const selectedSet = new Set();

  const add = (name) => {
    if (selected.length >= TARGET_ICON_COUNT) return;
    if (!availableSet.has(name)) return;
    if (selectedSet.has(name)) return;
    selectedSet.add(name);
    selected.push(name);
  };

  requiredNames.forEach(add);

  COMMON_KEYWORDS.forEach((keyword) => {
    availableNames.forEach((name) => {
      if (name.includes(keyword)) {
        add(name);
      }
    });
  });

  availableNames.forEach(add);

  return selected;
}

function escapeElixirString(value) {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function toElixirAttrs(attrs) {
  const entries = Object.entries(attrs)
    .filter(([key]) => key !== 'key')
    .map(([key, value]) => `"${escapeElixirString(key)}" => "${escapeElixirString(String(value))}"`)
    .join(', ');
  return `%{${entries}}`;
}

async function loadIconNodes(iconNames, iconFileMap) {
  const icons = new Map();
  for (const name of iconNames) {
    const fileName = iconFileMap.get(name);
    if (!fileName) continue;
    const filePath = path.join(
      repoRoot,
      'node_modules',
      'lucide-react',
      'dist',
      'esm',
      'icons',
      `${fileName}.js`
    );
    const module = await import(pathToFileURL(filePath).href);
    if (!module.__iconNode) {
      throw new Error(`Missing __iconNode for ${name} (${fileName})`);
    }
    icons.set(name, module.__iconNode);
  }
  return icons;
}

function buildElixirModule(iconNodes) {
  const lines = [];
  lines.push('defmodule StitchUI.Components.LucideIcons do');
  lines.push('  @moduledoc false');
  lines.push('');
  lines.push('  @icon_nodes %{');

  const names = Array.from(iconNodes.keys()).sort();
  names.forEach((name) => {
    const nodes = iconNodes.get(name) || [];
    lines.push(`    "${name}" => [`);
    nodes.forEach((node) => {
      const [tag, attrs] = node;
      lines.push(`      {"${tag}", ${toElixirAttrs(attrs)}},`);
    });
    lines.push('    ],');
  });

  lines.push('  }');
  lines.push('');
  lines.push('  def icon_nodes, do: @icon_nodes');
  lines.push('end');
  lines.push('');
  return lines.join('\n');
}

async function main() {
  if (!fs.existsSync(lucideIndexPath)) {
    throw new Error(`lucide-react index not found at ${lucideIndexPath}`);
  }

  const schemaIcons = loadSchemaIconNames();
  const reactIcons = loadReactIconNames();
  const iconFileMap = buildIconFileMap();
  const availableNames = Array.from(iconFileMap.keys()).sort();
  const requiredNames = Array.from(new Set([...schemaIcons, ...reactIcons]));
  const missingRequired = requiredNames.filter((name) => !iconFileMap.has(name));

  if (missingRequired.length) {
    console.error('Missing icons in lucide-react:', missingRequired.join(', '));
    process.exit(1);
  }

  const iconNames = buildIconSelection(availableNames, requiredNames);
  const iconNodes = await loadIconNodes(iconNames, iconFileMap);
  const moduleContent = buildElixirModule(iconNodes);
  fs.writeFileSync(outputPath, moduleContent, 'utf8');

  console.log(`Synced ${iconNames.length} icons to ${outputPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
