(() => {
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const targets = new Map();
  const animations = new Set();
  const observed = new Set();
  let observer;
  const register = (element, variant = 'up', delay = 0) => {
    if (!element || targets.has(element)) return;
    // Avoid nesting reveals, which compounds opacity and delays.
    if ([...targets.keys()].some(parent => parent.contains(element) || element.contains(parent))) return;
    element.dataset.motion = variant;
    element.style.setProperty('--motion-delay', Math.min(delay, 240) + 'ms');
    targets.set(element, { variant, delay });
  };
  const group = (selector, variant = 'up') => {
    document.querySelectorAll(selector).forEach((element, index) => register(element, variant, (index % 4) * 80));
  };
  const sections = [...document.querySelectorAll('main > section')];
  const hero = sections[0];
  // Section intros: eyebrow, title, copy. Leave navigational/sticky elements alone.
  sections.slice(1).forEach(section => {
    const heading = section.querySelector('h2');
    if (!heading) return;
    const intro = heading.parentElement;
    if (intro.matches('.space-y-3,.space-y-4')) {
      [...intro.children].forEach((element, index) => register(element, 'up', index * 80));
    }
  });
  // :has() throws in older engines; losing one stagger must not take the rest of the script down.
  try { group('#goal-selector .grid > div:has(> .goal-card-image), #goal-selector .grid > div:has(> div > .goal-card-image)'); } catch {}
  group('main > section:nth-of-type(2) .grid > div');
  group('#personalized-strategy .flex.flex-col > div');
  register(document.querySelector('#personalized-strategy .lg\\:col-span-5'), 'left');
  group('#financial-journey .lg\\:hidden > div');
  register(document.querySelector('#financial-journey .hidden.lg\\:block'), 'fade');
  register(document.querySelector('.authority-media'), 'fade');
  group('.authority-evidence > div');
  group('#solutions-architecture .p-6');
  register(document.querySelector('#founder-section img')?.parentElement, 'fade');
  [...(document.querySelector('#founder-section .lg\\:col-span-7')?.children || [])].forEach((element, index) => register(element, 'up', index * 80));
  register(document.querySelector('.testimonial-layout'), 'fade');
  group('main > section:not([id]) .md\\:grid-cols-3 > div');
  group('#faq details');
  // Internal pages opt in per element.
  group('[data-reveal]');
  document.querySelectorAll('#consultation-booking h2').forEach(heading => {
    [...heading.parentElement.children].forEach((element,index) => register(element,'up',index*80));
  });
  document.querySelectorAll('#goal-selector .rounded-card-lg,#solutions-architecture .p-6,.authority-evidence > div').forEach(element => element.classList.add('motion-card'));

  const show = element => {
    element.classList.remove('motion-pending');
    observer?.unobserve(element);
    observed.delete(element);
    if (!observed.size) observer?.disconnect();
  };
  const reveal = element => {
    element.classList.add('motion-revealing');
    show(element);
    const finish = event => {
      // Ignore transitions bubbling up from children (hover states inside a revealing card).
      if (event && event.target !== element) return;
      element.classList.remove('motion-revealing');
      element.removeEventListener('transitionend', finish);
    };
    element.addEventListener('transitionend', finish);
    setTimeout(() => finish(), 1000);
  };
  const reset = () => {
    observer?.disconnect();
    observed.clear();
    targets.forEach((_, element) => {
      element.classList.remove('motion-pending','motion-revealing');
    });
    animations.forEach(animation => animation.cancel());
    animations.clear();
  };
  try {
    if (!reduced.matches && 'IntersectionObserver' in window) {
      observer = new IntersectionObserver(entries => {
        entries.forEach(entry => { if (entry.isIntersecting) reveal(entry.target); });
      // The tall top margin counts everything above the fold as intersecting, so content skipped by
      // an anchor jump, a restored scroll position or a fast fling is revealed instead of staying hidden.
      }, { threshold: .12, rootMargin: '100000px 0px -24px 0px' });
      targets.forEach((_, element) => {
        const rect = element.getBoundingClientRect();
        // Visible content, anchors and restored scroll positions never wait.
        if (rect.width && rect.height && rect.top >= innerHeight) {
          element.classList.add('motion-pending');
          observed.add(element);
          observer.observe(element);
        }
      });
      // Hero starts immediately. Keep the LCP heading fully opaque.
      const heroColumn = hero?.querySelector('.lg\\:col-span-7');
      [...(heroColumn?.children || [])].slice(0,6).forEach((element,index) => {
        const heading = element.matches('h1');
        const animation = element.animate([
          { opacity: heading ? 1 : .35, translate: '0 12px' },
          { opacity: 1, translate: '0 0' }
        ], { duration: 620, delay: index * 80, fill: 'backwards', easing: 'cubic-bezier(.22,1,.36,1)' });
        animations.add(animation);
        animation.finished.then(() => animations.delete(animation)).catch(() => {});
      });
      const visual = hero?.querySelector('.lg\\:col-span-5');
      if (visual?.getBoundingClientRect().width) {
        const animation = visual.animate([{opacity:.5,translate:'0 14px'},{opacity:1,translate:'0 0'}],{duration:620,delay:320,fill:'backwards',easing:'cubic-bezier(.22,1,.36,1)'});
        animations.add(animation);
        animation.finished.then(() => animations.delete(animation)).catch(() => {});
      }
    }
  } catch { reset(); }
  reduced.addEventListener?.('change', reset);
  // Keyboard focus never lands on visually hidden content.
  document.addEventListener('focusin', event => {
    event.target.closest('.motion-pending') && show(event.target.closest('.motion-pending'));
  });
  window.addEventListener('pageshow', event => {
    if (event.persisted) reset();
  });
  // Single passive scroll listener, only toggles state at the threshold.
  const header = document.querySelector('header.sticky');
  let scrolled;
  const updateHeader = () => {
    const next = scrollY > 24;
    if (next !== scrolled) {
      header?.classList.toggle('is-scrolled', next);
      scrolled = next;
    }
  };
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  // Native details semantics retained; a short measured-height transition only on click.
  document.querySelectorAll('#faq details').forEach(details => {
    const summary = details.querySelector('summary');
    if (!summary) return;
    let animation, desired = details.open;
    summary.addEventListener('click', event => {
      if (reduced.matches || !details.animate) return;
      event.preventDefault();
      const from = details.getBoundingClientRect().height;
      const wasOpen = animation ? desired : details.open;
      animation?.cancel();
      desired = !wasOpen;
      details.toggleAttribute('data-closing', !desired);
      details.open = true;
      const style = getComputedStyle(details);
      const closed = summary.getBoundingClientRect().height + parseFloat(style.paddingTop) + parseFloat(style.paddingBottom) + parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);
      const to = desired ? details.getBoundingClientRect().height : closed;
      details.style.overflow = 'hidden';
      animation = details.animate([{height:from+'px'},{height:to+'px'}],{duration:220,easing:'cubic-bezier(.22,1,.36,1)'});
      animations.add(animation);
      const current = animation;
      animation.finished.then(() => {
        if (animation !== current) return;
        details.open = desired;
        details.removeAttribute('data-closing');
        details.style.overflow = '';
        animations.delete(current);
        animation = null;
      }).catch(() => {
        animations.delete(current);
        if (animation === current) { details.open = desired; details.removeAttribute('data-closing'); details.style.overflow = ''; }
      });
    });
  });
})();
