export default function PageHeader({ title, action }) {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
      {action && <div>{action}</div>}
    </div>
  );
}