import { Link } from "react-router-dom";

export default function LegalDisclosures() {
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
            Legal Disclosures
          </h1>

          <div className="prose prose-gray max-w-none space-y-8">
            <p className="text-sm text-gray-500">
              Last updated: January 22, 2025
            </p>

            {/* Attorney Advertising Disclosure */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Attorney Advertising Disclosure
              </h2>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                <p className="text-amber-800 font-semibold">
                  ATTORNEY ADVERTISING: Judge Finder provides advertising space
                  for licensed attorneys. We do not endorse, recommend, or
                  guarantee any attorney or legal service.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Featured Attorney Slots
                </h3>
                <ul className="space-y-2 text-gray-600">
                  <li>
                    • All Featured Attorney Slots are clearly labeled as paid
                    advertisements
                  </li>
                  <li>
                    • Attorneys pay monthly subscription fees to advertise their
                    services
                  </li>
                  <li>
                    • Judge Finder does not take any percentage of legal fees or
                    commissions
                  </li>
                  <li>
                    • We provide advertising space only - this is NOT a lawyer
                    referral service
                  </li>
                  <li>
                    • Subscription continues until the end of the paid period,
                    even after cancellation
                  </li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-900 mt-6">
                  Attorney Verification
                </h3>
                <ul className="space-y-2 text-gray-600">
                  <li>
                    • All attorneys must provide valid State Bar Numbers for
                    verification
                  </li>
                  <li>• Attorneys must be licensed and in good standing</li>
                  <li>
                    • We verify bar status before approving advertisements
                  </li>
                  <li>
                    • Disbarred or suspended attorneys are prohibited from
                    advertising
                  </li>
                </ul>

                <h3 className="text-lg font-semibold text-gray-900 mt-6">
                  Prohibited Claims
                </h3>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 font-semibold mb-2">
                    Attorney advertisements may NOT contain:
                  </p>
                  <ul className="space-y-1 text-red-700">
                    <li>• "Guaranteed win" or "guaranteed outcome" claims</li>
                    <li>
                      • "Best lawyer in [location]" or similar superlatives
                    </li>
                    <li>• Unverified success rate claims</li>
                    <li>
                      • Misleading statements about experience or qualifications
                    </li>
                    <li>• False or unverifiable testimonials</li>
                    <li>• Promises of specific case results</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* No Endorsement Disclaimer */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                No Endorsement or Recommendation
              </h2>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-blue-800 font-semibold">
                  Judge Finder explicitly does NOT endorse, recommend, or
                  guarantee any attorney or law firm.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    What We Do NOT Do:
                  </h3>
                  <ul className="space-y-1 text-gray-600">
                    <li>• Endorse or recommend attorneys</li>
                    <li>• Guarantee quality of legal services</li>
                    <li>• Take percentage of legal fees</li>
                    <li>• Match clients with specific attorneys</li>
                    <li>• Provide legal advice or consultation</li>
                    <li>
                      • Verify attorney-provided information beyond bar status
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    What We DO Provide:
                  </h3>
                  <ul className="space-y-1 text-gray-600">
                    <li>• Advertising space for licensed attorneys</li>
                    <li>• Public judicial information and analytics</li>
                    <li>• State Bar Number verification</li>
                    <li>• Clear advertising disclosure labels</li>
                    <li>• Educational judicial information</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Data Sources */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Data Sources and Accuracy
              </h2>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Public Information
                </h3>
                <p className="text-gray-600">
                  All judge information is compiled from public records and
                  court documents. Our primary data source is CourtListener's
                  Free Law Project, which provides legal data that is "free of
                  known copyright restrictions."
                </p>

                <h3 className="text-lg font-semibold text-gray-900">
                  Data Accuracy Disclaimer
                </h3>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800">
                    <strong>Important:</strong> While we strive to provide
                    accurate judicial data and analytics, Judge Finder makes no
                    warranties about the completeness, reliability, or accuracy
                    of this information. Users should verify all information
                    independently.
                  </p>
                </div>
              </div>
            </section>

            {/* Not Legal Advice */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Not Legal Advice
              </h2>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-red-800 font-semibold">
                  Judge Finder does not provide legal advice. All information is
                  for educational and informational purposes only.
                </p>
              </div>

              <p className="text-gray-600">
                The judicial analytics, case information, and attorney listings
                on this platform are provided for informational purposes only
                and do not constitute legal advice. Always consult with a
                qualified attorney for legal guidance specific to your
                situation.
              </p>
            </section>

            {/* Professional Compliance */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Professional Compliance
              </h2>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  State Bar Compliance
                </h3>
                <p className="text-gray-600">
                  All attorney advertisements must comply with applicable State
                  Bar Association advertising rules and regulations. Attorneys
                  are responsible for ensuring their advertisements meet all
                  professional standards in their jurisdiction.
                </p>

                <h3 className="text-lg font-semibold text-gray-900">
                  Licensed Attorneys Only
                </h3>
                <p className="text-gray-600">
                  Advertising services are restricted to licensed attorneys and
                  law firms in good standing. Users must maintain active bar
                  admission. Misuse of this service may result in immediate
                  account termination.
                </p>
              </div>
            </section>

            {/* Contact Information */}
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Questions About These Disclosures
              </h2>
              <p className="text-gray-600">
                For questions about these legal disclosures or our advertising
                policies, please contact us at legal@judgefinder.com or through
                our{" "}
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
