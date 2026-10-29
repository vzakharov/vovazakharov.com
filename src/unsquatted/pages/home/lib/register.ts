/**
 * Where a free name is registered. One registrar for every link, so changing
 * it — or adding a referral code once one exists — is this one function.
 */
export function registerUrl(domain: string): string {
  return `https://porkbun.com/checkout/search?${new URLSearchParams({ q: domain })}`;
}
