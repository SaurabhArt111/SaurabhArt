export default function Toasts({items}){return <div id="toasts">{items.map(t=><div key={t.id} className={'toast toast-'+t.type}>{t.icon} {t.msg}</div>)}</div>}
