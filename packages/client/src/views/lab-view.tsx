import { ArrowLeft } from '~/components/arrows';
import { Link } from '~/components/link';
import { Translate } from '~/components/translate';
import { MobileNavigation, MobileView } from '~/mobile-view';

const T = Translate.prefix('views.lab');

export const LabView = () => (
  <MobileView
    header={
      <MobileNavigation
        left={
          <Link href="/" className="row gap-2 items-center">
            <ArrowLeft />
            <Translate id="navigation.home" />
          </Link>
        }
      />
    }
  >
    <div className="flex-1 justify-center col">
      <h1 className="font-extrabold text-xl">
        <T id="title" />
      </h1>
    </div>

    <div className="flex-2">
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
  </MobileView>
);
