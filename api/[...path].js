// Deprecated catch-all handler. Individual routes under api/ handle all requests.
module.exports = (req, res) => {
  res.status(404).json({ ok: false, message: "Endpoint not found." });
};