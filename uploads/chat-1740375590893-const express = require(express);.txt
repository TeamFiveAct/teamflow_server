const express = require("express");
const router = express.Router();
const { connection } = require("./db");
const {
  crawlCUProducts,
  fetchDosirakData,
  fetchGS25Data,
} = require("./crawlers");

// 제품 데이터 저장할 배열
let productsData = [];
// 이미 전송된 제품 ID를 저장할 배열
let sentProductIds = [];
// DB에서 가져온 제품 정보를 저장할 배열
let dbProducts = [];

// 크롤링 및 렌더링 엔드포인트
router.get("/crawl", async (req, res) => {
  try {
    console.log("크롤링 작업 시작...");

    const [cuProducts, sevenElevenProducts, gs25Products] = await Promise.all([
      crawlCUProducts(),
      fetchDosirakData(),
      fetchGS25Data(),
    ]);

    // DB에서 제품 정보 가져오기 (SELECT * 사용)
    connection.query(`SELECT * FROM products`, (err, results) => {
      if (err) {
        console.error("DB에서 제품 정보 조회 오류:", err);
        return res.status(500).json({
          error: "DB에서 제품 정보를 불러오는 데 실패했습니다.",
        });
      }

      dbProducts = results.map((row) => ({
        id: row.id,
        name: row.name,
        price: row.price,
        imageUrl: row.imageUrl,
        convini: row.convini,
        tags: JSON.parse(row.tags),
        created_at: row.created_at,
      }));

      productsData = [
        ...cuProducts,
        ...sevenElevenProducts,
        ...gs25Products,
      ].map((product, index) => {
        const dbProduct = dbProducts.find(
          (p) => p.name === product.name && p.price === product.price
        );

        if (dbProduct) {
          return {
            id: dbProduct.id,
            ...product,
            tags: dbProduct.tags,
            sent: true,
            isDuplicate: true,
          };
        } else {
          return {
            id: index + 1,
            ...product,
            tags: [],
            sent: false,
            isDuplicate: false,
          };
        }
      });

      sentProductIds = dbProducts.map((product) => product.id);

      console.log(`\n총 수집된 제품 수: ${productsData.length}`);
      res.render("index", { products: productsData });
    });
  } catch (error) {
    console.error("크롤링 작업 중 오류 발생:", error);
    res.status(500).json({ error: "크롤링 작업 중 오류가 발생했습니다." });
  }
});

// 태그 업데이트 API
router.put("/products/:productId/tags", (req, res) => {
  const productId = parseInt(req.params.productId);
  const { tags } = req.body;

  const sql = "UPDATE products SET tags = ? WHERE id = ?";
  const values = [JSON.stringify(tags), productId];

  connection.query(sql, values, (err, results) => {
    if (err) {
      console.error("DB 태그 업데이트 오류:", err);
      return res.status(500).json({
        success: false,
        error: "태그 업데이트 중 오류가 발생했습니다.",
      });
    }

    if (results.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, error: "해당 ID의 제품을 찾을 수 없습니다." });
    }

    console.log("DB 태그 업데이트 성공:", results);
    res.json({ success: true });
  });
});

// DB 전송 API
router.post("/products/:productId/send-db", (req, res) => {
  const productId = parseInt(req.params.productId);
  const product = req.body;

  if (!product) {
    return res
      .status(400)
      .json({ success: false, error: "제품 정보를 찾을 수 없습니다." });
  }

  const findSql = "SELECT * FROM products WHERE id = ?";
  connection.query(findSql, [productId], (findErr, findResults) => {
    if (findErr) {
      console.error("DB 조회 오류:", findErr);
      return res
        .status(500)
        .json({ success: false, error: "DB 조회 중 오류가 발생했습니다." });
    }

    if (findResults.length > 0) {
      const updateSql =
        "UPDATE products SET name = ?, price = ?, imageUrl = ?, convini = ?, tags = ? WHERE id = ?";
      const updateValues = [
        product.name,
        product.price,
        product.imageUrl,
        product.convini,
        JSON.stringify(product.tags),
        productId,
      ];

      connection.query(updateSql, updateValues, (updateErr, updateResults) => {
        if (updateErr) {
          console.error("DB 업데이트 오류:", updateErr);
          return res.status(500).json({
            success: false,
            error: "DB 업데이트 중 오류가 발생했습니다.",
          });
        }

        console.log("DB 업데이트 성공:", updateResults);
        res.json({ success: true });
      });
    } else {
      const insertSql =
        "INSERT INTO products (name, price, imageUrl, convini, tags) VALUES (?, ?, ?, ?, ?)";
      const insertValues = [
        product.name,
        product.price,
        product.imageUrl,
        product.convini,
        JSON.stringify(product.tags),
      ];

      connection.query(insertSql, insertValues, (insertErr, insertResults) => {
        if (insertErr) {
          console.error("DB 삽입 오류:", insertErr);
          return res.status(500).json({
            success: false,
            error: "DB 전송 중 오류가 발생했습니다.",
          });
        }

        console.log("DB 삽입 성공:", insertResults);

        const insertedId = insertResults.insertId;
        sentProductIds.push(insertedId);

        const updatedProductIndex = productsData.findIndex(
          (p) => p.id === productId
        );
        if (updatedProductIndex !== -1) {
          productsData[updatedProductIndex].id = insertedId;
          productsData[updatedProductIndex].sent = true;
          productsData[updatedProductIndex].isDuplicate = true;
        }

        res.json({ success: true });
      });
    }
  });
});

// DB 삭제 API
router.delete("/products/:productId", (req, res) => {
  const productId = parseInt(req.params.productId);

  const productIndex = productsData.findIndex((p) => p.id === productId);
  if (productIndex !== -1) {
    productsData.splice(productIndex, 1);
  }

  const sql = "DELETE FROM products WHERE id = ?";
  connection.query(sql, [productId], (err, results) => {
    if (err) {
      console.error("DB 삭제 오류:", err);
      return res
        .status(500)
        .json({ success: false, error: "DB 삭제 중 오류가 발생했습니다." });
    }

    if (results.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, error: "해당 ID의 제품을 찾을 수 없습니다." });
    }

    console.log("DB 삭제 성공:", results);

    const sentIdIndex = sentProductIds.indexOf(productId);
    if (sentIdIndex !== -1) {
      sentProductIds.splice(sentIdIndex, 1);
    }

    res.json({ success: true });
  });
});
// 모든 제품 조회 API
router.get("/products", (req, res) => {
  const sql = "SELECT * FROM products";
  connection.query(sql, (err, results) => {
    if (err) {
      console.error("DB 전체 제품 조회 오류:", err);
      return res
        .status(500)
        .json({ success: false, error: "DB 조회 중 오류가 발생했습니다." });
    }

    // tags 컬럼은 JSON.parse를 통해 파싱 후 응답
    const products = results.map((row) => ({
      ...row,
      tags: JSON.parse(row.tags),
    }));

    res.json({ success: true, products });
  });
});

module.exports = router;
