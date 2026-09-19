import { Subject } from "rxjs";

// RxJS Subject to manage queued priority, status, and estatus updates
export const statusPriorityUpdates$ = new Subject();

// RxJS Subject to manage real-time comment additions across workspaces smoothly
export const commentUpdates$ = new Subject();
