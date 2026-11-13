import type { Locale } from '@/i18n/config';

// The Pricing page's lists, edited under Pricing Page in the admin panel. Until the first save the site shows these.
// They describe only what the site already promises elsewhere (the plans, the process and the FAQ).

type Localized = { en: string; bn: string };

export interface PricingPageSettings {
  included: Localized[];
  steps: { title: Localized; text: Localized }[];
  extras: Localized[];
}

export const DEFAULT_PRICING_PAGE: PricingPageSettings = {
  included: [
    { en: 'Free consultation call', bn: 'ফ্রি কনসালটেশন কল' },
    { en: 'Clear plan, scope and cost before work starts', bn: 'কাজ শুরুর আগে স্পষ্ট পরিকল্পনা, পরিধি ও খরচ' },
    { en: 'Mobile-friendly, responsive design', bn: 'মোবাইল-ফ্রেন্ডলি, রেসপনসিভ ডিজাইন' },
    { en: 'SEO-ready structure', bn: 'SEO-উপযোগী কাঠামো' },
    { en: 'Post-launch support', bn: 'লঞ্চের পর সাপোর্ট' },
  ],
  steps: [
    {
      title: { en: 'Free Strategy Call', bn: 'ফ্রি স্ট্র্যাটেজি কল' },
      text: { en: 'We learn about your business and goals in a short call. There is no obligation.', bn: 'ছোট একটি কলে আপনার ব্যবসা ও লক্ষ্য বুঝে নিই। কোনো বাধ্যবাধকতা নেই।' },
    },
    {
      title: { en: 'Clear Plan & Quote', bn: 'স্পষ্ট পরিকল্পনা ও কোটেশন' },
      text: { en: 'You get a clear plan, scope, cost and timeline, confirmed before any work starts.', bn: 'কাজ শুরুর আগেই স্পষ্ট পরিকল্পনা, পরিধি, খরচ আর সময়সীমা নিশ্চিত করে দিই।' },
    },
    {
      title: { en: 'Design & Build', bn: 'ডিজাইন ও ডেভেলপমেন্ট' },
      text: {
        en: 'Once you approve the plan, we design and develop your solution, keep you updated, and revise within scope.',
        bn: 'পরিকল্পনা অনুমোদনের পর ডিজাইন ও ডেভেলপ করি, নিয়মিত আপডেট দিই, আর স্কোপের মধ্যে রিভিশন করি।',
      },
    },
    {
      title: { en: 'Launch & Support', bn: 'লঞ্চ ও সাপোর্ট' },
      text: { en: 'We launch, make sure everything works, and stay with you through post-launch support.', bn: 'লঞ্চ করি, সব ঠিকঠাক চলছে কিনা দেখি, আর লঞ্চের পরও সাপোর্ট দিই।' },
    },
  ],
  extras: [
    { en: 'Custom Website Design', bn: 'কাস্টম ওয়েবসাইট ডিজাইন' },
    { en: 'E-commerce Stores', bn: 'ই-কমার্স স্টোর' },
    { en: 'Website Speed & SEO Optimization', bn: 'ওয়েবসাইট স্পিড ও SEO অপটিমাইজেশন' },
    { en: 'Landing Pages', bn: 'ল্যান্ডিং পেজ' },
    { en: 'WordPress Websites', bn: 'WordPress ওয়েবসাইট' },
    { en: 'WooCommerce Stores', bn: 'WooCommerce স্টোর' },
    { en: 'Shopify Stores', bn: 'Shopify স্টোর' },
    { en: 'Webflow Websites', bn: 'Webflow ওয়েবসাইট' },
    { en: 'Laravel Web Applications', bn: 'Laravel ওয়েব অ্যাপ্লিকেশন' },
    { en: 'Next.js & React Websites', bn: 'Next.js ও React ওয়েবসাইট' },
    { en: 'Custom Business Software', bn: 'কাস্টম বিজনেস সফটওয়্যার' },
    { en: 'AI Customer Support & Chatbots', bn: 'AI কাস্টমার সাপোর্ট ও চ্যাটবট' },
    { en: 'Lead Qualification & Smart Replies', bn: 'লিড কোয়ালিফিকেশন ও স্মার্ট রিপ্লাই' },
    { en: 'Booking & Inquiry Automation', bn: 'বুকিং ও ইনকোয়ারি অটোমেশন' },
    { en: 'Sales & Campaign Tracking', bn: 'সেলস ও ক্যাম্পেইন ট্র্যাকিং' },
    { en: 'Website Maintenance & Support', bn: 'ওয়েবসাইট মেইনটেন্যান্স ও সাপোর্ট' },
  ],
};

const pick = (value: Localized, locale: Locale) => value[locale] || value.en;

export const localizePricingPage = (settings: PricingPageSettings, locale: Locale) => ({
  included: settings.included.map((item) => pick(item, locale)),
  steps: settings.steps.map((step) => ({ title: pick(step.title, locale), text: pick(step.text, locale) })),
  extras: settings.extras.map((item) => pick(item, locale)),
});
