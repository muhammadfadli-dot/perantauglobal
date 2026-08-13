/**
 * Paginate past PostgREST's 1000-row cap for full-table fetches. Without this,
 * admin KPIs/queues silently plateau once a table crosses 1000 rows (apps ~973,
 * candidates ~908, pending_submissions already over).
 *
 * Pass a runner that applies `.range(from, to)` to your query.
 *
 * THROWS on a query error, deliberately. The previous version destructured only
 * `{ data }` and dropped `error` on the floor: a failed query returned
 * `data: null`, which became an empty batch, which ended the loop, which
 * returned `[]`. The caller could not tell "nothing matched" from "the query
 * blew up", so a broken query rendered as a confident zero.
 *
 * That is exactly how the 12 Agu 2026 breakage hid. When
 * `application_readiness_view` started raising 22023 on legacy answers
 * (migration 0122), /admin/applications showed a red error because it checks
 * `listRes.error` itself, but /admin/candidates and /admin/positions just
 * reported "0 qualified" and "0 ready" with no warning at all. A page that
 * shouts is a bug report; a page that quietly reads zero is a wrong decision.
 *
 * (admin)/error.tsx catches the throw, so the failure surfaces as an error
 * screen instead of a plausible-looking number.
 */
type PagedResult<T> = { data: T[] | null; error?: { message: string } | null };

export async function fetchAllRows<T>(
  run: (from: number, to: number) => PromiseLike<PagedResult<T>>,
  label = "fetchAllRows",
): Promise<T[]> {
  const out: T[] = [];
  for (let f = 0; ; f += 1000) {
    const { data, error } = await run(f, f + 999);
    if (error) {
      throw new Error(`${label}: query gagal pada baris ${f}: ${error.message}`);
    }
    const batch = data ?? [];
    out.push(...batch);
    if (batch.length < 1000) break;
  }
  return out;
}
