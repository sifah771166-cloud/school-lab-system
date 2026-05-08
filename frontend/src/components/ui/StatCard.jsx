import React from 'react';

export default function StatCard({ icon, title, value, color = 'primary', trend }) {
  const colorClasses = {
    primary: 'from-purple-500 to-indigo-600',
    success: 'from-green-500 to-emerald-600',
    danger: 'from-red-500 to-pink-600',
    warning: 'from-yellow-500 to-orange-600',
    info: 'from-blue-500 to-cyan-600',
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-gray-800">{value}</h3>
          {trend && (
            <p className={`text-sm mt-2 ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.isPositive ? '↑' : '↓'} {trend.value}
            </p>
          )}
        </div>
        <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center text-white text-2xl shadow-lg`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
