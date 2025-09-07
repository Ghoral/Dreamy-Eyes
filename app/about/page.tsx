import React from "react";
import Footer from "../components/landing/Footer";

const About = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="pt-28 pb-16 bg-gradient-to-br from-secondary-50 via-white to-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-secondary-800 mb-6">About Dreamy Eyes</h1>
            <p className="text-xl text-secondary-600 max-w-3xl mx-auto">
              Transforming your look with premium contact lenses since 2015
            </p>
          </div>
        </div>
      </div>

      {/* Our Story Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-secondary-800 mb-6">Our Story</h2>
              <p className="text-secondary-600 mb-6 leading-relaxed">
                Dreamy Eyes was founded with a simple mission: to help people express themselves through beautiful, comfortable contact lenses. What started as a small passion project has grown into a beloved brand trusted by thousands of customers worldwide.
              </p>
              <p className="text-secondary-600 mb-6 leading-relaxed">
                Our journey began when our founder, Sarah Chen, struggled to find contact lenses that were both comfortable for daily wear and aesthetically pleasing. Determined to solve this problem, she assembled a team of eye care professionals and fashion enthusiasts to create a product that would meet both needs.
              </p>
              <p className="text-secondary-600 leading-relaxed">
                Today, we continue to innovate and expand our collection, always staying true to our core values of quality, comfort, and self-expression.
              </p>
            </div>
            <div className="relative">
              <div className="aspect-w-4 aspect-h-3 rounded-3xl overflow-hidden shadow-2xl">
                <div className="w-full h-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                  <span className="text-4xl font-bold text-white">Dreamy Eyes</span>
                </div>
              </div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-secondary-100 rounded-full z-0"></div>
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-primary-100 rounded-full z-0"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values Section */}
      <section className="py-16 bg-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-secondary-800 mb-4 font-serif">Our Values</h2>
            <p className="text-xl text-secondary-600 max-w-3xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Quality",
                description: "We never compromise on the quality of our products. Each pair of contact lenses undergoes rigorous testing to ensure safety and comfort.",
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
              },
              {
                title: "Innovation",
                description: "We're constantly researching and developing new technologies to improve the comfort and aesthetic appeal of our contact lenses.",
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                ),
              },
              {
                title: "Customer Care",
                description: "Our dedicated support team is always ready to assist you with any questions or concerns about our products or your order.",
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                ),
              },
            ].map((value, index) => (
              <div key={index} className="bg-white rounded-3xl p-8 shadow-soft hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-secondary-100">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300">
                  {value.icon}
                </div>
                <h3 className="text-xl font-bold text-secondary-800 mb-3">{value.title}</h3>
                <p className="text-secondary-600 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-secondary-800 mb-4">Meet Our Team</h2>
            <p className="text-xl text-secondary-600 max-w-3xl mx-auto">
              The passionate people behind Dreamy Eyes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Chen",
                role: "Founder & CEO",
                bio: "With over 15 years of experience in the eyewear industry, Sarah leads our company with passion and vision.",
              },
              {
                name: "Dr. Michael Rodriguez",
                role: "Chief Medical Officer",
                bio: "As an optometrist with a specialization in corneal health, Dr. Rodriguez ensures all our products meet the highest safety standards.",
              },
              {
                name: "Jessica Kim",
                role: "Head of Design",
                bio: "Jessica combines her background in fashion design with a deep understanding of color theory to create our stunning lens collections.",
              },
            ].map((member, index) => (
              <div key={index} className="bg-white rounded-3xl p-8 shadow-soft hover:shadow-xl transition-all duration-300 border border-secondary-100">
                <div className="w-24 h-24 bg-gradient-to-br from-secondary-100 to-secondary-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <span className="text-2xl font-bold text-secondary-500">{member.name.split(' ').map(n => n[0]).join('')}</span>
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-secondary-800 mb-1">{member.name}</h3>
                  <p className="text-primary-600 font-medium mb-4">{member.role}</p>
                  <p className="text-secondary-600">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary-500 to-secondary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Transform Your Look?</h2>
          <p className="text-xl text-primary-100 mb-8 max-w-3xl mx-auto">
            Browse our collection of premium contact lenses and find your perfect match
          </p>
          <a
            href="/shop"
            className="inline-flex items-center justify-center px-6 py-3 bg-white text-primary-600 font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-glow hover:shadow-glow-lg"
          >
            Shop Now
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
