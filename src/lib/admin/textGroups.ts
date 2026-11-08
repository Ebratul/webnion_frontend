// Names for the Website Text screen, in the order the sections appear on the site
export const TEXT_GROUPS: { key: string; label: string; hint: string }[] = [
  { key: 'meta', label: 'Search Engine Title', hint: 'What Google shows for the site.' },
  { key: 'nav', label: 'Menu', hint: 'The links and button in the top bar.' },
  { key: 'hero', label: 'Hero', hint: 'The first screen of the homepage.' },
  { key: 'trust', label: 'Client Logos', hint: 'The label above the logos.' },
  { key: 'problems', label: 'Problems And Chat', hint: 'The dark card and its demo chat answers.' },
  { key: 'services', label: 'Services Section', hint: 'Heading and buttons on the homepage.' },
  { key: 'outcomes', label: 'Expert Insights', hint: 'Heading, four points and photo descriptions.' },
  { key: 'projects', label: 'Portfolio Section', hint: 'Heading and link on the homepage.' },
  { key: 'outcomeCards', label: 'Outcome Cards Section', hint: 'The hidden heading of the stacking cards.' },
  { key: 'testimonials', label: 'Customer Reviews', hint: 'Heading, star ratings and client count.' },
  { key: 'delivery', label: 'Delivery Stories', hint: 'Heading, text and button.' },
  { key: 'process', label: 'Process', hint: 'Heading and the three steps.' },
  { key: 'pricing', label: 'Pricing Section', hint: 'Heading, default button and the note below the cards.' },
  { key: 'technologies', label: 'Technologies Section', hint: 'Heading. The cards are under Technologies.' },
  { key: 'faq', label: 'FAQ Section', hint: 'Heading and the call card.' },
  { key: 'inquiry', label: 'Inquiry Form', hint: 'Closing section and every label in the form.' },
  { key: 'footer', label: 'Footer', hint: 'About text, addresses and bottom line.' },
  { key: 'servicePage', label: 'Services Page', hint: 'The page listing all services.' },
  { key: 'serviceDetail', label: 'Service Details', hint: 'Labels on each service page.' },
  { key: 'closing', label: 'Services Page Closing Card', hint: 'The card at the end of the services page.' },
  { key: 'projectPage', label: 'Projects Page', hint: 'The page listing all projects.' },
  { key: 'projectDetail', label: 'Project Details', hint: 'Labels on each project page.' },
  { key: 'caseStudiesPage', label: 'Case Studies Page', hint: 'The page listing all case studies.' },
  { key: 'caseStudyDetail', label: 'Case Study Details', hint: 'Labels on each case study.' },
  { key: 'productsPage', label: 'Products Page', hint: 'Headings, filters and labels.' },
  { key: 'teamPage', label: 'Team Page', hint: 'The top of the team page.' },
  { key: 'team', label: 'Team Page Section', hint: 'The heading above the team cards.' },
  { key: 'contactPage', label: 'Contact Page', hint: 'Everything on the contact page, with its address.' },
  { key: 'error', label: 'Error Pages', hint: 'Shown when a page is missing or fails.' },
];

const words = (key: string) => key.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, (letter) => letter.toUpperCase());

// hero.titleLines.0 becomes "Title Lines 1"
export const textLabel = (path: string) => {
  const parts: string[] = [];
  for (const piece of path.split('.').slice(1)) {
    if (/^\d+$/.test(piece) && parts.length > 0) parts[parts.length - 1] += ` ${Number(piece) + 1}`;
    else parts.push(words(piece));
  }
  return parts.join(' · ');
};
