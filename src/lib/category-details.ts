/**
 * カテゴリごとの試験概要・出題ドメイン
 *
 * categories.json とは別に管理する。
 * 試験の特徴や出題範囲をユーザーに分かりやすく見せるための情報。
 */

export interface CategoryDetail {
  overview: string;
  domains: { name: string; description: string }[];
}

/** カテゴリIDをキーにした詳細情報 */
export const CATEGORY_DETAILS: Record<string, CategoryDetail> = {
  "lpic1-101": {
    overview:
      "LPIC-1の前半試験。Linuxシステムの基礎を問います。システムアーキテクチャ、パッケージ管理、GNUコマンド、デバイスとファイルシステムが出題範囲です。",
    domains: [
      { name: "101.1 システムアーキテクチャ", description: "ハードウェア設定、ブートプロセス、ランレベル/ブートターゲット" },
      { name: "101.2 パッケージ管理", description: "dpkg、apt、rpm、yum/dnf によるパッケージ操作" },
      { name: "103 GNUとUnixコマンド", description: "コマンドライン操作、テキスト処理、ファイル管理、パイプとリダイレクト" },
      { name: "104 デバイスとファイルシステム", description: "パーティション作成、ファイルシステム管理、マウント、ディスククォータ" },
    ],
  },
  "lpic1-102": {
    overview:
      "LPIC-1の後半試験。シェルスクリプト、ユーザー管理、ネットワーク基礎、セキュリティの実践知識を問います。",
    domains: [
      { name: "105 シェルとスクリプト", description: "シェル環境のカスタマイズ、シェルスクリプトの作成" },
      { name: "106 ユーザーインターフェースとデスクトップ", description: "X11、ディスプレイマネージャ、アクセシビリティ" },
      { name: "107 管理タスク", description: "ユーザー/グループ管理、ジョブスケジューリング、ローカライゼーション" },
      { name: "108 ネットワーク基礎", description: "TCP/IP基礎、ネットワーク設定、DNS設定、トラブルシューティング" },
      { name: "109 セキュリティ", description: "ホストセキュリティ、暗号化、SSH、GPG" },
    ],
  },
  "aws-scs": {
    overview:
      "AWSセキュリティの専門資格。インシデント対応、ログ・モニタリング、インフラ保護、ID管理、データ保護の5ドメインから出題されます。",
    domains: [
      { name: "インシデント対応", description: "AWS上でのセキュリティインシデント検知・調査・修復" },
      { name: "ログとモニタリング", description: "CloudTrail、CloudWatch、VPC Flow Logs、GuardDuty" },
      { name: "インフラストラクチャセキュリティ", description: "VPC設計、セキュリティグループ、WAF、Shield、ネットワークACL" },
      { name: "IDとアクセス管理", description: "IAMポリシー、STS、Organizations、SSO、フェデレーション" },
      { name: "データ保護", description: "KMS、CloudHSM、ACM、S3暗号化、Secrets Manager" },
    ],
  },
  sg: {
    overview:
      "情報セキュリティの基礎を問う国家試験。組織のセキュリティポリシー策定や運用管理に必要な知識を幅広く出題します。科目Aは四肢択一、科目Bは実践的なケーススタディです。",
    domains: [
      { name: "情報セキュリティ全般", description: "機密性・完全性・可用性、脅威と脆弱性、リスクアセスメント" },
      { name: "情報セキュリティ管理", description: "セキュリティポリシー、ISMS、インシデント対応手順" },
      { name: "情報セキュリティ対策", description: "暗号化、認証、アクセス制御、マルウェア対策、物理的セキュリティ" },
      { name: "情報セキュリティ関連法規", description: "個人情報保護法、不正アクセス禁止法、サイバーセキュリティ基本法" },
    ],
  },
  sc: {
    overview:
      "情報セキュリティの高度専門家向け国家試験。午後試験ではA4数ページに渡るシナリオを読み解き、攻撃手法の分析やセキュリティ対策の立案能力が問われます。",
    domains: [
      { name: "情報セキュリティ", description: "暗号化技術、PKI、認証プロトコル、アクセス制御モデル" },
      { name: "ネットワークセキュリティ", description: "ファイアウォール、IDS/IPS、VPN、プロキシ、DMZ設計" },
      { name: "Webアプリケーションセキュリティ", description: "XSS、SQLインジェクション、CSRF、セッション管理、OWASP Top 10" },
      { name: "インシデント対応と運用", description: "フォレンジック、ログ分析、マルウェア解析、事業継続計画" },
      { name: "セキュリティ関連法規・制度", description: "個人情報保護法、不正アクセス禁止法、情報セキュリティ監査" },
    ],
  },
  general: {
    overview:
      "社会・科学・地理など幅広い分野から出題される一般常識問題集です。動作確認用のサンプルカテゴリとしても利用できます。",
    domains: [
      { name: "社会・時事", description: "政治、経済、国際情勢に関する基礎知識" },
      { name: "科学・自然", description: "物理、化学、生物、地学の基礎" },
      { name: "地理・歴史", description: "世界の地理、日本史・世界史の重要事項" },
      { name: "文化・スポーツ", description: "文学、芸術、スポーツに関する常識" },
    ],
  },
  "thm-basics": {
    overview:
      "TryHackMe初学者向けのLinux基礎コマンド小テストです。前半は状況設定問題（どのコマンドを使うか）、後半はコマンド確認問題（コマンドの作用を答える）の計20問で構成されています。",
    domains: [
      { name: "状況設定問題（10問）", description: "こんな状況です。どのコマンドを使えばいいでしょうか？ pwd / ls / cd / mkdir / cat / touch / rm / cp / whoami / sudo" },
      { name: "コマンド確認問題（10問）", description: "このコマンドでは何がわかりますか？ pwd / ls / cd / mkdir / cat / touch / rm / cp / whoami / sudo" },
    ],
  },
  "java-silver": {
    overview:
      "Oracle認定資格 Java SE 17 Silver / Programmer I（試験番号: 1Z0-825-JPN）対策問題集。合格ライン65%、制限時間90分。基本構文・OOP・例外処理・配列・List・Java 17新機能を複合コードで問う全50問。",
    domains: [
      { name: "基本文法・データ型・演算子", description: "数値昇格・型変換・演算子優先順位・String・StringBuilder・StringPool" },
      { name: "制御構文・配列", description: "if・switch式・yield・for・while・do-while・拡張for・配列・ArrayList" },
      { name: "オブジェクト指向", description: "継承・ポリモーフィズム・フィールド隠蔽・static隠蔽・抽象クラス・インターフェース・カプセル化" },
      { name: "例外処理", description: "try-catch-finally・try-with-resources・チェック例外・非チェック例外・マルチキャッチ・例外の継承関係" },
      { name: "Java新機能（Java 10〜17）", description: "var・switch式・テキストブロック・record・sealed class・パターンマッチング（instanceof）" },
    ],
  },
};
