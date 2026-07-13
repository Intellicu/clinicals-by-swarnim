/**
 * Clinic letterhead / prescription-form template — customises the header and
 * footer of printed reports and exported PDFs. Stored on this device.
 */
const KEY = "clinic_letterhead_v1";

export const DEFAULT_LETTERHEAD = {
  clinic_name: "",
  doctor_name: "",
  qualifications: "",
  reg_number: "",
  address: "",
  phone: "",
  email: "",
  footer_note: "",
};

export function getLetterhead() {
  try {
    return { ...DEFAULT_LETTERHEAD, ...JSON.parse(localStorage.getItem(KEY) || "{}") };
  } catch {
    return { ...DEFAULT_LETTERHEAD };
  }
}

export function saveLetterhead(lh) {
  localStorage.setItem(KEY, JSON.stringify({ ...DEFAULT_LETTERHEAD, ...lh }));
}