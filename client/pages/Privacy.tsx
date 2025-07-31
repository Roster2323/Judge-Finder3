import { Link } from "react-router-dom";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to="/" className="text-xl font-semibold text-gray-800">
            Judge Finder
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/contact" className="text-gray-600 hover:text-gray-800">
              Contact Us
            </Link>
            <Link to="/login" className="text-gray-600 hover:text-gray-800">
              Login
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto py-12 px-6">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Privacy Policy
          </h1>

          <div className="prose prose-gray max-w-none space-y-6">
            <p className="text-sm text-gray-500">
              Last updated: January 1, 2025
            </p>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Information We Collect
              </h2>
              <p className="text-gray-600">
                Judge Finder collects information you provide directly to us,
                such as when you create an account, use our services, or contact
                us. This may include your name, email address, state bar
                information, and payment details for advertising services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                How We Use Your Information
              </h2>
              <p className="text-gray-600">
                We use the information we collect to provide, maintain, and
                improve our judicial analytics services, process payments for
                advertising, communicate with users, and comply with legal
                obligations.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Information Sharing
              </h2>
              <p className="text-gray-600">
                We do not sell, trade, or otherwise transfer your personal
                information to third parties except as described in this policy
                or with your consent. We may share information with service
                providers who assist us in operating our platform.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Data Security
              </h2>
              <p className="text-gray-600">
                We implement appropriate security measures to protect your
                personal information against unauthorized access, alteration,
                disclosure, or destruction. However, no method of transmission
                over the internet is 100% secure.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Your Rights
              </h2>
              <p className="text-gray-600">
                You have the right to access, update, or delete your personal
                information. You may also opt out of certain communications from
                us. Contact us at privacy@judgefinder.com for assistance with
                these requests.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Contact Us
              </h2>
              <p className="text-gray-600">
                If you have questions about this Privacy Policy, please contact
                us at privacy@judgefinder.com or through our{" "}
                <Link
                  to="/contact"
                  className="text-blue-600 hover:text-blue-800"
                >
                  contact page
                </Link>
                .
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
