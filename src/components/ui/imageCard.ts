// The site's card style, from the client's reference: a large image, 24px corners, and text on a dark gradient at the
// bottom in both themes. The body overlaps the image by 5rem and fades over exactly that part, so the image never ends in a hard line, however long the text is.
export const imageCardClass =
  'band-dark relative flex h-full flex-col overflow-hidden rounded-3xl border border-transparent bg-[#0d0f18]! transition-[border-color] duration-300 hover:border-primary/40';

export const imageCardBodyClass = 'relative -mt-20 flex flex-1 flex-col bg-[linear-gradient(to_top,#0d0f18_calc(100%-5rem),transparent)] p-5 pt-20';

// For cards with a whole picture (CardCover): fades only the last 2rem of the picture, so faces and headlines in it stay whole
export const coverCardBodyClass = 'relative -mt-8 flex flex-1 flex-col bg-[linear-gradient(to_top,#0d0f18_calc(100%-2rem),transparent)] p-5 pt-8';
