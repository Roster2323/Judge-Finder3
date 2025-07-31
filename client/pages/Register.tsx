import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { register } from "@/lib/api";

export default function Register() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    firmName: "",
    practiceAreas: "",
    stateBarNumber: "",
  });
  const [selectedTier, setSelectedTier] = useState<
    "federal" | "state" | "local"
  >("state");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [judgeId, setJudgeId] = useState<number | null>(null);

  useEffect(() => {
    // Check if user came from a specific pricing tier
    const storedTier = localStorage.getItem("selectedTier") as
      | "federal"
      | "state"
      | "local";
    const storedJudgeId = localStorage.getItem("selectedJudgeId");

    if (storedTier) {
      setSelectedTier(storedTier);
    }

    if (storedJudgeId) {
      setJudgeId(parseInt(storedJudgeId));
    }

    // Clear from localStorage
    localStorage.removeItem("selectedTier");
    localStorage.removeItem("selectedPrice");
    localStorage.removeItem("selectedJudgeId");
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const practiceAreasArray = formData.practiceAreas
        .split(",")
        .map((area) => area.trim())
        .filter((area) => area.length > 0);

      const response = await register({
        email: formData.email,
        name: formData.fullName,
        firmName: formData.firmName || undefined,
        practiceAreas: practiceAreasArray,
        barNumber: formData.stateBarNumber || undefined,
        tier: selectedTier,
        judgeId: judgeId,
      });

      // Redirect to Stripe Checkout
      if (response.checkoutUrl) {
        window.location.href = response.checkoutUrl;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error) {
      console.error("Registration error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Registration failed";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              Join Our Attorney Directory
            </h2>
            <p className="text-gray-600 mt-2">
              Connect with people who need legal representation and know their
              judge
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label
                  htmlFor="fullName"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Full Name *
                </Label>
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <Label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email Address *
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label
                  htmlFor="firmName"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Law Firm Name
                </Label>
                <Input
                  id="firmName"
                  name="firmName"
                  type="text"
                  value={formData.firmName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <Label
                  htmlFor="stateBarNumber"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  State Bar Number
                </Label>
                <Input
                  id="stateBarNumber"
                  name="stateBarNumber"
                  type="text"
                  value={formData.stateBarNumber}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Optional: Used for verification purposes
                </p>
              </div>
            </div>

            <div>
              <Label
                htmlFor="practiceAreas"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Practice Areas
              </Label>
              <Input
                id="practiceAreas"
                name="practiceAreas"
                type="text"
                value={formData.practiceAreas}
                onChange={handleChange}
                placeholder="e.g., Corporate Law, Litigation, Criminal Defense"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Separate multiple areas with commas
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">
                What happens next?
              </h4>
              <ol className="text-sm text-blue-800 space-y-1">
                <li>
                  1. You'll receive a welcome email with advertising details
                </li>
                <li>2. Complete payment via our secure Stripe checkout</li>
                <li>3. Your profile appears on judge pages immediately</li>
                <li>4. Start connecting with people who need legal help</li>
              </ol>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-md font-medium transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Creating Account...
                </div>
              ) : (
                "Create Account & Continue"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <a
                href="/login"
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                Sign in here
              </a>
            </p>
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-500">
            By creating an account, you agree to our{" "}
            <a href="/terms" className="text-gray-700 hover:text-gray-900">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="/privacy" className="text-gray-700 hover:text-gray-900">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
