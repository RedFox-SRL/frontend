import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AnnouncementList({ announcements }) {
  return (
    <div className="space-y-4">
      {announcements.length > 0 ? (
        announcements.map((announcement) => (
          <Card key={announcement.id}>
            <CardHeader>
              <CardTitle>{announcement.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{announcement.content}</p>
              {announcement.attachment && (
                <a
                  href={announcement.attachment}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-600 hover:underline mt-2 block"
                >
                  Ver documento adjunto
                </a>
              )}
              <p className="text-sm text-gray-500 mt-2">
                Publicado el:{" "}
                {new Date(announcement.created_at).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        ))
      ) : (
        <p className="text-center text-gray-500">
          No hay anuncios disponibles.
        </p>
      )}
    </div>
  );
}
