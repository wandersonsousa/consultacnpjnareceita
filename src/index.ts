import express from "express";
import path from "path";
import bodyParser from "body-parser";
import ConsultarCnpj from "./services/ConsultarCnpj";
import $ from "cheerio";

const PORT = process.env.PORT || 5000;
const app = express();
app.use(express.static(path.join(__dirname, "../public")));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.set("views", path.join(__dirname, "../views"));
app.set("view engine", "ejs");

app.get("/", (req, res) => res.render("pages/index"));

app.get("/consult", async (req, res) => {
  if (!req.query.cnpj) {
    return res.status(500).json({
      success: false,
      errors: [
        {
          code: 400,
          message: "Missing cnpj field",
        },
      ],
    });
  }
  const cnpjResult = await ConsultarCnpj(String(req.query.cnpj));
  const cnpj_certificate = $(cnpjResult).find("#principal").html();
  console.log(cnpj_certificate);
  res.render("pages/result", { cnpj_certificate });
});

app.listen(PORT, () => console.log("Listening on port " + PORT));
