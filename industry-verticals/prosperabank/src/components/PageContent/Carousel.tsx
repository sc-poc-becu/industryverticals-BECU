import React, { useCallback, useEffect, useState, JSX } from 'react';
import {
  ComponentParams,
  ComponentRendering,
  Field,
  ImageField,
  RichTextField,
  LinkField,
  Text,
  Link,
  RichText,
  useSitecore,
  NextImage,
} from '@sitecore-content-sdk/nextjs';

interface Fields {
  Title: Field<string>;
  Text: RichTextField;
  Image: ImageField;
  Link: LinkField;
  Button: LinkField;
  Video: ImageField;
}

export type CarouselItemProps = {
  id: string;
  fields: Fields;
};

interface CarouselComponentProps {
  rendering: ComponentRendering & { params: ComponentParams };
  params: ComponentParams;
  fields: {
    items: CarouselItemProps[];
  };
}

export const Default = (props: CarouselComponentProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;

  const handleNext = useCallback(() => {
    setIndex((prevIndex) => (prevIndex < props.fields.items.length - 1 ? prevIndex + 1 : 0));
  }, [props.fields.items.length]);

  const handlePrev = useCallback(() => {
    setIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : props.fields.items.length - 1));
  }, [props.fields.items.length]);

  useEffect(() => {
    if (isPageEditing || !isPlaying || props.fields.items.length <= 1) {
      return;
    }

    const interval = window.setInterval(() => {
      handleNext();
    }, 7000);

    return () => window.clearInterval(interval);
  }, [handleNext, isPageEditing, isPlaying, props.fields.items.length]);

  const sxaStyles = `${props.params?.styles || ''}`;

  return (
    <section className={`component carousel ${sxaStyles}`} id={id ? id : undefined}>
      <div className="carousel-inner">
        {props.fields.items.map((item, i) => (
          <div key={i} className={'carousel-item ' + (i == index ? 'active' : '')}>
            <div className="carousel-media">
              {!isPageEditing && item.fields?.Video?.value?.src ? (
                <video
                  className="object-fit-cover d-block w-100 h-100"
                  key={item.id}
                  autoPlay={true}
                  loop={true}
                  muted
                  playsInline
                  poster={item.fields.Image?.value?.src}
                >
                  <source src={item.fields.Video.value.src} type="video/webm" />
                </video>
              ) : (
                <NextImage
                  field={item.fields.Image}
                  className="object-fit-cover d-block w-100 h-100"
                  width={1920}
                  height={800}
                />
              )}
            </div>

            <div className="side-content">
              <div className="container">
                <div className="carousel-text">
                  <h1 className="display-6 fw-bold">
                    <Text field={item.fields.Title}></Text>
                  </h1>
                  <RichText field={item.fields.Text}></RichText>
                  {(() => {
                    const hasButtonLink = !!item.fields?.Button?.value?.href;
                    const hasLegacyLink = !!item.fields?.Link?.value?.href;
                    const buttonField = isPageEditing
                      ? item.fields?.Button ?? item.fields?.Link
                      : hasButtonLink
                        ? item.fields?.Button
                        : item.fields?.Link;
                    const shouldRenderButton = isPageEditing ? !!buttonField : hasButtonLink || hasLegacyLink;

                    return (
                      shouldRenderButton && (
                        <Link field={buttonField as LinkField} className="button button-accent"></Link>
                      )
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="carousel-controls">
        <button
          className={`carousel-toggle ${isPlaying ? 'is-playing' : 'is-paused'}`}
          type="button"
          aria-label={isPlaying ? 'Pause slides' : 'Play slides'}
          onClick={() => setIsPlaying((prev) => !prev)}
        >
          {isPlaying ? (
            <svg aria-hidden="true" viewBox="0 0 20 20">
              <rect x="6" y="4" width="3" height="12" rx="1"></rect>
              <rect x="11" y="4" width="3" height="12" rx="1"></rect>
            </svg>
          ) : (
            <svg aria-hidden="true" viewBox="0 0 20 20">
              <path d="M6 4l10 6-10 6V4z"></path>
            </svg>
          )}
        </button>
        <ol className="carousel-indicators">
          {props.fields.items.map((_item, i) => (
            <li
              key={i}
              aria-label="Slide"
              className={i == index ? 'active' : ''}
              onClick={() => setIndex(i)}
            ></li>
          ))}
        </ol>
      </div>
      <button
        className="carousel-control-prev"
        type="button"
        data-bs-target="#carouselExampleCaptions"
        data-bs-slide="prev"
        onClick={handlePrev}
      >
        <span className="carousel-control-prev-icon" aria-hidden="true">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor">
            <path d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z" />
          </svg>
        </span>
        <span className="visually-hidden">Previous</span>
      </button>
      <button
        className="carousel-control-next"
        type="button"
        data-bs-target="#carouselExampleCaptions"
        data-bs-slide="next"
        onClick={handleNext}
      >
        <span className="carousel-control-next-icon" aria-hidden="true">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor">
            <path d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z" />
          </svg>
        </span>
        <span className="visually-hidden">Next</span>
      </button>
    </section>
  );
};
