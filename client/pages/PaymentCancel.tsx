import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function PaymentCancel() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          {/* Cancel Icon */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-6">
            <svg
              className="h-8 w-8 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Payment Cancelled
          </h1>

          <p className="text-gray-600 mb-6">
            Your payment was cancelled. No charges were made to your account.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-800 mb-2">
              Ready to continue?
            </h3>
            <p className="text-sm text-blue-700">
              You can try the payment process again or contact our support team
              if you need assistance.
            </p>
          </div>

          <div className="space-y-3">
            <Link to="/register" className="block">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                Try Payment Again
              </Button>
            </Link>

            <Link to="/" className="block">
              <Button
                variant="outline"
                className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Back to Home
              </Button>
            </Link>

            <a
              href="mailto:support@judgefinder.com"
              className="block text-gray-600 hover:text-gray-800 text-sm"
            >
              Need help? Contact Support
            </a>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Have questions about our pricing?{" "}
            <a
              href="mailto:sales@judgefinder.com"
              className="text-blue-600 hover:text-blue-500"
            >
              Contact our sales team
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
