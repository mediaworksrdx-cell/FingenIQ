import PublicNav from '@/components/nav/PublicNav';
import Footer from '@/components/layout/Footer';
import Link from 'next/link';

export const metadata = {
  title: 'FAQ',
  description: 'Frequently asked questions about FingenIQ financial education platform.',
};

const FAQS = [
  {
    question: 'How do I enroll in FingenIQ?',
    answer: 'Click "Enter FingenIQ" from the homepage to access the platform. Account creation and enrollment can be completed directly from the dashboard without contacting support.',
  },
  {
    question: 'Is FingenIQ certification recognised by employers?',
    answer: 'FingenIQ credentials are verifiable via a tamper-proof code system. Employers can validate credentials through our marketplace portal. Our SEBI-equivalence roadmap is aspirational and under active development.',
  },
  {
    question: 'Do you offer bulk pricing for organisations?',
    answer: 'Yes. We offer enterprise cohort licensing for corporates, universities, and financial institutions. Contact support@fingeniq.com for custom pricing and white-label options.',
  },
  {
    question: 'How long does certification take?',
    answer: 'The full curriculum consists of 44 lessons across 8 modules with a 20-step framework per lesson. Most learners complete the Completion tier in 3–4 months at a pace of 2–3 lessons per week.',
  },
  {
    question: 'What are the certification tiers?',
    answer: 'FingenIQ offers three credential tiers: Completion (basic), Proficiency (intermediate), and Distinction (advanced). Each tier requires progressively higher weighted scores across knowledge checks, quizzes, assignments, module assessments, and the capstone project.',
  },
  {
    question: 'Is FingenIQ registered with SEBI?',
    answer: 'FingenIQ is an educational platform and is not registered with SEBI, RBI, IRDAI, or any other regulatory authority as a financial advisor. The SEBI Equivalence Roadmap is a transparency document and does not constitute regulatory recognition.',
  },
  {
    question: 'How does the AI Tutor work?',
    answer: 'The AI Tutor is contextualised per lesson — it understands exactly which step you are on, what concepts were covered, and where your quiz results indicate gaps. You can ask questions anytime and receive personalized explanations.',
  },
  {
    question: 'Can I access FingenIQ on mobile?',
    answer: 'Yes. The FingenIQ platform is fully responsive and accessible on desktop, tablet, and mobile devices through your web browser.',
  },
];

export default function FAQPage() {
  return (
    <div className="landing">
      <PublicNav />

      <div className="page-wrapper">
        <main className="page-main">

          {/* Hero Section */}
          <section className="hero" id="faq-hero" style={{ minHeight: '50vh' }}>
            <div className="hero__bg"></div>
            <div className="hero__grid"></div>
            <div className="container relative">
              <div className="hero__content animate-fadeUp" style={{ maxWidth: '700px' }}>
                <div className="hero__eyebrow">❓ Help Center</div>
                <h1 className="hero__title">Frequently Asked <em>Questions</em></h1>
                <p className="hero__subtitle">
                  Find answers to common questions about FingenIQ, our curriculum, certification, and platform features.
                </p>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="py-20" id="faq-list">
            <div className="container container--narrow">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }} className="animate-fadeUp">
                {FAQS.map((faq, index) => (
                  <div key={index} className="card p-5">
                    <h4 className="font-semi text-primary mb-2">{faq.question}</h4>
                    <p className="text-xs text-secondary">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-20 bg-900 border-muted" style={{ textAlign: 'center' }}>
            <div className="container container--narrow animate-fadeUp">
              <h2 className="section-title mb-4">Still Have Questions?</h2>
              <p className="text-secondary mx-auto mb-8" style={{ maxWidth: '440px' }}>
                Our team is here to help. Reach out through our contact page.
              </p>
              <div style={{ display: 'flex', gap: 'var(--sp-4)', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link href="/contact" className="btn btn--brass btn--lg">
                  Contact Support →
                </Link>
              </div>
            </div>
          </section>

        </main>

        <Footer />
      </div>
    </div>
  );
}
