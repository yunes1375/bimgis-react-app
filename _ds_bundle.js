/* @ds-bundle: {"format":3,"namespace":"BIMGISBlueprintDesignSystem_f8b0c8","components":[{"name":"DataTable","sourcePath":"components/data/DataTable.jsx"},{"name":"FilterSearch","sourcePath":"components/data/FilterSearch.jsx"},{"name":"StackedCardTable","sourcePath":"components/data/StackedCardTable.jsx"},{"name":"Pill","sourcePath":"components/display/Pill.jsx"},{"name":"Spinner","sourcePath":"components/display/Spinner.jsx"},{"name":"Tabs","sourcePath":"components/display/Tabs.jsx"},{"name":"Toast","sourcePath":"components/display/Toast.jsx"},{"name":"ToastStack","sourcePath":"components/display/Toast.jsx"},{"name":"Button","sourcePath":"components/inputs/Button.jsx"},{"name":"Input","sourcePath":"components/inputs/Input.jsx"},{"name":"PasswordInput","sourcePath":"components/inputs/PasswordInput.jsx"},{"name":"Select","sourcePath":"components/inputs/Select.jsx"},{"name":"Textarea","sourcePath":"components/inputs/Textarea.jsx"},{"name":"Toggle","sourcePath":"components/inputs/Toggle.jsx"},{"name":"Footer","sourcePath":"components/layout/Footer.jsx"},{"name":"MobileDrawer","sourcePath":"components/layout/MobileDrawer.jsx"},{"name":"SiteHeader","sourcePath":"components/layout/SiteHeader.jsx"},{"name":"AdjustDialog","sourcePath":"components/patterns/AdjustDialog.jsx"},{"name":"BasemapPicker","sourcePath":"components/patterns/BasemapPicker.jsx"},{"name":"FabPill","sourcePath":"components/patterns/FabPill.jsx"},{"name":"GpsAccuracyBadge","sourcePath":"components/patterns/GpsAccuracyBadge.jsx"},{"name":"Card","sourcePath":"components/surfaces/Card.jsx"},{"name":"EmptyState","sourcePath":"components/surfaces/EmptyState.jsx"},{"name":"KpiTile","sourcePath":"components/surfaces/KpiTile.jsx"},{"name":"Panel","sourcePath":"components/surfaces/Panel.jsx"}],"sourceHashes":{"components/data/DataTable.jsx":"8bf70f25bc38","components/data/FilterSearch.jsx":"6c19e1748275","components/data/StackedCardTable.jsx":"ee97c218331e","components/display/Pill.jsx":"d1eab12625e3","components/display/Spinner.jsx":"0d73bc8cb1ad","components/display/Tabs.jsx":"b8741e97fa2b","components/display/Toast.jsx":"756eab6eb837","components/inputs/Button.jsx":"f695b834d572","components/inputs/Input.jsx":"19846f1cb1f5","components/inputs/PasswordInput.jsx":"0b0e70b09f02","components/inputs/Select.jsx":"6d0ccaf0db50","components/inputs/Textarea.jsx":"4bdbe1ecb0b2","components/inputs/Toggle.jsx":"d21811c02830","components/layout/Footer.jsx":"3916fbde6dc0","components/layout/MobileDrawer.jsx":"1929962b28e3","components/layout/SiteHeader.jsx":"d9f8d00444f4","components/patterns/AdjustDialog.jsx":"579724b247cc","components/patterns/BasemapPicker.jsx":"930d6ba20c51","components/patterns/FabPill.jsx":"de78c15dd4f5","components/patterns/GpsAccuracyBadge.jsx":"c25efa4c58d7","components/surfaces/Card.jsx":"0281eb9d0391","components/surfaces/EmptyState.jsx":"64de494b7357","components/surfaces/KpiTile.jsx":"90cfad122dd0","components/surfaces/Panel.jsx":"0d2e0e0036dd","ui_kits/atlas/App.jsx":"c1d9d450acac","ui_kits/atlas/LoginScreen.jsx":"aba85c9e5c22","ui_kits/atlas/MapWorkspace.jsx":"7d3709d30152","ui_kits/atlas/ProjectsScreen.jsx":"449390a29ef5"},"inlinedExternals":[],"unexposedExports":[{"name":"deriveGpsLevel","sourcePath":"components/patterns/GpsAccuracyBadge.jsx"}]} */

(() => {

const __ds_ns = (window.BIMGISBlueprintDesignSystem_f8b0c8 = window.BIMGISBlueprintDesignSystem_f8b0c8 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/data/DataTable.jsx
try { (() => {
function cell(col, row, i) {
  if (col.render) return col.render(row, i);
  const v = row[col.key];
  if (v === null || v === undefined) return /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--brand-faint)'
    }
  }, '\u2014');
  return v;
}
function DataTable({
  columns = [],
  rows = [],
  rowKey,
  caption,
  empty = 'No rows.',
  dense = false,
  sortKey,
  sortDir,
  onSort,
  actions,
  actionsHeader = '',
  className
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: ['bp-table-wrap', className].filter(Boolean).join(' ')
  }, /*#__PURE__*/React.createElement("div", {
    className: "bp-table-scroll"
  }, /*#__PURE__*/React.createElement("table", {
    className: ['bp-table', dense ? 'bp-table--dense' : null].filter(Boolean).join(' ')
  }, caption && /*#__PURE__*/React.createElement("caption", null, caption), /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, columns.map(c => {
    const isActive = sortKey === c.key;
    return /*#__PURE__*/React.createElement("th", {
      key: c.key,
      style: {
        width: c.width
      },
      scope: "col",
      className: [c.align ? `bp-table__th--${c.align}` : null, c.sortable ? 'bp-table__th--sortable' : null].filter(Boolean).join(' '),
      onClick: c.sortable && onSort ? () => onSort(c.key) : undefined,
      "aria-sort": isActive ? sortDir === 'asc' ? 'ascending' : 'descending' : undefined
    }, c.header, c.sortable && /*#__PURE__*/React.createElement("span", {
      className: ['bp-table__sort', isActive ? 'bp-table__sort--active' : null].filter(Boolean).join(' ')
    }, isActive ? sortDir === 'asc' ? '\u25b2' : '\u25bc' : '\u2195'));
  }), actions && /*#__PURE__*/React.createElement("th", {
    scope: "col",
    className: "bp-table__th--end"
  }, actionsHeader))), /*#__PURE__*/React.createElement("tbody", null, rows.length === 0 ? /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("td", {
    colSpan: columns.length + (actions ? 1 : 0),
    className: "bp-table__empty"
  }, empty)) : rows.map((row, i) => /*#__PURE__*/React.createElement("tr", {
    key: rowKey(row)
  }, columns.map(c => /*#__PURE__*/React.createElement("td", {
    key: c.key,
    className: c.align ? `bp-table__td--${c.align}` : undefined
  }, cell(c, row, i))), actions && /*#__PURE__*/React.createElement("td", {
    className: "bp-table__td--end"
  }, /*#__PURE__*/React.createElement("span", {
    className: "bp-table__actions"
  }, actions(row)))))))));
}
Object.assign(__ds_scope, { DataTable });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/DataTable.jsx", error: String((e && e.message) || e) }); }

// components/data/FilterSearch.jsx
try { (() => {
function FilterSearch({
  value,
  onChange,
  placeholder = 'Search\u2026',
  count,
  onClear,
  filters,
  className
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: ['bp-fs', className].filter(Boolean).join(' '),
    role: "search"
  }, /*#__PURE__*/React.createElement("span", {
    className: "bp-fs__icon",
    "aria-hidden": true
  }, '\u2315'), /*#__PURE__*/React.createElement("input", {
    type: "search",
    className: "bp-fs__input",
    placeholder: placeholder,
    value: value,
    onChange: e => onChange(e.target.value)
  }), filters, count && /*#__PURE__*/React.createElement("span", {
    className: "bp-fs__count"
  }, /*#__PURE__*/React.createElement("strong", null, count.matched), " / ", count.total), value && onClear && /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "bp-fs__clear",
    onClick: onClear
  }, "Clear"));
}
Object.assign(__ds_scope, { FilterSearch });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/FilterSearch.jsx", error: String((e && e.message) || e) }); }

// components/data/StackedCardTable.jsx
try { (() => {
function renderCell(col, row, i) {
  if (col.render) return col.render(row, i);
  const v = row[col.key];
  if (v === null || v === undefined) return /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--brand-faint)'
    }
  }, '\u2014');
  return v;
}
function StackedCardTable({
  columns = [],
  rows = [],
  rowKey,
  empty = 'No rows.',
  actions,
  className
}) {
  if (rows.length === 0) {
    return /*#__PURE__*/React.createElement("div", {
      className: ['bp-sct__empty', className].filter(Boolean).join(' ')
    }, empty);
  }
  return /*#__PURE__*/React.createElement("ul", {
    className: ['bp-sct', className].filter(Boolean).join(' '),
    role: "list"
  }, rows.map((row, i) => /*#__PURE__*/React.createElement("li", {
    key: rowKey(row),
    className: "bp-sct__card"
  }, columns.map(c => /*#__PURE__*/React.createElement("div", {
    key: c.key,
    className: "bp-sct__row"
  }, /*#__PURE__*/React.createElement("span", {
    className: "bp-sct__label"
  }, c.header), /*#__PURE__*/React.createElement("span", {
    className: "bp-sct__value"
  }, renderCell(c, row, i)))), actions && /*#__PURE__*/React.createElement("div", {
    className: "bp-sct__actions"
  }, actions(row)))));
}
Object.assign(__ds_scope, { StackedCardTable });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/data/StackedCardTable.jsx", error: String((e && e.message) || e) }); }

// components/display/Pill.jsx
try { (() => {
function Pill({
  tone = 'neutral',
  dot = false,
  children,
  className,
  title
}) {
  const cls = ['bp-pill', `bp-pill--${tone}`, className].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement("span", {
    className: cls,
    title: title
  }, dot && /*#__PURE__*/React.createElement("span", {
    className: "bp-pill__dot",
    "aria-hidden": true
  }), children);
}
Object.assign(__ds_scope, { Pill });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/display/Pill.jsx", error: String((e && e.message) || e) }); }

// components/display/Spinner.jsx
try { (() => {
function Spinner({
  size = 'md',
  label = 'Loading',
  className
}) {
  const cls = ['bp-spinner', `bp-spinner--${size}`, className].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement("span", {
    className: cls,
    role: "status",
    "aria-label": label
  });
}
Object.assign(__ds_scope, { Spinner });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/display/Spinner.jsx", error: String((e && e.message) || e) }); }

// components/display/Tabs.jsx
try { (() => {
const {
  useId,
  useState
} = React;
function Tabs({
  items = [],
  value,
  defaultValue,
  onChange,
  className,
  ariaLabel = 'Tabs'
}) {
  const auto = useId();
  const [inner, setInner] = useState(defaultValue ?? items[0]?.value);
  const current = value ?? inner;
  const setCurrent = v => {
    if (value === undefined) setInner(v);
    onChange?.(v);
  };
  const active = items.find(t => t.value === current);
  return /*#__PURE__*/React.createElement("div", {
    className: className
  }, /*#__PURE__*/React.createElement("div", {
    className: "bp-tabs",
    role: "tablist",
    "aria-label": ariaLabel
  }, items.map(t => {
    const id = `${auto}-${t.value}`;
    const selected = current === t.value;
    return /*#__PURE__*/React.createElement("button", {
      key: t.value,
      role: "tab",
      id: `${id}-tab`,
      "aria-selected": selected,
      "aria-controls": `${id}-panel`,
      className: "bp-tabs__btn",
      disabled: t.disabled,
      onClick: () => setCurrent(t.value),
      tabIndex: selected ? 0 : -1
    }, t.label, t.count !== undefined && /*#__PURE__*/React.createElement("span", {
      className: "bp-tabs__count"
    }, t.count));
  })), active?.content !== undefined && /*#__PURE__*/React.createElement("div", {
    role: "tabpanel",
    id: `${auto}-${active.value}-panel`,
    "aria-labelledby": `${auto}-${active.value}-tab`,
    className: "bp-tabs__panel"
  }, active.content));
}
Object.assign(__ds_scope, { Tabs });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/display/Tabs.jsx", error: String((e && e.message) || e) }); }

// components/display/Toast.jsx
try { (() => {
const DEFAULT_ICON = {
  info: '\u2022',
  success: '\u2713',
  warn: '!',
  error: '\u00d7'
};
function Toast({
  tone = 'info',
  title,
  description,
  action,
  onClose,
  className,
  icon
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: ['bp-toast', `bp-toast--${tone}`, className].filter(Boolean).join(' '),
    role: "status"
  }, /*#__PURE__*/React.createElement("span", {
    className: "bp-toast__icon",
    "aria-hidden": true
  }, icon ?? DEFAULT_ICON[tone]), /*#__PURE__*/React.createElement("div", {
    className: "bp-toast__body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "bp-toast__title"
  }, title), description && /*#__PURE__*/React.createElement("div", {
    className: "bp-toast__desc"
  }, description)), action && /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "bp-toast__action",
    onClick: action.onClick
  }, action.label), onClose && /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "bp-toast__close",
    "aria-label": "Dismiss",
    onClick: onClose
  }, '\u00d7'));
}
function ToastStack({
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "bp-toast-stack",
    role: "region",
    "aria-label": "Notifications"
  }, children);
}
Object.assign(__ds_scope, { Toast, ToastStack });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/display/Toast.jsx", error: String((e && e.message) || e) }); }

// components/inputs/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const {
  useId
} = React;
function Button({
  variant = 'default',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled,
  leftIcon,
  rightIcon,
  className,
  children,
  type = 'button',
  ...rest
}) {
  const cls = ['bp-btn', `bp-btn--${size}`, variant !== 'default' ? `bp-btn--${variant}` : null, fullWidth ? 'bp-btn--full' : null, className].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement("button", _extends({
    type: type,
    className: cls,
    disabled: disabled || loading,
    "aria-busy": loading || undefined
  }, rest), loading ? /*#__PURE__*/React.createElement("span", {
    className: "bp-btn__spinner",
    "aria-hidden": true
  }) : leftIcon, children, !loading && rightIcon);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/inputs/Button.jsx", error: String((e && e.message) || e) }); }

// components/inputs/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const {
  useId
} = React;
function Input({
  label,
  hint,
  error,
  fullWidth,
  addonEnd,
  id,
  className,
  ...rest
}) {
  const auto = useId();
  const inputId = id ?? `bp-input-${auto}`;
  const helpId = error || hint ? `${inputId}-help` : undefined;
  return /*#__PURE__*/React.createElement("label", {
    className: ['bp-input-wrap', fullWidth ? 'bp-input-wrap--full' : null].filter(Boolean).join(' '),
    htmlFor: inputId
  }, label && /*#__PURE__*/React.createElement("span", {
    className: "bp-input-wrap__label"
  }, label), /*#__PURE__*/React.createElement("span", {
    className: "bp-input-wrap__field"
  }, /*#__PURE__*/React.createElement("input", _extends({
    id: inputId,
    className: ['bp-input', error ? 'bp-input--error' : null, className].filter(Boolean).join(' '),
    "aria-invalid": error ? true : undefined,
    "aria-describedby": helpId
  }, rest)), addonEnd && /*#__PURE__*/React.createElement("span", {
    className: "bp-input__addon"
  }, addonEnd)), (error || hint) && /*#__PURE__*/React.createElement("span", {
    id: helpId,
    className: ['bp-input-wrap__hint', error ? 'bp-input-wrap__hint--error' : null].filter(Boolean).join(' ')
  }, error || hint));
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/inputs/Input.jsx", error: String((e && e.message) || e) }); }

// components/inputs/PasswordInput.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const {
  useState
} = React;
function PasswordInput({
  showLabel = 'Show',
  hideLabel = 'Hide',
  label = 'Password',
  ...rest
}) {
  const [visible, setVisible] = useState(false);
  return /*#__PURE__*/React.createElement(__ds_scope.Input, _extends({
    label: label,
    type: visible ? 'text' : 'password',
    autoComplete: "current-password",
    addonEnd: /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "bp-input__addon-btn",
      onClick: () => setVisible(v => !v),
      "aria-pressed": visible,
      "aria-label": visible ? hideLabel : showLabel
    }, visible ? hideLabel : showLabel)
  }, rest));
}
Object.assign(__ds_scope, { PasswordInput });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/inputs/PasswordInput.jsx", error: String((e && e.message) || e) }); }

// components/inputs/Select.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const {
  useId
} = React;
function Select({
  label,
  hint,
  error,
  fullWidth,
  options = [],
  placeholder,
  id,
  className,
  ...rest
}) {
  const auto = useId();
  const selectId = id ?? `bp-select-${auto}`;
  const helpId = error || hint ? `${selectId}-help` : undefined;
  return /*#__PURE__*/React.createElement("label", {
    className: ['bp-input-wrap', fullWidth ? 'bp-input-wrap--full' : null].filter(Boolean).join(' '),
    htmlFor: selectId
  }, label && /*#__PURE__*/React.createElement("span", {
    className: "bp-input-wrap__label"
  }, label), /*#__PURE__*/React.createElement("span", {
    className: "bp-input-wrap__field"
  }, /*#__PURE__*/React.createElement("select", _extends({
    id: selectId,
    className: ['bp-select', error ? 'bp-select--error' : null, className].filter(Boolean).join(' '),
    "aria-invalid": error ? true : undefined,
    "aria-describedby": helpId
  }, rest), placeholder && /*#__PURE__*/React.createElement("option", {
    value: "",
    disabled: true
  }, placeholder), options.map(o => /*#__PURE__*/React.createElement("option", {
    key: o.value,
    value: o.value,
    disabled: o.disabled
  }, o.label)))), (error || hint) && /*#__PURE__*/React.createElement("span", {
    id: helpId,
    className: ['bp-input-wrap__hint', error ? 'bp-input-wrap__hint--error' : null].filter(Boolean).join(' ')
  }, error || hint));
}
Object.assign(__ds_scope, { Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/inputs/Select.jsx", error: String((e && e.message) || e) }); }

// components/inputs/Textarea.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const {
  useId
} = React;
function Textarea({
  label,
  hint,
  error,
  fullWidth,
  mono,
  id,
  className,
  ...rest
}) {
  const auto = useId();
  const taId = id ?? `bp-ta-${auto}`;
  const helpId = error || hint ? `${taId}-help` : undefined;
  return /*#__PURE__*/React.createElement("label", {
    className: ['bp-input-wrap', fullWidth ? 'bp-input-wrap--full' : null].filter(Boolean).join(' '),
    htmlFor: taId
  }, label && /*#__PURE__*/React.createElement("span", {
    className: "bp-input-wrap__label"
  }, label), /*#__PURE__*/React.createElement("textarea", _extends({
    id: taId,
    className: ['bp-textarea', mono ? 'bp-textarea--mono' : null, error ? 'bp-textarea--error' : null, className].filter(Boolean).join(' '),
    "aria-invalid": error ? true : undefined,
    "aria-describedby": helpId
  }, rest)), (error || hint) && /*#__PURE__*/React.createElement("span", {
    id: helpId,
    className: ['bp-input-wrap__hint', error ? 'bp-input-wrap__hint--error' : null].filter(Boolean).join(' ')
  }, error || hint));
}
Object.assign(__ds_scope, { Textarea });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/inputs/Textarea.jsx", error: String((e && e.message) || e) }); }

// components/inputs/Toggle.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const {
  useId
} = React;
function Toggle({
  label,
  hint,
  id,
  disabled,
  className,
  ...rest
}) {
  const auto = useId();
  const inputId = id ?? `bp-toggle-${auto}`;
  return /*#__PURE__*/React.createElement("label", {
    htmlFor: inputId,
    className: ['bp-toggle', disabled ? 'bp-toggle--disabled' : null, className].filter(Boolean).join(' ')
  }, /*#__PURE__*/React.createElement("input", _extends({
    type: "checkbox",
    id: inputId,
    className: "bp-toggle__input",
    role: "switch",
    disabled: disabled
  }, rest)), /*#__PURE__*/React.createElement("span", {
    className: "bp-toggle__track"
  }, /*#__PURE__*/React.createElement("span", {
    className: "bp-toggle__thumb"
  })), (label || hint) && /*#__PURE__*/React.createElement("span", {
    className: "bp-toggle__text"
  }, label && /*#__PURE__*/React.createElement("span", {
    className: "bp-toggle__label"
  }, label), hint && /*#__PURE__*/React.createElement("span", {
    className: "bp-toggle__hint"
  }, hint)));
}
Object.assign(__ds_scope, { Toggle });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/inputs/Toggle.jsx", error: String((e && e.message) || e) }); }

// components/layout/Footer.jsx
try { (() => {
function Footer({
  brand = 'BIM\u00b7GIS \u00b7 2026',
  links = [],
  right,
  className
}) {
  return /*#__PURE__*/React.createElement("footer", {
    className: ['bp-footer', className].filter(Boolean).join(' ')
  }, /*#__PURE__*/React.createElement("span", {
    className: "bp-footer__brand"
  }, brand), links.map(l => /*#__PURE__*/React.createElement("a", {
    key: l.href,
    href: l.href
  }, l.label)), /*#__PURE__*/React.createElement("span", {
    className: "bp-footer__sep"
  }), right);
}
Object.assign(__ds_scope, { Footer });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/layout/Footer.jsx", error: String((e && e.message) || e) }); }

// components/layout/MobileDrawer.jsx
try { (() => {
function MobileDrawer({
  open,
  onClose,
  title,
  side = 'left',
  children,
  closeLabel = 'Close menu'
}) {
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: ['bp-mdrawer-overlay', open ? 'bp-mdrawer-overlay--open' : null].filter(Boolean).join(' '),
    onClick: onClose,
    "aria-hidden": true
  }), /*#__PURE__*/React.createElement("aside", {
    className: ['bp-mdrawer', side === 'right' ? 'bp-mdrawer--right' : null, open ? 'bp-mdrawer--open' : null].filter(Boolean).join(' '),
    role: "dialog",
    "aria-modal": "true",
    "aria-hidden": !open
  }, /*#__PURE__*/React.createElement("div", {
    className: "bp-mdrawer__head"
  }, /*#__PURE__*/React.createElement("span", {
    className: "bp-mdrawer__head-title"
  }, title ?? 'Menu'), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "bp-mdrawer__close",
    onClick: onClose,
    "aria-label": closeLabel
  }, '\u00d7')), /*#__PURE__*/React.createElement("div", {
    className: "bp-mdrawer__body"
  }, children)));
}
Object.assign(__ds_scope, { MobileDrawer });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/layout/MobileDrawer.jsx", error: String((e && e.message) || e) }); }

// components/layout/SiteHeader.jsx
try { (() => {
function SiteHeader({
  brand = 'BIM\u00b7GIS',
  brandMark = 'B',
  brandHref = '/',
  tag,
  nav,
  who,
  onMenuClick,
  className,
  children
}) {
  return /*#__PURE__*/React.createElement("header", {
    className: ['bp-topbar', className].filter(Boolean).join(' ')
  }, /*#__PURE__*/React.createElement("a", {
    href: brandHref,
    className: "bp-topbar__brand"
  }, /*#__PURE__*/React.createElement("span", {
    className: "bp-topbar__brand-mark"
  }, brandMark), /*#__PURE__*/React.createElement("span", null, brand), tag && /*#__PURE__*/React.createElement("span", {
    className: "bp-topbar__brand-tag"
  }, "/ ", tag)), children, nav && /*#__PURE__*/React.createElement("nav", {
    className: "bp-topbar__nav",
    "aria-label": "Primary"
  }, nav.map(l => /*#__PURE__*/React.createElement("a", {
    key: l.href,
    href: l.href,
    className: "bp-topbar__link",
    "aria-current": l.active ? 'page' : undefined
  }, l.icon, l.label)), who && /*#__PURE__*/React.createElement("a", {
    href: who.href ?? '/account',
    className: "bp-topbar__who"
  }, /*#__PURE__*/React.createElement("span", {
    className: "bp-topbar__who-avatar"
  }, who.initials ?? who.name[0]?.toUpperCase()), /*#__PURE__*/React.createElement("span", null, who.name))), onMenuClick && /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "bp-topbar__hamburger",
    "aria-label": "Open menu",
    onClick: onMenuClick
  }, '\u2630'));
}
Object.assign(__ds_scope, { SiteHeader });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/layout/SiteHeader.jsx", error: String((e && e.message) || e) }); }

// components/patterns/AdjustDialog.jsx
try { (() => {
const {
  useEffect
} = React;
function fmt(r) {
  return r.format ? r.format(r.value) : `${r.value.toFixed(2)}${r.unit ?? ''}`;
}
function AdjustDialog({
  open,
  onClose,
  title = 'Adjust',
  rows = [],
  primaryAction,
  cancelLabel = 'Cancel',
  className
}) {
  useEffect(() => {
    if (!open) return;
    const onEsc = e => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onEsc);
    return () => document.removeEventListener('keydown', onEsc);
  }, [open, onClose]);
  if (!open) return null;
  return /*#__PURE__*/React.createElement("div", {
    className: "bp-adj-overlay",
    onClick: onClose,
    role: "presentation"
  }, /*#__PURE__*/React.createElement("div", {
    className: ['bp-adj', className].filter(Boolean).join(' '),
    role: "dialog",
    "aria-modal": "true",
    "aria-labelledby": "bp-adj-title",
    onClick: e => e.stopPropagation()
  }, /*#__PURE__*/React.createElement("header", {
    className: "bp-adj__head"
  }, /*#__PURE__*/React.createElement("h3", {
    id: "bp-adj-title",
    className: "bp-adj__title"
  }, title), /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "bp-adj__close",
    "aria-label": "Close",
    onClick: onClose
  }, '\u00d7')), /*#__PURE__*/React.createElement("div", {
    className: "bp-adj__body"
  }, rows.map(r => {
    const step = r.step ?? 1;
    return /*#__PURE__*/React.createElement("div", {
      key: r.label,
      className: "bp-adj__row"
    }, /*#__PURE__*/React.createElement("span", {
      className: "bp-adj__label"
    }, r.label), /*#__PURE__*/React.createElement("span", {
      className: "bp-adj__nudge"
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "bp-adj__nudge-btn",
      "aria-label": `Decrease ${r.label}`,
      onClick: () => r.onChange(r.value - step)
    }, '\u2212'), /*#__PURE__*/React.createElement("span", {
      className: "bp-adj__nudge-val"
    }, fmt(r)), /*#__PURE__*/React.createElement("button", {
      type: "button",
      className: "bp-adj__nudge-btn",
      "aria-label": `Increase ${r.label}`,
      onClick: () => r.onChange(r.value + step)
    }, "+")));
  })), /*#__PURE__*/React.createElement("footer", {
    className: "bp-adj__foot"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "bp-btn bp-btn--md bp-btn--ghost",
    onClick: onClose
  }, cancelLabel), primaryAction && /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "bp-btn bp-btn--md bp-btn--primary",
    onClick: primaryAction.onClick,
    disabled: primaryAction.disabled
  }, primaryAction.label))));
}
Object.assign(__ds_scope, { AdjustDialog });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/patterns/AdjustDialog.jsx", error: String((e && e.message) || e) }); }

// components/patterns/BasemapPicker.jsx
try { (() => {
const {
  useEffect,
  useRef,
  useState
} = React;
function BasemapPicker({
  value,
  onChange,
  options = [],
  ariaLabel = 'Choose basemap',
  className
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  useEffect(() => {
    if (!open) return;
    const onOutside = e => {
      if (!rootRef.current?.contains(e.target)) setOpen(false);
    };
    const onEsc = e => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onOutside);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onOutside);
      document.removeEventListener('keydown', onEsc);
    };
  }, [open]);
  return /*#__PURE__*/React.createElement("div", {
    ref: rootRef,
    className: ['bp-bmpicker', className].filter(Boolean).join(' ')
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "bp-bmpicker__trigger",
    "aria-haspopup": "listbox",
    "aria-expanded": open,
    "aria-label": ariaLabel,
    onClick: () => setOpen(v => !v)
  }, '\u25f0'), open && /*#__PURE__*/React.createElement("div", {
    className: "bp-bmpicker__menu",
    role: "listbox"
  }, options.map(o => {
    const active = o.id === value;
    const swatchStyle = o.swatchImage ? {
      backgroundImage: `url(${o.swatchImage})`
    } : {
      background: o.swatchColor ?? 'var(--brand-surface-2)'
    };
    return /*#__PURE__*/React.createElement("button", {
      key: o.id,
      type: "button",
      role: "option",
      "aria-selected": active,
      className: ['bp-bmpicker__opt', active ? 'bp-bmpicker__opt--active' : null].filter(Boolean).join(' '),
      onClick: () => {
        onChange(o.id);
        setOpen(false);
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "bp-bmpicker__swatch",
      style: swatchStyle,
      "aria-hidden": true
    }), o.label);
  })));
}
Object.assign(__ds_scope, { BasemapPicker });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/patterns/BasemapPicker.jsx", error: String((e && e.message) || e) }); }

// components/patterns/FabPill.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function FabPill({
  active = false,
  shape = 'pill',
  icon,
  children,
  className,
  type = 'button',
  ...rest
}) {
  const cls = ['bp-fab', active ? 'bp-fab--on' : null, shape === 'circle' ? 'bp-fab--circle' : null, className].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement("button", _extends({
    type: type,
    className: cls,
    "aria-pressed": active
  }, rest), icon && /*#__PURE__*/React.createElement("span", {
    className: "bp-fab__icon",
    "aria-hidden": true
  }, icon), children);
}
Object.assign(__ds_scope, { FabPill });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/patterns/FabPill.jsx", error: String((e && e.message) || e) }); }

// components/patterns/GpsAccuracyBadge.jsx
try { (() => {
function deriveGpsLevel(m) {
  if (m == null || Number.isNaN(m)) return 'none';
  if (m <= 8) return 'good';
  if (m <= 25) return 'fair';
  return 'poor';
}
const LABEL = {
  good: 'GPS',
  fair: 'GPS',
  poor: 'GPS',
  none: 'NO GPS'
};
function GpsAccuracyBadge({
  accuracy,
  level,
  className,
  hideValue = false
}) {
  const lvl = level ?? deriveGpsLevel(accuracy);
  return /*#__PURE__*/React.createElement("div", {
    className: ['bp-gps', `bp-gps--${lvl}`, className].filter(Boolean).join(' '),
    role: "status"
  }, /*#__PURE__*/React.createElement("span", {
    className: "bp-gps__bars",
    "aria-hidden": true
  }, /*#__PURE__*/React.createElement("span", {
    className: "bp-gps__bar"
  }), /*#__PURE__*/React.createElement("span", {
    className: "bp-gps__bar"
  }), /*#__PURE__*/React.createElement("span", {
    className: "bp-gps__bar"
  })), /*#__PURE__*/React.createElement("span", null, LABEL[lvl]), !hideValue && lvl !== 'none' && accuracy != null && /*#__PURE__*/React.createElement("span", {
    className: "bp-gps__value"
  }, '\u00b1', accuracy.toFixed(0), " m"));
}
Object.assign(__ds_scope, { deriveGpsLevel, GpsAccuracyBadge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/patterns/GpsAccuracyBadge.jsx", error: String((e && e.message) || e) }); }

// components/surfaces/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Card({
  variant = 'default',
  title,
  subtitle,
  action,
  footer,
  dense = false,
  children,
  className,
  ...rest
}) {
  const cls = ['bp-card', variant !== 'default' ? `bp-card--${variant}` : null, className].filter(Boolean).join(' ');
  const hasHeader = title || action;
  return /*#__PURE__*/React.createElement("div", _extends({
    className: cls
  }, rest), hasHeader && /*#__PURE__*/React.createElement("header", {
    className: "bp-card__header"
  }, title && /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("h3", {
    className: "bp-card__title"
  }, title), subtitle && /*#__PURE__*/React.createElement("div", {
    className: "bp-card__subtitle"
  }, subtitle)), action && /*#__PURE__*/React.createElement("div", {
    className: "bp-card__action"
  }, action)), /*#__PURE__*/React.createElement("div", {
    className: ['bp-card__body', dense ? 'bp-card__body--dense' : null].filter(Boolean).join(' ')
  }, children), footer && /*#__PURE__*/React.createElement("footer", {
    className: "bp-card__footer"
  }, footer));
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/surfaces/Card.jsx", error: String((e && e.message) || e) }); }

// components/surfaces/EmptyState.jsx
try { (() => {
function EmptyState({
  icon,
  title,
  description,
  action,
  className
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: ['bp-empty', className].filter(Boolean).join(' ')
  }, icon && /*#__PURE__*/React.createElement("div", {
    className: "bp-empty__icon",
    "aria-hidden": true
  }, icon), /*#__PURE__*/React.createElement("h3", {
    className: "bp-empty__title"
  }, title), description && /*#__PURE__*/React.createElement("p", {
    className: "bp-empty__desc"
  }, description), action && /*#__PURE__*/React.createElement("div", {
    className: "bp-empty__action"
  }, action));
}
Object.assign(__ds_scope, { EmptyState });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/surfaces/EmptyState.jsx", error: String((e && e.message) || e) }); }

// components/surfaces/KpiTile.jsx
try { (() => {
const TREND_GLYPH = {
  up: '\u25b2',
  down: '\u25bc',
  flat: '\u2013'
};
function KpiTile({
  label,
  value,
  tone = 'default',
  trend,
  className
}) {
  const cls = ['bp-kpi', tone !== 'default' ? `bp-kpi--${tone}` : null, className].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement("div", {
    className: cls
  }, /*#__PURE__*/React.createElement("div", {
    className: "bp-kpi__label"
  }, label), /*#__PURE__*/React.createElement("div", {
    className: "bp-kpi__value"
  }, value), trend && /*#__PURE__*/React.createElement("div", {
    className: ['bp-kpi__trend', `bp-kpi__trend--${trend.dir}`].join(' ')
  }, TREND_GLYPH[trend.dir], " ", trend.text));
}
Object.assign(__ds_scope, { KpiTile });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/surfaces/KpiTile.jsx", error: String((e && e.message) || e) }); }

// components/surfaces/Panel.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Panel({
  title,
  onClose,
  ghost = false,
  children,
  className,
  ...rest
}) {
  const cls = ['bp-panel', ghost ? 'bp-panel--ghost' : null, className].filter(Boolean).join(' ');
  return /*#__PURE__*/React.createElement("div", _extends({
    className: cls
  }, rest), (title || onClose) && /*#__PURE__*/React.createElement("div", {
    className: "bp-panel__head"
  }, title && /*#__PURE__*/React.createElement("h4", {
    className: "bp-panel__title"
  }, title), onClose && /*#__PURE__*/React.createElement("button", {
    className: "bp-panel__close",
    onClick: onClose,
    "aria-label": "Close"
  }, '\u00d7')), /*#__PURE__*/React.createElement("div", {
    className: "bp-panel__body"
  }, children));
}
Object.assign(__ds_scope, { Panel });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/surfaces/Panel.jsx", error: String((e && e.message) || e) }); }

// ui_kits/atlas/App.jsx
try { (() => {
const {
  MobileDrawer
} = window.BIMGISBlueprintDesignSystem_f8b0c8;
const WHO = {
  name: 'Y. Rahimi',
  initials: 'YR'
};
function App() {
  const [screen, setScreen] = React.useState('login'); // login | projects | map
  const [project, setProject] = React.useState(null);
  const [drawer, setDrawer] = React.useState(false);
  const NAV = [{
    href: '#',
    label: 'Projects',
    screen: 'projects'
  }, {
    href: '#',
    label: 'Map',
    screen: 'map'
  }, {
    href: '#',
    label: 'Issues'
  }, {
    href: '#',
    label: 'Docs'
  }];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      overflow: screen === 'map' ? 'hidden' : 'auto'
    }
  }, screen === 'login' && /*#__PURE__*/React.createElement(window.LoginScreen, {
    onSignIn: () => setScreen('projects')
  }), screen === 'projects' && /*#__PURE__*/React.createElement(window.ProjectsScreen, {
    who: WHO,
    onMenu: () => setDrawer(true),
    onOpenProject: p => {
      setProject(p);
      setScreen('map');
    }
  }), screen === 'map' && project && /*#__PURE__*/React.createElement(window.MapWorkspace, {
    project: project,
    who: WHO,
    onMenu: () => setDrawer(true),
    onBack: () => setScreen('projects')
  }), /*#__PURE__*/React.createElement(MobileDrawer, {
    open: drawer,
    onClose: () => setDrawer(false),
    title: "BIM\xB7GIS Atlas"
  }, NAV.map(n => /*#__PURE__*/React.createElement("a", {
    key: n.label,
    href: n.href,
    className: "bp-mdrawer__link",
    "aria-current": screen === n.screen ? 'page' : undefined,
    onClick: e => {
      e.preventDefault();
      if (n.screen === 'projects') setScreen('projects');
      if (n.screen === 'map' && project) setScreen('map');
      setDrawer(false);
    }
  }, n.label)), /*#__PURE__*/React.createElement("a", {
    href: "#",
    className: "bp-mdrawer__link",
    onClick: e => {
      e.preventDefault();
      setScreen('login');
      setDrawer(false);
    }
  }, "Sign out")));
}
ReactDOM.createRoot(document.getElementById('root')).render(/*#__PURE__*/React.createElement(App, null));
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/atlas/App.jsx", error: String((e && e.message) || e) }); }

// ui_kits/atlas/LoginScreen.jsx
try { (() => {
const {
  Card,
  Input,
  PasswordInput,
  Button,
  Pill
} = window.BIMGISBlueprintDesignSystem_f8b0c8;
function LoginScreen({
  onSignIn
}) {
  const [email, setEmail] = React.useState('y.rahimi@bimgis.io');
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "bp-grid-backdrop"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 360,
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 14,
      marginBottom: 22
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/brandmark.svg",
    width: "46",
    height: "46",
    alt: "BIM\xB7GIS"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-head)',
      fontSize: 22,
      fontWeight: 600,
      letterSpacing: '-0.01em'
    }
  }, "BIM\xB7GIS Atlas"), /*#__PURE__*/React.createElement("div", {
    className: "micro",
    style: {
      marginTop: 4
    }
  }, "Model \xB7 Site \xB7 One coordinate space"))), /*#__PURE__*/React.createElement(Card, {
    variant: "accent",
    style: {
      boxShadow: 'var(--shadow-card)'
    }
  }, /*#__PURE__*/React.createElement("form", {
    onSubmit: e => {
      e.preventDefault();
      onSignIn();
    },
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement(Input, {
    label: "Work email",
    type: "email",
    fullWidth: true,
    value: email,
    onChange: e => setEmail(e.target.value)
  }), /*#__PURE__*/React.createElement(PasswordInput, {
    fullWidth: true,
    defaultValue: "blueprint"
  }), /*#__PURE__*/React.createElement(Button, {
    type: "submit",
    variant: "primary",
    size: "lg",
    fullWidth: true
  }, "Sign in"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "#",
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      color: 'var(--brand-muted)',
      textDecoration: 'none',
      textTransform: 'uppercase',
      letterSpacing: '.08em'
    }
  }, "Reset password"), /*#__PURE__*/React.createElement(Pill, {
    tone: "bim",
    dot: true
  }, "SSO ready")))), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      marginTop: 18
    },
    className: "micro"
  }, "\xA9 2026 BIM\xB7GIS \xB7 v0.1.0")));
}
window.LoginScreen = LoginScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/atlas/LoginScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/atlas/MapWorkspace.jsx
try { (() => {
const {
  SiteHeader,
  Panel,
  FabPill,
  BasemapPicker,
  GpsAccuracyBadge,
  KpiTile,
  Pill,
  Button,
  Toggle,
  Toast,
  ToastStack,
  AdjustDialog
} = window.BIMGISBlueprintDesignSystem_f8b0c8;
const LAYERS = [{
  id: 'model',
  name: 'IFC Model',
  tone: 'bim',
  on: true
}, {
  id: 'parcels',
  name: 'Cadastral parcels',
  tone: 'gis',
  on: true
}, {
  id: 'utilities',
  name: 'Utilities (WFS)',
  tone: 'gis',
  on: false
}, {
  id: 'contours',
  name: 'Terrain contours',
  tone: 'neutral',
  on: true
}, {
  id: 'survey',
  name: 'Survey points',
  tone: 'neutral',
  on: false
}];
function MapCanvas({
  show3d
}) {
  // Abstract dark basemap: terrain glows + blueprint grid + a BIM footprint and a GIS parcel outline.
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      overflow: 'hidden',
      background: 'radial-gradient(120% 90% at 70% 20%, #14202b 0%, #0c131b 45%, #070b11 100%)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      opacity: 0.5,
      backgroundImage: 'repeating-linear-gradient(115deg, rgba(255,255,255,0.018) 0 1px, transparent 1px 64px), repeating-linear-gradient(25deg, rgba(255,255,255,0.018) 0 1px, transparent 1px 64px)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "bp-grid-backdrop",
    style: {
      position: 'absolute',
      zIndex: 0,
      opacity: 0.9
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: '-10%',
      left: '40%',
      width: 140,
      height: '130%',
      transform: 'rotate(18deg)',
      background: 'linear-gradient(90deg, transparent, rgba(54,138,224,0.12), transparent)',
      filter: 'blur(8px)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: '34%',
      top: '32%',
      width: 280,
      height: 200,
      border: '1.5px solid rgba(255,154,82,0.55)',
      borderRadius: 2,
      background: 'rgba(255,154,82,0.05)',
      boxShadow: '0 0 0 1px rgba(255,154,82,0.12)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: -9,
      left: 8,
      background: '#0c131b',
      padding: '0 6px',
      fontFamily: 'var(--font-mono)',
      fontSize: 9,
      letterSpacing: '.1em',
      color: 'var(--brand-gis)'
    }
  }, "PARCEL 14-B")), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: '40%',
      top: '40%',
      width: 150,
      height: 96,
      background: show3d ? 'linear-gradient(135deg, rgba(54,224,212,0.32), rgba(54,224,212,0.12))' : 'rgba(54,224,212,0.10)',
      border: '1.5px solid rgba(54,224,212,0.7)',
      borderRadius: 2,
      transform: show3d ? 'skewX(-18deg) scaleY(0.84)' : 'none',
      transition: 'all .3s ease',
      boxShadow: show3d ? '0 -28px 0 -2px rgba(54,224,212,0.18), 0 0 24px rgba(54,224,212,0.25)' : 'none'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      bottom: -9,
      right: 8,
      background: '#0c131b',
      padding: '0 6px',
      fontFamily: 'var(--font-mono)',
      fontSize: 9,
      letterSpacing: '.1em',
      color: 'var(--brand-bim)'
    }
  }, "RIVERSIDE TOWER")), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: '52%',
      top: '58%',
      width: 18,
      height: 18,
      transform: 'translate(-50%,-50%)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: '50%',
      top: 0,
      bottom: 0,
      width: 1,
      background: 'rgba(232,236,241,0.5)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: '50%',
      left: 0,
      right: 0,
      height: 1,
      background: 'rgba(232,236,241,0.5)'
    }
  })));
}
function MapWorkspace({
  project,
  onBack,
  onMenu,
  who
}) {
  const [layers, setLayers] = React.useState(LAYERS);
  const [show3d, setShow3d] = React.useState(true);
  const [measure, setMeasure] = React.useState(false);
  const [basemap, setBasemap] = React.useState('dark');
  const [adjustOpen, setAdjustOpen] = React.useState(false);
  const [offset, setOffset] = React.useState({
    x: 0.42,
    y: -0.18,
    rot: 1.2
  });
  const [toasts, setToasts] = React.useState([]);
  const pushToast = t => {
    const id = Math.random().toString(36).slice(2);
    setToasts(ts => [...ts, {
      ...t,
      id
    }]);
    setTimeout(() => setToasts(ts => ts.filter(x => x.id !== id)), 4200);
  };
  const toggleLayer = id => setLayers(ls => ls.map(l => l.id === id ? {
    ...l,
    on: !l.on
  } : l));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement(SiteHeader, {
    brand: "BIM\xB7GIS",
    tag: "Atlas",
    onMenuClick: onMenu,
    nav: [{
      href: '#',
      label: 'Projects'
    }, {
      href: '#',
      label: 'Map',
      active: true
    }, {
      href: '#',
      label: 'Issues'
    }, {
      href: '#',
      label: 'Docs'
    }],
    who: who
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onBack,
    className: "bp-btn bp-btn--sm bp-btn--ghost",
    style: {
      marginLeft: 4
    }
  }, "\u2190 Projects"), /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: 8,
      fontFamily: 'var(--font-head)',
      fontWeight: 600,
      fontSize: 14
    }
  }, project.name), /*#__PURE__*/React.createElement(Pill, {
    tone: project.tone,
    dot: true
  }, project.status)), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      flex: 1,
      minHeight: 0
    }
  }, /*#__PURE__*/React.createElement(MapCanvas, {
    show3d: show3d
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 14,
      left: 14
    }
  }, /*#__PURE__*/React.createElement(GpsAccuracyBadge, {
    accuracy: 4
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 14,
      right: 14
    }
  }, /*#__PURE__*/React.createElement(BasemapPicker, {
    value: basemap,
    onChange: b => {
      setBasemap(b);
      pushToast({
        tone: 'info',
        title: 'Basemap changed',
        description: `Now showing “${b}”.`
      });
    },
    options: [{
      id: 'dark',
      label: 'Dark',
      swatchColor: '#11141d'
    }, {
      id: 'sat',
      label: 'Satellite',
      swatchColor: '#2c4a2c'
    }, {
      id: 'street',
      label: 'Streets',
      swatchColor: '#3a3f4a'
    }]
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 14,
      left: 14,
      marginTop: 44,
      width: 230
    }
  }, /*#__PURE__*/React.createElement(Panel, {
    title: "Layers",
    ghost: true
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, layers.map(l => /*#__PURE__*/React.createElement("div", {
    key: l.id,
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      fontSize: 13
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 8,
      height: 8,
      borderRadius: 2,
      background: l.tone === 'bim' ? 'var(--brand-bim)' : l.tone === 'gis' ? 'var(--brand-gis)' : 'var(--brand-faint)'
    }
  }), l.name), /*#__PURE__*/React.createElement(Toggle, {
    checked: l.on,
    onChange: () => toggleLayer(l.id)
  })))))), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 14,
      bottom: 14,
      display: 'flex',
      gap: 8,
      flexWrap: 'wrap',
      maxWidth: 'calc(100% - 28px)'
    }
  }, /*#__PURE__*/React.createElement(FabPill, {
    icon: "\u25CE",
    onClick: () => pushToast({
      tone: 'info',
      title: 'Centred on survey point'
    })
  }, "Locate"), /*#__PURE__*/React.createElement(FabPill, {
    icon: "\u229E",
    active: show3d,
    onClick: () => setShow3d(s => !s)
  }, "3D Model"), /*#__PURE__*/React.createElement(FabPill, {
    icon: "\uD83D\uDCD0",
    active: measure,
    onClick: () => setMeasure(m => !m)
  }, "Measure"), /*#__PURE__*/React.createElement(FabPill, {
    shape: "circle",
    icon: "+",
    "aria-label": "Zoom in"
  }), /*#__PURE__*/React.createElement(FabPill, {
    shape: "circle",
    icon: "\u2212",
    "aria-label": "Zoom out"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 14,
      right: 14,
      marginTop: 56,
      width: 248
    }
  }, /*#__PURE__*/React.createElement(Panel, {
    title: "Inspector",
    onClose: () => {}
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-head)',
      fontSize: 15,
      fontWeight: 600
    }
  }, "Curtain wall \xB7 L4"), /*#__PURE__*/React.createElement("div", {
    className: "micro",
    style: {
      marginTop: 3
    }
  }, "IfcWallStandardCase \xB7 E-204")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(KpiTile, {
    label: "Easting",
    value: "538,214"
  }), /*#__PURE__*/React.createElement(KpiTile, {
    label: "Northing",
    value: "3,945,118"
  }), /*#__PURE__*/React.createElement(KpiTile, {
    label: "Elevation",
    value: "+42.6 m",
    tone: "ok"
  }), /*#__PURE__*/React.createElement(KpiTile, {
    label: "Offset",
    value: "0.42 m",
    tone: "warn"
  })), /*#__PURE__*/React.createElement(Button, {
    variant: "secondary",
    size: "sm",
    fullWidth: true,
    onClick: () => setAdjustOpen(true)
  }, "Adjust alignment\u2026")))), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      right: 14,
      bottom: 14,
      display: 'flex',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement(KpiTile, {
    label: "Scale",
    value: "1 : 1,200"
  }), /*#__PURE__*/React.createElement(KpiTile, {
    label: "CRS",
    value: "EPSG:3857"
  }), /*#__PURE__*/React.createElement(KpiTile, {
    label: "Drift",
    value: project.drift,
    tone: project.tone === 'ok' ? 'ok' : 'warn'
  }))), /*#__PURE__*/React.createElement(AdjustDialog, {
    open: adjustOpen,
    onClose: () => setAdjustOpen(false),
    title: "Adjust alignment \u2014 Riverside Tower",
    rows: [{
      label: 'Easting offset',
      value: offset.x,
      step: 0.01,
      unit: ' m',
      onChange: v => setOffset(o => ({
        ...o,
        x: +v.toFixed(2)
      }))
    }, {
      label: 'Northing offset',
      value: offset.y,
      step: 0.01,
      unit: ' m',
      onChange: v => setOffset(o => ({
        ...o,
        y: +v.toFixed(2)
      }))
    }, {
      label: 'Rotation',
      value: offset.rot,
      step: 0.1,
      unit: '°',
      onChange: v => setOffset(o => ({
        ...o,
        rot: +v.toFixed(1)
      }))
    }],
    primaryAction: {
      label: 'Apply & re-snap',
      onClick: () => {
        setAdjustOpen(false);
        pushToast({
          tone: 'success',
          title: 'Model re-snapped',
          description: 'Alignment offsets applied to EPSG:3857.'
        });
      }
    }
  }), /*#__PURE__*/React.createElement(ToastStack, null, toasts.map(t => /*#__PURE__*/React.createElement(Toast, {
    key: t.id,
    tone: t.tone,
    title: t.title,
    description: t.description,
    onClose: () => setToasts(ts => ts.filter(x => x.id !== t.id))
  }))));
}
window.MapWorkspace = MapWorkspace;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/atlas/MapWorkspace.jsx", error: String((e && e.message) || e) }); }

// ui_kits/atlas/ProjectsScreen.jsx
try { (() => {
const {
  SiteHeader,
  Footer,
  FilterSearch,
  DataTable,
  KpiTile,
  Pill,
  Button,
  Card,
  EmptyState
} = window.BIMGISBlueprintDesignSystem_f8b0c8;
const ALL_PROJECTS = [{
  id: 'PRJ-014',
  name: 'Riverside Tower',
  city: 'Tehran',
  elements: 248,
  drift: '0.42 m',
  status: 'Aligned',
  tone: 'ok'
}, {
  id: 'PRJ-021',
  name: 'Metro Line 7 — Phase B',
  city: 'Tehran',
  elements: 1820,
  drift: '1.10 m',
  status: 'Drift',
  tone: 'warn'
}, {
  id: 'PRJ-009',
  name: 'Karaj Logistics Hub',
  city: 'Karaj',
  elements: 512,
  drift: '0.08 m',
  status: 'Aligned',
  tone: 'ok'
}, {
  id: 'PRJ-033',
  name: 'Coastal Wastewater Plant',
  city: 'Bandar Abbas',
  elements: 96,
  drift: '—',
  status: 'Importing',
  tone: 'neutral'
}, {
  id: 'PRJ-028',
  name: 'Heritage Bazaar Survey',
  city: 'Isfahan',
  elements: 64,
  drift: '3.4 m',
  status: 'Failed',
  tone: 'error'
}];
function ProjectsScreen({
  onOpenProject,
  onMenu,
  who
}) {
  const [q, setQ] = React.useState('');
  const [sortDir, setSortDir] = React.useState('asc');
  let rows = ALL_PROJECTS.filter(p => (p.name + p.city + p.id).toLowerCase().includes(q.toLowerCase()));
  rows = [...rows].sort((a, b) => sortDir === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name));
  const cols = [{
    key: 'id',
    header: 'ID',
    width: '92px',
    render: r => /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        color: 'var(--brand-muted)'
      }
    }, r.id)
  }, {
    key: 'name',
    header: 'Project',
    sortable: true,
    render: r => /*#__PURE__*/React.createElement("strong", {
      style: {
        fontWeight: 600
      }
    }, r.name)
  }, {
    key: 'city',
    header: 'Site',
    render: r => /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--brand-muted)'
      }
    }, r.city)
  }, {
    key: 'elements',
    header: 'Elements',
    align: 'end',
    render: r => /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontVariantNumeric: 'tabular-nums'
      }
    }, r.elements.toLocaleString())
  }, {
    key: 'drift',
    header: 'Drift',
    align: 'end',
    render: r => /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)'
      }
    }, r.drift)
  }, {
    key: 'status',
    header: 'Status',
    render: r => /*#__PURE__*/React.createElement(Pill, {
      tone: r.tone,
      dot: r.tone !== 'neutral'
    }, r.status)
  }];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      minHeight: '100%',
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement(SiteHeader, {
    brand: "BIM\xB7GIS",
    tag: "Atlas",
    onMenuClick: onMenu,
    nav: [{
      href: '#',
      label: 'Projects',
      active: true
    }, {
      href: '#',
      label: 'Map'
    }, {
      href: '#',
      label: 'Issues'
    }, {
      href: '#',
      label: 'Docs'
    }],
    who: who
  }), /*#__PURE__*/React.createElement("main", {
    style: {
      flex: 1,
      maxWidth: 1080,
      width: '100%',
      margin: '0 auto',
      padding: '28px 24px',
      boxSizing: 'border-box'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      gap: 16,
      marginBottom: 20,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "micro",
    style: {
      marginBottom: 6
    }
  }, "Workspace"), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: 32,
      margin: 0
    }
  }, "Projects")), /*#__PURE__*/React.createElement(Button, {
    variant: "primary",
    leftIcon: "+"
  }, "New project")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: 12,
      marginBottom: 20
    }
  }, /*#__PURE__*/React.createElement(KpiTile, {
    label: "Active projects",
    value: "5"
  }), /*#__PURE__*/React.createElement(KpiTile, {
    label: "Elements indexed",
    value: "2,740",
    tone: "ok"
  }), /*#__PURE__*/React.createElement(KpiTile, {
    label: "Avg. drift",
    value: "0.6 m",
    tone: "warn",
    trend: {
      dir: 'down',
      text: '−12% wk'
    }
  }), /*#__PURE__*/React.createElement(KpiTile, {
    label: "Failed imports",
    value: "1",
    tone: "error"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement(FilterSearch, {
    value: q,
    onChange: setQ,
    placeholder: "Search projects, sites, IDs\u2026",
    count: {
      matched: rows.length,
      total: ALL_PROJECTS.length
    },
    onClear: () => setQ('')
  })), rows.length === 0 ? /*#__PURE__*/React.createElement(EmptyState, {
    icon: "\u2315",
    title: "No matching projects",
    description: "Try a different name, site or project ID."
  }) : /*#__PURE__*/React.createElement(DataTable, {
    columns: cols,
    rows: rows,
    rowKey: r => r.id,
    caption: `${rows.length} projects`,
    sortKey: "name",
    sortDir: sortDir,
    onSort: () => setSortDir(d => d === 'asc' ? 'desc' : 'asc'),
    actions: r => /*#__PURE__*/React.createElement(Button, {
      size: "sm",
      variant: "secondary",
      onClick: () => onOpenProject(r),
      disabled: r.tone === 'neutral'
    }, "Open"),
    actionsHeader: ""
  })), /*#__PURE__*/React.createElement(Footer, {
    links: [{
      href: '#',
      label: 'Privacy'
    }, {
      href: '#',
      label: 'Status'
    }, {
      href: '#',
      label: 'API'
    }],
    right: /*#__PURE__*/React.createElement("span", null, "v0.1.0")
  }));
}
window.ProjectsScreen = ProjectsScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/atlas/ProjectsScreen.jsx", error: String((e && e.message) || e) }); }

__ds_ns.DataTable = __ds_scope.DataTable;

__ds_ns.FilterSearch = __ds_scope.FilterSearch;

__ds_ns.StackedCardTable = __ds_scope.StackedCardTable;

__ds_ns.Pill = __ds_scope.Pill;

__ds_ns.Spinner = __ds_scope.Spinner;

__ds_ns.Tabs = __ds_scope.Tabs;

__ds_ns.Toast = __ds_scope.Toast;

__ds_ns.ToastStack = __ds_scope.ToastStack;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.PasswordInput = __ds_scope.PasswordInput;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.Textarea = __ds_scope.Textarea;

__ds_ns.Toggle = __ds_scope.Toggle;

__ds_ns.Footer = __ds_scope.Footer;

__ds_ns.MobileDrawer = __ds_scope.MobileDrawer;

__ds_ns.SiteHeader = __ds_scope.SiteHeader;

__ds_ns.AdjustDialog = __ds_scope.AdjustDialog;

__ds_ns.BasemapPicker = __ds_scope.BasemapPicker;

__ds_ns.FabPill = __ds_scope.FabPill;

__ds_ns.GpsAccuracyBadge = __ds_scope.GpsAccuracyBadge;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.EmptyState = __ds_scope.EmptyState;

__ds_ns.KpiTile = __ds_scope.KpiTile;

__ds_ns.Panel = __ds_scope.Panel;

})();
