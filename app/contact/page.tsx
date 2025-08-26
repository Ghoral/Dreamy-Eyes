"use client";

import React, { useState } from "react";
import Footer from "../components/landing/Footer";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleChange = (e:any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e:any) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitSuccess(false);
    setSubmitError("");

    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="pt-28 pb-16 bg-gradient-to-br from-secondary-50 via-white to-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-secondary-800 mb-6">Contact Us</h1>
            <p className="text-xl text-secondary-600 max-w-3xl mx-auto">
              We'd love to hear from you. Get in touch with our team.
            </p>
          </div>
        </div>
      </div>

      {/* Contact Form & Info Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-white rounded-3xl shadow-soft p-8 border border-secondary-100">
              <h2 className="text-2xl font-bold text-secondary-800 mb-6">Send Us a Message</h2>
              
              {submitSuccess ? (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-6">
                  <div className="flex items-center space-x-3 text-green-700 mb-4">
                    <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-lg font-semibold">Message Sent!</h3>
                  </div>
                  <p className="text-green-600">Thank you for reaching out. We'll get back to you as soon as possible.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {submitError && (
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                      <div className="flex items-center space-x-3 text-red-700">
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{submitError}</span>
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-secondary-700 mb-2">
                      Your Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50 transition-colors duration-200"
                      placeholder="John Doe"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-secondary-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50 transition-colors duration-200"
                      placeholder="john@example.com"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-secondary-700 mb-2">
                      Subject
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50 transition-colors duration-200"
                      placeholder="How can we help you?"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-secondary-700 mb-2">
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={5}
                      className="w-full px-4 py-3 rounded-xl border border-secondary-200 focus:border-primary-500 focus:ring focus:ring-primary-200 focus:ring-opacity-50 transition-colors duration-200"
                      placeholder="Your message here..."
                    ></textarea>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full flex items-center justify-center px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${isSubmitting ? "bg-primary-400 cursor-not-allowed" : "bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white shadow-glow hover:shadow-glow-lg"}`}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Sending...</span>
                      </div>
                    ) : (
                      "Send Message"
                    )}
                  </button>
                </form>
              )}
            </div>
            
            {/* Contact Information */}
            <div className="space-y-8">
              {/* Get in Touch */}
              <div className="bg-white rounded-3xl shadow-soft p-8 border border-secondary-100">
                <h2 className="text-2xl font-bold text-secondary-800 mb-6">Get in Touch</h2>
                
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 flex-shrink-0">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-secondary-800 mb-1">Email Us</h3>
                      <p className="text-secondary-600 mb-1">For general inquiries:</p>
                      <a href="mailto:info@dreamyeyes.com" className="text-primary-600 hover:text-primary-700 transition-colors">
                        info@dreamyeyes.com
                      </a>
                      <p className="text-secondary-600 mt-2 mb-1">For customer support:</p>
                      <a href="mailto:support@dreamyeyes.com" className="text-primary-600 hover:text-primary-700 transition-colors">
                        support@dreamyeyes.com
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 flex-shrink-0">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-secondary-800 mb-1">Call Us</h3>
                      <p className="text-secondary-600 mb-1">Customer Service:</p>
                      <a href="tel:+18001234567" className="text-primary-600 hover:text-primary-700 transition-colors">
                        +1 (800) 123-4567
                      </a>
                      <p className="text-secondary-600 mt-2 mb-1">Business Hours:</p>
                      <p className="text-secondary-700">Monday - Friday: 9AM - 6PM EST</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 flex-shrink-0">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-secondary-800 mb-1">Visit Us</h3>
                      <p className="text-secondary-600 mb-1">Headquarters:</p>
                      <address className="not-italic text-secondary-700">
                        123 Vision Street<br />
                        Eye Care District<br />
                        Lens City, LC 12345<br />
                        United States
                      </address>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* FAQ */}
              <div className="bg-white rounded-3xl shadow-soft p-8 border border-secondary-100">
                <h2 className="text-2xl font-bold text-secondary-800 mb-6">Frequently Asked Questions</h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-secondary-800 mb-2">How long does shipping take?</h3>
                    <p className="text-secondary-600">Standard shipping typically takes 3-5 business days within the continental US. Express shipping options are available at checkout.</p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-secondary-800 mb-2">Do you offer international shipping?</h3>
                    <p className="text-secondary-600">Yes, we ship to most countries worldwide. International shipping times vary by location, typically 7-14 business days.</p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-secondary-800 mb-2">What is your return policy?</h3>
                    <p className="text-secondary-600">We offer a 30-day satisfaction guarantee. If you're not completely satisfied, you can return unused products in their original packaging for a full refund.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-16 bg-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-secondary-800 mb-4">Find Us</h2>
            <p className="text-xl text-secondary-600 max-w-3xl mx-auto">
              Visit our headquarters or one of our retail locations
            </p>
          </div>
          
          <div className="bg-white rounded-3xl shadow-soft overflow-hidden h-96 border border-secondary-100">
            {/* Placeholder for a map - in a real app, you would integrate Google Maps or similar */}
            <div className="w-full h-full bg-gradient-to-br from-secondary-100 to-secondary-200 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-soft">
                  <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-secondary-800 mb-2">Dreamy Eyes Headquarters</h3>
                <p className="text-secondary-600">123 Vision Street, Lens City, LC 12345</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;
