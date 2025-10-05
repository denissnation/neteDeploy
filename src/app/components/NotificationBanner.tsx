"use client";

type Notification = {
  message: string;
  type: "success" | "error";
  show: boolean;
};

export default function NotificationBanner({
  notification,
}: {
  notification: Notification;
}) {
  if (!notification.show) return null;
  const bgColor =
    notification.type === "success" ? "bg-green-100" : "bg-red-100";
  const textColor =
    notification.type === "success" ? "text-green-800" : "text-red-800";
  return (
    <div className={`${bgColor} ${textColor} p-4 mb-4 rounded-md`}>
      {notification.message}
    </div>
  );
}
