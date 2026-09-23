export type FormOption = {
  code: string;
  text: string;
  exclusive?: boolean;
  has_other?: boolean;
};

export type FormItem = {
  id: string;
  type: "single" | "multi" | "text";
  stem: string;
  note?: string;
  section?: string;
  section_lao?: string;
  options?: FormOption[];
  min_select?: number;
  max_select?: number;
  extra_text?: {
    required: boolean;
    placeholder: string;
  };
};

export type QuestionnaireForm = {
  meta: Record<string, unknown>;
  demographics: FormItem[];
  questions: FormItem[];
};

export type DraftAnswer = {
  option_codes: string[];
  other_text: string | null;
  extra_text: string | null;
  text_value: string | null;
};

export type DraftAnswers = Record<string, DraftAnswer>;
