/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useState, useEffect, useRef } from 'react';

export function useScrollDirection() {
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    const updateScrollDirection = () => {
      const scrollY = window.scrollY;

      // Always show bars near the very top of the page
      if (scrollY <= 15) {
        setIsVisible(true);
        lastScrollY.current = scrollY;
        ticking.current = false;
        return;
      }

      const diff = scrollY - lastScrollY.current;

      // Scrolling down past threshold (> 25px delta) -> hide
      if (diff > 25 && scrollY > 50) {
        setIsVisible(false);
        lastScrollY.current = scrollY;
      } else if (diff < -15) {
        // Scrolling up (<-15px delta) -> reveal
        setIsVisible(true);
        lastScrollY.current = scrollY;
      }

      ticking.current = false;
    };

    const onScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(updateScrollDirection);
        ticking.current = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return isVisible;
}
