const express = require("express");
const cors = require("cors");
require("dotenv").config();

const nflRoutes = require("./routes/nflRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", nflRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`NFL backend running on http://localhost:${PORT}`);
});