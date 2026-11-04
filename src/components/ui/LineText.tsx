import { Fragment } from 'react';

// Splits text into words so LineReveal can group them by the line they land on.
export const LineText = ({ text }: { text: string }) => (
  <>
    {text.split(/\s+/).map((word, index) => (
      <Fragment key={index}>
        <span className="line-word">{word}</span>{' '}
      </Fragment>
    ))}
  </>
);
