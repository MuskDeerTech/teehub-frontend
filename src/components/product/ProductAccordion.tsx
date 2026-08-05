"use client";

import { useState } from "react";
import { IconChevronDown } from "@tabler/icons-react";

export type AccordionSection = {
  title: string;
  /** Rendered inside the panel. Sections with no body are skipped entirely. */
  body: React.ReactNode;
};

/**
 * The stacked Details / Wash care / Shipping panels at the bottom of the info
 * column. Replaces the old tab strip: the design shows all three headings at
 * once with their bodies collapsed, so nothing is hidden behind a tab the
 * shopper has to think to click.
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
    <div className="flex flex-col gap-2">
      {sections.map((section, index) => {
        const isOpen = open.includes(index);
        return (
          <div
            key={section.title}
            className="overflow-hidden rounded-lg border border-[#e2e2e2] bg-white"
          >
            <button
              type="button"
              onClick={() => toggle(index)}
              aria-expanded={isOpen}
              className="flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-3 text-left text-[13px] font-medium text-[#111] transition-colors hover:bg-[#fafafa]"
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

            {isOpen && (
              <div className="border-t border-[#efefef] px-4 py-3 text-[12px] leading-relaxed text-[#555]">
                {section.body}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
