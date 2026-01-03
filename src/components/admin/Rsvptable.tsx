import { useRsvps } from "../../hooks/useRsvps";

export default function RsvpTable() {
  const { data, isLoading, isError } = useRsvps();

  if (isLoading) return <p>Loading RSVPs...</p>;
  if (isError) return <p>Failed to load RSVPs.</p>;

  return (
    <div className="overflow-x-auto border rounded-lg bg-white shadow">
      <table className="w-full text-left border-collapse">
        <thead className="bg-gray-100 border-b">
          <tr>
            <th className="p-3">Name</th>
            <th className="p-3">Email</th>
            <th className="p-3">Attending</th>
            <th className="p-3">Guests</th>
             <th className="p-3">Meal</th>
            <th className="p-3">Message</th>
            <th className="p-3">Submitted</th>
          </tr>
        </thead>

        <tbody>
          {data?.map((rsvp) => (
            <tr key={rsvp.id} className="border-b hover:bg-gray-50">
              <td className="p-3">{rsvp.name}</td>
              <td className="p-3">{rsvp.email}</td>
              <td className="p-3">
                {rsvp.attending ? "Yes" : "No"}
              </td>
              <td className="p-3">{rsvp.guests}</td>
               <td className="p-3">{rsvp.meal_preference || "—"}</td>
              <td className="p-3">{rsvp.message || "—"}</td>
              <td className="p-3">
                {new Date(rsvp.created_at).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}