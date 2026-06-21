Sticky-header table with sortable columns, dense mode, per-row actions. Columns: {key, header, align, width, sortable, render}.

```jsx
<DataTable columns={cols} rows={rows} rowKey={r=>r.id} sortKey="name" sortDir="asc" onSort={fn} actions={r=><Button size="sm">Open</Button>} />
```