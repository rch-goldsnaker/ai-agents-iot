import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { UIMessage } from "ai";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps, HTMLAttributes } from "react";
import { User, Bot } from "lucide-react";

export type MessageProps = HTMLAttributes<HTMLDivElement> & {
  from: UIMessage["role"];
};

export const Message = ({ className, from, ...props }: MessageProps) => (
  <div
    className={cn(
      "group flex w-full items-start gap-2 sm:gap-3 py-2 sm:py-3 px-1 sm:px-0",
      from === "user" ? "is-user justify-end" : "is-assistant justify-start",
      className
    )}
    {...props}
  />
);

const messageContentVariants = cva(
  "is-user:dark flex flex-col gap-2 overflow-hidden rounded-xl text-sm leading-relaxed bg-slate-800",
  {
    variants: {
      variant: {
        contained: [
          "max-w-[90%] sm:max-w-[80%] lg:max-w-[75%] px-3 sm:px-4 py-2 sm:py-3",
          "group-[.is-user]:message-user group-[.is-user]:text-white/95",
          "group-[.is-assistant]:message-ai group-[.is-assistant]:text-gray-50",
        ],
        flat: [
          "group-[.is-user]:max-w-[90%] group-[.is-user]:sm:max-w-[80%] group-[.is-user]:lg:max-w-[75%] group-[.is-user]:message-user group-[.is-user]:px-3 group-[.is-user]:sm:px-4 group-[.is-user]:py-2 group-[.is-user]:sm:py-3 group-[.is-user]:text-white/95",
          "group-[.is-assistant]:text-gray-50",
        ],
      },
    },
    defaultVariants: {
      variant: "contained",
    },
  }
);

export type MessageContentProps = HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof messageContentVariants>;

export const MessageContent = ({
  children,
  className,
  variant,
  ...props
}: MessageContentProps) => (
  <div
    className={cn(messageContentVariants({ variant, className }))}
    {...props}
  >
    {children}
  </div>
);

export type MessageAvatarProps = ComponentProps<typeof Avatar> & {
  src: string;
  name?: string;
};

export const MessageAvatar = ({
  src,
  name,
  className,
  ...props
}: MessageAvatarProps) => {
  const isUser = name === 'User';
  const fallbackClass = isUser 
    ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white" 
    : "bg-gradient-to-r from-purple-500 to-purple-600 text-white";
    
  return (
    <Avatar className={cn("size-7 sm:size-8 lg:size-9 ring-2 ring-border/50 flex-shrink-0 mt-1", className)} {...props}>
      <AvatarImage alt="" className="mt-0 mb-0" src={src} />
      <AvatarFallback className={cn("text-xs font-semibold", fallbackClass)}>
        {isUser ? <User className="w-3 h-3 sm:w-4 sm:h-4" /> : <Bot className="w-3 h-3 sm:w-4 sm:h-4" />}
      </AvatarFallback>
    </Avatar>
  );
};
