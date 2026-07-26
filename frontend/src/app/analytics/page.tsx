"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { PageSkeleton } from "@/components/Skeleton";
import { useHubData } from "@/lib/hub-data";

const COLORS = ["#e8843a", "#2a9aa6", "#54786d", "#f0a05a", "#1f7c86"];

export default function AnalyticsPage() {
  const { loading, projects, reviews, universities } = useHubData();

  if (loading) return <PageSkeleton />;

  const fundingByField = Object.values(
    projects.reduce<Record<string, { field: string; grant: number; released: number }>>(
      (acc, p) => {
        if (!acc[p.field]) {
          acc[p.field] = { field: p.field, grant: 0, released: 0 };
        }
        acc[p.field].grant += p.grantAmount;
        acc[p.field].released += p.releasedAmount;
        return acc;
      },
      {},
    ),
  );

  const statusPie = Object.entries(
    projects.reduce<Record<string, number>>((acc, p) => {
      acc[p.status] = (acc[p.status] ?? 0) + 1;
      return acc;
    }, {}),
  ).map(([name, value]) => ({ name, value }));

  const avgScore =
    reviews.length === 0
      ? 0
      : Math.round(reviews.reduce((s, r) => s + r.score, 0) / reviews.length);

  return (
    <div className="rh-container space-y-8">
      <div>
        <h1 className="font-display text-3xl sm:text-4xl">Analytics</h1>
        <p className="mt-1 text-[var(--muted)]">
          Funding distribution, project status mix, and review quality signals.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rh-panel p-5">
          <p className="text-xs uppercase text-[var(--muted)]">Projects</p>
          <p className="mt-2 font-display text-3xl">{projects.length}</p>
        </div>
        <div className="rh-panel p-5">
          <p className="text-xs uppercase text-[var(--muted)]">Avg review score</p>
          <p className="mt-2 font-display text-3xl">{avgScore}</p>
        </div>
        <div className="rh-panel p-5">
          <p className="text-xs uppercase text-[var(--muted)]">Universities</p>
          <p className="mt-2 font-display text-3xl">{universities.length}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rh-panel p-5">
          <h2 className="mb-4 font-display text-xl">Funding by field</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={fundingByField}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="field" hide />
                <YAxis />
                <Tooltip />
                <Bar dataKey="grant" fill="#2a9aa6" name="Grant" radius={6} />
                <Bar dataKey="released" fill="#e8843a" name="Released" radius={6} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rh-panel p-5">
          <h2 className="mb-4 font-display text-xl">Status mix</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusPie} dataKey="value" nameKey="name" outerRadius={100} label>
                  {statusPie.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
    </div>
  );
}
