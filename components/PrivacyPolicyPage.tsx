import React, { useEffect } from 'react';

export const PrivacyPolicyPage: React.FC = () => {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="min-h-screen bg-paper relative text-slate-800 font-sans">
      {/* Background Noise */}
      <div className="absolute inset-0 bg-noise opacity-5 pointer-events-none fixed"></div>

      {/* Header */}
      <header className="pt-20 pb-12 md:pt-32 md:pb-16 px-4 border-b border-slate-900 bg-paper relative z-10">
        <div className="max-w-[1000px] mx-auto text-center">
            <div className="inline-block bg-slate-900 text-white text-[10px] md:text-xs font-black uppercase tracking-widest px-3 py-1 mb-6 shadow-[4px_4px_0px_0px_rgba(234,88,12,1)]">
                Legal
            </div>
            <h1 className="font-sans font-black text-4xl sm:text-5xl md:text-7xl text-slate-900 mb-6 uppercase tracking-tighter leading-[0.9]">
                Privacy <span className="text-brand-600">Policy</span>
            </h1>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-[800px] mx-auto px-4 py-12 md:py-20 relative z-10">
        <div className="prose prose-slate prose-lg max-w-none font-serif prose-headings:font-sans prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tight prose-a:text-brand-600 prose-a:no-underline hover:prose-a:underline">
            <p className="lead text-xl md:text-2xl font-medium text-slate-900 mb-8">
                At Bitcoin Intrigue, we value your privacy and are committed to protecting your personal information. This Privacy Policy outlines how we collect, use, and safeguard your data when you visit our website or subscribe to our newsletter.
            </p>

            <h3>1. Information We Collect</h3>
            <p>We collect information you provide directly to us, such as when you subscribe to our newsletter, request a media kit, or contact us. This may include:</p>
            <ul>
                <li>Email address</li>
                <li>Name (if provided)</li>
                <li>Company name (if provided for B2B inquiries)</li>
            </ul>
            <p>We also automatically collect certain information about your device and how you interact with our website using cookies and similar technologies to improve our user experience.</p>

            <h3>2. How We Use Your Information</h3>
            <p>We use the information we collect to:</p>
            <ul>
                <li>Send you our daily newsletter and other relevant updates.</li>
                <li>Analyze website traffic and user behavior to improve our content.</li>
                <li>Respond to your comments, questions, and requests.</li>
                <li>Detect, investigate, and prevent fraudulent transactions and other illegal activities.</li>
            </ul>

            <h3>3. Sharing of Information</h3>
            <p>We do not sell your personal information. We may share your information with trusted third-party service providers who help us operate our website and newsletter (e.g., email service providers, analytics tools), subject to strict confidentiality obligations.</p>

            <h3>4. Cookies</h3>
            <p>We use cookies to enhance your experience. You can set your browser to refuse all or some browser cookies, but this may affect the functionality of certain parts of our website.</p>

            <h3>5. Data Security</h3>
            <p>We implement reasonable security measures to protect your information from unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet is 100% secure.</p>

            <h3>6. Your Rights</h3>
            <p>You can unsubscribe from our newsletter at any time by clicking the "unsubscribe" link at the bottom of our emails. You may also contact us to request access to, correction of, or deletion of your personal data.</p>

            <h3>7. Contact Us</h3>
            <p>If you have any questions about this Privacy Policy, please contact us at <a href="mailto:hello@bitcoinintrigue.com">hello@bitcoinintrigue.com</a>.</p>
        </div>
      </div>
    </div>
  );
};