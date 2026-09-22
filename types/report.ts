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
};

export type ReportResponse = {
  response_pattern: ReportPattern[];
  possible_paths: ReportPath[];
  context_factors: {
    age_band: string | null;
    province_code: string | null;
    has_constraints: boolean;
  };
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
