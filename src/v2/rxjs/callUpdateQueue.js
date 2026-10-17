import { Subject } from "rxjs";

// RxJS Subject to manage queued priority, status, and estatus updates
export const statusPriorityUpdates$ = new Subject();

// Socket events that update call-log status fields without issuing another API request.
export const callLogStatusEvents$ = new Subject();

// RxJS Subject to manage real-time comment additions across workspaces smoothly
export const commentUpdates$ = new Subject();
