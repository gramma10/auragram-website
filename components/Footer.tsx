import Link from 'next/link';
import { Logo } from './Logo';
import { BRAND, contactEmail } from '@/lib/config';
import { footer } from '@/lib/content';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="surface-dark border-t border-white/[0.08] px-4 py-14 sm:px-6">
      <div className="mx-auto flex w-full max-w-page flex-col gap-10">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-sm">
            <Logo id="footer" markClassName="h-11 w-auto sm:h-12" />
            <p className="pt-4 text-[13px] leading-relaxed text-fg-dim">
              {footer.tagline} {footer.roiLine}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-0 text-[14px] sm:gap-x-10">
            <div className="flex flex-col">
              <Link href="/#agents" className="inline-flex min-h-[44px] items-center text-fg transition-colors hover:text-white">
                AI Agents
              </Link>
              <Link href="/#ypiresies" className="inline-flex min-h-[44px] items-center text-fg transition-colors hover:text-white">
                Υπηρεσίες
              </Link>
              <Link href="/#pilot" className="inline-flex min-h-[44px] items-center text-fg transition-colors hover:text-white">
                Το pilot
              </Link>
              <Link href="/#klisi" className="inline-flex min-h-[44px] items-center text-fg transition-colors hover:text-white">
                Κλείστε κλήση
              </Link>
            </div>
            <div className="flex flex-col">
              <Link href="/about" className="inline-flex min-h-[44px] items-center text-fg transition-colors hover:text-white">
                Ποιοι είμαστε
              </Link>
              <Link href="/privacy" className="inline-flex min-h-[44px] items-center text-fg transition-colors hover:text-white">
                Απόρρητο
              </Link>
              <Link href="/terms" className="inline-flex min-h-[44px] items-center text-fg transition-colors hover:text-white">
                Όροι χρήσης
              </Link>
              <a
                href={`mailto:${contactEmail()}`}
                className="inline-flex min-h-[44px] items-center [overflow-wrap:anywhere] text-fg transition-colors hover:text-white"
              >
                {contactEmail()}
              </a>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 text-[12px] text-fg-dim sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {BRAND.legalName}. Όλα τα δικαιώματα διατηρούνται.
          </p>
          <p className="font-mono text-[12px] tracking-[0.1em]">ΕΛΛΑΔΑ</p>
        </div>
      </div>
    </footer>
  );
}
