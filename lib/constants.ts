export const LEAD_STATUSES = [
  "New",
  "Contacted",
  "Interested",
  "Not Interested",
  "Follow-up Required",
  "Follow-up",
  "Site Visit",
  "Qualified",
  "Proposal Sent",
  "Negotiation",
  "Converted (Won)",
  "Closed",
  "Lost",
] as const;

export const LEAD_PRIORITIES = ["Low", "Medium", "High"] as const;

export const TASK_STATUSES = [
  "Not Started",
  "To Do",
  "Pending",
  "In Progress",
  "In Review",
  "Blocked",
  "Completed",
  "Cancelled",
] as const;

export type TaskStatus = typeof TASK_STATUSES[number];
