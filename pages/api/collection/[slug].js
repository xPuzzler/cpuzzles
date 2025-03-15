export default async function handler(req, res) {
  const { slug } = req.query;

  try {
    const response = await fetch(
      `https://api.opensea.io/api/v2/collections/${slug}`,
      {
        headers: {
          'X-API-KEY': process.env.NEXT_PUBLIC_OPENSEA_API_KEY,
          'accept': 'application/json'
        }
      }
    );

    if (!response.ok) {
      console.error(`OpenSea API error: ${response.status} ${response.statusText}`);
      return res.status(response.status).json({ error: `OpenSea API error: ${response.statusText}` });
    }

    const data = await response.json();

    // Extract the necessary data from the v2 API response
    const collectionData = {
      name: data.collection.name,
      slug: data.collection.slug,
      image_url: data.collection.image_url,
      description: data.collection.description
    };

    res.status(200).json(collectionData);
  } catch (error) {
    console.error("Failed to fetch collection data:", error);
    res.status(500).json({ error: "Failed to fetch collection data" });
  }
}