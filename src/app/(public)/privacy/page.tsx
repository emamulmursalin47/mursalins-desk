import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/container";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Learn how Mursalin's Desk collects, uses, and protects your personal information.",
};

export default function PrivacyPolicyPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative pt-32 pb-12">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Privacy Policy
            </h1>
            <p className="mt-4 text-muted-foreground">
              Last updated: February 17, 2026
            </p>
          </div>
        </Container>
      </section>

      {/* Content */}
      <section className="pb-24">
        <Container>
          <div className="blog-prose legal-prose mx-auto max-w-3xl">
            <p>
              At Mursalin&apos;s Desk (&quot;we,&quot; &quot;us,&quot; or
              &quot;our&quot;), we are committed to protecting your privacy.
              This Privacy Policy explains how we collect, use, disclose, and
              safeguard your information when you visit our website at{" "}
              <a href="https://mursalinsdesk.com">mursalinsdesk.com</a>,
              including any related services, sales, marketing, or events. By
              using our website, you consent to the practices described in this
              policy.
            </p>

            <hr />

            <h2>1. Information We Collect</h2>
            <h3>Personal Information You Provide</h3>
            <p>
              We may collect personal information that you voluntarily provide
              when you register on our website, place an order, book an
              appointment, subscribe to our newsletter, submit a contact form, or
              otherwise interact with our services. This information may include:
            </p>
            <ul>
              <li>Full name</li>
              <li>Email address</li>
              <li>Phone number</li>
              <li>Billing and shipping address</li>
              <li>Payment information (processed securely through third-party providers)</li>
              <li>Project details and requirements shared through forms or messages</li>
              <li>Any other information you choose to provide</li>
            </ul>

            <h3>Information Collected Automatically</h3>
            <p>
              When you access our website, certain information is collected
              automatically, including:
            </p>
            <ul>
              <li>IP address and approximate geographic location</li>
              <li>Browser type, version, and language preferences</li>
              <li>Operating system and device information</li>
              <li>Pages visited, time spent on pages, and navigation paths</li>
              <li>Referring website or source</li>
              <li>Date and time of each visit</li>
            </ul>

            <h2>2. How We Use Your Information</h2>
            <p>
              We use the information we collect for the following purposes:
            </p>
            <ul>
              <li>To provide, operate, and maintain our website and services</li>
              <li>To process transactions and send related confirmations and invoices</li>
              <li>To manage your account and provide customer support</li>
              <li>To schedule and manage appointments and consultations</li>
              <li>To send you marketing communications, newsletters, and updates (with your consent)</li>
              <li>To personalize your experience and deliver content relevant to your interests</li>
              <li>To analyze usage trends and improve our website, services, and user experience</li>
              <li>To detect, prevent, and address technical issues, fraud, or security breaches</li>
              <li>To comply with legal obligations and enforce our terms</li>
            </ul>

            <h2>3. Cookies and Tracking Technologies</h2>
            <p>
              We use cookies and similar tracking technologies to enhance your
              browsing experience, analyze site traffic, and understand where our
              visitors come from. Cookies are small data files stored on your
              device that help us remember your preferences and improve our
              services.
            </p>
            <h3>Types of Cookies We Use</h3>
            <ul>
              <li>
                <strong>Essential Cookies:</strong> Required for the website to
                function properly, including authentication, session management,
                and security.
              </li>
              <li>
                <strong>Analytics Cookies:</strong> Help us understand how
                visitors interact with our website by collecting anonymous usage
                data.
              </li>
              <li>
                <strong>Preference Cookies:</strong> Remember your settings and
                preferences for a better experience on return visits.
              </li>
            </ul>
            <p>
              You can control and manage cookies through your browser settings.
              Please note that disabling certain cookies may affect the
              functionality of our website.
            </p>

            <h2>4. Third-Party Services</h2>
            <p>
              We may employ third-party companies and services to facilitate our
              operations. These third parties have access to your personal
              information only to perform specific tasks on our behalf and are
              obligated not to disclose or use it for any other purpose. These
              services may include:
            </p>
            <ul>
              <li>Payment processors (e.g., Stripe, PayPal) for secure transaction handling</li>
              <li>Email service providers for newsletters and transactional emails</li>
              <li>Analytics platforms (e.g., Google Analytics) for website performance monitoring</li>
              <li>Cloud hosting and infrastructure providers</li>
              <li>Customer support and communication tools</li>
            </ul>

            <h2>5. Data Security</h2>
            <p>
              We implement appropriate technical and organizational security
              measures to protect your personal information against unauthorized
              access, alteration, disclosure, or destruction. These measures
              include encrypted data transmission (SSL/TLS), secure server
              infrastructure, access controls, and regular security assessments.
              However, no method of transmission over the Internet or electronic
              storage is completely secure, and we cannot guarantee absolute
              security.
            </p>

            <h2>6. Data Retention</h2>
            <p>
              We retain your personal information only for as long as necessary
              to fulfill the purposes outlined in this Privacy Policy, unless a
              longer retention period is required or permitted by law. When your
              data is no longer needed, we will securely delete or anonymize it.
            </p>

            <h2>7. Your Rights</h2>
            <p>
              Depending on your jurisdiction, you may have the following rights
              regarding your personal information:
            </p>
            <ul>
              <li>
                <strong>Access:</strong> Request a copy of the personal data we
                hold about you.
              </li>
              <li>
                <strong>Correction:</strong> Request correction of any inaccurate
                or incomplete personal data.
              </li>
              <li>
                <strong>Deletion:</strong> Request deletion of your personal data,
                subject to certain legal exceptions.
              </li>
              <li>
                <strong>Objection:</strong> Object to the processing of your
                personal data for certain purposes.
              </li>
              <li>
                <strong>Portability:</strong> Request transfer of your personal
                data to another service provider in a structured, commonly used
                format.
              </li>
              <li>
                <strong>Withdrawal of Consent:</strong> Withdraw your consent at
                any time where we rely on consent to process your data.
              </li>
            </ul>
            <p>
              To exercise any of these rights, please contact us using the
              information provided below. We will respond to your request within
              a reasonable timeframe, and no later than as required by applicable
              law.
            </p>

            <h2>8. Children&apos;s Privacy</h2>
            <p>
              Our website and services are not directed to individuals under the
              age of 16. We do not knowingly collect personal information from
              children. If we become aware that we have inadvertently collected
              personal data from a child under 16, we will take steps to delete
              such information promptly. If you believe a child has provided us
              with personal information, please contact us immediately.
            </p>

            <h2>9. International Data Transfers</h2>
            <p>
              Your information may be transferred to and processed in countries
              other than your country of residence. These countries may have data
              protection laws that differ from those of your jurisdiction. By
              using our services, you consent to the transfer of your
              information to such countries. We take appropriate safeguards to
              ensure that your personal data remains protected in accordance with
              this Privacy Policy.
            </p>

            <h2>10. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time to reflect
              changes in our practices, technologies, legal requirements, or
              other factors. When we make material changes, we will update the
              &quot;Last updated&quot; date at the top of this page and, where
              appropriate, notify you via email or a prominent notice on our
              website. We encourage you to review this Privacy Policy
              periodically to stay informed about how we are protecting your
              information.
            </p>

            <h2>11. Contact Us</h2>
            <p>
              If you have any questions, concerns, or requests regarding this
              Privacy Policy or our data practices, please contact us at:
            </p>
            <ul>
              <li>
                <strong>Email:</strong>{" "}
                <a href="mailto:hello@mursalinsdesk.com">
                  hello@mursalinsdesk.com
                </a>
              </li>
              <li>
                <strong>Website:</strong>{" "}
                <a href="https://mursalinsdesk.com/contact">
                  mursalinsdesk.com/contact
                </a>
              </li>
            </ul>

            <hr />

            <p>
              See also our{" "}
              <Link href="/terms">Terms of Service</Link>.
            </p>
          </div>
        </Container>
      </section>
    </div>
  );
}
