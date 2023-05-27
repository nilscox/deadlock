import { LinkProps, Link as WLink } from 'wouter';

export const Link = ({ children, ...props }: LinkProps) => (
  <WLink {...props}>
    <a>{children}</a>
  </WLink>
);

type LinkButtonProps = Omit<React.HTMLAttributes<HTMLButtonElement>, 'href'> & {
  href: string;
};

export const LinkButton = ({ href, ...props }: LinkButtonProps) => (
  <WLink href={href}>
    <button {...props} />
  </WLink>
);
