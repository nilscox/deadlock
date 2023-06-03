import { FormattedMessage, useIntl } from 'react-intl';

import translations from '../../lang/en.json';

type Translations = typeof translations;

type Paths<T, Prefix extends string = ''> = T extends string
  ? Prefix
  : {
      [Key in keyof T]: Key extends string
        ? Prefix extends ''
          ? Paths<T[Key], Key>
          : Prefix | Paths<T[Key], `${Prefix}.${Key}`>
        : never;
    }[keyof T];

type Leaves<T, Prefix extends string = ''> = T extends string
  ? Prefix
  : {
      [Key in keyof T]: Key extends string
        ? Prefix extends ''
          ? Leaves<T[Key], Key>
          : Leaves<T[Key], `${Prefix}.${Key}`>
        : never;
    }[keyof T];

type RemovePrefix<T extends string, P extends string> = T extends `${P}${infer R}` ? R : never;

type TProps<Keys extends string> = {
  id: Keys;
  values?: Record<string, React.ReactNode>;
};

export const Translate = ({ id, values }: TProps<Leaves<Translations>>) => {
  return <FormattedMessage id={id} values={values} />;
};

interface TranslateFunction<Keys> {
  (id: Keys): string;
  (id: Keys, values: Record<string, React.ReactNode>): React.ReactNode;
}

// eslint-disable-next-line react-refresh/only-export-components
export const useTranslation = () => {
  const intl = useIntl();

  const translate = (id: Leaves<Translations>, values?: Record<string, React.ReactNode>) => {
    return intl.formatMessage({ id }, values);
  };

  return translate as TranslateFunction<Leaves<Translations>>;
};

Translate.prefix = <Prefix extends Paths<Translations>>(prefix?: Prefix) => {
  const getId = (id: string) => {
    return `${prefix ? prefix + '.' : ''}${id}` as Leaves<Translations>;
  };

  type Props = TProps<RemovePrefix<Leaves<Translations>, `${Prefix}.`>>;

  const T = ({ id, values }: Props) => {
    return <Translate id={getId(id)} values={values} />;
  };

  T.useTranslation = () => {
    const t = useTranslation();

    const translate = (id: Props['id'], values: Record<string, React.ReactNode>) => {
      return t(getId(id), values);
    };

    return translate as TranslateFunction<Props['id']>;
  };

  return T;
};
