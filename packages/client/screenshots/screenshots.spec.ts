import { Page, test } from '@playwright/test';

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const screens = {
  desktop: [1920, 1080],
  mobile: [378, 612],
};

const locales = ['en', 'fr'];

const screenshot = async (page: Page, name: string) => {
  await wait(200);

  for (const locale of locales) {
    await page.evaluate((locale) => (window as any).setLocale(locale), locale);

    for (const [screen, size] of Object.entries(screens)) {
      const [width, height] = size;
      await page.setViewportSize({ width, height });
      await page.screenshot({ path: `${process.env.OUT_DIR}/screenshots/${locale}/${screen}-${name}.png` });
    }
  }
};

test.beforeEach(({ page }) => {
  page.emulateMedia({ colorScheme: 'light' });
});

test('home page', async ({ page }) => {
  await page.goto('http://localhost:8000');
  await wait(2000);
  await screenshot(page, 'home');
});

test('levels-list', async ({ page }) => {
  await page.goto('http://localhost:8000');

  const completed = [
    'n42pb7',
    'g388nf',
    'yad1uy',
    'qb0e1t',
    'yl94jf',
    'k4wto6',
    'jfz55a',
    'p85mu3',
    'hrbgjq',
    'vroqj9',
    'ceq7ue',
    '59ljan',
    '4hb9hp',
    'z9f3j9',
    'evs272',
    '05xuxt2r',
    'ewt4e7',
    'ckdy7w',
    'r7w6en',
    't0vny1',
    'mmiqvnld',
  ];

  await page.evaluate(
    (levels) => {
      localStorage.setItem('levels', JSON.stringify(levels));
    },
    completed.reduce((obj, id) => ({ ...obj, [id]: { completed: true } }), {})
  );

  await page.goto('http://localhost:8000/levels');
  await screenshot(page, 'levels-list');
});

test('level', async ({ page }) => {
  await page.goto('http://localhost:8000/level/tp04nf');
  await screenshot(page, 'level');
});

test('level-dark', async ({ page }) => {
  await page.goto('http://localhost:8000');

  await page.evaluate(() => {
    localStorage.setItem('theme', 'dark');
  });

  await page.goto('http://localhost:8000/level/tp04nf');
  await screenshot(page, 'level-dark');
});

test('completed level', async ({ page }) => {
  await page.goto('http://localhost:8000/level/mmiqvnld');
  await wait(200);

  const keys = [
    'ArrowUp',
    'ArrowRight',
    'ArrowUp',
    'ArrowDown',
    'ArrowLeft',
    'ArrowLeft',
    'ArrowLeft',
    'ArrowUp',
    'ArrowRight',
    'ArrowUp',
    'ArrowRight',
  ];

  for (const key of keys) {
    page.keyboard.press(key);
  }

  await screenshot(page, 'completed-level');
});

test('level-editor', async ({ page }) => {
  const definition = JSON.stringify({
    width: 4,
    height: 4,
    blocks: [
      { x: 1, y: 0 },
      { x: 3, y: 0 },
      { x: 3, y: 2 },
      { x: 3, y: 3 },
    ],
    start: { x: 0, y: 1 },
    teleports: [],
  });

  await page.goto(`http://localhost:8000/level-editor?${new URLSearchParams({ definition })}`);
  await screenshot(page, 'level-editor');
});
