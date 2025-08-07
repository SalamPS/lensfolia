import Link from "next/link";
import React from "react";
import { Button } from "../ui/button";
import { ChevronLeft } from "lucide-react";
import { Badge } from "../ui/badge";
import NotificationCard from "./NotificationCard";
import { Notification } from "./MockData";

// Mock data notifikasi
const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "reply",
    user: {
      id: "u1",
      name: "Budi Santoso",
      avatar: "/asset-web-1.png",
    },
    timeAgo: "2 jam yang lalu",
    post: {
      id: "p1",
      title: "Masalah pada daun jagung menguning",
    },
    replyContent:
      "Saya pernah mengalami masalah serupa, coba gunakan pupuk organik...",
    isRead: false,
  },
  {
    id: "2",
    type: "mention",
    user: {
      id: "u2",
      name: "Ani Wijaya",
      avatar: "/avatars/ani.jpg",
    },
    timeAgo: "1 hari yang lalu",
    post: {
      id: "p2",
      title: "Hama ulat pada tanaman tomat",
    },
    comment: {
      id: "c1",
      content: "Saya sudah mencoba pestisida organik tapi tidak mempan...",
      isYourComment: true,
    },
    replyContent:
      "@Andi Coba gunakan larutan bawang putih, lebih ampuh untuk ulat kecil...",
    isRead: true,
  },
  {
    id: "3",
    type: "reply",
    user: {
      id: "u3",
      name: "Rudi Hartono",
      avatar: "/avatars/rudi.jpg",
    },
    timeAgo: "3 hari yang lalu",
    post: {
      id: "p3",
      title: "Tips merawat tanaman cabai di musim hujan",
    },
    replyContent: "Terima kasih atas tipsnya, sangat membantu!",
    isRead: true,
  },
  {
    id: "4",
    type: "mention",
    user: {
      id: "u4",
      name: "Dewi Lestari",
      avatar: "/avatars/dewi.jpg",
    },
    timeAgo: "3 minggu yang lalu",
    post: {
      id: "p4",
      title: "Pertanyaan tentang hidroponik untuk pemula",
    },
    comment: {
      id: "c2",
      content: "Tanaman apa yang paling mudah untuk pemula hidroponik?",
      isYourComment: true,
    },
    replyContent: "@Andi Saya sarankan mulai dengan kangkung atau selada...",
    isRead: true,
  },
];

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
  const groupedNotifications = groupNotificationsByTime(mockNotifications);

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
                  {mockNotifications.filter((n) => !n.isRead).length} notifikasi
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
              {mockNotifications.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <p className="text-muted-foreground">
                    Tidak ada notifikasi saat ini
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default NotificationPage;
