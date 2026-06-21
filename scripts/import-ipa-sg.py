from __future__ import annotations

"""Import IPA official SG public questions.

Setup:
  python -m pip install -r scripts/requirements-ipa-sg.txt

Run:
  python scripts/import-ipa-sg.py
"""

import json
import re
import tempfile
import unicodedata
import urllib.request
from pathlib import Path

import pdfplumber


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "data" / "exams" / "sg" / "questions.json"
WORK = Path(tempfile.gettempdir()) / "examserver-ipa-sg"

CHOICE_LABELS = "アイウエオカキクケコ"
CHOICE_INDEX = {label: index for index, label in enumerate(CHOICE_LABELS)}


CASE_NOTES: dict[str, tuple[str, str]] = {
    "sg-r07-q13": (
        "可用性評価では，サービスが止まったときに誰へ直ちに影響するかで重要度を決める。顧客にも直ちに影響するなら2，自社だけなら1，直ちの影響がなければ0。",
        "電子メールはヘルプデスク利用者への受付・回答に使うので顧客影響がある。人事・労務管理は社内利用なので，自社への影響として読む。",
    ),
    "sg-r07-q14": (
        "ファイル共有サービスでは，送信者・受信者・承認者・保管場所・削除タイミングを分けて管理する。メール添付より便利でも，誤共有や権限過多を防ぐ設計が必要になる。",
        "フロー図の各手順が，情報漏えい防止や取引先との受渡しにどう効くかを追う。単にクラウドを使うだけでなく，承認やアクセス制御が働く箇所を選ぶ。",
    ),
    "sg-r07-q15": (
        "匿名加工情報では，個人を識別できる記述を削るだけでなく，他の情報と照合して個人が分かる手掛かりも加工する。年齢や地域などは粒度を粗くする発想が重要。",
        "表にある各データ項目について，直接識別子なのか，組合せで個人に近づく属性なのかを判定する。マーケティングに必要な有用性を残しながら再識別リスクを下げる組合せを選ぶ。",
    ),
    "sg-r06-q13": (
        "SaaSの不正アクセス対策は，社内ネットワーク制限だけで完結しない。端末紛失，社外利用，認証情報漏えいなど，利用シーンごとの入口を考える。",
        "問題文の機能一覧から，A社の弱点に直接効く機能を選ぶ。便利機能ではなく，不正ログインや情報持出しのリスクを下げる機能かで判断する。",
    ),
    "sg-r06-q14": (
        "バックアップは世代数，保存場所，媒体，復旧時間，復旧時点を分けて考える。ランサムウェア対策では，同じ場所の同じ媒体だけに頼らないことも重要。",
        "既存ポリシーの弱点を見つけ，失われるデータ量や復旧しやすさを改善する選択肢を選ぶ。単なる媒体交換や速度向上が，リスク低減に直結するとは限らない。",
    ),
    "sg-r06-q15": (
        "ブラウザ上の偽警告やサポート詐欺では，画面の指示に従わないことが第一。電話，ダウンロード，遠隔操作，支払へ誘導される前に遮断する。",
        "従業員教育で必要なのは，抽象的な注意ではなく，遭遇時の具体的な終了手順。警告文の内容を信じて操作を続ける選択肢を外す。",
    ),
    "sg-r05-q13": (
        "リスク値を式で計算する問題では，重要度，脅威，脆弱性のどれが大きいかを表から拾う。しきい値を超えるものだけが追加対応の対象になる。",
        "各情報資産について，問題文の計算式に数値を代入する。機密性だけで判断せず，完全性・可用性を含む重要度と，脅威・脆弱性の掛け算で見る。",
    ),
    "sg-r05-q14": (
        "バックアップのリスクは，データ消失，媒体故障，災害，同一場所保管などに分けて考える。対策がどのリスクを下げるのかを一対一で見る。",
        "選択肢の対策が，図にあるリスクのどれを実際に低減するかを確認する。復旧点を短くする対策と，保管場所を分ける対策は効くリスクが異なる。",
    ),
    "sg-r05-q15": (
        "マルウェア対策では，定義ファイル更新，添付ファイルの扱い，VPN，二要素認証などの役割を分ける。感染後の被害拡大防止と，感染前の検知強化は別物。",
        "問題文が求めている改善対象に合う対策を選ぶ。便利そうな運用ルールでも，実際の攻撃経路や検知能力に効かないものは外す。",
    ),
    "sg-sample-set-q49": (
        "業務委託では，委託先の作業が新しい攻撃経路を作ることがある。複合機通知やファイル化の流れは，なりすましメールやURL誘導と結び付きやすい。",
        "B業務の手順を攻撃者目線で追い，従業員が信じやすいメールや画面を選ぶ。実際の業務に紛れる攻撃が標的型攻撃の典型。",
    ),
    "sg-sample-set-q50": (
        "リスクアセスメントでは，情報資産の重要度，脅威，脆弱性を別々に評価し，式に従ってリスク値を出す。最大値やしきい値の扱いを読み落とさない。",
        "表から必要な数値を拾って計算する。選択肢の数字は雰囲気で選ばず，重要度×脅威×脆弱性の順に確認する。",
    ),
    "sg-sample-set-q51": (
        "SECURITY ACTIONのような基本対策は，標準ソフトだけでなく実際に使われている非標準ソフトにも及ぶ。棚卸しと更新管理ができて初めて“実施している”と言える。",
        "評価結果を上げるには，不明な利用実態を把握し，更新されないソフトを残さない対策が必要。単なる注意喚起だけでは状態管理にならない。",
    ),
    "sg-sample-set-q52": (
        "外部記憶媒体の制御は，マルウェア侵入と情報持出しの両方に関わる。ただし，別項目のアプリ導入制限やBluetooth制限でしか下げられないリスクは除く。",
        "項番4だけを追加対策した場合に低減できるものを選ぶ。問題文が“項番3，5は実施しない”と限定しているので，効果範囲を広げすぎない。",
    ),
    "sg-sample-set-q53": (
        "共連れ対策は，技術的な認証だけでなく，人の行動を変える注意喚起や相互確認も含む。暗号方式の強さは，共連れそのものの防止には直結しない。",
        "通販事業部エリアの入口で起きている問題に効く対策を選ぶ。正門や暗号化など，場所や原因がずれている対策は除外する。",
    ),
    "sg-sample-set-q54": (
        "ランサムウェアで最新データが使えなくなるリスクには，バックアップ頻度と世代管理が効く。毎週から毎日にすると，失われる更新分を小さくできる。",
        "問題文は“最大1週間分の更新情報が失われる”ことを下げたい。遠隔地保管や媒体変更ではなく，復旧時点を新しくする対策を選ぶ。",
    ),
    "sg-sample-set-q55": (
        "標的型攻撃メールは，受信者を偽サイトへ誘導して認証情報や個人情報を入力させることがある。訓練内容から，想定している攻撃目的を読む。",
        "偽解除サイトで氏名，所属，ID，パスワードを入力させる点が決め手。ロック解除そのものではなく，情報をだまし取る攻撃を想定している。",
    ),
    "sg-sample-set-q56": (
        "共用端末にIDやパスワードを保存すると，本来その権限を持たない人が他人のアカウントで個人データへアクセスできる。認証情報の保存はアクセス制御を弱める。",
        "問題文では利用者IDは個人別，権限も塾生ごとに設定されている。ブラウザ保存によって，その境界が崩れるリスクを選ぶ。",
    ),
    "sg-sample-set-q57": (
        "自己評価でOKにするには，ルールがあるだけでなく，実際の設定状況が適切であることを確認する必要がある。証跡は具体的でなければならない。",
        "最小権限の原則について，ヒアリングと確認でアクセス権が適切と分かっている。評価結果と評価根拠の両方がそろう選択肢を選ぶ。",
    ),
    "sg-sample-set-q58": (
        "脆弱性診断基準では，診断の実施頻度，報告期限，検出後の対応期限を分けて確認する。暫定対策とCISO承認が期限超過の扱いに関わることもある。",
        "各項番をA社グループ基準と点検結果で照合する。過去に実施したかではなく，年1回以上，2か月以内報告，1か月以内対応などの条件を満たすかで判断する。",
    ),
    "sg-sample-set-q59": (
        "職務分離では，入力した人と承認する人を分ける。委託先が入力した場合でも，承認者は要求事項と方針に合う人を選ばなければならない。",
        "要求1は“B社が入力した場合はA社が承認する”。方針1と方針2を同時に満たす承認者として，Z販売課の販売責任者を選ぶ。",
    ),
    "sg-sample-set-q60": (
        "不審メール調査では，ヘッダ，送信経路，ドメイン，添付ファイル，URL，送信者確認など複数の証跡を組み合わせる。単独の見た目だけでは判断しない。",
        "図の調査結果から，なりすましや不審性を示す項番だけを選ぶ。メール本文の自然さではなく，技術的な送信元や誘導先の矛盾を見る。",
    ),
    "sg-kamoku-b-sample-q01": (
        "不審メール対応では，添付ファイルやURLを広げないことが最優先。注意喚起のためでも，問題のメールをそのまま転送すると被害を拡大する。",
        "問合せ対応者に連絡した後は，組織の指示に従って転送する。自己判断で全員に転送したり，共有サーバへ置いたりする選択肢は危険。",
    ),
    "sg-kamoku-b-sample-q02": (
        "Webサイトの脆弱性診断では，新規開発・機能追加・定期診断・報告・対応期限を個別に確認する。ログイン機能追加は重要な変更として扱う。",
        "B社サイトの変更時期と自己点検結果を基準に照合する。診断を行ったか，結果を報告したか，検出事項に期限内対応したかを分けて判断する。",
    ),
    "sg-kamoku-b-sample-q03": (
        "マルウェア感染が疑われるときは，まず被害拡大を止め，認証情報を守る。ネットワーク接続や添付ファイルの再実行は，調査前にリスクを広げる。",
        "パスワード変更依頼と，安全な状態で定義ファイル更新後にフルスキャンする対応が筋。感染端末を社内ネットワークにつなぐ選択肢は避ける。",
    ),
}


OPTION_FIXES: dict[str, list[str]] = {
    "sg-sample-set-q57": [
        "OK　アクセス権の設定状況が適切であることを確認した。",
        "OK　アクセス権を適切に設定するルールが存在することを確認した。",
        "OK　ファイルサーバは情報システム部が運用管理している。",
        "NA　顧客情報をファイルサーバに保存することは禁止されている。",
    ],
}


SOURCES = [
    {
        "prefix": "sg-r07",
        "domain": "令和7年度公開問題",
        "source_label": "令和7年度 情報セキュリティマネジメント試験 科目A・B 公開問題",
        "qs_url": "https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/tbl5kb0000005r9r-att/2025r07_sg_qs.pdf",
        "ans_url": "https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/tbl5kb0000005r9r-att/2025r07_sg_ans.pdf",
        "question_count": 15,
    },
    {
        "prefix": "sg-r06",
        "domain": "令和6年度公開問題",
        "source_label": "令和6年度 情報セキュリティマネジメント試験 科目A・B 公開問題",
        "qs_url": "https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/eid2eo0000007g1d-att/2024r06_sg_qs.pdf",
        "ans_url": "https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/eid2eo0000007g1d-att/2024r06_sg_ans.pdf",
        "question_count": 15,
    },
    {
        "prefix": "sg-r05",
        "domain": "令和5年度公開問題",
        "source_label": "令和5年度 情報セキュリティマネジメント試験 科目A・B 公開問題",
        "qs_url": "https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/t6hhco0000003zx0-att/2023r05_sg_qs.pdf",
        "ans_url": "https://www.ipa.go.jp/shiken/mondai-kaiotu/sg_fe/koukai/t6hhco0000003zx0-att/2023r05_sg_ans.pdf",
        "question_count": 15,
    },
    {
        "prefix": "sg-sample-set",
        "domain": "サンプル問題セット",
        "source_label": "情報セキュリティマネジメント試験 サンプル問題セット",
        "qs_url": "https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/sg_set_sample_qs.pdf",
        "ans_url": "https://www.ipa.go.jp/shiken/syllabus/henkou/2022/ssf7ph000000h5tb-att/sg_set_sample_ans.pdf",
        "question_count": 60,
    },
    {
        "prefix": "sg-kamoku-b-sample",
        "domain": "科目Bサンプル問題",
        "source_label": "情報セキュリティマネジメント試験 科目B試験サンプル問題",
        "qs_url": "https://www.ipa.go.jp/shiken/syllabus/henkou/2022/gmcbt80000007cfs-att/sg_kamoku_b_sample.pdf",
        "ans_url": "https://www.ipa.go.jp/shiken/syllabus/henkou/2022/gmcbt80000007cfs-att/sg_kamoku_b_sample.pdf",
        "question_count": 3,
        "truncate_before": "情報セキュリティマネジメント試験 科目 B のサンプル問題 解答例・出題趣旨",
    },
]


def download(url: str) -> Path:
    WORK.mkdir(exist_ok=True)
    filename = url.rsplit("/", 1)[-1]
    path = WORK / filename
    if not path.exists():
        urllib.request.urlretrieve(url, path)
    return path


def pdf_text(path: Path) -> str:
    with pdfplumber.open(path) as pdf:
        return "\n".join(
            page.extract_text(x_tolerance=1, y_tolerance=3) or "" for page in pdf.pages
        )


def normalize_number(value: str) -> int:
    return int(unicodedata.normalize("NFKC", value))


def clean_lines(text: str) -> str:
    lines: list[str] = []
    for line in text.splitlines():
        line = line.strip()
        if not line:
            continue
        if line in {"ぜい", "ひぼう", "かい"}:
            continue
        if re.fullmatch(r"[－-]\s*\d+\s*[－-]", line):
            continue
        if line.startswith("©"):
            continue
        if line.startswith("試験問題に記載されている会社名又は製品名は"):
            continue
        if line.startswith("なお，試験問題では"):
            continue
        if line in {"〔 メ モ 用 紙 〕", "【 メ モ 用 紙 】"}:
            continue
        lines.append(line)
    cleaned = "\n".join(lines)
    return cleaned


def normalize_markdown_text(text: str) -> str:
    lines = [re.sub(r"[ \t]+", " ", line).strip() for line in text.strip().splitlines()]
    lines = [line.replace("(ニ)", "(二)") for line in lines if line]
    return "  \n".join(lines)


def remove_answer_group_fragment(text: str) -> str:
    lines = text.splitlines()
    while lines and re.fullmatch(
        r"[A-Za-zＡ-Ｚａ-ｚ0-9０-９]+\s*に関する", lines[-1].replace("  ", "").strip()
    ):
        lines.pop()
    return "\n".join(lines).rstrip()


def answer_group_columns(header: str) -> list[str]:
    header = re.sub(r"\s+", " ", header).strip()
    header = re.sub(r"\ba\s+([0-9０-９])", r"a\1", header)
    if not header:
        return []
    columns = header.split()
    if len(columns) < 2 or len(columns) > 6:
        return []
    if any("選べ" in column or "解答群" in column for column in columns):
        return []
    return columns


def with_answer_group_columns(option: str, columns: list[str]) -> str:
    if not columns:
        return option
    values = option.split()
    if len(values) != len(columns):
        return option
    return " / ".join(f"{column}: {value}" for column, value in zip(columns, values))


def extract_answers(text: str) -> dict[int, str]:
    answers: dict[int, str] = {}
    for number, label in re.findall(r"問\s*([0-9０-９]+)\s+([アイウエオカキクケコ])", text):
        answers[normalize_number(number)] = label
    return answers


def question_blocks(text: str, count: int) -> dict[int, str]:
    matches = [
        match
        for match in re.finditer(r"(?m)^問\s*([0-9０-９]+)\s+", text)
        if 1 <= normalize_number(match.group(1)) <= count
    ]
    blocks: dict[int, str] = {}
    for index, match in enumerate(matches):
        number = normalize_number(match.group(1))
        if number in blocks:
            continue
        end = matches[index + 1].start() if index + 1 < len(matches) else len(text)
        blocks[number] = text[match.start() : end].strip()
    return blocks


def split_choices(question_id: str, block: str) -> tuple[str, list[str]]:
    choice_region_offset = 0
    choice_region = block
    answer_group_index = block.rfind("解答群")
    if answer_group_index != -1:
        choice_region_offset = answer_group_index + len("解答群")
        choice_region = block[choice_region_offset:]

    matches = list(
        re.finditer(
            r"(?m)(^|[ \n])([アイウエオカキクケコ])\s+(?![ァィゥェォャュョッー])",
            choice_region,
        )
    )
    if not matches:
        raise ValueError("選択肢ラベルが見つかりません")

    first = matches[0]
    columns = answer_group_columns(choice_region[: first.start()])
    stem_end = answer_group_index if answer_group_index != -1 else choice_region_offset + first.start()
    stem = block[:stem_end].strip()
    options: list[str] = []
    for index, match in enumerate(matches):
        start = choice_region_offset + match.end()
        end = (
            choice_region_offset + matches[index + 1].start()
            if index + 1 < len(matches)
            else len(block)
        )
        option = block[start:end].strip()
        option = re.sub(r"^解答群\s*", "", option)
        option = re.sub(r"\s*[－-]\s*\d+\s*[－-]\s*$", "", option).strip()
        option = normalize_markdown_text(option)
        options.append(with_answer_group_columns(option, columns))

    stem = re.sub(r"^問\s*[0-9０-９]+\s*", "", stem).strip()
    stem = normalize_markdown_text(stem)
    stem = remove_answer_group_fragment(stem)
    if question_id == "sg-sample-set-q52":
        supplement = (
            "補足（本データ）: NPCは，B社の従業員が在宅勤務で利用するPCを"
            "指すものとして読んでください。"
        )
        marker = "B 社は，A 社 PC 規程と同様の規程を作成して順守することにした。"
        if marker in stem:
            stem = stem.replace(marker, f"{supplement}  \n{marker}", 1)
        else:
            stem = f"{supplement}  \n{stem}"
    options = OPTION_FIXES.get(question_id, options)
    return stem, options


def has(text: str, *keywords: str) -> bool:
    packed_text = re.sub(r"\s+", "", text)
    return all(re.sub(r"\s+", "", keyword) in packed_text for keyword in keywords)


def beginner_note(question_id: str, stem: str, correct: str) -> tuple[str, str]:
    if question_id in CASE_NOTES:
        return CASE_NOTES[question_id]

    text = f"{stem} {correct}"

    if has(text, "JIS Q 31000", "リスクマネジメントプロセス"):
        return (
            "リスク特定は見つける，リスク分析は性質や大きさを理解する，リスク評価は基準と比べる，リスク対応は対策を選んで実施する工程。",
            "選択肢は工程名と説明が入れ替わっているものが多い。どの動詞がどの工程に対応するかで判定する。",
        )
    if has(text, "リスクアセスメント", "JIS Q 31000"):
        return (
            "リスクアセスメントは，リスク特定，リスク分析，リスク評価のまとまり。対応や受容はその後のリスク対応側で扱う。",
            "“アセスメント”は評価作業全体の名前なので，対策を実施する言葉が入っている選択肢は外す。",
        )
    if has(text, "リスクを受容"):
        return (
            "リスク受容は，残ったリスクを組織として受け入れる判断。勝手に放置するのではなく，リスク所有者が承認する。",
            "受容したリスクも監視やレビューの対象になる。分析前に受容したり，対応後に誰の承認もなく決めたりしない。",
        )
    if has(text, "リスクレベル"):
        return (
            "リスクレベルは，結果の大きさと発生しやすさを組み合わせたリスクの大きさ。弱点そのものや優先順位そのものとは違う。",
            "リスク用語は“脅威・脆弱性・リスク・リスクレベル”を分けて覚える。定義文で結果と起こりやすさが出たらリスクレベル。",
        )
    if "退職する従業員" in text or "退職予定者" in text:
        return (
            "退職前後は内部不正のリスクが高く，重要情報の持出し監視，アクセス権の見直し，秘密保持の再確認が必要になる。",
            "秘密保持対象を曖昧にしたり，退職後も権限を残したりするのは逆効果。退職間際のアクセスや媒体持出しを強めに見る。",
        )
    if "是正処置" in text or "不適合" in text:
        return (
            "是正処置は，不適合が起きた後に原因を取り除き，再発を防ぐための処置。単に今ある不具合を直す“修正”より一段深い。",
            "“原因を除去し，再発防止”という言葉が出たら是正処置。継続的改善やリスクアセスメントとは目的が違う。",
        )
    if "サポートユーティリティ" in text:
        return (
            "サポートユーティリティは，情報システムの稼働を支える電力，空調，給排水，通信などの設備・サービスを指す。",
            "サーバ室の空調はシステムを支える基盤。保守契約や管理者のような人・契約そのものとは分けて考える。",
        )
    if "SIEM" in text:
        return (
            "SIEMは複数機器のログを集め，相関分析して異常の兆候を見つける仕組み。単体のファイアウォールやバックアップ製品ではない。",
            "“ログを集中管理して横断的に見る”という表現を探す。通信の暗号確認やファイル修復はSIEMの中心機能ではない。",
        )
    if "ゼロトラスト" in text:
        return (
            "ゼロトラストは，社内ネットワークだから安全とはみなさず，利用者・端末・通信を継続的に確認する考え方。",
            "ゼロデイ，ゼロ知識証明，振る舞い検知と名前が似た概念を混同しない。境界防御を前提にしない説明が正解。",
        )
    if "不正のトライアングル" in text:
        return (
            "不正のトライアングルは，動機・機会・正当化の三つ。機会は，不正を実行しやすい環境やルールの穴を指す。",
            "プレッシャは動機，言い訳は正当化，実行できる隙は機会。言葉と説明の対応で選ぶ。",
        )
    if "DNS キャッシュポイズニング" in text or "DNS キャッシュサーバ" in text:
        return (
            "DNSキャッシュポイズニングは，偽の名前解決結果をキャッシュに入れさせる攻撃。外部から誰でも再帰問い合わせできる状態は危険。",
            "キャッシュサーバは利用者の代わりに再帰問い合わせを行う。外部クライアントからの再帰問い合わせを閉じる対策が基本。",
        )
    if "CVSS" in text:
        return (
            "CVSSは脆弱性の深刻度を数値化する仕組み。基本評価は脆弱性そのもの，現状評価は攻撃コードや対策状況で時間により変わり，環境評価は利用環境で変わる。",
            "“時間の経過で変化する”は現状評価，“利用者ごと・環境ごとに変わる”は環境評価と整理する。",
        )
    if "特定電子メール" in text:
        return (
            "特定電子メール法は広告宣伝メールを規制し，送信者や送信委託者に義務を課す。原則は事前同意を得るオプトイン方式。",
            "受信拒否後だけ禁止するオプトアウト中心の説明や，委託事業者だけを対象にする説明は狭すぎる。",
        )
    if "ソーシャルエンジニアリング" in text or "緊急事態を装って" in text:
        return (
            "ソーシャルエンジニアリングは，人の心理や信頼関係を悪用してパスワードや機密情報を聞き出す攻撃。",
            "マルウェアの種類ではなく，人をだまして情報を出させる点が決め手。緊急性を装う手口は典型例。",
        )
    if "懲戒手続" in text:
        return (
            "懲戒は事実確認と公平な手続が必要。違反の可能性を認識しただけで直ちに処分へ進む規程は，適正な手続の観点で問題になりやすい。",
            "監査の指摘では，“証拠確認・弁明機会・手続の妥当性”が守られているかを見る。即時開始だけを定める規程を疑う。",
        )
    if "目標達成率" in text:
        return (
            "平均点を出してから目標値で割る計算問題。割合の問題では，分子が実績，分母が目標になる。",
            "満足度ごとの点数×回答数を合計し，回答数合計で割って平均を出す。その平均を4.0で割る。",
        )
    if "RASIS" in text or "MTBF" in text or "MTTR" in text:
        return (
            "RASISのRは信頼性，Aは可用性。信頼性はMTBF，可用性はMTBFとMTTRの関係で決まり，MTBFが長くMTTRが短いほど高い。",
            "可用性を上げるには故障しにくくするか，復旧を速くする。MTTRを長くする選択肢は不利になる。",
        )
    if "データマート" in text or "データウェアハウス" in text:
        return (
            "データウェアハウスは全社的に統合したデータ基盤，データマートは特定部門や分析目的に合わせて切り出したデータ集合。",
            "“企業全体”から“特定の分析目的”へ加工する流れならデータマート。規模と用途の違いで判断する。",
        )
    if "デジタルトランスフォーメーション" in text or "DX" in text:
        return (
            "デジタイゼーションはデータ化，デジタライゼーションは業務のデジタル化，DXはデジタルを使ってビジネスや意思決定の仕組み自体を変える段階。",
            "単なる紙の電子化や既存作業の効率化ではなく，AIシミュレーションなどで需給調整のやり方が変わっている選択肢を選ぶ。",
        )
    if "ラベル付け" in text or "社外秘情報" in text:
        return (
            "情報のラベル付けは，文書やデータの管理レベルを明示し，利用者に取扱いルールを認識させる対策。",
            "“知らなかった”を防ぐ目的なら，アクセス制限だけでなく，情報の区分を見える形にするラベル付けが効く。",
        )
    if "ビヘイビア法" in text or "マルウェアの検出方法" in text:
        return (
            "ビヘイビア法はプログラムを実行し，振る舞いからマルウェアらしさを検出する方法。静的なパターン照合とは違う。",
            "“実行する必要がある”という条件が決め手。チェックサムやパターンマッチングは実行前の比較で判断できる。",
        )
    if "サイバーキルチェーン" in text:
        return (
            "サイバーキルチェーンは，攻撃者の行動を偵察から目的達成まで段階化したモデル。攻撃の流れを分解して対策点を探すために使う。",
            "ブロックチェーンや中間者攻撃など，名前にチェーンや攻撃が含まれる別概念に引っ張られない。",
        )
    if "リスクベース認証" in text:
        return (
            "リスクベース認証は，普段と違うIPアドレス，端末，ブラウザ，場所などを検知したときに追加認証を求める方式。",
            "すべてのログインに同じ認証をするのではなく，状況の危険度に応じて認証強度を変える説明を選ぶ。",
        )
    if "サーバ証明書" in text or "HTTPS" in text or "HTTP over TLS" in text:
        return (
            "TLSでは，クライアントは認証局の公開鍵でサーバ証明書の正当性を検証し，接続先が本物か確認する。HTTPSはこの仕組みでサーバ認証と暗号化を行う。",
            "認証局の公開鍵は共通鍵や利用者データを暗号化するためではなく，証明書の署名を検証するために使う。",
        )
    if "個人情報保護法" in text:
        return (
            "個人情報保護法の個人情報は，生存する個人に関する情報で，特定の個人を識別できるもの。企業の顧客情報だけに限らない。",
            "“顧客だけ”“秘密だけ”“日本国籍だけ”のような限定は誤り。対象範囲の広さを押さえる。",
        )
    if "内部統制" in text and "統制活動" in text:
        return (
            "統制活動は，承認，照合，職務分掌，検証など，業務プロセスに組み込まれた具体的なコントロール。",
            "方針やリスク分析や監査そのものではなく，日々の処理の中で誤りや不正を防ぐ仕組みを選ぶ。",
        )
    if "プロキシサーバ" in text:
        return (
            "プロキシサーバは，社内PCの代わりにWebアクセスを中継する装置。キャッシュ，アクセス制御，ログ取得などにも使われる。",
            "“社内からインターネットへのWebアクセスを中継する”という説明があればプロキシ。DNSサーバやルータと役割を分ける。",
        )
    if "VDI" in text:
        return (
            "VDIをDMZ上で使うと，利用者PCが直接インターネット上のWebサイトへアクセスしない構成にできる。マルウェアを内部PCへ持ち込みにくくする効果がある。",
            "内部PCではなく仮想デスクトップ側でWeb閲覧する点が重要。すべての攻撃を防ぐわけではなく，ダウンロード経路の分離として見る。",
        )
    if "RPA" in text:
        return (
            "RPA導入は，単に今の作業をロボット化するだけでは失敗しやすい。業務プロセスを可視化し，見直してから自動化対象を決める。",
            "全社導入では部門ごとの部分最適ではなく，業務全体の流れを整理してから導入する選択肢を選ぶ。",
        )
    if "特性要因図" in text or "魚の骨" in text:
        return (
            "特性要因図は，結果と原因の関係を魚の骨の形で整理する品質管理の図。原因を体系的に洗い出すために使う。",
            "“原因と結果”“魚の骨”が出たら特性要因図。時系列や工程順の図ではない。",
        )
    if "情報セキュリティ管理基準" in text:
        return (
            "情報セキュリティ管理基準は，ISMSの要求事項や管理策の規格と整合を取りながら，組織の管理・監査の観点を整理する基準。",
            "“好きな管理策だけ選ぶ”というより，基準や規格との整合性を踏まえて管理状況を見るものとして理解する。",
        )
    if "アンチパスバック" in text:
        return (
            "アンチパスバックは，入室記録がないカードで退室できない，退室記録がないカードで再入室できないようにする入退室管理。",
            "カードの貸し借りや共連れを検知しやすくする仕組み。二人以上を必要とするルールや二重扉とは別概念。",
        )
    if "デジタルフォレンジックス" in text:
        return (
            "デジタルフォレンジックスは，インシデント時に証拠となるデータを保全し，調査・分析する活動。法的証拠性を意識する。",
            "単なるマルウェア検査や暗号化ではない。証拠の収集，保管，分析という流れがある説明を選ぶ。",
        )
    if "共通鍵" in text or "公開鍵暗号" in text or "AES" in text or "ハイブリッド暗号" in text:
        return (
            "共通鍵暗号は同じ鍵で暗号化・復号し，高速なので大量データ向き。公開鍵暗号は鍵配送や署名に便利だが処理は重い。ハイブリッド暗号は両方を組み合わせる。",
            "大量データなら共通鍵，鍵管理や相手確認には公開鍵，両立させるならハイブリッド，という役割分担で判断する。",
        )
    if "デジタル署名" in text and "秘密鍵" in text:
        return (
            "デジタル署名は，作成者が秘密鍵で署名し，受け取った人が対応する公開鍵で検証する。秘密鍵は本人だけが持つ前提。",
            "暗号化とは鍵の向きが違う。署名作成は秘密鍵，署名検証は公開鍵と覚える。",
        )
    if "SHA-256" in text or "ハッシュ値" in text:
        return (
            "暗号学的ハッシュは，同じ入力なら同じ固定長の値になる。SHA-256の出力は256ビットで，16進数では64桁。",
            "同じハッシュ値なら通常は同じ内容と考える問題。連結したから桁数が増える，毎回値が変わる，という理解は誤り。",
        )
    if "SPF" in text:
        return (
            "SPFは，送信ドメインが許可したメールサーバのIPアドレスをDNSに登録し，受信側が照合する仕組み。送信元ドメインのなりすまし検知に使う。",
            "メール本文や添付ファイルの安全性を判定する仕組みではない。DNSに登録された送信元IPを見る点を押さえる。",
        )
    if "HDD パスワード" in text or "内蔵ストレージ" in text:
        return (
            "PCの内蔵ストレージを抜き取られて別PCに接続されると，OSログインを迂回して読まれる危険がある。HDDパスワードや暗号化は保存データを守る対策。",
            "ネットワーク越しの攻撃ではなく，物理的にストレージを外される攻撃を想定している。端末内データを読ませない対策を選ぶ。",
        )
    if "ルートキット" in text:
        return (
            "ルートキットは，不正侵入後に攻撃用ツールやマルウェアの存在を隠し，管理者権限で潜伏し続けるための仕組み。",
            "感染させる入口そのものより，侵入後に見つかりにくくする点が特徴。OSに組み込んで隠す説明を選ぶ。",
        )
    if "BEC" in text or "Business E-mail Compromise" in text:
        return (
            "BECはビジネスメール詐欺。取引先や経営者などになりすまし，送金先変更や支払をだまして行わせる攻撃。",
            "技術的な侵入より，業務上の信頼関係とメールを悪用して金銭をだまし取る点が決め手。",
        )
    if "ボットネット" in text or "C&C サーバ" in text:
        return (
            "C&Cサーバは，ボット化した端末へ命令を出し，応答を受け取る指令サーバ。攻撃者が多数の感染端末を遠隔操作する中心になる。",
            "C&CはCommand and Controlの略。感染端末を管理・命令する役割を選ぶ。",
        )
    if "TCP ポート番号 80" in text:
        return (
            "TCP 80番はHTTPの標準ポートで，Web閲覧に使われるためファイアウォールで許可されていることが多い。マルウェア通信が紛れ込みやすい。",
            "ポート番号だけで安全とは判断できない。通常通信で許可されがちな経路を悪用する発想を押さえる。",
        )
    if "パスワードリスト攻撃" in text or "認証情報を複数のサービス" in text:
        return (
            "パスワードリスト攻撃は，流出したID・パスワードの組合せを別サービスにも試す攻撃。使い回しがあると成功しやすい。",
            "総当たりで全候補を試すブルートフォースではなく，既に漏えいした認証情報リストを使う点が決め手。",
        )
    if "ランダムサブドメイン攻撃" in text:
        return (
            "ランダムサブドメイン攻撃は，実在しない大量のサブドメインを問い合わせ，最終的に権威DNSサーバへ負荷を集中させる攻撃。",
            "オープンリゾルバは踏み台のように使われる。負荷を受ける中心は，対象ドメインを管理する権威DNSサーバ。",
        )
    if "SEO ポイズニング" in text:
        return (
            "SEOポイズニングは，検索順位を悪用して悪意あるサイトを検索結果の上位に表示させ，利用者を誘導する攻撃。",
            "メールやDNSで直接誘導するのではなく，検索エンジンの順位付けを悪用する点が特徴。",
        )
    if "SQL インジェクション" in text or "プレースホルダ" in text:
        return (
            "SQLインジェクションは，入力値をSQL文として解釈させて不正操作する攻撃。プレースホルダを使うと，入力値をSQL構文から分離できる。",
            "エスケープ漏れに頼るより，SQL文の構造と値を分ける対策が基本。Webアプリの脅威と対策の対応で選ぶ。",
        )
    if "電子署名法" in text:
        return (
            "電子署名は，本人による作成と改ざんされていないことを示すために使う。法律上，条件を満たす電子署名には押印に近い推定効が認められる。",
            "暗号技術だけの話ではなく，文書の真正性を法律上どう扱うかを問う問題として読む。",
        )
    if "メッセージ認証符号" in text or "改ざんされていない" in text:
        return (
            "メッセージ認証符号（MAC）は，共通鍵などを使ってメッセージの改ざん有無を確認するための短い値を作る仕組み。",
            "暗号文そのものや電子証明書ではなく，メッセージの完全性を確認する値を選ぶ。",
        )
    if "インシデント管理" in text:
        return (
            "インシデント管理では，種類，影響度，発生箇所に応じて連絡・報告・対応ルートを変える必要がある。全部同じ経路では重大度に合った対応が遅れる。",
            "監査では，実際の影響に応じたエスカレーションが設計されているかを見る。共通ルートだけの運用は指摘対象になりやすい。",
        )
    if "cookie" in text:
        return (
            "CookieはWebサーバがブラウザに保存させ，その後のHTTPリクエスト時にヘッダとして送られる小さな情報。",
            "サーバ側だけに保存されるものではなく，HTTPヘッダで送受信される点が重要。認証状態の管理にも使われる。",
        )
    if "BPM" in text:
        return (
            "BPMはBusiness Process Managementで，業務プロセスを分析・設計・実行・改善し続ける考え方。",
            "一度だけのシステム化ではなく，マネジメントサイクルで継続改善する説明を選ぶ。",
        )
    if "NISC" in text:
        return (
            "NISCは内閣サイバーセキュリティセンター。政府全体のサイバーセキュリティ戦略や調整を担う組織として押さえる。",
            "IPA，JIPDEC，JPCERT/CCはそれぞれ役割が違う。内閣官房に置かれた組織という条件がNISCの決め手。",
        )
    if "CRYPTREC" in text:
        return (
            "CRYPTRECは電子政府などで利用する暗号技術の安全性を評価・監視し，推奨暗号リストに関わるプロジェクト。",
            "輸出規制の審査や民間サーバの監視ではなく，暗号技術そのものの評価が役割。",
        )
    if "CAPTCHA" in text:
        return (
            "CAPTCHAは，人間によるアクセスかどうかを判定するために，画像文字の入力や操作などの応答を求める仕組み。",
            "本人認証というより，自動プログラムによる大量アクセスを防ぐ仕組みとして理解する。",
        )
    if "SMTP-AUTH" in text:
        return (
            "SMTP-AUTHは，メール送信時に送信者をメールサーバで認証する仕組み。迷惑メール対策や不正中継防止に使う。",
            "ドメインのなりすまし検知はSPFなど，送信時のユーザ認証はSMTP-AUTHと分ける。",
        )
    if "動的解析" in text or "サンドボックス" in text:
        return (
            "マルウェアの動的解析は，隔離されたサンドボックス上で実行し，挙動や通信を観測する方法。",
            "ファイルの文字列やハッシュだけを見る静的解析ではなく，“実行して観測する”点が決め手。",
        )
    if "ポートスキャナ" in text:
        return (
            "ポートスキャナは，対象サーバで開いているポートや稼働サービスを調べるツール。不要サービスの発見に使える。",
            "脆弱性を直接修正する道具ではない。まず露出しているサービスを列挙する目的で使う。",
        )
    if "特定個人情報" in text or "個人番号" in text:
        return (
            "個人番号は利用目的が厳しく限定されており，業務成績管理など番号法で認められない目的のファイル作成は禁止される。",
            "便利だから使う，社内だから使う，という判断はできない。個人番号は法定目的に限ると覚える。",
        )
    if "刑法" in text:
        return (
            "コンピュータにマルウェアを侵入させ，データを消去する行為は，不正指令電磁的記録や電子計算機損壊等業務妨害など刑法上の問題になり得る。",
            "個人情報保護法や著作権法ではなく，コンピュータへの加害行為を処罰する法律を選ぶ。",
        )
    if "著作権" in text:
        return (
            "委託開発のプログラム著作権は，契約で別に定めない限り，原則として作成した受託者側に原始的に帰属する。",
            "発注者が仕様を出しただけで自動的に著作権者になるわけではない。権利帰属は契約で明確にする必要がある。",
        )
    if "システムテスト" in text:
        return (
            "システムテスト監査では，業務要件に対してテストケースが網羅的に想定されているかを見る。単に実施した事実だけでは不十分。",
            "監査人は品質を直接作るのではなく，計画・証跡・網羅性・承認が妥当かを確認する。",
        )
    if "アクセス制御" in text and "監査" in text:
        return (
            "アクセス制御監査では，管理規程，権限設定，承認記録，棚卸し結果などを確認する。監査人自身が設定変更する立場ではない。",
            "監査は運用の妥当性を評価する活動。規程を閲覧するなど，証拠を集めて判断する行為を選ぶ。",
        )
    if "内部統制の整備及び運用" in text:
        return (
            "上場企業の内部統制は，最終的には経営者が整備・運用の責任を負う。現場や監査人だけの責任ではない。",
            "内部統制報告制度では，経営者の責任と監査人の評価・監査を分けて理解する。",
        )
    if "エラープルーフ" in text:
        return (
            "エラープルーフ化は，人が間違えにくいように作業環境や仕組みを設計すること。色分けや入力制限などが典型。",
            "教育や注意喚起だけに頼るのではなく，間違いが起きにくい状態を作る選択肢を選ぶ。",
        )
    if "インシデントに該当" in text:
        return (
            "インシデントは，サービスや業務に影響する可能性がある異常事象。プログラム異常終了のように運用へ影響するものも含む。",
            "単なる通常作業や予定された変更ではなく，サービス中断・品質低下・緊急対応につながる事象を選ぶ。",
        )
    if "WBS" in text:
        return (
            "WBSはWork Breakdown Structureで，プロジェクト作業を階層的に分解し，管理可能な単位にするためのもの。",
            "日程そのものではなく，作業範囲を漏れなく分けるための構造と覚える。",
        )
    if "PERT" in text:
        return (
            "PERTは作業の前後関係と所要時間から日程を分析する技法。クリティカルパスの把握にも使う。",
            "品質原因の分析や在庫評価ではなく，プロジェクトの日程計画に向く技法を選ぶ。",
        )
    if "デュプレックスシステム" in text:
        return (
            "デュプレックスシステムは，一方が稼働し，もう一方が待機する構成。障害時に待機系へ切り替える。",
            "二台が同時に同じ処理をするデュアルシステムとは違い，片方が待機している点が決め手。",
        )
    if "監査ログ" in text:
        return (
            "監査ログは，誰がいつ何をしたかを後から追跡するために取得する。問題発生後の調査や証跡確認に使う。",
            "アクセス拒否や復旧そのものを行う機能ではない。事後確認のための記録という役割で考える。",
        )
    if "BPO" in text:
        return (
            "BPOはBusiness Process Outsourcingで，自社業務の一部または全部を外部専門企業へ委託すること。",
            "単なるシステム購入や人材派遣ではなく，業務プロセス単位で外部に任せる点を押さえる。",
        )
    if "ステークホルダ" in text:
        return (
            "ステークホルダは企業活動の影響を受ける利害関係者。環境対策や雇用創出では地域社会も便益を受ける。",
            "株主や従業員だけでなく，企業が立地する地域や取引先，顧客も対象になる。",
        )
    if "先入先出法" in text:
        return (
            "先入先出法では，先に仕入れたものから先に払い出されたとみなし，期末在庫は後から仕入れた単価で評価する。",
            "期末数量を後ろの仕入れから順に埋める。古い単価から平均する問題ではない。",
        )
    if "売上総利益" in text:
        return (
            "売上総利益は売上高から売上原価を引く。製造業では，当期製品製造原価と期首・期末製品棚卸高から売上原価を計算する。",
            "材料費・労務費・経費から当期総製造費用を出し，仕掛品と製品棚卸を順に調整する。",
        )

    if "A 社" in stem or "表" in stem or "図" in stem:
        return (
            "ケース問題では，登場人物，守る資産，発生しているリスク，問題文の制約を分けて読む。選択肢は“目的に直接効くか”で判定する。",
            "正解は問題文の条件を最も素直に満たすもの。効果が別のリスクに向いている選択肢，過剰な対策，条件外の前提を置く選択肢を外す。",
        )

    return (
        "この問題は，用語の名前ではなく，その目的・使う場面・防げるリスクを対応させることが重要。",
        "正解選択肢が，問題文で求められている目的に直接対応しているかを確認する。似た用語は“何を入力にし，何を防ぎ，誰が使うか”で分ける。",
    )


def build_explanation(
    source: dict[str, object],
    question_id: str,
    number: int,
    stem: str,
    options: list[str],
    answer_label: str,
) -> str:
    correct = options[CHOICE_INDEX[answer_label]]
    knowledge, approach = beginner_note(question_id, stem, correct)
    source_note = f"出典：{source['source_label']} 問{number}"
    if question_id == "sg-sample-set-q52":
        source_note += "\n補足：単独表示で読めるよう，NPCの読み方を本文に補足しています。"
    return (
        f"正解は「{answer_label}」。\n\n"
        f"必要知識:\n- {knowledge}\n\n"
        f"考え方:\n- {approach}\n\n"
        f"{source_note}"
    )


def build_questions() -> list[dict[str, object]]:
    questions: list[dict[str, object]] = []
    for source in SOURCES:
        qs_text = clean_lines(pdf_text(download(source["qs_url"])))
        if source.get("truncate_before") and source["truncate_before"] in qs_text:
            qs_text = qs_text.split(source["truncate_before"], 1)[0]
        answers = extract_answers(pdf_text(download(source["ans_url"])))
        blocks = question_blocks(qs_text, source["question_count"])
        missing = set(range(1, source["question_count"] + 1)) - set(blocks)
        if missing:
            raise ValueError(f"{source['prefix']}: 問題抽出漏れ {sorted(missing)}")

        for number in range(1, source["question_count"] + 1):
            answer_label = answers.get(number)
            if answer_label is None:
                raise ValueError(f"{source['prefix']}: 問{number} の正答が見つかりません")
            question_id = f"{source['prefix']}-q{number:02d}"
            stem, options = split_choices(question_id, blocks[number])
            if answer_label not in CHOICE_INDEX or CHOICE_INDEX[answer_label] >= len(options):
                raise ValueError(
                    f"{source['prefix']}: 問{number} の正答 {answer_label} が選択肢範囲外"
                )
            questions.append(
                {
                    "id": question_id,
                    "style": "oneshot",
                    "type": "single-choice",
                    "text": stem,
                    "options": options,
                    "answer": CHOICE_INDEX[answer_label],
                    "explanation": build_explanation(
                        source, question_id, number, stem, options, answer_label
                    ),
                    "domain": source["domain"],
                }
            )
    return questions


def main() -> None:
    questions = build_questions()
    OUT.write_text(
        json.dumps({"questions": questions}, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"wrote {len(questions)} questions to {OUT}")


if __name__ == "__main__":
    main()
