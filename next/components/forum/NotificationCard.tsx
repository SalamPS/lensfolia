import Link from "next/link";
import { Avatar, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Notification } from "./MockData";
import { IconArrowUpRight, IconAt, IconCheck, IconMessageCircle, IconX } from "@tabler/icons-react";
import { getTimeAgo } from "./ForumQueryUtils";
import { supabase } from "@/lib/supabase";
import { useContext } from "react";
import { PostContext } from "./PostContext";

interface NotificationCardProps {
  notification: Notification;
}

const NotificationCard = ({ notification }: NotificationCardProps) => {
  const {setRefresh} = useContext(PostContext)

  const markAsReadHandler = async () => {
    const {error} = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", notification.id);
    if (error) {
      return console.error("Error marking notification as read:", error);
    }
    setRefresh(prev => prev+1);
  }

  const deleteNotificationHandler = async () => {
    const {error} = await supabase
      .from("notifications")
      .delete()
      .eq("id", notification.id);
    if (error) {
      return console.error("Error deleting notification:", error);
    }
    setRefresh(prev => prev+1);
  }

  return (
    <div
      className={`bg-background border-border rounded-xl border p-4 ${!notification.is_read ? "border-primary ring-4 ring-teal-500/20" : ""}`}
    >
      {/* Content */}
      <div className="flex flex-col">
        {/* User info and time */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage
                src={notification.author.profile_picture}
                alt={notification.author.name}
              />
            </Avatar>
            <div className="flex w-full flex-col">
              <p className="font-medium">{notification.author.name}</p>
              <span className="text-muted-foreground text-xs">
                {getTimeAgo(notification.created_at)}
              </span>
            </div>
          </div>
          {/* button delete notif */}
          <Button variant="outline" size="icon" onClick={deleteNotificationHandler}>
            <IconX />
          </Button>
        </div>

        <div className="my-4 flex flex-col gap-2">
          {/* status */}
          <div className="flex w-full items-center gap-1">
            {notification.content_type === "discussions" ? (
              <IconMessageCircle className="h-4 w-4 text-teal-500" />
            ) : (
              <IconAt className="h-4 w-4 text-teal-500" />
            )}
            <p className="text-muted-foreground font semibold text-sm">
              {notification.content_type === "discussions"
                ? "membalas postingan Anda"
                : "membalas komentar Anda"}
            </p>
          </div>

          {/* Post title */}
          <div>
            <p className="bg-card text-muted-foreground items-center rounded p-2 text-sm">
              <span className="w-fit">
                Pada postingan:{" "}
              </span>
              <Link href={notification.content_uri} className="hover:text-primary font-bold hover:underline line-clamp-1">
              {
                notification.ref_forums?.content ||
                notification.ref_comments?.content ||
                notification.ref_discussions?.content
              }
              </Link>
            </p>
          </div>

          {/* reply */}
          <div className="dark:bg-muted/30 flex flex-col gap-2 rounded-lg bg-zinc-200 p-3">
            <p className="text-muted-foreground line-clamp-3">{
              notification.ori_comments?.content ||
              notification.ori_discussions?.content
            }</p>
          </div>
        </div>

        {/* Action button */}
        <div className="flex justify-end gap-2">
          {/* Button to mark as read */}
          {!notification.is_read && (
            <Button
              variant="outline"
              onClick={markAsReadHandler}
            >
              <IconCheck className="mr-1 h-4 w-4" />
              Tandai dibaca
            </Button>
          )}
          {/* Link to navigate to the content */}
          <Link href={notification.content_uri}>
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
