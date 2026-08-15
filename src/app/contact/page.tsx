'use client';
import PublicNav from '@/components/nav/PublicNav';
import Footer from '@/components/layout/Footer';
import { useState } from 'react';

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [type, setType] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [toast, setToast] = useState<{ title: string; desc: string } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setToast({
      title: 'Message Submitted ✉️',
      desc: `Thank you, ${name}. Our team will respond to ${email} within 1–2 business days.`,
    });
    // reset form
    setName('');
    setEmail('');
    setPhone('');
    setType('');
    setSubject('');
    setMessage('');

    setTimeout(() => setToast(null), 5000);
  };

  return (
    <div className="landing">
      <PublicNav />

      {toast && (
        <div style={{
          position: 'fixed', bottom: 'var(--sp-6)', right: 'var(--sp-6)',
          zIndex: 1000, background: 'var(--ink-900)', border: 'var(--border-brass)',
          padding: 'var(--sp-4)', borderRadius: 'var(--radius-lg)', maxWidth: '320px',
          animation: 'fadeUp 0.3s ease-out'
        }}>
          <div style={{ color: 'var(--brass-400)', fontWeight: 600, fontSize: 'var(--text-sm)' }}>{toast.title}</div>
          <div style={{ color: 'var(--ink-200)', fontSize: 'var(--text-xs)', marginTop: '4px' }}>{toast.desc}</div>
        </div>
      )}

      <div className="page-wrapper">
        <main className="page-main">

          {/* Page Hero */}
          <section className="hero" id="contact-hero" style={{ minHeight: '50vh' }}>
            <div className="hero__bg"></div>
            <div className="hero__grid"></div>
            <div className="container relative">
              <div className="hero__content animate-fadeUp" style={{ maxWidth: '620px' }}>
                <div className="hero__eyebrow">✉️ Support &amp; Inquiries</div>
                <h1 className="hero__title">Contact <em>Us</em></h1>
                <p className="hero__subtitle">
                  Have questions about admissions, enterprise cohort pricing, platform technical support, or partnership opportunities? Our team is here to help.
                </p>
              </div>
            </div>
          </section>

          {/* Contact Section */}
          <section className="py-20" id="contact-main">
            <div className="container">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--sp-12)', alignItems: 'start' }}>

                {/* Left: Contact Details */}
                <div className="animate-fadeUp">
                  <h2 className="section-title mb-8">Get in Touch</h2>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)' }}>
                    <div className="card p-5" style={{ display: 'flex', gap: 'var(--sp-4)', alignItems: 'start' }}>
                      <span style={{ fontSize: '1.5rem' }}>🏢</span>
                      <div>
                        <div className="font-semi text-primary mb-1">Platform Headquarters</div>
                        <div className="text-sm text-secondary">BKC Financial District</div>
                        <div className="text-sm text-secondary">Bandra East, Mumbai — 400051</div>
                        <div className="text-xs text-muted mt-1">Maharashtra, India</div>
                      </div>
                    </div>

                    <div className="card p-5" style={{ display: 'flex', gap: 'var(--sp-4)', alignItems: 'start' }}>
                      <span style={{ fontSize: '1.5rem' }}>✉️</span>
                      <div>
                        <div className="font-semi text-primary mb-1">Support &amp; Admissions Email</div>
                        <div className="text-sm text-brass">admissions@fingeniq.com</div>
                        <div className="text-xs text-muted mt-1">Response within 1–2 business days</div>
                      </div>
                    </div>

                    <div className="card p-5" style={{ display: 'flex', gap: 'var(--sp-4)', alignItems: 'start' }}>
                      <span style={{ fontSize: '1.5rem' }}>📞</span>
                      <div>
                        <div className="font-semi text-primary mb-1">Admissions Hotline</div>
                        <div className="text-sm text-brass">+91 22 5592 1084</div>
                        <div className="text-xs text-muted mt-1">Mon–Fri, 9:00 AM – 6:00 PM IST</div>
                      </div>
                    </div>

                    <div className="card p-5" style={{ display: 'flex', gap: 'var(--sp-4)', alignItems: 'start' }}>
                      <span style={{ fontSize: '1.5rem' }}>💼</span>
                      <div>
                        <div className="font-semi text-primary mb-1">Enterprise &amp; Institutional</div>
                        <div className="text-sm text-brass">enterprise@fingeniq.com</div>
                        <div className="text-xs text-muted mt-1">For bulk cohort licensing and B2B pricing</div>
                      </div>
                    </div>
                  </div>

                  {/* Inquiry types */}
                  <div className="mt-8">
                    <h3 className="font-semi text-sm text-primary mb-4">We handle inquiries about:</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
                      <div className="text-xs text-secondary"><span className="text-brass">→</span> Individual admissions and enrollment</div>
                      <div className="text-xs text-secondary"><span className="text-brass">→</span> Enterprise cohort and institutional pricing</div>
                      <div className="text-xs text-secondary"><span className="text-brass">→</span> Technical platform support</div>
                      <div className="text-xs text-secondary"><span className="text-brass">→</span> Certification verification requests</div>
                      <div className="text-xs text-secondary"><span className="text-brass">→</span> Recruiter and marketplace access</div>
                      <div className="text-xs text-secondary"><span className="text-brass">→</span> Partnership and curriculum collaboration</div>
                    </div>
                  </div>
                </div>

                {/* Right: Contact Form */}
                <div className="card p-8 animate-fadeUp delay-100">
                  <h3 className="text-xl font-semi text-brass mb-6">Send Us a Message</h3>
                  <form onSubmit={handleSubmit} className="flex flex-col gap-5">

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-4)' }}>
                      <div className="form-group">
                        <label className="form-label" htmlFor="contact-name">Full Name <span style={{ color: 'var(--brass-500)' }}>*</span></label>
                        <input type="text" id="contact-name" className="form-input" required placeholder="Arjun Mehta" value={name} onChange={e => setName(e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="contact-email">Email Address <span style={{ color: 'var(--brass-500)' }}>*</span></label>
                        <input type="email" id="contact-email" className="form-input" required placeholder="name@domain.com" value={email} onChange={e => setEmail(e.target.value)} />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-4)' }}>
                      <div className="form-group">
                        <label className="form-label" htmlFor="contact-phone">Phone Number</label>
                        <input type="tel" id="contact-phone" className="form-input" placeholder="+91 XXXXX XXXXX" value={phone} onChange={e => setPhone(e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="contact-type">Inquiry Type <span style={{ color: 'var(--brass-500)' }}>*</span></label>
                        <select id="contact-type" className="form-input" required style={{ cursor: 'pointer' }} value={type} onChange={e => setType(e.target.value)}>
                          <option value="" disabled>Select a category</option>
                          <option value="admissions">Admissions &amp; Enrollment</option>
                          <option value="enterprise">Enterprise / Institutional</option>
                          <option value="technical">Technical Support</option>
                          <option value="certification">Certification Verification</option>
                          <option value="recruiter">Recruiter / Marketplace</option>
                          <option value="partnership">Partnership Inquiry</option>
                          <option value="media">Media &amp; Press</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="contact-subject">Subject</label>
                      <input type="text" id="contact-subject" className="form-input" placeholder="Brief summary of your inquiry" value={subject} onChange={e => setSubject(e.target.value)} />
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="contact-message">Message Details <span style={{ color: 'var(--brass-500)' }}>*</span></label>
                      <textarea id="contact-message" className="form-input" style={{ minHeight: '140px', resize: 'vertical' }} required placeholder="Provide as much detail as possible so we can assist you efficiently." value={message} onChange={e => setMessage(e.target.value)}></textarea>
                    </div>

                    <div style={{ display: 'flex', gap: 'var(--sp-3)', marginTop: 'var(--sp-2)' }}>
                      <button type="submit" className="btn btn--brass" style={{ flex: 1 }}>
                        Submit Inquiry →
                      </button>
                    </div>

                    <p className="text-xs text-muted" style={{ marginTop: 'var(--sp-2)' }}>
                      By submitting this form, you agree to our Privacy Policy. Typical response time is 1–2 business days.
                    </p>
                  </form>
                </div>

              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="py-20 bg-900 border-muted" id="faq">
            <div className="container container--narrow">
              <div className="section-header text-center animate-fadeUp">
                <span className="section-label">Common Questions</span>
                <h2 className="section-title">Frequently Asked Questions</h2>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }} className="animate-fadeUp">
                <div className="card p-5">
                  <h4 className="font-semi text-primary mb-2">How do I enroll in FingenIQ?</h4>
                  <p className="text-xs text-secondary">Click "Enter FingenIQ" from the homepage to access the platform. Account creation and enrollment can be completed directly from the dashboard without contacting support.</p>
                </div>
                <div className="card p-5">
                  <h4 className="font-semi text-primary mb-2">Is FingenIQ certification recognised by employers?</h4>
                  <p className="text-xs text-secondary">FingenIQ credentials are verifiable via a tamper-proof code system. Employers can validate credentials through our marketplace portal. Our SEBI-equivalence roadmap is aspirational and under active development.</p>
                </div>
                <div className="card p-5">
                  <h4 className="font-semi text-primary mb-2">Do you offer bulk pricing for organisations?</h4>
                  <p className="text-xs text-secondary">Yes. We offer enterprise cohort licensing for corporates, universities, and financial institutions. Contact enterprise@fingeniq.com for custom pricing and white-label options.</p>
                </div>
                <div className="card p-5">
                  <h4 className="font-semi text-primary mb-2">How long does certification take?</h4>
                  <p className="text-xs text-secondary">The full curriculum consists of 44 lessons across 8 modules with a 20-step framework per lesson. Most learners complete the Completion tier in 3–4 months at a pace of 2–3 lessons per week.</p>
                </div>
              </div>
            </div>
          </section>

        </main>

        <Footer />
      </div>
    </div>
  );
}
