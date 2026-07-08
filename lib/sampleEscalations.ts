import { TaskPriority, TaskSource } from "./types";

// ---------------------------------------------------------------------------
// SIMULATED INGESTION
// In production, this is where the real integrations plug in:
//   - Gmail API push notifications / periodic polling of a shared label
//   - Slack Events API subscription on escalation channels
//   - Google Sheets API polling of the escalation tracker sheet
// Each of those would produce the same shape of record and flow through the
// exact same insert pipeline used below.
// ---------------------------------------------------------------------------

export interface SampleEscalation {
  title: string;
  description: string;
  raw_content: string;
  bucket: string;
  source: TaskSource;
  source_link: string;
  priority: TaskPriority;
  hoursAgo: number;
}

export const SAMPLE_ESCALATIONS: SampleEscalation[] = [
  {
    title: "Non-OTP delivery spike — DH cluster, Lucknow zone",
    description:
      "Multiple buyers report orders marked delivered without OTP. Carrier has shared POD but OTP generation source unclear. Needs owner + carrier follow-up.",
    raw_content:
      "#ct-escalations @channel Seeing 14 new non-OTP delivered complaints today for DH in Lucknow zone. Buyers claim no OTP was shared. DH has defended 9 cases with POD+OTP proof. Need someone from CT to own the RCA thread. https://meesho.slack.com/archives/C0EXAMPLE/p1720", 
    bucket: "Ops Escalation",
    source: "slack",
    source_link: "https://meesho.slack.com/archives/C0EXAMPLE/p1720",
    priority: "high",
    hoursAgo: 6,
  },
  {
    title: "Invoice mismatch — XB freight bill June vs system",
    description:
      "XB June freight invoice is 4.2% above system-computed amount. Finance needs reconciliation and dispute note before payment cycle closes.",
    raw_content:
      "From: finance-ops@meesho.com\nSubject: XB June freight invoice mismatch — action needed\n\nTeam, XB has raised invoice INV-2026-0630 which is 4.2% higher than the system computed freight. Please reconcile shipment-level and raise dispute note by EOW.",
    bucket: "Invoice",
    source: "gmail",
    source_link: "",
    priority: "medium",
    hoursAgo: 30,
  },
  {
    title: "Debit note recovery pending — SFX weight disputes Q1",
    description:
      "SFX has not acknowledged debit notes for Q1 weight disputes worth a significant amount. Recovery ageing beyond 45 days.",
    raw_content:
      "From: carrier-finance@meesho.com\nSubject: URGENT: SFX debit note recovery ageing 45+ days\n\nSFX has not acknowledged DN-1121 to DN-1138 raised against Q1 weight disputes. Recovery is ageing beyond 45 days. Need CT to escalate with SFX account manager immediately.",
    bucket: "Debit",
    source: "gmail",
    source_link: "",
    priority: "high",
    hoursAgo: 52,
  },
  {
    title: "CEO escalation — seller complaint on wrongful RTO deduction",
    description:
      "Seller complaint forwarded from CEO office regarding wrongful RTO deduction on 23 orders. Needs same-day response with findings.",
    raw_content:
      "From: ceo-office@meesho.com\nSubject: Fwd: Seller complaint — wrongful RTO deduction (CEO escalation)\n\nForwarding seller complaint received on CEO desk. Seller claims 23 orders were wrongly marked RTO and deducted. Need findings and response draft TODAY.",
    bucket: "CEO Escalation",
    source: "gmail",
    source_link: "",
    priority: "critical",
    hoursAgo: 3,
  },
  {
    title: "G-sheet row #47 — dual scan mismatch pending 5 days",
    description:
      "Escalation tracker sheet row 47: dual scan mismatch dispute raised by hub ops, unassigned for 5 days. Sheet status column still blank.",
    raw_content:
      "Escalation tracker sheet (Disputes 2026) row 47: Dual Scan Mismatch — AWB 78911223344 — raised by hub ops on 03-Jul — status blank — no owner. https://docs.google.com/spreadsheets/d/EXAMPLE/edit#gid=0&range=A47",
    bucket: "Other",
    source: "gsheet",
    source_link: "https://docs.google.com/spreadsheets/d/EXAMPLE/edit#gid=0&range=A47",
    priority: "medium",
    hoursAgo: 120,
  },
];
