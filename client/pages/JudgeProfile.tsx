import { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { getJudgeAttorneys } from "@/lib/api";
import JudgeFAQ from "@/components/JudgeFAQ";
import { SEOManager } from "@/lib/seo";
import { getJudgeProfile } from "@/lib/api"; // Added import for getJudgeProfile
import { apiRequest } from "@/lib/api"; // Added import for apiRequest

interface CourtListenerJudge {
  id: number;
  name_first: string;
  name_middle: string;
  name_last: string;
  name_suffix: string;
  slug: string;
  gender: string;
  date_dob: string | null;
  dob_city: string;
  dob_state: string;
  dob_country: string;
  has_photo: boolean;
  fjc_id: string | null;
  positions: any[];
  resource_uri: string;
}

interface JudgeProfileData {
  judge: CourtListenerJudge;
  positions: any[];
  opinions?: any[];
  education?: any[];
  abaRatings?: any[];
  rulingTendencies?: any[]; // Added for enhanced profile
  enhancedProfile?: any; // Added for enhanced profile
}

export default function JudgeProfile() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const [judgeData, setJudgeData] = useState<JudgeProfileData | null>(
    location.state?.judgeData || null,
  );
  const [isLoading, setIsLoading] = useState(!judgeData);
  const [error, setError] = useState<string | null>(null);
  const [attorneys, setAttorneys] = useState<any[]>([]);

  useEffect(() => {
    if (!judgeData && id) {
      fetchJudgeProfile();
    }
    if (id) {
      fetchAttorneys();
    }
  }, [id, judgeData]);

  // Set SEO when judge data is loaded
  useEffect(() => {
    if (judgeData?.judge) {
      const judgeName = formatJudgeName(judgeData.judge);
      const seoConfig = SEOManager.generateJudgeSEO({
        id: judgeData.judge.id,
        name: judgeName,
        circuit: getCurrentPosition(judgeData.judge)?.court_name || 'Unknown Court',
        tier: 'federal' // Default to federal for CourtListener judges
      });
      SEOManager.setMetaTags(seoConfig);
      SEOManager.addJudgeFAQData(judgeName);
      SEOManager.addCourtLocationData(getCurrentPosition(judgeData.judge)?.court_name || 'Unknown Court');
    }
  }, [judgeData]);

  const fetchAttorneys = async () => {
    if (!id) return;

    try {
      const data = await getJudgeAttorneys(id);
      setAttorneys(data.attorneys || []);
    } catch (error) {
      console.error("Error fetching attorneys:", error);
      // Don't show error for attorneys, just show empty state
    }
  };

  const fetchJudgeProfile = async () => {
    if (!id) return;

    try {
      setIsLoading(true);
      setError(null);

      // Try to get enhanced judge profile with LLM analysis first
      try {
        const enhancedProfile = await getJudgeProfile(id);
        console.log('Enhanced judge profile loaded:', enhancedProfile);
        
        // If we have ruling tendencies from LLM analysis, use the enhanced data
        if (enhancedProfile.rulingTendencies && enhancedProfile.rulingTendencies.length > 0) {
          setJudgeData({
            judge: {
              id: enhancedProfile.id,
              name_first: enhancedProfile.name?.split(' ')[0] || '',
              name_last: enhancedProfile.name?.split(' ').slice(-1)[0] || '',
              name_middle: '',
              name_suffix: '',
              slug: '',
              gender: '',
              date_dob: null,
              dob_city: '',
              dob_state: '',
              dob_country: '',
              has_photo: false,
              fjc_id: null,
              positions: [],
              resource_uri: ''
            },
            positions: [],
            opinions: enhancedProfile.recentCases || [],
            education: enhancedProfile.almaMater ? [{ school_name: enhancedProfile.almaMater }] : [],
            abaRatings: [],
            // Store the enhanced data for ruling tendencies
            rulingTendencies: enhancedProfile.rulingTendencies,
            enhancedProfile: enhancedProfile
          });
          return;
        }
      } catch (enhancedError) {
        console.log('Enhanced profile failed, trying CourtListener API:', enhancedError);
      }

      // Fallback to CourtListener API
      const response = await apiRequest(`/judges/judge/${id}`);
      console.log('CourtListener judge profile loaded:', response);
      
      setJudgeData(response);
    } catch (error) {
      console.error("Error fetching judge profile:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      setError(`Failed to load judge profile: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const formatJudgeName = (judge: CourtListenerJudge): string => {
    const parts = [
      judge.name_first,
      judge.name_middle,
      judge.name_last,
      judge.name_suffix
    ].filter(Boolean);
    
    return parts.join(' ');
  };

  const getCurrentPosition = (judge: CourtListenerJudge): any | null => {
    if (!judge.positions || judge.positions.length === 0) {
      return null;
    }
    
    // Find the most recent position that hasn't ended
    return judge.positions.find(position => !position.date_termination) || judge.positions[0];
  };

  const tierColorClass = {
    federal: "bg-judge-federal text-judge-federal-foreground",
    state: "bg-judge-state text-judge-state-foreground",
    local: "bg-judge-local text-judge-local-foreground",
  };

  const tierPrice = {
    federal: "$500/mo",
    state: "$200/mo",
    local: "$100/mo",
  };

  const handleAdvertiseClick = () => {
    if (judgeData?.judge) {
      // Store the selected tier and judge ID in localStorage for the registration page
      localStorage.setItem("selectedTier", "federal"); // Default to federal for CourtListener judges
      localStorage.setItem("selectedJudgeId", judgeData.judge.id.toString());
      window.location.href = "/register";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading judge profile...</p>
        </div>
      </div>
    );
  }

  if (error || !judgeData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Judge Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            {error || "The requested judge profile could not be found."}
          </p>
          <Link
            to="/"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded transition-colors"
          >
            Back to Search
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="text-xl font-semibold text-gray-800">
            ← Back to Search
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/contact" className="text-gray-600 hover:text-gray-800">
              Contact Us
            </Link>
            <Link
              to="/login"
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded text-sm"
            >
              Login
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6">
        {/* Judge Info Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-start gap-6">
            {/* Judge Avatar */}
            <div className="relative">
              <div className="w-32 h-32 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-sm font-medium">
                {judgeData.judge.name_last}
              </div>
              <div
                className={`absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  tierColorClass[judgeData.judge.fjc_id ? 'federal' : 'local']
                }`}
              >
                {judgeData.judge.fjc_id ? "T1" : "T3"}
              </div>
            </div>

            {/* Judge Details */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {formatJudgeName(judgeData.judge)}
              </h1>
              <p className="text-lg text-gray-600 mb-4">
                {getCurrentPosition(judgeData.judge)?.court_name || 'Unknown Court'}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-semibold text-gray-700">
                    Appointed By:
                  </span>
                  <p className="text-gray-600">
                    {getCurrentPosition(judgeData.judge)?.appointed_by || 'Unknown'}
                  </p>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">
                    Years of Service:
                  </span>
                  <p className="text-gray-600">
                    {getCurrentPosition(judgeData.judge)?.date_start ? 
                      Math.floor((new Date().getTime() - new Date(getCurrentPosition(judgeData.judge).date_start).getTime()) / (1000 * 60 * 60 * 24 * 365)) : 
                      'N/A'}
                  </p>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">
                    Education:
                  </span>
                  <p className="text-gray-600">
                    {judgeData.education && judgeData.education.length > 0 
                      ? judgeData.education[0]?.school_name || 'N/A'
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Ruling Tendencies */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              How This Judge Usually Rules
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Based on their recent decisions in cases like yours. This can help
              you understand what to expect.
            </p>

            <div className="space-y-6">
              {judgeData.rulingTendencies && judgeData.rulingTendencies.length > 0 ? (
                judgeData.rulingTendencies.map((tendency: any) => (
                  <div key={tendency.id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">
                        {tendency.category}
                      </span>
                      <span className="text-sm text-gray-500">
                        {tendency.percentage}% {tendency.plaintiffLeans ? 'Plaintiff' : 'Defendant'}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          tendency.plaintiffLeans ? 'bg-green-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${tendency.percentage}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Defendant</span>
                      <span>Plaintiff</span>
                    </div>
                  </div>
                ))
              ) : judgeData.enhancedProfile?.rulingTendencies && judgeData.enhancedProfile.rulingTendencies.length > 0 ? (
                judgeData.enhancedProfile.rulingTendencies.map((tendency: any) => (
                  <div key={tendency.id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">
                        {tendency.category}
                      </span>
                      <span className="text-sm text-gray-500">
                        {tendency.percentage}% {tendency.plaintiffLeans ? 'Plaintiff' : 'Defendant'}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          tendency.plaintiffLeans ? 'bg-green-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${tendency.percentage}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Defendant</span>
                      <span>Plaintiff</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">
                  Ruling tendency data is not available for this judge from the CourtListener API.
                </p>
              )}
            </div>
          </div>

          {/* Last 3 Rulings */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Recent Decisions
            </h2>

            <div className="space-y-6">
              {judgeData.opinions && judgeData.opinions.length > 0 ? (
                judgeData.opinions.slice(0, 3).map((opinion, index) => (
                  <div key={opinion.id} className="border-l-4 border-blue-500 pl-4">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {opinion.title || `Opinion ${index + 1}`}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      Filed: {opinion.date_filed ? new Date(opinion.date_filed).toLocaleDateString() : 'Unknown date'}
                    </p>
                    {opinion.plain_text && (
                      <p className="text-sm text-gray-700 line-clamp-3">
                        {opinion.plain_text.substring(0, 200)}...
                      </p>
                    )}
                  </div>
                ))
              ) : judgeData.enhancedProfile?.recentCases && judgeData.enhancedProfile.recentCases.length > 0 ? (
                judgeData.enhancedProfile.recentCases.slice(0, 3).map((case_: any, index) => (
                  <div key={case_.id} className="border-l-4 border-blue-500 pl-4">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {case_.title || `Case ${index + 1}`}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      Date: {case_.case_date ? new Date(case_.case_date).toLocaleDateString() : 'Unknown date'}
                    </p>
                    {case_.description && (
                      <p className="text-sm text-gray-700 line-clamp-3">
                        {case_.description.substring(0, 200)}...
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">
                  Recent case data is not available for this judge from the CourtListener API.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Additional Judge Information */}
        {(judgeData.education && judgeData.education.length > 0) || 
         (judgeData.abaRatings && judgeData.abaRatings.length > 0) ? (
          <div className="mt-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Additional Information
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Education */}
              {judgeData.education && judgeData.education.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Education
                  </h3>
                  <div className="space-y-3">
                    {judgeData.education.map((edu, index) => (
                      <div key={index} className="border-l-4 border-green-500 pl-4">
                        <h4 className="font-medium text-gray-900">
                          {edu.school_name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {edu.degree} {edu.degree_year ? `(${edu.degree_year})` : ''}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ABA Ratings */}
              {judgeData.abaRatings && judgeData.abaRatings.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    ABA Ratings
                  </h3>
                  <div className="space-y-3">
                    {judgeData.abaRatings.map((rating, index) => (
                      <div key={index} className="border-l-4 border-blue-500 pl-4">
                        <h4 className="font-medium text-gray-900">
                          Rating: {rating.rating}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {rating.date_created ? new Date(rating.date_created).toLocaleDateString() : 'Unknown date'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : null}

        {/* Featured Attorney Slots */}
        <div className="mt-8">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-1 text-center">
              Featured Attorney Slots -{" "}
              <span className="text-amber-700">PAID ADVERTISEMENTS</span>
            </h2>
            <p className="text-center text-gray-600 text-sm">
              Licensed attorneys advertising their services. Not endorsed by
              Judge Finder.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[0, 1, 2].map((slot) => {
              const attorney = attorneys[slot];

              if (attorney) {
                // Show actual attorney information
                return (
                  <div
                    key={slot}
                    className="border border-gray-200 bg-white rounded-lg p-6 text-center shadow-sm"
                  >
                    <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                      <svg
                        className="w-8 h-8 text-blue-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {attorney.name}
                    </h3>
                    {attorney.firmName && (
                      <p className="text-sm text-gray-600 mb-2">
                        {attorney.firmName}
                      </p>
                    )}
                    {attorney.practiceAreas &&
                      attorney.practiceAreas.length > 0 && (
                        <p className="text-xs text-gray-500 mb-3">
                          {attorney.practiceAreas.slice(0, 2).join(", ")}
                          {attorney.practiceAreas.length > 2 && "..."}
                        </p>
                      )}
                    <Button
                      variant="outline"
                      className="w-full border-blue-400 text-blue-700 hover:bg-blue-100"
                      onClick={() =>
                        (window.location.href = `mailto:${attorney.email}`)
                      }
                    >
                      Contact Attorney
                    </Button>
                  </div>
                );
              } else {
                // Show "Advertise Here" button
                return (
                  <div
                    key={slot}
                    className="border-2 border-dashed border-green-300 bg-green-50 rounded-lg p-6 text-center hover:border-green-400 transition-colors cursor-pointer"
                    onClick={handleAdvertiseClick}
                  >
                    <div className="text-green-700 mb-3">
                      <p className="font-semibold">Featured Attorney Slot</p>
                      <p className="text-sm">{tierPrice[judgeData.judge.fjc_id ? 'federal' : 'local']} monthly</p>
                      <p className="text-xs mt-1">Licensed attorneys only</p>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full border-green-400 text-green-700 hover:bg-green-100"
                    >
                      Advertise Here
                    </Button>
                  </div>
                );
              }
            })}
          </div>

          <div className="mt-6 space-y-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Are you an attorney?{" "}
                <a
                  href="/register"
                  className="text-blue-600 hover:text-blue-500 font-medium"
                >
                  Advertise your services here
                </a>
              </p>
            </div>

            {/* Concise Legal Notice */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <p className="text-xs text-gray-600 text-center">
                <strong>Legal Notice:</strong> Paid advertisements by licensed
                attorneys. Not endorsed by Judge Finder. We provide advertising
                space only - not a lawyer referral service.
                <a
                  href="/legal-disclosures"
                  className="text-blue-600 hover:text-blue-800 ml-1"
                >
                  Full disclosure
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* What to Expect */}
        <div className="mt-12 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            What to Expect in {formatJudgeName(judgeData.judge).split(" ").pop()}'s Courtroom
          </h3>
          <div className="prose prose-gray max-w-none text-sm">
            <p>
              {formatJudgeName(judgeData.judge)} has been serving in the {getCurrentPosition(judgeData.judge)?.court_name || 'Unknown Court'} for{" "}
              {getCurrentPosition(judgeData.judge)?.date_appointment ? 
                new Date(getCurrentPosition(judgeData.judge).date_appointment).getFullYear() - 
                new Date(getCurrentPosition(judgeData.judge).date_appointment).getFullYear() : 
                'N/A'} years and has handled many different types
              of cases. If you have a case before this judge, here's what you
              should know:
            </p>
            <div className="mt-4 space-y-3">
              <div className="flex items-start">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                  <p className="text-gray-700">
                    This judge was appointed by {getCurrentPosition(judgeData.judge)?.appointed_by || 'Unknown'}
                  </p>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <p className="text-gray-700">
                  They have experience with various case types including civil
                  disputes, criminal matters, and contract issues
                </p>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                <p className="text-gray-700">
                  Having an experienced attorney who knows this judge's
                  preferences can be very helpful for your case
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section for SEO */}
        <JudgeFAQ
          judgeName={formatJudgeName(judgeData.judge)}
          circuit={getCurrentPosition(judgeData.judge)?.court_name || 'Unknown Court'}
          tier={judgeData.judge.fjc_id ? 'federal' : 'local'}
        />
      </div>
    </div>
  );
}
