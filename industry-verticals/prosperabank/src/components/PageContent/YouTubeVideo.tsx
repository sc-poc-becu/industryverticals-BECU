import React, { JSX } from 'react';
import { Field, Text, useSitecore } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { isValidYouTubeVideoId, youtubeIframeSrc } from 'lib/youtube-embed';

interface Fields {
  Title: Field<string>;
  'Video ID': Field<string>;
}

export type YouTubeVideoProps = ComponentProps & {
  params: { [key: string]: string };
  fields: Fields;
};

export const Default = (props: YouTubeVideoProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const sxaStyles = `${props.params?.styles || ''}`;
  const { page } = useSitecore();
  const isEditing = page.mode.isEditing;
  const videoId = props.fields?.['Video ID']?.value?.trim() ?? '';
  const hasValidId = isValidYouTubeVideoId(videoId);
  const embedSrc = hasValidId ? youtubeIframeSrc(videoId) : null;
  const iframeTitle =
    (props.fields?.Title?.value && props.fields.Title.value.trim()) || 'YouTube video';

  return (
    <div className={`component youtube-video ${sxaStyles}`} id={id ? id : undefined}>
      <div className="container">
        <h2 className="display-6 fw-bold mb-3">
          <Text field={props.fields?.Title} />
        </h2>
        {embedSrc ? (
          <div
            className="w-100 overflow-hidden rounded"
            style={{ aspectRatio: '16 / 9', maxWidth: '960px' }}
          >
            <iframe
              src={embedSrc}
              title={iframeTitle}
              className="h-100 w-100 border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
              loading="lazy"
            />
          </div>
        ) : (
          isEditing && (
            <p className="text-muted is-empty-hint mb-0">
              Add a valid 11-character YouTube Video ID to show the embed.
            </p>
          )
        )}
      </div>
    </div>
  );
};
