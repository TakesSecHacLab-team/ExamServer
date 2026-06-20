import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const CONTENT_DIR = path.join(ROOT, "src", "content", "learning");
const PUBLIC_DIR = path.join(ROOT, "public");

const COPY = {
  "aes-block-structure.svg": ["AESブロック構造", "128-bit block", "round key", "substitution"],
  "attack-kill-chain.svg": ["攻撃の流れ", "recon", "exploit", "persist"],
  "binary-hex-conversion.svg": ["2進数と16進数", "bits", "nibble", "hex"],
  "call-stack-layout.svg": ["スタックの見方", "caller", "frame", "return"],
  "certificate-chain.svg": ["証明書チェーン", "root CA", "intermediate", "server"],
  "cookie-http-exchange.svg": ["HTTP Cookie", "Set-Cookie", "storage", "Cookie header"],
  "cors-preflight.svg": ["CORS preflight", "OPTIONS", "policy", "actual request"],
  "csrf-attack-concept.svg": ["CSRFの構造", "attacker", "browser", "trusted site"],
  "cvss-v3-scoring.svg": ["CVSS v3", "base", "temporal", "environment"],
  "defense-in-depth.svg": ["多層防御", "prevent", "detect", "respond"],
  "digital-signature-flow.svg": ["電子署名", "hash", "sign", "verify"],
  "dns-resolution.svg": ["DNS名前解決", "stub", "resolver", "authoritative"],
  "ecb-cbc-gcm-comparison.svg": ["暗号利用モード", "ECB", "CBC", "GCM"],
  "file-magic-bytes.svg": ["ファイル識別", "magic bytes", "header", "parser"],
  "filesystem-layers.svg": ["ファイルシステム層", "API", "VFS", "device"],
  "firewall-concept.svg": ["ファイアウォール", "rule", "port", "allow/deny"],
  "hash-function-concept.svg": ["ハッシュ関数", "input", "digest", "one-way"],
  "http-request-structure.svg": ["HTTP request", "method", "headers", "body"],
  "http-response-structure.svg": ["HTTP response", "status", "headers", "body"],
  "inode-reference.svg": ["inode参照", "path", "inode", "blocks"],
  "ipv4-address-structure.svg": ["IPv4アドレス", "network", "host", "mask"],
  "password-hashing-comparison.svg": ["パスワード保存", "plain", "hash", "salted hash"],
  "password-hashing-flow.svg": ["パスワードハッシュ", "password", "salt", "stored hash"],
  "process-memory-layout.svg": ["プロセスメモリ", "text", "heap", "stack"],
  "process-tree.svg": ["プロセスツリー", "parent", "child", "signal"],
  "rsa-key-pair-concept.svg": ["RSA鍵ペア", "public key", "private key", "ciphertext"],
  "same-origin-policy.svg": ["Same-Origin Policy", "scheme", "host", "port"],
  "session-hijacking.svg": ["セッションハイジャック", "session id", "leak", "takeover"],
  "siem-log-correlation.svg": ["SIEM相関", "events", "rules", "alert"],
  "signal-flow.svg": ["シグナル配送", "sender", "kernel", "process"],
  "subnet-concept.svg": ["サブネット", "network", "range", "gateway"],
  "syslog-severity-levels.svg": ["syslog severity", "info", "warning", "critical"],
  "tcp-udp-ports.svg": ["TCP/UDPポート", "socket", "port", "service"],
  "tls-handshake.svg": ["TLS handshake", "hello", "certificate", "keys"],
  "unix-directory-tree.svg": ["UNIXディレクトリ", "/", "/etc", "/var"],
  "unix-permissions-diagram.svg": ["UNIX権限", "user", "group", "other"],
  "unix-standard-streams.svg": ["標準ストリーム", "stdin", "stdout", "stderr"],
};

function listMdxFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return listMdxFiles(fullPath);
    if (entry.isFile() && entry.name.endsWith(".mdx")) return [fullPath];
    return [];
  });
}

function findAssetRefs() {
  const refs = new Set();
  for (const file of listMdxFiles(CONTENT_DIR)) {
    const text = fs.readFileSync(file, "utf8");
    for (const match of text.matchAll(/src="(\/learning\/[^"]+)"/g)) {
      refs.add(match[1]);
    }
  }
  return [...refs].sort();
}

function escapeXml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function makeSvg(fileName) {
  const [title, a, b, c] =
    COPY[fileName] ?? [fileName.replace(/\.svg$/, ""), "concept", "flow", "check"];
  const safeTitle = escapeXml(title);
  const labels = [a, b, c].map(escapeXml);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="520" viewBox="0 0 960 520" role="img" aria-labelledby="title desc">
  <title id="title">${safeTitle}</title>
  <desc id="desc">${safeTitle}の主要要素を3段階で示す学習用図版。</desc>
  <rect width="960" height="520" fill="#fbf7ef"/>
  <rect x="32" y="32" width="896" height="456" rx="18" fill="#fffdfa" stroke="#d8cdbd" stroke-width="2"/>
  <text x="72" y="96" font-family="system-ui, sans-serif" font-size="34" font-weight="700" fill="#241c15">${safeTitle}</text>
  <text x="72" y="132" font-family="system-ui, sans-serif" font-size="18" fill="#6f6255">ExamServer learning diagram</text>
  <g font-family="system-ui, sans-serif" font-size="22" font-weight="700" text-anchor="middle">
    <rect x="72" y="214" width="210" height="118" rx="12" fill="#f2e4d1" stroke="#c8ad8d" stroke-width="2"/>
    <text x="177" y="282" fill="#2e2118">${labels[0]}</text>
    <rect x="375" y="214" width="210" height="118" rx="12" fill="#e8efe6" stroke="#a6bea3" stroke-width="2"/>
    <text x="480" y="282" fill="#1f2a1d">${labels[1]}</text>
    <rect x="678" y="214" width="210" height="118" rx="12" fill="#e7edf4" stroke="#9fb2c7" stroke-width="2"/>
    <text x="783" y="282" fill="#1b2733">${labels[2]}</text>
  </g>
  <g fill="none" stroke="#8a4f1d" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
    <path d="M302 273h46"/>
    <path d="M338 258l16 15-16 15"/>
    <path d="M605 273h46"/>
    <path d="M641 258l16 15-16 15"/>
  </g>
  <text x="72" y="418" font-family="system-ui, sans-serif" font-size="18" fill="#6f6255">本文の説明に合わせて、要素の関係だけを確認するための簡略図です。</text>
</svg>
`;
}

fs.mkdirSync(path.join(PUBLIC_DIR, "learning"), { recursive: true });

let created = 0;
for (const ref of findAssetRefs()) {
  const relative = ref.slice(1);
  const fileName = path.basename(relative);
  if (path.extname(fileName) !== ".svg") {
    throw new Error(`Only SVG learning assets are generated: ${ref}`);
  }

  const fullPath = path.join(PUBLIC_DIR, relative);
  if (fs.existsSync(fullPath)) continue;
  fs.writeFileSync(fullPath, makeSvg(fileName), "utf8");
  created++;
}

console.log(`Created ${created} learning asset(s).`);
