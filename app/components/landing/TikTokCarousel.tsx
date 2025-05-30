"use client";

import { TikTokEmbed } from "react-social-media-embed";

export default function TikTokCarousel() {
  return (
    <section
      id="best-selling-items"
      className="bg-white py-5"
      style={{ marginTop: 48 }}
    >
      <div className="container">
        {/* Section Header */}
        <div className="section-title text-center mb-5">
          <h2 className="fw-bold mb-3">Watch our TikToks</h2>
          <p className="text-muted">
            Follow us for the latest tips, trends, and behind-the-scenes
            content.
          </p>
          <a href="index.html" className="btn btn-dark px-4 mt-3">
            View All
          </a>
        </div>

        {/* TikTok Video Card */}
        <div className="d-flex justify-content-center">
          <div
            className="card shadow-lg border-0 rounded-4 p-2"
            style={{ maxWidth: 360 }}
          >
            <TikTokEmbed
              url="https://www.tiktok.com/@epicgardening/video/7055411162212633903"
              height={720}
              width={320}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
