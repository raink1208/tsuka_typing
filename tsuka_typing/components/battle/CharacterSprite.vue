<template>
  <!-- つかさキャラクタースプライト -->
  <div class="character-sprite" :class="`anim-${state}`">
    <div class="sprite-inner">
      <img
        :src="imgSrc"
        :alt="t('character.tsukasa.fullName')"
        class="sprite-img"
      />
      <!-- 被弾時の赤フラッシュ（立ち絵をマスクにした赤いシルエット） -->
      <div
        class="damage-tint"
        :style="{ '--sprite-url': `url('${imgSrc}')` }"
        aria-hidden="true"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()
const props = defineProps<{
  state: 'idle' | 'attack' | 'damage' | 'dead'
}>()

// state に応じて立ち絵を切り替え（public/images/tsukasa/）
const IMG_BASE = '/images/tsukasa/'
const IMG_MAP: Record<string, string> = {
  idle:   IMG_BASE + 'idle.png',
  attack: IMG_BASE + 'attack.png',
  damage: IMG_BASE + 'damage.png',
  dead:   IMG_BASE + 'damage.png',
}

const imgSrc = computed(() => IMG_MAP[props.state] ?? IMG_MAP['idle'])
</script>

<style scoped>
.character-sprite {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  width: clamp(140px, 20vw, 230px);
}
.sprite-inner {
  position: relative;
  width: 100%;
  height: clamp(180px, 34vh, 310px);
  /* 足元を軸に拡大・移動させる */
  transform-origin: bottom center;
}
/* 立ち絵とマスクの描画位置を一致させるため、両方コンテナ全体に敷く */
.sprite-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: bottom center;
}
.damage-tint {
  position: absolute;
  inset: 0;
  background: #ff2b2b;
  opacity: 0;
  pointer-events: none;
  /* 立ち絵のシルエットで赤を切り抜く */
  -webkit-mask-image: var(--sprite-url);
  -webkit-mask-size: contain;
  -webkit-mask-position: bottom center;
  -webkit-mask-repeat: no-repeat;
  mask-image: var(--sprite-url);
  mask-size: contain;
  mask-position: bottom center;
  mask-repeat: no-repeat;
}

/* ── アニメーション状態 ── */
/* 立ち絵と赤フラッシュを一緒に動かすため sprite-inner に当てる */
.anim-idle .sprite-inner {
  animation: char-idle 2.5s ease-in-out infinite;
}
.anim-attack .sprite-inner {
  animation: char-attack 0.6s ease forwards;
}
.anim-damage .sprite-inner {
  animation: char-damage 0.5s ease;
}
.anim-dead .sprite-inner {
  animation: char-dead 0.8s ease forwards;
}
.anim-damage .damage-tint {
  animation: damage-tint 0.5s ease;
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
  0%, 100% { transform: translateX(0); }
  20%      { transform: translateX(-10px); }
  40%      { transform: translateX(10px); }
  60%      { transform: translateX(-6px); }
  80%      { transform: translateX(6px); }
}
@keyframes damage-tint {
  0%        { opacity: 0; }
  15%, 45%  { opacity: 0.72; filter: drop-shadow(0 0 12px rgba(255,40,40,0.9)); }
  75%       { opacity: 0.3;  filter: drop-shadow(0 0 8px rgba(255,60,60,0.5)); }
  100%      { opacity: 0; }
}
@keyframes char-dead {
  0%   { transform: scale(1) rotate(0deg); opacity: 1; }
  100% { transform: scale(0.6) rotate(-20deg); opacity: 0; }
}
</style>
