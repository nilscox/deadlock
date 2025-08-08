import styles from './app-header.module.css';

type AppHeaderProps = {
  left?: React.ReactNode;
  center?: React.ReactNode;
  right?: React.ReactNode;
};

export function AppHeader({ left, center, right }: AppHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.left}>{left}</div>
      <div className={styles.center}>{center}</div>
      <div className={styles.right}>{right}</div>
    </header>
  );
}
