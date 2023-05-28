import { Link } from '~/components/link';
import { MobileView } from '~/mobile-view';

export const LabView = () => (
  <MobileView>
    <div className="row items-end justify-between">
      <Link href="/" className="row gap-2 items-center">
        <div className="text-muted flip-horizontal">➜</div> Home
      </Link>
    </div>

    <div className="flex-1 col justify-center">
      <h1 className="font-extrabold text-xl">Options</h1>
    </div>

    <div className="flex-1">
      <ul className="col gap-4">
        <li>
          <button onClick={() => alert("I'm working on it!!")}>Try players levels</button>
        </li>

        <li>
          <Link href="/level-editor">Create level</Link>
        </li>
      </ul>
    </div>

    <div className="flex-1"></div>
  </MobileView>
);
