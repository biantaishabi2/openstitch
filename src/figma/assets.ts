import type { FigmaNode } from './types';

export interface AssetResolverOptions {
  fileKey: string;
  figmaToken: string;
  format?: 'svg' | 'png';
  scale?: number;
  apiBaseUrl?: string;
  maxIds?: number;
}

export interface ResolvedAssets {
  byNodeId: Map<string, string>;
  requestedIds: string[];
  warnings: string[];
}

export type AssetResolver = (
  nodes: FigmaNode[],
  options: AssetResolverOptions
) => Promise<ResolvedAssets>;

function hasImageFill(node: FigmaNode): boolean {
  return (
    node.fills?.some(f => f.visible !== false && f.type === 'IMAGE') ?? false
  );
}

function isVectorLike(node: FigmaNode): boolean {
  return (
    node.type === 'VECTOR' ||
    node.type === 'BOOLEAN_OPERATION' ||
    node.type === 'STAR' ||
    node.type === 'LINE' ||
    node.type === 'ELLIPSE' ||
    node.type === 'REGULAR_POLYGON'
  );
}

function nameHintsAsset(node: FigmaNode): boolean {
  return /icon|logo|image|img|photo|picture/i.test(node.name || '');
}

function isAssetCandidate(node: FigmaNode): boolean {
  if (!node.absoluteBoundingBox) return false;

  if (hasImageFill(node) || isVectorLike(node)) {
    return true;
  }

  // 对实例和矩形等做轻量提示，但避免导出大容器
  const hasChildren = (node.children?.length || 0) > 0;
  if (nameHintsAsset(node) && !hasChildren) {
    return true;
  }

  if (
    node.type === 'INSTANCE' &&
    /icon|logo/i.test(node.name || '') &&
    !hasChildren
  ) {
    return true;
  }

  return false;
}

export function collectAssetNodeIds(nodes: FigmaNode[], maxIds = 200): string[] {
  const ids: string[] = [];
  const seen = new Set<string>();

  for (const node of nodes) {
    if (!isAssetCandidate(node)) continue;
    if (seen.has(node.id)) continue;
    seen.add(node.id);
    ids.push(node.id);
    if (ids.length >= maxIds) break;
  }

  return ids;
}

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

export async function resolveAssetsViaFigma(
  nodes: FigmaNode[],
  options: AssetResolverOptions
): Promise<ResolvedAssets> {
  const format = options.format || 'svg';
  const apiBaseUrl = options.apiBaseUrl || 'https://api.figma.com/v1';
  const maxIds = options.maxIds || 200;
  const ids = collectAssetNodeIds(nodes, maxIds);

  if (ids.length === 0) {
    return { byNodeId: new Map(), requestedIds: [], warnings: [] };
  }

  const warnings: string[] = [];
  const byNodeId = new Map<string, string>();

  const idChunks = chunk(ids, 80);

  for (const batch of idChunks) {
    const params = new URLSearchParams();
    params.set('ids', batch.join(','));
    params.set('format', format);
    if (options.scale) {
      params.set('scale', options.scale.toString());
    }

    const url = `${apiBaseUrl}/images/${options.fileKey}?${params.toString()}`;
    const response = await fetch(url, {
      headers: {
        'X-Figma-Token': options.figmaToken,
      },
    }).catch(() => null);

    if (!response || !response.ok) {
      warnings.push(`Failed to resolve assets for batch (${batch.length} ids).`);
      continue;
    }

    const data = (await response.json()) as {
      images?: Record<string, string | null>;
    };

    for (const id of batch) {
      const assetUrl = data.images?.[id];
      if (assetUrl) {
        byNodeId.set(id, assetUrl);
      } else {
        warnings.push(`No asset URL returned for node ${id}.`);
      }
    }
  }

  return { byNodeId, requestedIds: ids, warnings };
}

