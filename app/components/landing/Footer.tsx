"use client";

import React from "react";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="bg-[#0A0A0A] pt-16 md:pt-32 pb-12 relative overflow-hidden border-t border-white/5">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-500/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary-600/5 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2" />

      {/* Massive Background Logo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full pointer-events-none select-none opacity-[0.015]">
        <h2 className="text-[35vw] font-black tracking-tighter leading-none text-center text-white whitespace-nowrap">
          DREAMY
        </h2>
      </div>

      <div className="max-w-[1700px] mx-auto px-4 md:px-12 relative z-10">

        {/* Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 md:gap-24 mb-12 md:mb-24 py-12 md:py-24 border-y border-white/5">
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-10 text-center lg:text-left">
            <div>
              <Link href="/" className="inline-flex items-center gap-4 group">
                <div className="w-14 h-14 bg-primary-500 rounded-2xl flex items-center justify-center -rotate-3 group-hover:rotate-6 transition-all duration-700 shadow-[0_0_30px_rgba(235,50,90,0.4)]">
                  <span className="text-white font-black text-xl">DE</span>
                </div>
                <h3 className="text-3xl font-black text-white tracking-widest uppercase">
                  Dreamy <span className="text-primary-500">Eyes</span>
                </h3>
              </Link>
              <p className="text-xl text-secondary-400 font-medium leading-relaxed max-w-sm mt-8 mx-auto lg:mx-0">
                Precision ocular aesthetics. We don't just sell lenses; we curate perspectives.
              </p>
            </div>

            <div className="flex justify-center lg:justify-start gap-4">
              {['Instagram', 'Facebook', 'TikTok'].map((item) => (
                <a
                  key={item}
                  href="#"
                  className="px-4 h-12 rounded-full border border-white/10 flex items-center justify-center text-[10px] font-black text-white hover:bg-white hover:text-black transition-all duration-500 uppercase tracking-widest"
                >
                  {item}
                </a>
              ))}
            </div>
          </div>

          {/* Navigation Matrix */}
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-16">
            <div className="flex flex-col items-center md:items-start">
              <span className="text-[10px] font-black tracking-[0.4em] text-primary-500 uppercase block mb-6 md:mb-10">Navigation</span>
              <ul className="flex flex-col items-center md:items-start gap-y-4 md:gap-y-6">
                {[
                  { label: 'Collection', href: '/' },
                  { label: 'Eye Lashes', href: '/#eyelashes-section' },
                  { label: 'Pure Care', href: '/#accessories-section' },
                  { label: 'The Kit', href: '/#accessories-section' }
                ].map((item) => (
                  <li key={item.label}>
                    <Link href={item.href} className="text-2xl md:text-base text-secondary-300 hover:text-white transition-all duration-500 font-medium tracking-tight">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t md:border-t-0 md:border-l border-white/5 pt-10 md:pt-0 md:pl-12 flex flex-col items-center md:items-start">
              <span className="text-[10px] font-black tracking-[0.4em] text-primary-500 uppercase block mb-6 md:mb-10">Connect</span>
              <div className="space-y-6 md:space-y-8 flex flex-col items-center md:items-start">
                <div className="flex flex-col items-center md:items-start">
                  <p className="text-[8px] font-black text-secondary-500 uppercase tracking-widest mb-1 md:mb-3">Direct Inquiry</p>
                  <a href="mailto:dreamyeyesinfo@gmail.com" className="text-xl font-bold text-white hover:text-primary-500 transition-all duration-500 border-b border-primary-500/30 hover:border-primary-500 pb-1">
                    dreamyeyesinfo@gmail.com
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Meta */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 md:gap-10">
          <div className="flex gap-6 md:gap-10">
            {['Privacy', 'Legal', 'Terms'].map((item) => (
              <Link key={item} href="#" className="text-[9px] font-black tracking-[0.3em] text-secondary-600 hover:text-white transition-colors uppercase">
                {item}
              </Link>
            ))}
          </div>

          <div className="text-center md:text-right">
            <p className="text-[9px] font-black tracking-[0.3em] text-secondary-700 uppercase leading-relaxed">
              &copy; {new Date().getFullYear()} DREAMY EYES COUTURE. ALL RIGHTS RESERVED.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
