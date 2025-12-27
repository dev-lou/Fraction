export function buildSiweMessage(nonce: string) {
  return `Sign in to Fraction with nonce: ${nonce}`;
}
