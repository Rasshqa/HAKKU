import crypto from "crypto";
import {
  CreateCaseInput,
  SavedCaseDetails,
  CaseRecord,
  CaseIntakeRecord,
  CaseEvaluationRecord,
  CaseChecklistRecord,
  CaseStatus,
  ListCasesFilter,
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
  listCases(limitOrFilter?: number | ListCasesFilter): Promise<CaseRecord[]>;
  toggleChecklistItem(
    caseIdOrCode: string,
    itemKey: string,
    isCompleted: boolean
  ): Promise<boolean>;
  updateCaseStatus(
    caseIdOrCode: string,
    status: CaseStatus
  ): Promise<CaseRecord | null>;
  deleteCase(caseIdOrCode: string): Promise<boolean>;
}

function buildDefaultSeedCase(): SavedCaseDetails {
  const id = "seed-case-hk-2026-8841";
  const caseCode = "HK-2026-8841";
  const createdAt = "2026-10-18T09:15:00.000Z";

  const factSummary = {
    originalStory:
      "Saya telah bekerja 2 tahun 4 bulan dengan kontrak PKWT di perusahaan logistik, namun saat kontrak berakhir perusahaan menolak membayar uang kompensasi PKWT dan menahan ijazah asli saya.",
    category: "labor" as CaseCategory,
    categoryLabel: "Ketenagakerjaan & PHK",
    urgencyLevel: "normal" as const,
    knownFacts: [
      "Hubungan kerja: PKWT selama 2 tahun 4 bulan berturut-turut.",
      "Upah pokok dan tunjangan tetap: Rp 5.500.000 per bulan.",
      "Hak kompensasi PKWT sesuai Pasal 15 PP No. 35/2021 belum dibayarkan.",
      "Dokumen ijazah asli ditahan oleh bagian HRD tanpa berita acara pengembalian.",
    ],
    unknownFacts: [
      "Tanggapan resmi tertulis dari manajemen atas surat permohonan bipartit.",
    ],
    clarifications: [
      {
        questionId: "q-contract",
        questionText: "Apakah Anda menyimpan salinan kontrak PKWT dan slip gaji?",
        answer: "Ya, salinan kontrak PKWT dan mutasi gaji 6 bulan terakhir lengkap.",
        isSkipped: false,
      },
    ],
    confirmedAt: createdAt,
  };

  return {
    caseRecord: {
      id,
      caseCode,
      userId: null,
      title: "Penahanan Ijazah & Kompensasi PKWT Belum Dibayar",
      category: "labor",
      categoryLabel: "Ketenagakerjaan & PHK",
      urgencyLevel: "normal",
      status: "active",
      createdAt,
      updatedAt: createdAt,
    },
    intake: {
      id: "seed-intake-1",
      caseId: id,
      userStatement: factSummary.originalStory,
      clarificationData: factSummary.clarifications,
      factsSummary: factSummary,
      confirmedAt: createdAt,
      createdAt,
    },
    evaluation: {
      id: "seed-eval-1",
      caseId: id,
      legalSourceId: "src-labor-pp35-2021",
      legalSourceTitle:
        "PP No. 35 Tahun 2021 tentang PKWT, Alih Daya, Waktu Kerja & PHK jo. UU No. 2 Tahun 2004",
      legalSourceUrl: "https://jdih.kemnaker.go.id",
      articlesCited: [
        {
          articleLabel: "Pasal 15 & Pasal 16 PP No. 35 Tahun 2021",
          topic: "Kewajiban Pembayaran Uang Kompensasi PKWT",
          officialContent:
            "Pengusaha wajib memberikan uang kompensasi kepada Pekerja/Buruh yang hubungan kerjanya berdasarkan PKWT pada saat berakhirnya PKWT.",
          explanation:
            "Dengan masa kerja 28 bulan dan upah Rp 5.500.000, estimasi hak uang kompensasi PKWT Anda adalah (28/12) × Rp 5.500.000 = Rp 12.833.333.",
        },
      ],
      actionOptions: [
        {
          title: "Kirim Surat Permohonan Perundingan Bipartit",
          rationale:
            "Syarat formil wajib sesuai Pasal 3 UU No. 2/2004 sebelum mencatatkan perselisihan ke Dinas Tenaga Kerja.",
          preparation: [
            "Cetak draf Surat Permohonan Bipartit dari tab Generator Draf Surat",
            "Lampirkan salinan kontrak PKWT dan rincian perhitungan kompensasi",
          ],
        },
        {
          title: "Pengaduan Pengawas Ketenagakerjaan & Pencatatan Mediasi Disnaker",
          rationale:
            "Jika perundingan bipartit ditolak atau tidak mencapai sepakat dalam 30 hari kerja.",
          preparation: [
            "Siapkan tanda terima pengiriman surat bipartit dan daftar hadir",
          ],
        },
      ],
      uncertainties: [
        "Perlu memeriksa apakah terdapat klausul denda atau kesepakatan khusus pada kontrak PKWT terkait penyimpanan dokumen.",
      ],
      createdAt,
    },
    checklists: [
      {
        id: "chk-seed-1",
        caseId: id,
        itemKey: "ev-contract",
        title: "Salinan Perjanjian Kerja (PKWT) & Surat Pengangkatan",
        description: "Bukti sah adanya hubungan kerja dan durasi masa kontrak.",
        required: true,
        isCompleted: true,
        updatedAt: createdAt,
      },
      {
        id: "chk-seed-2",
        caseId: id,
        itemKey: "ev-payslip",
        title: "Slip Gaji / Mutasi Rekening 3–6 Bulan Terakhir",
        description: "Dasar perhitungan komponen upah pokok dan tunjangan tetap.",
        required: true,
        isCompleted: true,
        updatedAt: createdAt,
      },
      {
        id: "chk-seed-3",
        caseId: id,
        itemKey: "ev-bipartite",
        title: "Surat Permohonan Perundingan Bipartit & Tanda Terima",
        description: "Bukti telah menempuh upaya musyawarah sesuai UU No. 2/2004.",
        required: true,
        isCompleted: false,
        updatedAt: createdAt,
      },
    ],
    referrals: getReferralsByCategory("labor"),
  };
}

export class InMemoryCaseRepository implements CaseRepository {
  private cases = new Map<string, SavedCaseDetails>();

  constructor() {
    const seed = buildDefaultSeedCase();
    this.cases.set(seed.caseRecord.id, seed);
    this.cases.set(seed.caseRecord.caseCode, seed);
  }

  async createCase(input: CreateCaseInput): Promise<SavedCaseDetails> {
    const id = crypto.randomUUID();
    const caseCode = generateCaseCode();
    const now = new Date().toISOString();

    const caseRecord: CaseRecord = {
      id,
      caseCode,
      userId: input.userId || null,
      title: input.title?.trim() || `Perkara ${input.factSummary.categoryLabel}`,
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
    const normalized = code.trim().toUpperCase();
    return this.cases.get(normalized) || this.cases.get(code) || null;
  }

  async getCaseById(id: string): Promise<SavedCaseDetails | null> {
    return this.cases.get(id) || null;
  }

  async toggleChecklistItem(
    caseIdOrCode: string,
    itemKey: string,
    isCompleted: boolean
  ): Promise<boolean> {
    const item =
      this.cases.get(caseIdOrCode) ||
      this.cases.get(caseIdOrCode.trim().toUpperCase());
    if (!item) return false;

    const checklistItem = item.checklists.find((c) => c.itemKey === itemKey);
    if (!checklistItem) return false;

    checklistItem.isCompleted = isCompleted;
    checklistItem.updatedAt = new Date().toISOString();
    item.caseRecord.updatedAt = checklistItem.updatedAt;
    return true;
  }

  async updateCaseStatus(
    caseIdOrCode: string,
    status: CaseStatus
  ): Promise<CaseRecord | null> {
    const item =
      this.cases.get(caseIdOrCode) ||
      this.cases.get(caseIdOrCode.trim().toUpperCase());
    if (!item) return null;

    item.caseRecord.status = status;
    item.caseRecord.updatedAt = new Date().toISOString();
    return item.caseRecord;
  }

  async listCases(limitOrFilter: number | ListCasesFilter = 20): Promise<CaseRecord[]> {
    const filter: ListCasesFilter =
      typeof limitOrFilter === "number" ? { limit: limitOrFilter } : limitOrFilter;
    const limit = filter.limit ?? 20;
    const search = filter.search?.trim().toLowerCase() || "";

    const unique = new Map<string, CaseRecord>();
    for (const details of this.cases.values()) {
      unique.set(details.caseRecord.id, details.caseRecord);
    }

    return Array.from(unique.values())
      .filter((record) => {
        if (filter.status && filter.status !== "all" && record.status !== filter.status) {
          return false;
        }
        if (filter.category && filter.category !== "all" && record.category !== filter.category) {
          return false;
        }
        if (filter.userId !== undefined && record.userId !== filter.userId) {
          return false;
        }
        if (search) {
          const matchesCode = record.caseCode.toLowerCase().includes(search);
          const matchesTitle = record.title.toLowerCase().includes(search);
          const matchesCategory = record.categoryLabel.toLowerCase().includes(search);
          return matchesCode || matchesTitle || matchesCategory;
        }
        return true;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  async deleteCase(caseIdOrCode: string): Promise<boolean> {
    const item =
      this.cases.get(caseIdOrCode) ||
      this.cases.get(caseIdOrCode.trim().toUpperCase());
    if (!item) return false;

    this.cases.delete(item.caseRecord.id);
    this.cases.delete(item.caseRecord.caseCode);
    return true;
  }
}

interface PostgresJoinedCaseRow {
  id: string;
  case_code: string;
  user_id?: string | null;
  title: string;
  category: string;
  category_label: string;
  urgency_level: string;
  status: CaseStatus;
  created_at: string;
  updated_at: string;
  intake_id: string;
  user_statement: string;
  clarification_data: unknown;
  facts_summary: SavedCaseDetails["intake"]["factsSummary"];
  confirmed_at: string;
  intake_created_at: string;
  eval_id: string;
  legal_source_id: string;
  legal_source_title: string;
  legal_source_url: string;
  articles_cited: unknown[];
  action_options: unknown[];
  uncertainties: string[];
  eval_created_at: string;
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
      const title = input.title?.trim() || `Perkara ${input.factSummary.categoryLabel}`;

      await client.query(
        `INSERT INTO cases (id, case_code, user_id, title, category, category_label, urgency_level, status, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          caseId,
          caseCode,
          input.userId || null,
          title,
          input.factSummary.category,
          input.factSummary.categoryLabel,
          input.factSummary.urgencyLevel,
          "active",
          now,
          now,
        ]
      );

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

      await client.query(
        `INSERT INTO audit_events (id, case_id, event_type, metadata, created_at)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          crypto.randomUUID(),
          caseId,
          "case_created",
          JSON.stringify({ source: "web_companion", userId: input.userId || null }),
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
          userId: input.userId || null,
          title,
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
    return this.fetchJoinedCase(`c.case_code = $1`, [code.trim().toUpperCase()]);
  }

  async getCaseById(id: string): Promise<SavedCaseDetails | null> {
    return this.fetchJoinedCase(`c.id::text = $1`, [id.trim()]);
  }

  private async fetchJoinedCase(
    whereClause: string,
    params: unknown[]
  ): Promise<SavedCaseDetails | null> {
    const pool = getDatabasePool();
    if (!pool) return null;

    // Single relational JOIN across cases, case_intakes, and case_evaluations
    const joinQuery = `
      SELECT
        c.id, c.case_code, c.user_id, c.title, c.category, c.category_label,
        c.urgency_level, c.status, c.created_at, c.updated_at,
        ci.id AS intake_id, ci.user_statement, ci.clarification_data,
        ci.facts_summary, ci.confirmed_at, ci.created_at AS intake_created_at,
        ce.id AS eval_id, ce.legal_source_id, ce.legal_source_title,
        ce.legal_source_url, ce.articles_cited, ce.action_options,
        ce.uncertainties, ce.created_at AS eval_created_at
      FROM cases c
      INNER JOIN case_intakes ci ON ci.case_id = c.id
      INNER JOIN case_evaluations ce ON ce.case_id = c.id
      WHERE ${whereClause}
      LIMIT 1
    `;

    const res = await pool.query<PostgresJoinedCaseRow>(joinQuery, params);
    if (res.rows.length === 0) return null;

    const row = res.rows[0];
    const checkRes = await pool.query<PostgresChecklistRow>(
      `SELECT id, case_id, item_key, title, description, required, is_completed, updated_at
       FROM case_checklists
       WHERE case_id = $1
       ORDER BY required DESC, updated_at ASC`,
      [row.id]
    );

    const caseRecord: CaseRecord = {
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
    };

    const intake: CaseIntakeRecord = {
      id: row.intake_id,
      caseId: row.id,
      userStatement: row.user_statement,
      clarificationData: row.clarification_data,
      factsSummary: row.facts_summary,
      confirmedAt: row.confirmed_at,
      createdAt: row.intake_created_at,
    };

    const evaluation: CaseEvaluationRecord = {
      id: row.eval_id,
      caseId: row.id,
      legalSourceId: row.legal_source_id,
      legalSourceTitle: row.legal_source_title,
      legalSourceUrl: row.legal_source_url,
      articlesCited: row.articles_cited,
      actionOptions: row.action_options,
      uncertainties: row.uncertainties,
      createdAt: row.eval_created_at,
    };

    const checklists: CaseChecklistRecord[] = checkRes.rows.map((r) => ({
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

    const updateRes = await pool.query(
      `UPDATE case_checklists cc
       SET is_completed = $1, updated_at = NOW()
       FROM cases c
       WHERE cc.case_id = c.id
         AND (c.id::text = $2 OR c.case_code = $2)
         AND cc.item_key = $3`,
      [isCompleted, caseIdOrCode, itemKey]
    );

    return (updateRes.rowCount ?? 0) > 0;
  }

  async updateCaseStatus(
    caseIdOrCode: string,
    status: CaseStatus
  ): Promise<CaseRecord | null> {
    const pool = getDatabasePool();
    if (!pool) return null;

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const res = await client.query<PostgresJoinedCaseRow>(
        `UPDATE cases
         SET status = $1, updated_at = NOW()
         WHERE id::text = $2 OR case_code = $2
         RETURNING id, case_code, user_id, title, category, category_label, urgency_level, status, created_at, updated_at`,
        [status, caseIdOrCode]
      );

      if (res.rows.length === 0) {
        await client.query("ROLLBACK");
        return null;
      }

      const row = res.rows[0];
      await client.query(
        `INSERT INTO audit_events (id, case_id, event_type, metadata, created_at)
         VALUES ($1, $2, $3, $4, NOW())`,
        [
          crypto.randomUUID(),
          row.id,
          "status_updated",
          JSON.stringify({ status }),
        ]
      );
      await client.query("COMMIT");

      return {
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
      };
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }

  async listCases(limitOrFilter: number | ListCasesFilter = 20): Promise<CaseRecord[]> {
    const pool = getDatabasePool();
    if (!pool) return [];

    const filter: ListCasesFilter =
      typeof limitOrFilter === "number" ? { limit: limitOrFilter } : limitOrFilter;
    const limit = Math.min(Math.max(1, filter.limit ?? 20), 100);

    const conditions: string[] = [];
    const values: unknown[] = [];

    if (filter.status && filter.status !== "all") {
      values.push(filter.status);
      conditions.push(`status = $${values.length}`);
    }

    if (filter.category && filter.category !== "all") {
      values.push(filter.category);
      conditions.push(`category = $${values.length}`);
    }

    if (filter.userId !== undefined) {
      if (filter.userId === null) {
        conditions.push(`user_id IS NULL`);
      } else {
        values.push(filter.userId);
        conditions.push(`user_id = $${values.length}`);
      }
    }

    if (filter.search && filter.search.trim()) {
      values.push(`%${filter.search.trim()}%`);
      conditions.push(
        `(case_code ILIKE $${values.length} OR title ILIKE $${values.length} OR category_label ILIKE $${values.length})`
      );
    }

    values.push(limit);
    const whereSql = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const res = await pool.query<PostgresJoinedCaseRow>(
      `SELECT id, case_code, user_id, title, category, category_label, urgency_level, status, created_at, updated_at
       FROM cases
       ${whereSql}
       ORDER BY created_at DESC
       LIMIT $${values.length}`,
      values
    );

    return res.rows.map((row) => ({
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

const globalForCaseRepo = globalThis as unknown as {
  __hakkuCaseRepo?: CaseRepository | null;
};

export function getCaseRepository(): CaseRepository {
  if (globalForCaseRepo.__hakkuCaseRepo) {
    return globalForCaseRepo.__hakkuCaseRepo;
  }

  const pool = getDatabasePool();
  const repo = pool ? new PostgresCaseRepository() : new InMemoryCaseRepository();
  globalForCaseRepo.__hakkuCaseRepo = repo;
  return repo;
}

export function resetCaseRepository(): void {
  globalForCaseRepo.__hakkuCaseRepo = null;
}
