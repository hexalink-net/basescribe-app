import { Header } from '@/components/header';

export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
        
        <div className="prose prose-slate max-w-none">
          <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          
          <h2>1. Introduction</h2>
          <p>Welcome to BaseScribe ("we," "our," or "us"). These Terms of Service ("Terms") govern your access to and use of the BaseScribe website and services, including any content, functionality, and services offered on or through our website (the "Service").</p>
          
          <h2>2. Acceptance of Terms</h2>
          <p>By accessing or using the Service, you agree to be bound by these Terms. If you do not agree to these Terms, you must not access or use the Service.</p>
          
          <h2>3. Changes to Terms</h2>
          <p>We may revise and update these Terms from time to time in our sole discretion. All changes are effective immediately when we post them. Your continued use of the Service following the posting of revised Terms means that you accept and agree to the changes.</p>
          
          <h2>4. Accessing the Service</h2>
          <p>We reserve the right to withdraw or amend the Service, and any service or material we provide on the Service, in our sole discretion without notice. We will not be liable if for any reason all or any part of the Service is unavailable at any time or for any period.</p>
          
          <h2>5. User Accounts</h2>
          <p>When you create an account with us, you must provide accurate, complete, and current information. You are responsible for safeguarding the password and for all activities that occur under your account. You agree to notify us immediately of any unauthorized access to or use of your account.</p>
          
          <h2>6. Intellectual Property Rights</h2>
          <p>The Service and its entire contents, features, and functionality (including but not limited to all information, software, text, displays, images, video, and audio, and the design, selection, and arrangement thereof), are owned by BaseScribe, its licensors, or other providers of such material and are protected by copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.</p>
          
          <h2>7. User Content</h2>
          <p>You retain all rights in, and are solely responsible for, the content you upload to the Service. By uploading content to the Service, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, perform, display, distribute, and otherwise disclose to third parties any such material for the purpose of providing the Service.</p>
          
          <h2>8. Prohibited Uses</h2>
          <p>You may use the Service only for lawful purposes and in accordance with these Terms. You agree not to use the Service in any way that violates any applicable federal, state, local, or international law or regulation.</p>
          
          <h2>9. Termination</h2>
          <p>We may terminate or suspend your account and access to the Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>
          
          <h2>10. Disclaimer of Warranties</h2>
          <p>The Service is provided on an "AS IS" and "AS AVAILABLE" basis, without any warranties of any kind, either express or implied. We disclaim all warranties, including but not limited to, implied warranties of merchantability, fitness for a particular purpose, and non-infringement.</p>
          
          <h2>11. Limitation of Liability</h2>
          <p>In no event will BaseScribe, its affiliates, or their licensors, service providers, employees, agents, officers, or directors be liable for damages of any kind, under any legal theory, arising out of or in connection with your use, or inability to use, the Service.</p>
          
          <h2>12. Governing Law</h2>
          <p>These Terms shall be governed by and construed in accordance with the laws of the state of California, without regard to its conflict of law principles.</p>
          
          <h2>13. Contact Information</h2>
          <p>If you have any questions about these Terms, please contact us at support@basescribe.com.</p>
        </div>
      </div>
      
      <footer className="py-6 border-t mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} BaseScribe. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
