import express from "express";
import * as fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import https from "https";
import http from "http";
//import oracleDBManager from "./OracleDBManager.js";
import next from "next";
//import config from "./config/config.js";
import { v4 as uuidv4 } from "uuid";
import compression from "compression";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const appNxt = next({ dev: process.env.NODE_ENV !== "prod" });
const handle = appNxt.getRequestHandler();

export default class Server {
  constructor({ httpPort, httpsPort, httpsOptions = {}, hostname }) {
    this.app = express();
    this.app.use(express.json());
    this.app.use(compression());
    this.httpPort = httpPort;
    this.httpsPort = httpsPort;
    this.httpsOptions = httpsOptions;
    this.hostname = hostname;
  }

//   async connectOracleDatabase() {
//     await oracleDBManager.connect("TEST10", true);
//   }

  configure() {
    this.app.get("/", (req, res) => {
      res.send("Technology schemes server");
    });
  }

  startHttpServer() {
    const httpServer = http.createServer(this.app);
    httpServer.listen(this.httpPort, this.hostname, () => {
      console.log(`HTTP Server is running http://${this.hostname}:${this.httpPort}`);
    });
    return httpServer;
  }

  startHttpsServer() {
    if (!this.httpsOptions.key || !this.httpsOptions.cert) {
      throw new Error("HTTPS key and cert are required for HTTPS server");
    }

    const httpsServer = https.createServer(this.httpsOptions, this.app);
    httpsServer.listen(this.httpsPort, this.hostname, () => {
      console.log(`HTTPS Server is running on https://${this.hostname}:${this.httpsPort}`);
    });
    return httpsServer;
  }

  async start() {
    const httpServ = this.startHttpServer();
    // Uncomment the line below to start the HTTPS server
    // this.startHttpsServer();
    //await this.connectOracleDatabase();
    return httpServ;
  }
}

appNxt.prepare().then(() => {
  const httpsOptions = {}; // config.getSslOptions();
  const httpPortConfig = '3000';
  const httpsPortConfig = '4000';
  const serverHost = '10.0.0.160';

  const server = new Server({
    httpPort: httpPortConfig,
    httpsPort: httpsPortConfig,
    httpsOptions,
    hostname: serverHost,
  });

  let httpServer = server.start();

  server.app.get("/api/schemeslist", (req, res) => {
    handlerReadSchemeFolder(req, res);
  });

  server.app.delete("/api/deletescheme/:id", (req, res) => {
    handlerDeleteScheme(req, res);
  });

  server.app.put("/api/updatescheme/:id", (req, res) => {
    handlerUpdateScheme(req, res);
  });

  server.app.post("/api/savescheme", (req, res) => {
    const uniqueId = req.body.scheme_id || uuidv4();
    const schemeState = req.body;
    const filename = `scheme_${uniqueId}.json`;
    const filepath = path.join(__dirname, "src/app/scheme_src", filename);

    fs.writeFile(filepath, JSON.stringify(schemeState, null, 2), (err) => {
      if (err) {
        console.error("Error writing file", err);
        return res.status(500).send("Error saving data");
      }
      res.json({ message: "File saved successfully", id: uniqueId });
    });
  });

  server.app.get("/api/schemes/:id", (req, res) => {
    const { id } = req.params;
    const folderPath = path.join(__dirname, "src/app/scheme_src");

    try {
      const files = fs.readdirSync(folderPath);
      const file = files.find((file) => file.includes(`scheme_${id}`) && file.endsWith(".json"));
      if (!file) {
        res.status(404).json({ error: "Scheme not found." });
        return;
      }

      const filePath = path.join(folderPath, file);
      const fileContent = fs.readFileSync(filePath, "utf-8");
      const scheme = JSON.parse(fileContent);
      res.status(200).json(scheme);
    } catch (error) {
      console.error("Error loading scheme:", error);
      res.status(500).json({ error: "Failed to load scheme." });
    }
  });

  server.app.all("*", (req, res) => {
    return handle(req, res);
  });
});

async function handlerReadSchemeFolder(req, res) {
  try {
    const folderPath = path.join(__dirname, "src/app/scheme_src");
    const files = fs.readdirSync(folderPath);
    const schemes = files
      .filter((file) => file.endsWith(".json"))
      .map((file) => {
        const filePath = path.join(folderPath, file);
        const fileContent = fs.readFileSync(filePath, "utf-8");
        return JSON.parse(fileContent);
      });

    res.status(200).json({ success: true, data: schemes });
  } catch (error) {
    console.error("Error reading schemes:", error);
    res.status(500).json({ success: false, error: "Failed to load schemes." });
  }
}

function handlerDeleteScheme(req, res) {
  const scheme_id = req.params.id;
  const filePath = path.join(__dirname, "src/app/scheme_src", `scheme_${scheme_id}.json`);

  if (req.method === "DELETE") {
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        res.status(200).json({ success: true, message: "Scheme deleted successfully." });
      } catch (error) {
        console.error("Error deleting scheme:", error);
        res.status(500).json({ success: false, error: "Failed to delete scheme." });
      }
    } else {
      res.status(404).json({ success: false, error: "Scheme not found." });
    }
  } else {
    res.setHeader("Allow", ["DELETE"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

function handlerUpdateScheme(req, res) {
  const scheme_id = req.params.id;
  const filePath = path.join(__dirname, "src/app/scheme_src", `scheme_${scheme_id}.json`);

  if (req.method === "PUT") {
    try {
      const updatedScheme = req.body;
      if (!fs.existsSync(filePath)) {
        res.status(404).json({ error: "Scheme file not found." });
        return;
      }
      fs.writeFileSync(filePath, JSON.stringify(updatedScheme, null, 2), "utf-8");
      res.status(200).json({ success: true, message: "Scheme updated successfully." });
    } catch (error) {
      console.error("Error updating scheme:", error);
      res.status(500).json({ error: "Failed to update scheme." });
    }
  } else {
    res.setHeader("Allow", ["PUT"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}