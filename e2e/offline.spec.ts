import { expect, test } from "@playwright/test";

test("the panel opens offline, in the project font", async ({ page }) => {
  const external: string[] = [];
  const problems: string[] = [];
  page.on("pageerror", (error) => problems.push(error.message));
  page.on("console", (msg) => {
    if (msg.type() === "error") problems.push(msg.text());
  });
  await page.route("**/*", (route) => {
    const url = route.request().url();
    if (url.startsWith("http://127.0.0.1:3000") || url.startsWith("http://localhost:3000")) {
      return route.continue();
    }
    external.push(url);
    return route.abort();
  });

  await page.goto("/");
  await expect(page.getByText("64.50%").first()).toBeVisible();
  await expect(page.getByText("Year-end projection as of each quarter")).toBeVisible();
  await expect(page.getByText("Actual")).toHaveCount(0);
  await expect(page.getByText("2025 (IES)")).toHaveCount(0);
  await page.getByRole("button", { name: "Verify" }).first().click();
  await expect(page.getByText("Conservative reading: partial steps count.")).toBeVisible();

  const font = await page.evaluate(() => getComputedStyle(document.body).fontFamily);
  expect(font.toLowerCase()).toContain("inter");
  expect(external).toEqual([]);
  expect(problems).toEqual([]);
});
