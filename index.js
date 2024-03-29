const express = require("express");
const app = express();
const PORT = process.env.PORT || 3001;

const fs = require("fs");
const path = require("path");
const pathToFile = path.resolve("./data.json");

// This is aplicable let say we make use of useEffect in out frontend app fetchng from localhost:3000.
// const cors = require("cors");
// var corsOption = {
//   origin: "http://localhost:3000",
//   optionsSuccessStatus: 200,
// };

// app.use(cors(corsOption));

const getResources = () => JSON.parse(fs.readFileSync(pathToFile));

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello, I am with you");
});

app.get("/api/resources/:id", (req, res) => {
  const resources = getResources();
  const { id } = req.params;

  const resource = resources.find((resource) => resource.id === id);
  res.send(resource);
});

app.patch("/api/resources/:id", (req, res) => {
  const resources = getResources();
  const { id } = req.params;
  const index = resources.findIndex((resource) => resource.id === id);

  const activeResource = resources.find(
    (resource) => resource.status === "active"
  );

  if (resources[index].status === "complete") {
    res.status(422).send("Cannot update because resource has been completed");
  }

  resources[index] = req.body;

  // related functionality
  if (req.body.status === "active") {
    if (activeResource) {
      return res.status(422).send("There is active resource already!");
    }

    resources[index].status = "active";
    resources[index].activeResource = new Date();
  }

  fs.writeFile(pathToFile, JSON.stringify(resources, null, 2), (error) => {
    if (error) {
      return res.status(422).send("Cannot store data in the file");
    }
    return res.send("Data has been updated successfully");
  });
});

app.get("/api/activeresource", (req, res) => {
  const resources = getResources();
  const activeResource = resources.find(
    (resource) => resource.status === "active"
  );
  res.send(activeResource);
});

app.get("/api/resources", (req, res) => {
  const resources = getResources();
  res.send(resources);
});

app.post("/api/resources", (req, res) => {
  const resources = getResources();
  const resource = req.body;

  resource.createdAt = new Date();
  resource.status = "inactive";
  resource.id = Date.now().toString();

  resources.unshift(resource);

  fs.writeFile(pathToFile, JSON.stringify(resources, null, 2), (error) => {
    if (error) {
      return res.status(422).send("Cannot store data in the File base");
    }
    return res.send("Data has been saved successfully");
  });
});

app.listen(PORT, () => {
  console.log("Server is running on port:" + PORT);
});
