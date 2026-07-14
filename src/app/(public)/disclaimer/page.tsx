import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Disclaimer",
  description:
    "Read the official Disclaimer for Khabar 24 Times regarding accuracy of information, external links, and content ownership.",
};

export default function DisclaimerPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="border-t-4 border-primary pt-6 mb-10">
        <h1 className="text-4xl font-serif font-bold text-text-primary mb-2">
          Disclaimer
        </h1>
        <p className="text-text-secondary font-sans text-sm uppercase tracking-widest">
          Important notices about our content
        </p>
      </div>

      <div className="prose prose-lg prose-headings:font-serif prose-headings:font-bold prose-p:font-sans prose-p:text-text-primary max-w-none space-y-8">
        <section>
          <h2>General Information</h2>
          <p>
            The information published on <strong>Khabar 24 Times</strong> 
            (<strong>https://khabar24times.in</strong>) is intended for general 
            informational and journalistic purposes only. While we make every effort 
            to ensure the accuracy and timeliness of our reporting, we make no 
            representations or warranties of any kind, express or implied, about 
            the completeness, accuracy, reliability, suitability, or availability 
            of any information, article, or content on the Site.
          </p>
        </section>

        <section>
          <h2>News Accuracy</h2>
          <p>
            News reporting is a time-sensitive endeavor. Situations evolve rapidly, 
            and some information published on Khabar 24 Times may become outdated 
            after initial publication. We encourage readers to verify time-critical 
            information from official government, law enforcement, or institutional 
            sources before making decisions based on news reports.
          </p>
        </section>

        <section>
          <h2>Views &amp; Opinions</h2>
          <p>
            Opinion columns, editorials, and commentary pieces published on this Site 
            represent the views of their respective authors and do not necessarily 
            reflect the official position of Khabar 24 Times or its management.
          </p>
        </section>

        <section>
          <h2>External Links</h2>
          <p>
            Khabar 24 Times may contain links to external websites. These links are 
            provided as a convenience to readers. We have no control over the content, 
            nature, or availability of those linked sites and accept no responsibility 
            for any loss or damage that may arise from your use of them.
          </p>
          <p>
            The inclusion of any link does not necessarily imply a recommendation or 
            endorsement of the views expressed within those sites.
          </p>
        </section>

        <section>
          <h2>Investment &amp; Financial Disclaimer</h2>
          <p>
            Content related to finance, markets, business, or investments on Khabar 24 Times 
            is for informational purposes only and should not be construed as financial or 
            investment advice. Always consult a licensed financial professional before making 
            any investment decision.
          </p>
        </section>

        <section>
          <h2>Health Content Disclaimer</h2>
          <p>
            Health-related articles published on Khabar 24 Times are for general awareness 
            purposes only and are not a substitute for professional medical advice, diagnosis, 
            or treatment. Always seek the advice of a qualified healthcare provider with any 
            questions you have regarding a medical condition.
          </p>
        </section>

        <section>
          <h2>Copyright Notice</h2>
          <p>
            All original content published on Khabar 24 Times is protected by copyright law. 
            Unauthorized reproduction, distribution, or modification of our content without 
            prior written consent is strictly prohibited.
          </p>
          <p>
            Images used in articles are either our own, sourced from licensed image providers, 
            or credited to their original owners. If you believe any content on our Site 
            infringes your copyright, please contact us at{" "}
            <a href="mailto:editor@khabar24times.in" className="text-primary hover:underline">
              editor@khabar24times.in
            </a>{" "}
            immediately.
          </p>
        </section>

        <section>
          <h2>Advertising</h2>
          <p>
            Khabar 24 Times may display third-party advertisements (including Google AdSense). 
            These ads are served automatically based on content and user behavior. We are not 
            responsible for the content of advertisements and do not endorse the products or 
            services advertised.
          </p>
        </section>

        <section>
          <h2>Contact</h2>
          <p>
            For concerns, corrections, or copyright queries:{" "}
            <a href="mailto:editor@khabar24times.in" className="text-primary hover:underline">
              editor@khabar24times.in
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
