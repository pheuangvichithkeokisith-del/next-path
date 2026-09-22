export type FeedbackAgreement = "yes" | "not_really" | "unsure";

export type FeedbackPayload = {
  agreement: FeedbackAgreement;
  incorrect_note: string | null;
  next_interest: string | null;
};
