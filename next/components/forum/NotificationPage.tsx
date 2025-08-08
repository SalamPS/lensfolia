"use client"

import Link from "next/link";
import React, { useContext, useEffect } from "react";
import { Button } from "../ui/button";
import { ChevronLeft } from "lucide-react";
import { Badge } from "../ui/badge";
import NotificationCard from "./NotificationCard";
import NotificationCardSkeleton from "./NotificationCardSkeleton";
import { Notification } from "./MockData";
import { PostContext } from "./PostContext";
import { ForumNotificationQuery } from "./ForumQueryUtils";

// Fungsi mengelompokkan notifikasi 
const groupNotificationsByTime = (notifications: Notification[]) => {
  return notifications.reduce(
    (acc, notification) => {
      const timeAgo = notification.timeAgo;

      if (timeAgo.includes("jam")) {
        acc.today.push(notification);
      } else if (timeAgo.includes("hari")) {
        const days = parseInt(timeAgo) || 0;
        if (days <= 7) {
          acc.lastWeek.push(notification);
        } else {
          acc.older.push(notification);
        }
      } else {
        acc.older.push(notification);
      }

      return acc;
    },
    { today: [], lastWeek: [], older: [] } as Record<string, Notification[]>,
  );
};


const NotificationPage = () => {
  const [notifs, setNotifs] = React.useState<Notification[]>([]);
  const [loading, setLoading] = React.useState(true);
  const {user, refresh} = useContext(PostContext);

  useEffect(() => {
    (async () => {
      if (!user) return;
      const data = await ForumNotificationQuery(user.id);
      if (!data) {
        console.error("Error fetching notifications");
      } else {
        console.log(data);
        const clone = data
          .map((notif) => ({
            ...notif,
            timeAgo: notif.created_at
              ? new Date().getTime() - new Date(notif.created_at).getTime() < 86400000
          ? `${Math.floor((new Date().getTime() - new Date(notif.created_at).getTime()) / 3600000)} jam yang lalu`
          : `${Math.floor((new Date().getTime() - new Date(notif.created_at).getTime()) / 86400000)} hari yang lalu`
              : "Waktu tidak diketahui",
          }))
        setNotifs(clone);
        }
        setLoading(false);
      })();
    }, [user, refresh])

    const groupedNotifications = groupNotificationsByTime(notifs);

    return (
    <>
      <section className="bg-background flex min-h-screen w-full justify-center px-4 pt-20 pb-10">
        <div className="w-full max-w-4xl">
          {/* header container */}
          <div className="flex flex-col justify-center gap-6">
            <Link href="/forum">
              <Button variant="outline" size="sm">
                <ChevronLeft className="mr-2 h-4 w-4" />
                Kembali
              </Button>
            </Link>

            {/* title */}
            <div className="flex flex-col justify-center gap-4">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-semibold">Notifikasi</h1>
                <Badge variant="default">
                  {notifs.filter((n) => !n.is_read).length} notifikasi
                  baru
                </Badge>
              </div>
              <p className="text-muted-foreground max-w-2xl text-sm">
                Tetap perbarui informasi balasan dan penyebutan di diskusi forum
                Anda
              </p>
            </div>

            {/* Notifications list */}
            <div className="mt-6 space-y-6">
              {loading ? (
                // Show skeletons while loading
                <>
                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold">Memuat notifikasi...</h2>
                    {Array.from({ length: 5 }).map((_, index) => (
                      <NotificationCardSkeleton key={index} />
                    ))}
                  </div>
                </>
              ) : (
                <>
                  {/* Hari Ini */}
                  {groupedNotifications.today.length > 0 && (
                    <div className="space-y-4">
                      <h2 className="text-lg font-semibold">Hari Ini</h2>
                      {groupedNotifications.today.map((notification) => (
                        <NotificationCard
                          key={notification.id}
                          notification={notification}
                        />
                      ))}
                    </div>
                  )}

                  {/* 7 Hari Terakhir */}
                  {groupedNotifications.lastWeek.length > 0 && (
                    <div className="space-y-4">
                      <h2 className="text-lg font-semibold">7 Hari Terakhir</h2>
                      {groupedNotifications.lastWeek.map((notification) => (
                        <NotificationCard
                          key={notification.id}
                          notification={notification}
                        />
                      ))}
                    </div>
                  )}

                  {/* Lebih Lama */}
                  {groupedNotifications.older.length > 0 && (
                    <div className="space-y-4">
                      <h2 className="text-lg font-semibold">Lebih Lama</h2>
                      {groupedNotifications.older.map((notification) => (
                        <NotificationCard
                          key={notification.id}
                          notification={notification}
                        />
                      ))}
                    </div>
                  )}

                  {/* Jika tidak ada notifikasi */}
                  {notifs.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <p className="text-muted-foreground">
                        Tidak ada notifikasi saat ini
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default NotificationPage;
