import { useState } from "react";
import { useContent, useUpdateContent } from "@/lib/content/useContent";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export default function AdminContent() {
  const { data: content, isLoading } = useContent();
  const updateContent = useUpdateContent();

  const [editing, setEditing] = useState<any>(null);
  const [value, setValue] = useState("");

  if (isLoading) return <p>Loading...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Content Editor</h1>

      <div className="grid gap-4">
        {content?.map((item) => (
          <div
            key={item.id}
            className="border rounded p-4 bg-white shadow-sm flex justify-between items-center"
          >
            <div>
              <p className="font-semibold">{item.key}</p>
              <p className="text-gray-600 text-sm truncate max-w-md">
                {item.value}
              </p>
            </div>

            <Button
              onClick={() => {
                setEditing(item);
                setValue(item.value);
              }}
            >
              Edit
            </Button>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit: {editing?.key}</DialogTitle>
          </DialogHeader>

          <Textarea
            className="min-h-[200px]"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />

          <Button
            className="mt-4"
            onClick={() => {
              updateContent.mutate(
                { id: editing.id, value },
                {
                  onSuccess: () => setEditing(null),
                }
              );
            }}
          >
            Save Changes
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}