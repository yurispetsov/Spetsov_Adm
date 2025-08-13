<script setup lang="ts">
import { ref, onMounted } from 'vue'

const props = defineProps<{ modelValue?: string, placeholder?: string }>()
const emit = defineEmits<{ (e:'update:modelValue', v:string):void }>()

const html = ref(props.modelValue || '')

function onInput(e: Event){ html.value = (e.target as HTMLDivElement).innerHTML; emit('update:modelValue', html.value) }

// image compress
async function compress(file: File, max=1600, q=0.85): Promise<Blob>{
  const img = document.createElement('img')
  img.src = URL.createObjectURL(file)
  await img.decode()
  const scale = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(img.naturalWidth * scale)
  canvas.height = Math.round(img.naturalHeight * scale)
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
  return await new Promise(res => canvas.toBlob(b => res(b!), 'image/jpeg', q))
}
async function readAsDataUrl(blob: Blob): Promise<string>{
  return await new Promise(r => { const fr=new FileReader(); fr.onload=()=>r(String(fr.result)); fr.readAsDataURL(blob) })
}

async function handleFiles(files: File[]){
  for (const f of files){
    if (!f.type.startsWith('image/')) continue
    const compressed = await compress(f)
    const data = await readAsDataUrl(compressed)
    insertAtCursor(`<img src="${data}" alt="" loading="lazy" />`)
  }
  emit('update:modelValue', html.value = editorRef.value!.innerHTML)
}

function onPaste(e: ClipboardEvent){
  const items = Array.from(e.clipboardData?.items || [])
  const files = items.map(i=> i.getAsFile()).filter(Boolean) as File[]
  if (files.length){ e.preventDefault(); handleFiles(files) }
}

function onDrop(e: DragEvent){
  const files = Array.from(e.dataTransfer?.files || [])
  if (files.length){ e.preventDefault(); handleFiles(files) }
}

const editorRef = ref<HTMLDivElement|null>(null)

function exec(cmd:string, val?:string){
  document.execCommand(cmd, false, val)
  emit('update:modelValue', html.value = editorRef.value!.innerHTML)
}
function insertAtCursor(htmlStr:string){
  editorRef.value?.focus()
  document.execCommand('insertHTML', false, htmlStr)
}

</script>

<template>
  <div class="rounded-md border border-gray-300 bg-white">
    <div class="flex flex-wrap items-center gap-1 px-2 py-1 border-b bg-gray-50">
      <button class="tb" @click="exec('undo')">↶</button>
      <button class="tb" @click="exec('redo')">↷</button>
      <span class="sep"/>
      <button class="tb" @click="exec('bold')"><b>B</b></button>
      <button class="tb" @click="exec('italic')"><i>I</i></button>
      <button class="tb" @click="exec('underline')"><u>U</u></button>
      <button class="tb" @click="exec('strikeThrough')"><s>S</s></button>
      <span class="sep"/>
      <button class="tb" @click="exec('formatBlock', 'H1')">H1</button>
      <button class="tb" @click="exec('formatBlock', 'H2')">H2</button>
      <button class="tb" @click="exec('formatBlock', 'H3')">H3</button>
      <button class="tb" @click="exec('formatBlock', 'P')">P</button>
      <span class="sep"/>
      <button class="tb" @click="exec('insertUnorderedList')">• List</button>
      <button class="tb" @click="exec('insertOrderedList')">1. List</button>
      <span class="sep"/>
      <button class="tb" @click="exec('formatBlock', 'BLOCKQUOTE')">“”</button>
      <button class="tb" @click="exec('formatBlock', 'PRE')">{ }</button>
      <span class="sep"/>
      <button class="tb" @click="()=>{ const url=prompt('Ссылка:'); if(url) exec('createLink', url) }">🔗</button>
      <button class="tb" @click="()=>{ const input=document.createElement('input'); input.type='file'; input.accept='image/*'; input.onchange=(e:any)=>handleFiles(Array.from(e.target.files||[])); input.click() }">🖼️</button>
      <span class="sep"/>
      <button class="tb" @click="exec('justifyLeft')">⟸</button>
      <button class="tb" @click="exec('justifyCenter')">≡</button>
      <button class="tb" @click="exec('justifyRight')">⟹</button>
      <span class="sep"/>
      <button class="tb" @click="exec('removeFormat')">⨯</button>
    </div>

    <div ref="editorRef" class="min-h-[120px] p-3 text-sm outline-none"
         :data-placeholder="placeholder" contenteditable
         v-html="html" @input="onInput" @paste="onPaste" @drop="onDrop"></div>
  </div>
</template>

<style scoped>
.tb{ @apply px-2 py-1 text-sm rounded hover:bg-white border border-transparent hover:border-gray-200; }
.sep{ @apply w-px h-5 bg-gray-200 mx-1; }
div[contenteditable]:empty:before { content: attr(data-placeholder); @apply text-gray-400; }
</style>
