import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    const sessionIdParam = searchParams.get("session_id");
    setSessionId(sessionIdParam);
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          {/* Success Icon */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
            <svg
              className="h-8 w-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Payment Successful!
          </h1>

          <p className="text-gray-600 mb-6">
            Thank you for your payment. Your Judge Finder advertisement is now
            active and reaching qualified attorney prospects.
          </p>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-green-800 mb-2">
              What happens next?
            </h3>
            <ul className="text-sm text-green-700 text-left space-y-1">
              <li>✓ Your advertisement is now live on judge profile pages</li>
              <li>✓ You'll receive a confirmation email with details</li>
              <li>✓ Monthly analytics reports will be sent to your email</li>
              <li>
                ✓ Our support team is ready to help optimize your campaign
              </li>
            </ul>
          </div>

          {sessionId && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600">
                <strong>Session ID:</strong>{" "}
                <span className="font-mono text-xs">{sessionId}</span>
              </p>
            </div>
          )}

          <div className="space-y-3">
            <Link to="/" className="block">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                Browse Judge Profiles
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
            Questions about your subscription?{" "}
            <a
              href="mailto:billing@judgefinder.com"
              className="text-blue-600 hover:text-blue-500"
            >
              Contact our billing team
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
