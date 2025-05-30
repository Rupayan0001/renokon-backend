import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: "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",
});

const completion = openai.chat.completions.create({
  model: "gpt-4o-mini",
  store: true,
  messages: [{ role: "user", content: "write a haiku about ai" }],
});

completion.then((result) => console.log(result.choices[0].message));
