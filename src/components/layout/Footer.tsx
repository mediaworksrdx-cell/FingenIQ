import Link from 'next/link';

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
          <div>
            <Link href="/" className="nav__logo" style={{ marginBottom: 'var(--sp-5)', display: 'inline-flex' }}>
              <div className="nav__logo-mark"><span className="nav__logo-glyph">F</span></div>
              <span className="nav__logo-text">Fingen<span>IQ</span></span>
            </Link>
            <p className="footer__brand-desc">
              An institution-grade financial education platform. Empowering Financial Intelligence for Financial Freedom and Wealth Management.
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
              <Link href="/lessons" className="footer__link">Curriculum</Link>
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
