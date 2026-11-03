/** The one registrar every register link on the site goes to. */
export function registerUrl(domain: string): string {
  return `https://porkbun.com/checkout/search?${new URLSearchParams({ q: domain })}`;
}
