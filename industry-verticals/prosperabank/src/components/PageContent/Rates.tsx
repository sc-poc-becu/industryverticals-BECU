import React, { JSX } from 'react';
import { Field, RichText, Text, useSitecore } from '@sitecore-content-sdk/nextjs';

/**
 * Datasource: **Header** (rich text, required), multilist **Rates** (0–many **Rate Item**),
 * **Footer** (rich text, optional). Edge may expose the list as `rates` / `Rates` / `items` / `Items`.
 * Each **Rate Item**: **Rate** (text), **Title** (text), **Description** (rich text, optional).
 */
interface RateItemFields {
  Rate?: Field<string>;
  Title?: Field<string>;
  Description?: Field<string>;
}

export type RateItemProps = {
  fields: RateItemFields;
  name: string;
  url: string;
};

export type RatesProps = {
  params: { [key: string]: string };
  fields: {
    Header?: Field<string>;
    Footer?: Field<string>;
    rates?: RateItemProps[];
    Rates?: RateItemProps[];
    items?: RateItemProps[];
    Items?: RateItemProps[];
  };
};

function selectedRates(fields: RatesProps['fields'] | undefined): RateItemProps[] {
  if (!fields) {
    return [];
  }
  const candidates = [fields.rates, fields.Rates, fields.items, fields.Items];
  for (const list of candidates) {
    if (Array.isArray(list) && list.length > 0) {
      return list;
    }
  }
  const fallback = fields.rates ?? fields.Rates ?? fields.items ?? fields.Items;
  return Array.isArray(fallback) ? fallback : [];
}

function rateItemLabel(item: RateItemProps): string | undefined {
  const t = item.fields?.Title?.value?.trim();
  const r = item.fields?.Rate?.value?.trim();
  if (t && r) {
    return `${t}, ${r} percent APR`;
  }
  return t || r;
}

export const Default = (props: RatesProps): JSX.Element => {
  const { page } = useSitecore();
  const isEditing = Boolean(page?.mode?.isEditing);
  const id = props.params.RenderingIdentifier;
  const sxaStyles = `${props.params?.styles || ''}`.trim();
  const header = props.fields?.Header;
  const footer = props.fields?.Footer;
  const items = selectedRates(props.fields);

  const headingId = id ? `${id}-heading` : 'rates-heading';

  const headerBlock =
    header != null ? (
      <div id={headingId} className="rates-header">
        <RichText field={header} />
      </div>
    ) : isEditing ? (
      <p id={headingId} className="rates-header is-empty-hint mb-0">
        Add the required <strong>Header</strong> rich text on this component&apos;s datasource.
      </p>
    ) : null;

  return (
    <section
      className={`component rates ${sxaStyles}`.trim()}
      id={id ? id : undefined}
      aria-labelledby={header?.value ? headingId : undefined}
      aria-label={header?.value ? undefined : 'Rates'}
    >
      <div className="container">
        {headerBlock}

        {!items.length && isEditing ? (
          <p className="is-empty-hint mb-0 mt-3">
            Pick one or more <strong>Rate Item</strong> entries in the <strong>Rates</strong> multilist (library:
            /sitecore/content/…/Data/RateItems).
          </p>
        ) : null}

        {items.length > 0 ? (
          <ul className="rates-list list-unstyled mb-0">
            {items.map((item, index) => {
              const rateField = item.fields.Rate;
              const hasRateValue = Boolean(rateField?.value?.trim());
              const showRateRow = isEditing || hasRateValue;
              return (
                <li
                  key={item.url || `rate-${index}`}
                  className="rates-item"
                  role="group"
                  aria-label={rateItemLabel(item)}
                >
                  {showRateRow ? (
                    <div className="rates-rate-row">
                      <span className="rates-value">
                        <Text field={rateField} tag="span" />
                      </span>
                      <span className="rates-suffix" aria-hidden="true">
                        <span className="rates-suffix-pct">%</span>
                        <span className="rates-suffix-apr">APR</span>
                      </span>
                    </div>
                  ) : null}
                  <h3 className="rates-title h5 mb-0">
                    <Text field={item.fields.Title} tag="span" />
                  </h3>
                  {item.fields.Description != null &&
                  (Boolean(item.fields.Description.value) || isEditing) ? (
                    <div className="rates-description">
                      <RichText field={item.fields.Description} />
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        ) : null}

        {footer != null && (footer.value || isEditing) ? (
          <div className="rates-footer">
            <RichText field={footer} />
          </div>
        ) : null}
      </div>
    </section>
  );
};
