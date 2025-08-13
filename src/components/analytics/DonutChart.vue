<script setup lang="ts">
import { computed } from 'vue'
const props = defineProps<{ items: { label:string; value:number; color?:string }[]; totalLabel?: string }>()
const total = computed(()=> props.items.reduce((s,i)=>s+i.value,0))
const radius = 64, cx = 80, cy = 80, stroke = 16, C = 2*Math.PI*radius

function dash(value:number){ return `${(value/total.value)*C} ${C}` }
let palette = ['#6366f1','#22c55e','#f59e0b','#ef4444','#06b6d4','#a855f7']
</script>

<template>
  <div class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm flex items-center gap-4">
    <svg width="160" height="160" viewBox="0 0 160 160">
      <circle :cx="cx" :cy="cy" :r="radius" :stroke-width="stroke" stroke="#e5e7eb" fill="none"/>
      <g transform="rotate(-90 80 80)">
        <circle v-for="(it,idx) in items" :key="idx" :cx="cx" :cy="cy" :r="radius"
                :stroke-width="stroke" :stroke-dasharray="dash(it.value)"
                stroke-linecap="butt" fill="none"
                :stroke="it.color || palette[idx%palette.length]">
          <animate attributeName="stroke-dashoffset" :from="C" :to="0" dur="0.6s" fill="freeze"/>
        </circle>
      </g>
    </svg>
    <div class="space-y-1">
      <div v-for="(it,idx) in items" :key="idx" class="text-sm text-gray-700 flex items-center gap-2">
        <span class="w-3 h-3 inline-block rounded-sm" :style="{ background: it.color || '#64748b' }"></span>
        {{ it.label }} — <b class="ml-1">{{ it.value }}</b>
      </div>
      <div class="text-xs text-gray-500 mt-2">{{ totalLabel || 'Итого' }}: {{ total }}</div>
    </div>
  </div>
</template>
