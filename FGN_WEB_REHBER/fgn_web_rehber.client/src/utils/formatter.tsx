export default function formatPhoneNumber(rawPhone: string): string {
    if (!rawPhone || rawPhone.length !== 13 || !rawPhone.startsWith('+90')) return rawPhone;

    const cleaned = rawPhone.replace('+90', '0');
    return `${cleaned[0]} (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)} ${cleaned.slice(7, 9)} ${cleaned.slice(9)}`;
}