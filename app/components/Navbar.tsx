'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navbar() {
  const path = usePathname() || '/'

  // Return active classes if current path matches
  const linkClass = (href: string) =>
    `px-4 py-2 hover:text-blue-600 ${
      path === href ? 'text-blue-800 font-bold' : 'text-gray-800'
    }`

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-screen-xl mx-auto px-4">
        <ul className="flex space-x-4">
          <li>
            <Link href="/" className={linkClass('/')}>
              Home
            </Link>
          </li>
          <li>
            <Link href="/media" className={linkClass('/media')}>
              Media
            </Link>
          </li>
          <li>
            <Link href="/event" className={linkClass('/event')}>
              Event
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  )
}
