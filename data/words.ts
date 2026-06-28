export interface Word {
  kanji: string
  hiragana: string
  romaji: string
  difficulty: 1 | 2 | 3
  points: number
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

export const WORDS: Word[] = [
  // { kanji: '', hiragana: '', romaji: '', difficulty: 1, points: 0 },
  { kanji: 'すぺしゃりて', hiragana: 'すぺしゃりて', romaji: 'supesyarite', difficulty: 1, points: 0 },
  { kanji: '領国つかさ', hiragana: 'りょうごくつかさ', romaji: 'ryougokutsukasa', difficulty: 1, points: 0 },
  { kanji: '額ずけ諸君！', hiragana: 'ぬかずけしょくん！', romaji: 'nukazukesyokun!', difficulty: 1, points: 0 },
  { kanji: '最強天才中学生', hiragana: 'さいきょうてんさいちゅうがくせい', romaji: 'saikyoutennsaityuugakusei', difficulty: 1, points: 0 },
  { kanji: 'つかさキングダム', hiragana: 'つかさきんぐだむ', romaji: 'tsukasakingudamu', difficulty: 1, points: 0 },
  { kanji: '人類皆ドM理論', hiragana: 'じんるいみんなどえむりろん', romaji: 'jinnruiminnnadoemurironn', difficulty: 1, points: 0 },
  { kanji: '破滅願望', hiragana: 'はめつがんぼう', romaji: 'hametugannbou', difficulty: 1, points: 0 },
  { kanji: 'チンチンのホットミルク', hiragana: 'ちんちんのほっとみるく', romaji: 'tintinnohottomiruku', difficulty: 1, points: 0 },
  { kanji: 'ファナモ', hiragana: 'ふぁなも', romaji: 'fanamo', difficulty: 1, points: 0 },
  { kanji: 'メスガキ', hiragana: 'めすがき', romaji: 'mesugaki', difficulty: 1, points: 0 },
  { kanji: 'マイクロビキニ', hiragana: 'まいくろびきに', romaji: 'maikurobikini', difficulty: 1, points: 0 },
  { kanji: '脾臓2倍', hiragana: 'ひぞうにばい', romaji: 'hizou2bai', difficulty: 1, points: 0 },
  { kanji: 'シングルタスク', hiragana: 'しんぐるたすく', romaji: 'singurutasuku', difficulty: 1, points: 0 },
  { kanji: '復活', hiragana: 'ふっかつ', romaji: 'fukkatu', difficulty: 1, points: 0 },
  { kanji: '放課後DEATHタイム君に告白！', hiragana: 'ほうかごdeathたいむきみにこくはく！', romaji: 'houkagodeathtaimukiminikokuhaku!', difficulty: 1, points: 0 },
  // ─── ハッシュタグ ───────────────────────────────────
  { kanji: 'つかさ国営放送', hiragana: 'つかさこくえいほうそう', romaji: 'tsukasakokueihousou', difficulty: 1, points: 0 },
  { kanji: 'つかさ肖像画', hiragana: 'つかさしょうぞうが', romaji: 'tsukasasyouzouga', difficulty: 1, points: 0 },
  { kanji: '領国大使館', hiragana: 'りょうごくたいしかん', romaji: 'ryougokutaisikan', difficulty: 1, points: 0 },
  { kanji: '切り抜け諸君', hiragana: 'きりぬけしょくん', romaji: 'kirinukesyokunn', difficulty: 1, points: 0 },
  // ─── イベント ───────────────────────────────────
  { kanji: '絶対ぼくの領域', hiragana: 'ぜったいぼくのきんぐだむ', romaji: 'zettaibokunokingudamu', difficulty: 1, points: 0 },
  { kanji: '禁断ノ幻想郷', hiragana: 'きんだんのあるかでぃあ', romaji: 'kindannnoarukadhia', difficulty: 1, points: 0 },
  { kanji: '神臨ノ前奏曲', hiragana: 'かみりんのぷれりゅーど', romaji: 'kamirinnnopureryu-do', difficulty: 1, points: 0 },
  { kanji: '領国つかさの深夜通信', hiragana: 'りょうごくつかさのしんやつうしん', romaji: 'ryougokutsukasanoshinyatushin', difficulty: 1, points: 0 },
  { kanji: '謁見ティ～タイム', hiragana: 'えっけんてぃーたいむ', romaji: 'ekkenteli-taimu', difficulty: 1, points: 0 },
  // ─── 好物 ───────────────────────────────────
  { kanji: 'ホラーゲーム', hiragana: 'ほらーげーむ', romaji: 'hora-ge-mu', difficulty: 1, points: 0 },
  { kanji: 'うなぎ', hiragana: 'うなぎ', romaji: 'unagi', difficulty: 1, points: 0 },
  { kanji: '朝マクー', hiragana: 'あさまくー', romaji: 'asamaku-', difficulty: 1, points: 0 },
  { kanji: 'ハートチップル焼肉にんにく焙煎味', hiragana: 'はーとちっぷるやきにくにんにくばいせんあじ', romaji: 'ha-totippuruyakinikuninnnikubaisennaji', difficulty: 1, points: 0 },
  // ─── コラボタグ ───────────────────────────────────
  { kanji: 'つかにゃあず', hiragana: 'つかにゃあず', romaji: 'tsukanyaazu', difficulty: 1, points: 0 },
  { kanji: 'なのでつかｗ', hiragana: 'なのでつかw', romaji: 'nanodetukaw', difficulty: 1, points: 0 },
  { kanji: 'つかぷー', hiragana: 'つかぷー', romaji: 'tsukapu-', difficulty: 1, points: 0 },
  { kanji: '神回量産機', hiragana: 'かみかいりょうさんき', romaji: 'kamikairyousannki', difficulty: 1, points: 0 },
  { kanji: '罪', hiragana: 'つみ', romaji: 'tumi', difficulty: 1, points: 0 },
  { kanji: 'ぼくのいぬ', hiragana: 'ぼくのいぬ', romaji: 'bokunoinu', difficulty: 1, points: 0 },
  // ─── セリフ ───────────────────────────────────
  { kanji: 'GOD', hiragana: 'god', romaji: 'god', difficulty: 1, points: 0 },
  { kanji: '御意', hiragana: 'ぎょい', romaji: 'gyoi', difficulty: 1, points: 0 },
  { kanji: 'おつかさ', hiragana: 'おつかさ', romaji: 'otsukasa', difficulty: 1, points: 0 },
  { kanji: 'でっかぁ', hiragana: 'でっかぁ', romaji: 'dekkala', difficulty: 1, points: 0 },
  { kanji: 'よわよわ～', hiragana: 'よわよわー', romaji: 'yowayowa-', difficulty: 1, points: 0 },
  { kanji: 'すやすやぷぅぷぅ', hiragana: 'すやすやぷぅぷぅ', romaji: 'suyasuyapulupulu', difficulty: 1, points: 0 },
  { kanji: 'タマタマ教', hiragana: 'たまたまきょう', romaji: 'tamatamakyou', difficulty: 1, points: 0 },
  { kanji: '鳥天', hiragana: 'とりてん', romaji: 'toritenn', difficulty: 1, points: 0 },
    // ─── ダジャレ ───────────────────────────────────
  { kanji: '雑魚どもVSザ子供', hiragana: 'ざこどもVSざこども', romaji: 'zakodomovszakodomo', difficulty: 1, points: 0 },
  { kanji: 'マイカーが潰れた、まーいっか', hiragana: 'まいかーがつぶれた、まーいっか', romaji: 'maika-gatsubureta, ma-ikka', difficulty: 1, points: 0 },
  { kanji: '汗がダックダック', hiragana: 'あせがだっくだっく', romaji: 'asegadakkudakku', difficulty: 1, points: 0 },
  { kanji: '活発なカッパ2', hiragana: 'かっぱつなかっぱつー', romaji: 'kappatunakappatu-', difficulty: 1, points: 0 },
  { kanji: '奴は四天王、八つ橋天皇', hiragana: 'やつはしてんのう、やつはしてんのう', romaji: 'yatuhasitennnou,yatuhasitennnou', difficulty: 1, points: 0 },
  { kanji: 'ゾウ2頭に雑煮投下', hiragana: 'ぞうにとうにぞうにとうか', romaji: 'zounitounizounitouka', difficulty: 1, points: 0 },
  { kanji: 'みたらし団子見たら死んだンゴ', hiragana: 'みたらしだんごみたらしんだんご', romaji: 'mitarasidanngomitarasinndanngo', difficulty: 1, points: 0 },
  { kanji: '懲役くらって超エキサイティング', hiragana: 'ちょうえきくらってちょうえきさいてぃんぐ', romaji: 'tyouekikurattetyouekisaitelingu', difficulty: 1, points: 0 },
  { kanji: '卵の数、エッグ～', hiragana: 'たまごのかず、えっぐー', romaji: 'tamagonokazu,eggu-', difficulty: 1, points: 0 },
  { kanji: '液晶？え～きっしょ～', hiragana: 'えきしょう？えーきっしょー', romaji: 'ekisyou?e-kissyo-', difficulty: 1, points: 0 },
  { kanji: 'セミと添い寝、セミダブルベッド', hiragana: 'せみとそいね、せみだぶるべっど', romaji: 'semitosoine,semidaburubeddo', difficulty: 1, points: 0 },
  { kanji: 'でかいケツで解決', hiragana: 'でかいけつでかいけつ', romaji: 'dekaiketudekaiketu', difficulty: 1, points: 0 },
  { kanji: '誘拐したのはYouかい？', hiragana: 'ゆうかいしたのはyouかい？', romaji: 'yuukaisitanohayoukai?', difficulty: 1, points: 0 },
  { kanji: '宇宙の中学生、うちゅうがくせい', hiragana: 'うちゅうのちゅうがくせい、うちゅうがくせい', romaji: 'utyuunotyuugakusei,utyuugakusei', difficulty: 1, points: 0 },
  { kanji: 'カメ、ラクダ、サイ。カメラくださーい', hiragana: 'かめ、らくだ、さい、かめらくださーい', romaji: 'kame,rakuda,sai,kamerakudasa-i', difficulty: 1, points: 0 },
  { kanji: '犬がいぬ！', hiragana: 'いぬがいぬ！', romaji: 'inugainu!', difficulty: 1, points: 0 },
  { kanji: '浮き輪ウキウキ', hiragana: 'うきわうきうき', romaji: 'ukiwaukiuki', difficulty: 1, points: 0 },
  { kanji: '太陽当たんないよう', hiragana: 'たいようあたんないよう', romaji: 'taiyouatannnaiyou', difficulty: 1, points: 0 },
  { kanji: '犬の卒倒、ワンパターン', hiragana: 'いぬのそっとう、わんぱたーん', romaji: 'inunosottou,wanpata-n', difficulty: 1, points: 0 },
  // ─── すぺしゃりてメンバー セリフ ───────────────────────────────────
  { kanji: 'その前に水を飲む！', hiragana: 'そのまえにみずをのむ！', romaji: 'sonomaenimizuwonomu!', difficulty: 1, points: 0 }
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