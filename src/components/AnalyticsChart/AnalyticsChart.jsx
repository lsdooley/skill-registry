import { Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Area, AreaChart, ResponsiveContainer } from 'recharts';
import './AnalyticsChart.css';

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return `${d.getMonth()+1}/${d.getDate()}`;
}

export default function AnalyticsChart({ data }) {
  const tickDates = data.filter((_, i) => i % 12 === 0).map(d => d.date);
  return (
    <div className="analytics-chart">
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id="installsGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            ticks={tickDates}
            tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }}
            axisLine={false} tickLine={false}
          />
          <YAxis tick={{ fontSize: 11, fill: 'var(--color-text-muted)' }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              fontSize: '12px',
              color: 'var(--color-text)',
            }}
            labelFormatter={v => new Date(v).toLocaleDateString()}
          />
          <Legend iconSize={10} iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
          <Area type="monotone" dataKey="installs" name="Installs" stroke="#0d9488" strokeWidth={2} fill="url(#installsGrad)" dot={false} />
          <Line type="monotone" dataKey="views" name="Views" stroke="#6b6560" strokeWidth={1.5} dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
