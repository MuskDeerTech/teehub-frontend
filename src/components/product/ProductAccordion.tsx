"use client";

import { useState } from "react";
import { IconChevronDown } from "@tabler/icons-react";

export type AccordionSection = {
  title: string;
  /** Rendered inside the panel. Sections with no body are skipped entirely. */
  body: React.ReactNode;
};

/**
 * The Details / Wash care / Shipping panel at the bottom of the info column.
 * Replaces the old tab strip: the design shows all three headings at once with
 * their bodies collapsed, so nothing is hidden behind a tab the shopper has to
 * think to click.
 *
 * Independent open state per section — opening one doesn't close the others,
 * which matters because Details and Shipping are often read together.
 */
export default function ProductAccordion({
  sections,
  /** Index opened on first render; -1 leaves everything closed. */
  defaultOpen = -1,
}: {
  sections: AccordionSection[];
  defaultOpen?: number;
}) {
  const [open, setOpen] = useState<number[]>(
    defaultOpen >= 0 ? [defaultOpen] : [],
  );

  const toggle = (index: number) =>
    setOpen((current) =>
      current.includes(index)
        ? current.filter((i) => i !== index)
        : [...current, index],
    );

  if (sections.length === 0) return null;

  return (
    // One panel holding every section, not a stack of cards: the design groups
    // the three headings inside a single bordered box, divided by hairlines that
    // stop short of the edges so the container reads as continuous.
    <div className="overflow-hidden rounded-lg border border-[#e2e2e2] bg-white">
      {sections.map((section, index) => {
        const isOpen = open.includes(index);
        return (
          <div key={section.title}>
            {index > 0 && <div className="mx-4 border-t border-[#efefef]" />}

            <button
              type="button"
              onClick={() => toggle(index)}
              aria-expanded={isOpen}
              className="flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-3 text-left text-[13px] text-[#4a4a4a] transition-colors hover:bg-[#fafafa]"
            >
              {section.title}
              <IconChevronDown
                size={18}
                stroke={1.8}
                aria-hidden="true"
                className={`shrink-0 text-[#666] transition-transform duration-200 ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* No rule between a heading and its own body — the only hairlines
                in the panel separate one section from the next. */}
            {isOpen && (
              <div className="px-4 pb-3 text-[12px] leading-relaxed text-[#555]">
                {section.body}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
