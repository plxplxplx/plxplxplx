'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { FaInstagram, FaFacebookF } from 'react-icons/fa';
import { useEffect, useRef } from 'react';

export default function Navbar() {
  const path = usePathname() || '/';
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const updateNavHeight = () => {
      if (navRef.current) {
        const navHeight = navRef.current.offsetHeight;
        document.documentElement.style.setProperty('--nav-h', `${navHeight}px`);
      }
    };

    updateNavHeight();
    window.addEventListener('resize', updateNavHeight);
    return () => {
      window.removeEventListener('resize', updateNavHeight);
    };
  }, []);

  const BORDER = 'border';
  const BORDER_COLOR = 'border-[#91A878]';
  const FONT = 'font-mono';

  const CELL = `${BORDER} ${BORDER_COLOR} px-2 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm transition-colors duration-150`;
  const CELL_CONTENT = `flex items-center justify-center w-full h-full`;

  const isActive = (href: string) =>
    path === href ? 'underline font-bold' : 'hover:underline';

  const externalLink = (label: string, href: string) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`${CELL_CONTENT} text-[#FDFD96] text-sm sm:text-base font-semibold hover:underline`}
    >
      {label}
    </a>
  );

  return (
    <nav ref={navRef} className="fixed top-0 left-0 w-full z-50 bg-black shadow-md">
      <div className="w-full">
        {/* Mobile layout */}
        <div className="flex flex-col items-center justify-center md:hidden border-b border-[#91A878] bg-[#1E1E1E]">
          {/* Logo */}
          <div className="w-full bg-[#c98bb6]/50 flex items-center justify-center py-2 border-b border-[#91A878]">
            <Link href="/" aria-label="PLX Home">
              <Image
                src="/recordshuvud_white.webp"
                alt="PLX Logo"
                width={32}
                height={32}
                priority
              />
            </Link>
          </div>

          {/* Socials */}
          <div className="flex w-full border-b border-[#91A878]">
            <div className={`${CELL} flex-1`}>
              <a
                href="https://www.instagram.com/plxplxplx/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className={`${CELL_CONTENT} text-[#FDFD96] text-lg font-semibold hover:underline`}
              >
                <FaInstagram />
              </a>
            </div>
            <div className={`${CELL} flex-1`}>
              <a
                href="https://www.facebook.com/plxplxplx"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className={`${CELL_CONTENT} text-[#FDFD96] text-lg font-semibold hover:underline`}
              >
                <FaFacebookF />
              </a>
            </div>
          </div>

          {/* Left group */}
          <div className="flex w-full">
            <div className={`${CELL} flex-[1.5] bg-[#FDFD96]`}>
              <Link href="/about" className={CELL_CONTENT}>
                <span className="text-black text-base font-semibold">
                  <span className={isActive('/about')}>Om PLX</span>
                </span>
              </Link>
            </div>
            <div className={`${CELL} flex-[1.5] bg-[#FDFD96]`}>
              <Link href="/media" className={CELL_CONTENT}>
                <span className="text-black text-base font-semibold">
                  <span className={isActive('/media')}>Media</span>
                </span>
              </Link>
            </div>
            <div className={`${CELL} flex-[1.5] bg-[#FDFD96]`}>
              <Link href="/event" className={CELL_CONTENT}>
                <span className="text-black text-base font-semibold">
                  <span className={isActive('/event')}>Arkiv</span>
                </span>
              </Link>
            </div>
          </div>

          {/* Right group */}
          <div className="flex w-full">
            <div className={`${CELL} flex-1 bg-[#1E1E1E]`}>
              {externalLink('PLX Tjärö', 'https://plxtjaro.com/')}
            </div>
            <div className={`${CELL} flex-1 bg-[#1E1E1E]`}>
              {externalLink('PLX Records', 'https://www.plxrecords.com/')}
            </div>
            <div className={`${CELL} flex-1 bg-[#1E1E1E]`}>
              {externalLink('PLX Lajv', 'https://www.plxplxplx.live/')}
            </div>
          </div>
        </div>

        {/* Desktop layout */}
        <div className="hidden md:block overflow-x-auto">
          <table
            className={`min-w-full table-fixed border-collapse ${BORDER} ${BORDER_COLOR} ${FONT} bg-[#1E1E1E]`}
          >
            <tbody>
              <tr>
                <td className={`${CELL} w-[14%] bg-[#FDFD96] hover:bg-[#FDFD96]`}>
                  <Link href="/about" className={CELL_CONTENT}>
                    <span className="text-black text-xl font-semibold">
                      <span className={isActive('/about')}>Om PLX</span>
                    </span>
                  </Link>
                </td>
                <td className={`${CELL} w-[14%] bg-[#FDFD96] hover:bg-[#FDFD96]`}>
                  <Link href="/media" className={CELL_CONTENT}>
                    <span className="text-black text-xl font-semibold">
                      <span className={isActive('/media')}>Media</span>
                    </span>
                  </Link>
                </td>
                <td className={`${CELL} w-[14%] bg-[#FDFD96] hover:bg-[#FDFD96]`}>
                  <Link href="/event" className={CELL_CONTENT}>
                    <span className="text-black text-xl font-semibold">
                      <span className={isActive('/event')}>Arkiv</span>
                    </span>
                  </Link>
                </td>

                <td className={`${CELL} w-[10%] bg-[#c98bb6]/50`}>
                  <Link href="/" aria-label="PLX Home" className={CELL_CONTENT}>
                    <Image
                      src="/recordshuvud_white.webp"
                      alt="PLX Logo"
                      width={32}
                      height={32}
                      priority
                    />
                  </Link>
                </td>

                <td className={`${CELL} w-[10%] bg-[#1E1E1E]`}>
                  {externalLink('PLX Tjärö', 'https://plxtjaro.com/')}
                </td>
                <td className={`${CELL} w-[10%] bg-[#1E1E1E]`}>
                  {externalLink('PLX Records', 'https://www.plxrecords.com/')}
                </td>
                <td className={`${CELL} w-[10%] bg-[#1E1E1E]`}>
                  {externalLink('PLX Lajv', 'https://www.plxplxplx.live/')}
                </td>

                <td className={CELL}>
                  <a
                    href="https://www.instagram.com/plxplxplx/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    className={`${CELL_CONTENT} text-[#FDFD96] text-xl font-semibold hover:underline`}
                  >
                    <FaInstagram />
                  </a>
                </td>
                <td className={CELL}>
                  <a
                    href="https://www.facebook.com/plxplxplx"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                    className={`${CELL_CONTENT} text-[#FDFD96] text-xl font-semibold hover:underline`}
                  >
                    <FaFacebookF />
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </nav>
  );
}
