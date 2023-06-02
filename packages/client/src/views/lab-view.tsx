import { Link } from '~/components/link';
import { Translate } from '~/components/translate';
import { MobileView } from '~/mobile-view';

const T = Translate.prefix('views.lab');

export const LabView = () => (
  <MobileView>
    <div className="row items-end justify-between">
      <Link href="/" className="row gap-2 items-center">
        <div className="text-muted flip-horizontal">➜</div> <Translate id="navigation.home" />
      </Link>
    </div>

    <div className="flex-1 col justify-center">
      <h1 className="font-extrabold text-xl">
        <T id="title" />
      </h1>
    </div>

    <div className="flex-1">
      <ul className="col gap-4">
        <li>
          <Link href="/lab/level">
            <T id="levels" />
          </Link>
        </li>

        <li>
          <Link href="/level-editor">
            <T id="createLevel" />
          </Link>
        </li>
      </ul>
    </div>

    <div className="flex-1"></div>
  </MobileView>
);
