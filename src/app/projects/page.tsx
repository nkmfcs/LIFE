import { PageTitle, Card, Badge, ProgressRing } from "@/components/ui";
import { Icon } from "@/components/icons";
import { getProjectsData } from "@/lib/queries";

export const dynamic = "force-dynamic";

const statusLabel: Record<string, string> = { ok: "идёт", warn: "внимание", alert: "горит" };

export default async function ProjectsPage() {
  const { projects, goals, deadlines } = await getProjectsData();

  return (
    <>
      <PageTitle title="Проекты" />
      <div className="grid2">
        <Card title="Мои проекты" delay={40}>
          <div className="col">
            {projects.length === 0 && <p className="t-small" style={{ color: "var(--ink-mute)" }}>Проектов нет.</p>}
            {projects.map((p, i) => (
              <div key={p.key} className="row" style={{ gap: 12, padding: "14px 0", borderTop: i ? "1px solid var(--line)" : "none", alignItems: "flex-start" }}>
                <Icon name="heart" size={19} stroke={1.6} style={{ color: "var(--ink-soft)", marginTop: 2 }} />
                <div style={{ flex: 1 }}>
                  <div className="row center" style={{ gap: 8 }}>
                    <p className="t-small" style={{ fontWeight: 600 }}>{p.name}</p>
                    <Badge variant={p.status === "ok" ? "neutral" : "accent"}>{statusLabel[p.status] ?? p.status}</Badge>
                  </div>
                  <p className="t-micro" style={{ color: "var(--ink-soft)", marginTop: 3, lineHeight: 1.4 }}>{p.next}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card id="deadlines" title="Дедлайны" delay={80}>
          <div className="col" style={{ gap: 12 }}>
            {deadlines.length === 0 && <p className="t-small" style={{ color: "var(--ink-mute)" }}>Дедлайнов нет.</p>}
            {deadlines.map((d) => {
              const variant = d.daysLeft < 0 ? "danger" : d.daysLeft <= 1 ? "accent" : "neutral";
              const icon = d.daysLeft < 0 ? "alert" : d.daysLeft <= 1 ? "clock" : "calendar";
              return (
                <div key={d.id} className="col" style={{ gap: 5 }}>
                  <span className="t-body" style={{ fontWeight: 500, lineHeight: 1.3 }}>{d.title}</span>
                  <div className="row center" style={{ gap: 8 }}>
                    <Badge variant={variant} icon={icon}>{d.due}</Badge>
                    {d.project && <span className="t-micro" style={{ color: "var(--ink-mute)" }}>{d.project}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card title="Активные цели" delay={120} className="span2">
          <div className="row" style={{ gap: 32, flexWrap: "wrap" }}>
            {goals.length === 0 && <p className="t-small" style={{ color: "var(--ink-mute)" }}>Целей с прогрессом пока нет.</p>}
            {goals.map((g, i) => (
              <div key={g.id} className="row center" style={{ gap: 14 }}>
                <ProgressRing value={g.progress / 100} size={76} stroke={6} label={`${g.progress}%`} delay={i * 120} />
                <div>
                  <p className="t-small" style={{ fontWeight: 600 }}>{g.title}</p>
                  <p className="t-micro" style={{ color: "var(--ink-mute)", marginTop: 3 }}>{g.current} → {g.target} {g.unit}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}
