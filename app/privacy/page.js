import LandingNavbar from '@/components/landing/LandingNavbar'
import LandingFooter from '@/components/landing/LandingFooter'

export const metadata = {
  title: 'Privacy Policy | Unfoldd',
  description: 'How Unfoldd Technologies Pvt. Ltd. handles and protects your data.',
}

export default function PrivacyPage() {
  return (
    <main className="bg-[#0A0A0F] min-h-screen text-white/80">
      <LandingNavbar />
      
      <div className="pt-32 pb-20 px-6 max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight" style={{ fontFamily: 'Space Grotesk' }}>Privacy Policy</h1>
        <p className="text-purple-400 font-bold uppercase tracking-widest text-sm mb-12">Last Updated: October 2025</p>

        <div className="prose prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Information We Collect</h2>
            <p className="leading-relaxed">
              Unfoldd Technologies Pvt. Ltd. (&quot;Unfoldd&quot;, &quot;we&quot;, &quot;us&quot;) collects information you provide directly to us when you create an account, build your portfolio, or interact with our learning modules. This includes:
            </p>
            <ul className="list-disc pl-5 mt-4 space-y-2 text-white/60">
              <li><strong>Profile Data:</strong> Name, email, college, graduation year, and target role.</li>
              <li><strong>Educational Data:</strong> Mission progress, video watch history, test scores, and code submissions.</li>
              <li><strong>Professional Data:</strong> Resumes, external links (GitHub, LinkedIn), and internship application history.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. How We Use Your Information</h2>
            <p className="leading-relaxed">We use the collected information to:</p>
            <ul className="list-disc pl-5 mt-4 space-y-2 text-white/60">
              <li>Provide, maintain, and personalize the 90-day AI roadmap.</li>
              <li>Verify your skills through proctored exams and issue official badges.</li>
              <li>Match your verified profile with internship opportunities from our partner companies.</li>
              <li>Send you mission reminders, streak alerts, and weekly progress reports.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. Information Sharing and Disclosure</h2>
            <p className="leading-relaxed">
              We do not sell your personal data. We only share your information in the following circumstances:
            </p>
            <ul className="list-disc pl-5 mt-4 space-y-2 text-white/60">
              <li><strong>With Partner Companies:</strong> When you set your portfolio to &quot;Public&quot; or apply for an internship, your profile, resume, and verified skills are shared with the respective company.</li>
              <li><strong>With Service Providers:</strong> We use third-party services like Supabase (database) and Firebase (notifications) which process data on our behalf under strict confidentiality agreements.</li>
              <li><strong>For Legal Reasons:</strong> If required by law, regulation, or legal process within the jurisdiction of India.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Data Security</h2>
            <p className="leading-relaxed">
              We implement robust security measures, including Row Level Security (RLS) on our databases and encryption in transit (HTTPS), to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Cookies and Tracking</h2>
            <p className="leading-relaxed">
              Unfoldd uses essential cookies to manage your active session and authentication state. We also use analytics cookies to understand how our platform is used and to improve the user experience. You can control cookie preferences through your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. Your Rights and Choices</h2>
            <p className="leading-relaxed">You have the right to:</p>
            <ul className="list-disc pl-5 mt-4 space-y-2 text-white/60">
              <li>Access and download your data via the Settings page.</li>
              <li>Update or correct your profile information at any time.</li>
              <li>Toggle your portfolio visibility to private to stop companies from discovering your profile.</li>
              <li>Delete your account permanently from the &quot;Danger Zone&quot; in Settings.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">7. Children&apos;s Privacy</h2>
            <p className="leading-relaxed">
              Our platform is intended for college students and young professionals. We do not knowingly collect personal information from children under the age of 13. If we become aware that we have collected such data, we will delete it immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">8. International Data Transfers</h2>
            <p className="leading-relaxed">
              While Unfoldd is based in India, our infrastructure providers may store data on servers located globally. By using our platform, you consent to the transfer and processing of your data across international borders under adequate protection standards.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">9. Changes to This Policy</h2>
            <p className="leading-relaxed">
              We may update this Privacy Policy from time to time. If we make significant changes, we will notify you through the platform or via email before the changes take effect.
            </p>
          </section>

          <section className="bg-[#12121A] p-8 rounded-3xl border border-white/10 mt-12">
            <h2 className="text-2xl font-bold text-white mb-4">10. Contact Us</h2>
            <p className="leading-relaxed text-white/60">
              If you have any questions or concerns regarding this Privacy Policy or our data practices, please contact our Data Protection Officer at:
            </p>
            <div className="mt-4 text-white">
              <strong>Unfoldd Technologies Pvt. Ltd.</strong><br />
              Email: <a href="mailto:privacy@unfoldd.me" className="text-purple-400 hover:underline">privacy@unfoldd.me</a><br />
              Bengaluru, Karnataka, India
            </div>
          </section>
        </div>
      </div>
      
      <LandingFooter />
    </main>
  )
}
