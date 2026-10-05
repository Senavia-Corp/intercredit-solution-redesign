// Generates the internal pages into dist/. Layouts follow the Stitch project
// "InterCredit Solution Homepage Redesign"; content comes only from verified sources
// (current site copy, exported CMS, literal legal text, real photos). Run: npm run build:pages
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

const PHONE = '(786) 220-5838';
const PHONE_HREF = 'tel:+17862205838';
const TOLL_FREE = '1-888-224-2076';
const TOLL_FREE_HREF = 'tel:+18882242076';
const EMAIL = 'intercreditsolutions@gmail.com';
const ADDRESS = '13590 SW 134th Ave, Suite 203, Miami, FL 33186';
const MAP_HREF = 'https://www.google.com/maps/search/?api=1&query=13590+SW+134th+Ave+Suite+203+Miami+FL+33186';
// Google Maps. This is a browser key: it is visible to every visitor by design, so it must be restricted in
// Google Cloud to this site's domains (HTTP referrers) and to the Maps Embed API only.
const MAPS_KEY = 'AIzaSyCxwsW4Z0-822FOReEvxm4PgooiI_je4l4';
const PLACE_ID = 'ChIJI1GYFL-52YgRWzvybUaloZg';
const DIRECTIONS_HREF = `https://www.google.com/maps/dir/?api=1&destination=13590+SW+134th+Ave+Suite+203+Miami+FL+33186&destination_place_id=${PLACE_ID}`;
const officeMap = () => `<div data-reveal class="relative overflow-hidden rounded-card-lg border border-border-light bg-white shadow-xl">
<div class="h-1 brand-gradient-line"></div>
<iframe class="block w-full h-[360px] sm:h-[440px]" title="Map showing the InterCredit Solution office at ${ADDRESS}" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen src="https://www.google.com/maps/embed/v1/place?key=${MAPS_KEY}&amp;q=place_id:${PLACE_ID}&amp;zoom=15"></iframe>
<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6">
<p class="flex items-start gap-3 text-sm text-text-secondary"><span aria-hidden="true" class="material-symbols-outlined text-[20px] text-teal-600">location_on</span><span><strong class="block text-ink-950">InterCredit Solution</strong>${ADDRESS}</span></p>
<a class="brand-gradient-btn inline-flex shrink-0 min-h-[48px] items-center justify-center gap-2 px-6 rounded-btn text-ink-950 font-bold text-xs uppercase tracking-wider shadow-sm" href="${DIRECTIONS_HREF}" rel="noopener" target="_blank"><span>Get directions</span><span aria-hidden="true" class="material-symbols-outlined icon-nudge text-[16px]">arrow_forward</span></a>
</div>
</div>`;
const HOURS = 'Monday–Friday, 9:00 AM–5:00 PM EST';

const esc = (text) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const icon = (name, classes = '') => `<span aria-hidden="true" class="material-symbols-outlined ${classes}">${name}</span>`;
const arrow = icon('arrow_forward', 'icon-nudge text-[16px]');
// Service pictogram (the client's own icon set), coloured by CSS; see .svc-icon.
const svcIcon = (slug, classes = '') => `<span aria-hidden="true" class="svc-icon ${classes}" style="--icon:url('/assets/icons/${slug === 'debts-negotiation' ? 'debts-negotiation' : slug}.svg')"></span>`;
const svcTile = (slug) => `<span class="service-icon" aria-hidden="true">${svcIcon(slug)}</span>`;

// ---------- Content ----------

const chapters = [
  { n: '01', id: 'improve-my-credit', name: 'Improve My Credit', blurb: 'Understand what may be affecting your credit profile and explore a personalized strategy for addressing eligible issues and building stronger habits.' },
  { n: '02', id: 'resolve-my-debt', name: 'Resolve My Debt', blurb: 'Review debt and collection challenges, understand what may be negotiable, and discuss the options that fit your situation.' },
  { n: '03', id: 'protect-and-understand', name: 'Protect & Understand My Credit', blurb: 'Get more clarity around your credit report, monitoring, fraud concerns, and the information that can affect your financial profile.' },
  { n: '04', id: 'build-credit-in-the-us', name: 'Build Credit in the U.S.', blurb: 'Navigate the U.S. credit system with guidance designed for international investors and people establishing a U.S. credit profile.' },
];

const stages = ['Understand', 'Correct', 'Resolve', 'Protect', 'Grow'];

// Descriptions are the current site's own service descriptions with outcome promises removed.
const services = [
  { slug: 'credit-repair', name: 'Credit Repair & Consulting', chapter: 0, stage: 1, icon: 'fact_check',
    intro: 'Personalized advice for your situation, starting with a careful look at what is affecting your credit profile.',
    body: 'Our advisors work closely with you to review your credit situation and develop a customized plan around it. You get dedicated support at each step, with a clear explanation of what applies to your case and what does not.',
    scenarios: ['Disputed charge-offs', 'Late marks', 'Duplicate files'] },
  { slug: 'update-personal-information-in-credit-bureaus', name: 'Update Personal Information in Credit Bureaus', chapter: 0, stage: 1, icon: 'manage_accounts',
    intro: 'Outdated personal information on your credit report can cause unnecessary headaches.',
    body: 'We help you update details such as your name, address, or contact information with the major credit bureaus. Keeping this information current helps you avoid report errors and miscommunication with lenders, and keeps your credit report reflective of your current status.',
    scenarios: ['Name misspellings', 'Multiple residential histories', 'Outdated contact details'] },
  { slug: 'add-existing-credit-cards-to-credit-history', name: 'Add Existing Credit Cards to Credit History', chapter: 0, stage: 4, icon: 'history',
    intro: 'Do you have credit cards that are not contributing to your credit history?',
    body: 'We help make sure your existing credit cards are properly reflected in your credit profile, so that responsible use becomes part of the history lenders see.',
    scenarios: ['Thin files', 'New borrower files', 'Cards missing from a report'] },
  { slug: 'debts-negotiation', name: 'Debt Negotiation', chapter: 1, stage: 2, icon: 'handshake',
    intro: 'Leave the tough conversations to us.',
    body: 'Our team negotiates with creditors on your behalf, working toward better interest rates on credit cards and loans, more manageable monthly payments, and relief from past-due fees where it is possible.',
    scenarios: ['Delinquent credit cards', 'Medical accounts', 'Personal balances'] },
  { slug: 'negotiation-of-collection-accounts-in-court', name: 'Negotiation of Collection Accounts in Court', chapter: 1, stage: 2, icon: 'assignment_turned_in',
    intro: 'Stuck in a debt dispute? Let us handle the negotiation.',
    body: 'We take on collection accounts and negotiate on your behalf, so you can focus on moving forward while we handle the difficult conversations.',
    scenarios: ['Third-party collection agency demands', 'Assigned debt'] },
  { slug: 'corporate-credit-counseling', name: 'Corporate Credit Counseling', chapter: 1, stage: 2, icon: 'business_center',
    intro: 'Managing corporate credit effectively is crucial for maintaining financial stability and business growth.',
    body: 'Our Corporate Credit Counseling service is designed to help your company improve its credit profile, negotiate with creditors, and develop effective strategies for handling debt. Whether you are facing financial challenges or looking to strengthen your business credit, our team provides tailored solutions to support your goals.',
    scenarios: ['Commercial entities', 'LLC restructuring', 'Vendor terms'] },
  { slug: 'credit-monitoring-report', name: 'Credit Monitoring & Report', chapter: 2, stage: 3, icon: 'reviews',
    intro: 'Let us keep a close eye on your credit.',
    body: 'Our team monitors your credit report and the activity that could affect it, and keeps you informed so that you can act early when something changes.',
    scenarios: ['Unexpected report changes', 'Preparing for a credit application'] },
  { slug: 'fraud-alert-system', name: 'Fraud Alert Protection', chapter: 2, stage: 3, icon: 'shield',
    intro: 'Stay ahead of suspicious activity.',
    body: 'Our alert system watches for suspicious activity or potential threats involving your credit information and notifies you when something unusual appears, so you can safeguard your financial information.',
    scenarios: ['Suspicious inquiries', 'Compromised personal information'] },
  { slug: 'establishing-credit-for-foreign-investors', name: 'Establishing Credit for Foreign Investors', chapter: 3, stage: 4, icon: 'public',
    intro: 'At InterCredit, we help international investors navigate the U.S. credit system with tailored solutions.',
    body: 'We understand the unique challenges that international investors face when seeking to establish credit in the United States. Our tailored solutions and personalized support help you build a financial foundation while we help you handle the complexities of the U.S. credit system.',
    scenarios: ['International real estate buyers', 'Visa holders', 'Cross-border businesses'] },
];

const approach = [
  ['Review', 'We start with your goal, the context behind it, and the information that may be influencing your credit or debt situation.'],
  ['Strategy', 'We identify the services or actions that may apply and explain how they fit together into an actionable, realistic plan.'],
  ['Guidance', 'You move forward knowing what the next step is, what to expect, and where InterCredit can support you.'],
];

const faqs = [
  ['What happens during the initial consultation?', 'We review your situation, discuss your goals, and explain the possible next steps that may apply. The purpose is to help you understand the process before deciding how to move forward.'],
  ['How long does it take to see results?', 'Timelines vary depending on the service, complexity of the situation, third parties involved, and other individual factors. InterCredit does not promise a specific credit-score increase or fixed timeline.'],
  ['How much do your services cost?', 'Fees vary depending on the service and complexity of the situation. All costs are explained thoroughly before you make any commitment to a service.'],
  ['Do you offer payment plans?', 'Payment plan options may be available depending on the service program. You can confirm current terms and eligibility directly with an advisor during your initial consultation.'],
  ['Do I need to know which service I need before booking?', 'No. Start with your goal and situation. The 20-minute consultation is specifically designed to help clarify which options are relevant.'],
];

const team = [
  ['Jessica Sotolongo', 'CEO', 'jessica-sotolongo'],
  ['Ashley Sotolongo', 'President', 'ashley-sotolongo'],
  ['Angie Sotolongo', 'Vice President', 'angie-sotolongo'],
  ['Gabriel Murga', 'Negotiation Department', 'gabriel-murga'],
  ['Roxana Murga', 'Dispute Department', 'roxana-murga-sorrondegui'],
  ['Laura Delgado', 'Personal Credit Specialist', 'laura-delgado'],
];

// Names and headlines exactly as published in the current site's video reviews.
const stories = [
  ['Nataly', 'Excellent customer service', '0xNgJalGbg8'],
  ['Jerry L', 'Your trusted financial solutions', 'U_I_pAV_Hlk'],
  ['Sebastian N.', 'Fast and effective solutions', 'ZwkhIzVObus'],
];

// Real photography only: frames of the office video and the client's own gallery.
const servicePhotos = {
  'credit-repair': ['photo-1610', 'Jessica Sotolongo talking through a case during a consultation at her desk'],
  'update-personal-information-in-credit-bureaus': ['photo-1652', 'InterCredit team members filling in paperwork together at the front desk'],
  'add-existing-credit-cards-to-credit-history': ['photo-1615', 'Jessica Sotolongo in a consultation at the InterCredit office'],
  'debts-negotiation': ['photo-1643', 'An InterCredit advisor in conversation across the table during a consultation'],
  'negotiation-of-collection-accounts-in-court': ['photo-1636', 'An InterCredit advisor reviewing a case with a visitor at her desk'],
  'corporate-credit-counseling': ['photo-1633', 'An InterCredit advisor meeting with a visitor in a private office'],
  'credit-monitoring-report': ['photo-1646', 'InterCredit team members working at laptops at the front desk'],
  'fraud-alert-system': ['photo-1653', 'Two InterCredit team members checking documents together'],
  'establishing-credit-for-foreign-investors': ['gallery-2', 'Jessica Sotolongo beside an aircraft with the InterCredit Solution logo', 850, 638],
};

// `photo-NNNN` files come from the professional office shoot and ship in two sizes.
const photo = (file, alt, { width = 1280, height = 720, classes = '', eager = false } = {}) => {
  const pro = file.startsWith('photo-');
  const responsive = pro ? ` sizes="(min-width: 1024px) 50vw, 100vw" srcset="/assets/${file}-800.jpg 800w, /assets/${file}.jpg 1600w"` : '';
  return `<img alt="${alt}" class="w-full h-full object-cover ${classes}" ${eager ? 'fetchpriority="high"' : 'decoding="async" loading="lazy"'} height="${pro ? 900 : height}"${responsive} src="/assets/${file}.jpg" width="${pro ? 1600 : width}"/>`;
};

const framed = (file, alt, options = {}) => `<figure ${options.reveal === false ? '' : 'data-reveal '}class="rounded-card-lg overflow-hidden border border-border-light bg-white shadow-xl ${options.aspect || 'aspect-video'}">${photo(file, alt, options)}</figure>`;

// The office walkthrough video, framed like a photo. It plays muted while on screen (see site.js),
// never for visitors who prefer reduced motion, and keeps native controls so it can be paused.
const officeVideo = (label) => `<figure data-reveal class="rounded-card-lg overflow-hidden border border-border-light bg-ink-950 shadow-xl aspect-video"><video aria-label="${label}" class="w-full h-full object-cover" controls data-ambient-video loop muted playsinline poster="/assets/hero-background-poster.jpg" preload="none"><source src="/assets/hero-background.mp4" type="video/mp4"/><source src="/assets/hero-background.webm" type="video/webm"/></video></figure>`;

const heroPhoto = (file, alt, options = {}) => `<figure class="rounded-card-lg overflow-hidden border border-white/20 bg-ink-900 shadow-2xl ${options.aspect || 'aspect-video'}">${photo(file, alt, { ...options, eager: true })}</figure>`;

// Segments published on the official Despierta América YouTube channel (titles and years as published).
const segments = [
  { id: 'ojGcpgtuOIk', year: 2019, title: 'Consejos para salir de deudas y mejorar tu historial crediticio', topic: 'Getting out of debt and improving your credit history' },
  { id: 'bWO79Tq7jFk', year: 2017, title: 'Cómo reconstruir fácilmente tu puntaje de crédito', topic: 'Rebuilding your credit score' },
  { id: 'ZZSToPOmYUg', year: 2019, title: 'Cómo proteger tu crédito si fuiste afectado por el ciberataque a Equifax', topic: 'Protecting your credit after the Equifax data breach' },
  { id: 'i0i4A3AwMLA', year: 2022, title: 'Tarjetas de crédito: tips para enseñar a los hijos un manejo responsable', topic: 'Teaching children to use credit cards responsibly' },
];
const segmentMeta = (segment) => `Despierta América (Univision) · ${segment.year} · In Spanish`;
// The segment whose topic matches a service is shown on that service page.
const serviceSegments = { 'debts-negotiation': 0, 'credit-repair': 1, 'fraud-alert-system': 2, 'add-existing-credit-cards-to-credit-history': 3 };

// ---------- Shared pieces ----------

const eyebrow = (text, dark = false) => `<span class="text-xs font-bold uppercase tracking-widest ${dark ? 'text-green-400' : 'text-teal-600'} flex items-center gap-1.5"><span class="w-1.5 h-1.5 rounded-full bg-green-500"></span>${text}</span>`;

const primaryButton = (label, href = '/contact-us/#book-consultation') => `<a class="brand-gradient-btn inline-flex items-center justify-center px-8 py-4 rounded-btn text-ink-950 font-bold text-sm tracking-wider uppercase shadow-md" href="${href}">${label}</a>`;

const callButton = (dark) => `<a class="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-btn ${dark ? 'bg-white/10 hover:bg-white/20 text-white border border-border-dark' : 'bg-white hover:bg-mist-100 text-text-primary border border-border-light shadow-sm'} font-bold text-sm transition-colors" href="${PHONE_HREF}">${icon('call', 'text-[18px]')}<span>Call ${PHONE}</span></a>`;

const textLink = (label, href) => `<a class="inline-flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider text-teal-600 hover:text-green-600 transition-colors py-3.5 -my-3.5" href="${href}"><span>${label}</span>${arrow}</a>`;

const breadcrumb = (trail) => `<nav aria-label="Breadcrumb" class="text-xs text-white/60"><ol class="flex flex-wrap items-center gap-x-2">${trail.map(([label, href], index) => `<li class="flex items-center gap-2">${index ? '<span aria-hidden="true">/</span>' : ''}${href ? `<a class="inline-block py-3.5 -my-3.5 hover:text-white transition-colors" href="${href}">${label}</a>` : `<span aria-current="page" class="text-white/90">${label}</span>`}</li>`).join('')}</ol></nav>`;

// Dark page hero. `aside` is the optional right-hand column; `background` an optional photo,
// kept behind an ink wash so the text contrast never depends on the picture.
const hero = ({ trail, label, title, lead, actions = '', aside = '', background = '' }) => `
<section class="relative isolate overflow-hidden bg-ink-950 py-14 text-white sm:py-20">
${background ? `<img alt="" class="absolute inset-0 -z-20 h-full w-full object-cover" fetchpriority="high" height="624" src="${background}" width="1920"/>
<div aria-hidden="true" class="absolute inset-0 -z-10 bg-ink-950/80 lg:bg-transparent lg:bg-gradient-to-r lg:from-ink-950/90 lg:via-ink-950/65 lg:to-ink-950/30"></div>` : ''}
<div class="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
<div class="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
<div class="${aside ? 'lg:col-span-7' : 'lg:col-span-9'} flex flex-col items-start space-y-6">
${breadcrumb(trail)}
${eyebrow(label, true)}
<h1 class="text-4xl sm:text-5xl leading-[1.08] font-bold text-white tracking-tight">${title}</h1>
<p class="max-w-xl text-lg leading-relaxed text-white/85">${lead}</p>
${actions ? `<div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2 w-full sm:w-auto">${actions}</div>
<div>${googleBadge()}</div>` : ''}
</div>
${aside ? `<div class="lg:col-span-5">${aside}</div>` : ''}
</div>
</div>
</section>`;

const sectionIntro = (label, title, lead = '', dark = false) => `<div class="max-w-2xl space-y-3">
${eyebrow(label, dark)}
<h2 class="text-3xl sm:text-4xl font-bold ${dark ? 'text-white' : 'text-ink-950'} leading-tight">${title}</h2>
${lead ? `<p class="text-sm ${dark ? 'text-white/70' : 'text-text-secondary'} leading-relaxed">${lead}</p>` : ''}
</div>`;

const approachSection = (background = 'bg-paper-100', image = null) => `
<section class="w-full ${background} py-20 lg:py-28">
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
${image ? '<div class="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center"><div class="lg:col-span-6">' : ''}${sectionIntro('HOW WE WORK', 'A strategy built around your situation.', 'Credit and debt challenges rarely come from one isolated issue. InterCredit starts by understanding your goals, reviewing the situation, and identifying the options that are most relevant to you.')}${image ? `</div><div class="lg:col-span-6">${framed(image[0], image[1])}</div></div>` : ''}
<ol class="grid grid-cols-1 md:grid-cols-3 gap-6">
${approach.map(([name, text], index) => `<li data-reveal class="group relative overflow-hidden p-8 rounded-card bg-white border border-border-light shadow-sm hover:shadow-md transition-shadow space-y-4">
<span aria-hidden="true" class="absolute inset-x-0 top-0 h-1 brand-gradient-line"></span>
<div class="flex items-start justify-between gap-4">
<span class="service-icon" aria-hidden="true"><span class="svc-icon" style="--icon:url('/assets/icons/approach-${name.toLowerCase()}.svg')"></span></span>
<span aria-hidden="true" class="text-4xl font-extrabold leading-none text-mist-200">0${index + 1}</span>
</div>
<div class="space-y-2">
<p class="text-[10px] font-bold uppercase tracking-wider text-teal-600">Step 0${index + 1}</p>
<h3 class="font-bold text-lg text-ink-950">${name}</h3>
<p class="text-sm text-text-secondary leading-relaxed">${text}</p>
</div>
</li>`).join('\n')}
</ol>
<div class="p-4 rounded-btn bg-white border-l-4 border-l-teal-500 border border-border-light shadow-sm max-w-2xl">
<p class="text-xs font-semibold text-text-primary">No generic package. No promise of a specific score. A clearer strategy based on your situation.</p>
</div>
</div>
</section>`;

const faqSection = (items = faqs) => `
<section class="w-full bg-white py-20 lg:py-28 border-t border-border-light" id="faq">
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
<div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
<div class="lg:col-span-4 space-y-4 lg:sticky lg:top-28">
${eyebrow('CLARITY BEFORE COMMITMENT')}
<h2 class="text-3xl sm:text-4xl font-bold text-ink-950 leading-tight">Frequently Asked Questions</h2>
<p class="text-sm text-text-secondary leading-relaxed">Have questions about working with InterCredit? We believe in transparency before you decide on any next step.</p>
${textLink('Speak with an Advisor', '/contact-us/')}
</div>
<div class="lg:col-span-8 space-y-4">
${items.map(([question, answer]) => `<details class="group rounded-card bg-porcelain-50 border border-border-light open:bg-white open:shadow-[inset_4px_0_0_#2D8F85] transition-all">
<summary class="flex items-center justify-between gap-4 p-6 rounded-card cursor-pointer font-bold text-sm text-ink-950 list-none"><span>${question}</span>${icon('expand_more', 'text-text-muted group-open:rotate-180 transition-transform')}</summary>
<p class="-mt-3 px-6 pb-6 max-w-prose text-sm text-text-secondary leading-relaxed">${esc(answer)}</p>
</details>`).join('\n')}
</div>
</div>
</div>
</section>`;

// Online booking (OnceHub / ScheduleOnce). The embed script is loaded by site.js when the block nears the screen.
const BOOKING_URL = 'https://go.oncehub.com/InterCreditSolution';
const bookHref = (current) => (current === '/' || current === '/contact-us/' ? '#book-consultation' : '/contact-us/#book-consultation');
const bookingSteps = [
  ['goal', 'Tell us your goal', 'Share what is happening, what you are concerned about, and what you would like to improve or understand.'],
  ['review', 'Review the situation', 'An InterCredit advisor reviews the relevant context and asks the questions needed to understand your case.'],
  ['options', 'Understand your options', 'You leave with a clearer understanding of the possible next steps and where InterCredit may be able to help.'],
];
// One scheduler per page: the OnceHub embed is keyed by a fixed element id.
const bookingCard = (id = '') => `<div data-reveal${id ? ` id="${id}"` : ''} class="rounded-card-lg bg-white border border-border-light shadow-xl overflow-hidden">
<div class="h-1 brand-gradient-line"></div>
<div class="p-4 sm:p-6 space-y-4">
<div class="flex flex-wrap items-center justify-between gap-3"><h3 class="font-bold text-lg text-ink-950">Choose a time that works for you</h3>${googleBadge({ compact: true })}</div>
<div class="min-h-[550px]">
<!-- ScheduleOnce embed START -->
<div id="SOIDIV_InterCreditSolution" data-so-page="InterCreditSolution" data-height="550" data-style="border: 1px solid #d8d8d8; min-width: 290px; max-width: 900px;" data-psz="00"></div>
<!-- ScheduleOnce embed END -->
</div>
<p class="text-xs text-text-muted">If the calendar does not load, <a class="font-bold text-teal-600 underline underline-offset-4 hover:text-green-600" href="${BOOKING_URL}" rel="noopener" target="_blank">open the booking page</a> or call us.</p>
</div>
</div>`;

// The same three steps, condensed for the closing CTA on dark backgrounds.
const bookingStepChips = () => `<ol class="booking-chips">
${bookingSteps.map(([slug, name], index) => `<li><span aria-hidden="true" class="svc-icon" style="--icon:url('/assets/icons/booking-${slug}.svg')"></span><span><span class="sr-only">Step ${index + 1}: </span>${name}</span></li>`).join('\n')}
</ol>`;

const bookingSection = () => `<section class="w-full bg-paper-100 py-20 lg:py-28" id="book-consultation">
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
<div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
<div class="lg:col-span-5 space-y-8">
${sectionIntro('WHAT TO EXPECT', 'A 20-minute conversation can help clarify your next move.', 'You do not need to arrive knowing which service you need. Start with what you are trying to solve.')}
<ol class="booking-steps">
${bookingSteps.map(([slug, name, text], index) => `<li data-reveal class="booking-step">
<span class="booking-step-icon" aria-hidden="true"><span class="svc-icon" style="--icon:url('/assets/icons/booking-${slug}.svg')"></span></span>
<div class="space-y-1.5 pt-1"><p class="text-[11px] font-bold uppercase tracking-widest text-teal-700">Step 0${index + 1}</p><h3 class="font-bold text-lg text-ink-950 leading-snug">${name}</h3><p class="text-sm text-text-secondary leading-relaxed">${text}</p></div>
</li>`).join('\n')}
</ol>
<p class="text-xs text-text-muted">*Exact recommendations, timing, fees, and service scope depend on your individual situation.</p>
<p class="text-sm text-text-secondary">Prefer to talk first? <a class="inline-flex min-h-[44px] items-center font-bold text-teal-600 hover:text-green-600 transition-colors" href="${PHONE_HREF}">Call ${PHONE}</a></p>
</div>
<div class="lg:col-span-7">
${bookingCard()}
</div>
</div>
</div>
</section>`;

// ---------- Reviews component ----------
// Rendered at build time from local data, so it needs no third-party script and works without JavaScript.
// To feed it from an API later: replace this one read with a fetch that returns the same shape
// ({ profileUrl, averageRating, totalReviews, fetchedAt, reviews: [{ id, author, rating, text, date, url }] }).
const reviewsData = JSON.parse(readFileSync(new URL('../src/data/reviews.json', import.meta.url), 'utf8'));

const starIcon = '<svg aria-hidden="true" viewBox="0 0 20 20" width="16" height="16" fill="#F5A623"><path d="M10 1.5l2.6 5.4 5.9.8-4.3 4.2 1 5.9L10 15l-5.2 2.8 1-5.9L1.5 7.7l5.9-.8z"/></svg>';
const stars = (rating) => `<span class="inline-flex gap-0.5" role="img" aria-label="${rating} out of 5 stars">${starIcon.repeat(Math.round(rating))}</span>`;
const monthYear = (isoDate) => new Date(`${isoDate}T12:00:00Z`).toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });
const asOf = monthYear(reviewsData.fetchedAt);

// Google rating badge: the one trust signal repeated at each decision point. Numbers come from the reviews data.
const googleBadge = ({ href = '/reviews/', compact = false } = {}) => {
  const external = href.startsWith('http');
  return `<a class="google-badge${compact ? ' google-badge-compact' : ''}" href="${esc(href)}"${external ? ' rel="noopener" target="_blank"' : ''} aria-label="Rated ${reviewsData.averageRating.toFixed(1)} out of 5 on Google, ${reviewsData.totalReviews} reviews${external ? ' (opens Google)' : ''}"><img alt="" height="${compact ? 33 : 41}" loading="lazy" src="/assets/google-reviews.svg" width="${compact ? 80 : 100}"/><span class="google-badge-text"><strong>${reviewsData.averageRating.toFixed(1)}</strong><span>${reviewsData.totalReviews} reviews</span></span></a>`;
};

const reviewCard = (review, extra = '') => `<li class="flex flex-col gap-4 p-6 rounded-card bg-white border border-border-light shadow-sm ${extra}">
<div class="flex items-center gap-3">
<span aria-hidden="true" class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full brand-gradient-line text-sm font-extrabold uppercase text-ink-950">${esc(review.author.charAt(0))}</span>
<div class="min-w-0"><p class="truncate font-bold text-sm text-ink-950">${esc(review.author)}</p><p class="text-xs text-text-muted">${monthYear(review.date)}</p></div>
</div>
${stars(review.rating)}
<p class="text-sm text-text-secondary leading-relaxed line-clamp-6">${esc(review.text)}</p>
<a class="mt-auto inline-flex min-h-[44px] items-center gap-1.5 self-start text-xs font-bold uppercase tracking-wider text-teal-600 hover:text-green-600 transition-colors" href="${esc(review.url)}" rel="noopener" target="_blank"><span>Read on Google</span>${arrow}</a>
</li>`;

// layout: 'carousel' (scroll-snap row with arrows) or 'grid' (every review).
const reviewsSummaryBody = (data = reviewsData) => `<img alt="Google Reviews" height="49" loading="lazy" src="/assets/google-reviews.svg" width="120"/>
<h3 class="text-2xl sm:text-3xl font-bold text-ink-950 leading-tight">What clients have written on Google.</h3>
<p class="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-text-secondary"><span class="text-2xl font-extrabold text-ink-950">${data.averageRating.toFixed(1)}</span>${stars(data.averageRating)}<span>${data.totalReviews} reviews on Google · as of ${asOf}</span></p>`;
// Standalone summary card, for layouts that show the rating beside other content and the reviews below.
const reviewsSummaryCard = () => `<div class="relative overflow-hidden rounded-card bg-white border border-border-light shadow-sm p-6 space-y-3 lg:mt-auto">
<span aria-hidden="true" class="absolute inset-x-0 top-0 h-1 brand-gradient-line"></span>
${reviewsSummaryBody()}
</div>`;

// summary: false leaves only the controls above the reviews (the summary card is placed elsewhere).
const reviewsComponent = ({ layout = 'carousel', data = reviewsData, summary = true } = {}) => `<div class="${summary ? 'space-y-8' : 'space-y-4'}" id="google-reviews"${layout === 'carousel' ? ' data-carousel' : ''}>
<div class="flex flex-col lg:flex-row lg:items-end ${summary ? 'justify-between' : 'justify-end'} gap-6">
${summary ? `<div class="space-y-3">
${reviewsSummaryBody(data)}
</div>` : ''}
<div class="flex items-center justify-between gap-3">
<a class="inline-flex min-h-[44px] items-center gap-1.5 font-bold text-xs uppercase tracking-wider text-teal-600 hover:text-green-600 transition-colors" href="${esc(data.profileUrl)}" rel="noopener" target="_blank"><span>See all reviews on Google</span>${arrow}</a>
${layout === 'carousel' ? `<button type="button" data-carousel-prev aria-label="Previous reviews" class="flex h-11 w-11 items-center justify-center rounded-full border border-border-light bg-white text-ink-950 shadow-sm hover:bg-mist-100 transition-colors">${icon('chevron_left')}</button>
<button type="button" data-carousel-next aria-label="Next reviews" class="flex h-11 w-11 items-center justify-center rounded-full border border-border-light bg-white text-ink-950 shadow-sm hover:bg-mist-100 transition-colors">${icon('chevron_right')}</button>` : ''}
</div>
</div>
${layout === 'carousel'
    ? `<ul data-carousel-track tabindex="0" aria-label="Google reviews" class="reviews-track flex gap-5 overflow-x-auto snap-x snap-mandatory pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
${data.reviews.map((review) => reviewCard(review, 'snap-start shrink-0 w-[85%] sm:w-[calc(50%-10px)] lg:w-[calc(33.333%-14px)]')).join('\n')}
</ul>`
    : `<ul class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
${data.reviews.map((review) => reviewCard(review)).join('\n')}
</ul>`}
</div>`;

const closingCta = (title = 'Start with a conversation about where you are and what comes next.') => `
<section class="w-full bg-ink-950 text-white relative overflow-hidden">
<div class="absolute top-0 left-0 right-0 z-20 h-1 brand-gradient-line"></div>
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
<div class="lg:w-1/2 lg:pr-12 py-20 lg:py-28 space-y-6">
<span class="text-xs font-bold uppercase tracking-widest text-green-400">YOUR NEXT STEP DOES NOT HAVE TO BE COMPLICATED</span>
<h2 class="text-3xl sm:text-4xl font-bold text-white leading-tight text-balance">${title}</h2>
<p class="text-sm sm:text-base text-white/75 leading-relaxed max-w-xl">You do not need to diagnose your own credit situation or choose a service before you call. Tell us your goal, ask your questions, and understand the options that may fit your situation.</p>
${bookingStepChips()}
<div class="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-stretch sm:items-center lg:items-stretch xl:items-center gap-4 pt-4">
${primaryButton('Book a 20-Minute Consultation')}
${callButton(true)}
</div>
<ul class="flex flex-col sm:flex-row sm:flex-wrap gap-x-6 gap-y-2 pt-2 text-xs text-white/70">
<li class="flex items-center gap-2"><span aria-hidden="true" class="material-symbols-outlined text-[16px] text-green-400">check_circle</span>Personalized guidance</li>
<li class="flex items-center gap-2"><span aria-hidden="true" class="material-symbols-outlined text-[16px] text-green-400">check_circle</span>Clear expectations</li>
<li class="flex items-center gap-2"><span aria-hidden="true" class="material-symbols-outlined text-[16px] text-green-400">check_circle</span>No guaranteed-score promises</li>
</ul>
</div>
</div>
<figure class="relative aspect-[4/3] sm:aspect-video lg:aspect-auto lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2"><img alt="A person reviewing a printed credit report beside a laptop" class="absolute inset-0 w-full h-full object-cover" decoding="async" height="900" loading="lazy" sizes="(min-width: 1024px) 50vw, 100vw" src="/assets/cta-credit-report-1200.jpg" srcset="/assets/cta-credit-report-720.jpg 720w, /assets/cta-credit-report-1200.jpg 1200w" width="1200"/><div aria-hidden="true" class="hidden lg:block absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-ink-950 to-transparent"></div></figure>
</section>`;

const youtubeCard = (id, title, label) => `<div class="testimonial-player rounded-card-lg shadow-xl border border-border-light" data-youtube="${id}" data-title="${title}"><a aria-label="${label}" href="https://www.youtube.com/watch?v=${id}"><img alt="" decoding="async" height="720" loading="lazy" src="https://i.ytimg.com/vi/${id}/maxresdefault.jpg" width="1280"/><span class="testimonial-play-icon" aria-hidden="true"><svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></span></a></div>`;

const officeCard = `<div class="p-8 rounded-card-lg bg-white border border-border-light shadow-sm space-y-5">
<h3 class="font-bold text-lg text-ink-950">Miami office</h3>
<ul class="space-y-1 text-sm text-text-secondary">
<li class="flex items-start gap-3">${icon('location_on', 'text-[20px] text-teal-600 mt-3')}<a class="inline-flex min-h-[44px] items-center hover:text-teal-600 transition-colors" href="${MAP_HREF}" rel="noopener" target="_blank">${ADDRESS}</a></li>
<li class="flex items-start gap-3">${icon('call', 'text-[20px] text-teal-600 mt-3')}<span><a class="inline-flex min-h-[44px] items-center font-bold text-ink-950 hover:text-teal-600 transition-colors" href="${PHONE_HREF}">${PHONE}</a> <span aria-hidden="true">•</span> <a class="inline-flex min-h-[44px] items-center font-bold text-ink-950 hover:text-teal-600 transition-colors" href="${TOLL_FREE_HREF}">${TOLL_FREE}</a></span></li>
<li class="flex items-start gap-3">${icon('mail', 'text-[20px] text-teal-600 mt-3')}<a class="inline-flex min-h-[44px] items-center break-all hover:text-teal-600 transition-colors" href="mailto:${EMAIL}">${EMAIL}</a></li>
<li class="flex items-start gap-3">${icon('schedule', 'text-[20px] text-teal-600 mt-3')}<span class="inline-flex min-h-[44px] items-center">${HOURS}</span></li>
</ul>
</div>`;

const navLinks = [
  ['How It Works', '/#personalized-strategy'],
  ['About', '/about-us/'],
  ['Reviews', '/reviews/'],
  ['FAQ', '/#faq'],
  ['Contact', '/contact-us/'],
];

const navLink = (current) => ([label, href]) => `<a class="nav-item-link min-h-11 inline-flex items-center whitespace-nowrap font-semibold text-sm ${href === current ? 'text-ink-950' : 'text-text-secondary'} hover:text-ink-950 transition-colors" href="${href}"${href === current ? ' aria-current="page"' : ''}>${label}</a>`;

const header = (current) => `
<a class="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-btn focus:bg-white focus:px-4 focus:py-3 focus:font-bold focus:text-ink-950 focus:shadow-xl" href="#main-content">Skip to main content</a>
<aside class="utility-bar text-xs py-2 px-4 relative z-50">
<div class="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
<div class="flex items-center gap-2 mx-auto sm:mx-0"><span class="w-1.5 h-1.5 rounded-full bg-ink-950"></span><span class="font-semibold tracking-wide">20-Minute Consultation • Personalized Credit &amp; Financial Guidance • Miami-Based</span></div>
<div class="hidden md:flex items-center gap-6 font-medium">
<span class="flex items-center gap-1.5">${icon('location_on', 'text-[15px]')}13590 SW 134th Ave, Suite 203, Miami, FL</span>
<a class="inline-block py-3.5 -my-3.5 font-bold underline-offset-4 hover:underline" href="${PHONE_HREF}">Direct: ${PHONE}</a>
</div>
</div>
</aside>
<header class="sticky top-0 z-40 bg-porcelain-50/95 backdrop-blur-md border-b border-border-light transition-all duration-200">
<a aria-label="InterCredit Solution — home" class="logo-badge" href="/"><img alt="" height="87" src="/assets/intercredit-logo.svg" width="124"/></a>
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 xl:h-[84px] flex items-center justify-between gap-4">
<a class="xl:hidden flex shrink-0 items-center focus:outline-none focus:ring-2 focus:ring-teal-600 rounded-lg py-1 pr-2" href="/"><div class="h-12 flex items-center"><img alt="InterCredit Solution — home" class="site-logo" height="159" src="/assets/intercredit-logo.svg" width="226"/></div></a>
<nav aria-label="Primary" class="hidden xl:flex flex-1 items-center justify-evenly pr-24">
<div class="relative" id="solutions-navigation">
<button type="button" id="solutions-toggle" aria-expanded="false" aria-controls="solutions-dropdown" class="nav-item-link min-h-11 inline-flex items-center gap-1 whitespace-nowrap font-semibold text-sm ${current === '/services/' ? 'text-ink-950' : 'text-text-secondary'} hover:text-ink-950 transition-colors">Services${icon('expand_more', 'text-[16px] text-text-muted transition-transform')}</button>
<div id="solutions-dropdown" hidden class="absolute top-full -left-4 w-[44rem] max-w-[calc(100vw-2rem)] bg-white rounded-card shadow-2xl border border-border-light p-5 flex-col gap-4 z-50">
<div class="grid grid-cols-2 gap-x-8 gap-y-5">
${chapters.map((chapter, index) => `<div>
<a class="block py-2 font-bold text-[10px] uppercase tracking-wider text-teal-600 hover:text-green-600 transition-colors" href="/services/#${chapter.id}">${chapter.n} / ${esc(chapter.name)}</a>
<ul>${services.filter((service) => service.chapter === index).map((service) => `<li><a class="flex min-h-[44px] items-center gap-3 px-3 -mx-3 rounded-btn text-sm font-semibold text-text-primary hover:bg-mist-100/70 transition-colors" href="/services/${service.slug}/">${svcIcon(service.slug, 'text-[20px]')}<span>${esc(service.name)}</span></a></li>`).join('')}</ul>
</div>`).join('\n')}
</div>
<a class="flex min-h-[44px] items-center justify-between gap-2 px-4 rounded-btn bg-mist-100 text-sm font-bold text-ink-950 hover:bg-mist-200 transition-colors" href="/services/"><span>View all services</span>${arrow}</a>
</div>
</div>
${navLinks.slice(0, 2).map(navLink(current)).join('\n')}
</nav>
<div class="flex xl:flex-1 items-center justify-end xl:justify-between gap-4 xl:pl-32">
<nav aria-label="Secondary" class="hidden xl:flex items-center gap-7">
${navLinks.slice(2).map(navLink(current)).join('\n')}
</nav>
<a class="hidden sm:inline-flex xl:hidden min-h-11 items-center gap-1.5 whitespace-nowrap font-semibold text-xs tracking-wide text-text-secondary hover:text-teal-600 transition-colors" href="${PHONE_HREF}">${icon('call', 'text-[16px] text-teal-600')}${PHONE}</a>
<a class="brand-gradient-btn hidden sm:inline-flex min-h-11 items-center justify-center whitespace-nowrap px-5 py-3 rounded-btn text-ink-950 font-bold text-xs tracking-wider uppercase shadow-sm" href="${bookHref(current)}">Book a 20-Minute Consultation</a>
<button aria-controls="mobile-navigation" aria-expanded="false" aria-label="Open navigation menu" class="xl:hidden w-11 h-11 rounded-btn bg-white border border-border-light text-ink-950 flex items-center justify-center shadow-sm" id="mobile-menu-toggle" type="button">${icon('menu')}</button>
</div>
</div>
</header>
<div class="fixed inset-0 z-[60] bg-ink-950/45 backdrop-blur-sm hidden xl:hidden" id="mobile-navigation" role="dialog" aria-modal="true" aria-label="Site menu">
<nav aria-label="Mobile navigation" class="absolute inset-y-0 right-0 w-[min(88vw,360px)] bg-porcelain-50 shadow-2xl p-6 flex flex-col overflow-y-auto">
<div class="flex items-center justify-between pb-6 border-b border-border-light">
<img alt="InterCredit Solution" class="h-12 w-auto object-contain" height="159" src="/assets/intercredit-logo.svg" width="226"/>
<button aria-label="Close navigation menu" class="w-11 h-11 rounded-btn bg-white border border-border-light text-ink-950 flex items-center justify-center" id="mobile-menu-close" type="button">${icon('close')}</button>
</div>
<div class="flex flex-col py-6 divide-y divide-border-light text-sm font-semibold">
<a class="py-4" href="/"${current === '/' ? ' aria-current="page"' : ''}>Home</a>
<details class="group"${current === '/services/' ? ' open' : ''}>
<summary class="flex items-center justify-between py-4 cursor-pointer list-none">Services${icon('expand_more', 'text-text-muted group-open:rotate-180 transition-transform')}</summary>
<ul class="pb-3 text-[13px] font-medium text-text-secondary">
<li><a class="flex min-h-[44px] items-center font-bold text-teal-600" href="/services/">All services</a></li>
${services.map((service) => `<li><a class="flex min-h-[44px] items-center gap-3" href="/services/${service.slug}/">${svcIcon(service.slug, 'text-[18px]')}<span>${esc(service.name)}</span></a></li>`).join('')}
</ul>
</details>
${navLinks.map(([label, href]) => `<a class="py-4" href="${href}"${href === current ? ' aria-current="page"' : ''}>${label}</a>`).join('\n')}
</div>
<p class="mt-auto flex flex-wrap gap-x-6 pb-4 text-xs text-text-muted"><a class="inline-flex min-h-[44px] items-center hover:text-ink-950" href="/privacy-policy/">Privacy Policy</a><a class="inline-flex min-h-[44px] items-center hover:text-ink-950" href="/terms-and-conditions/">Terms &amp; Conditions</a></p>
<a class="brand-gradient-btn shrink-0 inline-flex items-center justify-center px-5 py-4 rounded-btn text-ink-950 font-bold text-xs tracking-wider uppercase shadow-sm" href="${bookHref(current)}">Book a 20-Minute Consultation</a>
</nav>
</div>`;

const footerLink = (label, href) => `<li><a class="footer-link inline-flex min-h-[44px] items-center text-sm text-white/75 hover:text-white transition-colors" href="${href}">${label}</a></li>`;
const footerHeading = (label) => `<h2 class="font-bold text-xs uppercase tracking-widest text-white">${label}</h2>
<span aria-hidden="true" class="block h-0.5 w-8 rounded-full brand-gradient-line"></span>`;
const footerContact = (name, content) => `<li class="flex items-start gap-3"><span class="footer-contact-icon">${icon(name, 'text-[18px]')}</span><div class="min-w-0 flex min-h-[40px] flex-wrap items-center gap-x-2">${content}</div></li>`;

const footer = `
<footer class="site-footer relative w-full overflow-hidden bg-ink-900 text-white/80 pb-12 text-xs">
<div aria-hidden="true" class="h-1 brand-gradient-line"></div>
<span aria-hidden="true" class="footer-glow footer-glow-blue"></span>
<span aria-hidden="true" class="footer-glow footer-glow-green"></span>
<div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-x-10 gap-y-12 pb-12">
<div class="md:col-span-2 lg:col-span-5 space-y-6">
<a class="footer-logo" href="/" aria-label="InterCredit Solution home"><img alt="InterCredit Solution" height="127" loading="lazy" src="/assets/intercredit-logo.svg" width="180"/></a>
<p class="text-sm text-white/70 leading-relaxed max-w-sm">Personalized credit and financial guidance for people who want a clearer path through credit, debt, protection, and U.S. credit-building decisions.</p>
<ul class="space-y-3 text-sm text-white/80">
${footerContact('location_on', `<a class="inline-flex min-h-[44px] items-center hover:text-white transition-colors" href="${DIRECTIONS_HREF}" rel="noopener" target="_blank">${ADDRESS}</a>`)}
${footerContact('call', `<a class="inline-flex min-h-[44px] items-center font-bold text-white hover:text-green-400 transition-colors" href="${PHONE_HREF}">${PHONE}</a><span aria-hidden="true" class="text-white/30">•</span><a class="inline-flex min-h-[44px] items-center font-bold text-white hover:text-green-400 transition-colors" href="${TOLL_FREE_HREF}">${TOLL_FREE}</a>`)}
${footerContact('mail', `<a class="inline-flex min-h-[44px] items-center break-all hover:text-white transition-colors" href="mailto:${EMAIL}">${EMAIL}</a>`)}
${footerContact('schedule', `<span>${HOURS}</span>`)}
</ul>
${googleBadge({ href: reviewsData.profileUrl })}
</div>
<div class="lg:col-span-3 space-y-3">
${footerHeading('Solutions')}
<ul>${chapters.map((chapter) => footerLink(esc(chapter.name), `/services/#${chapter.id}`)).join('')}</ul>
</div>
<div class="lg:col-span-2 space-y-3">
${footerHeading('Company')}
<ul>${footerLink('About &amp; Leadership', '/about-us/')}${footerLink('Client Reviews', '/reviews/')}${footerLink('Media Appearances', '/about-us/#media')}${footerLink('Contact Us', '/contact-us/')}</ul>
</div>
<div class="lg:col-span-2 space-y-3">
${footerHeading('Resources &amp; Legal')}
<ul>${footerLink('FAQ', '/#faq')}${footerLink('Privacy Policy', '/privacy-policy/')}${footerLink('Terms &amp; Conditions', '/terms-and-conditions/')}</ul>
</div>
</div>
<div class="pt-8 border-t border-border-dark flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs text-white/60">
<p class="md:shrink-0 leading-relaxed">© 2026 InterCredit Solution. All rights reserved. <span aria-hidden="true" class="mx-1 text-white/30">|</span> <span class="whitespace-nowrap">Developed by <a class="font-bold underline-offset-4 hover:underline py-3" style="color:var(--ic-brand-green)" href="https://www.senaviacorp.com/" rel="noopener" target="_blank">Senavia Corp.</a></span></p>
<p class="max-w-xl text-left md:text-right leading-relaxed">Outcomes depend on individual client profiles and other factors outside InterCredit's control. No credit score increases or removals are guaranteed.</p>
</div>
</div>
</footer>
<div class="fixed bottom-0 inset-x-0 z-50 p-3 bg-white/95 backdrop-blur-md border-t border-border-light sm:hidden flex items-center justify-between gap-3 shadow-lg">
<a class="w-12 h-12 rounded-btn bg-mist-100 flex items-center justify-center text-teal-700 flex-shrink-0" href="${PHONE_HREF}" aria-label="Call ${PHONE}">${icon('call', 'text-[20px]')}</a>
<a class="brand-gradient-btn flex-1 inline-flex min-h-[48px] items-center justify-center px-4 rounded-btn text-ink-950 font-bold text-xs uppercase tracking-wider text-center shadow-sm" href="/contact-us/#book-consultation">Book Consultation</a>
</div>`;

// UserWay accessibility widget (client account). Loaded on every page, including the homepage.
const USERWAY = '<script src="https://cdn.userway.org/widget.js" data-account="PIK3aqaQIW"></script>';

const FONT_ICONS = '@@ICON_FONT@@';

const page = ({ title, description, current = '', robots = '', body }) => `<!DOCTYPE html>
<html class="scroll-smooth" lang="en"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>${title}</title>
<meta content="${description}" name="description"/>${robots ? `\n<meta content="${robots}" name="robots"/>` : ''}
<link href="/assets/favicon.png" rel="icon" type="image/png"/>
<link href="https://fonts.googleapis.com" rel="preconnect"/>
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&amp;family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;1,6..72,400;1,6..72,500&amp;display=swap" rel="stylesheet"/>
<link href="${FONT_ICONS}" rel="stylesheet"/>
<link rel="stylesheet" href="/assets/site.css"/>
<link rel="stylesheet" href="/assets/motion.css"/>
<script src="/assets/motion.js" defer></script>
<script src="/assets/site.js" defer></script>
</head>
<body class="bg-porcelain-50 font-sans text-text-primary antialiased selection:bg-teal-500 selection:text-white">
${header(current)}
<main id="main-content">
${body}
</main>
${footer}
${USERWAY}
</body></html>
`;

// ---------- Pages ----------

const serviceCard = (service) => `<a data-reveal class="group flex flex-col gap-4 p-6 rounded-card bg-white border border-border-light shadow-sm hover:border-teal-500/50 hover:shadow-md transition-all" href="/services/${service.slug}/">
${svcTile(service.slug)}
<span class="space-y-2">
<span class="block font-bold text-base text-ink-950">${esc(service.name)}</span>
<span class="block text-sm text-text-secondary leading-relaxed">${esc(service.intro)}</span>
</span>
<span class="mt-auto inline-flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider text-teal-600 group-hover:text-green-600 transition-colors">View service ${arrow}</span>
</a>`;

const segmentBand = (segment) => `
<section class="w-full bg-ink-950 text-white py-16 lg:py-24">
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
<div class="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
<div data-reveal class="lg:col-span-7">${youtubeCard(segment.id, segment.title, `Play video: ${segment.title}`).replace('border-border-light', 'border-border-dark')}</div>
<div class="lg:col-span-5 space-y-4">
${eyebrow(`ON DESPIERTA AMÉRICA (UNIVISION) · ${segment.year}`, true)}
<h2 class="text-2xl sm:text-3xl font-bold text-white leading-tight" lang="es">${segment.title}</h2>
<p class="text-sm text-white/70 leading-relaxed">A Despierta América segment with Jessica Sotolongo on this topic: ${segment.topic.charAt(0).toLowerCase()}${segment.topic.slice(1)}. The segment is in Spanish.</p>
<a class="inline-flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider text-green-400 hover:text-white transition-colors py-3.5 -my-3.5" href="/about-us/#media"><span>More media appearances</span>${arrow}</a>
</div>
</div>
</div>
</section>`;

const stageText = [
  'Review your goals, credit context, debt situation, and relevant information before deciding what to address.',
  'Identify eligible inaccurate, outdated, or inconsistent credit information that may need review or updating.',
  'Explore appropriate options for eligible debt and collection challenges, including negotiation when applicable.',
  'Use monitoring, fraud-related support, education, and better habits to reduce uncertainty around your profile.',
  'Build stronger credit history and financial habits that can support future financial goals and financing.',
];
// Illustrative image for each service's place in the journey (image bank; nobody shown is presented as a client or team member).
const stagePhotoAlt = {
  'credit-repair': 'A hand filling in a printed credit score form beside a calculator',
  'update-personal-information-in-credit-bureaus': 'Printed credit card application documents and a card on a wooden desk',
  'add-existing-credit-cards-to-credit-history': 'A printed credit card agreement on a desk',
  'debts-negotiation': 'A handshake over signed documents',
  'negotiation-of-collection-accounts-in-court': 'Two people reviewing a printed report at a marble table',
  'corporate-credit-counseling': 'Three people in a business meeting at an office table',
  'credit-monitoring-report': 'A person at a keyboard with a credit check screen on the monitor',
  'fraud-alert-system': 'Hands holding a phone and a payment card',
  'establishing-credit-for-foreign-investors': 'An advisor talking with a couple at a table with a bay skyline behind them',
};
const brandMix = (t) => `#${[[0x20, 0x9e], [0xb4, 0xb3], [0xe5, 0x42]].map(([from, to]) => Math.round(from + (to - from) * t).toString(16).padStart(2, '0')).join('')}`;

// Vertical journey: every stage is listed; the one this service belongs to opens with its description.
const journeyTimeline = (active) => `<ol class="relative space-y-3">
<span aria-hidden="true" class="absolute left-[23px] top-6 bottom-6 w-0.5 brand-gradient-line-vertical"></span>
${stages.map((stage, index) => (index === active
    ? `<li aria-current="step" class="relative flex items-start gap-4 p-4 -ml-0 rounded-card bg-white border border-border-light shadow-md">
<span class="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-4 bg-ink-950 text-white font-extrabold text-sm shadow-lg -ml-[3px]" style="border-color:${brandMix(index / 4)}">0${index + 1}</span>
<div class="space-y-1 pt-0.5"><p class="text-[10px] font-bold uppercase tracking-wider text-teal-600">This service · Stage 0${index + 1}</p><h3 class="font-bold text-lg text-ink-950">${stage}</h3><p class="text-sm text-text-secondary leading-relaxed">${stageText[index]}</p></div>
</li>`
    : `<li class="relative flex items-center gap-4 pl-[5px] py-1">
<span class="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 bg-white text-text-muted font-bold text-xs" style="border-color:${brandMix(index / 4)}">0${index + 1}</span>
<span class="pl-[3px] text-sm font-semibold text-text-secondary">${stage}</span>
</li>`)).join('\n')}
</ol>`;

const servicePage = (service) => {
  const chapter = chapters[service.chapter];
  const related = services.filter((other) => other !== service && other.chapter === service.chapter)
    .concat(services.filter((other) => other.chapter !== service.chapter)).slice(0, 3);
  return page({
    title: `${esc(service.name)} — InterCredit Solution`,
    description: esc(`${service.intro} Personalized guidance from InterCredit Solution in Miami. Start with a 20-minute consultation.`),
    current: '/services/',
    body: `${hero({
      trail: [['Home', '/'], ['Services', '/services/'], [esc(service.name)]],
      label: `CHAPTER ${chapter.n} • ${esc(chapter.name).toUpperCase()}`,
      title: `<span class="flex items-center gap-4">${svcIcon(service.slug, 'svc-icon-light text-[0.9em]')}<span>${esc(service.name)}</span></span>`,
      lead: esc(service.intro),
      actions: `${primaryButton('Book a 20-Minute Consultation')}${callButton(true)}`,
      background: `/assets/service-hero-${service.slug}.jpg`,
      aside: `<div class="rounded-card-lg border border-white/20 bg-white/95 p-6 text-text-primary shadow-2xl space-y-4">
<div class="flex items-center gap-4">${svcTile(service.slug)}<p class="font-bold text-sm text-ink-950">At a glance</p></div>
<dl class="divide-y divide-border-light text-sm">
<div class="flex justify-between gap-4 py-3"><dt class="text-text-muted">Solution area</dt><dd class="font-semibold text-right">${esc(chapter.name)}</dd></div>
<div class="flex justify-between gap-4 py-3"><dt class="text-text-muted">Journey stage</dt><dd class="font-semibold text-right">0${service.stage + 1} · ${stages[service.stage]}</dd></div>
<div class="flex justify-between gap-4 py-3"><dt class="text-text-muted">First step</dt><dd class="font-semibold text-right">20-minute consultation</dd></div>
<div class="flex justify-between gap-4 py-3"><dt class="text-text-muted">Format</dt><dd class="font-semibold text-right">In person &amp; remote</dd></div>
</dl>
</div>`,
    })}
<section class="w-full bg-porcelain-50 py-20 lg:py-28">
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
<div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
<div class="lg:col-span-7 space-y-6">
${sectionIntro('WHAT THIS SERVICE COVERS', 'What we help you with.')}
<p class="max-w-prose text-base text-text-secondary leading-relaxed">${esc(service.body)}</p>
<div class="p-4 rounded-btn bg-white border-l-4 border-l-teal-500 border border-border-light shadow-sm max-w-prose">
<p class="text-xs font-semibold text-text-primary">Scope, timing and fees depend on your individual situation. No specific score increase, approval, deletion, settlement, or timeline is guaranteed.</p>
</div>
${bookingCard('book-consultation')}
</div>
<div class="lg:col-span-5 space-y-6">
${framed(servicePhotos[service.slug][0], servicePhotos[service.slug][1], servicePhotos[service.slug][2] ? { width: servicePhotos[service.slug][2], height: servicePhotos[service.slug][3], aspect: servicePhotos[service.slug][3] / servicePhotos[service.slug][2] > 0.6 ? 'aspect-[4/3]' : 'aspect-video' } : {})}
<div data-reveal class="p-8 rounded-card-lg bg-white border border-border-light shadow-sm space-y-4">
<h3 class="font-bold text-base text-ink-950">Situations where this may apply</h3>
<ul class="space-y-3 text-sm text-text-secondary">
${service.scenarios.map((scenario) => `<li class="flex items-start gap-3">${icon('check_circle', 'text-[20px] text-teal-600')}<span>${esc(scenario)}</span></li>`).join('\n')}
</ul>
<p class="text-xs text-text-muted">Not sure this is your case? The consultation is designed to clarify which options are relevant.</p>
</div>
</div>
</div>
</div>
</section>
${service.slug in serviceSegments ? segmentBand(segments[serviceSegments[service.slug]]) : ''}
${approachSection()}
<section class="w-full bg-white border-y border-border-light py-20 lg:py-28">
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
<div class="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
<figure data-reveal class="photo-offset lg:col-span-6">
<span aria-hidden="true" class="photo-offset-frame"></span>
<div class="relative rounded-card-lg overflow-hidden border border-border-light bg-white shadow-xl aspect-[4/3]">
<img alt="${stagePhotoAlt[service.slug]}" class="w-full h-full object-cover" decoding="async" height="900" loading="lazy" sizes="(min-width: 1024px) 45vw, 100vw" src="/assets/stage-${service.slug}.jpg" srcset="/assets/stage-${service.slug}-600.jpg 600w, /assets/stage-${service.slug}.jpg 1200w" width="1200"/>
<figcaption class="absolute left-4 bottom-4 inline-flex items-center gap-3 rounded-full bg-ink-950/90 pl-2 pr-4 py-2 text-white shadow-lg backdrop-blur-md">${svcIcon(service.slug, 'svc-icon-light text-[18px] ml-2')}<span class="text-xs font-bold uppercase tracking-wider">Stage 0${service.stage + 1} · ${stages[service.stage]}</span></figcaption>
</div>
</figure>
<div class="lg:col-span-6 space-y-8">
${sectionIntro('A CLEARER FINANCIAL PATH', `Where this fits: stage 0${service.stage + 1}, ${stages[service.stage]}.`, 'Not every client follows the same route. Your path may begin at any stage, and scope is tailored to your specific situation.')}
${journeyTimeline(service.stage)}
${textLink('See the full journey', '/#financial-journey')}
</div>
</div>
</div>
</section>
${faqSection(faqs.slice(0, 4))}
<section class="w-full bg-paper-100 py-20 lg:py-28">
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
<div class="flex flex-col sm:flex-row sm:items-end justify-between gap-6">${sectionIntro('RELATED SERVICES', 'Other ways InterCredit can help.')}${textLink('All services', '/services/')}</div>
<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
${related.map(serviceCard).join('\n')}
</div>
</div>
</section>
${closingCta()}`,
  });
};

const servicesIndex = page({
  title: 'Services — InterCredit Solution',
  description: 'Nine credit and debt services organized around four goals: improve your credit, resolve debt, protect your profile, and build credit in the U.S.',
  current: '/services/',
  body: `${hero({
    trail: [['Home', '/'], ['Services']],
    label: 'SOLUTIONS DIRECTORY',
    title: 'Solutions organized around <span class="font-serif-italic font-normal brand-gradient-text">what you actually need</span>.',
    lead: 'You do not need to know the official name of the service you need. Choose the situation that sounds closest to yours and explore the most relevant options.',
    actions: `${primaryButton('Book a 20-Minute Consultation')}${callButton(true)}`,
    aside: heroPhoto('photo-1618', 'A consultation in progress in one of the InterCredit offices in Miami'),
  })}
${chapters.map((chapter, index) => `<section class="w-full ${index % 2 ? 'bg-white border-y border-border-light' : 'bg-porcelain-50'} py-16 lg:py-24" id="${chapter.id}">
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
${sectionIntro(`CHAPTER ${chapter.n}`, esc(chapter.name), chapter.blurb)}
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
${services.filter((service) => service.chapter === index).map(serviceCard).join('\n')}
</div>
</div>
</section>`).join('\n')}
${closingCta('Not sure where you fit? Start with a conversation.')}`,
});

const about = page({
  title: 'About Us — InterCredit Solution',
  description: 'Meet InterCredit Solution: a Miami-based team led by Jessica Sotolongo that provides personalized credit and debt guidance.',
  current: '/about-us/',
  body: `${hero({
    trail: [['Home', '/'], ['About Us']],
    label: 'ABOUT INTERCREDIT',
    title: 'Your goal is <span class="font-serif-italic font-normal brand-gradient-text">our mission</span>.',
    lead: 'InterCredit Solution is a Miami-based team that helps people understand their credit, work through debt challenges, and plan a path built around their goals. We look at the main aspects of your finances, offer a tailored plan, and guide you through each step.',
    actions: `${primaryButton('Book a 20-Minute Consultation')}<a class="inline-flex items-center justify-center gap-2 rounded-btn border border-white/30 bg-white/95 px-6 py-4 text-sm font-bold text-text-primary shadow-sm transition-colors hover:bg-white" href="/services/"><span>Explore Our Services</span>${icon('arrow_forward', 'icon-nudge text-[18px] text-teal-700')}</a>`,
    aside: `<figure class="rounded-card-lg overflow-hidden border border-white/20 bg-ink-900 shadow-2xl"><img alt="The InterCredit Solution team at the Miami office" class="w-full h-auto" fetchpriority="high" height="833" src="/assets/team-office.jpg" width="1250"/></figure>`,
  })}
<section class="w-full bg-porcelain-50 py-20 lg:py-28">
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
<div data-reveal class="p-8 rounded-card-lg bg-white border border-border-light shadow-sm space-y-3 relative overflow-hidden">
<div class="absolute top-0 left-0 w-full h-1 brand-gradient-line"></div>
<span class="service-icon" aria-hidden="true"><span aria-hidden="true" class="svc-icon" style="--icon:url('/assets/icons/benefit-handshake.svg')"></span></span>
<h2 class="text-2xl font-bold text-ink-950">Our Mission</h2>
<p class="text-sm text-text-secondary leading-relaxed">At InterCredit Solution, our mission is to empower individuals and families to take control of their financial future. Through personalized credit solutions and expert guidance, we help our clients build healthy financial habits and work through challenges. We are committed to delivering trusted support with integrity, dedication, and a focus on long-term success for every client we serve.</p>
</div>
<div data-reveal class="p-8 rounded-card-lg bg-white border border-border-light shadow-sm space-y-3 relative overflow-hidden">
<div class="absolute top-0 left-0 w-full h-1 brand-gradient-line"></div>
<span class="service-icon" aria-hidden="true"><span aria-hidden="true" class="svc-icon" style="--icon:url('/assets/icons/benefit-idea.svg')"></span></span>
<h2 class="text-2xl font-bold text-ink-950">Our Vision</h2>
<p class="text-sm text-text-secondary leading-relaxed">Our vision is to be a leading force in transforming the way people manage their credit and finances. We aim to create a world where everyone has access to the knowledge, tools, and support needed to build a strong financial foundation, free from the burden of debt and uncertainty.</p>
</div>
</div>
<div class="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
<div class="md:col-span-2">${framed('photo-1620', 'Jessica Sotolongo in a consultation in her office, seen from across the room')}</div>
<div class="grid grid-cols-2 md:grid-cols-1 gap-6">
${framed('photo-1657', 'The InterCredit front desk, with team members working beneath the tree mural')}
${framed('photo-1605', 'A consultation seen from behind Jessica Sotolongo, facing two visitors')}
</div>
</div>
</div>
</section>
<section class="w-full bg-paper-100 py-20 lg:py-28" id="founder">
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
<div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
<div class="lg:col-span-5">
<div class="rounded-hero overflow-hidden shadow-2xl bg-white border border-border-light aspect-[3/4]"><img alt="Jessica Sotolongo at her desk in the InterCredit office" class="w-full h-full object-cover" decoding="async" height="1600" loading="lazy" src="/assets/jessica-at-desk.jpg" width="1200"/></div>
</div>
<div class="lg:col-span-7 flex flex-col space-y-6">
<div class="space-y-3">
${eyebrow('LEADERSHIP &amp; PHILOSOPHY')}
<h2 class="text-3xl sm:text-4xl font-bold text-ink-950 leading-tight">Financial guidance is better when you know who is behind it.</h2>
</div>
<div class="p-6 rounded-card bg-white border border-border-light shadow-sm">
<p class="font-serif-italic text-lg sm:text-xl text-ink-950 leading-relaxed">The first step is understanding what is actually holding you back — then building a strategy around your situation, not someone else’s.</p>
<p class="font-bold text-sm text-ink-950 mt-4">Jessica Sotolongo</p>
<p class="text-xs text-text-muted">Founder &amp; CEO, InterCredit Solution</p>
</div>
<div class="max-w-prose text-sm text-text-secondary space-y-4 leading-relaxed">
<p>Jessica leads InterCredit with a focus on helping individuals, couples and families build a healthier relationship with credit. Her approach combines personalized guidance with practical financial education.</p>
<p>Through financial advice and comprehensive solutions, her work covers credit, protection against fraud, debt negotiation, and the basic knowledge people need to avoid risks and move forward.</p>
</div>
</div>
</div>
</div>
</section>
<section class="w-full bg-ink-950 text-white py-20 lg:py-28 relative overflow-hidden" id="media">
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-12">
${sectionIntro('FEATURED ON UNIVISION / DESPIERTA AMÉRICA', 'Sharing credit guidance with national Spanish-language audiences.', 'Jessica Sotolongo has appeared on Despierta América in segments about debt, credit scores, credit cards and protecting your credit. Watch them here.', true)}
<div data-video-set class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
<div class="lg:col-span-8 space-y-4">
${youtubeCard(segments[0].id, segments[0].title, `Play video: ${segments[0].title}`).replace('border-border-light', 'border-border-dark')}
<div class="space-y-1">
<p data-video-meta class="text-xs font-bold uppercase tracking-widest text-green-400">${segmentMeta(segments[0])}</p>
<h3 data-video-title aria-live="polite" class="text-xl font-bold text-white" lang="es">${segments[0].title}</h3>
<a data-video-link class="inline-block py-3.5 -my-1 text-sm text-white/80 underline underline-offset-4 hover:text-white transition-colors" href="https://www.youtube.com/watch?v=${segments[0].id}" rel="noopener" target="_blank">Watch on the Despierta América channel</a>
</div>
</div>
<ul class="lg:col-span-4 space-y-3" aria-label="Choose a segment">
${segments.map((segment, index) => `<li><button type="button" class="video-choice" data-video-choice data-id="${segment.id}" data-title="${segment.title}" data-meta="${segmentMeta(segment)}" aria-pressed="${index === 0}"><img alt="" decoding="async" height="360" loading="lazy" src="https://i.ytimg.com/vi/${segment.id}/hqdefault.jpg" width="480"/><span><span class="block text-sm font-bold text-white">${segment.topic}</span><span class="block text-xs text-white/60">${segment.year} · In Spanish</span></span></button></li>`).join('\n')}
</ul>
</div>
<ul class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 ">
${[['gallery-8', 'Jessica Sotolongo on the Despierta América set during a back-to-school segment'], ['gallery-13', 'Jessica Sotolongo with a host on a television studio set'], ['gallery-10', 'Jessica Sotolongo with two television hosts'], ['gallery-16', 'Jessica Sotolongo hosting a Facebook Live broadcast'], ['office-magazine', 'A magazine cover featuring Jessica Sotolongo, displayed at the office', 1280, 720]].map(([file, alt, width = 850, height = 637]) => `<li data-reveal class="rounded-card overflow-hidden border border-border-dark bg-ink-900 aspect-[4/3]">${photo(file, alt, { width, height })}</li>`).join('\n')}
</ul>
</div>
</section>
<section class="w-full bg-white py-20 lg:py-28 border-b border-border-light" id="team">
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
${sectionIntro('MEET OUR TEAM', 'The people you will work with.', 'A Miami-based team that looks at the main aspects of your finances, offers a tailored plan, and guides you through each step.')}
<ul class="grid grid-cols-2 md:grid-cols-3 gap-6">
${team.map(([name, role, file]) => `<li data-reveal class="rounded-card overflow-hidden bg-porcelain-50 border border-border-light">
<img alt="${name}, ${role}" class="w-full h-auto" decoding="async" height="450" loading="lazy" src="/assets/team-${file}.jpg" width="450"/>
<div class="p-5"><h3 class="font-bold text-base text-ink-950">${name}</h3><p class="text-xs text-text-secondary">${role}</p></div>
</li>`).join('\n')}
</ul>
</div>
</section>
<section class="w-full bg-paper-100 py-20 lg:py-28" id="community">
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
${sectionIntro('BEYOND THE OFFICE', 'Events and recognitions.', 'Moments from events the team has taken part in, and recognitions displayed at the office.')}
<ul class="grid grid-cols-2 lg:grid-cols-12 gap-4 lg:gap-6">
${[['gallery-1', 'Jessica Sotolongo with a group of women at an event', 'lg:col-span-7 aspect-[4/3] lg:aspect-[16/10]', 850, 637], ['gallery-7', 'The InterCredit team at an event booth with the company banner', 'lg:col-span-5 aspect-[4/3] lg:aspect-auto', 850, 638], ['gallery-11', 'Jessica Sotolongo with fellow attendees at a community event', 'lg:col-span-6 aspect-[4/3] lg:aspect-video', 850, 638], ['office-recognitions', 'Certificates and recognitions displayed at the InterCredit office', 'lg:col-span-6 aspect-[4/3] lg:aspect-video', 1280, 720]].map(([file, alt, span, width, height]) => `<li data-reveal class="rounded-card overflow-hidden border border-border-light bg-white shadow-sm ${span}">${photo(file, alt, { width, height })}</li>`).join('\n')}
</ul>
</div>
</section>
${approachSection('bg-white', ['photo-1608', 'Jessica Sotolongo explaining printed material across the table during a consultation'])}
<section class="w-full bg-porcelain-50 py-20 lg:py-28" id="office">
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
<div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
<div class="lg:col-span-6 space-y-6">
${sectionIntro('VISIT OR CALL', 'Based in Miami, with in-person and remote consultations.')}
${officeVideo('Video walkthrough of the InterCredit office in Miami')}
${textLink('Contact details', '/contact-us/')}
</div>
<div class="lg:col-span-6">${officeCard}</div>
</div>
</div>
</section>
${closingCta()}`,
});

const contact = page({
  title: 'Contact Us — InterCredit Solution',
  description: 'Call or visit InterCredit Solution in Miami to start with a 20-minute consultation about your credit or debt situation.',
  current: '/contact-us/',
  body: `${hero({
    trail: [['Home', '/'], ['Contact']],
    label: 'CONTACT &amp; CONSULTATION',
    title: 'Let’s talk about <span class="font-serif-italic font-normal brand-gradient-text">your goal</span>.',
    lead: 'Start with your situation. In a 20-minute consultation, an advisor reviews the context, answers your questions, and explains the options that may fit.',
    actions: `${primaryButton('Book a 20-Minute Consultation', '#book-consultation')}${callButton(true)}`,
    aside: heroPhoto('photo-1602', 'Jessica Sotolongo smiling across her desk at two visitors during a consultation'),
  })}
<section class="w-full bg-porcelain-50 py-20 lg:py-28">
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
<div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
<div class="lg:col-span-6 space-y-6">
${sectionIntro('REACH US DIRECTLY', 'Speak with our team.', 'Book your consultation online below, or call us during office hours and we will find a time that works for you, in person at our Miami office or remotely.')}
<p class="text-xs text-text-muted max-w-prose">You do not need to arrive knowing which service you need. Start with what you are trying to solve.</p>
${officeVideo('Video walkthrough of the InterCredit office in Miami')}
</div>
<div class="lg:col-span-6">${officeCard}</div>
</div>
<div class="mt-12">${officeMap()}</div>
</div>
</section>
${bookingSection()}
${faqSection()}
${closingCta('Prefer to speak directly right now?')}`,
});

const reviews = page({
  title: 'Client Reviews — InterCredit Solution',
  description: 'Watch InterCredit Solution clients describe their experience in their own words.',
  current: '/reviews/',
  body: `${hero({
    trail: [['Home', '/'], ['Reviews']],
    label: 'REAL EXPERIENCES',
    title: 'See what clients say about <span class="font-serif-italic font-normal brand-gradient-text">working with InterCredit</span>.',
    lead: 'The most useful proof is not an empty guarantee. It is hearing how real clients describe the experience, communication, and support they received.',
  })}
<section class="w-full bg-porcelain-50 py-20 lg:py-28">
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
${sectionIntro('CLIENT VIDEO STORIES', 'In their own words.')}
<div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
${stories.map(([name, headline, id]) => `<article data-reveal class="space-y-4">
${youtubeCard(id, `InterCredit client story: ${name}`, `Play client story from ${name}`)}
<div><h3 class="font-bold text-lg text-ink-950">${name}</h3><p class="text-sm text-text-secondary">${headline}</p></div>
<a class="inline-block py-3.5 -my-3.5 text-sm text-teal-600 underline underline-offset-4 hover:text-green-600 transition-colors" href="https://www.youtube.com/watch?v=${id}" rel="noopener" target="_blank">Watch on YouTube</a>
</article>`).join('\n')}
</div>
<p class="text-xs text-text-muted max-w-prose">Each client’s situation is different. These stories describe individual experiences and are not a promise of a specific result.</p>
</div>
</section>
<section class="w-full bg-white border-y border-border-light py-20 lg:py-28">
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
${reviewsComponent({ layout: 'grid' })}
</div>
</section>
<section class="w-full bg-ink-950 text-white py-20 lg:py-28 relative overflow-hidden">
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
<div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
<div class="lg:col-span-5 space-y-4">
${eyebrow('EXPERIENCE YOU CAN SEE', true)}
<h2 class="text-3xl sm:text-4xl font-bold text-white leading-tight">Credit guidance should be backed by more than promises.</h2>
<p class="text-sm text-white/70 leading-relaxed">InterCredit combines hands-on client work with public financial education. Univision has featured Jessica Sotolongo in segments covering credit myths, credit reports, and rebuilding credit.</p>
<a class="inline-flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider text-green-400 hover:text-white transition-colors py-3.5 -my-3.5" href="/about-us/#media"><span>About our media appearances</span>${arrow}</a>
</div>
<div class="lg:col-span-7"><div class="rounded-card-lg overflow-hidden bg-ink-900 border border-border-dark shadow-2xl aspect-video">${photo('photo-1640', 'An InterCredit advisor and a visitor reviewing documents together in the office')}</div></div>
</div>
</div>
</section>
${approachSection('bg-white', ['photo-1626', 'Jessica Sotolongo shaking hands across her desk'])}
${closingCta()}`,
});

// Literal legal text, copied from the live site into scripts/content/*.html (headings, paragraphs and lists only).
const legalContent = (name) => readFileSync(new URL(`./content/${name}.html`, import.meta.url), 'utf8');

const legalPage = ({ title, current, label, lead, content, robots = '' }) => page({
  title: `${title} — InterCredit Solution`,
  description: `${title} of InterCredit Solution.`,
  current,
  robots,
  body: `${hero({ trail: [['Home', '/'], [title]], label, title, lead })}
<section class="w-full bg-porcelain-50 py-16 lg:py-24">
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
<div class="legal-prose max-w-prose text-sm text-text-secondary leading-relaxed">
${content}
</div>
</div>
</section>`,
});

const privacy = legalPage({
  title: 'Privacy Policy',
  current: '/privacy-policy/',
  label: 'LEGAL',
  lead: 'How InterCredit Solution collects, uses, and protects your information.',
  content: legalContent('privacy-policy'),
});

const terms = legalPage({
  title: 'Terms &amp; Conditions',
  current: '/terms-and-conditions/',
  label: 'LEGAL',
  lead: 'The terms that apply to your use of the InterCredit Solution website and services.',
  content: legalContent('terms-and-conditions'),
});

const notFound = page({
  title: 'Page not found — InterCredit Solution',
  description: 'The page you are looking for could not be found.',
  robots: 'noindex',
  body: `${hero({
    trail: [['Home', '/'], ['Page not found']],
    label: 'ERROR 404',
    title: 'This page could not be found.',
    lead: 'The link may be outdated or the page may have moved. These are good places to continue.',
    actions: `${primaryButton('Back to Home', '/')}<a class="inline-flex items-center justify-center gap-2 rounded-btn border border-white/30 bg-white/95 px-6 py-4 text-sm font-bold text-text-primary shadow-sm transition-colors hover:bg-white" href="/services/"><span>View Services</span>${icon('arrow_forward', 'icon-nudge text-[18px] text-teal-700')}</a>`,
    aside: heroPhoto('photo-1631', 'A handshake across the table in one of the InterCredit offices'),
  })}
<section class="w-full bg-porcelain-50 py-16 lg:py-24">
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
${[['About Us', 'Meet the team behind InterCredit.', '/about-us/'], ['Client Reviews', 'Hear clients describe their experience.', '/reviews/'], ['Contact', 'Call or visit our Miami office.', '/contact-us/']].map(([name, text, href]) => `<a data-reveal class="group p-8 rounded-card bg-white border border-border-light shadow-sm hover:border-teal-500/50 hover:shadow-md transition-all space-y-2" href="${href}"><span class="block font-bold text-base text-ink-950">${name}</span><span class="block text-sm text-text-secondary">${text}</span><span class="inline-flex items-center gap-1.5 pt-2 font-bold text-xs uppercase tracking-wider text-teal-600 group-hover:text-green-600 transition-colors">Open ${arrow}</span></a>`).join('\n')}
</div>
</div>
</section>`,
});

// ---------- Write ----------

const pages = {
  'about-us/index.html': about,
  'contact-us/index.html': contact,
  'reviews/index.html': reviews,
  'services/index.html': servicesIndex,
  'privacy-policy/index.html': privacy,
  'terms-and-conditions/index.html': terms,
  '404.html': notFound,
  ...Object.fromEntries(services.map((service) => [`services/${service.slug}/index.html`, servicePage(service)])),
};

// One icon font request for the whole site, limited to the icons actually used.
const dist = new URL('../dist/', import.meta.url);
const homePath = new URL('index.html', dist);
let home = readFileSync(homePath, 'utf8');
// Same header on the homepage, so every page is reachable from every page.
home = home.replace(/<a class="sr-only[\s\S]*?(?=<main id="main-content">)/, () => `${header('/').trim()}\n`);
home = home.replace(/<footer[\s\S]*?<\/footer>/, () => footer.slice(0, footer.indexOf('</footer>') + 9).trim());
home = home.replace(/<!-- google-badge:start -->[\s\S]*?<!-- google-badge:end -->/, () => `<!-- google-badge:start -->\n<div>${googleBadge({ href: '#google-reviews' })}</div>\n<!-- google-badge:end -->`);
home = home.replace(/<!-- booking-chips:start -->[\s\S]*?<!-- booking-chips:end -->/, () => `<!-- booking-chips:start -->\n${bookingStepChips()}\n<!-- booking-chips:end -->`);
if (!home.includes('cdn.userway.org')) home = home.replace('</body>', `${USERWAY}\n</body>`);
home = home.replace(/<!-- booking:start -->[\s\S]*?<!-- booking:end -->/, () => `<!-- booking:start -->\n${bookingSection()}\n<!-- booking:end -->`);
home = home.replace(/<!-- reviews:start -->[\s\S]*?<!-- reviews:end -->/, () => `<!-- reviews:start -->\n${reviewsComponent({ summary: false })}\n<!-- reviews:end -->`);
home = home.replace(/<!-- reviews-summary:start -->[\s\S]*?<!-- reviews-summary:end -->/, () => `<!-- reviews-summary:start -->\n${reviewsSummaryCard()}\n<!-- reviews-summary:end -->`);
const used = new Set(['pause', 'play_arrow']);
for (const html of [home, ...Object.values(pages)]) {
  for (const match of html.matchAll(/class="[^"]*material-symbols-outlined[^"]*"[^>]*>\s*([a-z_0-9]+)\s*</g)) used.add(match[1]);
}
const iconFont = `https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&amp;icon_names=${[...used].sort().join(',')}&amp;display=block`;
home = home.replace(/https:\/\/fonts\.googleapis\.com\/css2\?family=Material\+Symbols\+Outlined[^"]*/, iconFont);
writeFileSync(homePath, home);

for (const [path, html] of Object.entries(pages)) {
  const target = new URL(path, dist);
  mkdirSync(dirname(target.pathname), { recursive: true });
  // Pages that carry the scheduler book in place instead of sending visitors to Contact.
  const local = html.includes('id="book-consultation"') ? html.replaceAll('href="/contact-us/#book-consultation"', 'href="#book-consultation"') : html;
  writeFileSync(target, local.replace(FONT_ICONS, iconFont));
}
console.log(`Built ${Object.keys(pages).length} pages, ${used.size} icons.`);
