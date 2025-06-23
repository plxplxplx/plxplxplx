'use client'

export default function AboutPage() {
  return (
    <div className="px-4 sm:px-8">
      <section className="max-w-screen-md mx-auto py-16 my-8 font-mono text-[#FDFD96] bg-[#1E1E1E]/90 space-y-8 border border-[#91A878] px-6 sm:px-10">
        <p className="text-lg leading-relaxed text-[#EDEDED]">
          PLX is a Malmö-based art and music collective dedicated to creating
          immersive cultural experiences. From our legendary&nbsp;
          <strong className="text-[#FDFD96]">Tjärö festival</strong> to
          experimental media labs and live-action role-playing events,
          we blur the lines between artist and audience, stage and landscape.
        </p>

        <p className="text-lg leading-relaxed text-[#EDEDED]">
          Founded in 2006, PLX operates as a non-profit
          <span className="italic"> kulturförening </span> supported by a vibrant
          network of volunteers, makers and dreamers. We believe in openness,
          creative risk-taking and bringing people together in unusual places.
        </p>

        <p className="text-lg leading-relaxed text-[#EDEDED]">
          Want to collaborate, volunteer or any other query? Drop us a message at&nbsp;
          <a
            href="mailto:art@plxplxplx.com"
            className="text-[#FDFD96] underline hover:opacity-80"
          >
            art@plxplxplx.com
          </a>.
        </p>
      </section>
    </div>
  )
}
