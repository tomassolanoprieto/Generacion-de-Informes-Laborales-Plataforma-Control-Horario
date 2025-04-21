import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Privacy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/')}
          className="mb-8 flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 bg-white rounded-lg shadow-sm hover:shadow transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </button>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>

          <div className="space-y-6 text-gray-600">
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">1. Introduction</h2>
              <p>
                FrenillosCR ("we", "us", or "our") operates a chatbot ("the Chatbot") hosted on Microsoft Copilot Studio,
                designed to assist users with inquiries related to our orthodontic services, including
                appointment scheduling, treatment information, pricing, and customer support.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">2. Information We Collect</h2>
              <p className="mb-3">The Chatbot may process the following types of information:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Messages you send to the Chatbot (queries about appointments, treatments, or prices)</li>
                <li>Contact details (if voluntarily provided, e.g., name, phone number, email)</li>
                <li>Metadata from Meta platforms (e.g., user ID, message history)</li>
                <li>Chatbot interaction logs (to improve responses)</li>
              </ul>
              <p className="mt-3 font-medium">We do not intentionally collect:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Financial information (credit cards, bank details)</li>
                <li>Sensitive medical records (beyond general treatment inquiries)</li>
                <li>Government-issued IDs</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">3. How We Use Your Information</h2>
              <p className="mb-3">We use the data to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Respond to inquiries about appointments, treatments, and pricing</li>
                <li>Improve the Chatbot's accuracy and user experience</li>
                <li>Redirect conversations to appropriate channels (e.g., human support)</li>
                <li>Comply with legal obligations when applicable</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">4. Data Sharing</h2>
              <p className="mb-3">We share information with:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Meta Platforms:</strong> Messages are processed through their APIs in compliance with their policies</li>
                <li><strong>Microsoft Copilot Studio:</strong> Hosts the Chatbot under their security standards</li>
              </ul>
              <p className="mt-3">We do not sell or share data with third parties for marketing purposes.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">5. Data Security</h2>
              <p>
                We implement measures to protect your information:
              </p>
              <ul className="list-disc pl-6 mt-3 space-y-2">
                <li>Restricted access to information</li>
                <li>Continuous security monitoring</li>
                <li>Minimal retention of messages</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">6. Your Rights</h2>
              <p className="mb-3">You can:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Request access to or deletion of your data</li>
                <li>Correct inaccurate information</li>
                <li>Stop interacting with the Chatbot at any time</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">7. Data Retention</h2>
              <p>
                We retain messages only as long as necessary to fulfill requests and legal obligations.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">8. Compliance with Meta</h2>
              <p>
                The Chatbot follows Meta's <strong>Developer Policies</strong> and <strong>Platform Terms</strong>.
                We don't store sensitive data beyond what's necessary for functionality.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">9. Contact Us</h2>
              <p>
                For privacy-related questions:
              </p>
              <div className="mt-3">
                <p className="font-medium">FrenillosCR</p>
                <p>Email: info@frenillos.com</p>
                <p>Phone: 6161-9997</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">10. Updates</h2>
              <p>
                This policy may be updated. The current version will always be available here. 
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </section>
          </div>
        </div>
      </div>
    </div
