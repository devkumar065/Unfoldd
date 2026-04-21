import LandingNavbar from '@/components/landing/LandingNavbar'
import LandingFooter from '@/components/landing/LandingFooter'

export const metadata = {
  title: 'Terms of Service | Unfoldd',
  description: 'Terms and conditions for using the Unfoldd platform.',
}

export default function TermsPage() {
  return (
    <main className="bg-[#0A0A0F] min-h-screen text-white/80">
      <LandingNavbar />
      
      <div className="pt-32 pb-20 px-6 max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight" style={{ fontFamily: 'Space Grotesk' }}>Terms of Service</h1>
        <p className="text-purple-400 font-bold uppercase tracking-widest text-sm mb-12">Effective Date: October 2025</p>

        <div className="prose prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
            <p className="leading-relaxed">
              By registering for and using Unfoldd (&quot;the Platform&quot;), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Platform. These terms comply with the Information Technology Act, 2000 and the Consumer Protection (E-Commerce) Rules, 2020 of India.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Description of Service</h2>
            <p className="leading-relaxed">
              Unfoldd is an AI-powered career acceleration platform that provides personalized learning roadmaps, daily missions, proctored skill verification, and internship matching services for college students, alongside hiring tools for registered companies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. User Accounts</h2>
            <ul className="list-disc pl-5 mt-4 space-y-2 text-white/60">
              <li>You must provide accurate and complete information during registration.</li>
              <li>You are responsible for maintaining the security of your account credentials.</li>
              <li>You must immediately notify us of any unauthorized use of your account.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Student Conduct</h2>
            <p className="leading-relaxed">As a student on Unfoldd, you agree NOT to:</p>
            <ul className="list-disc pl-5 mt-4 space-y-2 text-white/60">
              <li>Use scripts, bots, or automation tools to bypass anti-skip video features or inflate your XP and streak counts.</li>
              <li>Submit plagiarized code for project builds or daily challenges.</li>
              <li>Harass or spam companies during the application process.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Exam and Verification Rules</h2>
            <p className="leading-relaxed">
              Our skill badges represent genuine capability to partner companies. During proctored exams:
            </p>
            <ul className="list-disc pl-5 mt-4 space-y-2 text-white/60">
              <li>You consent to camera and microphone monitoring to ensure academic integrity.</li>
              <li>Navigating away from the exam window or using unauthorized resources will result in immediate failure.</li>
              <li>Violation of exam rules may result in a permanent ban from the platform and revocation of all previously earned badges.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. Company Accounts</h2>
            <p className="leading-relaxed">
              Companies utilizing Unfoldd for hiring agree to:
            </p>
            <ul className="list-disc pl-5 mt-4 space-y-2 text-white/60">
              <li>Post only legitimate, active internship or job opportunities.</li>
              <li>Respect student privacy and only contact students regarding relevant roles.</li>
              <li>Adhere to the usage limits dictated by their selected billing plan (Free, Pro, or Elite).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">7. Payment and Refunds</h2>
            <p className="leading-relaxed">
              Premium subscriptions are processed securely via Razorpay. Subscriptions are billed on a recurring basis (monthly or yearly). You may cancel your subscription at any time. Due to the digital nature of our services, all payments are non-refundable except where required by Indian consumer law.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">8. Intellectual Property</h2>
            <p className="leading-relaxed">
              All content on Unfoldd, including curriculum, exam questions, platform design, and logos, are the intellectual property of Unfoldd Technologies Pvt. Ltd. The code you write for your projects and portfolio remains your intellectual property.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">9. Disclaimers and Limitation of Liability</h2>
            <p className="leading-relaxed">
              While our platform is designed to accelerate your career, Unfoldd does not guarantee employment or specific internship placements (unless explicitly stated under the Elite plan guarantee terms). The platform is provided &quot;as is&quot; without warranties of any kind. To the maximum extent permitted by law, Unfoldd shall not be liable for any indirect, incidental, or consequential damages arising from your use of the service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">10. Governing Law and Dispute Resolution</h2>
            <p className="leading-relaxed">
              These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising out of or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts located in Bengaluru, Karnataka.
            </p>
          </section>

          <section className="bg-[#12121A] p-8 rounded-3xl border border-white/10 mt-12">
            <h2 className="text-2xl font-bold text-white mb-4">Contact Information</h2>
            <p className="leading-relaxed text-white/60">
              For any legal inquiries or questions regarding these Terms, please contact:
            </p>
            <div className="mt-4 text-white">
              <strong>Unfoldd Technologies Pvt. Ltd.</strong><br />
              Email: <a href="mailto:legal@unfoldd.me" className="text-purple-400 hover:underline">legal@unfoldd.me</a><br />
              Bengaluru, Karnataka, India
            </div>
          </section>
        </div>
      </div>
      
      <LandingFooter />
    </main>
  )
}
