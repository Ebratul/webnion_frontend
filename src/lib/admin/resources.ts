// Describes every section of the admin panel. The list and form screens are built from this, so a new
// section only needs an entry here. Admin screens are for the team only and are English only by design.

export type LocalizedValue = { en: string; bn: string };

export type Block =
  | { type: 'heading'; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'image'; src: string; alt?: string };

type Row = Record<string, unknown>;

interface BaseField {
  name: string;
  label: string;
  hint?: string;
  required?: boolean;
  // Only shown, and only saved, when this returns true
  showIf?: (values: Row) => boolean;
}

export type Field = BaseField &
  (
    | { type: 'text' | 'textarea' | 'email' | 'number' | 'date' | 'checkbox' | 'image' | 'video' | 'blocks' | 'features' | 'readonly' }
    | { type: 'password' }
    // suggestions: offered while typing; picking one also fills an empty Bangla box
    | { type: 'localized' | 'localizedTextarea'; suggestions?: LocalizedValue[] }
    | { type: 'select'; options: { value: string; label: string }[] }
    | { type: 'slug'; from: string }
  );

export interface Section {
  title: string;
  description?: string;
  fields: Field[];
}

export interface Resource {
  key: string;
  label: string;
  singular: string;
  description: string;
  apiPath: string;
  listPath: string;
  group: 'Content' | 'Website' | 'Leads' | 'Settings';
  sortable: boolean;
  canCreate: boolean;
  canDelete: boolean;
  adminOnly?: boolean;
  sections: Section[];
  rowTitle: (row: Row) => string;
  rowSubtitle: (row: Row) => string;
  rowImage?: (row: Row) => string | null;
  rowBadge?: (row: Row) => string | null;
  // The public page for this record, opened from the list
  publicHref?: (row: Row) => string;
}

const en = (value: unknown) => (value as LocalizedValue | null)?.en ?? '';
const text = (value: unknown) => (typeof value === 'string' ? value : '');

const visibility: Field = { name: 'isActive', label: 'Show on website', type: 'checkbox', hint: 'Turn off to hide this without deleting it.' };

export const RESOURCES: Resource[] = [
  {
    key: 'projects',
    label: 'Projects',
    singular: 'Project',
    description: 'Completed client work. Each project gets its own page on the website.',
    apiPath: '/projects',
    listPath: '/projects/all',
    group: 'Content',
    sortable: true,
    canCreate: true,
    canDelete: true,
    rowTitle: (row) => text(row.name),
    rowSubtitle: (row) => [en(row.category), text(row.client)].filter(Boolean).join(' · '),
    rowImage: (row) => text(row.image),
    rowBadge: (row) => (row.isFeatured ? 'Featured' : null),
    publicHref: (row) => `/en/project/${text(row.slug)}`,
    sections: [
      {
        title: 'Basics',
        fields: [
          { name: 'name', label: 'Project name', type: 'text', required: true },
          { name: 'slug', label: 'Page address', type: 'slug', from: 'name', required: true, hint: 'Used in the link: /project/this-text' },
          { name: 'category', label: 'Category', type: 'localized', required: true, hint: 'Shown on the card. For example: E-commerce Website' },
          { name: 'image', label: 'Project image', type: 'image', required: true, hint: 'Square works best, at least 800 × 800 px.' },
        ],
      },
      {
        title: 'Project Info',
        description: 'The card beside the project details. Anything left empty is not shown.',
        fields: [
          { name: 'client', label: 'Client', type: 'text' },
          { name: 'budget', label: 'Budget', type: 'localized' },
          { name: 'location', label: 'Location', type: 'localized' },
          { name: 'sector', label: 'Sector', type: 'localized' },
          { name: 'completedAt', label: 'Completed on', type: 'date' },
        ],
      },
      {
        title: 'Project Details',
        description: 'The article on the project page: overview, challenge, solution and so on.',
        fields: [{ name: 'content', label: 'Content', type: 'blocks' }],
      },
      {
        title: 'Visibility',
        fields: [{ name: 'isFeatured', label: 'Show in Featured Projects', type: 'checkbox', hint: 'Adds it to the moving row on the homepage.' }, visibility],
      },
    ],
  },
  {
    key: 'testimonials',
    label: 'Customer Reviews',
    singular: 'Review',
    description: 'Video reviews and screenshots of client messages.',
    apiPath: '/testimonials',
    listPath: '/testimonials/all',
    group: 'Content',
    sortable: true,
    canCreate: true,
    canDelete: true,
    rowTitle: (row) => text(row.name),
    rowSubtitle: (row) => en(row.role),
    rowImage: (row) => text(row.image),
    rowBadge: (row) => (row.kind === 'VIDEO' ? 'Video' : 'Screenshot'),
    sections: [
      {
        title: 'Review',
        fields: [
          {
            name: 'kind',
            label: 'Type',
            type: 'select',
            required: true,
            options: [
              { value: 'VIDEO', label: 'Video review' },
              { value: 'RESULT', label: 'Client message screenshot' },
            ],
          },
          {
            name: 'videoUrl',
            label: 'Video',
            type: 'video',
            required: true,
            showIf: (values) => values.kind === 'VIDEO',
            hint: 'Upload an MP4 or WebM file of up to 300 MB, or paste a link to a video file.',
          },
          { name: 'image', label: 'Cover image or screenshot', type: 'image', required: true, hint: 'Shown on the card. For a video, this is the picture before it plays.' },
        ],
      },
      {
        title: 'Customer',
        fields: [
          { name: 'name', label: 'Customer name', type: 'text', required: true },
          { name: 'role', label: 'Role or business', type: 'localized', required: true, hint: 'For example: Supermarket Owner' },
          { name: 'avatar', label: 'Photo or logo', type: 'image' },
        ],
      },
      { title: 'Visibility', fields: [visibility] },
    ],
  },
  {
    key: 'case-studies',
    label: 'Case Studies',
    singular: 'Case Study',
    description: 'Longer articles, linked from the Featured Projects section.',
    apiPath: '/case-studies',
    listPath: '/case-studies/all',
    group: 'Content',
    sortable: true,
    canCreate: true,
    canDelete: true,
    rowTitle: (row) => en(row.title),
    rowSubtitle: (row) => en(row.category),
    rowImage: (row) => text(row.image),
    publicHref: (row) => `/en/case-studies/${text(row.slug)}`,
    sections: [
      {
        title: 'Basics',
        fields: [
          { name: 'title', label: 'Title', type: 'localized', required: true },
          { name: 'slug', label: 'Page address', type: 'slug', from: 'title', required: true, hint: 'Used in the link: /case-studies/this-text' },
          { name: 'category', label: 'Category', type: 'localized', required: true },
          { name: 'image', label: 'Cover image', type: 'image', required: true },
          { name: 'publishedAt', label: 'Published on', type: 'date' },
        ],
      },
      { title: 'Article', fields: [{ name: 'content', label: 'Content', type: 'blocks', required: true }] },
      { title: 'Visibility', fields: [visibility] },
    ],
  },
  {
    key: 'blog-posts',
    label: 'Blog',
    singular: 'Post',
    description: 'Articles for the Blog pages. Drafts written in AI Studio land here for review. Only published posts appear on the website.',
    apiPath: '/blog-posts',
    listPath: '/blog-posts/all',
    group: 'Content',
    sortable: false,
    canCreate: true,
    canDelete: true,
    rowTitle: (row) => en(row.title),
    rowSubtitle: (row) => [row.status === 'PUBLISHED' ? 'Published' : 'Draft', row.aiGenerated ? 'Written with AI' : '', text(row.tags)].filter(Boolean).join(' · '),
    rowImage: (row) => text(row.cover) || null,
    rowBadge: (row) => (row.status === 'PUBLISHED' ? null : 'Draft'),
    publicHref: (row) => `/en/blog/${text(row.slug)}`,
    sections: [
      {
        title: 'Basics',
        description: 'Bangla is optional. Without it, Bangla readers see the English text.',
        fields: [
          { name: 'title', label: 'Title', type: 'localized', required: true },
          { name: 'slug', label: 'Page address', type: 'slug', from: 'title', required: true, hint: 'Used in the link: /blog/this-text' },
          { name: 'excerpt', label: 'Short summary', type: 'localizedTextarea', hint: 'Shown on the blog list. One or two sentences.' },
          { name: 'cover', label: 'Cover picture', type: 'image', hint: 'Wide, at least 1200 × 675 px.' },
          { name: 'coverAlt', label: 'Cover picture description', type: 'localized', hint: 'For screen readers and search engines. Describe what the picture shows.' },
          { name: 'tags', label: 'Topics', type: 'text', hint: 'Separated by commas, for example: website, seo, speed' },
        ],
      },
      { title: 'Article', fields: [{ name: 'content', label: 'Content', type: 'blocks', required: true }] },
      {
        title: 'Search Engines',
        description: 'Leave empty to use the title and the short summary.',
        fields: [
          { name: 'seoTitle', label: 'Search title', type: 'localized', hint: 'At most about 60 characters.' },
          { name: 'seoDescription', label: 'Search description', type: 'localizedTextarea', hint: 'At most about 155 characters.' },
        ],
      },
      {
        title: 'Publishing',
        fields: [
          {
            name: 'status',
            label: 'Status',
            type: 'select',
            required: true,
            options: [
              { value: 'DRAFT', label: 'Draft: only visible here' },
              { value: 'PUBLISHED', label: 'Published: visible on the website' },
            ],
          },
          { name: 'publishedAt', label: 'Publish date', type: 'date', hint: 'Empty means today when you publish. A future date keeps the post hidden until then.' },
          { name: 'authorName', label: 'Author', type: 'text' },
        ],
      },
    ],
  },
  {
    key: 'products',
    label: 'Products',
    singular: 'Product',
    description: 'Software, templates and tools listed on the Products page.',
    apiPath: '/products',
    listPath: '/products/all',
    group: 'Content',
    sortable: true,
    canCreate: true,
    canDelete: true,
    rowTitle: (row) => en(row.name),
    rowSubtitle: (row) => en(row.summary),
    rowImage: (row) => text(row.image),
    publicHref: () => '/en/products',
    sections: [
      {
        title: 'Basics',
        fields: [
          { name: 'name', label: 'Name', type: 'localized', required: true },
          { name: 'slug', label: 'Identifier', type: 'slug', from: 'name', required: true },
          { name: 'summary', label: 'Summary', type: 'localizedTextarea', required: true },
          { name: 'image', label: 'Image', type: 'image', required: true },
          {
            name: 'type',
            label: 'Type',
            type: 'select',
            required: true,
            options: [
              { value: 'laravel-software', label: 'Laravel Software' },
              { value: 'website-template', label: 'Website Template' },
              { value: 'plugin', label: 'Plugin' },
              { value: 'web-tool', label: 'Web Tool' },
              { value: 'custom-software', label: 'Custom Software' },
              { value: 'business-website', label: 'Business Website' },
            ],
          },
          {
            name: 'category',
            label: 'Category',
            type: 'select',
            required: true,
            options: [
              { value: 'e-commerce', label: 'E-commerce' },
              { value: 'business-corporate', label: 'Business & Corporate' },
              { value: 'marketing-automation', label: 'Marketing & Automation' },
              { value: 'management-systems', label: 'Management Systems' },
              { value: 'developer-tools', label: 'Developer Tools' },
            ],
          },
        ],
      },
      {
        title: 'Price And Link',
        fields: [
          {
            name: 'pricing',
            label: 'Pricing',
            type: 'select',
            required: true,
            options: [
              { value: 'PAID', label: 'Paid' },
              { value: 'FREE', label: 'Free' },
              { value: 'CONTACT', label: 'Contact for price' },
            ],
          },
          { name: 'price', label: 'Price in USD', type: 'number', showIf: (values) => values.pricing === 'PAID' },
          { name: 'url', label: 'Product link', type: 'text', hint: 'Optional. Without a link, the card asks visitors to contact you.' },
        ],
      },
      {
        title: 'Visibility',
        fields: [
          { name: 'isFeatured', label: 'Featured', type: 'checkbox', hint: 'Listed first.' },
          visibility,
        ],
      },
    ],
  },
  {
    key: 'services',
    label: 'Services',
    singular: 'Service',
    description: 'The services listed on the homepage and in the inquiry form.',
    apiPath: '/services',
    listPath: '/services/all',
    group: 'Website',
    sortable: true,
    canCreate: true,
    canDelete: true,
    rowTitle: (row) => en(row.title),
    rowSubtitle: (row) => en(row.description),
    rowImage: (row) => text(row.image),
    publicHref: (row) => `/en/services/${text(row.slug)}`,
    sections: [
      {
        title: 'Service',
        fields: [
          { name: 'title', label: 'Title', type: 'localized', required: true },
          { name: 'slug', label: 'Short name', type: 'slug', from: 'title', required: true },
          { name: 'description', label: 'Description', type: 'localizedTextarea', required: true },
          { name: 'image', label: 'Image', type: 'image', required: true },
        ],
      },
      {
        title: 'Detail Page',
        description: 'Shown when a visitor opens this service. Images in the content appear side by side at the end.',
        fields: [
          { name: 'content', label: 'Content', type: 'blocks' },
          { name: 'faqs', label: 'Questions', type: 'blocks', hint: 'Add a heading for each question and a paragraph for its answer.' },
        ],
      },
      { title: 'Visibility', fields: [visibility] },
    ],
  },
  {
    key: 'technologies',
    label: 'Technologies',
    singular: 'Technology',
    description: 'The moving technology cards on the homepage. Add, remove, hide or reorder them.',
    apiPath: '/technologies',
    listPath: '/technologies/all',
    group: 'Website',
    sortable: true,
    canCreate: true,
    canDelete: true,
    rowTitle: (row) => text(row.name),
    rowSubtitle: (row) => en(row.description),
    rowImage: (row) => text(row.logo),
    sections: [
      {
        title: 'Technology',
        fields: [
          { name: 'name', label: 'Name', type: 'text', required: true },
          { name: 'description', label: 'Short description', type: 'localizedTextarea', required: true },
          { name: 'logo', label: 'Logo', type: 'image', required: true, hint: 'Square, on a transparent or white background.' },
        ],
      },
      { title: 'Visibility', fields: [visibility] },
    ],
  },
  {
    key: 'hero-backgrounds',
    label: 'Hero Background',
    singular: 'Background',
    description: 'Optional. With none, the homepage shows its plain background. Upload an image to show it behind the first screen; the first visible one is used.',
    apiPath: '/hero-backgrounds',
    listPath: '/hero-backgrounds/all',
    group: 'Website',
    sortable: true,
    canCreate: true,
    canDelete: true,
    rowTitle: (row) => text(row.name),
    rowSubtitle: () => 'Homepage hero',
    rowImage: (row) => text(row.image),
    sections: [
      {
        title: 'Background',
        description: 'The website softens the image with a veil in the colour of each theme, so the heading stays easy to read.',
        fields: [
          { name: 'name', label: 'Name', type: 'text', required: true, hint: 'For your own reference. Not shown on the website.' },
          { name: 'image', label: 'Image', type: 'image', required: true, hint: 'Wide, at least 2400 × 1350 px. Busy or bright images work too.' },
        ],
      },
      { title: 'Visibility', fields: [visibility] },
    ],
  },
  {
    key: 'pricing-plans',
    label: 'Pricing',
    singular: 'Plan',
    description: 'The plans in the pricing section.',
    apiPath: '/pricing-plans',
    listPath: '/pricing-plans/all',
    group: 'Website',
    sortable: true,
    canCreate: true,
    canDelete: true,
    rowTitle: (row) => en(row.name),
    rowSubtitle: (row) => `${text(row.currency)} ${String(row.price ?? '')}`,
    rowBadge: (row) => (row.isFeatured ? 'Highlighted' : null),
    sections: [
      {
        title: 'Plan',
        fields: [
          { name: 'name', label: 'Name', type: 'localized', required: true },
          { name: 'slug', label: 'Short name', type: 'slug', from: 'name', required: true },
          { name: 'tagline', label: 'Tagline', type: 'localized', required: true },
          { name: 'badge', label: 'Badge', type: 'localized', hint: 'Optional. For example: Most Popular' },
          { name: 'price', label: 'Price', type: 'number', required: true },
          { name: 'currency', label: 'Currency', type: 'text', required: true, hint: 'Three letters: USD, BDT' },
          { name: 'priceLabel', label: 'Beside the price', type: 'localized', hint: 'Optional. For example: Starting, One-time, /month' },
          { name: 'buttonLabel', label: 'Button text', type: 'localized', hint: 'Optional. Leave empty for Book A Meeting.' },
        ],
      },
      { title: 'What This Plan Offers', description: 'One line each, shown with a tick.', fields: [{ name: 'features', label: 'Features', type: 'features', required: true }] },
      { title: 'Note', fields: [{ name: 'note', label: 'Small note at the foot of the card', type: 'localizedTextarea', hint: 'Optional. For example: Domain and hosting are quoted separately.' }] },
      {
        title: 'Visibility',
        fields: [{ name: 'isFeatured', label: 'Highlight this plan', type: 'checkbox' }, visibility],
      },
    ],
  },
  {
    key: 'faqs',
    label: 'FAQs',
    singular: 'FAQ',
    description: 'Questions and answers on the homepage.',
    apiPath: '/faqs',
    listPath: '/faqs/all',
    group: 'Website',
    sortable: true,
    canCreate: true,
    canDelete: true,
    rowTitle: (row) => en(row.question),
    rowSubtitle: (row) => en(row.answer),
    sections: [
      {
        title: 'Question',
        fields: [
          { name: 'question', label: 'Question', type: 'localized', required: true },
          { name: 'answer', label: 'Answer', type: 'localizedTextarea', required: true },
        ],
      },
      { title: 'Visibility', fields: [visibility] },
    ],
  },
  {
    key: 'team',
    label: 'Team',
    singular: 'Team Member',
    description: 'The people shown in the team section.',
    apiPath: '/team',
    listPath: '/team/all',
    group: 'Website',
    sortable: true,
    canCreate: true,
    canDelete: true,
    rowTitle: (row) => en(row.name),
    rowSubtitle: (row) => en(row.role),
    rowImage: (row) => text(row.photo),
    sections: [
      {
        title: 'Team Member',
        fields: [
          { name: 'name', label: 'Name', type: 'localized', required: true },
          { name: 'role', label: 'Role', type: 'localized', required: true },
          { name: 'photo', label: 'Photo', type: 'image', required: true },
        ],
      },
      { title: 'Visibility', fields: [visibility] },
    ],
  },
  {
    key: 'clients',
    label: 'Client Logos',
    singular: 'Client Logo',
    description: 'The logo row near the top of the homepage.',
    apiPath: '/clients',
    listPath: '/clients/all',
    group: 'Website',
    sortable: true,
    canCreate: true,
    canDelete: true,
    rowTitle: (row) => text(row.name),
    rowSubtitle: (row) => text(row.url),
    rowImage: (row) => text(row.logo),
    sections: [
      {
        title: 'Client',
        fields: [
          { name: 'name', label: 'Name', type: 'text', required: true },
          { name: 'logo', label: 'Logo', type: 'image', required: true },
          { name: 'url', label: 'Website', type: 'text', hint: 'Optional. A full address starting with https://' },
        ],
      },
      { title: 'Visibility', fields: [visibility] },
    ],
  },
  {
    key: 'outcome-cards',
    label: 'Outcome Cards',
    singular: 'Card',
    description: 'The stacking cards above Customer Reviews on the homepage.',
    apiPath: '/outcome-cards',
    listPath: '/outcome-cards/all',
    group: 'Website',
    sortable: true,
    canCreate: true,
    canDelete: true,
    rowTitle: (row) => en(row.title),
    rowSubtitle: (row) => en(row.eyebrow),
    rowImage: (row) => text(row.image),
    sections: [
      {
        title: 'Card',
        fields: [
          { name: 'eyebrow', label: 'Small label', type: 'localized', hint: 'Optional. Stays visible when the next card stacks on top. For example: Growth' },
          { name: 'title', label: 'Title', type: 'localized', required: true },
          { name: 'description', label: 'Text', type: 'localizedTextarea', required: true },
          { name: 'image', label: 'Image', type: 'image', required: true, hint: 'Nearly square works best, at least 800 × 800 px.' },
        ],
      },
      { title: 'Points', description: 'Optional short lines under the text. Four fit best.', fields: [{ name: 'points', label: 'Points', type: 'features' }] },
      {
        title: 'Button',
        description: 'Shown only when both are filled in.',
        fields: [
          { name: 'buttonLabel', label: 'Button text', type: 'localized' },
          { name: 'buttonUrl', label: 'Button link', type: 'text', hint: 'A section (#contact), a page (/contact) or a full address starting with https://' },
        ],
      },
      { title: 'Visibility', fields: [visibility] },
    ],
  },
  {
    key: 'delivery-stories',
    label: 'Delivery Stories',
    singular: 'Story',
    description: 'The photos that move right to left in the Delivery Stories section. Add as many as you like.',
    apiPath: '/delivery-stories',
    listPath: '/delivery-stories/all',
    group: 'Website',
    sortable: true,
    canCreate: true,
    canDelete: true,
    rowTitle: (row) => en(row.title),
    rowSubtitle: (row) => en(row.caption),
    rowImage: (row) => text(row.image),
    sections: [
      {
        title: 'Story',
        fields: [
          { name: 'title', label: 'Title', type: 'localized', required: true },
          { name: 'caption', label: 'Caption', type: 'localizedTextarea', required: true },
          { name: 'image', label: 'Image', type: 'image', required: true },
        ],
      },
      { title: 'Visibility', fields: [visibility] },
    ],
  },
  {
    key: 'inquiries',
    label: 'Inquiries',
    singular: 'Inquiry',
    description: 'Messages from the website contact form.',
    apiPath: '/inquiries',
    listPath: '/inquiries',
    group: 'Leads',
    sortable: false,
    canCreate: false,
    canDelete: false,
    // The contact form only requires an email, so a name may be missing
    rowTitle: (row) => text(row.name) || text(row.email),
    rowSubtitle: (row) => [text(row.email), text(row.phone)].filter(Boolean).join(' · '),
    rowBadge: (row) => text(row.status),
    sections: [
      {
        title: 'Message',
        fields: [
          { name: 'name', label: 'Name', type: 'readonly' },
          { name: 'email', label: 'Email', type: 'readonly' },
          { name: 'phone', label: 'Phone', type: 'readonly' },
          { name: 'company', label: 'Company', type: 'readonly' },
          { name: 'service', label: 'Service', type: 'readonly' },
          { name: 'budget', label: 'Estimated budget', type: 'readonly' },
          { name: 'country', label: 'Country', type: 'readonly' },
          { name: 'existingWebsite', label: 'Existing website', type: 'readonly' },
          { name: 'message', label: 'Message', type: 'readonly' },
        ],
      },
      {
        title: 'Follow-up',
        fields: [
          {
            name: 'status',
            label: 'Status',
            type: 'select',
            required: true,
            options: [
              { value: 'NEW', label: 'New' },
              { value: 'CONTACTED', label: 'Contacted' },
              { value: 'CLOSED', label: 'Closed' },
            ],
          },
          { name: 'notes', label: 'Notes', type: 'textarea', hint: 'Only visible to the team.' },
        ],
      },
    ],
  },
  {
    key: 'users',
    label: 'Users',
    singular: 'User',
    description: 'Who can log in here. Editors can change content but not manage users.',
    apiPath: '/users',
    listPath: '/users',
    group: 'Settings',
    sortable: false,
    canCreate: true,
    canDelete: true,
    adminOnly: true,
    rowTitle: (row) => text(row.name),
    rowSubtitle: (row) => text(row.email),
    rowBadge: (row) => (row.role === 'ADMIN' ? 'Admin' : 'Editor'),
    sections: [
      {
        title: 'User',
        fields: [
          { name: 'name', label: 'Name', type: 'text', required: true },
          { name: 'email', label: 'Email', type: 'email', required: true },
          { name: 'password', label: 'Password', type: 'password', hint: 'At least 10 characters. When editing, leave empty to keep the current one.' },
          {
            name: 'role',
            label: 'Role',
            type: 'select',
            required: true,
            options: [
              { value: 'EDITOR', label: 'Editor' },
              { value: 'ADMIN', label: 'Admin' },
            ],
          },
          { name: 'isActive', label: 'Can log in', type: 'checkbox' },
        ],
      },
    ],
  },
];

export const getResource = (key: string) => RESOURCES.find((resource) => resource.key === key);

const NEW_DEFAULTS: Record<string, Row> = {
  testimonials: { kind: 'VIDEO' },
  'pricing-plans': { currency: 'USD' },
  users: { role: 'EDITOR', isActive: true },
};

const EMPTY_BY_TYPE = (field: Field): unknown => {
  switch (field.type) {
    case 'localized':
    case 'localizedTextarea':
      return { en: '', bn: '' };
    case 'blocks':
      return { en: [], bn: [] };
    case 'features':
      return [];
    case 'checkbox':
      return field.name === 'isActive';
    case 'select':
      return field.options[0]?.value ?? '';
    default:
      return '';
  }
};

const allFields = (resource: Resource) => resource.sections.flatMap((section) => section.fields);

// Saving copies English into an empty Bangla box. Showing that copy as empty again means a later change
// to the English text also reaches the Bangla site, instead of leaving an old copy behind.
const showOwnBangla = ({ en: english, bn }: LocalizedValue): LocalizedValue => ({ en: english, bn: bn === english ? '' : bn });

// Turns a stored record into what the form edits
export const toFormValues = (resource: Resource, row?: Row): Row => {
  const values: Row = {};
  for (const field of allFields(resource)) {
    const stored = row?.[field.name] ?? (row ? undefined : NEW_DEFAULTS[resource.key]?.[field.name]);
    if (stored === undefined || stored === null) {
      values[field.name] = EMPTY_BY_TYPE(field);
    } else if (field.type === 'date') {
      values[field.name] = String(stored).slice(0, 10);
    } else if (field.type === 'localized' || field.type === 'localizedTextarea') {
      values[field.name] = showOwnBangla(stored as LocalizedValue);
    } else if (field.type === 'features') {
      values[field.name] = (stored as LocalizedValue[]).map(showOwnBangla);
    } else if (field.type === 'blocks') {
      const blocks = stored as Partial<Record<'en' | 'bn', Block[]>>;
      values[field.name] = { en: blocks.en ?? [], bn: blocks.bn ?? [] };
    } else {
      values[field.name] = stored;
    }
  }
  return values;
};

const cleanBlocks = (blocks: Block[]) =>
  blocks
    .map((block): Block =>
      block.type === 'list'
        ? { type: 'list', items: block.items.map((item) => item.trim()).filter(Boolean) }
        : block.type === 'image'
          ? block
          : { type: block.type, text: block.text.trim() },
    )
    .filter((block) => (block.type === 'list' ? block.items.length > 0 : block.type === 'image' ? Boolean(block.src) : Boolean(block.text)));

const isEmptyValue = (value: unknown) => value === null || value === undefined || value === '';

export interface FormResult {
  payload: Row;
  errors: Record<string, string>;
}

// Turns form values into what the API accepts, and catches missing required fields before sending
export const toPayload = (resource: Resource, values: Row, isNew: boolean): FormResult => {
  const payload: Row = {};
  const errors: Record<string, string> = {};

  for (const field of allFields(resource)) {
    if (field.type === 'readonly') continue;
    if (field.showIf && !field.showIf(values)) {
      // A review changed from video to screenshot should not keep its old video
      if (field.type === 'video') payload[field.name] = null;
      continue;
    }

    const value = values[field.name];
    const missing = `${field.label} is required`;

    switch (field.type) {
      case 'localized':
      case 'localizedTextarea': {
        const { en: english, bn } = value as LocalizedValue;
        const enText = english.trim();
        const bnText = bn.trim();
        if (!enText && !bnText) {
          if (field.required) errors[field.name] = missing;
          else payload[field.name] = null;
        } else {
          // English alone is enough: the Bangla site then shows the English text
          payload[field.name] = { en: enText || bnText, bn: bnText || enText };
        }
        break;
      }
      case 'blocks': {
        const blocks = value as Record<'en' | 'bn', Block[]>;
        const english = cleanBlocks(blocks.en);
        const bangla = cleanBlocks(blocks.bn);
        if (english.length === 0) {
          if (field.required) errors[field.name] = 'Add at least one block in English';
          else if (bangla.length > 0) errors[field.name] = 'Add the English version first';
          else payload[field.name] = null;
        } else {
          payload[field.name] = bangla.length > 0 ? { en: english, bn: bangla } : { en: english };
        }
        break;
      }
      case 'features': {
        const rows = (value as LocalizedValue[])
          .map((row) => ({ en: row.en.trim(), bn: row.bn.trim() }))
          .filter((row) => row.en || row.bn)
          .map((row) => ({ en: row.en || row.bn, bn: row.bn || row.en }));
        if (rows.length === 0) errors[field.name] = 'Add at least one feature';
        else payload[field.name] = rows;
        break;
      }
      case 'number':
        if (isEmptyValue(value)) errors[field.name] = missing;
        else payload[field.name] = Number(value);
        break;
      case 'date':
        payload[field.name] = value ? `${String(value)}T00:00:00.000Z` : null;
        break;
      case 'checkbox':
        payload[field.name] = Boolean(value);
        break;
      case 'password':
        if (value) payload[field.name] = value;
        else if (isNew) errors[field.name] = missing;
        break;
      default: {
        const trimmed = String(value ?? '').trim();
        if (trimmed) payload[field.name] = trimmed;
        else if (field.required) errors[field.name] = missing;
        else payload[field.name] = null;
      }
    }
  }
  return { payload, errors };
};

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 150);
