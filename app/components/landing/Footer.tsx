"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

const Footer = () => {
  return (
    <footer className="bg-secondary-900 pt-32 pb-16 relative overflow-hidden">
      {/* Background Decorative Text */}
      <div className="absolute bottom-0 left-0 w-full pointer-events-none select-none opacity-[0.02]">
        <span className="text-[25vw] font-black tracking-tighter leading-none whitespace-nowrap text-white">DREAMY EYES</span>
      </div>

      <div className="max-w-[1700px] mx-auto px-4 md:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-24 mb-24 pb-24 border-b border-white/5">
          {/* Brand Vision */}
          <div className="lg:col-span-5 space-y-12">
            <div>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 bg-primary-500 rounded-2xl flex items-center justify-center rotate-3 shadow-glow">
                  <span className="text-white font-black text-2xl">DE</span>
                </div>
                <h2 className="text-4xl font-extrabold text-white tracking-tighter">
                  DREAMY <span className="text-primary-500 italic font-serif font-normal">EYES</span>
                </h2>
              </div>
              <p className="text-2xl text-secondary-300 leading-relaxed font-medium max-w-lg">
                Precision ocular aesthetics. We don't just sell lenses; we curate perspectives.
              </p>
            </div>

            <div className="flex gap-6">
              {['Instagram', 'Facebook', 'TikTok', 'Pinterest'].map((platform) => (
                <a
                  key={platform}
                  href="#"
                  className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-black text-[10px] tracking-[0.2em] uppercase hover:bg-primary-500 hover:border-primary-500 transition-all duration-500"
                >
                  {platform}
                </a>
              ))}
            </div>
          </div>

          {/* Navigation Matrix */}
          <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-16">
            <div>
              <span className="text-primary-500 font-black tracking-[0.3em] uppercase text-[10px] block mb-8">Navigation</span>
              <ul className="space-y-6">
                {['Collection', 'Eye Lashes', 'Pure Care', 'The Kit'].map((item) => (
                  <li key={item}>
                    <Link href="/" className="text-lg text-secondary-300 hover:text-white transition-colors font-medium hover:pl-2 duration-500 block">
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="col-span-1">
              <span className="text-primary-500 font-black tracking-[0.3em] uppercase text-[10px] block mb-8">Connect</span>
              <div className="space-y-8">
                <div>
                  <p className="text-xs font-black text-secondary-400 uppercase tracking-widest mb-2">Concierge</p>
                  <a href="tel:+1800DREAMY" className="text-2xl font-black text-white hover:text-primary-500 transition-colors font-price tracking-tight">
                    +1 800 DREAMY
                  </a>
                </div>
                <div>
                  <p className="text-xs font-black text-secondary-400 uppercase tracking-widest mb-2">Direct Inquiry</p>
                  <a href="mailto:art@dreamyeyes.com" className="text-xl font-bold text-white hover:text-primary-500 transition-colors border-b border-primary-500 pb-1">
                    art@dreamyeyes.com
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-wrap justify-center md:justify-start gap-8">
            <Link href="#" className="text-[10px] font-black tracking-[0.3em] text-secondary-400 hover:text-white transition-colors uppercase">Privacy Protocol</Link>
            <Link href="#" className="text-[10px] font-black tracking-[0.3em] text-secondary-400 hover:text-white transition-colors uppercase">Terms of Art</Link>
            <Link href="#" className="text-[10px] font-black tracking-[0.3em] text-secondary-400 hover:text-white transition-colors uppercase">Accessibility</Link>
          </div>

          <p className="text-[10px] font-black tracking-[0.3em] text-secondary-500 uppercase">
            &copy; {new Date().getFullYear()} DREAMY EYES COUTURE. ALL RIGHTS RESERVED.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
