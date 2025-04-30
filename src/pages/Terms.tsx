
import React from 'react';
import Navbar from '@/components/Navbar';
import BackButton from '@/components/BackButton';
import { ScrollArea } from "@/components/ui/scroll-area";

const Terms = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container px-4 md:px-6 py-8 max-w-4xl mx-auto">
        <div className="mb-6">
          <BackButton />
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
          <h1 className="text-3xl font-bold mb-6">Terms and Conditions</h1>
          
          <ScrollArea className="h-[60vh]">
            <div className="space-y-6 pr-4">
              <section className="space-y-3">
                <h2 className="text-xl font-semibold">1. Introduction</h2>
                <p>Welcome to PromptFlow ("we", "our", or "us"). By accessing or using our website, you agree to be bound by these Terms and Conditions ("Terms"). Please read these Terms carefully before using our services.</p>
              </section>
              
              <section className="space-y-3">
                <h2 className="text-xl font-semibold">2. Acceptance of Terms</h2>
                <p>By accessing our website, you acknowledge that you have read, understood, and agree to be bound by these Terms. If you do not agree to these Terms, please do not use our services.</p>
              </section>
              
              <section className="space-y-3">
                <h2 className="text-xl font-semibold">3. Changes to Terms</h2>
                <p>We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting on our website. Your continued use of our services following any changes indicates your acceptance of the modified Terms.</p>
              </section>
              
              <section className="space-y-3">
                <h2 className="text-xl font-semibold">4. User Accounts</h2>
                <p>To access certain features of our website, you may be required to create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.</p>
              </section>
              
              <section className="space-y-3">
                <h2 className="text-xl font-semibold">5. Intellectual Property</h2>
                <p>All content on our website, including text, graphics, logos, and software, is owned by us or our licensors and is protected by intellectual property laws. You may not use, copy, or distribute our content without our explicit permission.</p>
              </section>
              
              <section className="space-y-3">
                <h2 className="text-xl font-semibold">6. User Content</h2>
                <p>By submitting content to our website, you grant us a non-exclusive, royalty-free, worldwide license to use, modify, publicly display, and distribute your content in connection with our services.</p>
              </section>
              
              <section className="space-y-3">
                <h2 className="text-xl font-semibold">7. Prohibited Activities</h2>
                <p>You agree not to engage in any activities that may interfere with or disrupt our services, including but not limited to attempting to gain unauthorized access, transmitting malware, or engaging in illegal activities.</p>
              </section>
              
              <section className="space-y-3">
                <h2 className="text-xl font-semibold">8. Disclaimer of Warranties</h2>
                <p>Our services are provided "as is" without warranties of any kind, either express or implied. We do not guarantee that our services will be error-free, secure, or continuously available.</p>
              </section>
              
              <section className="space-y-3">
                <h2 className="text-xl font-semibold">9. Limitation of Liability</h2>
                <p>To the fullest extent permitted by law, we shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our services.</p>
              </section>
              
              <section className="space-y-3">
                <h2 className="text-xl font-semibold">10. Governing Law</h2>
                <p>These Terms shall be governed by and construed in accordance with the laws of [Your Jurisdiction], without regard to its conflict of law provisions.</p>
              </section>
              
              <section className="space-y-3">
                <h2 className="text-xl font-semibold">11. Contact Information</h2>
                <p>If you have any questions about these Terms, please contact us at [Your Contact Email].</p>
              </section>
              
              <p className="text-sm text-gray-500 mt-8">Last updated: April 30, 2025</p>
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};

export default Terms;
