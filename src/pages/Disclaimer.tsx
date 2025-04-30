
import React from 'react';
import Navbar from '@/components/Navbar';
import BackButton from '@/components/BackButton';
import { ScrollArea } from "@/components/ui/scroll-area";

const Disclaimer = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container px-4 md:px-6 py-8 max-w-4xl mx-auto">
        <div className="mb-6">
          <BackButton />
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
          <h1 className="text-3xl font-bold mb-6">Disclaimer</h1>
          
          <ScrollArea className="h-[60vh]">
            <div className="space-y-6 pr-4">
              <section className="space-y-3">
                <h2 className="text-xl font-semibold">1. General Information</h2>
                <p>The information provided on PromptFlow is for general informational purposes only. The content on our website is not intended to be a substitute for professional advice, and we make no warranties about the completeness, reliability, or accuracy of this information.</p>
              </section>
              
              <section className="space-y-3">
                <h2 className="text-xl font-semibold">2. No Warranty</h2>
                <p>The information and services provided on our website are provided "as is" without any warranty, express or implied. We do not warrant that the website will be error-free or uninterrupted, or that defects will be corrected.</p>
              </section>
              
              <section className="space-y-3">
                <h2 className="text-xl font-semibold">3. Limitation of Liability</h2>
                <p>In no event shall PromptFlow be liable for any direct, indirect, incidental, special, or consequential damages arising out of or in any way connected with the use of our website or services, whether based on contract, tort, strict liability, or any other legal theory, even if we have been advised of the possibility of damages.</p>
              </section>
              
              <section className="space-y-3">
                <h2 className="text-xl font-semibold">4. External Links</h2>
                <p>Our website may contain links to external websites that are not provided or maintained by us. We do not guarantee the accuracy, relevance, timeliness, or completeness of any information on these external websites.</p>
              </section>
              
              <section className="space-y-3">
                <h2 className="text-xl font-semibold">5. User-Generated Content</h2>
                <p>Users of our website may post content, including prompt templates. We do not endorse, support, represent, or guarantee the completeness, truthfulness, accuracy, or reliability of any user-generated content. The use of any content or materials posted by users is at your own risk.</p>
              </section>
              
              <section className="space-y-3">
                <h2 className="text-xl font-semibold">6. Professional Advice</h2>
                <p>The content on our website is not intended to be a substitute for professional advice. Always seek the advice of qualified professionals regarding any questions you may have about technical or other matters.</p>
              </section>
              
              <section className="space-y-3">
                <h2 className="text-xl font-semibold">7. Changes to the Disclaimer</h2>
                <p>We reserve the right to modify this disclaimer at any time. Changes will be effective immediately upon posting on our website. Your continued use of our services following any changes indicates your acceptance of the modified disclaimer.</p>
              </section>
              
              <p className="text-sm text-gray-500 mt-8">Last updated: April 30, 2025</p>
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};

export default Disclaimer;
