import { createClient } from "@supabase/supabase-js";
import {
  Judge,
  CourtListenerJudge,
  RulingTendency,
  RecentCase,
  User,
  AttorneyProfile,
  AttorneySubscription,
} from "@shared/database";

// Lazy initialization of Supabase client
let supabase: any = null;

function getSupabase() {
  if (!supabase) {
    const SUPABASE_URL = process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
    const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error("SUPABASE_URL and SUPABASE_ANON_KEY environment variables not set");
    }

    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return supabase;
}

export class DatabaseService {
  /**
   * Initialize the database with required tables
   */
  static async initializeDatabase() {
    try {
      // With Supabase, tables are already created via migrations
      // Just verify connection by testing a simple query
      const supabase = getSupabase();
      
      const { error } = await supabase
        .from('courtlistener_judges')
        .select('id')
        .limit(1);

      if (error) {
        console.error("Error connecting to Supabase:", error);
        throw error;
      }

      console.log("Database connection verified successfully");
    } catch (error) {
      console.error("Error initializing database:", error);
      throw error;
    }
  }

  /**
   * Seed the database with sample data
   */
  static async seedDatabase() {
    try {
      const supabase = getSupabase();

      // Insert sample judges
      const { data: judges, error: judgesError } = await supabase
        .from('judges')
        .upsert([
          { name: 'Hon. Marcus Thorne', circuit: 'Northern Circuit', tier: 'state', appointed_by: 'President Thompson', years_of_service: 8, alma_mater: 'Harvard Law School' },
          { name: 'Hon. Evelyn Reed', circuit: 'Federal District Court', tier: 'federal', appointed_by: 'President Williams', years_of_service: 12, alma_mater: 'Yale Law School' },
          { name: 'Hon. James Cooper', circuit: 'City Municipal Court', tier: 'local', appointed_by: 'Mayor Johnson', years_of_service: 5, alma_mater: 'Stanford Law School' }
        ], { onConflict: 'name' })
        .select('id, name');

      if (judgesError) {
        console.error('Error inserting judges:', judgesError);
        throw judgesError;
      }

      const thorneJudge = (judges || []).find((j: any) => j.name === "Hon. Marcus Thorne");

      if (thorneJudge) {
        // Insert ruling tendencies
        const tendencies = [
          { judge_id: thorneJudge.id, category: "Civil Procedure", percentage: 60, plaintiff_leans: true },
          { judge_id: thorneJudge.id, category: "Criminal Sentencing", percentage: 80, plaintiff_leans: true },
          { judge_id: thorneJudge.id, category: "Evidence Admissibility", percentage: 50, plaintiff_leans: true },
          { judge_id: thorneJudge.id, category: "Contract Disputes", percentage: 70, plaintiff_leans: true }
        ];

        const { error: tendenciesError } = await supabase
          .from('ruling_tendencies')
          .upsert(tendencies, { onConflict: 'judge_id,category' });

        if (tendenciesError) {
          console.error('Error inserting ruling tendencies:', tendenciesError);
        }

        // Insert recent cases
        const cases = [
          { judge_id: thorneJudge.id, title: 'Global Shipping v. Harbor Imports', case_date: '2023-11-05', description: 'Granted summary judgment for the defendant in a breach of contract case.' },
          { judge_id: thorneJudge.id, title: 'US v. Chen', case_date: '2023-10-18', description: 'Sentenced defendant to the lower end of the guideline range.' },
          { judge_id: thorneJudge.id, title: 'Startup X v. Conglomerate Y', case_date: '2023-10-02', description: 'Denied motion to dismiss trade secret misappropriation claim.' }
        ];

        const { error: casesError } = await supabase
          .from('recent_cases')
          .upsert(cases);

        if (casesError) {
          console.error('Error inserting recent cases:', casesError);
        }
      }

      console.log("Database seeded successfully");
    } catch (error) {
      console.error("Failed to seed database:", error);
      throw error;
    }
  }

  /**
   * Search judges by name
   */
  static async searchJudges(searchTerm: string): Promise<Judge[]> {
    try {
      const supabase = getSupabase();
      
      const { data: judges, error } = await supabase
        .from('judges')
        .select('*')
        .ilike('name', `%${searchTerm}%`)
        .order('name', { ascending: true })
        .limit(20);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      return (judges || []).map((judge: any) => ({
        id: judge.id,
        name: judge.name,
        circuit: judge.circuit,
        tier: judge.tier,
        appointedBy: judge.appointed_by,
        yearsOfService: judge.years_of_service,
        almaMater: judge.alma_mater,
        createdAt: judge.created_at,
        updatedAt: judge.updated_at
      }));
    } catch (error) {
      console.error('Error searching judges:', error);
      throw error;
    }
  }

  /**
   * Search CourtListener judges by name
   */
  static async searchCourtListenerJudges(searchTerm: string): Promise<CourtListenerJudge[]> {
    try {
      const supabase = getSupabase();
      
      // Split search term into words for better matching
      const searchWords = searchTerm.trim().split(/\s+/).filter(word => word.length > 0);
      
      let query = supabase
        .from('courtlistener_judges')
        .select('*');
      
      if (searchWords.length > 1) {
        // For multi-word searches, try to match first and last names
        const firstName = searchWords[0];
        const lastName = searchWords[searchWords.length - 1];
        
        query = query.or(`name_first.ilike.%${firstName}%,name_last.ilike.%${lastName}%,name_first.ilike.%${searchTerm}%,name_last.ilike.%${searchTerm}%`);
      } else {
        // For single word searches, search all name fields
        query = query.or(`name_first.ilike.%${searchTerm}%,name_last.ilike.%${searchTerm}%,name_middle.ilike.%${searchTerm}%`);
      }
      
      const { data: judges, error } = await query
        .order('name_last', { ascending: true })
        .order('name_first', { ascending: true })
        .limit(20);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      return (judges || []).map((judge: any) => ({
        id: judge.id,
        dateCreated: judge.date_created,
        dateModified: judge.date_modified,
        dateCompleted: judge.date_completed,
        fjcId: judge.fjc_id,
        slug: judge.slug,
        nameFirst: judge.name_first,
        nameMiddle: judge.name_middle,
        nameLast: judge.name_last,
        nameSuffix: judge.name_suffix,
        dateDob: judge.date_dob,
        dateGranularityDob: judge.date_granularity_dob,
        dateDod: judge.date_dod,
        dateGranularityDod: judge.date_granularity_dod,
        dobCity: judge.dob_city,
        dobState: judge.dob_state,
        dobCountry: judge.dob_country,
        dodCity: judge.dod_city,
        dodState: judge.dod_state,
        dodCountry: judge.dod_country,
        gender: judge.gender,
        religion: judge.religion,
        ftmTotalReceived: judge.ftm_total_received,
        ftmEid: judge.ftm_eid,
        hasPhoto: judge.has_photo,
        isAliasOfId: judge.is_alias_of_id,
        createdAt: judge.created_at,
        updatedAt: judge.updated_at
      }));
    } catch (error) {
      console.error('Error searching CourtListener judges:', error);
      throw error;
    }
  }

  /**
   * Get CourtListener judge by ID
   */
  static async getCourtListenerJudgeById(judgeId: number): Promise<CourtListenerJudge | null> {
    try {
      const supabase = getSupabase();
      
      const { data: judge, error } = await supabase
        .from('courtlistener_judges')
        .select('*')
        .eq('id', judgeId)
        .single();

      if (error) {
        console.error('Supabase error:', error);
        return null;
      }

      if (!judge) return null;

      return {
        id: judge.id,
        dateCreated: judge.date_created,
        dateModified: judge.date_modified,
        dateCompleted: judge.date_completed,
        fjcId: judge.fjc_id,
        slug: judge.slug,
        nameFirst: judge.name_first,
        nameMiddle: judge.name_middle,
        nameLast: judge.name_last,
        nameSuffix: judge.name_suffix,
        dateDob: judge.date_dob,
        dateGranularityDob: judge.date_granularity_dob,
        dateDod: judge.date_dod,
        dateGranularityDod: judge.date_granularity_dod,
        dobCity: judge.dob_city,
        dobState: judge.dob_state,
        dobCountry: judge.dob_country,
        dodCity: judge.dod_city,
        dodState: judge.dod_state,
        dodCountry: judge.dod_country,
        gender: judge.gender,
        religion: judge.religion,
        ftmTotalReceived: judge.ftm_total_received,
        ftmEid: judge.ftm_eid,
        hasPhoto: judge.has_photo,
        isAliasOfId: judge.is_alias_of_id,
        createdAt: judge.created_at,
        updatedAt: judge.updated_at
      };
    } catch (error) {
      console.error('Error getting CourtListener judge by ID:', error);
      return null;
    }
  }

  /**
   * Insert or update CourtListener judge data
   */
  static async upsertCourtListenerJudge(judgeData: Partial<CourtListenerJudge>): Promise<void> {
    try {
      const supabase = getSupabase();
      
      const { error } = await supabase
        .from('courtlistener_judges')
        .upsert({
          id: judgeData.id,
          date_created: judgeData.dateCreated,
          date_modified: judgeData.dateModified,
          date_completed: judgeData.dateCompleted,
          fjc_id: judgeData.fjcId,
          slug: judgeData.slug,
          name_first: judgeData.nameFirst,
          name_middle: judgeData.nameMiddle,
          name_last: judgeData.nameLast,
          name_suffix: judgeData.nameSuffix,
          date_dob: judgeData.dateDob,
          date_granularity_dob: judgeData.dateGranularityDob,
          date_dod: judgeData.dateDod,
          date_granularity_dod: judgeData.dateGranularityDod,
          dob_city: judgeData.dobCity,
          dob_state: judgeData.dobState,
          dob_country: judgeData.dobCountry,
          dod_city: judgeData.dodCity,
          dod_state: judgeData.dodState,
          dod_country: judgeData.dodCountry,
          gender: judgeData.gender,
          religion: judgeData.religion,
          ftm_total_received: judgeData.ftmTotalReceived,
          ftm_eid: judgeData.ftmEid,
          has_photo: judgeData.hasPhoto,
          is_alias_of_id: judgeData.isAliasOfId,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        });

      if (error) {
        console.error('Supabase upsert error:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error upserting CourtListener judge:', error);
      throw error;
    }
  }

  /**
   * Get judge by ID with ruling tendencies and recent cases
   */
  static async getJudgeById(judgeId: number) {
    try {
      const supabase = getSupabase();
      
      // Get judge
      const { data: judge, error: judgeError } = await supabase
        .from('judges')
        .select('*')
        .eq('id', judgeId)
        .single();

      if (judgeError || !judge) return null;

      // Get ruling tendencies
      const { data: rulingTendencies, error: tendenciesError } = await supabase
        .from('ruling_tendencies')
        .select('*')
        .eq('judge_id', judgeId)
        .order('category', { ascending: true });

      // Get recent cases
      const { data: recentCases, error: casesError } = await supabase
        .from('recent_cases')
        .select('*')
        .eq('judge_id', judgeId)
        .order('case_date', { ascending: false })
        .limit(3);

      return {
        ...judge,
        rulingTendencies: rulingTendencies || [],
        recentCases: recentCases || []
      };
    } catch (error) {
      console.error('Error getting judge by ID:', error);
      return null;
    }
  }

  /**
   * Get judge by name with ruling tendencies and recent cases
   */
  static async getJudgeByName(name: string) {
    try {
      const supabase = getSupabase();
      
      // Get judge
      const { data: judge, error: judgeError } = await supabase
        .from('judges')
        .select('*')
        .ilike('name', name)
        .single();

      if (judgeError || !judge) return null;

      // Get ruling tendencies
      const { data: rulingTendencies, error: tendenciesError } = await supabase
        .from('ruling_tendencies')
        .select('*')
        .eq('judge_id', judge.id)
        .order('category', { ascending: true });

      // Get recent cases
      const { data: recentCases, error: casesError } = await supabase
        .from('recent_cases')
        .select('*')
        .eq('judge_id', judge.id)
        .order('case_date', { ascending: false })
        .limit(3);

      return {
        ...judge,
        rulingTendencies: rulingTendencies || [],
        recentCases: recentCases || []
      };
    } catch (error) {
      console.error('Error getting judge by name:', error);
      return null;
    }
  }

  /**
   * Create a new user
   */
  static async createUser(
    email: string,
    name: string,
    userType: "attorney" | "admin" = "attorney",
  ): Promise<User> {
    try {
      const supabase = getSupabase();
      
      const { data: user, error } = await supabase
        .from('users')
        .insert({
          email,
          name,
          user_type: userType
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      return user as User;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  /**
   * Get user by email
   */
  static async getUserByEmail(email: string): Promise<User | null> {
    try {
      const supabase = getSupabase();
      
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error) {
        console.error('Supabase error:', error);
        return null;
      }

      return user as User;
    } catch (error) {
      console.error('Error getting user by email:', error);
      return null;
    }
  }

  /**
   * Create attorney profile
   */
  static async createAttorneyProfile(
    userId: number,
    firmName?: string,
    practiceAreas: string[] = [],
    barNumber?: string,
  ): Promise<AttorneyProfile> {
    try {
      const supabase = getSupabase();
      
      const { data: profile, error } = await supabase
        .from('attorney_profiles')
        .insert({
          user_id: userId,
          firm_name: firmName,
          practice_areas: practiceAreas,
          bar_number: barNumber
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      return profile as AttorneyProfile;
    } catch (error) {
      console.error('Error creating attorney profile:', error);
      throw error;
    }
  }

  /**
   * Create attorney subscription
   */
  static async createAttorneySubscription(
    userId: number,
    judgeId: number,
    tier: "federal" | "state" | "local",
    stripeSubscriptionId: string,
    stripeCustomerId: string,
    currentPeriodStart: Date,
    currentPeriodEnd: Date,
  ): Promise<AttorneySubscription> {
    try {
      const supabase = getSupabase();
      
      const { data: subscription, error } = await supabase
        .from('attorney_subscriptions')
        .insert({
          user_id: userId,
          judge_id: judgeId,
          tier,
          stripe_subscription_id: stripeSubscriptionId,
          stripe_customer_id: stripeCustomerId,
          current_period_start: currentPeriodStart.toISOString(),
          current_period_end: currentPeriodEnd.toISOString(),
          status: 'active'
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      return subscription as AttorneySubscription;
    } catch (error) {
      console.error('Error creating attorney subscription:', error);
      throw error;
    }
  }

  /**
   * Get attorney subscriptions
   */
  static async getAttorneySubscriptions(userId: number): Promise<any[]> {
    try {
      const supabase = getSupabase();
      
      const { data: subscriptions, error } = await supabase
        .from('attorney_subscriptions')
        .select(`
          *,
          judges!inner(name, circuit, tier),
          users!inner(name, email),
          attorney_profiles(firm_name, practice_areas)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      return (subscriptions || []).map((sub: any) => ({
        ...sub,
        judge_name: sub.judges?.name,
        judge_circuit: sub.judges?.circuit,
        judge_tier: sub.judges?.tier,
        attorney_name: sub.users?.name,
        attorney_email: sub.users?.email,
        firm_name: sub.attorney_profiles?.firm_name,
        practice_areas: sub.attorney_profiles?.practice_areas
      }));
    } catch (error) {
      console.error('Error getting attorney subscriptions:', error);
      throw error;
    }
  }

  /**
   * Get attorneys for a specific judge
   */
  static async getAttorneysForJudge(judgeId: number): Promise<any[]> {
    try {
      const supabase = getSupabase();
      
      const { data: attorneys, error } = await supabase
        .from('attorney_subscriptions')
        .select(`
          *,
          users!inner(name, email),
          attorney_profiles(firm_name, practice_areas, bar_number)
        `)
        .eq('judge_id', judgeId)
        .or('status.eq.active,status.eq.canceled')
        .order('created_at', { ascending: true })
        .limit(3);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      // Filter out canceled subscriptions that have expired
      const now = new Date();
      return (attorneys || []).filter((attorney: any) => {
        if (attorney.status === 'active') return true;
        if (attorney.status === 'canceled') {
          return new Date(attorney.current_period_end) > now;
        }
        return false;
      }).map((attorney: any) => ({
        ...attorney,
        attorney_name: attorney.users?.name,
        attorney_email: attorney.users?.email,
        firm_name: attorney.attorney_profiles?.firm_name,
        practice_areas: attorney.attorney_profiles?.practice_areas,
        bar_number: attorney.attorney_profiles?.bar_number
      }));
    } catch (error) {
      console.error('Error getting attorneys for judge:', error);
      throw error;
    }
  }

  /**
   * Update subscription status
   */
  static async updateSubscriptionStatus(
    stripeSubscriptionId: string,
    status: "active" | "canceled" | "past_due" | "unpaid",
    currentPeriodStart?: Date,
    currentPeriodEnd?: Date,
  ): Promise<void> {
    try {
      const supabase = getSupabase();
      
      const updateData: any = {
        status,
        updated_at: new Date().toISOString()
      };

      if (currentPeriodStart && currentPeriodEnd) {
        updateData.current_period_start = currentPeriodStart.toISOString();
        updateData.current_period_end = currentPeriodEnd.toISOString();
      }

      const { error } = await supabase
        .from('attorney_subscriptions')
        .update(updateData)
        .eq('stripe_subscription_id', stripeSubscriptionId);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error updating subscription status:', error);
      throw error;
    }
  }

  /**
   * Check if subscription is still active
   */
  static async isSubscriptionStillActive(
    userId: number,
    judgeId: number,
  ): Promise<boolean> {
    try {
      const supabase = getSupabase();

      const { data: subscription, error } = await supabase
        .from('attorney_subscriptions')
        .select('status, current_period_end')
        .eq('user_id', userId)
        .eq('judge_id', judgeId)
        .limit(1)
        .single();

      if (error || !subscription) return false;

      // If status is active, it's definitely active
      if (subscription.status === 'active') return true;

      // If status is canceled, check if the period hasn't ended yet
      if (subscription.status === 'canceled') {
        const now = new Date();
        const periodEnd = new Date(subscription.current_period_end);
        return periodEnd > now;
      }

      return false;
    } catch (error) {
      console.error('Error checking subscription status:', error);
      return false;
    }
  }

  /**
   * Get subscription by Stripe ID
   */
  static async getSubscriptionByStripeId(
    stripeSubscriptionId: string,
  ): Promise<AttorneySubscription | null> {
    try {
      const supabase = getSupabase();
      
      const { data: subscription, error } = await supabase
        .from('attorney_subscriptions')
        .select('*')
        .eq('stripe_subscription_id', stripeSubscriptionId)
        .single();

      if (error) {
        console.error('Supabase error:', error);
        return null;
      }

      return subscription as AttorneySubscription;
    } catch (error) {
      console.error('Error getting subscription by Stripe ID:', error);
      return null;
    }
  }

  /**
   * Delete subscription
   */
  static async deleteSubscription(stripeSubscriptionId: string): Promise<void> {
    try {
      const supabase = getSupabase();
      
      const { error } = await supabase
        .from('attorney_subscriptions')
        .delete()
        .eq('stripe_subscription_id', stripeSubscriptionId);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error deleting subscription:', error);
      throw error;
    }
  }
}

