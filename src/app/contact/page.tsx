'use client';
import PublicNav from '@/components/nav/PublicNav';
import Footer from '@/components/layout/Footer';
import { useState } from 'react';

type TabKey = 'courses' | 'fingeniq' | 'support';

const TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: 'courses', label: 'Contact for Courses', icon: '📚' },
  { key: 'fingeniq', label: 'Contact FinGenIQ', icon: '🏢' },
  { key: 'support', label: 'Support / Services', icon: '🛠️' },
];

const TAB_CONFIG: Record<TabKey, { heading: string; description: string; placeholder: string; inquiryOptions: { value: string; label: string }[] }> = {
  courses: {
    heading: 'Course Enquiry',
    description: 'Have questions about our curriculum, enrollment, or course details? Fill in the form below and our admissions team will get back to you.',
    placeholder: 'Tell us about the course or module you are interested in, your learning goals, or any specific questions about the curriculum.',
    inquiryOptions: [
      { value: 'enrollment', label: 'Enrollment & Admissions' },
      { value: 'curriculum', label: 'Curriculum Details' },
      { value: 'pricing', label: 'Pricing & Payment' },
      { value: 'cohort', label: 'Enterprise / Cohort Enrollment' },
      { value: 'certification', label: 'Certification Queries' },
    ],
  },
  fingeniq: {
    heading: 'General Enquiry',
    description: 'Want to reach out about partnerships, media, or general business inquiries? Our team is happy to assist.',
    placeholder: 'Describe your inquiry — partnerships, collaboration, media requests, or any general questions about FingenIQ.',
    inquiryOptions: [
      { value: 'partnership', label: 'Partnership Inquiry' },
      { value: 'media', label: 'Media & Press' },
      { value: 'recruiter', label: 'Recruiter / Marketplace Access' },
      { value: 'feedback', label: 'Feedback & Suggestions' },
      { value: 'other', label: 'Other' },
    ],
  },
  support: {
    heading: 'Support & Services',
    description: 'Need technical support, certification verification, or help with your account? Let us know and we will resolve it quickly.',
    placeholder: 'Describe the issue you are facing — platform errors, account access, certification verification, or any technical questions.',
    inquiryOptions: [
      { value: 'technical', label: 'Technical Support' },
      { value: 'account', label: 'Account & Access Issues' },
      { value: 'certification-verify', label: 'Certification Verification' },
      { value: 'billing', label: 'Billing & Payments' },
      { value: 'bug', label: 'Report a Bug' },
    ],
  },
};

export default function Contact() {
  const [activeTab, setActiveTab] = useState<TabKey>('courses');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [type, setType] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [toast, setToast] = useState<{ title: string; desc: string } | null>(null);

  const config = TAB_CONFIG[activeTab];

  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
    setType('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setToast({
      title: 'Message Submitted ✉️',
      desc: `Thank you, ${name}. Our team will respond to ${email} within 1–2 business days.`,
    });
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
          zIndex: 1000, background: '#FFFFFF', border: '1px solid rgba(22,163,74,0.3)',
          boxShadow: '0 10px 36px rgba(0,0,0,0.1)',
          padding: 'var(--sp-4)', borderRadius: 'var(--radius-lg)', maxWidth: '320px',
          animation: 'fadeUp 0.3s ease-out'
        }}>
          <div style={{ color: '#15803D', fontWeight: 600, fontSize: 'var(--text-sm)' }}>{toast.title}</div>
          <div style={{ color: '#475569', fontSize: 'var(--text-xs)', marginTop: '4px' }}>{toast.desc}</div>
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

          {/* Contact Section with Tabs */}
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
                        <div className="text-sm text-secondary">VIVIN Synergy</div>
                        <div className="text-xs text-muted mt-1">United Arab Emirates</div>
                      </div>
                    </div>

                    <div className="card p-5" style={{ display: 'flex', gap: 'var(--sp-4)', alignItems: 'start' }}>
                      <span style={{ fontSize: '1.5rem' }}>📍</span>
                      <div>
                        <div className="font-semi text-primary mb-1">Platform Indian Office</div>
                        <div className="text-sm text-secondary">Chennai, Tamil Nadu</div>
                        <div className="text-xs text-muted mt-1">India</div>
                      </div>
                    </div>

                    <div className="card p-5" style={{ display: 'flex', gap: 'var(--sp-4)', alignItems: 'start' }}>
                      <span style={{ fontSize: '1.5rem' }}>✉️</span>
                      <div>
                        <div className="font-semi text-primary mb-1">Support &amp; Admissions Email</div>
                        <div className="text-sm text-brass">support@fingeniq.com</div>
                        <div className="text-xs text-muted mt-1">Response within 1–2 business days</div>
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

                {/* Right: Tabbed Contact Form */}
                <div className="animate-fadeUp delay-100">
                  {/* Tab Bar */}
                  <div style={{
                    display: 'flex',
                    gap: '0',
                    marginBottom: 'var(--sp-6)',
                    borderRadius: 'var(--radius-lg)',
                    overflow: 'hidden',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}>
                    {TABS.map((tab) => (
                      <button
                        key={tab.key}
                        onClick={() => handleTabChange(tab.key)}
                        style={{
                          flex: 1,
                          padding: 'var(--sp-3) var(--sp-4)',
                          background: activeTab === tab.key
                            ? 'rgba(201,168,76,0.12)'
                            : 'rgba(255,255,255,0.02)',
                          color: activeTab === tab.key
                            ? 'var(--brass-400)'
                            : 'var(--ink-400)',
                          border: 'none',
                          borderBottom: activeTab === tab.key
                            ? '2px solid var(--brass-500)'
                            : '2px solid transparent',
                          fontSize: 'var(--text-xs)',
                          fontWeight: activeTab === tab.key ? 600 : 400,
                          fontFamily: 'var(--font-sans)',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 'var(--sp-2)',
                        }}
                      >
                        <span>{tab.icon}</span>
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Form Card */}
                  <div className="card p-8">
                    <h3 className="text-xl font-semi text-brass mb-2">{config.heading}</h3>
                    <p className="text-xs text-secondary mb-6">{config.description}</p>

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
                            {config.inquiryOptions.map(opt => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label" htmlFor="contact-subject">Subject</label>
                        <input type="text" id="contact-subject" className="form-input" placeholder="Brief summary of your inquiry" value={subject} onChange={e => setSubject(e.target.value)} />
                      </div>

                      <div className="form-group">
                        <label className="form-label" htmlFor="contact-message">Message Details <span style={{ color: 'var(--brass-500)' }}>*</span></label>
                        <textarea id="contact-message" className="form-input" style={{ minHeight: '140px', resize: 'vertical' }} required placeholder={config.placeholder} value={message} onChange={e => setMessage(e.target.value)}></textarea>
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
            </div>
          </section>

        </main>

        <Footer />
      </div>
    </div>
  );
}
