import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Read Khabar 24 Times' Privacy Policy to understand how we collect, use, and protect your personal information.",
};

const LAST_UPDATED = "July 14, 2025";

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="border-t-4 border-primary pt-6 mb-10">
        <h1 className="text-4xl font-serif font-bold text-text-primary mb-2">
          Privacy Policy
        </h1>
        <p className="text-text-secondary font-sans text-sm">
          Last updated: {LAST_UPDATED}
        </p>
      </div>

      <div className="prose prose-lg prose-headings:font-serif prose-headings:font-bold prose-p:font-sans prose-p:text-text-primary max-w-none space-y-8">
        <p>
          Welcome to <strong>Khabar 24 Times</strong> (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;). 
          This Privacy Policy explains how we collect, use, disclose, and safeguard your information 
          when you visit <strong>https://khabar24times.in</strong> (the &quot;Site&quot;). 
          Please read this policy carefully.
        </p>

        <section>
          <h2>1. Information We Collect</h2>
          <h3>Information You Provide</h3>
          <ul>
            <li><strong>Account Registration:</strong> When you sign up (via Google OAuth or email), we collect your name, email address, and profile picture.</li>
            <li><strong>Comments:</strong> Any text you submit in article comment sections.</li>
            <li><strong>Contact Forms:</strong> Name, email, and message content when you contact us.</li>
          </ul>
          <h3>Information Collected Automatically</h3>
          <ul>
            <li><strong>Log Data:</strong> IP address, browser type, pages visited, and timestamps.</li>
            <li><strong>Cookies:</strong> Session cookies for authentication and preference cookies.</li>
            <li><strong>Analytics:</strong> We use Google Analytics 4 to understand how visitors use the Site. This includes page views, session duration, and device information. Google Analytics may set its own cookies.</li>
          </ul>
        </section>

        <section>
          <h2>2. How We Use Your Information</h2>
          <ul>
            <li>To provide, maintain, and improve the Site.</li>
            <li>To authenticate your account and manage sessions.</li>
            <li>To display your comments on articles.</li>
            <li>To respond to your contact inquiries.</li>
            <li>To analyze Site traffic and understand audience behavior.</li>
            <li>To display advertisements (including Google AdSense, if applicable).</li>
          </ul>
        </section>

        <section>
          <h2>3. Cookies</h2>
          <p>
            We use cookies to manage your login session and to understand how the Site is used. 
            You can disable cookies in your browser settings, but this may affect your ability to 
            log in or use certain features of the Site.
          </p>
          <p>
            <strong>Google AdSense</strong> and <strong>Google Analytics</strong> may set additional 
            cookies for advertising and analytics purposes. These are governed by Google&apos;s own 
            Privacy Policy: <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">https://policies.google.com/privacy</a>.
          </p>
        </section>

        <section>
          <h2>4. Third-Party Services</h2>
          <p>We use the following third-party services that may collect data independently:</p>
          <ul>
            <li><strong>Google Analytics 4</strong> — Traffic and behavior analytics.</li>
            <li><strong>Cloudinary</strong> — Image storage and delivery.</li>
            <li><strong>Google OAuth</strong> — Authentication (if you sign in with Google).</li>
            <li><strong>Neon (PostgreSQL)</strong> — Secure database hosting for user and article data.</li>
          </ul>
        </section>

        <section>
          <h2>5. Data Sharing</h2>
          <p>
            We do not sell, trade, or rent your personal information to third parties. 
            We may share data with service providers listed above only to operate the Site. 
            We may also disclose information if required by law or to protect the rights and 
            safety of our users.
          </p>
        </section>

        <section>
          <h2>6. Data Retention</h2>
          <p>
            We retain your account data for as long as your account is active. 
            You may request deletion of your account at any time by contacting us at{" "}
            <a href="mailto:editor@khabar24times.in" className="text-primary hover:underline">
              editor@khabar24times.in
            </a>.
          </p>
        </section>

        <section>
          <h2>7. Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access the personal data we hold about you.</li>
            <li>Request correction of inaccurate data.</li>
            <li>Request deletion of your data.</li>
            <li>Opt out of analytics tracking by using browser extensions like uBlock Origin or Google&apos;s Opt-out Add-on.</li>
          </ul>
        </section>

        <section>
          <h2>8. Children&apos;s Privacy</h2>
          <p>
            The Site is not intended for children under the age of 13. We do not knowingly 
            collect personal information from children. If you believe a child has provided 
            us with personal data, please contact us immediately.
          </p>
        </section>

        <section>
          <h2>9. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. The &quot;Last updated&quot; date 
            at the top of this page will reflect any changes. Continued use of the Site after 
            changes constitutes your acceptance of the updated policy.
          </p>
        </section>

        <section>
          <h2>10. Contact</h2>
          <p>
            For privacy-related questions, please contact:{" "}
            <a href="mailto:editor@khabar24times.in" className="text-primary hover:underline">
              editor@khabar24times.in
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
