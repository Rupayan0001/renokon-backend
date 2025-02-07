import { Client } from "@elastic/elasticsearch";

const esClient = new Client({ node: "http://localhost:9200" });

export const indexProduct = async (product) => {
  await esClient.index({
    index: "products",
    id: product._id.toString(),
    body: {
      name: product.name,
      description: product.description,
      category: product.category,
      price: product.price,
      stock: product.stock,
    },
  });
};

export const searchProducts = async (query) => {
  const { body } = await esClient.search({
    index: "products",
    body: {
      query: {
        multi_match: {
          query,
          fields: ["name", "description"],
        },
      },
    },
  });

  return body.hits.hits.map((hit) => hit._source);
};

import { SpeechClient } from "@google-cloud/speech";

const speechClient = new SpeechClient();

export const voiceSearch = async (req, res) => {
  try {
    const audioBuffer = req.file.buffer;
    const [response] = await speechClient.recognize({
      audio: { content: audioBuffer.toString("base64") },
      config: { encoding: "LINEAR16", sampleRateHertz: 16000, languageCode: "en-US" },
    });

    const searchText = response.results[0].alternatives[0].transcript;
    res.status(200).json({ searchText });
  } catch (error) {
    res.status(500).json({ error: "Voice search failed" });
  }
};
