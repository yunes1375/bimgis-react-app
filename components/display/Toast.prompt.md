Notification with tone bar, glyph icon, optional action + dismiss. Wrap in ToastStack for fixed bottom-right stacking.

```jsx
<ToastStack><Toast tone="success" title="Model re-snapped" description="Offsets applied." onClose={fn} /></ToastStack>
```
Tones: info · success · warn · error.