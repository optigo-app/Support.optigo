# Detailed Plan: Harden the Highest-Risk Product Master Modes

## Summary

The clearest production risks are in the CAD and order write paths, plus one list mode that writes data as a side effect. I’ll review and fix only confirmed problems in those paths, preserve existing successful API responses, and leave code that is already sound alone.

This is a code-based review. It identifies concrete hazards, but it cannot prove a query is slow or guarantee “100% optimization” without production-sized data, execution plans, and workload measurements.

## What’s Wrong and What We’ll Change

1. **`move_to_cad` and `create_pd_order` — duplicate IDs and partial records.** Both allocate JobNos by reading the current maximum and checking for an available number before inserting. Concurrent requests can pick the same number. The multi-step writes lack a clear encompassing transaction, so a failure can leave an order, CAD row, or attachments only partly created. Replace allocation with a concurrency-safe method compatible with current JobNo formats; make each operation atomic and safe to retry. See [move_to_cad](/E:/Rajan/module/ProductMaster/sql/pd_r50b3.sql:2385) and [create_pd_order](/E:/Rajan/module/ProductMaster/sql/pd_r50b3.sql:3116).

2. **`pd_order_list` — a read request modifies attachment ownership.** The mode updates orphaned attachments while building the list. It joins by JobNo and stage, which may not uniquely identify a CAD row. Move repair into a controlled write path or make ownership resolution unambiguous and protected. See [pd_order_list](/E:/Rajan/module/ProductMaster/sql/pd_r50b3.sql:4181).

3. **`update_cad` — material data can be deleted before replacement is known to be valid.** The mode deletes existing materials, then inserts replacements only when the supplied JSON is valid and nonempty. A missing or invalid payload can therefore result in no materials remaining. Define and implement distinct handling for “field omitted,” “explicitly clear,” and “valid replacement”; validate before deleting. Make CAD fields, designer, materials, and images part of one atomic update where intended. See [update_cad](/E:/Rajan/module/ProductMaster/sql/pd_r50b3.sql:6270), especially the delete/insert sequence around lines 6458–6475.

4. **Stage moves and version creation — check retries, source state, and concurrent numbering.** Review `move_to_sketch`, `move_to_design`, `pd_order_move_to`, `create_pd_order_version`, and `create_cad_version`. Some paths have transactions, but several read source rows or derive versions using `NOLOCK` and counts. Add source-state checks and duplicate/retry safeguards; make version assignment concurrency-safe. Keep intentional “copy one reference image” behavior unchanged. See [stage transitions](/E:/Rajan/module/ProductMaster/sql/pd_r50b3.sql:1317), [design transition](/E:/Rajan/module/ProductMaster/sql/pd_r50b3.sql:1528), and [version modes](/E:/Rajan/module/ProductMaster/sql/pd_r50b3.sql:3568).

5. **Album and research writes — prevent half-saved data.** Album create/update/share and research board save/delete operations touch multiple related tables without a clear transaction. Make each logical change atomic and validate JSON before any destructive step. Preserve existing album and research response fields. See [album modes](/E:/Rajan/module/ProductMaster/sql/pd_r50b3.sql:7289) and [research board modes](/E:/Rajan/module/ProductMaster/sql/pd_r50b3.sql:6788).

6. **Dynamic SQL and input validation — avoid unsafe SQL and silent bad values.** Audit dynamic database identifiers and values concatenated into SQL, parameterize request data, and quote validated database identifiers. Reject malformed JSON and invalid numeric/date values before writes instead of silently defaulting them to zero or skipping attachments. Preserve valid-call behavior and response shapes. `gettoken` is one visible example of request values concatenated into dynamic SQL: [gettoken](/E:/Rajan/module/ProductMaster/sql/pd_r50b3.sql:386).

7. **Performance — measure before tuning.** Benchmark `get_cad_materials`, `pd_order_list`, `sketch_list`, and `concept_list`. `get_cad_materials` has repeated correlated lookups for material names, and list modes use paginated, joined queries that may require expensive sorts or repeated work. Use actual plans and logical reads to decide whether to rewrite lookups, pagination, or indexes. Don’t add speculative indexes or change output ordering without confirming the interface depends on it. See [get_cad_materials](/E:/Rajan/module/ProductMaster/sql/pd_r50b3.sql:5793).

## Implementation and Acceptance Order

- **First:** Capture existing responses and representative performance measurements; confirm JobNo/version formats, retry behavior, and whether omitted versus empty materials have different meanings.
- **Next:** Fix JobNo/version concurrency and atomicity, the `pd_order_list` side effect, and `update_cad` material handling.
- **Then:** Harden remaining stage, album, and research writes; parameterize dynamic SQL and validate inputs.
- **Finally:** Tune only queries with measured bottlenecks and verify the gains against the baseline.

Acceptance requires existing valid callers to retain their mode names and response shapes; concurrent/retried operations must not create duplicate identifiers or partial records; invalid payloads must not silently delete or omit product data; and any performance change must show improvement under representative workload.

## Test Plan

- Test every affected mode with normal input and confirm existing success response shapes.
- Test omitted, empty, malformed, and valid material/attachment JSON; verify the intended preserve/clear/replace behavior and that failures do not partially write.
- Run concurrent and retry cases for JobNo allocation, stage moves, and version creation; check for duplicates, orphaned attachments, and incorrect source statuses.
- Inject failures between related writes in CAD, order, album, and research operations; confirm rollback and consistent error responses.
- Compare query plans, reads, and elapsed time before and after performance changes on representative data.

## Assumptions

- Compatibility is the priority for valid existing callers.
- Fix only verified defects in the named high-risk paths; don’t rewrite the entire procedure.
- Production schema, constraints, indexes, and execution plans must be checked before selecting the final JobNo strategy or adding indexes.
