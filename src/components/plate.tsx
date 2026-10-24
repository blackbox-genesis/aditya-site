import fs from "node:fs";
import path from "node:path";
import Image from "next/image";

const EXTENSIONS = ["jpg", "jpeg", "png", "webp"];

/**
 * A photograph from /public/images/<name>.<ext>.
 * Shows a labelled placeholder frame until the file exists.
 */
export function Plate({ name, alt, placeholder }: { name: string; alt: string; placeholder: string }) {
  const file = EXTENSIONS.map((ext) => `${name}.${ext}`).find((f) =>
    fs.existsSync(path.join(process.cwd(), "public", "images", f)),
  );

  return (
    <figure className="mt-6">
      <div className="relative aspect-[16/10] max-h-[22svh] w-full overflow-hidden rounded-lg border border-white/10 bg-white/[0.03] md:max-h-none">
        {file ? (
          <Image src={`/images/${file}`} alt={alt} fill sizes="(min-width: 768px) 500px, 100vw" className="object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center border border-dashed border-[color:var(--accent)]/40 p-6">
            <p className="max-w-[30ch] text-center font-mono text-xs leading-relaxed text-white/55">{placeholder}</p>
          </div>
        )}
      </div>
    </figure>
  );
}
