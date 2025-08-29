const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// === Put YOUR details here or via Render env vars ===
const FULL_NAME = (process.env.FULL_NAME || "somesh rathore").trim().toLowerCase(); // full name in lowercase
const DOB_DDMMYYYY = process.env.DOB_DDMMYYYY || "27092004"; // ddmmyyyy
const EMAIL = process.env.EMAIL || "someshrathore27@gmail.com";
const ROLL_NUMBER = process.env.ROLL_NUMBER || "22BCE11193";

// Helpers
const userId = () =>
  `${FULL_NAME.replace(/\s+/g, "_")}_${DOB_DDMMYYYY}`;

function processData(input) {
  const odd_numbers = [];
  const even_numbers = [];
  const alphabets = [];
  const special_characters = [];
  let sum = 0n;

  // Collect ALL alphabetical characters (from any token) for concat rule
  const allLetters = [];

  for (let raw of input) {
    const item = String(raw);

    const isInt = /^[+-]?\d+$/.test(item);
    const isAlphaOnly = /^[A-Za-z]+$/.test(item);
    const isSpecialOnly = /^[^A-Za-z0-9]+$/.test(item);

    if (isInt) {
      const n = BigInt(item);
      sum += n;
      (n % 2n === 0n ? even_numbers : odd_numbers).push(item); // keep as strings
    } else if (isAlphaOnly) {
      alphabets.push(item.toUpperCase());
      allLetters.push(...item); // collect letters for concat rule
    } else if (isSpecialOnly) {
      // push each special character separately
      for (const ch of item) special_characters.push(ch);
    } else {
      // Mixed token: extract letters & specials for concat/specials
      const letters = item.match(/[A-Za-z]/g) || [];
      const specials = item.match(/[^A-Za-z0-9]/g) || [];
      allLetters.push(...letters);
      special_characters.push(...specials);
      // Do NOT treat mixed tokens as alphabets or numbers arrays
    }
  }

  // Build concat_string: reverse all letters and apply alternating caps starting Upper
  const concat_string = allLetters
    .reverse()
    .map((ch, idx) => (idx % 2 === 0 ? ch.toUpperCase() : ch.toLowerCase()))
    .join("");

  return {
    odd_numbers,
    even_numbers,
    alphabets,
    special_characters,
    sum: sum.toString(), // must be string
    concat_string,
  };
}

// POST /bfhl
app.post("/bfhl", (req, res) => {
  try {
    const data = req.body?.data;
    if (!Array.isArray(data)) {
      return res.status(400).json({
        is_success: false,
        user_id: userId(),
        email: EMAIL,
        roll_number: ROLL_NUMBER,
        error: 'Invalid payload. Provide: { "data": [ ... ] }',
      });
    }

    const result = processData(data);
    return res.status(200).json({
      is_success: true,
      user_id: userId(),
      email: EMAIL,
      roll_number: ROLL_NUMBER,
      ...result,
    });
  } catch (err) {
    return res.status(500).json({
      is_success: false,
      user_id: userId(),
      email: EMAIL,
      roll_number: ROLL_NUMBER,
      error: "Internal server error",
    });
  }
});

app.get("/", (req, res) => {
  res.status(200).json({
    status: "API is running",
    message: "Use POST /bfhl to access the main endpoint"
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
