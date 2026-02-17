const toggle = document.querySelector('.nav-toggle');
const menu = document.querySelector('#mobile-menu');
const menuClose = menu?.querySelector('.mobile-menu-close');
const header = document.querySelector('.site-header');

// 1. Initialize Icons (CRITICAL for the menu and lightning bolt)
if (window.lucide) {
  window.lucide.createIcons();
}

// 2. Handle Scroll (Restored Animation)
const onScroll = () => {
  if (header) {
    // This toggles the class that triggers your CSS animation
    header.classList.toggle('scrolled', window.scrollY > 50);
  }
};

// 3. Menu Logic (Updated to FORCE White Background)
const setMenuState = (open) => {
  if (!toggle || !menu) return;
  
  toggle.setAttribute('aria-expanded', String(open));
  
  if (open) {
    menu.classList.remove('translate-x-full');
    menu.classList.add('translate-x-0');
    
    // --- FORCE FIX: Ensure background is Solid White ---
    menu.style.backgroundColor = '#ffffff';
    menu.style.opacity = '1';
    // -------------------------------------------------

    document.body.style.overflow = 'hidden'; // Lock scroll
  } else {
    menu.classList.add('translate-x-full');
    menu.classList.remove('translate-x-0');
    document.body.style.overflow = ''; // Unlock scroll
  }
};

toggle?.addEventListener('click', () => {
  const isOpen = menu.classList.contains('translate-x-0');
  setMenuState(!isOpen);
});

menuClose?.addEventListener('click', () => {
  setMenuState(false);
});

// Close menu if clicking outside
document.addEventListener('click', (e) => {
  if (menu && menu.classList.contains('translate-x-0')) {
    if (!menu.contains(e.target) && !toggle.contains(e.target)) {
      setMenuState(false);
    }
  }
});

window.addEventListener('scroll', onScroll);
onScroll();
