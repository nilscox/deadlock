import { useLocation } from 'wouter';

export const useNavigate = () => {
  const [, setLocation] = useLocation();
  return setLocation;
};
