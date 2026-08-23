'use client';

import { useState } from 'react';
import PublicNav from '@/components/nav/PublicNav';
import Footer from '@/components/layout/Footer';

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setToast({
      title: 'Application Submitted 🤝',
      desc: `Thank you, ${formData.name}. We will review your application and get back to you within 3-5 business days.`,
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
    setTimeout(() => setToast(null), 5000);
  };

  return (
    <div className="landing">
      <div className="page-wrapper">
        <PublicNav />
        <main className="page-main">
          {/* Hero Section */}
          <section className="relative py-20 flex flex-col justify-center" style={{ minHeight: '50vh' }}>
            <div className="container">
              <div className="max-w-3xl animate-fadeUp">
                <div className="section-label mb-6">🤝 Mentor & Partner Program</div>
                <h1 className="section-title mb-6">
                  Become a <em className="text-[var(--brass-500)] not-italic">Mentor</em>
                </h1>
                <p className="section-subtitle">
                  Join FingenIQ as a mentor or business partner. Share your expertise, guide learners, and help shape the future of financial education.
                </p>
              </div>
            </div>
          </section>

          {/* Form Section */}
          <section className="py-20 relative z-10">
            <div className="container">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                <div className="lg:col-span-5 animate-fadeUp" style={{ animationDelay: '100ms' }}>
                  <div className="sticky top-24 space-y-6">
                    <div className="card p-8 bg-900 border-muted">
                      <h3 className="text-xl font-medium text-[var(--ink-50)] mb-4">Mentoring Benefits</h3>
                      <ul className="space-y-3 text-[var(--ink-300)]">
                        <li className="flex gap-3">
                          <span className="text-[var(--brass-500)]">✦</span>
                          <span>Shape the next generation of financial professionals</span>
                        </li>
                        <li className="flex gap-3">
                          <span className="text-[var(--brass-500)]">✦</span>
                          <span>Flexible scheduling to fit your lifestyle</span>
                        </li>
                        <li className="flex gap-3">
                          <span className="text-[var(--brass-500)]">✦</span>
                          <span>Networking opportunities within our community</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div className="card p-8 bg-900 border-muted">
                      <h3 className="text-xl font-medium text-[var(--ink-50)] mb-4">Partnership Benefits</h3>
                      <ul className="space-y-3 text-[var(--ink-300)]">
                        <li className="flex gap-3">
                          <span className="text-[var(--brass-500)]">✦</span>
                          <span>Collaborate on innovative educational programs</span>
                        </li>
                        <li className="flex gap-3">
                          <span className="text-[var(--brass-500)]">✦</span>
                          <span>Access to top-tier financial talent</span>
                        </li>
                        <li className="flex gap-3">
                          <span className="text-[var(--brass-500)]">✦</span>
                          <span>Co-branding and marketing opportunities</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-7 animate-fadeUp" style={{ animationDelay: '200ms' }}>
                  <div className="card p-8 bg-900 border-muted">
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="form-group">
                        <label className="form-label" htmlFor="name">
                          Name <span style={{ color: 'var(--brass-500)' }}>*</span>
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          required
                          className="form-input"
                          value={formData.name}
                          onChange={handleChange}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label" htmlFor="qualification">
                          Qualification <span style={{ color: 'var(--brass-500)' }}>*</span>
                        </label>
                        <input
                          type="text"
                          id="qualification"
                          name="qualification"
                          required
                          className="form-input"
                          value={formData.qualification}
                          onChange={handleChange}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label" htmlFor="experience">
                          Experience Details <span style={{ color: 'var(--brass-500)' }}>*</span>
                        </label>
                        <textarea
                          id="experience"
                          name="experience"
                          required
                          className="form-input"
                          style={{ minHeight: '100px' }}
                          value={formData.experience}
                          onChange={handleChange}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label" htmlFor="interestToWork">
                          Interest to Work <span style={{ color: 'var(--brass-500)' }}>*</span>
                        </label>
                        <select
                          id="interestToWork"
                          name="interestToWork"
                          required
                          className="form-input"
                          value={formData.interestToWork}
                          onChange={handleChange}
                        >
                          <option value="">Select option...</option>
                          <option value="Full Time">Full Time</option>
                          <option value="Part Time">Part Time</option>
                          <option value="On Call">On Call</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="form-group">
                          <label className="form-label" htmlFor="phone">
                            Phone <span style={{ color: 'var(--brass-500)' }}>*</span>
                          </label>
                          <input
                            type="tel"
                            id="phone"
                            name="phone"
                            required
                            className="form-input"
                            value={formData.phone}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label" htmlFor="email">
                            Email <span style={{ color: 'var(--brass-500)' }}>*</span>
                          </label>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            required
                            className="form-input"
                            value={formData.email}
                            onChange={handleChange}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="form-group">
                          <label className="form-label" htmlFor="whatsapp">
                            WhatsApp
                          </label>
                          <input
                            type="tel"
                            id="whatsapp"
                            name="whatsapp"
                            className="form-input"
                            value={formData.whatsapp}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="form-group">
                          <label className="form-label" htmlFor="linkedin">
                            LinkedIn Profile
                          </label>
                          <input
                            type="url"
                            id="linkedin"
                            name="linkedin"
                            placeholder="https://linkedin.com/in/..."
                            className="form-input"
                            value={formData.linkedin}
                            onChange={handleChange}
                          />
                        </div>
                      </div>

                      <div className="form-group border-t border-[var(--ink-800)] pt-6 mt-6">
                        <label className="form-label" htmlFor="interestedIn">
                          Interested In <span style={{ color: 'var(--brass-500)' }}>*</span>
                        </label>
                        <select
                          id="interestedIn"
                          name="interestedIn"
                          required
                          className="form-input"
                          value={formData.interestedIn}
                          onChange={handleChange}
                        >
                          <option value="">Select option...</option>
                          <option value="Mentoring">Mentoring</option>
                          <option value="Business Partnership">Business Partnership</option>
                        </select>
                      </div>

                      {formData.interestedIn === 'Business Partnership' && (
                        <div className="space-y-6 animate-fadeUp">
                          <div className="form-group">
                            <label className="form-label" htmlFor="companyName">
                              Company Name <span style={{ color: 'var(--brass-500)' }}>*</span>
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
                            <label className="form-label" htmlFor="address">
                              Address <span style={{ color: 'var(--brass-500)' }}>*</span>
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
                              <label className="form-label" htmlFor="areaOfBusiness">
                                Area of Business <span style={{ color: 'var(--brass-500)' }}>*</span>
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
                              <label className="form-label" htmlFor="website">
                                Website
                              </label>
                              <input
                                type="url"
                                id="website"
                                name="website"
                                placeholder="https://..."
                                className="form-input"
                                value={formData.website}
                                onChange={handleChange}
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="pt-4">
                        <button type="submit" className="btn btn--brass w-full justify-center">
                          Submit Application →
                        </button>
                      </div>

                      <p className="text-sm text-[var(--ink-400)] text-center mt-4">
                        By submitting this form, you agree to our privacy policy and terms of service.
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
          <div className="bg-[var(--ink-800)] border border-[var(--brass-500)]/30 rounded-lg shadow-2xl p-4 max-w-sm flex items-start gap-3">
            <div className="flex-1">
              <h4 className="text-[var(--ink-50)] font-medium mb-1">{toast.title}</h4>
              <p className="text-sm text-[var(--ink-300)]">{toast.desc}</p>
            </div>
            <button
              onClick={() => setToast(null)}
              className="text-[var(--ink-400)] hover:text-[var(--ink-50)] transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
