import express from "express";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.post("/send-email", (req, res) => {
    const { to, subject, message } = req.body;

    // Placeholder logic for sending email
    console.log(
        `Sending email to: ${to}, Subject: ${subject}, Message: ${message}`
    );
    res.json({ status: "Email sent successfully" });
});

app.listen(PORT, () => {
    console.log(`Notification service running on port ${PORT}`);
});
