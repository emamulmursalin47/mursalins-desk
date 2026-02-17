import { getMyAppointments } from "@/lib/api";
import { StatusBadge } from "@/components/portal/status-badge";
import { EmptyState } from "@/components/portal/empty-state";

export default async function MyAppointmentsPage() {
  const result = await getMyAppointments();

  const now = new Date();
  const upcoming = result.data.filter((a) => new Date(a.date) >= now);
  const past = result.data.filter((a) => new Date(a.date) < now);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Appointments</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your scheduled meetings.
        </p>
      </div>

      {result.data.length === 0 ? (
        <EmptyState message="You don't have any appointments yet." />
      ) : (
        <>
          {/* Upcoming */}
          {upcoming.length > 0 && (
            <div>
              <h2 className="mb-4 text-lg font-semibold text-foreground">
                Upcoming
              </h2>
              <div className="space-y-4">
                {upcoming.map((appt) => (
                  <AppointmentCard key={appt.id} appointment={appt} />
                ))}
              </div>
            </div>
          )}

          {/* Past */}
          {past.length > 0 && (
            <div>
              <h2 className="mb-4 text-lg font-semibold text-foreground">
                Past
              </h2>
              <div className="space-y-4">
                {past.map((appt) => (
                  <AppointmentCard key={appt.id} appointment={appt} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function AppointmentCard({
  appointment: appt,
}: {
  appointment: {
    id: string;
    date: string;
    duration: number;
    topic: string | null;
    status: string;
    type: string;
    meetingUrl: string | null;
    timezone: string;
  };
}) {
  const date = new Date(appt.date);

  return (
    <div className="glass glass-shine rounded-2xl p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-foreground">
            {date.toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {date.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            })}{" "}
            · {appt.duration} min · {appt.type}
          </p>
        </div>
        <StatusBadge status={appt.status} />
      </div>

      {appt.topic && (
        <p className="mt-2 text-sm text-foreground">{appt.topic}</p>
      )}

      {appt.meetingUrl && (
        <a
          href={appt.meetingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-block text-sm font-medium text-primary-600 hover:text-primary-500 transition-colors"
        >
          Join Meeting &rarr;
        </a>
      )}
    </div>
  );
}
