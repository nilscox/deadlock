import { clsx } from 'clsx';
import { Link as WLink } from 'wouter';

type LinkProps = Omit<React.HTMLAttributes<HTMLAnchorElement>, 'href'> & {
  href: string;
  disabled?: boolean;
};

export const Link = ({ href, disabled, className, ...props }: LinkProps) => {
  if (disabled) {
    return <span aria-disabled className={clsx('text-muted', className)} {...props} />;
  }

  return (
    <WLink href={href}>
      <a className={className} {...props} />
    </WLink>
  );
};

type LinkButtonProps = Omit<React.HTMLAttributes<HTMLButtonElement>, 'href'> & {
  href: string;
};

export const LinkButton = ({ href, ...props }: LinkButtonProps) => (
  <WLink href={href}>
    <button {...props} />
  </WLink>
);
