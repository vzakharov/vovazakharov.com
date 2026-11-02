import { withCause } from './error-class';

/** The error a fetch fails with, its class naming what was being fetched. */
export type FetchFailure = new (
  message: string,
  options?: ErrorOptions,
) => Error;

/**
 * `fetch`, rejecting with `Failure` both where no answer comes and where the
 * answer is outside 2xx — which `fetch` itself resolves with.
 */
export async function fetchOk(
  url: string,
  Failure: FetchFailure,
  init?: RequestInit,
): Promise<Response> {
  let response: Response;

  try {
    response = await fetch(url, init);
  } catch (error) {
    throw new Failure(`${url} did not answer`, withCause(error));
  }

  if (!response.ok) {
    throw new Failure(`${url} answered ${response.status}`);
  }

  return response;
}
