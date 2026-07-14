import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Editorial Policy",
  description:
    "Understand the editorial standards and journalistic values that guide reporting at Khabar 24 Times.",
};

export default function EditorialPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="border-t-4 border-primary pt-6 mb-10">
        <h1 className="text-4xl font-serif font-bold text-text-primary mb-2">
          Editorial Policy
        </h1>
        <p className="text-text-secondary font-sans text-sm uppercase tracking-widest">
          Our commitment to journalism &amp; accuracy
        </p>
      </div>

      <div className="prose prose-lg prose-headings:font-serif prose-headings:font-bold prose-p:font-sans prose-p:text-text-primary max-w-none space-y-8">
        <p>
          Khabar 24 Times is committed to high-quality, independent journalism. 
          This Editorial Policy outlines the principles and processes that guide how we 
          gather, verify, write, and publish news.
        </p>

        <section>
          <h2>1. Independence</h2>
          <p>
            Our editorial decisions are made independently of our advertising and business 
            operations. No advertiser, sponsor, or third party has any influence over the 
            stories we cover or how we cover them.
          </p>
        </section>

        <section>
          <h2>2. Accuracy &amp; Verification</h2>
          <ul>
            <li>All facts in news articles must be verified from at least two independent, credible sources before publication.</li>
            <li>We clearly distinguish between verified facts, attributed claims, and editorial analysis.</li>
            <li>Opinion columns and analysis pieces are clearly labeled as such and do not reflect the editorial position of Khabar 24 Times.</li>
            <li>Wire reports and agency stories are credited to their original source.</li>
          </ul>
        </section>

        <section>
          <h2>3. Corrections &amp; Retractions</h2>
          <p>
            We take accuracy seriously. When we make a factual error, we correct it promptly 
            and transparently at the top of the affected article. We do not silently edit 
            published articles to hide errors.
          </p>
          <p>
            To report a factual error, please email us at{" "}
            <a href="mailto:editor@khabar24times.in" className="text-primary hover:underline">
              editor@khabar24times.in
            </a>{" "}
            with the article URL and the nature of the error.
          </p>
        </section>

        <section>
          <h2>4. Impartiality</h2>
          <p>
            We strive to present all sides of a story fairly. In political coverage, we do 
            not endorse any political party or candidate. We actively seek comment from all 
            parties named in a story before publication.
          </p>
        </section>

        <section>
          <h2>5. Conflicts of Interest</h2>
          <p>
            Our journalists and editors must disclose any potential conflicts of interest 
            before covering a story. Journalists should not report on companies, individuals, 
            or organizations in which they have a financial interest.
          </p>
        </section>

        <section>
          <h2>6. Sponsored Content</h2>
          <p>
            Any content that is paid for by an advertiser or third party is clearly labeled 
            as &quot;Sponsored&quot; or &quot;Advertisement.&quot; Sponsored content does not reflect the 
            editorial views of Khabar 24 Times.
          </p>
        </section>

        <section>
          <h2>7. Sensitive Reporting</h2>
          <p>We follow responsible guidelines when covering:</p>
          <ul>
            <li><strong>Suicide:</strong> We follow WHO guidelines and do not report methods.</li>
            <li><strong>Communal matters:</strong> We avoid language that could inflame religious or community tensions.</li>
            <li><strong>Children:</strong> We do not publish names or images of minors involved in crimes or abuse.</li>
            <li><strong>Victims of violence:</strong> We protect the identity of survivors where legally or ethically required.</li>
          </ul>
        </section>

        <section>
          <h2>8. Artificial Intelligence</h2>
          <p>
            We may use AI tools to assist with research, summarization, or translation. 
            However, all AI-assisted content is reviewed and edited by a human journalist 
            before publication. We do not publish AI-generated articles without editorial oversight.
          </p>
        </section>

        <section>
          <h2>9. Feedback</h2>
          <p>
            We welcome reader feedback on our coverage. Contact us at{" "}
            <a href="/contact" className="text-primary hover:underline">
              our Contact page
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
