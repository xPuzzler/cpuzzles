export default async function handler(req, res) {
    const { url } = req.query;
  
    if (!url) {
      return res.status(400).json({ error: "Image URL is required" });
    }
  
    try {
      const response = await fetch(decodeURIComponent(url));
      const buffer = await response.arrayBuffer();
  
      res.setHeader("Content-Type", response.headers.get("Content-Type"));
      res.setHeader("Cache-Control", "s-maxage=31536000, stale-while-revalidate");
  
      res.status(200).send(Buffer.from(buffer));
    } catch (error) {
      console.error("Error proxying image:", error);
      res.status(500).json({ error: "Failed to load image" });
    }
  }