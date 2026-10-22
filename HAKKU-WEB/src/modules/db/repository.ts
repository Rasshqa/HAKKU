import crypto from "crypto";
import {
  CreateCaseInput,
  SavedCaseDetails,
  CaseRecord,
  CaseIntakeRecord,
  CaseEvaluationRecord,
  CaseChecklistRecord,
} from "./types";
import { getReferralsByCategory } from "../referral/directory";
import { CaseCategory } from "../intake/types";
import { getDatabasePool } from "./client";

import { generateCaseCode } from "@/lib/formatters";
export { generateCaseCode };

export interface CaseRepository {
  createCase(input: CreateCaseInput): Promise<SavedCaseDetails>;
  getCaseByCode(code: string): Promise<SavedCaseDetails | null>;
  getCaseById(id: string): Promise<SavedCaseDetails | null>;
  listCases(limit?: number): Promise<CaseRecord[]>;
  toggleChecklistItem(
    caseIdOrCode: string,
    itemKey: string,
    isCompleted: boolean
  ): Promise<boolean>;
  deleteCase(caseIdOrCode: string): Promise<boolean>;
}

// In-memory repository for local development and unit tests without PostgreSQL.
export class InMemoryCaseRepository implements CaseRepository {
  private cases = new Map<string, SavedCaseDetails>();

  async createCase(input: CreateCaseInput): Promise<SavedCaseDetails> {
    const id = crypto.randomUUID();
    const caseCode = generateCaseCode();
    const now = new Date().toISOString();

    const caseRecord: CaseRecord = {
      id,
      caseCode,
      title: `Perkara ${input.factSummary.categoryLabel}`,
      category: input.factSummary.category,
      categoryLabel: input.factSummary.categoryLabel,
      urgencyLevel: input.factSummary.urgencyLevel,
      status: "active",
      createdAt: now,
      updatedAt: now,
    };

    const intake: CaseIntakeRecord = {
      id: crypto.randomUUID(),
      caseId: id,
      userStatement: input.factSummary.originalStory,
      clarificationData: input.factSummary.clarifications,
      factsSummary: input.factSummary,
      confirmedAt: input.factSummary.confirmedAt || now,
      createdAt: now,
    };

    const evaluation: CaseEvaluationRecord = {
      id: crypto.randomUUID(),
      caseId: id,
      legalSourceId: input.legalSource.id,
      legalSourceTitle: input.legalSource.title,
      legalSourceUrl: input.legalSource.sourceUrl,
      articlesCited: input.legalSource.articles,
      actionOptions: input.legalSource.actionOptions,
      uncertainties: input.legalSource.uncertainties,
      createdAt: now,
    };

    const checklists: CaseChecklistRecord[] = input.checklistItems.map((item) => ({
      id: crypto.randomUUID(),
      caseId: id,
      itemKey: item.id,
      title: item.title,
      description: item.description,
      required: item.required,
      isCompleted: item.isCompleted,
      updatedAt: now,
    }));

    const referrals = getReferralsByCategory(
      input.factSummary.category as CaseCategory
    );

    const fullDetails: SavedCaseDetails = {
      caseRecord,
      intake,
      evaluation,
      checklists,
      referrals,
    };

    this.cases.set(id, fullDetails);
    this.cases.set(caseCode, fullDetails);

    return fullDetails;
  }

  async getCaseByCode(code: string): Promise<SavedCaseDetails | null> {
    return this.cases.get(code) || null;
  }

  async getCaseById(id: string): Promise<SavedCaseDetails | null> {
    return this.cases.get(id) || null;
  }

  async toggleChecklistItem(
    caseIdOrCode: string,
    itemKey: string,
    isCompleted: boolean
  ): Promise<boolean> {
    const item = this.cases.get(caseIdOrCode);
    if (!item) return false;

    const checklistItem = item.checklists.find((c) => c.itemKey === itemKey);
    if (!checklistItem) return false;

    checklistItem.isCompleted = isCompleted;
    checklistItem.updatedAt = new Date().toISOString();
    return true;
  }

  async listCases(limit = 20): Promise<CaseRecord[]> {
    const unique = new Map<string, CaseRecord>();
    for (const details of this.cases.values()) {
      unique.set(details.caseRecord.id, details.caseRecord);
    }
    return Array.from(unique.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  async deleteCase(caseIdOrCode: string): Promise<boolean> {
    const item = this.cases.get(caseIdOrCode);
    if (!item) return false;

    this.cases.delete(item.caseRecord.id);
    this.cases.delete(item.caseRecord.caseCode);
    return true;
  }
}

// Production PostgreSQL repository using parameterized queries.
interface PostgresCaseRow {
  id: string;
  case_code: string;
  user_id?: string | null;
  title: string;
  category: string;
  category_label: string;
  urgency_level: string;
  status: "active" | "awaiting_help" | "resolved" | "closed";
  created_at: string;
  updated_at: string;
}

interface PostgresChecklistRow {
  id: string;
  case_id: string;
  item_key: string;
  title: string;
  description: string;
  required: boolean;
  is_completed: boolean;
  updated_at: string;
}

export class PostgresCaseRepository implements CaseRepository {
  async createCase(input: CreateCaseInput): Promise<SavedCaseDetails> {
    const pool = getDatabasePool();
    if (!pool) {
      throw new Error("PostgreSQL pool not available");
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const caseId = crypto.randomUUID();
      const caseCode = generateCaseCode();
      const now = new Date().toISOString();

      // 1. Insert cases
      await client.query(
        `INSERT INTO cases (id, case_code, title, category, category_label, urgency_level, status, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          caseId,
          caseCode,
          `Perkara ${input.factSummary.categoryLabel}`,
          input.factSummary.category,
          input.factSummary.categoryLabel,
          input.factSummary.urgencyLevel,
          "active",
          now,
          now,
        ]
      );

      // 2. Insert case_intakes
      const intakeId = crypto.randomUUID();
      await client.query(
        `INSERT INTO case_intakes (id, case_id, user_statement, clarification_data, facts_summary, confirmed_at, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          intakeId,
          caseId,
          input.factSummary.originalStory,
          JSON.stringify(input.factSummary.clarifications),
          JSON.stringify(input.factSummary),
          input.factSummary.confirmedAt || now,
          now,
        ]
      );

      // 3. Insert case_evaluations
      const evalId = crypto.randomUUID();
      await client.query(
        `INSERT INTO case_evaluations (id, case_id, legal_source_id, legal_source_title, legal_source_url, articles_cited, action_options, uncertainties, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          evalId,
          caseId,
          input.legalSource.id,
          input.legalSource.title,
          input.legalSource.sourceUrl,
          JSON.stringify(input.legalSource.articles),
          JSON.stringify(input.legalSource.actionOptions),
          JSON.stringify(input.legalSource.uncertainties),
          now,
        ]
      );

      // 4. Insert case_checklists
      const checklists: CaseChecklistRecord[] = [];
      for (const item of input.checklistItems) {
        const checkId = crypto.randomUUID();
        await client.query(
          `INSERT INTO case_checklists (id, case_id, item_key, title, description, required, is_completed, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            checkId,
            caseId,
            item.id,
            item.title,
            item.description,
            item.required,
            item.isCompleted,
            now,
          ]
        );

        checklists.push({
          id: checkId,
          caseId,
          itemKey: item.id,
          title: item.title,
          description: item.description,
          required: item.required,
          isCompleted: item.isCompleted,
          updatedAt: now,
        });
      }

      // 5. Insert audit_events
      await client.query(
        `INSERT INTO audit_events (id, case_id, event_type, metadata, created_at)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          crypto.randomUUID(),
          caseId,
          "case_created",
          JSON.stringify({ source: "web_companion" }),
          now,
        ]
      );

      await client.query("COMMIT");

      const referrals = getReferralsByCategory(
        input.factSummary.category as CaseCategory
      );

      return {
        caseRecord: {
          id: caseId,
          caseCode,
          title: `Perkara ${input.factSummary.categoryLabel}`,
          category: input.factSummary.category,
          categoryLabel: input.factSummary.categoryLabel,
          urgencyLevel: input.factSummary.urgencyLevel,
          status: "active",
          createdAt: now,
          updatedAt: now,
        },
        intake: {
          id: intakeId,
          caseId,
          userStatement: input.factSummary.originalStory,
          clarificationData: input.factSummary.clarifications,
          factsSummary: input.factSummary,
          confirmedAt: input.factSummary.confirmedAt || now,
          createdAt: now,
        },
        evaluation: {
          id: evalId,
          caseId,
          legalSourceId: input.legalSource.id,
          legalSourceTitle: input.legalSource.title,
          legalSourceUrl: input.legalSource.sourceUrl,
          articlesCited: input.legalSource.articles,
          actionOptions: input.legalSource.actionOptions,
          uncertainties: input.legalSource.uncertainties,
          createdAt: now,
        },
        checklists,
        referrals,
      };
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }

  async getCaseByCode(code: string): Promise<SavedCaseDetails | null> {
    const pool = getDatabasePool();
    if (!pool) return null;

    const res = await pool.query(
      `SELECT * FROM cases WHERE case_code = $1 LIMIT 1`,
      [code]
    );
    if (res.rows.length === 0) return null;

    return this.assembleCaseDetails(res.rows[0]);
  }

  async getCaseById(id: string): Promise<SavedCaseDetails | null> {
    const pool = getDatabasePool();
    if (!pool) return null;

    const res = await pool.query(`SELECT * FROM cases WHERE id = $1 LIMIT 1`, [
      id,
    ]);
    if (res.rows.length === 0) return null;

    return this.assembleCaseDetails(res.rows[0]);
  }

  private async assembleCaseDetails(
    caseRow: PostgresCaseRow
  ): Promise<SavedCaseDetails | null> {
    const pool = getDatabasePool();
    if (!pool) return null;

    const caseId = caseRow.id;

    const intakeRes = await pool.query(
      `SELECT * FROM case_intakes WHERE case_id = $1 LIMIT 1`,
      [caseId]
    );
    const evalRes = await pool.query(
      `SELECT * FROM case_evaluations WHERE case_id = $1 LIMIT 1`,
      [caseId]
    );
    const checkRes = await pool.query(
      `SELECT * FROM case_checklists WHERE case_id = $1 ORDER BY updated_at ASC`,
      [caseId]
    );

    const caseRecord: CaseRecord = {
      id: caseRow.id,
      caseCode: caseRow.case_code,
      userId: caseRow.user_id,
      title: caseRow.title,
      category: caseRow.category,
      categoryLabel: caseRow.category_label,
      urgencyLevel: caseRow.urgency_level,
      status: caseRow.status,
      createdAt: caseRow.created_at,
      updatedAt: caseRow.updated_at,
    };

    const intakeRow = intakeRes.rows[0];
    const intake: CaseIntakeRecord = {
      id: intakeRow.id,
      caseId: intakeRow.case_id,
      userStatement: intakeRow.user_statement,
      clarificationData: intakeRow.clarification_data,
      factsSummary: intakeRow.facts_summary,
      confirmedAt: intakeRow.confirmed_at,
      createdAt: intakeRow.created_at,
    };

    const evalRow = evalRes.rows[0];
    const evaluation: CaseEvaluationRecord = {
      id: evalRow.id,
      caseId: evalRow.case_id,
      legalSourceId: evalRow.legal_source_id,
      legalSourceTitle: evalRow.legal_source_title,
      legalSourceUrl: evalRow.legal_source_url,
      articlesCited: evalRow.articles_cited,
      actionOptions: evalRow.action_options,
      uncertainties: evalRow.uncertainties,
      createdAt: evalRow.created_at,
    };

    const checklists: CaseChecklistRecord[] = (checkRes.rows as PostgresChecklistRow[]).map((r) => ({
      id: r.id,
      caseId: r.case_id,
      itemKey: r.item_key,
      title: r.title,
      description: r.description,
      required: r.required,
      isCompleted: r.is_completed,
      updatedAt: r.updated_at,
    }));

    const referrals = getReferralsByCategory(
      caseRecord.category as CaseCategory
    );

    return {
      caseRecord,
      intake,
      evaluation,
      checklists,
      referrals,
    };
  }

  async toggleChecklistItem(
    caseIdOrCode: string,
    itemKey: string,
    isCompleted: boolean
  ): Promise<boolean> {
    const pool = getDatabasePool();
    if (!pool) return false;

    const caseRes = await pool.query(
      `SELECT id FROM cases WHERE id::text = $1 OR case_code = $1 LIMIT 1`,
      [caseIdOrCode]
    );
    if (caseRes.rows.length === 0) return false;

    const caseId = caseRes.rows[0].id;
    const updateRes = await pool.query(
      `UPDATE case_checklists SET is_completed = $1, updated_at = NOW() WHERE case_id = $2 AND item_key = $3`,
      [isCompleted, caseId, itemKey]
    );

    return (updateRes.rowCount ?? 0) > 0;
  }

  async listCases(limit = 20): Promise<CaseRecord[]> {
    const pool = getDatabasePool();
    if (!pool) return [];

    const res = await pool.query(
      `SELECT * FROM cases ORDER BY created_at DESC LIMIT $1`,
      [limit]
    );

    return (res.rows as PostgresCaseRow[]).map((row) => ({
      id: row.id,
      caseCode: row.case_code,
      userId: row.user_id,
      title: row.title,
      category: row.category,
      categoryLabel: row.category_label,
      urgencyLevel: row.urgency_level,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  }

  async deleteCase(caseIdOrCode: string): Promise<boolean> {
    const pool = getDatabasePool();
    if (!pool) return false;

    const delRes = await pool.query(
      `DELETE FROM cases WHERE id::text = $1 OR case_code = $1`,
      [caseIdOrCode]
    );

    return (delRes.rowCount ?? 0) > 0;
  }
}

// Global Singleton Repository Provider
let singletonRepo: CaseRepository | null = null;

export function getCaseRepository(): CaseRepository {
  if (singletonRepo) return singletonRepo;

  const pool = getDatabasePool();
  // Jika database pool aktif, gunakan Postgres, jika tidak gunakan InMemory
  if (pool) {
    singletonRepo = new PostgresCaseRepository();
  } else {
    singletonRepo = new InMemoryCaseRepository();
  }

  return singletonRepo;
}

export function resetCaseRepository(): void {
  singletonRepo = null;
}
