const express = require('express');
const app = express();
const PORT = process.env.PORT || 4000;
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const router = require('./routes');
app.use(router);
app.use(errorHandler)

app.listen(PORT, () => { console.log(`Listening on port ${PORT}`); });
