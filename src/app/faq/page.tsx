"use client";

import React, { useState } from "react";
import Nav from "../components/common/Nav";
import SecondFooter from "../components/common/SecondFooter";
import { ChevronDown, HelpCircle } from "lucide-react";

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      category: "For Clients",
      questions: [
        {
          q: "How do I book a service?",
          a: "Simply browse our categories or search for a specific service, select your preferred professional, fill in the service details, and pay a small booking fee (₦2,000 regular or ₦5,000 for emergency within 2 days). The serviceman will then review your request and provide a cost estimate."
        },
        {
          q: "What payment methods do you accept?",
          a: "We use Paystack for secure payment processing. You can pay with debit cards, credit cards, bank transfers, and other payment methods supported by Paystack. All transactions are encrypted and secure."
        },
        {
          q: "What is the booking fee?",
          a: "The booking fee is ₦2,000 for regular bookings (2+ days in advance) and ₦5,000 for emergency services (less than 2 days). This fee confirms your booking and allows the serviceman to review your request and provide an estimate."
        },
        {
          q: "How does the pricing work?",
          a: "After you book, the serviceman reviews your request and provides an estimate. Our admin team then adds a small platform fee (typically 10%) for maintenance and support. You'll see the full breakdown before making the final payment."
        },
        {
          q: "Can I cancel a booking?",
          a: "Yes, you can cancel bookings at certain stages. However, the booking fee is non-refundable as it compensates the serviceman for reviewing your request. You can cancel before the serviceman submits an estimate."
        },
        {
          q: "How do I rate a serviceman?",
          a: "After the service is completed, you'll be able to submit a rating and review. This helps other customers make informed decisions and helps maintain quality on our platform."
        },
        {
          q: "What if I'm not satisfied with the service?",
          a: "Our admin team monitors all service requests. If you have any issues, you can report them through the service request page. We take quality seriously and will work to resolve any problems."
        }
      ]
    },
    {
      category: "For Service Providers",
      questions: [
        {
          q: "How do I become a service provider?",
          a: "Click 'Apply to be a Provider' on the homepage, fill out the registration form with your skills and experience, and submit your application. Our admin team will review your profile and approve qualified professionals."
        },
        {
          q: "How do I get paid?",
          a: "Clients pay through our secure Paystack integration. The payment is processed after you complete the job and the client confirms. You receive the service cost (your estimate) while the platform retains a small fee."
        },
        {
          q: "Can I set my own prices?",
          a: "Yes! When you receive a service request, you review the details and submit your own cost estimate based on the work required. Clients see this estimate (plus a small platform fee) before approving."
        },
        {
          q: "What if I need to decline a job?",
          a: "You can view job requests on your dashboard and choose which ones to accept. You're not obligated to take every request, but maintaining a good acceptance rate helps build your reputation."
        },
        {
          q: "How does the backup serviceman system work?",
          a: "For important jobs, admin may assign a backup serviceman. If you're unable to complete the job, the backup can step in. This ensures clients always receive service and helps maintain platform reliability."
        }
      ]
    },
    {
      category: "General",
      questions: [
        {
          q: "Is ServiceHub available in my area?",
          a: "We're currently expanding our service areas. When booking, you'll provide your address and we'll match you with available professionals in your location."
        },
        {
          q: "How are servicemen verified?",
          a: "All servicemen must submit their skills, experience, and credentials during registration. Our admin team reviews each application, verifies qualifications, and only approves qualified professionals."
        },
        {
          q: "What categories of services are available?",
          a: "We offer a wide range of services including Plumbing, Electrical work, Cleaning, Painting, Carpentry, Gardening, and more. Browse our categories page to see all available services."
        },
        {
          q: "How do notifications work?",
          a: "You'll receive notifications for important updates like booking confirmations, estimate submissions, payment confirmations, and service updates. Check the notifications icon in your dashboard to stay updated."
        },
        {
          q: "Is my personal information safe?",
          a: "Yes, we take data privacy seriously. Your personal information is encrypted and stored securely. We never share your data with third parties without your consent."
        }
      ]
    }
  ];

  return (
    <div className="min-vh-100 bg-light">
      {/* Fixed Nav */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          backgroundColor: "white",
          boxShadow: '0 2px 20px rgba(0,0,0,0.1)',
        }}
      >
        <Nav />
      </div>

      {/* Hero Section */}
      <div className="position-relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-emerald-50" style={{ marginTop: '80px' }}>
        <div className="container py-5">
          <div className="row align-items-center">
            <div className="col-lg-8 mx-auto text-center">
              <div className="d-inline-flex align-items-center justify-content-center bg-primary bg-opacity-10 rounded-circle mb-4" style={{ width: '80px', height: '80px' }}>
                <HelpCircle className="text-primary" size={40} />
              </div>
              <h1 className="display-4 fw-bold text-dark mb-4">
                Frequently Asked Questions
              </h1>
              <p className="lead text-muted mb-0">
                Find answers to common questions about using ServiceHub
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Content */}
      <div className="container py-5" style={{ marginBottom: '80px' }}>
        {faqs.map((section, sectionIndex) => (
          <div key={sectionIndex} className="mb-5">
            <h2 className="h4 fw-bold mb-4 text-primary">{section.category}</h2>
            <div className="accordion" id={`accordion-${sectionIndex}`}>
              {section.questions.map((faq, faqIndex) => {
                const globalIndex = sectionIndex * 100 + faqIndex;
                const isOpen = openIndex === globalIndex;
                
                return (
                  <div key={faqIndex} className="card border-0 shadow-sm mb-3">
                    <div className="card-header bg-white border-0">
                      <button
                        className="btn btn-link text-decoration-none w-100 text-start d-flex justify-content-between align-items-center p-3"
                        onClick={() => setOpenIndex(isOpen ? null : globalIndex)}
                        style={{ color: isOpen ? '#0d6efd' : '#212529' }}
                      >
                        <span className="fw-semibold">{faq.q}</span>
                        <ChevronDown 
                          size={20} 
                          className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
                          style={{ 
                            transition: 'transform 0.3s ease',
                            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                          }}
                        />
                      </button>
                    </div>
                    {isOpen && (
                      <div className="card-body pt-0 px-4 pb-4">
                        <p className="text-muted mb-0">{faq.a}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Contact Support */}
        <div className="text-center py-5">
          <div className="card border-0 shadow-sm p-5 bg-white">
            <h3 className="h4 fw-bold mb-3">Still have questions?</h3>
            <p className="text-muted mb-4">
              Can't find the answer you're looking for? Our support team is here to help.
            </p>
            <div className="d-flex gap-3 justify-content-center flex-wrap">
              <a href="/contact" className="btn btn-primary px-4">
                Contact Support
              </a>
              <a href="/servicemen" className="btn btn-outline-primary px-4">
                Browse Services
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Footer */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          backgroundColor: "white",
        }}
      >
        <SecondFooter />
      </div>
    </div>
  );
}

