import { test, expect } from "@playwright/test";
import { pathToFileURL } from "node:url";

// 静的アプリなのでサーバ不要。kojo の visualGate と同じ file:// 方式で開く
const APP_URL = pathToFileURL("public/index.html").href;

test("ページがロードできページエラーが出ない", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (err) => errors.push(String(err)));
  await page.goto(APP_URL);
  await expect(page.locator("body")).toBeVisible();
  expect(errors).toEqual([]);
});

// このスモークは削除しないこと。機能テストは PLAN.md の受け入れ条件ごとに追記する

test("習慣名を入力して追加すると一覧に表示される", async ({ page }) => {
  await page.goto(APP_URL);
  await page.locator("#habit-input").fill("運動");
  await page.locator("#add-btn").click();
  await expect(page.locator(".habit-item .habit-name")).toHaveText("運動");

  await page.locator("#habit-input").fill("読書");
  await page.locator("#habit-input").press("Enter");
  await expect(page.locator(".habit-item .habit-name")).toHaveText(["運動", "読書"]);
});

test("チェックボックスで今日実行済みを記録できる", async ({ page }) => {
  await page.goto(APP_URL);
  await page.locator("#habit-input").fill("水分補給");
  await page.locator("#add-btn").click();

  const checkbox = page.locator(".habit-item input[type=checkbox]");
  await expect(checkbox).not.toBeChecked();
  await checkbox.check();
  await expect(checkbox).toBeChecked();
});

test("リロード後も習慣一覧と当日のチェック状態が復元される", async ({ page }) => {
  await page.goto(APP_URL);
  await page.locator("#habit-input").fill("瞑想");
  await page.locator("#add-btn").click();
  await page.locator(".habit-item input[type=checkbox]").check();

  await page.reload();

  await expect(page.locator(".habit-item .habit-name")).toHaveText("瞑想");
  await expect(page.locator(".habit-item input[type=checkbox]")).toBeChecked();
});

test("削除すると一覧とlocalStorageから消えリロード後も復活しない", async ({ page }) => {
  await page.goto(APP_URL);
  await page.locator("#habit-input").fill("ストレッチ");
  await page.locator("#add-btn").click();
  await page.locator(".habit-item input[type=checkbox]").check();
  await page.locator(".habit-item .delete-btn").click();

  await expect(page.locator(".habit-item")).toHaveCount(0);

  const stored = await page.evaluate(() => localStorage.getItem("habit-tracker:v1"));
  const parsed = JSON.parse(stored!);
  expect(parsed.habits).toEqual([]);
  expect(Object.values(parsed.checks).flat()).toEqual([]);

  await page.reload();
  await expect(page.locator(".habit-item")).toHaveCount(0);
});

test("空文字・空白のみでは習慣が追加されない", async ({ page }) => {
  await page.goto(APP_URL);
  await page.locator("#add-btn").click();
  await expect(page.locator(".habit-item")).toHaveCount(0);

  await page.locator("#habit-input").fill("   ");
  await page.locator("#add-btn").click();
  await expect(page.locator(".habit-item")).toHaveCount(0);
});

test("習慣が0件のとき空状態メッセージが表示される", async ({ page }) => {
  await page.goto(APP_URL);
  await expect(page.locator("#empty-state")).toBeVisible();
  await expect(page.locator("#empty-state")).toContainText("習慣を追加して始めましょう");

  await page.locator("#habit-input").fill("散歩");
  await page.locator("#add-btn").click();
  await expect(page.locator("#empty-state")).toBeHidden();
});

test("日付が変わると当日チェックは未チェックになり前日記録は残る", async ({ page }) => {
  await page.clock.install({ time: new Date("2026-08-08T12:00:00") });
  await page.goto(APP_URL);

  await page.locator("#habit-input").fill("日記");
  await page.locator("#add-btn").click();
  await page.locator(".habit-item input[type=checkbox]").check();
  await expect(page.locator(".habit-item input[type=checkbox]")).toBeChecked();

  await page.clock.setFixedTime(new Date("2026-08-09T12:00:00"));
  await page.reload();

  await expect(page.locator(".habit-item .habit-name")).toHaveText("日記");
  await expect(page.locator(".habit-item input[type=checkbox]")).not.toBeChecked();

  const stored = await page.evaluate(() => localStorage.getItem("habit-tracker:v1"));
  const parsed = JSON.parse(stored!);
  expect(parsed.checks["2026-08-08"]).toHaveLength(1);
  expect(parsed.checks["2026-08-09"] ?? []).toEqual([]);
});

test("直近7日の履歴ドットと連続実行日数が表示される", async ({ page }) => {
  await page.addInitScript(() => {
    const pad = (n: number) => String(n).padStart(2, "0");
    const keyOf = (d: Date) =>
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const daysAgo = (n: number) => {
      const d = new Date();
      d.setHours(12, 0, 0, 0);
      d.setDate(d.getDate() - n);
      return keyOf(d);
    };
    localStorage.setItem(
      "habit-tracker:v1",
      JSON.stringify({
        habits: [{ id: "h_seed", name: "運動" }],
        checks: {
          [daysAgo(5)]: ["h_seed"],
          [daysAgo(2)]: ["h_seed"],
          [daysAgo(1)]: ["h_seed"],
          [daysAgo(0)]: ["h_seed"],
        },
      }),
    );
  });

  await page.goto(APP_URL);

  const dots = page.locator(".habit-item .history-dots .dot");
  await expect(dots).toHaveCount(7);

  // 古い日→今日: daysAgo(6)..(0) → filled on 5,2,1,0
  const filled = await dots.evaluateAll((els) =>
    els.map((el) => el.classList.contains("done")),
  );
  expect(filled).toEqual([false, true, false, false, true, true, true]);

  await expect(page.locator(".habit-item .streak-badge")).toContainText("3日連続");
});
