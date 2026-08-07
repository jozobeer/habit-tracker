// L1 永続化検証シナリオ。kojo の persistGate が chromium 上で実行する:
//   1. scenario(page) — アプリを操作し、localStorage に保存されるべき状態を作る
//   2. （kojo 側が page.reload() する）
//   3. verify(page) — リロード後の復元状態を検証する。不一致なら throw すること
// page は Playwright の Page。セレクタはこのアプリの実装に合わせて書き換える。

export async function scenario(page) {
  await page.locator("#habit-input").fill("運動");
  await page.locator("#add-btn").click();
  await page.locator(".habit-item input[type=checkbox]").check();
}

export async function verify(page) {
  const name = page.locator(".habit-item .habit-name");
  const checkbox = page.locator(".habit-item input[type=checkbox]");
  if ((await name.count()) !== 1) {
    throw new Error("習慣が一覧に復元されていません");
  }
  const text = await name.textContent();
  if (text !== "運動") {
    throw new Error(`習慣名が復元されていません: ${text}`);
  }
  if (!(await checkbox.isChecked())) {
    throw new Error("チェック状態が復元されていません");
  }
}
