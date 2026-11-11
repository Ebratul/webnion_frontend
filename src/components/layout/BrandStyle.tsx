import { brandStyle } from '@/lib/brandColors';

// The admin's brand colour, placed before the page content so it paints with the first frame
export const BrandStyle = ({ primaryColor }: { primaryColor: string }) => {
  const css = brandStyle(primaryColor);
  return css ? <style data-brand dangerouslySetInnerHTML={{ __html: css }} /> : null;
};
