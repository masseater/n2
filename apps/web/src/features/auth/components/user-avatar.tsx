import type { User } from "@n2/shared";

type UserAvatarProps = {
  user: User;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeClasses = {
  sm: "w-8 h-8",
  md: "w-10 h-10",
  lg: "w-12 h-12",
} as const;

/**
 * ユーザーアバター表示コンポーネント
 *
 * 画像がある場合は画像を表示、ない場合はイニシャルを表示
 */
export function UserAvatar({ user, size = "md", className = "" }: UserAvatarProps) {
  const sizeClass = sizeClasses[size];
  const initial = user.name.charAt(0).toUpperCase();

  if (user.image) {
    return (
      <img
        src={user.image}
        alt={user.name}
        className={`${sizeClass} rounded-full object-cover ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 font-medium ${className}`}
    >
      {initial}
    </div>
  );
}
