export default function Contact() {
  return (
    <div className="min-h-screen bg-slate-800 text-white">
      {/* Header */}
      <header className="flex items-center justify-between p-6">
        <div className="text-xl font-semibold">
          <a href="/" className="text-white">
            Judge Finder
          </a>
        </div>
        <div className="flex items-center gap-4">
          <a
            href="/login"
            className="text-gray-300 hover:text-white transition-colors"
          >
            Login
          </a>
        </div>
      </header>

      <div className="max-w-4xl mx-auto py-12 px-6">
        {/* Back Button */}
        <div className="mb-8">
          <a
            href="/"
            className="inline-flex items-center text-gray-300 hover:text-white transition-colors text-sm"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Judge Finder
          </a>
        </div>

        <div className="bg-slate-700 rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold text-white mb-8">Contact Us</h1>

          <div className="max-w-none">
            <p className="text-xl text-gray-300 mb-12 leading-relaxed">
              Get in touch with the Judge Finder team for questions about our
              judicial analytics platform, advertising opportunities, or
              technical support.
            </p>

            <div className="grid md:grid-cols-2 gap-12">
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">
                    General Inquiries
                  </h3>
                  <div className="space-y-2">
                    <p className="text-gray-300">
                      <span className="text-white font-medium">Email:</span>{" "}
                      info@judgefinder.com
                    </p>
                    <p className="text-gray-300">
                      <span className="text-white font-medium">Phone:</span>{" "}
                      (714) 442-5085
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">
                    Business Hours
                  </h3>
                  <p className="text-gray-300">
                    Monday - Friday: 9:00 AM - 6:00 PM PST
                  </p>
                </div>
              </div>

              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">
                    Advertising Sales
                  </h3>
                  <div className="space-y-2">
                    <p className="text-gray-300">
                      <span className="text-white font-medium">Email:</span>{" "}
                      sales@judgefinder.com
                    </p>
                    <p className="text-gray-300">
                      <span className="text-white font-medium">Phone:</span>{" "}
                      (714) 442-5085
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">
                    Technical Support
                  </h3>
                  <p className="text-gray-300">
                    <span className="text-white font-medium">Email:</span>{" "}
                    support@judgefinder.com
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-12 p-8 bg-slate-600 rounded-lg">
              <h3 className="text-xl font-semibold text-white mb-4">
                About Judge Finder
              </h3>
              <p className="text-gray-300 leading-relaxed">
                Judge Finder is the premier platform for data-driven judicial
                analytics, providing attorneys and legal professionals with
                comprehensive insights into judicial behavior, ruling
                tendencies, and case histories to inform litigation strategy and
                case preparation.
              </p>
            </div>

            <div className="mt-12 p-8 bg-slate-600 rounded-lg">
              <h3 className="text-xl font-semibold text-white mb-4">
                Advertising Tiers
              </h3>
              <div className="grid sm:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-4 h-4 bg-green-500 rounded-full mx-auto mb-2"></div>
                  <h4 className="text-white font-medium">Federal Judges</h4>
                  <p className="text-gray-300 text-sm">$500/month</p>
                </div>
                <div className="text-center">
                  <div className="w-4 h-4 bg-yellow-500 rounded-full mx-auto mb-2"></div>
                  <h4 className="text-white font-medium">State Judges</h4>
                  <p className="text-gray-300 text-sm">$200/month</p>
                </div>
                <div className="text-center">
                  <div className="w-4 h-4 bg-blue-500 rounded-full mx-auto mb-2"></div>
                  <h4 className="text-white font-medium">Local Judges</h4>
                  <p className="text-gray-300 text-sm">$100/month</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-8 text-gray-400 text-sm">
        <div className="flex items-center justify-center gap-6 mb-4">
          <a href="/privacy" className="hover:text-white transition-colors">
            Privacy Policy
          </a>
          <a href="/terms" className="hover:text-white transition-colors">
            Terms of Service
          </a>
        </div>
        <p>© 2025 Judge Finder. All Rights Reserved.</p>
      </footer>
    </div>
  );
}
