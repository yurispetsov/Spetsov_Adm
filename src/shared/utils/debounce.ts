export const debounce = <T extends (...a:any[])=>any>(fn:T, ms=300) => {
  let t:number|undefined
  return (...args:any[]) => {
    if (t) window.clearTimeout(t)
    t = window.setTimeout(() => fn(...args), ms)
  }
}
