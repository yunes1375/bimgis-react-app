Search bar with matched/total counter, inline filter slot and clear.

```jsx
<FilterSearch value={q} onChange={setQ} count={{matched:1,total:248}} onClear={()=>setQ('')} />
```