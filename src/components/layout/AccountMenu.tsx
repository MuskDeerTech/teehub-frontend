"use client";

import Link from "next/link";
import { IconLogout, IconPackage, IconStar, IconUser } from "@tabler/icons-react";

/**
 * The four destinations behind the profile icon. This menu is the only way
 * around the account area — the pages themselves carry no tabs or log-out
 * control — so these paths are the single source of truth for it.
 *
 * "Review" is an anchor because the submission form is a section at the foot
 * of `/reviews` rather than a route; that section carries the matching `id`.
 */
const LINKS = [
  { label: "My Account", href: "/account", icon: IconUser },
  { label: "Order History", href: "/account/orders", icon: IconPackage },
  { label: "Review", href: "/reviews#leave-a-review", icon: IconStar },
] as const;

const ITEM =
  "flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-[13px] font-medium transition-colors";

/**
 * The dropdown under the navbar's profile icon. Presentational only — the
 * Navbar owns the open state, because it also owns the two triggers (the
 * desktop icon and the mobile dock) and the outside-click handling that
 * has to treat both as "inside".
 *
 * `placement` flips it above the trigger for the mobile dock, which sits at
 * the bottom of the viewport with nothing below it to open into.
 */
export default function AccountMenu({
  open,
  placement = "below",
  onNavigate,
  onLogout,
}: {
  open: boolean;
  placement?: "below" | "above";
  /** Fired when a link is chosen, so the Navbar can close the menu. */
  onNavigate: () => void;
  onLogout: () => void;
}) {
  if (!open) return null;

  return (
    <div
      role="menu"
      aria-label="Account"
      className={`absolute right-0 z-[120] w-[188px] overflow-hidden rounded-xl border border-[#ececec] bg-white py-1.5 shadow-[0_12px_34px_rgba(0,0,0,0.14)] ${
        placement === "above" ? "bottom-full mb-3" : "top-full mt-3"
      }`}
    >
      {LINKS.map(({ label, href, icon: Icon }) => (
        <Link
          key={label}
          href={href}
          role="menuitem"
          onClick={onNavigate}
          className={`${ITEM} text-[#333] hover:bg-[#f6f6f6] hover:text-[#f36d43]`}
        >
          <Icon size={17} stroke={1.8} aria-hidden="true" className="shrink-0" />
          {label}
        </Link>
      ))}

      <div className="my-1.5 h-px bg-[#ececec]" />

      <button
        type="button"
        role="menuitem"
        onClick={onLogout}
        className={`${ITEM} cursor-pointer text-[#d0342c] hover:bg-[#fdf3f2]`}
      >
        <IconLogout size={17} stroke={1.8} aria-hidden="true" className="shrink-0" />
        Logout
      </button>
    </div>
  );
}
