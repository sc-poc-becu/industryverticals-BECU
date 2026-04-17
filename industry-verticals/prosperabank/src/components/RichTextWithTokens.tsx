import React, { JSX } from 'react';
import {
  RichText as JssRichText,
  LayoutServicePageState,
  type Field,
  type GetComponentServerProps,
  type LayoutServiceData,
  type ComponentRendering,
} from '@sitecore-content-sdk/nextjs';

import { collectTokenKeysFromHtml, fetchTokenValueMap, replaceRichTextTokens } from 'lib/rich-text-tokens';

interface Fields {
  Text: Field<string>;
}

export type RichTextWithTokensProps = {
  params: { [key: string]: string };
  fields: Fields;
};

function resolveTokensRoot(rendering: ComponentRendering): string {
  const fromParams = rendering.params?.TokensRootPath?.trim();
  if (fromParams) {
    return fromParams;
  }
  const fromEnv = process.env.SITECORE_TOKENS_ROOT_PATH?.trim();
  if (fromEnv) {
    return fromEnv;
  }
  const ds = rendering.dataSource?.trim();
  return ds || '';
}

/** Tokens root must be a full Sitecore path (`/sitecore/content/...`) or item ID; only normalizes slashes. */
function normalizeTokensRootPath(raw: string): string {
  return raw.trim().replace(/\\/g, '/').replace(/\/{2,}/g, '/');
}

/**
 * Runs during {@link import('next').GetStaticProps} / ISR when `getComponentData` executes.
 * Resolves `{{category:key}}` in the rich text HTML from the Sitecore token tree so the
 * rendered output is static and cacheable with the same revalidation as the page.
 * Token replacement is skipped only when `pageState` is `edit` (Pages authoring); preview uses resolved values.
 */
export const getComponentServerProps: GetComponentServerProps = async (
  rendering,
  layoutData: LayoutServiceData,
  context
) => {
  void context;
  const pageState = layoutData.sitecore?.context?.pageState;
  if (pageState === LayoutServicePageState.Edit) {
    return {};
  }

  const textField = rendering.fields?.Text as Field<string> | undefined;
  const html = textField?.value;
  if (!html || typeof html !== 'string') {
    return {};
  }

  const tokenKeys = collectTokenKeysFromHtml(html);
  if (!tokenKeys.length) {
    return {};
  }

  const rawRoot = resolveTokensRoot(rendering);
  const root = normalizeTokensRootPath(rawRoot);
  if (!root) {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.warn(
        'RichTextWithTokens: set TokensRootPath, SITECORE_TOKENS_ROOT_PATH, or datasource to the Tokens item using a full Sitecore path or item ID.'
      );
    }
    return {};
  }

  const language =
    layoutData.sitecore?.context?.language ||
    process.env.NEXT_PUBLIC_DEFAULT_LANGUAGE ||
    'en';

  const { default: client } = await import('lib/sitecore-client');
  const tokenMap = await fetchTokenValueMap(client, root, language);
  const resolvedHtml = replaceRichTextTokens(html, tokenMap);

  return {
    fields: {
      ...(rendering.fields || {}),
      Text: {
        ...textField,
        value: resolvedHtml,
      },
    },
  };
};

export const Default = (props: RichTextWithTokensProps): JSX.Element => {
  const text = props.fields ? (
    <JssRichText field={props.fields.Text} />
  ) : (
    <span className="is-empty-hint">Rich text</span>
  );
  const id = props.params.RenderingIdentifier;
  const sxaStyles = `${props.params?.styles || ''}`;

  return (
    <div className={`component rich-text rich-text-tokens ${sxaStyles}`} id={id ? id : undefined}>
      <div className="component-content">{text}</div>
    </div>
  );
};
