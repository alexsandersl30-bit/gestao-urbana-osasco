export default function StatCard({ title, value, subtitle, alert }) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border p-5 ${alert ? 'border-red-300 bg-red-50' : 'border-gray-100'}`}>
      <p className="text-sm text-gray-500 font-medium">{title}</p>
      <p className={`text-3xl font-bold mt-1 ${alert ? 'text-red-600' : 'text-primary'}`}>{value}</p>
      {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
    </div>
  )
}
