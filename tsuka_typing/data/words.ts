export interface Word {
  kanji: string
  hiragana: string
  romaji: string
  difficulty: 1 | 2 | 3
}

export interface Enemy {
  id: string
  name: string
  emoji: string
  maxHp: number
  attackPower: number
  color: string
  description: string
}

// difficulty: 1 = <= 10 chars, 2 = 11-20 chars, 3 = 21+ chars
export const WORDS: Word[] = [
  // { kanji: '', hiragana: '', romaji: '', difficulty: 1 },
  { kanji: 'すぺしゃりて', hiragana: 'すぺしゃりて', romaji: 'supesyarite', difficulty: 2 },
  { kanji: '領国つかさ', hiragana: 'りょうごくつかさ', romaji: 'ryougokutsukasa', difficulty: 2 },
  { kanji: '額ずけ諸君！', hiragana: 'ぬかずけしょくん！', romaji: 'nukazukesyokun!', difficulty: 2 },
  { kanji: '最強天才中学生', hiragana: 'さいきょうてんさいちゅうがくせい', romaji: 'saikyoutennsaityuugakusei', difficulty: 3 },
  { kanji: 'つかさキングダム', hiragana: 'つかさきんぐだむ', romaji: 'tsukasakingudamu', difficulty: 2 },
  { kanji: '人類皆ドM理論', hiragana: 'じんるいみんなどえむりろん', romaji: 'jinnruiminnnadoemurironn', difficulty: 3 },
  { kanji: '破滅願望', hiragana: 'はめつがんぼう', romaji: 'hametugannbou', difficulty: 2 },
  { kanji: 'チンチンのホットミルク', hiragana: 'ちんちんのほっとみるく', romaji: 'tintinnohottomiruku', difficulty: 2 },
  { kanji: 'ファナモ', hiragana: 'ふぁなも', romaji: 'fanamo', difficulty: 1 },
  { kanji: 'メスガキ', hiragana: 'めすがき', romaji: 'mesugaki', difficulty: 1 },
  { kanji: 'マイクロビキニ', hiragana: 'まいくろびきに', romaji: 'maikurobikini', difficulty: 2 },
  { kanji: '白スク', hiragana: 'しろすく', romaji: 'sirosuku', difficulty: 1 },
  { kanji: '脾臓2倍', hiragana: 'ひぞうにばい', romaji: 'hizou2bai', difficulty: 1 },
  { kanji: 'シングルタスク', hiragana: 'しんぐるたすく', romaji: 'singurutasuku', difficulty: 2 },
  { kanji: '復活', hiragana: 'ふっかつ', romaji: 'fukkatu', difficulty: 1 },
  { kanji: '放課後DEATHタイム君に告白！', hiragana: 'ほうかごdeathたいむきみにこくはく！', romaji: 'houkagodeathtaimukiminikokuhaku!', difficulty: 3 },
  { kanji: '死になさい', hiragana: 'しになさい', romaji: 'sininasai', difficulty: 1 },
  { kanji: '脳筋', hiragana: 'のうきん', romaji: 'noukinn', difficulty: 1 },
  { kanji: 'リミナルスペース', hiragana: 'りみなるすぺーす', romaji: 'riminarusupe-su', difficulty: 2 },
  { kanji: 'ガチ恋０人', hiragana: 'がちこい０にん', romaji: 'gatikoi0nin', difficulty: 2 },
  { kanji: '三大欲求', hiragana: 'さんだいよっきゅう', romaji: 'sandaiyokkyuu', difficulty: 2 },
  { kanji: '強火', hiragana: 'つよび', romaji: 'tuyobi', difficulty: 1 },
  { kanji: '感度3000倍', hiragana: 'かんど3000ばい', romaji: 'kando3000bai', difficulty: 2 },
  { kanji: '活舌', hiragana: 'かつぜつ', romaji: 'katuzetu', difficulty: 1 },
  { kanji: 'mp4配信', hiragana: 'mp4はいしん', romaji: 'mp4haisin', difficulty: 1 },
  { kanji: 'ASMR', hiragana: 'ASMR', romaji: 'asmr', difficulty: 1 },
  { kanji: 'ドジっ子メイドつかさちゃん', hiragana: 'どじっこめいどつかさちゃん', romaji: 'dojikkomeidotsukasachan', difficulty: 3 },
  { kanji: 'つかナイト', hiragana: 'つかないと', romaji: 'tsukanaito', difficulty: 1 },
  { kanji: 'なにぬねの', hiragana: 'なにぬねの', romaji: 'naninuneno', difficulty: 1 },
  { kanji: 'らりるれろ', hiragana: 'らりるれろ', romaji: 'rarirurero', difficulty: 1 },
  { kanji: '領国民', hiragana: 'りょうごくみん', romaji: 'ryougokumin', difficulty: 1 },
  { kanji: 'ぬか漬け', hiragana: 'ぬかづけ', romaji: 'nukazuke', difficulty: 1 },
  { kanji: '奇妙ちゃん', hiragana: 'きみょうちゃん', romaji: 'kimyouchan', difficulty: 1 },
  { kanji: '15歳', hiragana: '15さい', romaji: '15sai', difficulty: 1 },
  { kanji: '絶頂', hiragana: 'ぜっちょう', romaji: 'zettyou', difficulty: 1 },
  { kanji: 'つか虐', hiragana: 'つかぎゃく', romaji: 'tsukagyaku', difficulty: 1 },
  { kanji: '傲慢不遜', hiragana: 'ごうまんふそん', romaji: 'goumanhusonn', difficulty: 2 },
  { kanji: '私立王成学園', hiragana: 'しりつおうじょがくえん', romaji: 'sirituojougakuenn', difficulty: 2 },
  { kanji: '最強の国', hiragana: 'さいきょうのくに', romaji: 'saikyounokuni', difficulty: 2 },
  { kanji: 'ヒステリック', hiragana: 'ひすてりっく', romaji: 'hisuterikku', difficulty: 1 },
  { kanji: 'モラハラ', hiragana: 'もらはら', romaji: 'morahara', difficulty: 1 },
  // ─── ハッシュタグ ───────────────────────────────────
  { kanji: 'つかさ国営放送', hiragana: 'つかさこくえいほうそう', romaji: 'tsukasakokueihousou', difficulty: 2 },
  { kanji: 'つかさ肖像画', hiragana: 'つかさしょうぞうが', romaji: 'tsukasasyouzouga', difficulty: 2 },
  { kanji: '領国大使館', hiragana: 'りょうごくたいしかん', romaji: 'ryougokutaisikan', difficulty: 2 },
  { kanji: '切り抜け諸君', hiragana: 'きりぬけしょくん', romaji: 'kirinukesyokunn', difficulty: 2 },
  { kanji: 'つかぬいちゃん', hiragana: 'つかぬいちゃん', romaji: 'tsukanuichann', difficulty: 1 },
  // ─── イベント ───────────────────────────────────
  { kanji: '絶対ぼくの領域', hiragana: 'ぜったいぼくのきんぐだむ', romaji: 'zettaibokunokingudamu', difficulty: 3 },
  { kanji: '禁断ノ幻想郷', hiragana: 'きんだんのあるかでぃあ', romaji: 'kindannnoarukadhia', difficulty: 2 },
  { kanji: '神臨ノ前奏曲', hiragana: 'かみりんのぷれりゅーど', romaji: 'kamirinnnopureryu-do', difficulty: 2 },
  { kanji: '領国つかさの深夜通信DarkWeb', hiragana: 'りょうごくつかさのしんやつうしんdarkweb', romaji: 'ryougokutsukasanoshinyatushinndarkweb', difficulty: 3 },
  { kanji: '謁見ティ～タイム', hiragana: 'えっけんてぃーたいむ', romaji: 'ekkenteli-taimu', difficulty: 2 },
  // ─── 好物 ───────────────────────────────────
  { kanji: 'ホラーゲーム', hiragana: 'ほらーげーむ', romaji: 'hora-ge-mu', difficulty: 1 },
  { kanji: 'うなぎ', hiragana: 'うなぎ', romaji: 'unagi', difficulty: 1 },
  { kanji: '朝マクー', hiragana: 'あさまくー', romaji: 'asamaku-', difficulty: 1 },
  { kanji: 'ハートチップル焼肉にんにく焙煎味', hiragana: 'はーとちっぷるやきにくにんにくばいせんあじ', romaji: 'ha-totippuruyakinikuninnnikubaisennaji', difficulty: 3 },
  { kanji: '眼鏡', hiragana: 'めがね', romaji: 'megane', difficulty: 1 },
  { kanji: '犬', hiragana: 'いぬ', romaji: 'inu', difficulty: 1 },
  { kanji: '猫', hiragana: 'ねこ', romaji: 'neko', difficulty: 1 },
  // ─── コラボタグ ───────────────────────────────────
  { kanji: 'つかにゃあず', hiragana: 'つかにゃあず', romaji: 'tsukanyaazu', difficulty: 2 },
  { kanji: 'なのでつかｗ', hiragana: 'なのでつかw', romaji: 'nanodetukaw', difficulty: 2 },
  { kanji: 'つかぷー', hiragana: 'つかぷー', romaji: 'tsukapu-', difficulty: 1 },
  { kanji: '神回量産機', hiragana: 'かみかいりょうさんき', romaji: 'kamikairyousannki', difficulty: 2 },
  { kanji: '罪', hiragana: 'つみ', romaji: 'tumi', difficulty: 1 },
  { kanji: 'ぼくのいぬ', hiragana: 'ぼくのいぬ', romaji: 'bokunoinu', difficulty: 1 },
  // ─── セリフ ───────────────────────────────────
  { kanji: 'GOD', hiragana: 'god', romaji: 'god', difficulty: 1 },
  { kanji: '御意', hiragana: 'ぎょい', romaji: 'gyoi', difficulty: 1 },
  { kanji: 'おつかさ', hiragana: 'おつかさ', romaji: 'otsukasa', difficulty: 1 },
  { kanji: 'でっかぁ', hiragana: 'でっかぁ', romaji: 'dekkala', difficulty: 1 },
  { kanji: 'よわよわ～', hiragana: 'よわよわー', romaji: 'yowayowa-', difficulty: 1 },
  { kanji: 'ざっこ～', hiragana: 'ざっこー', romaji: 'zakkou-', difficulty: 1 },
  { kanji: 'すやすやぷぅぷぅ', hiragana: 'すやすやぷぅぷぅ', romaji: 'suyasuyapulupulu', difficulty: 2 },
  { kanji: 'タマタマ教', hiragana: 'たまたまきょう', romaji: 'tamatamakyou', difficulty: 2 },
  { kanji: '鳥天', hiragana: 'とりてん', romaji: 'toritenn', difficulty: 1 },
    // ─── ダジャレ ───────────────────────────────────
  { kanji: '雑魚どもVSザ子供', hiragana: 'ざこどもVSざこども', romaji: 'zakodomovszakodomo', difficulty: 2 },
  { kanji: 'マイカーが潰れた、まーいっか', hiragana: 'まいかーがつぶれた、まーいっか', romaji: 'maika-gatsubureta, ma-ikka', difficulty: 3 },
  { kanji: '汗がダックダック', hiragana: 'あせがだっくだっく', romaji: 'asegadakkudakku', difficulty: 2 },
  { kanji: '活発なカッパ2', hiragana: 'かっぱつなかっぱつー', romaji: 'kappatunakappatu-', difficulty: 2 },
  { kanji: '奴は四天王、八つ橋天皇', hiragana: 'やつはしてんのう、やつはしてんのう', romaji: 'yatuhasitennnou,yatuhasitennnou', difficulty: 3 },
  { kanji: 'ゾウ2頭に雑煮投下', hiragana: 'ぞうにとうにぞうにとうか', romaji: 'zounitounizounitouka', difficulty: 2 },
  { kanji: 'みたらし団子見たら死んだンゴ', hiragana: 'みたらしだんごみたらしんだんご', romaji: 'mitarasidanngomitarasinndanngo', difficulty: 3 },
  { kanji: '懲役くらって超エキサイティング', hiragana: 'ちょうえきくらってちょうえきさいてぃんぐ', romaji: 'tyouekikurattetyouekisaitelingu', difficulty: 3 },
  { kanji: '卵の数、エッグ～', hiragana: 'たまごのかず、えっぐー', romaji: 'tamagonokazu,eggu-', difficulty: 2 },
  { kanji: '液晶？え～きっしょ～', hiragana: 'えきしょう？えーきっしょー', romaji: 'ekisyou?e-kissyo-', difficulty: 2 },
  { kanji: 'セミと添い寝、セミダブルベッド', hiragana: 'せみとそいね、せみだぶるべっど', romaji: 'semitosoine,semidaburubeddo', difficulty: 3 },
  { kanji: 'でかいケツで解決', hiragana: 'でかいけつでかいけつ', romaji: 'dekaiketudekaiketu', difficulty: 2 },
  { kanji: '誘拐したのはYouかい？', hiragana: 'ゆうかいしたのはyouかい？', romaji: 'yuukaisitanohayoukai?', difficulty: 3 },
  { kanji: '宇宙の中学生、うちゅうがくせい', hiragana: 'うちゅうのちゅうがくせい、うちゅうがくせい', romaji: 'utyuunotyuugakusei,utyuugakusei', difficulty: 3 },
  { kanji: 'カメ、ラクダ、サイ。カメラくださーい', hiragana: 'かめ、らくだ、さい、かめらくださーい', romaji: 'kame,rakuda,sai,kamerakudasa-i', difficulty: 3 },
  { kanji: '犬がいぬ！', hiragana: 'いぬがいぬ！', romaji: 'inugainu!', difficulty: 1 },
  { kanji: '浮き輪ウキウキ', hiragana: 'うきわうきうき', romaji: 'ukiwaukiuki', difficulty: 2 },
  { kanji: '太陽当たんないよう', hiragana: 'たいようあたんないよう', romaji: 'taiyouatannnaiyou', difficulty: 2 },
  { kanji: '犬の卒倒、ワンパターン', hiragana: 'いぬのそっとう、わんぱたーん', romaji: 'inunosottou,wanpata-nn', difficulty: 3 },
  { kanji: 'うわ、キリがないな～。霧だけに', hiragana: 'うわ、きりがないな～。きりだけに', romaji: 'uwa, kiriganainaa~. kiridakeni', difficulty: 3 },
  { kanji: 'この猛暑はもうしょうがない', hiragana: 'このもうしょはもうしょうがない', romaji: 'konomousyohamousyouganai', difficulty: 3 },
  { kanji: '王手で横転', hiragana: 'おうてでおうてん', romaji: 'outedeoutenn', difficulty: 1 },
  // ─── すぺしゃりてメンバー セリフ ───────────────────────────────────
  { kanji: 'その前に水を飲む！', hiragana: 'そのまえにみずをのむ！', romaji: 'sonomaenimizuwonomu!', difficulty: 2 },
  { kanji: 'うっひょ～～～', hiragana: 'うっひょーーー', romaji: 'uhhyo---', difficulty: 1 },
]

export const ENEMIES: Enemy[] = [
  {
    id: 'tsukasa',
    name: '領国つかさ',
    emoji: '🐱',
    maxHp: 150,
    attackPower: 0,
    color: '#44ff88',
    description: 'よわよわの敵',
  },
]