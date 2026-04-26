/**
 * Styled select dropdown
 */
export default function Select({ value, onChange, options, placeholder, className = "" }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`
        px-3 py-2 rounded-xl text-sm border border-gray-200 dark:border-gray-700
        bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-300
        focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent
        transition-colors cursor-pointer
        ${className}
      `}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((opt) => (
        <option key={opt.value ?? opt} value={opt.value ?? opt}>
          {opt.label ?? opt}
        </option>
      ))}
    </select>
  );
}
