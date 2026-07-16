import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Ärtsopps-TV (testsida)',
  robots: { index: false, follow: false },
}

export default function TvTestLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
