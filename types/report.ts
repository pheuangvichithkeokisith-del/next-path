export type ReportPattern = {
  section: string;
  pattern_id: string;
  label_lao: string;
  is_sample: boolean;
};

export type ReportPath = {
  group_id: string;
  label_lao: string;
  is_sample: boolean;
  classification?: "strong_fit" | "good_to_explore" | "try_first" | "explore" | string;
  fit_score?: number | null;
  feasibility_score?: number | null;
  compatibility_score?: number | null;
  evidence_question_ids?: string[];
  reasons_lao?: string[];
  conditions_lao?: string[];
};

export type ReportAnswer = {
  question_id: string;
  option_codes: string[];
  other_text: string | null;
  extra_text: string | null;
  text_value: string | null;
};

export type ReportScoreDetails = {
  scores: Record<string, number>;
  positive_scores: Record<string, number>;
  negative_penalty: Record<string, number>;
  section_scores: Record<string, Record<string, number>>;
  section_coverage: Record<string, number>;
  correlations: Record<string, number>;
  r_max: number | null;
};

export type ReportContextFactors = {
  age_band: string | null;
  province_code: string | null;
  has_constraints: boolean;
  constraints?: string[];
  mobility?: string[];
  family_context?: string[];
  risk_willingness?: number | null;
  safety_readiness?: number | null;
};

export type ReportResponse = {
  response_pattern: ReportPattern[];
  possible_paths: ReportPath[];
  answers: ReportAnswer[];
  context_factors: ReportContextFactors;
  score_details: ReportScoreDetails | null;
  unknowns: string[];
  versions: {
    ds: string;
    enc: string;
    form: string;
  };
  summary_text: string;
  template_id: string;
  ai_version: string;
};
