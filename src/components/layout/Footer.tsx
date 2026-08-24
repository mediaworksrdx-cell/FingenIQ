import Link from 'next/link';
import FinGenIqLogo from '@/components/brand/FinGenIqLogo';

export default function Footer() {
  return (
    <footer className="footer" role="contentinfo">
      <div className="container">

        {/* Regulatory Disclaimer */}
        <div className="footer__disclaimer">
          <strong style={{ color: 'var(--ink-400)' }}>Regulatory Disclaimer:</strong>{' '}
          FingenIQ is an educational platform. All content is provided for educational purposes only and does not constitute financial advice, investment recommendations, or a solicitation to buy or sell any financial instrument. FingenIQ is not registered with SEBI, RBI, IRDAI, or any other regulatory authority as a financial advisor or investment advisor. Learners should consult a SEBI-registered investment advisor before making financial decisions. The SEBI Equivalence Roadmap is a transparency document only and does not constitute regulatory recognition by SEBI.
        </div>

        <div className="footer__inner">
          {/* Brand Column */}
          <div style={{ maxWidth: '360px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.12em', color: '#15803D', textTransform: 'uppercase', marginBottom: '0.65rem' }}>
              <span style={{ width: '16px', height: '2px', background: 'linear-gradient(90deg, transparent, #16A34A)' }} />
              <span>CONTINUOUS LEARNING. LIMITLESS GROWTH.</span>
              <span style={{ width: '16px', height: '2px', background: 'linear-gradient(90deg, #16A34A, transparent)' }} />
            </div>

            <Link href="/" style={{ textDecoration: 'none', display: 'block', marginBottom: 'var(--sp-4)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
                <FinGenIqLogo size={30} />
                <span className="nav__logo-text" style={{ fontSize: '1.6rem' }}>
                  <span className="logo-fin">Fin</span><span className="logo-gen">Gen</span> <span className="logo-iq">IQ</span>
                </span>
              </div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, fontFamily: 'var(--font-serif)', marginTop: '0.25rem', whiteSpace: 'nowrap' }}>
                <span className="tag-learn">Learn.</span> <span className="tag-grow">Grow.</span> <span className="tag-prosper">Prosper.</span>
              </div>
            </Link>

            <p className="footer__brand-desc">
              An institution-grade financial education platform empowering wealth creation, institutional mastery, and financial freedom.
            </p>
            <div className="footer__accreditation" style={{ marginTop: 'var(--sp-6)' }}>
              <span className="footer__accreditation-badge">Educational Use Only</span>
              <span className="footer__accreditation-badge">SEBI Disclaimer Compliant</span>
            </div>
          </div>

          {/* Platform Column */}
          <div>
            <h3 className="footer__col-title">Platform</h3>
            <div className="footer__links">
              <Link href="/lessons" className="footer__link">Lessons</Link>
              <Link href="/assessments" className="footer__link">Assessments</Link>
              <Link href="/capstone" className="footer__link">Capstone</Link>
              <Link href="/certification" className="footer__link">Credentials</Link>
              <Link href="/community" className="footer__link">Research Community</Link>
              <Link href="/marketplace" className="footer__link">Talent Marketplace</Link>
            </div>
          </div>

          {/* Company Column */}
          <div>
            <h3 className="footer__col-title">Company</h3>
            <div className="footer__links">
              <Link href="/about" className="footer__link">About FingenIQ</Link>
              <Link href="/curriculum" className="footer__link">Curriculum</Link>
              <Link href="/mentor" className="footer__link">Mentor Program</Link>
              <Link href="/faq" className="footer__link">FAQ</Link>
              <Link href="/contact" className="footer__link">Contact Us</Link>
              <Link href="/certification-roadmap" className="footer__link">SEBI Roadmap</Link>
            </div>
          </div>

          {/* Legal Column */}
          <div>
            <h3 className="footer__col-title">Legal</h3>
            <div className="footer__links">
              <Link href="#" className="footer__link">Terms of Service</Link>
              <Link href="#" className="footer__link">Privacy Policy</Link>
              <Link href="#" className="footer__link">Cookie Policy</Link>
              <Link href="/certification-roadmap" className="footer__link">Regulatory Disclaimer</Link>
            </div>
          </div>
        </div>

        <div className="footer__bottom">
          <span>© 2026 FingenIQ. All rights reserved. Educational use only.</span>
          <span style={{ color: 'var(--ink-700)' }}>Designed for modern professional standards in financial education.</span>
        </div>
      </div>
    </footer>
  );
}
