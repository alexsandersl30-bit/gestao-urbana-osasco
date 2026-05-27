export default function StatCard({ title, value, subtitle, alert }) {
  return (
    <div className={`bg-white rounded-[12px] shadow-sm border p-5 transition-shadow ${alert ? 'border-[#FECACA] bg-[#FEE2E2]' : 'border-[#E5E7EB]'}`}>
      <p className="text-sm text-[#6B7280] font-medium">{title}</p>
      <p className={`text-3xl font-bold mt-1 ${alert ? 'text-[#991B1B]' : 'text-[#16a34a]'}`}>{value}</p>
      {subtitle && <p className="text-xs text-[#6B7280] mt-1">{subtitle}</p>}
    </div>
  )
}
