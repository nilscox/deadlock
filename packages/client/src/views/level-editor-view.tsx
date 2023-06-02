import { Level, LevelDefinition, solve } from '@deadlock/game';
import { useMutation } from '@tanstack/react-query';
import { useMemo } from 'react';

import { api } from '~/api';
import { ArrowLeft, ArrowRight } from '~/components/arrows';
import { Link } from '~/components/link';
import { Translate } from '~/components/translate';
import { toSearchParams, useSearchParam } from '~/hooks/use-search-params';
import { LevelEditor } from '~/level-editor/level-editor';
import { MobileNavigation, MobileView } from '~/mobile-view';

const T = Translate.prefix('views.levelEditor');

const defaultDefinition: LevelDefinition = {
  width: 4,
  height: 3,
  blocks: [],
  start: { x: 0, y: 0 },
  teleports: [],
};

export const LevelEditorView = () => {
  const [levelId] = useSearchParam('levelId');
  const [definitionParam, setDefinitionParam] = useSearchParam('definition');

  const definition = useMemo<LevelDefinition>(
    () => (definitionParam ? (JSON.parse(definitionParam) as LevelDefinition) : defaultDefinition),
    [definitionParam]
  );

  const setDefinition = (definition: LevelDefinition) => {
    setDefinitionParam(JSON.stringify(definition));
  };

  const { mutate: onSave } = useMutation({
    mutationKey: [definition, levelId],
    mutationFn: async () => {
      if (levelId) {
        await api.patch(`/level/${levelId}`, { definition });
      } else {
        await api.post('/level', { definition });
      }
    },
  });

  const solutions = useMemo(() => {
    return solve(new Level(definition), 500);
  }, [definition]);

  return (
    <MobileView
      header={
        <MobileNavigation
          left={
            <Link href="/lab" className="row items-center gap-2">
              <ArrowLeft />
              <Translate id="navigation.lab" />
            </Link>
          }
          center={
            <button className="mx-auto" onClick={() => onSave()}>
              <T id="save" />
            </button>
          }
          right={
            <Link
              href={`/test?${toSearchParams({ levelId, definition: definitionParam })}`}
              className="row items-center gap-2"
            >
              <T id="test" />
              <ArrowRight />
            </Link>
          }
        />
      }
      footer={
        <div>
          <T
            id="solutionsCount"
            values={{ count: solutions === undefined ? <T id="moreThan500" /> : solutions.length }}
          />
        </div>
      }
    >
      <LevelEditor definition={definition} onChange={setDefinition} />
    </MobileView>
  );
};
