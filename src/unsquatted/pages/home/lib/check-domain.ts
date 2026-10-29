import {
  dohVerdict,
  parseBootstrap,
  rdapVerdict,
  type Verdict,
} from './lookup';

const BOOTSTRAP_URL = 'https://data.iana.org/rdap/dns.json';

const DOH_URL = 'https://dns.google/resolve';

async function loadServers() {
  const response = await fetch(BOOTSTRAP_URL);

  return parseBootstrap(await response.json());
}

/** Fetched once per page view, by whichever lookup asks first. */
let servers: Promise<ReadonlyMap<string, string>> | undefined;

async function rdapServers() {
  servers ??= loadServers();

  return servers;
}

/**
 * The registry's answer, or `undefined` where the registry refuses a browser
 * outright — no CORS headers, as DENIC's — which rejects the fetch itself.
 * That refusal is the one error dropped here, since it is what sends the
 * lookup on to DNS; an answer the registry does give is final.
 */
async function rdapLookup(url: string): Promise<Verdict | undefined> {
  let response: Response;

  try {
    response = await fetch(url, {
      headers: { Accept: 'application/rdap+json' },
    });
  } catch {
    return;
  }

  return rdapVerdict(
    response.status,
    response.ok ? await response.json() : undefined,
  );
}

/** The registry's word where its RDAP answers a browser, DNS's hint where it does not. */
export async function checkDomain(domain: string): Promise<Verdict> {
  const zone = domain.slice(domain.lastIndexOf('.') + 1);
  const base = (await rdapServers()).get(zone);
  const registry =
    base === undefined
      ? undefined
      : await rdapLookup(`${base}domain/${domain}`);

  if (registry !== undefined) return registry;

  const url = `${DOH_URL}?${new URLSearchParams({ name: domain, type: 'NS' })}`;
  const response = await fetch(url);

  return dohVerdict(await response.json());
}
