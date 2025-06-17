'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { FaInstagram, FaFacebookF } from 'react-icons/fa';

export default function Navbar() {
  const path = usePathname() || '/';

  const BORDER = 'border';
  const BORDER_COLOR = 'border-blue-700';
  const FONT = 'font-mono text-gray-800';

  // Shared cell styling with hover bg
  const CELL = `${BORDER} ${BORDER_COLOR} px-4 py-3 md:py-5 text-sm sm:text-base hover:bg-orange-100 transition-colors duration-150`;
  const CELL_CONTENT = `flex items-center justify-center w-full h-full`;

  const isActive = (href: string) =>
    path === href
      ? 'text-black font-bold underline'
      : 'text-blue-800 hover:underline';

  const externalLink = (label: string, href: string) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`${CELL_CONTENT} text-blue-800 hover:underline`}
    >
      {label}
    </a>
  );

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white shadow-md">
      <div className="w-full">
        {/* Mobile layout */}
        <div className="flex flex-col items-center justify-center md:hidden border-b border-blue-700 bg-blue-50">
          {/* Logo */}
          <div className="w-full bg-orange-600 flex items-center justify-center py-4 border-b border-blue-700">
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
          <div className="flex w-full border-b border-blue-700">
            <div className={`${CELL} flex-1`}>
              <a
                href="https://www.instagram.com/plxplxplx/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className={`${CELL_CONTENT} text-blue-700 hover:underline text-xl`}
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
                className={`${CELL_CONTENT} text-blue-700 hover:underline text-xl`}
              >
                <FaFacebookF />
              </a>
            </div>
          </div>

          {/* Left group */}
          <div className="flex w-full">
            <div className={`${CELL} flex-1`}>
              <Link href="/about" className={CELL_CONTENT}>
                <span className={isActive('/about')}>About</span>
              </Link>
            </div>
            <div className={`${CELL} flex-1`}>
              <Link href="/media" className={CELL_CONTENT}>
                <span className={isActive('/media')}>Media</span>
              </Link>
            </div>
            <div className={`${CELL} flex-1`}>
              <Link href="/event" className={CELL_CONTENT}>
                <span className={isActive('/event')}>Archive</span>
              </Link>
            </div>
          </div>

          {/* Right group */}
          <div className="flex w-full">
            <div className={`${CELL} bg-blue-200 flex-1`}>
              {externalLink('PLX Tjärö', 'https://plxtjaro.com/')}
            </div>
            <div className={`${CELL} bg-blue-200 flex-1`}>
              {externalLink('PLX Records', 'https://www.plxrecords.com/')}
            </div>
            <div className={`${CELL} bg-blue-200 flex-1`}>
              {externalLink('PLX LARP', 'https://www.plxplxplx.live/')}
            </div>
          </div>
        </div>

        {/* Desktop layout */}
        <div className="hidden md:block overflow-x-auto">
          <table
            className={`min-w-full table-fixed border-collapse ${BORDER} ${BORDER_COLOR} ${FONT} bg-blue-50`}
          >
            <tbody>
              <tr>
                {/* Left side links */}
                <td className={CELL}>
                  <Link href="/about" className={CELL_CONTENT}>
                    <span className={isActive('/about')}>About</span>
                  </Link>
                </td>
                <td className={CELL}>
                  <Link href="/media" className={CELL_CONTENT}>
                    <span className={isActive('/media')}>Media</span>
                  </Link>
                </td>
                <td className={CELL}>
                  <Link href="/event" className={CELL_CONTENT}>
                    <span className={isActive('/event')}>Archive</span>
                  </Link>
                </td>

                {/* Logo in center */}
                <td className={`${CELL} bg-orange-600`}>
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

                {/* External links */}
                <td className={`${CELL} bg-blue-200`}>
                  {externalLink('PLX Tjärö', 'https://plxtjaro.com/')}
                </td>
                <td className={`${CELL} bg-blue-200`}>
                  {externalLink('PLX Records', 'https://www.plxrecords.com/')}
                </td>
                <td className={`${CELL} bg-blue-200`}>
                  {externalLink('PLX LARP', 'https://www.plxplxplx.live/')}
                </td>

                {/* Socials */}
                <td className={CELL}>
                  <a
                    href="https://www.instagram.com/plxplxplx/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    className={`${CELL_CONTENT} text-blue-700 hover:underline text-xl`}
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
                    className={`${CELL_CONTENT} text-blue-700 hover:underline text-xl`}
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
