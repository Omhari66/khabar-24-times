import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "Read the Terms and Conditions governing your use of Khabar 24 Times, India's trusted digital news platform.",
};

const LAST_UPDATED = "July 14, 2025";

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="border-t-4 border-primary pt-6 mb-10">
        <h1 className="text-4xl font-serif font-bold text-text-primary mb-2">
          Terms &amp; Conditions
        </h1>
        <p className="text-text-secondary font-sans text-sm">
          Last updated: {LAST_UPDATED}
        </p>
      </div>

      <div className="prose prose-lg prose-headings:font-serif prose-headings:font-bold prose-p:font-sans prose-p:text-text-primary max-w-none space-y-8">
        <p>
          These Terms and Conditions (&quot;Terms&quot;) govern your access to and use 
          of the website <strong>https://khabar24times.in</strong> operated by{" "}
          <strong>Khabar 24 Times</strong>. By accessing or using the Site, you agree 
          to be bound by these Terms.
        </p>

        <section>
          <h2>1. Use of the Site</h2>
          <p>You may use this Site for lawful purposes only. You agree not to:</p>
          <ul>
            <li>Copy, reproduce, or redistribute our content without written permission.</li>
            <li>Use automated tools (scrapers, bots) to extract content from the Site.</li>
            <li>Post defamatory, abusive, hateful, or illegal content in comments.</li>
            <li>Attempt to gain unauthorized access to any part of the Site.</li>
            <li>Impersonate any person, journalist, or entity.</li>
          </ul>
        </section>

        <section>
          <h2>2. Intellectual Property</h2>
          <p>
            All content published on Khabar 24 Times — including articles, images, videos, 
            graphics, and code — is the property of Khabar 24 Times or its content partners 
            and is protected by Indian and international copyright laws.
          </p>
          <p>
            You may share articles by linking to them. You may quote up to 50 words from an 
            article with proper attribution. You may not reproduce full articles without 
            written permission from our editorial team.
          </p>
        </section>

        <section>
          <h2>3. User Accounts</h2>
          <p>
            If you create an account on the Site, you are responsible for maintaining the 
            confidentiality of your credentials. You must notify us immediately at{" "}
            <a href="mailto:editor@khabar24times.in" className="text-primary hover:underline">
              editor@khabar24times.in
            </a>{" "}
            if you suspect unauthorized use of your account.
          </p>
        </section>

        <section>
          <h2>4. Comments Policy</h2>
          <p>
            We welcome thoughtful discussion in our comments section. We reserve the right to 
            remove any comment that:
          </p>
          <ul>
            <li>Contains hate speech, threats, or incitement to violence.</li>
            <li>Is spam or promotional in nature.</li>
            <li>Contains personal attacks against individuals.</li>
            <li>Violates any applicable Indian laws, including the IT Act 2000.</li>
          </ul>
        </section>

        <section>
          <h2>5. Disclaimers</h2>
          <p>
            The information on Khabar 24 Times is provided for general informational purposes 
            only. While we strive for accuracy, we make no warranties of any kind, express or 
            implied, about the completeness, accuracy, or reliability of any information on 
            the Site.
          </p>
          <p>
            News reporting involves time-sensitive information. Details may change after 
            publication. We recommend verifying critical information from official sources.
          </p>
        </section>

        <section>
          <h2>6. Third-Party Links</h2>
          <p>
            The Site may contain links to third-party websites. These links are provided for 
            your convenience. We have no control over the content of those sites and accept no 
            responsibility for them.
          </p>
        </section>

        <section>
          <h2>7. Limitation of Liability</h2>
          <p>
            To the fullest extent permitted by law, Khabar 24 Times shall not be liable for 
            any indirect, incidental, or consequential damages arising from your use of 
            the Site or reliance on any content published herein.
          </p>
        </section>

        <section>
          <h2>8. Governing Law</h2>
          <p>
            These Terms are governed by the laws of India. Any disputes arising from these 
            Terms shall be subject to the exclusive jurisdiction of courts in New Delhi, India.
          </p>
        </section>

        <section>
          <h2>9. Changes to Terms</h2>
          <p>
            We reserve the right to modify these Terms at any time. Your continued use of the 
            Site after changes are posted constitutes your acceptance of the new Terms.
          </p>
        </section>

        <section>
          <h2>10. Contact</h2>
          <p>
            For any queries regarding these Terms, please contact:{" "}
            <a href="mailto:editor@khabar24times.in" className="text-primary hover:underline">
              editor@khabar24times.in
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
