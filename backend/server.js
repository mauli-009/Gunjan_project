const express = require("express");
const cors = require("cors");
const { exec } = require("child_process");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// List all processes
app.get("/processes", (req, res) => {
  exec('wmic process get ProcessId,Name,CommandLine /FORMAT:CSV', (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({ error: stderr });
    }

    const lines = stdout.trim().split("\n").slice(1); // skip header
    const processes = lines.map(line => {
      const parts = line.split(",");
      const name = parts[1];
      const commandLine = parts[2];
      const pid = parts[3];

      return {
        pid,
        command: name,
        arguments: commandLine,
        cpu: "N/A",
        memory: "N/A",
      };
    }).filter(p => p.pid); // remove blank rows

    res.json(processes);
  });
});

// Kill a process
app.post("/terminate/:pid", (req, res) => {
  const pid = req.params.pid;
  exec(`taskkill /PID ${pid} /F`, (err, stdout, stderr) => {
    if (err) {
      return res.status(500).json({ error: stderr || err.message });
    }
    res.json({ message: `Process ${pid} terminated.` });
  });
});

app.listen(PORT, () => {
  console.log(`Backend server running at http://localhost:${PORT}`);
});
