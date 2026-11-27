/** "+919876543210" → "+91 98765 43210". Other numbers are shown as stored. */
export function formatPhone(phone: string | null): string | null {
  const indian = phone?.match(/^\+91(\d{5})(\d{5})$/);
  return indian ? `+91 ${indian[1]} ${indian[2]}` : phone;
}
