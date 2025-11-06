'use strict';

// Get React Hooks from the global 'React' object
const { useLayoutEffect, useRef, useState } = React;

// 1. Icon Component (Replaces react-icons)
// Used for the arrow icon in the nav card links
const IconArrowUpRight = ({ className, ...props }) => {
  return (
    <svg
      stroke="currentColor"
      fill="currentColor"
      strokeWidth="0"
      viewBox="0 0 16 16"
      className={className}
      height="1em"
      width="1em"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        fillRule="evenodd"
        d="M14 2.5a.5.5 0 0 0-.5-.5h-6a.5.5 0 0 0 0 1h4.793L2.146 13.146a.5.5 0 0 0 .708.708L13 3.707V8.5a.5.5 0 0 0 1 0v-6z"
      ></path>
    </svg>
  );
};

// 2. The Main CardNav Component
const CardNav = ({
  logo,
  logoAlt = 'Logo',
  items,
  className = '',
  ease = 'power3.out',
  baseColor = '#111111',
  menuColor,
  buttonBgColor,
  buttonTextColor
}) => {
  const [isHamburgerOpen, setIsHamburgerOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const navRef = useRef(null);
  const cardsRef = useRef([]);
  const tlRef = useRef(null);
  
  // Custom Logo component for the text brand
  const LogoComponent = () => (
    <a href="#hero" className="brand" style={{ color: menuColor }}>
        {logo}
    </a>
  );

  // Calculates the necessary height for the expanding menu (critical for mobile)
  const calculateHeight = () => {
    const navEl = navRef.current;
    if (!navEl) return 260;

    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    if (isMobile) {
      const contentEl = navEl.querySelector('.card-nav-content');
      if (contentEl) {
        // Temporarily reset styles to calculate true height before animation starts
        const wasVisible = contentEl.style.visibility;
        const wasPointerEvents = contentEl.style.pointerEvents;
        const wasPosition = contentEl.style.position;
        const wasHeight = contentEl.style.height;

        contentEl.style.visibility = 'visible';
        contentEl.style.pointerEvents = 'auto';
        contentEl.style.position = 'static';
        contentEl.style.height = 'auto';

        contentEl.offsetHeight; // Force reflow

        const topBar = 60; // Height of the header bar
        const padding = 16;
        const contentHeight = contentEl.scrollHeight;

        // Restore original styles
        contentEl.style.visibility = wasVisible;
        contentEl.style.pointerEvents = wasPointerEvents;
        contentEl.style.position = wasPosition;
        contentEl.style.height = wasHeight;

        return topBar + contentHeight + padding;
      }
    }
    // Desktop height is fixed to a suitable value for the cards
    return 260; 
  };

  // Creates the GSAP timeline for menu animation
  const createTimeline = () => {
    const navEl = navRef.current;
    if (!navEl) return null;
    
    // Set initial hidden states
    gsap.set(navEl, { height: 60, overflow: 'hidden' });
    gsap.set(cardsRef.current, { y: 50, opacity: 0 });

    const tl = gsap.timeline({ paused: true });

    // Step 1: Expand the main navigation container
    tl.to(navEl, {
      height: calculateHeight,
      duration: 0.4,
      ease
    });

    // Step 2: Animate the cards in (staggered)
    tl.to(cardsRef.current, { y: 0, opacity: 1, duration: 0.4, ease, stagger: 0.08 }, '-=0.1');

    return tl;
  };
  
  // Toggle handlers
  const openMenu = () => {
    const tl = tlRef.current;
    if (!tl || isExpanded) return;
    
    setIsHamburgerOpen(true);
    setIsExpanded(true);
    tl.play(0);
  };

  const closeMenu = () => {
    const tl = tlRef.current;
    if (!tl || !isExpanded) return;
    
    setIsHamburgerOpen(false);
    // Set a callback to clean up the state after the animation finishes reversing
    tl.eventCallback('onReverseComplete', () => setIsExpanded(false));
    tl.reverse();
  };
  
  const toggleMenu = () => {
    if (!isExpanded) {
      openMenu();
    } else {
      closeMenu();
    }
  };


  // Setup effect (runs once on mount)
  useLayoutEffect(() => {
    const tl = createTimeline();
    tlRef.current = tl;
    
    const navEl = navRef.current;

    // Mobile: Attach click handler to hamburger
    const hamburger = navEl?.querySelector('.hamburger-menu');
    if (hamburger) {
       hamburger.addEventListener('click', toggleMenu);
    }

    // Desktop: Attach hover handlers
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    if (!isMobile) {
      navEl?.addEventListener('mouseenter', openMenu);
      navEl?.addEventListener('mouseleave', closeMenu);
    }

    // Cleanup listeners on unmount
    return () => {
      tl?.kill();
      tlRef.current = null;
      hamburger?.removeEventListener('click', toggleMenu);
      navEl?.removeEventListener('mouseenter', openMenu);
      navEl?.removeEventListener('mouseleave', closeMenu);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ease, items]);

  // Resize effect (handles recalculating height if the viewport changes while expanded)
  useLayoutEffect(() => {
    const handleResize = () => {
      if (!tlRef.current) return;

      if (isExpanded) {
        // If expanded, update height immediately
        const newHeight = calculateHeight();
        gsap.set(navRef.current, { height: newHeight });

        // Recreate timeline and set progress to 1 to match new height
        tlRef.current.kill();
        const newTl = createTimeline();
        if (newTl) {
          newTl.progress(1);
          tlRef.current = newTl;
        }
      } else {
        // If not expanded, just update the timeline for the next expansion
        tlRef.current.kill();
        const newTl = createTimeline();
        if (newTl) {
          tlRef.current = newTl;
        }
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isExpanded]);

  const setCardRef = i => el => {
    if (el) cardsRef.current[i] = el;
  };

  return (
    <div className={`card-nav-container ${className}`}>
      <nav ref={navRef} className={`card-nav ${isExpanded ? 'open' : ''}`} style={{ backgroundColor: baseColor }}>
        <div className="card-nav-top">
          {/* Hamburger Menu (Mobile Trigger) */}
          <div
            className={`hamburger-menu ${isHamburgerOpen ? 'open' : ''}`}
            role="button"
            aria-label={isExpanded ? 'Close menu' : 'Open menu'}
            tabIndex={0}
            style={{ color: menuColor || '#fff' }}
          >
            <div className="hamburger-line" />
            <div className="hamburger-line" />
            <div className="hamburger-line" />
          </div>

          <div className="logo-container">
            <LogoComponent />
          </div>

          {/* CTA Button */}
          <button
            type="button"
            className="card-nav-cta-button"
            style={{ backgroundColor: buttonBgColor, color: buttonTextColor }}
          >
            Book Now
          </button>
        </div>

        {/* Dynamic Card Content */}
        <div className="card-nav-content" aria-hidden={!isExpanded}>
          {(items || []).slice(0, 3).map((item, idx) => (
            <div
              key={`${item.label}-${idx}`}
              className="nav-card"
              ref={setCardRef(idx)}
              style={{ backgroundColor: item.bgColor, color: item.textColor }}
            >
              <div className="nav-card-label">{item.label}</div>
              <div className="nav-card-links">
                {item.links?.map((lnk, i) => (
                  <a key={`${lnk.label}-${i}`} className="nav-card-link" href={lnk.href} onClick={closeMenu} aria-label={lnk.ariaLabel}>
                    <IconArrowUpRight className="nav-card-link-icon" aria-hidden="true" />
                    {lnk.label}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </nav>
    </div>
  );
};

// 3. Application Setup and Data
const navItems = [
    { label: 'Services', bgColor: '#E6F3FF', textColor: '#005299', links: [
        { label: 'Detailing', href: '#services' },
        { label: 'Tuning', href: '#services' },
        { label: 'Custom Paint', href: '#services' },
    ]},
    { label: 'Restoration', bgColor: '#E0F8F0', textColor: '#006644', links: [
        { label: 'Full Restoration', href: '#restoration' },
        { label: 'Classic Bikes', href: '#restoration' },
        { label: 'Our Work', href: '#highlights' },
    ]},
    { label: 'About & Contact', bgColor: '#F3EBF9', textColor: '#441973', links: [
        { label: 'Our Story', href: '#about' },
        { label: 'Testimonials', href: '#testimonials' },
        { label: 'Book Service', href: '#contact-cta' },
    ]}
];

const App = () => {
    return (
        <CardNav
            logo="MotoSpa" 
            logoAlt="MotoSpa Logo"
            items={navItems}
            baseColor="#111111" 
            menuColor="#ffffff" 
            buttonBgColor="#FF4500" 
            buttonTextColor="#FFFFFF"
        />
    );
}

// 4. Final Render Call (Runs once React and Babel are loaded)
document.addEventListener('DOMContentLoaded', () => {
    const domNode = document.getElementById('card-nav-root');
    if (domNode) {
        const root = ReactDOM.createRoot(domNode);
        root.render(<App />);
    } else {
        console.error("Could not find the root element 'card-nav-root'");
    }
});