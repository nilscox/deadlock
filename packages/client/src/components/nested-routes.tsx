import { Router, useLocation, useRouter } from 'wouter';

type NestedRoutesProps = {
  base: string;
  children: React.ReactNode;
};

export const NestedRoutes = ({ base, children }: NestedRoutesProps) => {
  const router = useRouter();
  const [parentLocation] = useLocation();

  const nestedBase = `${router.base}${base}`;

  if (!parentLocation.startsWith(nestedBase)) {
    return null;
  }

  return (
    <Router base={nestedBase} key={nestedBase}>
      {children}
    </Router>
  );
};
