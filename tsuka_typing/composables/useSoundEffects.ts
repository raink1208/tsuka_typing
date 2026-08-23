/**
 * 効果音の事前ロード・再生。
 * ゲームロード時に preloadSoundEffects() で mp3 をメモリ上に展開しておき、
 * 以降の再生は play() の完了を待たない（タイピングのメイン処理をブロックしない）。
 */
const TYPING_SOUND_PATHS = [
  '/sounds/se/typing_1.mp3',
  '/sounds/se/typing_2.mp3',
  '/sounds/se/typing_3.mp3',
]
const ATTACK_SOUND_PATH = '/sounds/se/attack.mp3'
const MISS_SOUND_PATH = '/sounds/se/miss.mp3'

let typingSounds: HTMLAudioElement[] | null = null
let attackSound: HTMLAudioElement | null = null
let missSound: HTMLAudioElement | null = null

function loadAudio(path: string): HTMLAudioElement {
  const audio = new Audio(path)
  audio.preload = 'auto'
  audio.load()
  return audio
}

/** クローンして再生することで、再生中の同じ音同士が重なっても途切れない */
function playCloned(base: HTMLAudioElement) {
  const instance = base.cloneNode(true) as HTMLAudioElement
  instance.play().catch(() => {
    // 自動再生ブロック等は無視する（タイピング自体には影響させない）
  })
  instance.addEventListener('ended', () => instance.remove(), { once: true })
}

/** ゲームロード時に一度だけ呼び、効果音をクライアント側メモリに展開する */
export function preloadSoundEffects() {
  if (typingSounds && attackSound && missSound) return
  typingSounds = TYPING_SOUND_PATHS.map(loadAudio)
  attackSound = loadAudio(ATTACK_SOUND_PATH)
  missSound = loadAudio(MISS_SOUND_PATH)
}

/** タイピング時の打鍵音をランダムに1つ再生する */
export function playTypingSound() {
  if (!typingSounds || typingSounds.length === 0) return
  const sound = typingSounds[Math.floor(Math.random() * typingSounds.length)]
  playCloned(sound)
}

/** ワードを打ち終えた（攻撃）時の効果音を再生する */
export function playAttackSound() {
  if (!attackSound) return
  playCloned(attackSound)
}

/** タイプミス時の効果音を再生する */
export function playMissSound() {
  if (!missSound) return
  playCloned(missSound)
}
