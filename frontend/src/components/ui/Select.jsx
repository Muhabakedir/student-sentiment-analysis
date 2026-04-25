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
        bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200
        focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
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
