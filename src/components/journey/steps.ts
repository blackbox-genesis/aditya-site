export type Organelle = "nucleus" | "chloroplast" | "chromatin" | "gene" | "cytoplasm" | "membrane";

/** which organelles glow at a step: one, all of them, or none singled out */
export type Focus = Organelle | "all";

export type CameraStop =
  | "overview"
  | "hero"
  | "nucleus"
  | "chloroplast"
  | "pores"
  | "nucleolus"
  | "about"
  | "landscape"
  | "chromatinA"
  | "chromatinB"
  | "chromatinC"
  | "cytoplasm"
  | "cytoplasmB"
  | "gene"
  | "membrane"
  | "direction"
  | "closing";

export type Step = {
  anchor: string;
  /** section number from the content (several steps can share one) */
  num: string;
  camera: CameraStop;
  focus: Focus;
  /** where the text panel sits; the organelle is framed on the opposite side */
  side: "left" | "right" | "center";
  figure: string;
  caption: string;
};

export const ORGANELLE_LABELS: Record<Organelle, { name: string; field: string }> = {
  nucleus: { name: "Nucleus", field: "Scientific Identity" },
  chloroplast: { name: "Chloroplast", field: "Photosynthetic systems" },
  gene: { name: "Gene", field: "Trait system" },
  chromatin: { name: "Chromatin and DNA", field: "Synthetic Biology" },
  cytoplasm: { name: "Cytoplasm & Metabolic Networks", field: "Bioprocess Engineering" },
  membrane: { name: "Membrane & Vesicles", field: "Computational Genomics" },
};

export const ORGANELLE_ORDER: Organelle[] = ["nucleus", "chloroplast", "chromatin", "gene", "cytoplasm", "membrane"];

/** Natural, stain-like accent palette — mirrors the CSS tokens in globals.css */
export const ORGANELLE_COLORS: Record<Organelle, string> = {
  nucleus: "#a99be6",
  chloroplast: "#8cc77a",
  chromatin: "#e08a92",
  gene: "#e6bd5c",
  cytoplasm: "#6cc3b9",
  membrane: "#d996bf",
};

const o = ORGANELLE_LABELS;

export const STEPS: Step[] = [
  { num: "01", anchor: "top", camera: "overview", focus: "all", side: "center", figure: "The Cell", caption: "Introduction" },
  { num: "01", anchor: "the-cell", camera: "hero", focus: "all", side: "center", figure: "The Cell", caption: "The living system" },
  { num: "02", anchor: "nucleus", camera: "nucleus", focus: "nucleus", side: "left", figure: o.nucleus.name, caption: o.nucleus.field },
  { num: "03", anchor: "nibb", camera: "chloroplast", focus: "chloroplast", side: "right", figure: o.chloroplast.name, caption: o.chloroplast.field },
  { num: "04", anchor: "gcsb", camera: "pores", focus: "nucleus", side: "left", figure: o.nucleus.name, caption: o.nucleus.field },
  { num: "05", anchor: "fibt", camera: "nucleolus", focus: "nucleus", side: "right", figure: o.nucleus.name, caption: o.nucleus.field },
  { num: "06", anchor: "about", camera: "about", focus: "nucleus", side: "left", figure: "Beyond the Nucleus", caption: "About" },
  { num: "07", anchor: "research-landscape", camera: "landscape", focus: "all", side: "left", figure: "Zoom Out", caption: "Research Landscape" },
  { num: "08", anchor: "synthetic-biology", camera: "chromatinA", focus: "chromatin", side: "right", figure: o.chromatin.name, caption: o.chromatin.field },
  { num: "08", anchor: "biofsm", camera: "chromatinB", focus: "chromatin", side: "left", figure: o.chromatin.name, caption: o.chromatin.field },
  { num: "08", anchor: "circuit-library", camera: "chromatinC", focus: "chromatin", side: "right", figure: o.chromatin.name, caption: o.chromatin.field },
  { num: "09", anchor: "bioprocess-engineering", camera: "cytoplasm", focus: "cytoplasm", side: "left", figure: o.cytoplasm.name, caption: o.cytoplasm.field },
  { num: "09", anchor: "metabolic-engineering", camera: "cytoplasmB", focus: "cytoplasm", side: "right", figure: o.cytoplasm.name, caption: o.cytoplasm.field },
  { num: "10", anchor: "plant-resilience", camera: "gene", focus: "gene", side: "left", figure: o.gene.name, caption: o.gene.field },
  { num: "11", anchor: "computational-genomics", camera: "membrane", focus: "membrane", side: "right", figure: o.membrane.name, caption: o.membrane.field },
  { num: "12", anchor: "current-direction", camera: "direction", focus: "all", side: "left", figure: "Current Direction", caption: "Questions worth pursuing" },
  { num: "13", anchor: "contact", camera: "closing", focus: "all", side: "center", figure: "The Cell", caption: "Closing" },
];

/** first step that features each organelle — used by the landscape legend */
export const ORGANELLE_STEP: Record<Organelle, number> = {
  nucleus: 2,
  chloroplast: 3,
  chromatin: 8,
  gene: 13,
  cytoplasm: 11,
  membrane: 14,
};

export const accentFor = (focus: Focus) => (focus === "all" ? "var(--accent-cell)" : `var(--${focus})`);
