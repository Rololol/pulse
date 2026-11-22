import { ingestConfiguredFeeds } from "../lib/news-ingestion";

ingestConfiguredFeeds()
  .then((result) => {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    process.exitCode = result.errors.length ? 1 : 0;
  })
  .catch((error) => {
    process.stderr.write(`${error instanceof Error ? error.message : "Ingestion failed"}\n`);
    process.exitCode = 1;
  });