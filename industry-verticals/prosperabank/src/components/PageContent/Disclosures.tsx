import React, { Fragment, JSX } from 'react';
import { Field, RichText, Text, useSitecore } from '@sitecore-content-sdk/nextjs';

/**
 * Datasource: **Heading**, **Intro**, and multilist **Items**.
 * Edge may expose the list as **`fields.items`** (camelCase) or **`fields.Items`** (PascalCase); the first non-empty array wins.
 * Each linked item: **Reference** (not shown on page yet), **Text** (rich text). Array order is render order.
 */
interface DisclosureItemFields {
  Reference?: Field<string>;
  Text?: Field<string>;
}

export type DisclosureItemProps = {
  fields: DisclosureItemFields;
  name: string;
  url: string;
};

export type DisclosuresProps = {
  params: { [key: string]: string };
  fields: {
    Heading?: Field<string>;
    Intro?: Field<string>;
    items?: DisclosureItemProps[];
    Items?: DisclosureItemProps[];
  };
};

function disclosureItemsList(
  fields: DisclosuresProps['fields'] | undefined
): DisclosureItemProps[] {
  if (!fields) {
    return [];
  }
  const lower = fields.items;
  const upper = fields.Items;
  if (Array.isArray(lower) && lower.length > 0) {
    return lower;
  }
  if (Array.isArray(upper) && upper.length > 0) {
    return upper;
  }
  return Array.isArray(lower) ? lower : Array.isArray(upper) ? upper : [];
}

export const Default = (props: DisclosuresProps): JSX.Element => {
  const { page } = useSitecore();
  const isEditing = Boolean(page?.mode?.isEditing);
  const id = props.params.RenderingIdentifier;
  const sxaStyles = `${props.params?.styles || ''}`;
  const heading = props.fields?.Heading;
  const intro = props.fields?.Intro;
  const items = disclosureItemsList(props.fields);

  const headingId = id ? `${id}-heading` : 'disclosures-heading';

  const headingBlock = (
    <h2 id={headingId} className="disclosures-heading h6 text-uppercase">
      {heading != null ? <Text field={heading} tag="span" /> : null}
    </h2>
  );

  const introBlock = (
    <div className="disclosures-intro">
      {intro != null ? <RichText field={intro} /> : null}
    </div>
  );

  if (!items.length) {
    return (
      <section
        className={`component disclosures disclosures-empty ${sxaStyles}`.trim()}
        id={id ? id : undefined}
        aria-labelledby={heading?.value ? headingId : undefined}
        aria-label={heading?.value ? undefined : 'Disclosures'}
      >
        <div className="container">
          {headingBlock}
          {introBlock}
          {isEditing ? (
            <p className="is-empty-hint mb-0">
              On this component&apos;s datasource, add disclosure items to the Items multilist (same pattern as
              Questions). Reference is not shown on the page yet; only Text is shown, numbered 1, 2, 3…
            </p>
          ) : null}
        </div>
      </section>
    );
  }

  return (
    <section
      className={`component disclosures ${sxaStyles}`}
      id={id ? id : undefined}
      aria-labelledby={heading?.value ? headingId : undefined}
      aria-label={heading?.value ? undefined : 'Disclosures'}
    >
      <div className="container">
        {headingBlock}
        {introBlock}
        <dl className="disclosures-list">
          {items.map((item, index) => (
            <Fragment key={item.url || `disclosure-${index}`}>
              <dt className="disclosures-term">
                <span>{index + 1}</span>
              </dt>
              <dd className="disclosures-def">
                {item.fields.Text ? <RichText field={item.fields.Text} /> : null}
              </dd>
            </Fragment>
          ))}
        </dl>
      </div>
    </section>
  );
};

/** Alternate rendering name in Sitecore; same layout as Default (single footnote list). */
export const SingleColumn = Default;
