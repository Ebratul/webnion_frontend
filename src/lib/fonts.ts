import { Hind_Siliguri, Poppins } from 'next/font/google';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
});

// Only used for the accent line in the Customer Problems heading
const poppinsItalic = Poppins({
  subsets: ['latin'],
  weight: '500',
  style: 'italic',
  variable: '--font-poppins-italic',
  display: 'swap',
  preload: false,
});

const hindSiliguri = Hind_Siliguri({
  subsets: ['bengali', 'latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-hind',
  display: 'swap',
});

export const fontClasses = `${poppins.variable} ${poppinsItalic.variable} ${hindSiliguri.variable}`;
