'use client'

export default function AboutPage() {
  return (
    <div className="px-4 sm:px-8">
      <section className="max-w-screen-md mx-auto py-16 my-8 font-mono text-[#FDFD96] bg-[#1E1E1E]/90 space-y-8 border border-[#91A878] px-6 sm:px-10">
        <p className="text-lg leading-relaxed text-[#EDEDED]">
          PLX är ett konst- och musik-kollektiv som skapar
          immersiva kulturupplevelser. Från legendariska&nbsp;
          <strong className="text-[#FDFD96]">Tjäröfestival</strong> till
          konstutställningar, eget skivbolag och experimentella projekt,
          suddar vi ut gränserna mellan konstnär och publik, scen och natur.
        </p>

        <p className="text-lg leading-relaxed text-[#EDEDED]">
          PLX grundades 2006 och drivs som en ideell
          <span className="italic"> kulturförening </span> med stöd av ett levande
          nätverk av volontäreroch kreatörer. Vi tror på öppenhet,
          kreativt risktagande och att föra människor samman på oväntade platser.
        </p>

        <p className="text-lg leading-relaxed text-[#EDEDED]">
          Vill du samarbeta, volontära eller har någon annan fråga? Hör gärna av dig till&nbsp;
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
