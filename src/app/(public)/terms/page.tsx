import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/container";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Read the terms and conditions that govern your use of Mursalin's Desk website and services.",
};

export default function TermsOfServicePage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative pt-32 pb-12">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Terms of Service
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
              Welcome to Mursalin&apos;s Desk. These Terms of Service
              (&quot;Terms&quot;) govern your access to and use of our website at{" "}
              <a href="https://mursalinsdesk.com">mursalinsdesk.com</a>{" "}
              and all related services, products, and content provided by
              Mursalin&apos;s Desk (&quot;we,&quot; &quot;us,&quot; or
              &quot;our&quot;). By accessing or using our website, you agree to
              be bound by these Terms. If you do not agree to these Terms,
              please do not use our services.
            </p>

            <hr />

            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing, browsing, or using our website and services, you
              acknowledge that you have read, understood, and agree to be bound
              by these Terms, along with our{" "}
              <Link href="/privacy">Privacy Policy</Link>, which is
              incorporated herein by reference. We reserve the right to modify
              these Terms at any time. Your continued use of the website after
              any changes constitutes your acceptance of the revised Terms. It is
              your responsibility to review these Terms periodically for updates.
            </p>

            <h2>2. Services Provided</h2>
            <p>
              Mursalin&apos;s Desk offers the following services through our
              website:
            </p>
            <ul>
              <li>
                <strong>Web Development:</strong> Custom website and web
                application development, including full-stack solutions, SaaS
                platforms, and e-commerce systems.
              </li>
              <li>
                <strong>Digital Products:</strong> Sale of digital products,
                templates, themes, and tools through our online store.
              </li>
              <li>
                <strong>Consulting:</strong> Technical consulting, code reviews,
                and advisory services.
              </li>
              <li>
                <strong>UI/UX Design:</strong> User interface and user experience
                design services for web and mobile applications.
              </li>
              <li>
                <strong>Appointments:</strong> Free and paid consultation booking
                through our scheduling system.
              </li>
            </ul>
            <p>
              The availability, scope, and pricing of services may change at any
              time without prior notice. We reserve the right to modify,
              suspend, or discontinue any service at our sole discretion.
            </p>

            <h2>3. User Accounts</h2>
            <p>
              Certain features of our website may require you to create an
              account. When creating an account, you agree to:
            </p>
            <ul>
              <li>Provide accurate, current, and complete information during registration</li>
              <li>Maintain and promptly update your account information to keep it accurate</li>
              <li>Maintain the security and confidentiality of your login credentials</li>
              <li>Accept responsibility for all activities that occur under your account</li>
              <li>Notify us immediately of any unauthorized use of your account</li>
            </ul>
            <p>
              We reserve the right to suspend or terminate your account at any
              time if we reasonably believe that you have violated these Terms or
              engaged in any fraudulent, abusive, or harmful activity.
            </p>

            <h2>4. Intellectual Property</h2>
            <p>
              All content on this website, including but not limited to text,
              graphics, logos, icons, images, audio clips, video clips, data
              compilations, software, and the overall design and arrangement of
              the website, is the exclusive property of Mursalin&apos;s Desk or
              its content suppliers and is protected by international copyright,
              trademark, and other intellectual property laws.
            </p>
            <h3>Your Use of Our Content</h3>
            <p>
              You may view, download, and print content from our website for
              your personal, non-commercial use only, provided that you do not
              modify the content and that you retain all copyright and
              proprietary notices. Any other use, including reproduction,
              modification, distribution, transmission, republication, display,
              or performance of the content without our prior written consent is
              strictly prohibited.
            </p>
            <h3>Client Work and Deliverables</h3>
            <p>
              For custom development and design projects, intellectual property
              rights to the final deliverables will be transferred to the client
              upon full payment, unless otherwise specified in a separate written
              agreement. We retain the right to showcase completed projects in
              our portfolio unless the client requests otherwise in writing.
            </p>

            <h2>5. Digital Products and Purchases</h2>
            <p>
              When purchasing digital products through our store, the following
              terms apply:
            </p>
            <ul>
              <li>
                All prices are displayed in the currency specified at the time of
                purchase and are subject to change without notice.
              </li>
              <li>
                Payment is required at the time of purchase and is processed
                through our secure third-party payment providers.
              </li>
              <li>
                Upon successful payment, you will receive a license to use the
                digital product as specified in the product description.
              </li>
              <li>
                Digital products are delivered electronically and are
                non-refundable once delivered, except where required by
                applicable law or as outlined in our refund policy.
              </li>
              <li>
                You may not redistribute, resell, or sublicense digital products
                unless explicitly permitted in the product license.
              </li>
            </ul>

            <h2>6. Payment and Refunds</h2>
            <h3>Payment Terms</h3>
            <p>
              For custom services, payment terms will be agreed upon before the
              commencement of work. Typical arrangements include an upfront
              deposit followed by milestone-based payments. All invoices are due
              within the timeframe specified in the project agreement.
            </p>
            <h3>Refund Policy</h3>
            <p>
              Refunds for custom services are handled on a case-by-case basis.
              If you are dissatisfied with our services, please contact us
              within 14 days of delivery to discuss a resolution. Refunds for
              digital products are generally not available due to the nature of
              digital goods, except where required by applicable consumer
              protection laws. We are committed to resolving any issues to your
              satisfaction.
            </p>

            <h2>7. User Conduct</h2>
            <p>
              When using our website and services, you agree not to:
            </p>
            <ul>
              <li>Use the website for any unlawful purpose or in violation of any applicable laws</li>
              <li>Attempt to gain unauthorized access to any portion of the website or its systems</li>
              <li>Interfere with or disrupt the website&apos;s servers, networks, or infrastructure</li>
              <li>Upload or transmit viruses, malware, or any other harmful code</li>
              <li>Harvest, collect, or scrape user data without authorization</li>
              <li>Impersonate any person or entity or misrepresent your affiliation</li>
              <li>Use automated tools, bots, or scripts to access the website without our consent</li>
              <li>Engage in any conduct that restricts or inhibits others from using the website</li>
            </ul>

            <h2>8. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by applicable law, Mursalin&apos;s
              Desk and its owner, employees, affiliates, and partners shall not
              be liable for any indirect, incidental, special, consequential, or
              punitive damages, including but not limited to loss of profits,
              data, use, goodwill, or other intangible losses, arising out of or
              in connection with:
            </p>
            <ul>
              <li>Your access to or use of (or inability to access or use) our website or services</li>
              <li>Any conduct or content of any third party on the website</li>
              <li>Any content obtained from the website</li>
              <li>Unauthorized access, use, or alteration of your transmissions or content</li>
            </ul>
            <p>
              In no event shall our total aggregate liability exceed the amount
              you have paid to us in the twelve (12) months preceding the event
              giving rise to the claim, or one hundred US dollars ($100),
              whichever is greater.
            </p>

            <h2>9. Disclaimer of Warranties</h2>
            <p>
              Our website and services are provided on an &quot;as is&quot; and
              &quot;as available&quot; basis without any warranties of any kind,
              whether express, implied, or statutory. We disclaim all warranties,
              including but not limited to implied warranties of
              merchantability, fitness for a particular purpose,
              non-infringement, and accuracy. We do not warrant that the website
              will be uninterrupted, error-free, secure, or free from viruses or
              other harmful components.
            </p>

            <h2>10. Indemnification</h2>
            <p>
              You agree to indemnify, defend, and hold harmless Mursalin&apos;s
              Desk, its owner, employees, affiliates, and partners from and
              against any and all claims, liabilities, damages, losses, costs,
              and expenses (including reasonable attorneys&apos; fees) arising
              out of or in connection with your use of our website, your
              violation of these Terms, or your violation of any rights of
              another party.
            </p>

            <h2>11. Third-Party Links</h2>
            <p>
              Our website may contain links to third-party websites, services,
              or resources that are not owned or controlled by us. We have no
              control over and assume no responsibility for the content, privacy
              policies, or practices of any third-party websites. You
              acknowledge and agree that we shall not be liable for any damage or
              loss caused by or in connection with the use of any third-party
              content, goods, or services.
            </p>

            <h2>12. Termination</h2>
            <p>
              We may terminate or suspend your access to our website and
              services immediately, without prior notice or liability, for any
              reason, including but not limited to a breach of these Terms. Upon
              termination, your right to use the website will cease immediately.
              All provisions of these Terms that by their nature should survive
              termination shall survive, including ownership provisions, warranty
              disclaimers, indemnification, and limitations of liability.
            </p>

            <h2>13. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with
              the laws of Bangladesh, without regard to its conflict of law
              provisions. Any disputes arising under or in connection with these
              Terms shall be subject to the exclusive jurisdiction of the courts
              located in Dhaka, Bangladesh. You irrevocably consent to the
              jurisdiction of such courts and waive any objection to the
              convenience of the forum.
            </p>

            <h2>14. Severability</h2>
            <p>
              If any provision of these Terms is found to be unenforceable or
              invalid by a court of competent jurisdiction, that provision shall
              be limited or eliminated to the minimum extent necessary so that
              the remaining provisions of these Terms shall remain in full force
              and effect.
            </p>

            <h2>15. Changes to These Terms</h2>
            <p>
              We reserve the right to modify or replace these Terms at any time
              at our sole discretion. When we make material changes, we will
              update the &quot;Last updated&quot; date at the top of this page.
              Your continued use of the website after any such changes
              constitutes your acceptance of the revised Terms. We encourage you
              to review these Terms periodically.
            </p>

            <h2>16. Contact Us</h2>
            <p>
              If you have any questions or concerns about these Terms of
              Service, please contact us at:
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
              <Link href="/privacy">Privacy Policy</Link>.
            </p>
          </div>
        </Container>
      </section>
    </div>
  );
}
