import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import { AlertTriangle, Briefcase, Network, RefreshCw } from 'lucide-react';

const RISK_COLORS = {
  High: '#ef4444',
  Medium: '#f59e0b',
  Low: '#10b981'
};

const PLACEMENT_COLORS = {
  'Job Ready': '#2563eb',
  'Needs Upskilling': '#f59e0b',
  'High Priority': '#ef4444'
};

export function AnalyticsCharts({ overview, isLoading = false }) {
  // If overview is not loaded yet, render placeholder cards instead of returning null
  if (!overview) {
    return (
      <div className="analytics-charts-grid">
        <div className="chart-card">
          <div className="chart-card__header">
            <div className="chart-card__title-wrap">
              <AlertTriangle size={18} className="text-amber" />
              <div>
                <h3 className="chart-card__title">Academic Risk Distribution</h3>
                <p className="chart-card__subtitle">Attendance, CGPA & backlogs analysis</p>
              </div>
            </div>
            <span className="chart-badge">Loading</span>
          </div>
          <div className="chart-wrapper chart-wrapper--placeholder">
            <RefreshCw size={24} className="spin-icon text-muted" />
            <p className="chart-placeholder-text">Loading academic risk distribution...</p>
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-card__header">
            <div className="chart-card__title-wrap">
              <Briefcase size={18} className="text-blue" />
              <div>
                <h3 className="chart-card__title">Placement Readiness Tiers</h3>
                <p className="chart-card__subtitle">Coding, aptitude & mock interview benchmarks</p>
              </div>
            </div>
            <span className="chart-badge">Loading</span>
          </div>
          <div className="chart-wrapper chart-wrapper--placeholder">
            <RefreshCw size={24} className="spin-icon text-muted" />
            <p className="chart-placeholder-text">Loading placement readiness benchmarks...</p>
          </div>
        </div>

        <div className="chart-card chart-card--wide">
          <div className="chart-card__header">
            <div className="chart-card__title-wrap">
              <Network size={18} className="text-teal" />
              <div>
                <h3 className="chart-card__title">Program Comparison & Success Benchmarks</h3>
                <p className="chart-card__subtitle">Departmental performance across CSE (04), AIML (18), and Cybersecurity (19)</p>
              </div>
            </div>
            <span className="chart-badge">Loading</span>
          </div>
          <div className="chart-wrapper chart-wrapper--placeholder">
            <RefreshCw size={24} className="spin-icon text-muted" />
            <p className="chart-placeholder-text">Loading departmental comparison metrics...</p>
          </div>
        </div>
      </div>
    );
  }

  // Chart 1: Academic Risk Donut Data
  const riskData = [
    { name: 'High Risk', value: overview.riskDistribution?.high || 0, color: RISK_COLORS.High },
    { name: 'Medium Risk', value: overview.riskDistribution?.medium || 0, color: RISK_COLORS.Medium },
    { name: 'Low Risk', value: overview.riskDistribution?.low || 0, color: RISK_COLORS.Low }
  ];

  // Chart 2: Placement Readiness Bar Data
  const placementData = [
    { name: 'Job Ready', count: overview.placementDistribution?.jobReady || 0, fill: PLACEMENT_COLORS['Job Ready'] },
    { name: 'Needs Upskilling', count: overview.placementDistribution?.needsUpskilling || 0, fill: PLACEMENT_COLORS['Needs Upskilling'] },
    { name: 'High Priority', count: overview.placementDistribution?.highPriorityIntervention || 0, fill: PLACEMENT_COLORS['High Priority'] }
  ];

  // Chart 3: Branch Comparison Data
  const branchData = (overview.branches || []).map((b) => ({
    branch: b.slug || b.code,
    fullName: b.name,
    totalStudents: b.count,
    avgScore: b.avgScore,
    highRisk: b.highRiskCount || 0,
    jobReady: b.jobReadyCount || 0
  }));

  const total = overview.totalStudents || 120;

  return (
    <div className="analytics-charts-grid">
      {/* Chart 1: Academic Risk Donut */}
      <div className="chart-card">
        <div className="chart-card__header">
          <div className="chart-card__title-wrap">
            <AlertTriangle size={18} className="text-amber" />
            <div>
              <h3 className="chart-card__title">Academic Risk Distribution</h3>
              <p className="chart-card__subtitle">Attendance, CGPA & backlogs analysis</p>
            </div>
          </div>
          <span className="chart-badge">{total} Students</span>
        </div>
        <div className="chart-wrapper">
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={riskData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={4}
                dataKey="value"
              >
                {riskData.map((entry, index) => (
                  <Cell key={`risk-cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(val, name) => [`${val} students (${((val / total) * 100).toFixed(1)}%)`, name]}
                contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Placement Readiness */}
      <div className="chart-card">
        <div className="chart-card__header">
          <div className="chart-card__title-wrap">
            <Briefcase size={18} className="text-blue" />
            <div>
              <h3 className="chart-card__title">Placement Readiness Tiers</h3>
              <p className="chart-card__subtitle">Coding, aptitude & mock interview benchmarks</p>
            </div>
          </div>
          <span className="chart-badge">Career Gate</span>
        </div>
        <div className="chart-wrapper">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={placementData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 12 }} />
              <YAxis stroke="#64748b" allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(val, name, props) => [`${val} students`, props.payload.name]}
                contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
              <Bar dataKey="count" name="Students" radius={[6, 6, 0, 0]}>
                {placementData.map((entry, index) => (
                  <Cell key={`placement-cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 3: Departmental Comparison */}
      <div className="chart-card chart-card--wide">
        <div className="chart-card__header">
          <div className="chart-card__title-wrap">
            <Network size={18} className="text-teal" />
            <div>
              <h3 className="chart-card__title">Program Comparison & Success Benchmarks</h3>
              <p className="chart-card__subtitle">Departmental performance across CSE (04), AIML (18), and Cybersecurity (19)</p>
            </div>
          </div>
          <span className="chart-badge">Cohort Overview</span>
        </div>
        <div className="chart-wrapper">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={branchData} margin={{ top: 20, right: 30, left: -5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="branch" stroke="#64748b" tick={{ fontSize: 13, fontWeight: 600 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
              <Legend verticalAlign="top" height={36} />
              <Bar dataKey="totalStudents" name="Enrolled Students" fill="#94a3b8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="avgScore" name="Avg Success Score (/100)" fill="#2563eb" radius={[4, 4, 0, 0]} />
              <Bar dataKey="highRisk" name="Needs Intervention (High Risk)" fill="#ef4444" radius={[4, 4, 0, 0]} />
              <Bar dataKey="jobReady" name="Job Ready" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsCharts;
