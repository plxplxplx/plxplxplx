'use client'

export default function AboutPage() {
  return (
    <section className="max-w-screen-md mx-auto px-4 py-20 space-y-8 font-mono text-gray-800">

      <h1 className="text-4xl font-bold border-b-4 border-blue-700 inline-block pb-2">
        About&nbsp;PLX
      </h1>

      <p className="text-xl leading-relaxed">
        PLX is a Malmö-based art and music collective dedicated to creating
        immersive cultural experiences. From our legendary&nbsp;
        <strong className="text-blue-800">Tjärö festival</strong> to
        experimental media labs and live-action role-playing events,
        we blur the lines between artist and audience, stage and landscape.
      </p>

      <p className="text-xl leading-relaxed">
        Founded in 2006, PLX operates as a non-profit
        <span className="italic"> kulturförening </span> supported by a vibrant
        network of volunteers, makers and dreamers. We believe in openness,
        creative risk-taking and bringing people together in unusual places.
      </p>

      <p className="text-xl leading-relaxed">
        Want to collaborate, volunteer or just say hi? Drop us a line at&nbsp;
        <a
          href="mailto:info@plxplxplx.com"
          className="text-blue-800 underline hover:opacity-80"
        >
          info@plxplxplx.com
        </a>.
      </p>
    </section>
  )
}
