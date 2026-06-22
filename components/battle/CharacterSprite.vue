<template>
  <!-- つかさキャラクタースプライト -->
  <div class="character-sprite" :class="`anim-${state}`">
    <div class="sprite-inner">
      <!-- 実際の立ち絵を public/images/tsukasa/ に配置してください -->
      <!-- idle: tsukasa-idle.png / attack: tsukasa-attack.png / damage: tsukasa-damage.png -->
      <img
        v-if="imgSrc"
        :src="imgSrc"
        alt="領国つかさ"
        class="sprite-img"
      />
      <div v-else class="placeholder-char">
        <div class="placeholder-ring" />
        <div class="placeholder-icon">⚔️</div>
        <div class="placeholder-glow" />
      </div>
    </div>
    <div class="char-name">領国 つかさ</div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  state: 'idle' | 'attack' | 'damage' | 'dead'
}>()

// 画像がある場合は state に応じて切り替え
const IMG_BASE = '/images/tsukasa/'
const IMG_MAP: Record<string, string> = {
  idle:   IMG_BASE + 'idle.png',
  attack: IMG_BASE + 'attack.png',
  damage: IMG_BASE + 'damage.png',
  dead:   IMG_BASE + 'damage.png',
}
const imgExists = ref(false)

// 画像存在チェック（なければプレースホルダー表示）
onMounted(async () => {
  try {
    const res = await fetch(IMG_MAP['idle'], { method: 'HEAD' })
    imgExists.value = res.ok
  } catch {
    imgExists.value = false
  }
})

const imgSrc = computed(() =>
  imgExists.value ? IMG_MAP[props.state] ?? IMG_MAP['idle'] : null
)
</script>

<style scoped>
.character-sprite {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  width: 140px;
}
.sprite-inner {
  width: 120px;
  height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.sprite-img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  image-rendering: pixelated;
}

/* ── プレースホルダー ── */
.placeholder-char {
  position: relative;
  width: 100px;
  height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.placeholder-ring {
  position: absolute;
  inset: 10px;
  border-radius: 50%;
  border: 3px solid #ff69b4;
  box-shadow: 0 0 16px #ff69b4, inset 0 0 16px rgba(255, 105, 180, 0.15);
}
.placeholder-icon {
  font-size: 3rem;
  z-index: 1;
  filter: drop-shadow(0 0 8px #ffd700);
}
.placeholder-glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse, rgba(255, 105, 180, 0.12) 0%, transparent 70%);
  border-radius: 50%;
}

.char-name {
  font-size: 0.8rem;
  font-weight: 700;
  color: #ff69b4;
  text-shadow: 0 0 8px #ff69b4;
  letter-spacing: 0.05em;
  white-space: nowrap;
}

/* ── アニメーション状態 ── */
.anim-idle .placeholder-char {
  animation: char-idle 2.5s ease-in-out infinite;
}
.anim-attack .placeholder-char {
  animation: char-attack 0.6s ease forwards;
}
.anim-damage .placeholder-char {
  animation: char-damage 0.5s ease;
}
.anim-dead .placeholder-char {
  animation: char-dead 0.8s ease forwards;
}

@keyframes char-idle {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-6px); }
}
@keyframes char-attack {
  0%   { transform: translateX(0) scale(1); }
  30%  { transform: translateX(50px) scale(1.15); }
  60%  { transform: translateX(20px) scale(1.05); }
  100% { transform: translateX(0) scale(1); }
}
@keyframes char-damage {
  0%, 100% { transform: translateX(0); filter: brightness(1); }
  20%      { transform: translateX(-10px); filter: brightness(2) hue-rotate(310deg); }
  40%      { transform: translateX(10px);  filter: brightness(2) hue-rotate(310deg); }
  60%      { transform: translateX(-6px);  filter: brightness(1.5) hue-rotate(310deg); }
  80%      { transform: translateX(6px);   filter: brightness(1.5); }
}
@keyframes char-dead {
  0%   { transform: scale(1) rotate(0deg); opacity: 1; }
  100% { transform: scale(0.6) rotate(-20deg); opacity: 0; }
}
</style>
