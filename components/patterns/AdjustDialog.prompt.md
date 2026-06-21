Modal of −/value/+ nudge rows for fine-tuning BIM↔GIS alignment offsets.

```jsx
<AdjustDialog open={open} onClose={fn} rows={[{label:'Easting offset',value:0.42,step:0.01,unit:' m',onChange:fn}]} primaryAction={{label:'Apply & re-snap',onClick:fn}} />
```