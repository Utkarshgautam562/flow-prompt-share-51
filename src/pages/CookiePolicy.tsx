
import React from 'react';
import Navbar from '@/components/Navbar';
import BackButton from '@/components/BackButton';
import { ScrollArea } from "@/components/ui/scroll-area";

const CookiePolicy = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container px-4 md:px-6 py-8 max-w-4xl mx-auto">
        <div className="mb-6">
          <BackButton />
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
          <h1 className="text-3xl font-bold mb-6">Cookie Policy</h1>
          
          <ScrollArea className="h-[60vh]">
            <div className="space-y-6 pr-4">
              <section className="space-y-3">
                <h2 className="text-xl font-semibold">1. Introduction</h2>
                <p>This Cookie Policy explains how PromptFlow uses cookies and similar technologies to recognize you when you visit our website. It explains what these technologies are and why we use them, as well as your rights to control our use of them.</p>
              </section>
              
              <section className="space-y-3">
                <h2 className="text-xl font-semibold">2. What Are Cookies</h2>
                <p>Cookies are small data files that are placed on your computer or mobile device when you visit a website. Cookies are widely used by website owners to make their websites work, or to work more efficiently, as well as to provide reporting information.</p>
              </section>
              
              <section className="space-y-3">
                <h2 className="text-xl font-semibold">3. Why We Use Cookies</h2>
                <p>We use cookies for several reasons. Some cookies are required for technical reasons for our website to operate, and we refer to these as "essential" or "strictly necessary" cookies. Other cookies enable us to track and target the interests of our users to enhance the experience on our website. Third parties serve cookies through our website for advertising, analytics, and other purposes.</p>
              </section>
              
              <section className="space-y-3">
                <h2 className="text-xl font-semibold">4. Types of Cookies We Use</h2>
                <p>The types of cookies we use include:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>Essential cookies:</strong> These cookies are strictly necessary to provide you with services available through our website and to use some of its features, such as access to secure areas.</li>
                  <li><strong>Analytics cookies:</strong> These cookies help us understand how visitors interact with our website, how long they spend on various pages, and how they found our site.</li>
                  <li><strong>Preference cookies:</strong> These cookies allow us to remember choices you have made in the past, like what language you prefer or what region you are in.</li>
                  <li><strong>Authentication cookies:</strong> These cookies help us identify our users so that when you're logged in, you can enjoy our offerings, experiences, and various features.</li>
                </ul>
              </section>
              
              <section className="space-y-3">
                <h2 className="text-xl font-semibold">5. How to Control Cookies</h2>
                <p>You have the right to decide whether to accept or reject cookies. You can set or amend your web browser controls to accept or refuse cookies. If you choose to reject cookies, you may still use our website, but your access to some functionality and areas of our website may be restricted.</p>
              </section>
              
              <section className="space-y-3">
                <h2 className="text-xl font-semibold">6. Changes to This Cookie Policy</h2>
                <p>We may update this Cookie Policy from time to time in order to reflect changes to the cookies we use or for other operational, legal, or regulatory reasons. Please check back periodically to stay informed about our use of cookies and related technologies.</p>
              </section>
              
              <section className="space-y-3">
                <h2 className="text-xl font-semibold">7. Contact Us</h2>
                <p>If you have any questions about our use of cookies or other technologies, please contact us at [Your Contact Email].</p>
              </section>
              
              <p className="text-sm text-gray-500 mt-8">Last updated: April 30, 2025</p>
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicy;
