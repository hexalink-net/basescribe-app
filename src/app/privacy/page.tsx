import { Header } from '@/components/header';

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
        
        <div className="prose prose-slate max-w-none">
          <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          
          <h2>1. Introduction</h2>
          <p>At BaseScribe, we respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services.</p>
          
          <h2>2. Information We Collect</h2>
          <p>We collect several types of information from and about users of our website, including:</p>
          <ul>
            <li><strong>Personal Data:</strong> Name, email address, and other contact information you provide when creating an account.</li>
            <li><strong>Usage Data:</strong> Information about how you use our website and services.</li>
            <li><strong>Content Data:</strong> Audio and video files you upload only to be processed by our AI transcription service, and the resulting transcriptions and audio files are stored encrypted and only accessible with your personal encryption password.</li>
            <li><strong>Payment Data:</strong> Information necessary to process your payment if you make purchases.</li>
          </ul>
          
          <h2>3. How We Use Your Information</h2>
          <p>We use the information we collect about you for various purposes, including:</p>
          <ul>
            <li>To provide and maintain our service</li>
            <li>To process and complete transactions</li>
            <li>To send you service-related notices and updates</li>
            <li>To respond to your comments, questions, and requests</li>
            <li>To improve our website and services</li>
            <li>To monitor usage of our website</li>
            <li>To detect, prevent, and address technical issues</li>
          </ul>
          
          <h2>4. Data Storage and Security</h2>
          <p>We use Supabase for authentication, database management, and file storage. Your data is stored securely and protected using industry-standard encryption and security practices. We implement appropriate technical and organizational measures to protect your personal data against unauthorized or unlawful processing, accidental loss, destruction, or damage.</p>
          <p><strong>Encryption of Your Content:</strong> To provide an additional layer of security, all audio files and transcriptions you upload are encrypted at rest. We do not store any of your audio files or transcriptions in an unencrypted format. Access to this data requires your personal encryption password, which only you have access to.</p>
          
          <h2>5. Data Retention</h2>
          <p>We will retain your personal data only for as long as is necessary for the purposes set out in this Privacy Policy. We will retain and use your data to the extent necessary to comply with our legal obligations, resolve disputes, and enforce our legal agreements and policies.</p>
          
          <h2>6. Your Data Protection Rights</h2>
          <p>Depending on your location, you may have the following data protection rights:</p>
          <ul>
            <li>The right to access, update, or delete your personal information</li>
            <li>The right to rectification if your information is inaccurate or incomplete</li>
            <li>The right to object to our processing of your personal data</li>
            <li>The right to request restriction of processing your personal data</li>
            <li>The right to data portability</li>
            <li>The right to withdraw consent</li>
          </ul>
          
          <h2>7. Third-Party Services</h2>
          <p>We may use third-party services to support our website and services. These third parties have access to your personal information only to perform these tasks on our behalf and are obligated not to disclose or use it for any other purpose.</p>
          
          <h2>8. Children&rsquo;s Privacy</h2>
          <p>Our service is not intended for use by children under the age of 13. We do not knowingly collect personally identifiable information from children under 13. If you are a parent or guardian and you are aware that your child has provided us with personal data, please contact us.</p>
          
          <h2>9. Changes to This Privacy Policy</h2>
          <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the &ldquo;Last updated&rdquo; date at the top of this Privacy Policy.</p>
          
          <h2>10. Contact Us</h2>
          <p>If you have any questions about this Privacy Policy, please contact us at privacy@basescribe.com.</p>
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
