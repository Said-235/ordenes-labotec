import styles from '@/pages/Formulario.module.css'

export default function CampoSuggest({
  label, value, onChange, options = [], placeholder, listId,
}) {
  return (
    <div className={styles.campo}>
      <label className={styles.campoLabel}>{label}</label>
      <input
        className={styles.input}
        list={listId}
        value={value}
        placeholder={placeholder}
        autoComplete="off"
        onChange={e => onChange(e.target.value)}
      />
      <datalist id={listId}>
        {options.map(opt => (
          <option key={opt} value={opt} />
        ))}
      </datalist>
    </div>
  )
}
