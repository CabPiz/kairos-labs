import React from "react";

type LinkProps = {
  readonly href: string;
  readonly children: React.ReactNode;
  readonly className?: string;
};

export default function Link({ href, children, ...props }: LinkProps) {
  return (
    <a href={href} {...props}>
      {children}
    </a>
  );
}
