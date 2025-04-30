
import React from 'react';
import Navbar from '@/components/Navbar';
import BackButton from '@/components/BackButton';
import { ScrollArea } from "@/components/ui/scroll-area";

const Privacy = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container px-4 md:px-6 py-8 max-w-4xl mx-auto">
        <div className="mb-6">
          <BackButton />
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
          <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
          
          <ScrollArea className="h-[60vh]">
            <div className="space-y-6 pr-4">
              <section className="space-y-3">
                <h2 className="text-xl font-semibold">1. Introduction</h2>
                <p>Welcome to PromptFlow's Privacy Policy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website.</p>
              </section>
              
              <section className="space-y-3">
                <h2 className="text-xl font-semibold">2. Information We Collect</h2>
                <p>We may collect personal information that you voluntarily provide to us when you register on our website, express an interest in obtaining information about us or our products, or otherwise contact us. This information may include:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Personal details such as name and email address</li>
                  <li>Account credentials such as username and password</li>
                  <li>User-generated content such as prompts and preferences</li>
                  <li>Technical information such as IP address and browser type</li>
                </ul>
              </section>
              
              <section className="space-y-3">
                <h2 className="text-xl font-semibold">3. How We Use Your Information</h2>
                <p>We may use the information we collect for various purposes, including:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Providing and maintaining our services</li>
                  <li>Personalizing your experience</li>
                  <li>Communicating with you about updates and features</li>
                  <li>Analyzing usage patterns to improve our website</li>
                  <li>Preventing fraudulent or unauthorized activities</li>
                </ul>
              </section>
              
              <section className="space-y-3">
                <h2 className="text-xl font-semibold">4. Disclosure of Your Information</h2>
                <p>We may share your information with third parties in the following situations:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>With service providers who help us operate our website</li>
                  <li>To comply with legal obligations</li>
                  <li>To protect our rights and those of our users</li>
                  <li>In connection with a business transaction such as a merger or acquisition</li>
                </ul>
              </section>
              
              <section className="space-y-3">
                <h2 className="text-xl font-semibold">5. Data Security</h2>
                <p>We implement appropriate technical and organizational measures to protect your personal information. However, no method of transmission over the internet or electronic storage is 100% secure, so we cannot guarantee absolute security.</p>
              </section>
              
              <section className="space-y-3">
                <h2 className="text-xl font-semibold">6. Your Privacy Rights</h2>
                <p>Depending on your location, you may have rights regarding your personal information, including:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>The right to access your personal information</li>
                  <li>The right to rectify inaccurate information</li>
                  <li>The right to delete your personal information</li>
                  <li>The right to restrict or object to processing</li>
                </ul>
                <p>To exercise these rights, please contact us using the information provided at the end of this Privacy Policy.</p>
              </section>
              
              <section className="space-y-3">
                <h2 className="text-xl font-semibold">7. Third-Party Websites</h2>
                <p>Our website may contain links to third-party websites. We are not responsible for the privacy practices or content of these websites. We encourage you to review the privacy policies of any website you visit.</p>
              </section>
              
              <section className="space-y-3">
                <h2 className="text-xl font-semibold">8. Children's Privacy</h2>
                <p>Our website is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13.</p>
              </section>
              
              <section className="space-y-3">
                <h2 className="text-xl font-semibold">9. Changes to This Privacy Policy</h2>
                <p>We may update our Privacy Policy from time to time. Any changes will be posted on this page, and the "Last updated" date will be revised accordingly.</p>
              </section>
              
              <section className="space-y-3">
                <h2 className="text-xl font-semibold">10. Contact Us</h2>
                <p>If you have any questions about this Privacy Policy, please contact us at [Your Contact Email].</p>
              </section>
              
              <p className="text-sm text-gray-500 mt-8">Last updated: April 30, 2025</p>
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
