import { Translate } from '~/components/translate';

const T = Translate.prefix('views.404');

export const NotFoundView = () => (
  <>
    <div className="absolute h-full w-full col justify-center items-center">
      <div className="text-[16rem] font-extrabold text-[#f3f3f3]">
        <T id="404" />
      </div>
    </div>
    <div className="absolute h-full w-full col justify-center items-center">
      <div className="text-lg">
        <T id="notFound" />
      </div>
    </div>
  </>
);
