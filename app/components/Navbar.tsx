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

  const CELL = `${BORDER} ${BORDER_COLOR} px-4 py-3 md:py-5 text-sm sm:text-base transition-colors duration-150`;
  const CELL_CONTENT = `flex items-center justify-center w-full h-full`;

  const isActive = (href: string) =>
    path === href
      ? 'text-black font-bold underline'
      : 'hover:underline';

  const externalLink = (label: string, href: string) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`${CELL_CONTENT} text-[#FDFD96] text-lg font-semibold hover:underline`}
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
          <div className="w-full bg-[#c98bb6]/50 flex items-center justify-center py-4 border-b border-[#91A878]">
            <Link href="/" aria-label="PLX Home">
              <Image
                src="/recordshuvud_white.webp"
                alt="PLX Logo"
                width={48}
                height={48}
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
                className={`${CELL_CONTENT} text-[#FDFD96] text-xl font-semibold hover:underline`}
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
                className={`${CELL_CONTENT} text-[#FDFD96] text-xl font-semibold hover:underline`}
              >
                <FaFacebookF />
              </a>
            </div>
          </div>

          {/* Left group — solid background colors matching desktop */}
          <div className="flex w-full">
            <div className={`${CELL} flex-[1.5] bg-[#91A878]`}>
              <Link href="/about" className={CELL_CONTENT}>
                <span className="text-[#282828] text-lg font-semibold">
                  <span className={isActive('/about')}>About</span>
                </span>
              </Link>
            </div>
            <div className={`${CELL} flex-[1.5] bg-[#F6BBA8]`}>
              <Link href="/media" className={CELL_CONTENT}>
                <span className="text-[#282828] text-lg font-semibold">
                  <span className={isActive('/media')}>Media</span>
                </span>
              </Link>
            </div>
            <div className={`${CELL} flex-[1.5] bg-[#C99C8B]`}>
              <Link href="/event" className={CELL_CONTENT}>
                <span className="text-[#282828] text-lg font-semibold">
                  <span className={isActive('/event')}>Archive</span>
                </span>
              </Link>
            </div>
          </div>

          {/* Right group — smaller flex */}
          <div className="flex w-full">
            <div className={`${CELL} flex-1 bg-[#1E1E1E]`}>
              {externalLink('PLX Tjärö', 'https://plxtjaro.com/')}
            </div>
            <div className={`${CELL} flex-1 bg-[#1E1E1E]`}>
              {externalLink('PLX Records', 'https://www.plxrecords.com/')}
            </div>
            <div className={`${CELL} flex-1 bg-[#1E1E1E]`}>
              {externalLink('PLX LARP', 'https://www.plxplxplx.live/')}
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
                {/* Left group — wide columns */}
                <td className={`${CELL} w-[14%] bg-[#91A878] hover:bg-[#91A878]`}>
                  <Link href="/about" className={CELL_CONTENT}>
                    <span className="text-[#282828] text-xl font-semibold">
                      <span className={isActive('/about')}>About</span>
                    </span>
                  </Link>
                </td>
                <td className={`${CELL} w-[14%] bg-[#F6BBA8] hover:bg-[#F6BBA8]`}>
                  <Link href="/media" className={CELL_CONTENT}>
                    <span className="text-[#282828] text-xl font-semibold">
                      <span className={isActive('/media')}>Media</span>
                    </span>
                  </Link>
                </td>
                <td className={`${CELL} w-[14%] bg-[#C99C8B] hover:bg-[#C99C8B]`}>
                  <Link href="/event" className={CELL_CONTENT}>
                    <span className="text-[#282828] text-xl font-semibold">
                      <span className={isActive('/event')}>Archive</span>
                    </span>
                  </Link>
                </td>

                {/* Logo */}
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

                {/* Right group — narrow */}
                <td className={`${CELL} w-[10%] bg-[#1E1E1E]`}>
                  {externalLink('PLX Tjärö', 'https://plxtjaro.com/')}
                </td>
                <td className={`${CELL} w-[10%] bg-[#1E1E1E]`}>
                  {externalLink('PLX Records', 'https://www.plxrecords.com/')}
                </td>
                <td className={`${CELL} w-[10%] bg-[#1E1E1E]`}>
                  {externalLink('PLX LARP', 'https://www.plxplxplx.live/')}
                </td>

                {/* Socials */}
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
