'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { usePathname } from 'next/navigation';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function GSAPReveal() {
  const pathname = usePathname();

  useGSAP(() => {
    const revealItems = document.querySelectorAll(".reveal");
    
    if (!revealItems.length) return;

    // Respetar preferencias de movimiento reducido
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      revealItems.forEach((item) => item.classList.add("is-visible"));
      return;
    }

    revealItems.forEach((item, index) => {
      gsap.to(item, {
        scrollTrigger: {
          trigger: item,
          start: "top 88%",
          once: true,
        },
        opacity: 1,
        y: 0,
        duration: 0.65,
        delay: Math.min(index * 0.04, 0.18),
        ease: "power2.out",
        onComplete: () => item.classList.add("is-visible"),
      });
    });

    // Limpieza automática al desmontar (manejada por useGSAP)
    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, [pathname]); // Se vuelve a ejecutar cada vez que cambias de página

  return null;
}