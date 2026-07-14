import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about Khabar 24 Times — India's trusted digital news platform committed to accurate, fast, and unbiased journalism.",
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="border-t-4 border-primary pt-6 mb-10">
        <h1 className="text-4xl font-serif font-bold text-text-primary mb-2">
          About Us
        </h1>
        <p className="text-text-secondary font-sans text-sm uppercase tracking-widest">
          Who we are &amp; what we stand for
        </p>
      </div>

      <div className="prose prose-lg prose-headings:font-serif prose-headings:font-bold prose-p:font-sans prose-p:text-text-primary max-w-none space-y-8">
        <section>
          <h2>Our Mission</h2>
          <p>
            <strong>Khabar 24 Times</strong> is an independent Indian digital
            news platform committed to delivering accurate, timely, and
            unbiased news to readers across India. We believe that a well-informed
            public is the foundation of a healthy democracy. Our goal is to
            cut through the noise and give you news that matters — local,
            national, and international — with context, clarity, and credibility.
          </p>
        </section>

        <section>
          <h2>Who We Are</h2>
          <p>
            Founded in 2024, Khabar 24 Times was built by a team of passionate
            journalists and developers who believed that quality news reporting
            should be accessible to everyone. We cover a wide range of topics
            including Politics, Sports, Technology, Business, Health, Entertainment,
            and regional news from Uttar Pradesh, Bihar, Madhya Pradesh, and beyond.
          </p>
          <p>
            Our editorial team brings together reporters, editors, and analysts
            from across India who share a single commitment: truth first, speed
            second, opinion third.
          </p>
        </section>

        <section>
          <h2>Our Editorial Standards</h2>
          <p>
            Every article published on Khabar 24 Times undergoes editorial
            review before publication. We do not publish unverified rumors,
            misinformation, or paid-for opinions disguised as news. When we
            make a mistake, we correct it promptly and transparently.
          </p>
          <ul>
            <li>We verify facts from at least two independent sources before reporting.</li>
            <li>We clearly label opinion pieces and sponsored content.</li>
            <li>We do not accept payment in exchange for editorial coverage.</li>
            <li>We correct factual errors within 24 hours of discovery.</li>
          </ul>
        </section>

        <section>
          <h2>Contact Us</h2>
          <p>
            For editorial queries, news tips, or feedback, please visit our{" "}
            <a href="/contact" className="text-primary hover:underline">
              Contact page
            </a>
            . For advertising and partnership inquiries, email us at{" "}
            <a
              href="mailto:editor@khabar24times.in"
              className="text-primary hover:underline"
            >
              editor@khabar24times.in
            </a>
            .
          </p>
        </section>

        <section>
          <h2>Our Headquarters</h2>
          <p>
            Khabar 24 Times is operated from New Delhi, India.
            <br />
            Email:{" "}
            <a
              href="mailto:editor@khabar24times.in"
              className="text-primary hover:underline"
            >
              editor@khabar24times.in
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
