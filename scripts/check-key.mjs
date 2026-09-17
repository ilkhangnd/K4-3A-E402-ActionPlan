const configured = Boolean(process.env.OPENAI_API_KEY);
console.log(configured
  ? "OPENAI_API_KEY: configured (key value is intentionally not displayed)"
  : "OPENAI_API_KEY: missing. Set it in your shell or a non-committed .env loader before running the API.");
process.exitCode = configured ? 0 : 1;
