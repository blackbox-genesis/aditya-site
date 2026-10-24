import type { ReactNode } from "react";
import { Hero } from "@/components/journey/hero";
import { JourneyShell } from "@/components/journey/journey-shell";
import { OrganelleLegend } from "@/components/journey/organelle-legend";
import { StepPanel } from "@/components/journey/step-panel";
import { Plate } from "@/components/plate";
import { cn } from "@/lib/utils";

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="mb-3 font-mono text-[11px] font-medium md:mb-5 md:text-xs uppercase tracking-[0.2em] text-[color:var(--accent)]">{children}</p>
  );
}

function Meta({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("font-mono text-xs uppercase tracking-[0.14em] text-white/60", className)}>{children}</p>;
}

function Headline({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <h2
      id={id}
      className="text-[1.8rem] font-normal leading-[1.06] tracking-tight text-white text-balance md:text-[3.2rem]"
    >
      {children}
    </h2>
  );
}

/** Reflective statements — Instrument Serif italic */
function Reflection({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <h2 id={id} className="font-serif text-[2.15rem] italic text-white leading-[1.02] tracking-tight text-balance md:text-[4rem]">
      {children}
    </h2>
  );
}

function Body({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("text-[0.9rem] leading-[1.55] text-white/80 md:text-base md:leading-relaxed", className)}>{children}</p>;
}

function Tags({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("font-mono text-xs leading-relaxed text-white/55", className)}>{children}</p>;
}

function Note({ children }: { children: ReactNode }) {
  return (
    <p className="flex items-baseline gap-3 text-sm font-semibold text-white">
      <span aria-hidden className="size-2 shrink-0 -translate-y-px rounded-full bg-[color:var(--accent)]" />
      {children}
    </p>
  );
}

function OutLink({ href, children }: { href: string; children: ReactNode }) {
  const external = !href.startsWith("mailto:");
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="group inline-flex items-center gap-2 rounded-md border border-[color:var(--accent)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[color:var(--accent)] hover:text-[#1a2330]"
    >
      {children}
      {external && (
        <span aria-hidden className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
          ↗
        </span>
      )}
    </a>
  );
}

/** A project's name is the panel's main heading… */
function ProjectName({ id, children }: { id: string; children: ReactNode }) {
  return (
    <h2 id={id} className="text-[2.1rem] font-extrabold leading-[1] tracking-[-0.03em] text-white text-balance md:text-[3.8rem]">
      {children}
    </h2>
  );
}

/** …and its catchy line sits underneath. */
function Tagline({ children }: { children: ReactNode }) {
  return <p className="mt-2 text-base font-medium leading-snug text-white/75 text-balance md:mt-3 md:text-xl">{children}</p>;
}

export default function Home() {
  return (
    <JourneyShell>
      {/* 01 */}
      <Hero />

      {/* 02 */}
      <StepPanel anchor="nucleus" labelledBy="h-nucleus">
        <Eyebrow>02 · The Nucleus — Identity</Eyebrow>
        <p className="mb-4 text-sm font-bold uppercase tracking-[0.24em] text-white">Systems Bioengineer</p>
        <Headline id="h-nucleus">
          Making sense of <em className="font-serif text-[1.12em] font-normal italic">living systems</em>. Finding
          new ways to engineer them.
        </Headline>
        <Body className="mt-5">
          An undergraduate researcher working at the intersection of biology, computation, and engineering.
        </Body>
        <Meta className="mt-6">20 · Undergraduate Researcher · India</Meta>
      </StepPanel>

      {/* 03 */}
      <StepPanel anchor="nibb" labelledBy="h-nibb">
        <Eyebrow>03 · NIBB — Japan</Eyebrow>
        <Meta className="mb-3">NIBB · JAPAN · 2026</Meta>
        <ProjectName id="h-nibb">NIBB Internship 2026</ProjectName>
        <Tagline>The dynamics of photosynthetic life.</Tagline>
        <Body className="mt-5">
          Fully funded research internship at a premier Japanese research institute working on light harvesting and state
          transition dynamics in photosynthetic systems.
        </Body>
        <Meta className="mt-5 normal-case tracking-normal">Academic Research Experience Program · Prof. Jun Minagawa</Meta>
        <Plate name="nibb" alt="Aditya Raj with colleagues during the NIBB research internship in Japan" placeholder="[Image placeholder: NIBB laboratory photograph]" />
      </StepPanel>

      {/* 04 */}
      <StepPanel anchor="gcsb" labelledBy="h-gcsb">
        <Eyebrow>04 · GCSB — Germany</Eyebrow>
        <Meta className="mb-3">GCSB · MÜNSTER · 2026</Meta>
        <ProjectName id="h-gcsb">GCSB, GERMANY</ProjectName>
        <Tagline>Sharing research on biological systems.</Tagline>
        <Body className="mt-5">
          Presented work in modelling and systems biology at the German Conference on Synthetic Biology, with a poster
          accepted and a selection for a flash talk.
        </Body>
        <div className="mt-5">
          <Note>€1,000 travel grant · Max Buchner Foundation</Note>
        </div>
        <Plate name="gcsb" alt="Aditya Raj presenting Oculen Bio at the German Conference on Synthetic Biology" placeholder="[Image placeholder: GCSB presentation photograph]" />
      </StepPanel>

      {/* 05 */}
      <StepPanel anchor="fibt" labelledBy="h-fibt">
        <Eyebrow>05 · FIBT — India</Eyebrow>
        <Meta className="mb-3">FIBT · CHENNAI · 2026</Meta>
        <ProjectName id="h-fibt">FIBT, CHENNAI</ProjectName>
        <Tagline>From biological insight to practical sensing.</Tagline>
        <Body className="mt-5">
          Developed and presented AquaOptim, a portable device for microbial quality assessment of drinking water.
        </Body>
        <div className="mt-5">
          <Note>Best Oral Presentation Award</Note>
        </div>
        <Plate
          name="fibt"
          alt="Aditya Raj presenting the AquaOptim workflow at FIBT, Chennai"
          placeholder="[Image placeholder: FIBT presentation or award photograph]"
        />
      </StepPanel>

      {/* 06 */}
      <StepPanel anchor="about" labelledBy="h-about">
        <Eyebrow>06 · Beyond the Nucleus — About</Eyebrow>
        <Reflection id="h-about">One interest, expressed across many systems.</Reflection>
        <Body className="mt-5">
          I am drawn to biological systems that cannot be understood by looking at their components alone. Their behaviour
          emerges from the interactions between those components, their environment, and the conditions they encounter.
        </Body>
        <Body className="mt-4">
          My work follows that idea across genetic circuits, photosynthesis, metabolic systems, biological sensing, and
          plant resilience – using computation to investigate how systems behave, where they become fragile, and what
          might make them more robust.
        </Body>
        <div className="mt-6 border-t border-white/10 pt-5">
          <h3 className="mb-2 text-sm font-semibold text-white">Research interests</h3>
          <Tags>
            Systems biology · Synthetic biology · Computational modelling · Metabolic engineering · Bioprocess systems ·
            Biological design
          </Tags>
        </div>
      </StepPanel>

      {/* 07 */}
      <StepPanel anchor="research-landscape" labelledBy="h-landscape">
        <Eyebrow>07 · Zoom Out — Research Landscape</Eyebrow>
        <Reflection id="h-landscape">Biology, across scales.</Reflection>
        <Body className="mt-5">
          From molecular interactions to whole systems, each project explores a different part of the same larger
          question: how do biological systems behave, and how can we understand or engineer that behaviour?
        </Body>
        <OrganelleLegend />
      </StepPanel>

      {/* 08 — three steps through the chromatin */}
      <StepPanel anchor="synthetic-biology" labelledBy="h-oculen">
        <Eyebrow>08 · Synthetic Biology</Eyebrow>
        <ProjectName id="h-oculen">Oculen Bio</ProjectName>
        <Tagline>Designing systems that behave as intended.</Tagline>
        <Body className="mt-5">
          A computational platform for studying the robustness of synthetic gene circuits under parameter variation.
        </Body>
        <Body className="mt-3">
          From circuit models to systematic perturbation, the goal is to understand how changes in a system&apos;s
          parameters shape its behaviour.
        </Body>
        <Tags className="mt-4">SBML · Antimony · Dynamical simulation · Monte Carlo · Latin Hypercube sampling</Tags>
        <div className="mt-6">
          <OutLink href="http://oculen.bio">Explore Oculen Bio</OutLink>
        </div>
      </StepPanel>

      <StepPanel anchor="biofsm" labelledBy="h-biofsm">
        <Eyebrow>08 · Synthetic Biology</Eyebrow>
        <ProjectName id="h-biofsm">BioFSM</ProjectName>
        <Body className="mt-5">
          An interactive environment for exploring gene-circuit logic and how circuit behaviour changes under different
          conditions.
        </Body>
        <div className="mt-6">
          <OutLink href="https://bio-fsm.streamlit.app/">Explore BioFSM</OutLink>
        </div>
      </StepPanel>

      <StepPanel anchor="circuit-library" labelledBy="h-circuits">
        <Eyebrow>08 · Synthetic Biology</Eyebrow>
        <ProjectName id="h-circuits">Circuit library</ProjectName>
        <Body className="mt-5">
          A growing collection of more than 20 synthetic gene circuits represented in Antimony and SBML, forming a basis
          for computational exploration.
        </Body>
      </StepPanel>

      {/* 09 — one step per project */}
      <StepPanel anchor="bioprocess-engineering" labelledBy="h-aquaoptim">
        <Eyebrow>09 · Bioprocess Engineering</Eyebrow>
        <ProjectName id="h-aquaoptim">AquaOptim</ProjectName>
        <Tagline>Engineering biology for practical use.</Tagline>
        <Body className="mt-5">This work connects biological mechanisms with real-world applications.</Body>
        <Body className="mt-3">
          Portable microbial-quality assessment of drinking water. Recognised with the Best Oral Presentation Award at
          FIBT 2026.
        </Body>
        <Meta className="mt-5 normal-case tracking-normal">Developed under Dr. Navnit Kr. R.</Meta>
      </StepPanel>

      <StepPanel anchor="metabolic-engineering" labelledBy="h-metabolic">
        <Eyebrow>09 · Bioprocess Engineering</Eyebrow>
        <ProjectName id="h-metabolic">Metabolic engineering</ProjectName>
        <Body className="mt-5">
          Exploring biological production systems and the potential of waste-derived feedstocks for ethanol production.
        </Body>
      </StepPanel>

      {/* 10 */}
      <StepPanel anchor="plant-resilience" labelledBy="h-plant">
        <Eyebrow>10 · Plant Resilience</Eyebrow>
        <ProjectName id="h-plant">Gene–Trait–Satellite Framework</ProjectName>
        <Tagline>Connecting genetic potential with environmental reality.</Tagline>
        <Meta className="mt-4 normal-case tracking-normal">In progress under Prof. L.K. Sharma</Meta>
        <Body className="mt-5">
          A computational framework exploring how genetic variation, biological traits, and satellite-derived
          environmental data can be brought together to assess crop resilience across varieties and regions.
        </Body>
        <Body className="mt-4">
          The aim is to develop reproducible resilience profiles that connect what a plant can do with the conditions it
          may face.
        </Body>
        <Tags className="mt-6">Genetic variation · Stress-response traits · Satellite data · Resilience assessment</Tags>
      </StepPanel>

      {/* 11 */}
      <StepPanel anchor="computational-genomics" labelledBy="h-nanotransfer">
        <Eyebrow>11 · Computational Genomics</Eyebrow>
        <ProjectName id="h-nanotransfer">Nanotransfer</ProjectName>
        <Tagline>Finding biological signals across scales of data.</Tagline>
        <Body className="mt-5">
          Nanotransfer is a computational framework for detecting and spatially mapping potential intercellular horizontal
          DNA transfer through the integration of single-cell RNA sequencing and spatial transcriptomics.
        </Body>
        <Body className="mt-4">
          It brings together multimodal analysis and spatial inference to investigate a biological process through
          complementary data sources.
        </Body>
        <div className="mt-5">
          <Note>First-author preprint</Note>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <OutLink href="https://doi.org/10.21203/rs.3.rs-10667794/v1">Read the preprint</OutLink>
          <OutLink href="https://nanotransfer.io">Visit Nanotransfer</OutLink>
        </div>
      </StepPanel>

      {/* 12 */}
      <StepPanel anchor="current-direction" labelledBy="h-direction">
        <Eyebrow>12 · Current Direction</Eyebrow>
        <Reflection id="h-direction">Questions worth pursuing.</Reflection>
        <Tags className="mt-5">
          Systems biology · Synthetic biology · Biophysical modelling · Metabolic engineering · Bioprocess systems ·
          Biological design
        </Tags>
        <Body className="mt-5">
          Across these fields, I am interested in using computation not simply to describe biological systems, but to
          understand their behaviour well enough to make informed design decisions.
        </Body>
      </StepPanel>

      {/* 13 */}
      <StepPanel anchor="contact" labelledBy="h-closing" className="text-center md:w-[min(620px,60vw)]">
        <Eyebrow>13 · Closing</Eyebrow>
        <Reflection id="h-closing">
          Understand life as a system.
          <span className="mt-1 block">Engineer with that understanding.</span>
        </Reflection>
        <p className="mt-8 text-lg font-semibold tracking-tight text-white">Aditya Raj</p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          {/* Opens Gmail's compose window (a mailto: link would hand off to the OS default mail app) */}
          <OutLink href="https://mail.google.com/mail/?view=cm&fs=1&to=araj85875@gmail.com">araj85875@gmail.com</OutLink>
          <OutLink href="https://github.com/blackbox-genesis">GitHub</OutLink>
          <OutLink href="https://www.linkedin.com/in/aditya-synbio/">LinkedIn</OutLink>
        </div>
      </StepPanel>
    </JourneyShell>
  );
}
