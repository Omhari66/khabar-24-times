import type { Metadata } from "next";
import { Mail, MapPin, Phone, Clock } from "lucide-react";
import { ContactForm } from "../components/ContactForm";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with the Khabar 24 Times editorial team. Send us a news tip, feedback, or press inquiry.",
};

export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="border-t-4 border-primary pt-6 mb-10">
        <h1 className="text-4xl font-serif font-bold text-text-primary mb-2">
          Contact Us
        </h1>
        <p className="text-text-secondary font-sans text-sm uppercase tracking-widest">
          We&apos;d love to hear from you
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Contact Info */}
        <div className="space-y-8">
          <p className="text-text-secondary font-sans leading-relaxed">
            Whether you have a news tip, a correction request, a press inquiry,
            or just want to share your feedback — our team is here to listen.
          </p>

          <div className="space-y-5">
            <div className="flex items-start gap-4">
              <div className="mt-1 p-2 bg-primary/10 rounded-sm">
                <Mail size={18} className="text-primary" />
              </div>
              <div>
                <p className="font-condensed font-bold uppercase tracking-wider text-sm text-text-primary mb-1">
                  Editorial
                </p>
                <a
                  href="mailto:editor@khabar24times.in"
                  className="text-primary hover:underline font-sans text-sm"
                >
                  editor@khabar24times.in
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="mt-1 p-2 bg-primary/10 rounded-sm">
                <Phone size={18} className="text-primary" />
              </div>
              <div>
                <p className="font-condensed font-bold uppercase tracking-wider text-sm text-text-primary mb-1">
                  Phone
                </p>
                <p className="text-text-secondary font-sans text-sm">
                  +91 11 2345 6789
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="mt-1 p-2 bg-primary/10 rounded-sm">
                <MapPin size={18} className="text-primary" />
              </div>
              <div>
                <p className="font-condensed font-bold uppercase tracking-wider text-sm text-text-primary mb-1">
                  Office
                </p>
                <p className="text-text-secondary font-sans text-sm">
                  New Delhi, India
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="mt-1 p-2 bg-primary/10 rounded-sm">
                <Clock size={18} className="text-primary" />
              </div>
              <div>
                <p className="font-condensed font-bold uppercase tracking-wider text-sm text-text-primary mb-1">
                  Working Hours
                </p>
                <p className="text-text-secondary font-sans text-sm">
                  Monday – Saturday: 9:00 AM – 6:00 PM IST
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-surface-muted border border-structural p-6">
          <h2 className="font-condensed font-bold uppercase tracking-wider text-text-primary mb-6 text-lg border-b border-structural pb-3">
            Send a Message
          </h2>
          <ContactForm />
        </div>
      </div>
    </div>
  );
}

