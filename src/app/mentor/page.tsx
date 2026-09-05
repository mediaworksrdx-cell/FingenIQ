'use client';

import { useState } from 'react';
import PublicNav from '@/components/nav/PublicNav';
import Footer from '@/components/layout/Footer';

interface MentorProfile {
  name: string;
  designation: string;
  qualification?: string;
  experience: string;
  experienceIcon?: string;
  focusAreas: string[];
  bio: string;
  initials: string;
  avatarGradient: string;
}

const FEATURED_MENTORS: MentorProfile[] = [
  {
    name: 'Dr. Vaishali Rupam',
    designation: 'Independent Director | Synthetix Analytix',
    qualification: 'MSc · B.Ed · MPhil · MBA · PhD',
    experienceIcon: '⏱️',
    experience: '30+ Years in Academic Leadership, FinTech & Financial Education',
    focusAreas: ['AI & FinTech', 'Financial Education', 'Market Accessibility', 'Investor Empowerment'],
    bio: 'Academic leader with extensive experience across India and the UAE, focused on AI-driven financial innovation and investor empowerment.',
    initials: 'VR',
    avatarGradient: 'linear-gradient(135deg, #15803D 0%, #166534 100%)',
  },
  {
    name: 'Shivaram Y.S',
    designation: 'Commercial Strategy | Project Controls | Contractual Claims',
    qualification: 'Engineer | MBA | PMP | Certified in No-Code AI & Machine Learning | Certified Wellness Coach',
    experienceIcon: '🏆',
    experience: '30+ Years Global Leadership in EPC & Infrastructure',
    focusAreas: ['Commercial Strategy', 'Project Controls', 'Contractual Claims', 'Predictive Analytics'],
    bio: 'A senior industry leader with experience across major organizations including Bechtel, SABIC, McDermott, Petrofac, and Eversendai, specializing in commercial strategy, project controls, risk mitigation, and profitable project outcomes.',
    initials: 'SY',
    avatarGradient: 'linear-gradient(135deg, #B45309 0%, #78350F 100%)',
  },
  {
    name: 'Rupam Shyamrao',
    designation: 'Director – Operations | Synthetix Analytix',
    qualification: 'BE (Production) · MBA',
    experienceIcon: '⏱️',
    experience: '35+ Years of Senior Leadership | 30+ Years of Market Experience',
    focusAreas: ['Government Projects', 'Operations & Maintenance', 'Market Strategy', 'Financial Education'],
    bio: 'Seasoned leader with proven expertise in government-sector water, electricity, energy, operations, maintenance, and major infrastructure projects. Brings deep market knowledge across Indian and U.S. equities, commodities, and digital assets.',
    initials: 'RS',
    avatarGradient: 'linear-gradient(135deg, #1D4ED8 0%, #1E3A8A 100%)',
  },
  {
    name: 'Biswajeet Behura',
    designation: 'Managing Director | Meta Wealth Capital',
    qualification: 'MBA in Marketing & Finance | Postgraduate in Artificial Intelligence',
    experienceIcon: '🏆',
    experience: 'Nearly 20 Years in Financial Services & Education',
    focusAreas: ['Strategic Advisory', 'Financial Education', 'Market Insights', 'Professional Mentorship'],
    bio: 'A seasoned finance professional and strategic mentor guiding FinGeniQ’s initiatives, transforming complex market dynamics into accessible, high-impact learning frameworks for aspiring finance professionals.',
    initials: 'BB',
    avatarGradient: 'linear-gradient(135deg, #0F766E 0%, #115E59 100%)',
  },
  {
    name: 'Rutvik Rupam',
    designation: 'Promoter | Synthetix Analytix',
    qualification: 'BE (Mechanical) · MS ISCM, Germany · FinTech Diploma, NUS',
    experienceIcon: '⏱️',
    experience: 'Global Operations, Data Strategy & Financial Technology',
    focusAreas: ['AI & FinTech', 'Data Strategy', 'Global Operations', 'Market Intelligence'],
    bio: 'Combines engineering, global operations, and AI-driven analytics to develop intelligent financial solutions for modern investors.',
    initials: 'RR',
    avatarGradient: 'linear-gradient(135deg, #4338CA 0%, #312E81 100%)',
  },
];

export default function MentorPage() {
  const [formData, setFormData] = useState({
    name: '',
    qualification: '',
    experience: '',
    interestToWork: '',
    phone: '',
    email: '',
    whatsapp: '',
    linkedin: '',
    interestedIn: '',
    companyName: '',
    address: '',
    areaOfBusiness: '',
    website: '',
  });

  const [toast, setToast] = useState<{ title: string; desc: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const details = [
        `Qualification & Certifications: ${formData.qualification}`,
        `Experience & Role: ${formData.experience}`,
        `Engagement Model: ${formData.interestToWork}`,
        `Phone: ${formData.phone}`,
        `Email: ${formData.email}`,
        formData.whatsapp ? `WhatsApp: ${formData.whatsapp}` : '',
        formData.linkedin ? `LinkedIn: ${formData.linkedin}` : '',
        `Primary Area of Interest: ${formData.interestedIn}`,
        formData.companyName ? `Company / Institution: ${formData.companyName}` : '',
        formData.address ? `Corporate Address: ${formData.address}` : '',
        formData.areaOfBusiness ? `Sector / Business: ${formData.areaOfBusiness}` : '',
        formData.website ? `Website: ${formData.website}` : '',
      ].filter(Boolean).join('\n\n');

      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          category: 'Faculty & Mentorship',
          inquiryType: formData.interestedIn || 'Faculty / Mentor Application',
          subject: `Faculty & Mentor Application: ${formData.name}`,
          message: details,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setToast({
          title: 'Application Submitted 🤝',
          desc: `Thank you, ${formData.name}. Your application has been routed to our faculty desk (shivaram@vivinfacilitators.com). We will review and contact you shortly.`,
        });
        setFormData({
          name: '',
          qualification: '',
          experience: '',
          interestToWork: '',
          phone: '',
          email: '',
          whatsapp: '',
          linkedin: '',
          interestedIn: '',
          companyName: '',
          address: '',
          areaOfBusiness: '',
          website: '',
        });
      } else {
        setToast({
          title: 'Submission Issue ⚠️',
          desc: data.error || 'Failed to submit application. Please try again.',
        });
      }
    } catch {
      setToast({
        title: 'Submission Error ❌',
        desc: 'Network error. Please check your connection and try again.',
      });
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setToast(null), 6000);
    }
  };

  return (
    <div className="landing">
      <div className="page-wrapper">
        <PublicNav />
        <main className="page-main">
          {/* Hero Section */}
          <section className="relative py-20 flex flex-col justify-center" style={{ minHeight: '40vh', borderBottom: '1px solid rgba(0, 0, 0, 0.08)' }}>
            <div className="container">
              <div className="max-w-3xl animate-fadeUp">
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', fontWeight: 800, color: '#15803D', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 'var(--sp-4)' }}>
                  <span>🤝 Faculty &amp; Mentor Network</span>
                </div>
                <h1 className="section-title mb-4" style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(2.25rem, 5vw, 3.25rem)', color: '#0F172A', fontWeight: 700 }}>
                  Learn from <em style={{ color: '#15803D', fontStyle: 'italic' }}>Institutional Mentors</em>
                </h1>
                <p className="section-subtitle" style={{ fontSize: '1.1rem', color: '#475569', lineHeight: 1.6, maxWidth: 640 }}>
                  Our curriculum and case study evaluations are led by veteran market practitioners, portfolio managers, chartered analysts, and economic researchers.
                </p>
              </div>
            </div>
          </section>

          {/* 3 Featured Mentors Showcase */}
          <section className="py-20" style={{ background: '#FAF8F5' }}>
            <div className="container">
              <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto var(--sp-12)' }}>
                <div style={{ fontSize: 'var(--text-2xs)', fontWeight: 700, color: '#15803D', letterSpacing: 'var(--tracking-widest)', textTransform: 'uppercase', marginBottom: 'var(--sp-2)' }}>
                  Institutional Faculty
                </div>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.25rem', color: '#0F172A', fontWeight: 700 }}>
                  Featured Mentors &amp; Advisors
                </h2>
                <p style={{ fontSize: '0.95rem', color: '#64748B', marginTop: '0.5rem' }}>
                  Industry leaders providing direct case reviews, financial model feedback, and career mentorship.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
                {FEATURED_MENTORS.map((m, idx) => (
                  <div
                    key={idx}
                    className="card card--interactive animate-fadeUp"
                    style={{
                      animationDelay: `${idx * 150}ms`,
                      display: 'flex',
                      flexDirection: 'column',
                      background: '#FFFFFF',
                      border: '1px solid rgba(0, 0, 0, 0.08)',
                      borderRadius: '1.25rem',
                      padding: '2rem',
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
                    }}
                  >
                    {/* Top Avatar & Name */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                      <div
                        style={{
                          width: 56,
                          height: 56,
                          borderRadius: '50%',
                          background: m.avatarGradient,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#FFFFFF',
                          fontSize: '1.2rem',
                          fontWeight: 700,
                          flexShrink: 0,
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                        }}
                      >
                        {m.initials}
                      </div>
                      <div>
                        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', fontWeight: 700, color: '#0F172A', margin: 0, lineHeight: 1.3 }}>
                          {m.name}
                        </h3>
                        <p style={{ fontSize: '0.8rem', color: '#15803D', fontWeight: 600, margin: '2px 0 0' }}>
                          {m.designation}
                        </p>
                      </div>
                    </div>

                    {/* Academic & Professional Qualification Box */}
                    {m.qualification && (
                      <div
                        style={{
                          background: '#FAF8F5',
                          border: '1px solid rgba(0, 0, 0, 0.06)',
                          borderLeft: '3px solid #15803D',
                          borderRadius: '0.5rem',
                          padding: '0.75rem 1rem',
                          marginBottom: '1rem',
                        }}
                      >
                        <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '2px' }}>
                          🎓 Qualification &amp; Accreditations
                        </div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0F172A', lineHeight: 1.4 }}>
                          {m.qualification}
                        </div>
                      </div>
                    )}

                    {/* Experience Banner */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontSize: '0.8rem', color: '#475569' }}>
                      <span style={{ fontSize: '0.9rem' }}>{m.experienceIcon || '⏱️'}</span>
                      <strong style={{ color: '#0F172A' }}>{m.experience}</strong>
                    </div>

                    {/* Bio */}
                    <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.6, marginBottom: '1.25rem', flex: 1 }}>
                      {m.bio}
                    </p>

                    {/* Domain Focus Tags */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '1rem' }}>
                      {m.focusAreas.map((area, i) => (
                        <span
                          key={i}
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            padding: '2px 8px',
                            borderRadius: '9999px',
                            background: 'rgba(22, 163, 74, 0.08)',
                            color: '#15803D',
                            border: '1px solid rgba(22, 163, 74, 0.2)',
                          }}
                        >
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Form Section */}
          <section className="py-20 relative z-10" style={{ borderTop: '1px solid rgba(0, 0, 0, 0.08)' }}>
            <div className="container">
              <div style={{ textAlign: 'center', maxWidth: 640, margin: '0 auto var(--sp-12)' }}>
                <div style={{ fontSize: 'var(--text-2xs)', fontWeight: 700, color: '#15803D', letterSpacing: 'var(--tracking-widest)', textTransform: 'uppercase', marginBottom: 'var(--sp-2)' }}>
                  Join the Faculty
                </div>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.25rem', color: '#0F172A', fontWeight: 700 }}>
                  Apply as a Mentor or Partner
                </h2>
                <p style={{ fontSize: '0.95rem', color: '#64748B', marginTop: '0.5rem' }}>
                  Share your market knowledge, review student valuation models, or explore institutional business partnerships.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                <div className="lg:col-span-5 animate-fadeUp" style={{ animationDelay: '100ms' }}>
                  <div className="sticky top-24 space-y-6">
                    <div className="card p-8 bg-900 border-muted" style={{ background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.08)' }}>
                      <h3 className="text-xl font-medium text-[#0F172A] mb-4" style={{ fontFamily: 'var(--font-serif)', fontWeight: 700 }}>
                        Mentoring Benefits
                      </h3>
                      <ul className="space-y-3 text-[#475569]">
                        <li className="flex gap-3">
                          <span className="text-[#15803D] font-bold">✦</span>
                          <span>Shape the next generation of financial intelligence leaders</span>
                        </li>
                        <li className="flex gap-3">
                          <span className="text-[#15803D] font-bold">✦</span>
                          <span>Flexible asynchronous model reviews and live masterclasses</span>
                        </li>
                        <li className="flex gap-3">
                          <span className="text-[#15803D] font-bold">✦</span>
                          <span>Exclusive peer networking with senior finance faculty</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div className="card p-8 bg-900 border-muted" style={{ background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.08)' }}>
                      <h3 className="text-xl font-medium text-[#0F172A] mb-4" style={{ fontFamily: 'var(--font-serif)', fontWeight: 700 }}>
                        Partnership Benefits
                      </h3>
                      <ul className="space-y-3 text-[#475569]">
                        <li className="flex gap-3">
                          <span className="text-[#15803D] font-bold">✦</span>
                          <span>Collaborate on bespoke financial curriculum and simulations</span>
                        </li>
                        <li className="flex gap-3">
                          <span className="text-[#15803D] font-bold">✦</span>
                          <span>Direct hiring pipeline to distinction-tier certified talent</span>
                        </li>
                        <li className="flex gap-3">
                          <span className="text-[#15803D] font-bold">✦</span>
                          <span>Co-branding in community research publications and case studies</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-7 animate-fadeUp" style={{ animationDelay: '200ms' }}>
                  <div className="card p-8 bg-900 border-muted" style={{ background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '1.25rem', boxShadow: '0 10px 40px rgba(0,0,0,0.05)' }}>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="form-group">
                        <label className="form-label" htmlFor="name" style={{ color: '#0F172A', fontWeight: 600 }}>
                          Full Name <span style={{ color: '#15803D' }}>*</span>
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          required
                          placeholder="e.g. Anand Mahindra, CFA"
                          className="form-input"
                          value={formData.name}
                          onChange={handleChange}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label" htmlFor="qualification" style={{ color: '#0F172A', fontWeight: 600 }}>
                          Highest Qualification &amp; Certifications <span style={{ color: '#15803D' }}>*</span>
                        </label>
                        <input
                          type="text"
                          id="qualification"
                          name="qualification"
                          required
                          placeholder="e.g. CFA / CA / Ph.D. Finance / MBA (IIM)"
                          className="form-input"
                          value={formData.qualification}
                          onChange={handleChange}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label" htmlFor="experience" style={{ color: '#0F172A', fontWeight: 600 }}>
                          Experience &amp; Current Role Details <span style={{ color: '#15803D' }}>*</span>
                        </label>
                        <textarea
                          id="experience"
                          name="experience"
                          required
                          placeholder="Briefly describe your years of experience, current organisation, and core market domain..."
                          className="form-input"
                          style={{ minHeight: '100px' }}
                          value={formData.experience}
                          onChange={handleChange}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label" htmlFor="interestToWork" style={{ color: '#0F172A', fontWeight: 600 }}>
                          Availability / Engagement Model <span style={{ color: '#15803D' }}>*</span>
                        </label>
                        <select
                          id="interestToWork"
                          name="interestToWork"
                          required
                          className="form-input"
                          value={formData.interestToWork}
                          onChange={handleChange}
                        >
                          <option value="">Select engagement preference...</option>
                          <option value="Guest Lecturer / Masterclass">Guest Lecturer / Masterclass</option>
                          <option value="Case Study & Model Reviewer">Case Study &amp; Model Reviewer</option>
                          <option value="Part Time Mentor">Part Time Mentor</option>
                          <option value="Full Time Faculty">Full Time Faculty</option>
                          <option value="Advisory Board">Advisory Board</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="form-group">
                          <label className="form-label" htmlFor="phone" style={{ color: '#0F172A', fontWeight: 600 }}>
                            Phone Number <span style={{ color: '#15803D' }}>*</span>
                          </label>
                          <input
                            type="tel"
                            id="phone"
                            name="phone"
                            required
                            placeholder="+91 98765 43210"
                            className="form-input"
                            value={formData.phone}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label" htmlFor="email" style={{ color: '#0F172A', fontWeight: 600 }}>
                            Work / Official Email <span style={{ color: '#15803D' }}>*</span>
                          </label>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            required
                            placeholder="name@firm.com"
                            className="form-input"
                            value={formData.email}
                            onChange={handleChange}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="form-group">
                          <label className="form-label" htmlFor="whatsapp" style={{ color: '#0F172A', fontWeight: 600 }}>
                            WhatsApp Contact
                          </label>
                          <input
                            type="tel"
                            id="whatsapp"
                            name="whatsapp"
                            placeholder="+91 98765 43210"
                            className="form-input"
                            value={formData.whatsapp}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label" htmlFor="linkedin" style={{ color: '#0F172A', fontWeight: 600 }}>
                            LinkedIn Profile URL
                          </label>
                          <input
                            type="url"
                            id="linkedin"
                            name="linkedin"
                            placeholder="https://linkedin.com/in/username"
                            className="form-input"
                            value={formData.linkedin}
                            onChange={handleChange}
                          />
                        </div>
                      </div>

                      <div className="form-group border-t border-[rgba(0,0,0,0.08)] pt-6 mt-6">
                        <label className="form-label" htmlFor="interestedIn" style={{ color: '#0F172A', fontWeight: 600 }}>
                          Primary Area of Interest <span style={{ color: '#15803D' }}>*</span>
                        </label>
                        <select
                          id="interestedIn"
                          name="interestedIn"
                          required
                          className="form-input"
                          value={formData.interestedIn}
                          onChange={handleChange}
                        >
                          <option value="">Select area...</option>
                          <option value="Mentoring">Individual &amp; Batch Mentoring</option>
                          <option value="Business Partnership">Institutional Business Partnership</option>
                          <option value="Content & Case Co-Creation">Content &amp; Case Study Co-Creation</option>
                        </select>
                      </div>

                      {formData.interestedIn === 'Business Partnership' && (
                        <div className="space-y-6 animate-fadeUp">
                          <div className="form-group">
                            <label className="form-label" htmlFor="companyName" style={{ color: '#0F172A', fontWeight: 600 }}>
                              Company / Institution Name <span style={{ color: '#15803D' }}>*</span>
                            </label>
                            <input
                              type="text"
                              id="companyName"
                              name="companyName"
                              required={formData.interestedIn === 'Business Partnership'}
                              className="form-input"
                              value={formData.companyName}
                              onChange={handleChange}
                            />
                          </div>

                          <div className="form-group">
                            <label className="form-label" htmlFor="address" style={{ color: '#0F172A', fontWeight: 600 }}>
                              Corporate Address <span style={{ color: '#15803D' }}>*</span>
                            </label>
                            <textarea
                              id="address"
                              name="address"
                              required={formData.interestedIn === 'Business Partnership'}
                              className="form-input"
                              style={{ minHeight: '80px' }}
                              value={formData.address}
                              onChange={handleChange}
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="form-group">
                              <label className="form-label" htmlFor="areaOfBusiness" style={{ color: '#0F172A', fontWeight: 600 }}>
                                Sector / Area of Business <span style={{ color: '#15803D' }}>*</span>
                              </label>
                              <input
                                type="text"
                                id="areaOfBusiness"
                                name="areaOfBusiness"
                                required={formData.interestedIn === 'Business Partnership'}
                                className="form-input"
                                value={formData.areaOfBusiness}
                                onChange={handleChange}
                              />
                            </div>
                            <div className="form-group">
                              <label className="form-label" htmlFor="website" style={{ color: '#0F172A', fontWeight: 600 }}>
                                Organization Website
                              </label>
                              <input
                                type="url"
                                id="website"
                                name="website"
                                placeholder="https://company.com"
                                className="form-input"
                                value={formData.website}
                                onChange={handleChange}
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="pt-4">
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="btn btn--brass w-full justify-center"
                          style={{ padding: '0.85rem 1.5rem', fontSize: '0.95rem', opacity: isSubmitting ? 0.7 : 1, cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
                        >
                          {isSubmitting ? 'Submitting Application...' : 'Submit Faculty & Mentor Application →'}
                        </button>
                      </div>

                      <p className="text-sm text-[#64748B] text-center mt-4">
                        By submitting this application, you agree to our privacy policy and faculty terms of service.
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

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-fadeUp">
          <div className="card p-4 max-w-sm flex items-start gap-3" style={{ background: '#FFFFFF', border: '1px solid rgba(22, 163, 74, 0.4)', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }}>
            <div className="flex-1">
              <h4 className="font-bold text-[#0F172A] mb-1">{toast.title}</h4>
              <p className="text-sm text-[#475569]">{toast.desc}</p>
            </div>
            <button
              onClick={() => setToast(null)}
              className="text-[#64748B] hover:text-[#0F172A] transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
