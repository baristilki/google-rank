import fs from "fs";
import path from "path";

export interface VoucherCodeData {
  credits: number;
  isUnlimited: boolean;
  boundDomain: string | null;
  usedCount: number;
  createdAt: string;
  note?: string;
}

export interface DomainUsageData {
  freeUsed: number;
  activeVoucher?: string | null;
  totalSearches: number;
  lastSearchedAt: string;
}

export interface IpUsageData {
  freeUsed: number;
  lastSearchedAt: string;
}

export interface QuotaDatabase {
  settings: {
    freeQueriesPerDomain: number;
    freeQueriesPerIp: number;
  };
  voucherCodes: Record<string, VoucherCodeData>;
  domainUsage: Record<string, DomainUsageData>;
  ipUsage: Record<string, IpUsageData>;
}

const DB_PATH = path.join(process.cwd(), "data", "quota_db.json");

function getDb(): QuotaDatabase {
  try {
    if (fs.existsSync(DB_PATH)) {
      const content = fs.readFileSync(DB_PATH, "utf-8");
      const parsed = JSON.parse(content);
      let modified = false;
      if (!parsed.settings || (parsed.settings.freeQueriesPerDomain || 0) < 5) {
        parsed.settings = {
          ...parsed.settings,
          freeQueriesPerDomain: 5,
          freeQueriesPerIp: 9999,
        };
        modified = true;
      }
      if (parsed.domainUsage && "" in parsed.domainUsage) {
        delete parsed.domainUsage[""];
        modified = true;
      }
      if (modified) {
        saveDb(parsed);
      }
      return parsed;
    }
  } catch (err) {
    console.error("Error reading quota DB, using defaults:", err);
  }

  // Fallback defaults: 5 free queries per domain
  return {
    settings: { freeQueriesPerDomain: 5, freeQueriesPerIp: 9999 },
    voucherCodes: {},
    domainUsage: {},
    ipUsage: {},
  };
}

function saveDb(data: QuotaDatabase): void {
  try {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving quota DB:", err);
  }
}

export function sanitizeDomain(rawDomain: string): string {
  if (!rawDomain) return "";
  return rawDomain
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/.*$/, "")
    .replace(/[^\w.-]/gi, "");
}

export function sanitizeIp(rawIp?: string | null): string {
  if (!rawIp) return "127.0.0.1";
  const first = rawIp.split(",")[0].trim();
  return first === "::1" ? "127.0.0.1" : first;
}

export interface QuotaStatus {
  canSearch: boolean;
  reason?: "DOMAIN_LIMIT_REACHED" | "ALLOWED";
  domain: string;
  domainFreeRemaining: number;
  domainFreeUsed: number;
  ipFreeRemaining: number;
  hasActiveVoucher: boolean;
  voucherCredits: number;
  isUnlimited: boolean;
  activeVoucherCode?: string | null;
}

/**
 * Checks current quota status without consuming any credit.
 */
export function checkQuotaStatus(
  rawDomain: string,
  rawIp?: string | null,
  code?: string | null
): QuotaStatus {
  const db = getDb();
  const domain = sanitizeDomain(rawDomain);
  const ip = sanitizeIp(rawIp);

  // If domain is not specified yet (e.g. initial page load), always return 5 full free searches
  if (!domain) {
    const voucherToCheck = (code || "").trim().toUpperCase();
    const voucher = voucherToCheck ? db.voucherCodes[voucherToCheck] : null;
    return {
      canSearch: true,
      reason: "ALLOWED",
      domain: "",
      domainFreeRemaining: 5,
      domainFreeUsed: 0,
      ipFreeRemaining: 5,
      hasActiveVoucher: Boolean(voucher && (voucher.isUnlimited || voucher.credits > 0)),
      voucherCredits: voucher?.credits || 0,
      isUnlimited: voucher?.isUnlimited || false,
      activeVoucherCode: voucherToCheck || null,
    };
  }

  const domainLimit = Math.max(5, db.settings?.freeQueriesPerDomain || 5);

  const domainData = db.domainUsage[domain] || {
    freeUsed: 0,
    totalSearches: 0,
    lastSearchedAt: new Date().toISOString(),
  };

  const domainFreeRemaining = Math.max(0, domainLimit - domainData.freeUsed);

  // Check voucher provided in request or already active on domain
  const voucherToCheck = (code || domainData.activeVoucher || "").trim().toUpperCase();
  const voucher = voucherToCheck ? db.voucherCodes[voucherToCheck] : null;

  if (voucher) {
    const isBoundToAnother =
      voucher.boundDomain &&
      domain &&
      sanitizeDomain(voucher.boundDomain) !== domain;

    if (!isBoundToAnother && (voucher.isUnlimited || voucher.credits > 0)) {
      return {
        canSearch: true,
        reason: "ALLOWED",
        domain,
        domainFreeRemaining,
        domainFreeUsed: domainData.freeUsed,
        ipFreeRemaining: 5,
        hasActiveVoucher: true,
        voucherCredits: voucher.credits,
        isUnlimited: voucher.isUnlimited,
        activeVoucherCode: voucherToCheck,
      };
    }
  }

  // Check free quota for domain (5 free searches)
  if (domain && domainFreeRemaining <= 0) {
    return {
      canSearch: false,
      reason: "DOMAIN_LIMIT_REACHED",
      domain,
      domainFreeRemaining: 0,
      domainFreeUsed: domainData.freeUsed,
      ipFreeRemaining: 0,
      hasActiveVoucher: false,
      voucherCredits: 0,
      isUnlimited: false,
    };
  }

  return {
    canSearch: true,
    reason: "ALLOWED",
    domain,
    domainFreeRemaining,
    domainFreeUsed: domainData.freeUsed,
    ipFreeRemaining: 5,
    hasActiveVoucher: false,
    voucherCredits: 0,
    isUnlimited: false,
  };
}

/**
 * Consumes 1 query credit (Free or Voucher).
 * Returns success or error if quota was exceeded.
 */
export function consumeQuota(
  rawDomain: string,
  rawIp?: string | null,
  code?: string | null
): { success: boolean; error?: string; status: QuotaStatus } {
  const db = getDb();
  const domain = sanitizeDomain(rawDomain);
  const ip = sanitizeIp(rawIp);
  const now = new Date().toISOString();

  if (!domain) {
    return {
      success: false,
      error: "Geçersiz alan adı.",
      status: checkQuotaStatus(domain, ip, code),
    };
  }

  const domainLimit = Math.max(5, db.settings?.freeQueriesPerDomain || 5);

  if (!db.domainUsage[domain]) {
    db.domainUsage[domain] = {
      freeUsed: 0,
      totalSearches: 0,
      lastSearchedAt: now,
    };
  }
  if (!db.ipUsage[ip]) {
    db.ipUsage[ip] = {
      freeUsed: 0,
      lastSearchedAt: now,
    };
  }

  const domainData = db.domainUsage[domain];
  const ipData = db.ipUsage[ip];

  // 1. Try Voucher Consumption first
  const voucherToCheck = (code || domainData.activeVoucher || "").trim().toUpperCase();
  const voucher = voucherToCheck ? db.voucherCodes[voucherToCheck] : null;

  if (voucher) {
    // Check if voucher is valid for this domain
    const isBoundToAnother =
      voucher.boundDomain && sanitizeDomain(voucher.boundDomain) !== domain;

    if (!isBoundToAnother && (voucher.isUnlimited || voucher.credits > 0)) {
      if (!voucher.isUnlimited) {
        voucher.credits -= 1;
      }
      voucher.usedCount = (voucher.usedCount || 0) + 1;
      voucher.boundDomain = domain; // Bind to this domain!

      domainData.activeVoucher = voucherToCheck;
      domainData.totalSearches += 1;
      domainData.lastSearchedAt = now;

      saveDb(db);

      return {
        success: true,
        status: {
          canSearch: true,
          domain,
          domainFreeRemaining: Math.max(0, domainLimit - domainData.freeUsed),
          domainFreeUsed: domainData.freeUsed,
          ipFreeRemaining: 5,
          hasActiveVoucher: true,
          voucherCredits: voucher.credits,
          isUnlimited: voucher.isUnlimited,
          activeVoucherCode: voucherToCheck,
        },
      };
    }
  }

  // 2. Try Free Quota (5 free searches per domain)
  if (domainData.freeUsed >= domainLimit) {
    return {
      success: false,
      error: `"${domain}" için tanımlanan ${domainLimit} ücretsiz analiz hakkı (${domainLimit}/${domainLimit}) dolmuştur. Sorgulamaya devam etmek için lütfen erişim kodu giriniz.`,
      status: checkQuotaStatus(domain, ip, null),
    };
  }

  // Consume 1 free query
  domainData.freeUsed += 1;
  domainData.totalSearches += 1;
  domainData.lastSearchedAt = now;

  ipData.freeUsed += 1;
  ipData.lastSearchedAt = now;

  saveDb(db);

  return {
    success: true,
    status: {
      canSearch: true,
      domain,
      domainFreeRemaining: Math.max(0, domainLimit - domainData.freeUsed),
      domainFreeUsed: domainData.freeUsed,
      ipFreeRemaining: 5,
      hasActiveVoucher: false,
      voucherCredits: 0,
      isUnlimited: false,
    },
  };
}

/**
 * Redeem / Validate a voucher code and bind it to a domain.
 */
export function redeemVoucherCode(
  rawCode: string,
  rawDomain: string
): { success: boolean; message: string; voucher?: VoucherCodeData } {
  const db = getDb();
  const code = (rawCode || "").trim().toUpperCase();
  const domain = sanitizeDomain(rawDomain);

  if (!code) {
    return { success: false, message: "Lütfen bir erişim kodu giriniz." };
  }

  const voucher = db.voucherCodes[code];
  if (!voucher) {
    return {
      success: false,
      message: "Geçersiz veya bulunamayan erişim kodu. Lütfen kodu kontrol ediniz.",
    };
  }

  // Check if bound to another domain
  if (domain && voucher.boundDomain && sanitizeDomain(voucher.boundDomain) !== domain) {
    return {
      success: false,
      message: `Bu kod daha önce "${voucher.boundDomain}" alan adı için kullanılmıştır. Başka alan adında kullanılamaz.`,
    };
  }

  if (!voucher.isUnlimited && voucher.credits <= 0) {
    return {
      success: false,
      message: "Bu erişim kodunun tüm analiz kredileri tükenmiştir.",
    };
  }

  // Bind to domain if provided
  if (domain) {
    voucher.boundDomain = domain;
    if (!db.domainUsage[domain]) {
      db.domainUsage[domain] = {
        freeUsed: 0,
        totalSearches: 0,
        lastSearchedAt: new Date().toISOString(),
      };
    }
    db.domainUsage[domain].activeVoucher = code;
  }

  saveDb(db);

  return {
    success: true,
    message: voucher.isUnlimited
      ? "Sınırsız VIP Erişim kodu başarıyla aktif edildi!"
      : `Erişim kodu başarıyla aktif edildi! ${voucher.credits} Adet Analiz Hakkı tanımlandı.`,
    voucher,
  };
}
