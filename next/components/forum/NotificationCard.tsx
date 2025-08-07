import Link from "next/link";
import { Avatar, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Notification } from "./MockData";
import { IconArrowUpRight, IconAt, IconMessageCircle, IconX } from "@tabler/icons-react";

interface NotificationCardProps {
  notification: Notification;
}

const NotificationCard = ({ notification }: NotificationCardProps) => {
  return (
    <div
      className={`bg-background border-border rounded-xl border p-4 ${!notification.isRead ? "border-primary ring-4 ring-teal-500/20" : ""}`}
    >
      {/* Content */}
      <div className="flex flex-col">
        {/* User info and time */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar>
              <AvatarImage
                src={notification.user.avatar}
                alt={notification.user.name}
              />
            </Avatar>
            <div className="flex w-full flex-col">
              <p className="font-medium">{notification.user.name}</p>
              <span className="text-muted-foreground text-xs">
                {notification.timeAgo}
              </span>
            </div>
          </div>
          {/* button delete notif */}
          <Button variant="outline" size="icon">
            <IconX />
          </Button>
        </div>

        <div className="my-4 flex flex-col gap-2">
          {/* status */}
          <div className="flex w-full items-center gap-1">
            {notification.type === "reply" ? (
              <IconMessageCircle className="h-4 w-4 text-teal-500" />
            ) : (
              <IconAt className="h-4 w-4 text-teal-500" />
            )}
            <p className="text-muted-foreground font semibold text-sm">
              {notification.type === "reply"
                ? "membalas postingan Anda"
                : "membalas komentar Anda"}
            </p>
          </div>

          {/* Post title */}
          <div>
            <p className="bg-card text-muted-foreground flex flex-col md:flex-row items-start w-fit md:items-center gap-1 rounded p-2 text-sm">
              Pada postingan :{" "}
              <Link href={`/forum/post/${notification.post.id}`}>
                {" "}
                <span className="hover:text-primary font-bold hover:underline">
                  {notification.post.title}
                </span>
              </Link>
            </p>
          </div>

          {/* reply */}
          <div className="dark:bg-muted/30 flex flex-col gap-2 rounded-lg bg-zinc-200 p-3">
            {/* my refer comment */}
            {notification.type === "mention" && notification.comment && (
              <div className="text-muted-foreground text-sm">
                <p className="line-clamp-3 italic">
                  &ldquo;{notification.comment.content}&rdquo;
                </p>
              </div>
            )}
            <p className="font-medium">{notification.replyContent}</p>
          </div>
        </div>

        {/* Action button */}
        <div className="flex justify-end">
          {/* ceritanya pas diklik langsung ke bagian komennya xixixi */}
          <Link
            href={`/forum/post/${notification.post.id}${notification.comment ? `#c-${notification.comment.id}` : ""}`}
          >
            <Button variant="outline">
              Kunjungi
              <IconArrowUpRight />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotificationCard;
