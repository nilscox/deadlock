import { Link as WLink } from 'wouter';

type LinkProps = Omit<React.HTMLAttributes<HTMLAnchorElement>, 'href'> & {
  href: string;
};

export const Link = ({ href, ...props }: LinkProps) => (
  <WLink href={href}>
    <a {...props} />
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
