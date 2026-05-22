export const ADMIN_EMAILS = [
  "maripellichodhitha@gmail.com",
  "chitikeshimahesh6@gmail.com",
];

export const isAdminEmail = (email?: string | null) => {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
};
