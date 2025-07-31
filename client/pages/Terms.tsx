import { Link } from "react-router-dom";

export default function Terms() {
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
            Terms of Service
          </h1>

          <div className="prose prose-gray max-w-none space-y-6">
            <p className="text-sm text-gray-500">
              Last updated: January 1, 2025
            </p>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Acceptance of Terms
              </h2>
              <p className="text-gray-600">
                By accessing and using Judge Finder, you agree to be bound by
                these Terms of Service and all applicable laws and regulations.
                If you do not agree with any of these terms, you are prohibited
                from using this service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Use of Service
              </h2>
              <p className="text-gray-600">
                Judge Finder provides judicial analytics and advertising
                services for legal professionals. You may use our service for
                lawful purposes only and in accordance with these terms. You are
                responsible for maintaining the confidentiality of your account
                credentials.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Attorney Advertising Services - Important Legal Requirements
              </h2>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                <p className="text-amber-800 font-semibold text-sm">
                  ATTORNEY ADVERTISING DISCLOSURE: Judge Finder provides
                  advertising space only. We do not endorse, recommend, or
                  guarantee any attorney.
                </p>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Advertising Platform
              </h3>
              <p className="text-gray-600 mb-4">
                Our Featured Attorney Slots allow licensed legal professionals
                to advertise on judge profile pages. All advertisements are
                clearly labeled as "PAID ADVERTISEMENTS." Advertising rates:
                Federal judges ($500/month), State judges ($200/month), Local
                judges ($100/month).
              </p>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Attorney Verification Requirements
              </h3>
              <ul className="text-gray-600 mb-4 space-y-1 list-disc list-inside">
                <li>All advertisers must provide valid State Bar Numbers</li>
                <li>Attorneys must be licensed and in good standing</li>
                <li>We verify bar status before approving advertisements</li>
                <li>
                  Disbarred or suspended attorneys are prohibited from
                  advertising
                </li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Prohibited Attorney Claims
              </h3>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-red-800 font-semibold text-sm mb-2">
                  The following claims are strictly PROHIBITED in attorney
                  advertisements:
                </p>
                <ul className="text-red-700 text-sm space-y-1 list-disc list-inside">
                  <li>"Guaranteed win" or "guaranteed outcome"</li>
                  <li>"Best lawyer in [location]" or similar superlatives</li>
                  <li>Claims of specific success rates without verification</li>
                  <li>
                    Misleading statements about experience or qualifications
                  </li>
                  <li>False or unverifiable testimonials</li>
                  <li>Promises of specific case results</li>
                </ul>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Not a Lawyer Referral Service
              </h3>
              <p className="text-gray-600 mb-4">
                Judge Finder operates as an advertising platform, NOT a lawyer
                referral service. We do not match clients with attorneys, take
                percentage of legal fees, or provide legal advice. We simply
                provide advertising space for licensed attorneys.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Payment and Subscription Terms
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Monthly Subscriptions
                  </h3>
                  <p className="text-gray-600">
                    Advertising fees are charged monthly in advance on a
                    subscription basis. All payments are processed securely
                    through Stripe.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Cancellation Policy
                  </h3>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-blue-800 font-semibold text-sm mb-2">
                      IMPORTANT: When you cancel your subscription, your
                      advertisement will continue to display until the end of
                      your current paid billing period.
                    </p>
                    <p className="text-blue-700 text-sm">
                      This ensures you receive the full value of your payment
                      and complies with attorney advertising regulations. No
                      refunds are provided for unused portions of the billing
                      period.
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Refund Policy
                  </h3>
                  <p className="text-gray-600">
                    Refunds are available within 7 days of initial purchase
                    only. After 7 days, cancellations will take effect at the
                    end of the current billing period.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Data Accuracy
              </h2>
              <p className="text-gray-600">
                While we strive to provide accurate judicial data and analytics,
                Judge Finder makes no warranties about the completeness,
                reliability, or accuracy of this information. Users should
                verify all information independently.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Professional Use and Compliance
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Licensed Attorneys Only
                  </h3>
                  <p className="text-gray-600">
                    Advertising services are restricted to licensed attorneys
                    and law firms in good standing. Users must maintain active
                    bar admission. Misuse of this service may result in
                    immediate account termination.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    State Bar Compliance
                  </h3>
                  <p className="text-gray-600">
                    All attorney advertisements must comply with applicable
                    State Bar Association advertising rules and regulations.
                    Attorneys are responsible for ensuring their advertisements
                    meet all professional standards in their jurisdiction.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No Legal Advice
                  </h3>
                  <p className="text-gray-600">
                    Judge Finder does not provide legal advice. All information
                    is for informational purposes only. Users should consult
                    with qualified attorneys for legal guidance specific to
                    their situation.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Public Information Disclaimer
              </h2>
              <p className="text-gray-600">
                All judge information is compiled from public records and court
                documents available through CourtListener's Free Law Project and
                other public databases. This data is "free of known copyright
                restrictions" as stated by the source. Judge analytics are based
                on publicly available case decisions and rulings.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                No Endorsement or Recommendation
              </h2>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-gray-700 font-semibold text-sm mb-2">
                  Judge Finder explicitly does NOT:
                </p>
                <ul className="text-gray-600 text-sm space-y-1 list-disc list-inside">
                  <li>Endorse or recommend any attorney or law firm</li>
                  <li>Guarantee the quality of legal services</li>
                  <li>Take percentage of legal fees or commissions</li>
                  <li>Match clients with specific attorneys</li>
                  <li>Provide legal advice or consultation</li>
                  <li>
                    Verify the accuracy of attorney-provided information beyond
                    bar status
                  </li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                Contact Information
              </h2>
              <p className="text-gray-600">
                For questions about these Terms of Service, please contact us at
                legal@judgefinder.com or through our{" "}
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
