export type ActionCategory = "On-Page" | "Local-GBP" | "Content-Gap" | "Technical";

export type ActionPriority = "URGENT" | "HIGH" | "MEDIUM" | "LOW";

export type ActionImpact = "HIGH" | "MEDIUM" | "LOW";

export type ActionEffort = "EASY" | "MODERATE" | "HARD";

export interface ActionItem {
  id: string;
  category: ActionCategory;
  title: string;
  problem: string;
  solution_guide: string;
  impact: ActionImpact;
  effort: ActionEffort;
  priority: ActionPriority;
  is_completed: boolean;
  suggested_fix?: string;
  competitor_benchmark?: Record<string, any>;
  completed_at?: string | null;
}

export interface CompetitorReviewItem {
  author: string;
  rating: number;
  date: string;
  text: string;
  sentiment?: "positive" | "neutral" | "negative";
  category?: string;
  owner_response?: string;
  highlight?: string;
}

export interface CompetitorMetric {
  domain: string;
  title?: string;
  rank_position: number;
  is_target: boolean;
  gbp_rating: number;
  gbp_review_count: number;
  speed_mobile_score: number;
  speed_desktop_score: number;
  has_schema: boolean;
  schema_types: string[];
  word_count: number;
  domain_authority?: number; // 0-100 DA / PR score
  domain_age_years?: number; // Domain creation age
  indexed_pages?: number; // Estimated Google index count
  reviews?: CompetitorReviewItem[];
}

export interface KeywordGapItem {
  keyword: string;
  competitor_frequency: number;
  target_frequency: number;
  priority: "URGENT" | "HIGH" | "MEDIUM";
  recommendation: string;
}

export interface MissingKeywordsGuide {
  industry: string;
  recommended_keywords: {
    keyword: string;
    monthly_searches: string;
    importance: string;
    target_placement: string;
  }[];
  implementation_tips: {
    title_example: string;
    h1_example: string;
    meta_example: string;
    content_guide: string;
  };
}

export interface MapsAuditCheck {
  id: string;
  category: "PIN_LOCATION" | "CATEGORIES" | "HOURS" | "PHOTOS" | "PRODUCTS" | "POSTS" | "CONTACT";
  title: string;
  status: "pass" | "warning" | "fail";
  status_label: string;
  description: string;
  action_needed: string;
  impact: "Çok Yüksek" | "Yüksek" | "Orta";
}

export interface GoogleMapsAudit {
  score: number; // 0 - 100
  pin_registered: boolean;
  pin_status_label: string;
  is_verified: boolean;
  total_checks: number;
  passed_checks: number;
  failed_checks: number;
  checks: MapsAuditCheck[];
  pin_service_guide: {
    step: number;
    title: string;
    description: string;
  }[];
}

export interface SummaryMetrics {
  current_rank: number;
  target_rank: number;
  gbp_score: number; // 0-100
  total_actions: number;
  completed_actions: number;
  company_name: string;
  target_domain: string;
  target_keyword: string;
  location: string;
  domain_authority?: number;
  logo_url?: string;
  phone?: string;
  address?: string;
  has_whatsapp?: boolean;
  has_quote_form?: boolean;
  has_file_upload?: boolean;
  serp_page_label?: string;
}

export interface KeywordRankingItem {
  keyword: string;
  rank_position: number;
  page_number: number;
  search_volume: string;
  difficulty: "Kolay" | "Orta" | "Zor";
  status: "Sıralamada" | "Fırsat" | "Eksik İçerik";
  url_path: string;
}

export interface DashboardData {
  summary: SummaryMetrics;
  competitors: CompetitorMetric[];
  actions: ActionItem[];
  keyword_gaps?: KeywordGapItem[];
  keyword_rankings?: KeywordRankingItem[];
  missing_keywords_guide?: MissingKeywordsGuide;
  maps_audit?: GoogleMapsAudit;
}

