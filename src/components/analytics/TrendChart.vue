<script setup lang="ts">
import { computed } from 'vue'
type Point = { x: number; show?: number; createdSum?: number; deliveredSum?: number; label: string }
const props = defineProps<{ data: Point[], maxY?: number }>()

const maxY = computed(() => props.maxY ?? Math.max(1, ...props.data.map(d => Math.max(d.show||0, d.createdSum||0, d.deliveredSum||0))))
const height = 180, width = 720, pad = 32
const xStep = computed(()=> (width - pad*2) / Math.max(1, props.data.length-1))
function x(i:number){ return pad + i * xStep.value }
function y(v:number){ return Math.round(height - pad - (v / maxY.value) * (height - pad*2)) }

const linePath = computed(()=>{
  const pts = props.data.map((d,i)=> `${i===0?'M':'L'} ${x(i)} ${y(d.show||0)}` ).join(' ')
  return pts
})
</script>

<template>
  <div class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
    <svg :viewBox="`0 0 ${width} ${height}`" class="w-full h-[220px]">
      <!-- grid -->
      <g stroke="#e5e7eb" stroke-width="1">
        <line v-for="n in 4" :key="n" :x1="pad" :x2="width-pad"
              :y1="pad + (n-1)*((height-pad*2)/3)" :y2="pad + (n-1)*((height-pad*2)/3)"/>
      </g>

      <!-- bars: created sum -->
      <g>
        <rect v-for="(d,i) in data" :key="'c'+i"
              :x="x(i)-8" :y="y(d.createdSum||0)" width="12" :height="(height-pad)-y(d.createdSum||0)"
              fill="#f59e0b" opacity="0.85"/>
        <!-- delivered sum -->
        <rect v-for="(d,i) in data" :key="'d'+i"
              :x="x(i)+6" :y="y(d.deliveredSum||0)" width="12" :height="(height-pad)-y(d.deliveredSum||0)"
              fill="#10b981" opacity="0.8"/>
      </g>

      <!-- line: product shows -->
      <path :d="linePath" fill="none" stroke="#3b82f6" stroke-width="2"/>
      <g fill="#1d4ed8">
        <circle v-for="(d,i) in data" :key="'p'+i" :cx="x(i)" :cy="y(d.show||0)" r="2.5"/>
      </g>

      <!-- labels -->
      <g fill="#6b7280" font-size="10">
        <text v-for="(d,i) in data" :key="'l'+i" :x="x(i)" :y="height-8" text-anchor="middle">{{ d.label }}</text>
      </g>
    </svg>
    <div class="flex flex-wrap gap-3 mt-2 text-xs text-gray-600">
      <div class="inline-flex items-center gap-1"><span class="w-3 h-3 bg-blue-500 inline-block rounded-sm"></span>Показы</div>
      <div class="inline-flex items-center gap-1"><span class="w-3 h-3 bg-amber-500 inline-block rounded-sm"></span>Создано заказов, ₽</div>
      <div class="inline-flex items-center gap-1"><span class="w-3 h-3 bg-emerald-500 inline-block rounded-sm"></span>Доставлено, ₽</div>
    </div>
  </div>
</template>
