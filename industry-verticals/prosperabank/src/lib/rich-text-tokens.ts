/**
 * Utilities for resolving `{{category:key}}` placeholders in rich text against a
 * two-level Sitecore tree: Tokens → category folders → leaf items with a Value field.
 */

/** Matches tokens such as `{{rates:heloc}}` (letters, digits, hyphen, underscore). */
export const RICH_TEXT_TOKEN_PATTERN = /\{\{([a-z0-9_-]+):([a-z0-9_-]+)\}\}/gi;

export type SitecoreGraphClient = {
  getData: (query: string, variables?: Record<string, unknown>) => Promise<unknown>;
};

export function slugifyTokenSegment(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-');
}

/**
 * Collects unique normalized token keys (`category:key`) from HTML.
 */
export function collectTokenKeysFromHtml(html: string): string[] {
  const keys = new Set<string>();
  const re = new RegExp(RICH_TEXT_TOKEN_PATTERN.source, RICH_TEXT_TOKEN_PATTERN.flags);
  let match: RegExpExecArray | null;
  while ((match = re.exec(html)) !== null) {
    const category = slugifyTokenSegment(match[1] || '');
    const key = slugifyTokenSegment(match[2] || '');
    if (category && key) {
      keys.add(`${category}:${key}`);
    }
  }
  return [...keys];
}

/**
 * Replaces all `{{category:key}}` occurrences using a pre-built lookup (keys slugified).
 */
export function replaceRichTextTokens(html: string, lookup: ReadonlyMap<string, string>): string {
  return html.replace(
    new RegExp(RICH_TEXT_TOKEN_PATTERN.source, RICH_TEXT_TOKEN_PATTERN.flags),
    (full, c: string, k: string) => {
      const mapKey = `${slugifyTokenSegment(c)}:${slugifyTokenSegment(k)}`;
      if (lookup.has(mapKey)) {
        return lookup.get(mapKey) ?? full;
      }
      return full;
    }
  );
}

interface GraphqlField {
  value?: string | null;
}

interface GraphqlLeaf {
  name?: string | null;
  valueField?: GraphqlField | null;
  valueAlt?: GraphqlField | null;
}

interface GraphqlCategory {
  name?: string | null;
  children?: { results?: GraphqlLeaf[] | null } | null;
}

interface TokenTreeResponse {
  item?: {
    children?: { results?: GraphqlCategory[] | null } | null;
  } | null;
}

const TOKEN_TREE_QUERY = /* GraphQL */ `
  query RichTextTokenTree($path: String!, $language: String!) {
    item(path: $path, language: $language) {
      children {
        results {
          name
          children {
            results {
              name
              valueField: field(name: "Value") {
                value
              }
              valueAlt: field(name: "value") {
                value
              }
            }
          }
        }
      }
    }
  }
`;

/**
 * Loads category → leaf items from Experience Edge and builds `categorySlug:leafSlug` → value.
 */
export async function fetchTokenValueMap(
  client: SitecoreGraphClient,
  itemPathOrId: string,
  language: string
): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  const trimmed = itemPathOrId.trim();
  if (!trimmed) {
    return map;
  }

  const data = (await client.getData(TOKEN_TREE_QUERY, {
    path: trimmed,
    language,
  })) as TokenTreeResponse;

  const categories = data?.item?.children?.results;
  if (!categories?.length) {
    return map;
  }

  for (const category of categories) {
    const categorySlug = slugifyTokenSegment(category.name || '');
    if (!categorySlug) {
      continue;
    }
    const leaves = category.children?.results;
    if (!leaves?.length) {
      continue;
    }
    for (const leaf of leaves) {
      const leafSlug = slugifyTokenSegment(leaf.name || '');
      if (!leafSlug) {
        continue;
      }
      const value =
        (leaf.valueField?.value && String(leaf.valueField.value)) ||
        (leaf.valueAlt?.value && String(leaf.valueAlt.value)) ||
        '';
      map.set(`${categorySlug}:${leafSlug}`, value);
    }
  }

  return map;
}
