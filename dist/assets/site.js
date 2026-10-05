(() => {
  // Solutions dropdown
  const solutionsNavigation = document.getElementById('solutions-navigation');
  const solutionsToggle = document.getElementById('solutions-toggle');
  const solutionsDropdown = document.getElementById('solutions-dropdown');
  if (solutionsNavigation && solutionsToggle && solutionsDropdown) {
    const toggleIcon = solutionsToggle.querySelector('span');
    const setSolutionsOpen = (open) => {
      solutionsDropdown.hidden = !open;
      solutionsDropdown.style.display = open ? 'flex' : 'none';
      solutionsToggle.setAttribute('aria-expanded', String(open));
      if (toggleIcon) toggleIcon.style.transform = open ? 'rotate(180deg)' : '';
    };
    setSolutionsOpen(false);
    solutionsToggle.addEventListener('click', () => setSolutionsOpen(solutionsDropdown.hidden));
    solutionsToggle.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setSolutionsOpen(true);
        solutionsDropdown.querySelector('a')?.focus();
      }
    });
    solutionsNavigation.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !solutionsDropdown.hidden) {
        setSolutionsOpen(false);
        solutionsToggle.focus();
      }
    });
    solutionsNavigation.addEventListener('focusout', (event) => {
      if (!solutionsNavigation.contains(event.relatedTarget)) setSolutionsOpen(false);
    });
    // A pointer press must not blur the toggle, or focusout closes the menu before the click lands.
    solutionsDropdown.addEventListener('mousedown', (event) => event.preventDefault());
    solutionsDropdown.addEventListener('click', (event) => {
      if (event.target.closest('a')) setSolutionsOpen(false);
    });
    document.addEventListener('click', (event) => {
      if (!solutionsNavigation.contains(event.target)) setSolutionsOpen(false);
    });
  }

  // Mobile navigation drawer
  const mobileNavigation = document.getElementById('mobile-navigation');
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
  const mobileMenuClose = document.getElementById('mobile-menu-close');
  if (mobileNavigation && mobileMenuToggle && mobileMenuClose) {
    const background = [...document.body.children].filter((element) => element !== mobileNavigation && element.tagName !== 'SCRIPT');
    const isOpen = () => !mobileNavigation.classList.contains('hidden');
    const setMobileNavigation = (open, restoreFocus = true) => {
      mobileNavigation.classList.toggle('hidden', !open);
      mobileMenuToggle.setAttribute('aria-expanded', String(open));
      document.body.classList.toggle('overflow-hidden', open);
      background.forEach((element) => { element.inert = open; });
      if (open) mobileMenuClose.focus();
      else if (restoreFocus) mobileMenuToggle.focus();
    };
    mobileMenuToggle.addEventListener('click', () => setMobileNavigation(true));
    mobileMenuClose.addEventListener('click', () => setMobileNavigation(false));
    mobileNavigation.addEventListener('click', (event) => {
      if (event.target === mobileNavigation) setMobileNavigation(false);
      else if (event.target.closest('a')) setMobileNavigation(false, false);
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && isOpen()) setMobileNavigation(false);
    });
    // The drawer does not exist at desktop widths; never leave the page locked behind it.
    const desktop = window.matchMedia('(min-width: 1280px)');
    desktop.addEventListener?.('change', (event) => {
      if (event.matches && isOpen()) setMobileNavigation(false, false);
    });
  }

  // Hero background video: started here so reduced-motion users never see it move.
  const heroVideo = document.getElementById('hero-background-video');
  const heroVideoToggle = document.getElementById('hero-video-toggle');
  const heroVideoToggleIcon = document.getElementById('hero-video-toggle-icon');
  if (heroVideo && heroVideoToggle && heroVideoToggleIcon) {
    const syncHeroVideoState = () => {
      const playing = !heroVideo.paused;
      heroVideoToggleIcon.textContent = playing ? 'pause' : 'play_arrow';
      heroVideoToggle.setAttribute('aria-label', playing ? 'Pause background video' : 'Play background video');
    };
    heroVideo.addEventListener('play', syncHeroVideoState);
    heroVideo.addEventListener('pause', syncHeroVideoState);
    syncHeroVideoState();
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) heroVideo.play().catch(() => {});
    heroVideoToggle.addEventListener('click', () => {
      if (heroVideo.paused) heroVideo.play().catch(() => {});
      else heroVideo.pause();
    });
  }

  const playIcon = '<span class="testimonial-play-icon" aria-hidden="true"><svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></span>';
  const playYouTube = (container, id, title) => {
    const frame = document.createElement('iframe');
    frame.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&playsinline=1&cc_load_policy=1';
    frame.title = title;
    frame.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    frame.referrerPolicy = 'strict-origin-when-cross-origin';
    frame.allowFullscreen = true;
    container.replaceChildren(frame);
    frame.focus();
  };

  // Client stories
  const storyIds = ['0xNgJalGbg8', 'U_I_pAV_Hlk', 'ZwkhIzVObus'];
  const storyPlayer = document.getElementById('testimonial-player');
  const storyTitle = document.getElementById('testimonial-title');
  const storyCount = document.getElementById('testimonial-count');
  const storyLink = document.getElementById('testimonial-youtube');
  const storyChoices = [...document.querySelectorAll('.testimonial-choice')];
  if (storyPlayer && storyTitle && storyCount && storyLink) {
    let selectedStory = 0;
    const selectStory = (index) => {
      selectedStory = (index + storyIds.length) % storyIds.length;
      const id = storyIds[selectedStory];
      const number = String(selectedStory + 1).padStart(2, '0');
      storyPlayer.innerHTML = '<a id="testimonial-play" aria-label="Play client story ' + number + '" href="https://www.youtube.com/watch?v=' + id + '"><img src="https://i.ytimg.com/vi/' + id + '/maxresdefault.jpg" alt="" width="1280" height="720"/>' + playIcon + '</a>';
      storyTitle.textContent = 'Client story ' + number;
      storyCount.textContent = number + ' / 03';
      storyLink.href = 'https://www.youtube.com/watch?v=' + id;
      storyChoices.forEach((button, i) => button.setAttribute('aria-pressed', String(i === selectedStory)));
    };
    storyChoices.forEach((button, i) => button.addEventListener('click', () => selectStory(i)));
    document.getElementById('testimonial-prev')?.addEventListener('click', () => selectStory(selectedStory - 1));
    document.getElementById('testimonial-next')?.addEventListener('click', () => selectStory(selectedStory + 1));
    storyPlayer.addEventListener('click', (event) => {
      if (!event.target.closest('#testimonial-play')) return;
      event.preventDefault();
      playYouTube(storyPlayer, storyIds[selectedStory], 'InterCredit client story ' + (selectedStory + 1));
    });
  }

  // Ambient videos play only while visible, and never when reduced motion is requested.
  const ambientVideos = document.querySelectorAll('[data-ambient-video]');
  if (ambientVideos.length && 'IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const watcher = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.play().catch(() => {});
      else entry.target.pause();
    }), { threshold: 0.35 });
    ambientVideos.forEach((video) => watcher.observe(video));
  }

  // Video sets: a list of choices swaps what the player next to it will play.
  document.querySelectorAll('[data-video-set]').forEach((set) => {
    const player = set.querySelector('[data-youtube]');
    const choices = [...set.querySelectorAll('[data-video-choice]')];
    if (!player) return;
    choices.forEach((choice) => choice.addEventListener('click', () => {
      const { id, title, meta } = choice.dataset;
      player.dataset.youtube = id;
      player.dataset.title = title;
      player.innerHTML = '<a aria-label="Play video: ' + title.replace(/"/g, '&quot;') + '" href="https://www.youtube.com/watch?v=' + id + '"><img alt="" height="720" src="https://i.ytimg.com/vi/' + id + '/maxresdefault.jpg" width="1280"/>' + playIcon + '</a>';
      const heading = set.querySelector('[data-video-title]');
      const details = set.querySelector('[data-video-meta]');
      const link = set.querySelector('[data-video-link]');
      if (heading) heading.textContent = title;
      if (details) details.textContent = meta;
      if (link) link.href = 'https://www.youtube.com/watch?v=' + id;
      choices.forEach((other) => other.setAttribute('aria-pressed', String(other === choice)));
    }));
  });

  // Standalone videos: the player loads only after the visitor presses play.
  document.querySelectorAll('[data-youtube]').forEach((player) => {
    player.addEventListener('click', (event) => {
      if (!event.target.closest('a')) return;
      event.preventDefault();
      playYouTube(player, player.dataset.youtube, player.dataset.title || 'InterCredit video');
    });
  });
})();
