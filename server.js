const express = require("express");
const cors = require("cors");
const fs = require("fs").promises;
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Data file path
const dataPath = path.join(__dirname, "data.json");

// Read data from JSON file
async function readData() {
  try {
    const data = await fs.readFile(dataPath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

// Write data to JSON file
async function writeData(data) {
  await fs.writeFile(dataPath, JSON.stringify(data, null, 2));
}

// GET all items
app.get("/api/items", async (req, res) => {
  try {
    const data = await readData();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Error reading data" });
  }
});

// GET single item by ID
app.get("/api/items/:id", async (req, res) => {
  try {
    const data = await readData();
    const item = data.find((item) => item.id === parseInt(req.params.id));
    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: "Error reading data" });
  }
});

// POST new item
app.post("/api/items", async (req, res) => {
  try {
    const data = await readData();
    const newItem = {
      id: Date.now(),
      ...req.body,
    };
    data.push(newItem);
    await writeData(data);
    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ error: "Error creating item" });
  }
});

// PUT update item
app.put("/api/items/:id", async (req, res) => {
  try {
    const data = await readData();
    const index = data.findIndex((item) => item.id === parseInt(req.params.id));
    if (index === -1) {
      return res.status(404).json({ error: "Item not found" });
    }
    data[index] = { ...data[index], ...req.body };
    await writeData(data);
    res.json(data[index]);
  } catch (error) {
    res.status(500).json({ error: "Error updating item" });
  }
});

// DELETE item
app.delete("/api/items/:id", async (req, res) => {
  try {
    const data = await readData();
    const filteredData = data.filter(
      (item) => item.id !== parseInt(req.params.id)
    );
    await writeData(filteredData);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Error deleting item" });
  }
});

// Modified export for Vercel
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

// Export the Express API
module.exports = app;
