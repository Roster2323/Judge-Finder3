import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { getAttorneySubscriptions, cancelSubscription } from "@/lib/api";

interface Subscription {
  id: number;
  judge_name: string;
  judge_circuit: string;
  judge_tier: "federal" | "state" | "local";
  status: "active" | "canceled" | "past_due" | "unpaid";
  current_period_start: string;
  current_period_end: string;
  stripe_subscription_id: string;
  created_at: string;
}

export default function Dashboard() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  // For now, we'll use a hardcoded user ID - in production, get from auth
  const userId = 1;

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      setIsLoading(true);
      const data = await getAttorneySubscriptions(userId);
      setSubscriptions(data.subscriptions || []);
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      setError("Failed to load subscriptions. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelSubscription = async (
    subscriptionId: string,
    judgeName: string,
  ) => {
    if (
      !confirm(
        `Are you sure you want to cancel your subscription for ${judgeName}? You will no longer appear on their profile page.`,
      )
    ) {
      return;
    }

    try {
      setCancellingId(subscriptionId);
      await cancelSubscription(subscriptionId);
      // Refresh subscriptions list
      await fetchSubscriptions();
    } catch (error) {
      console.error("Error canceling subscription:", error);
      alert(
        "Failed to cancel subscription. Please try again or contact support.",
      );
    } finally {
      setCancellingId(null);
    }
  };

  const getTierInfo = (tier: "federal" | "state" | "local") => {
    const info = {
      federal: {
        name: "Federal",
        color: "bg-green-100 text-green-800",
        price: "$500/mo",
      },
      state: {
        name: "State",
        color: "bg-yellow-100 text-yellow-800",
        price: "$200/mo",
      },
      local: {
        name: "Local",
        color: "bg-blue-100 text-blue-800",
        price: "$100/mo",
      },
    };
    return info[tier];
  };

  const getStatusColor = (status: string) => {
    const colors = {
      active: "bg-green-100 text-green-800",
      canceled: "bg-gray-100 text-gray-800",
      past_due: "bg-red-100 text-red-800",
      unpaid: "bg-red-100 text-red-800",
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your subscriptions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Subscription Dashboard
              </h1>
              <p className="text-gray-600">
                Manage your Judge Finder advertising subscriptions
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/" className="text-gray-600 hover:text-gray-800">
                Browse Judges
              </Link>
              <Button variant="outline">
                <Link to="/login" className="text-gray-700">
                  Logout
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {subscriptions.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg
                className="w-12 h-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Active Subscriptions
            </h3>
            <p className="text-gray-600 mb-6">
              You don't have any active subscriptions yet. Start advertising on
              judge profiles to connect with potential clients.
            </p>
            <Link to="/">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                Browse Judges
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Your Active Subscriptions
              </h2>
              <span className="text-sm text-gray-500">
                {subscriptions.length} subscription
                {subscriptions.length !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="grid gap-6">
              {subscriptions.map((subscription) => {
                const tierInfo = getTierInfo(subscription.judge_tier);
                const isActive = subscription.status === "active";

                return (
                  <div
                    key={subscription.id}
                    className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {subscription.judge_name}
                          </h3>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${tierInfo.color}`}
                          >
                            {tierInfo.name} Judge
                          </span>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(subscription.status)}`}
                          >
                            {subscription.status.charAt(0).toUpperCase() +
                              subscription.status.slice(1)}
                          </span>
                        </div>

                        <p className="text-gray-600 mb-3">
                          {subscription.judge_circuit}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">
                              Billing:
                            </span>
                            <p className="text-gray-600">{tierInfo.price}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">
                              Started:
                            </span>
                            <p className="text-gray-600">
                              {new Date(
                                subscription.created_at,
                              ).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">
                              Next billing:
                            </span>
                            <p className="text-gray-600">
                              {new Date(
                                subscription.current_period_end,
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 ml-6">
                        <Link to={`/judge/${subscription.id}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                          >
                            View Profile
                          </Button>
                        </Link>

                        {isActive && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() =>
                              handleCancelSubscription(
                                subscription.stripe_subscription_id,
                                subscription.judge_name,
                              )
                            }
                            disabled={
                              cancellingId ===
                              subscription.stripe_subscription_id
                            }
                            className="w-full"
                          >
                            {cancellingId ===
                            subscription.stripe_subscription_id
                              ? "Canceling..."
                              : "Cancel"}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-semibold text-blue-900 mb-2">Need Help?</h3>
              <p className="text-blue-800 text-sm mb-4">
                Having issues with your subscriptions? Our support team is here
                to help.
              </p>
              <div className="flex gap-4">
                <a
                  href="mailto:support@judgefinder.com"
                  className="text-blue-600 hover:text-blue-500 text-sm font-medium"
                >
                  Contact Support
                </a>
                <a
                  href="mailto:billing@judgefinder.com"
                  className="text-blue-600 hover:text-blue-500 text-sm font-medium"
                >
                  Billing Questions
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
