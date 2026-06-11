/**
 * Paginate past PostgREST's 1000-row cap for full-table fetches. Without this,
 * admin KPIs/queues silently plateau once a table crosses 1000 rows (apps ~973,
 * candidates ~908, pending_submissions already over).
 *
 * Pass a runner that applies `.range(from, to)` to your query.
 */
export async function fetchAllRows<T>(
  run: (from: number, to: number) => PromiseLike<{ data: T[] | null }>,
): Promise<T[]> {
  const out: T[] = [];
  for (let f = 0; ; f += 1000) {
    const { data } = await run(f, f + 999);
    const batch = data ?? [];
    out.push(...batch);
    if (batch.length < 1000) break;
  }
  return out;
}
